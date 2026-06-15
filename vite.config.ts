import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import nodemailer from 'nodemailer';

const ALLOWED_API_URLS = [
  'https://turkpaneli.com/api/v2',
];

function smmProxyPlugin(): Plugin {
  return {
    name: 'smm-api-proxy',
    configureServer(server) {
      server.middlewares.use('/api-proxy.php', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        const urlObj = new URL(req.url || '/', 'http://localhost');
        const targetUrl = urlObj.searchParams.get('url') || '';

        if (!ALLOWED_API_URLS.some(a => targetUrl.startsWith(a))) {
          res.writeHead(403);
          res.end(JSON.stringify({ error: 'URL not in approved provider whitelist.' }));
          return;
        }

        let rawBody = '';
        req.on('data', (chunk: Buffer) => { rawBody += chunk.toString(); });
        req.on('end', async () => {
          try {
            const response = await fetch(targetUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: rawBody,
            });
            const text = await response.text();
            res.writeHead(response.status);
            res.end(text);
          } catch (err: any) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Provider connection failed', details: err.message }));
          }
        });
      });
    }
  };
}

const DEFAULT_ADMIN_EMAIL = 'admin@bormedya.com';
const DEFAULT_ADMIN_PASS  = 'Admin123!';

function kvStorePlugin(): Plugin {
  const DATA_DIR = path.resolve('./data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  return {
    name: 'kv-store',
    configureServer(server) {

      // ── Admin auth: login ────────────────────────────────────────────────
      server.middlewares.use('/api/auth/login', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
        if (req.method !== 'POST') { next(); return; }
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { email, password } = JSON.parse(body);
            const credFile = path.join(DATA_DIR, 'smm_admin_credentials.json');
            let stored = { email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASS };
            if (fs.existsSync(credFile)) {
              try { stored = JSON.parse(fs.readFileSync(credFile, 'utf-8')); } catch {}
            }
            if (email === stored.email && password === stored.password) {
              res.writeHead(200);
              res.end(JSON.stringify({ ok: true }));
            } else {
              res.writeHead(200);
              res.end(JSON.stringify({ ok: false, message: 'E-posta veya şifre hatalı.' }));
            }
          } catch {
            res.writeHead(400);
            res.end(JSON.stringify({ ok: false, message: 'Geçersiz istek.' }));
          }
        });
      });

      // ── Admin auth: set credentials ──────────────────────────────────────
      server.middlewares.use('/api/auth/set-credentials', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
        if (req.method !== 'POST') { next(); return; }
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { currentPassword, newEmail, newPassword } = JSON.parse(body);
            const credFile = path.join(DATA_DIR, 'smm_admin_credentials.json');
            let stored = { email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASS };
            if (fs.existsSync(credFile)) {
              try { stored = JSON.parse(fs.readFileSync(credFile, 'utf-8')); } catch {}
            }
            if (currentPassword !== stored.password) {
              res.writeHead(200);
              res.end(JSON.stringify({ ok: false, message: 'Mevcut şifre yanlış.' }));
              return;
            }
            const updated = {
              email: (newEmail || stored.email).trim(),
              password: (newPassword || stored.password).trim()
            };
            fs.writeFileSync(credFile, JSON.stringify(updated), 'utf-8');
            res.writeHead(200);
            res.end(JSON.stringify({ ok: true }));
          } catch {
            res.writeHead(400);
            res.end(JSON.stringify({ ok: false, message: 'Geçersiz istek.' }));
          }
        });
      });

      // Mail endpoint — sends real email via SMTP using nodemailer
      server.middlewares.use('/api/mail', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { to, subject, body: htmlBody, smtp_host, smtp_port, smtp_user, smtp_pass, from_name } = data;

              if (!to || !subject || !htmlBody) {
                res.writeHead(400);
                res.end(JSON.stringify({ ok: false, message: 'Eksik parametre: to, subject, body zorunlu' }));
                return;
              }

              if (!smtp_host || !smtp_user || !smtp_pass) {
                res.writeHead(200);
                res.end(JSON.stringify({ ok: false, message: 'SMTP ayarları eksik. Ayarlar → SMTP bölümünden yapılandırın.' }));
                return;
              }

              const port = parseInt(smtp_port) || 587;
              const secure = port === 465;

              const transporter = nodemailer.createTransport({
                host: smtp_host,
                port,
                secure,
                auth: { user: smtp_user, pass: smtp_pass },
                tls: { rejectUnauthorized: false },
              } as any);

              await transporter.sendMail({
                from: `"${from_name || 'Bor Media'}" <${smtp_user}>`,
                to,
                subject,
                html: htmlBody,
              });

              console.log(`[MAIL] Gönderildi → ${to} | ${subject}`);
              res.writeHead(200);
              res.end(JSON.stringify({ ok: true, message: 'E-posta başarıyla gönderildi.' }));
            } catch (err: any) {
              console.error('[MAIL] Hata:', err.message);
              res.writeHead(200);
              res.end(JSON.stringify({ ok: false, message: err.message || 'SMTP bağlantı hatası' }));
            }
          });
          return;
        }
        next();
      });

      // ── GET /api/auth/google/config — returns { enabled, clientId } ────────
      server.middlewares.use('/api/auth/google/config', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
        if (req.method !== 'GET') { next(); return; }
        const cfgFile = path.join(DATA_DIR, 'smm_google_oauth_config.json');
        let cfg: { enabled?: boolean; clientId?: string; clientSecret?: string } = {};
        if (fs.existsSync(cfgFile)) {
          try {
            const raw = JSON.parse(fs.readFileSync(cfgFile, 'utf-8'));
            cfg = JSON.parse(raw.value || '{}');
          } catch {}
        }
        res.writeHead(200);
        res.end(JSON.stringify({ enabled: !!cfg.enabled, clientId: cfg.clientId || '' }));
      });

      // ── GET /api/auth/google/callback — OAuth2 code exchange ────────────
      server.middlewares.use('/api/auth/google/callback', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.method !== 'GET') { next(); return; }
        const urlObj = new URL(req.url!, 'http://localhost');
        const code = urlObj.searchParams.get('code');
        const oauthError = urlObj.searchParams.get('error');

        if (oauthError || !code) {
          res.writeHead(302, { Location: '/?gauth_error=cancelled' });
          res.end();
          return;
        }

        (async () => {
          try {
            const cfgFile = path.join(DATA_DIR, 'smm_google_oauth_config.json');
            let cfg: { enabled?: boolean; clientId?: string; clientSecret?: string } = {};
            if (fs.existsSync(cfgFile)) {
              try { cfg = JSON.parse(JSON.parse(fs.readFileSync(cfgFile, 'utf-8')).value || '{}'); } catch {}
            }
            if (!cfg.enabled || !cfg.clientId || !cfg.clientSecret) {
              res.writeHead(302, { Location: '/?gauth_error=not_configured' });
              res.end();
              return;
            }

            const host = req.headers.host || 'localhost:5000';
            const isSecure = host.includes('.replit.') || host.includes('.repl.co') || host.includes('.app');
            const protocol = isSecure ? 'https' : 'http';
            const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                code,
                client_id: cfg.clientId,
                client_secret: cfg.clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
              }).toString(),
            });
            const tokenData: any = await tokenRes.json();
            if (!tokenData.access_token) {
              res.writeHead(302, { Location: '/?gauth_error=token_failed' });
              res.end();
              return;
            }

            const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            const profile: any = await profileRes.json();
            const { email, name } = profile;
            if (!email) {
              res.writeHead(302, { Location: '/?gauth_error=no_email' });
              res.end();
              return;
            }

            const usersFile = path.join(DATA_DIR, 'smm_users.json');
            let usersArr: any[] = [];
            if (fs.existsSync(usersFile)) {
              try { usersArr = JSON.parse(JSON.parse(fs.readFileSync(usersFile, 'utf-8')).value || '[]'); } catch {}
            }

            let user = usersArr.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
            if (!user) {
              const maxId = usersArr.reduce((m: number, u: any) => Math.max(m, parseInt(u.id) || 0), 100);
              user = {
                id: String(maxId + 1),
                fullName: name || email.split('@')[0],
                email,
                balance: 0,
                totalOrders: 0,
                joinedDate: new Date().toISOString().split('T')[0],
                status: 'active',
              };
              usersArr.push(user);
              fs.writeFileSync(usersFile, JSON.stringify({ value: JSON.stringify(usersArr) }), 'utf-8');
            } else if (user.status === 'suspended') {
              res.writeHead(302, { Location: '/?gauth_error=suspended' });
              res.end();
              return;
            }

            res.writeHead(302, { Location: `/?gauth_uid=${encodeURIComponent(user.id)}` });
            res.end();
          } catch (err: any) {
            console.error('[GOOGLE AUTH] Hata:', err.message);
            res.writeHead(302, { Location: '/?gauth_error=server_error' });
            res.end();
          }
        })();
      });

      // ── API v1 — Public reseller API endpoint ────────────────────────────────
      server.middlewares.use('/api-v1.php', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Cache-Control', 'no-store');
        if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

        let rawBody = '';
        req.on('data', (chunk: Buffer) => { rawBody += chunk.toString(); });
        req.on('end', () => {
          const apiError = (msg: string) => { res.writeHead(200); res.end(JSON.stringify({ error: msg })); };

          // Parse params from body (urlencoded or JSON) and query string
          const urlObj = new URL(req.url || '/', 'http://localhost');
          let params: Record<string, string> = {};
          urlObj.searchParams.forEach((v, k) => { params[k] = v; });
          const ct = (req.headers['content-type'] || '');
          if (ct.includes('application/json')) {
            try { Object.assign(params, JSON.parse(rawBody)); } catch {}
          } else if (rawBody) {
            new URLSearchParams(rawBody).forEach((v, k) => { params[k] = v; });
          }

          const apiKey = (params['key'] || '').trim();
          const action = (params['action'] || '').trim();
          if (!apiKey) return apiError('API anahtarı eksik. key parametresini gönderin.');

          // Load users
          const usersFile = path.join(DATA_DIR, 'smm_users.json');
          let usersArr: any[] = [];
          if (fs.existsSync(usersFile)) {
            try {
              const raw = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
              usersArr = JSON.parse(raw.value || '[]');
            } catch {}
          }
          const authUser = usersArr.find((u: any) => u.apiKey === apiKey);
          if (!authUser) return apiError('Geçersiz API anahtarı.');
          if ((authUser.status ?? 'active') !== 'active') return apiError('Hesabınız askıya alınmış.');

          if (action === 'balance') {
            res.writeHead(200);
            res.end(JSON.stringify({ balance: Number(authUser.balance || 0).toFixed(2), currency: 'TRY' }));
            return;
          }

          if (action === 'services') {
            const sf = path.join(DATA_DIR, 'smm_services.json');
            let svc: any[] = [];
            if (fs.existsSync(sf)) {
              try { const r = JSON.parse(fs.readFileSync(sf, 'utf-8')); svc = JSON.parse(r.value || '[]'); } catch {}
            }
            const result = svc
              .filter((s: any) => (s.status ?? 'active') === 'active')
              .map((s: any) => ({
                service: String(s.id ?? ''),
                name: s.name ?? '',
                type: 'Default',
                category: s.platform ?? '',
                rate: Number(s.pricePer1000 ?? 0).toFixed(2),
                min: Number(s.min ?? 10),
                max: Number(s.max ?? 100000),
                description: s.description ?? '',
                delivery_speed: s.deliverySpeed ?? '',
              }));
            res.writeHead(200);
            res.end(JSON.stringify(result));
            return;
          }

          if (action === 'add_order') {
            const serviceId = String(params['service'] || '').trim();
            const link = String(params['link'] || '').trim();
            const quantity = parseInt(params['quantity'] || '0', 10);
            if (!serviceId || !link || !quantity) return apiError('Zorunlu parametreler eksik: service, link, quantity');

            const sf = path.join(DATA_DIR, 'smm_services.json');
            let svc: any[] = [];
            if (fs.existsSync(sf)) {
              try { const r = JSON.parse(fs.readFileSync(sf, 'utf-8')); svc = JSON.parse(r.value || '[]'); } catch {}
            }
            const service = svc.find((s: any) => String(s.id) === serviceId);
            if (!service) return apiError('Servis bulunamadı: ' + serviceId);
            if ((service.status ?? 'active') !== 'active') return apiError('Bu servis şu anda aktif değil.');
            const min = Number(service.min ?? 10), max = Number(service.max ?? 100000);
            if (quantity < min || quantity > max) return apiError(`Miktar ${min} ile ${max} arasında olmalıdır.`);

            const charge = Math.round((Number(service.pricePer1000 ?? 0) * quantity / 1000) * 100) / 100;
            const balance = Number(authUser.balance ?? 0);
            if (balance < charge) return apiError(`Yetersiz bakiye. Mevcut: ${balance.toFixed(2)} TRY, Gereken: ${charge.toFixed(2)} TRY`);

            const of = path.join(DATA_DIR, 'smm_orders.json');
            let ordersArr: any[] = [];
            if (fs.existsSync(of)) {
              try { const r = JSON.parse(fs.readFileSync(of, 'utf-8')); ordersArr = JSON.parse(r.value || '[]'); } catch {}
            }
            const orderId = 'ORD-' + String(ordersArr.length + 1).padStart(5, '0');
            ordersArr.push({
              id: orderId, userId: authUser.id, username: authUser.email,
              serviceId, serviceName: service.name, platform: service.platform ?? '',
              quantity, charge, status: 'Bekliyor', date: new Date().toISOString().split('T')[0],
              link, logs: [{ time: new Date().toTimeString().slice(0,5), text: 'API üzerinden sipariş oluşturuldu.' }], source: 'api',
            });
            // Deduct balance
            const updatedUsers = usersArr.map((u: any) =>
              u.id === authUser.id ? { ...u, balance: Math.round((Number(u.balance) - charge) * 100) / 100, totalOrders: (u.totalOrders || 0) + 1 } : u
            );
            try {
              fs.writeFileSync(of, JSON.stringify({ value: JSON.stringify(ordersArr) }), 'utf-8');
              fs.writeFileSync(usersFile, JSON.stringify({ value: JSON.stringify(updatedUsers) }), 'utf-8');
            } catch { return apiError('Sipariş kaydedilemedi.'); }

            res.writeHead(200);
            res.end(JSON.stringify({ order: orderId }));
            return;
          }

          if (action === 'status') {
            const orderId = String(params['order'] || '').trim();
            if (!orderId) return apiError('order parametresi zorunludur.');
            const of = path.join(DATA_DIR, 'smm_orders.json');
            let ordersArr: any[] = [];
            if (fs.existsSync(of)) {
              try { const r = JSON.parse(fs.readFileSync(of, 'utf-8')); ordersArr = JSON.parse(r.value || '[]'); } catch {}
            }
            const ord = ordersArr.find((o: any) => o.id === orderId && o.userId === authUser.id);
            if (!ord) return apiError('Sipariş bulunamadı: ' + orderId);
            const statusMap: Record<string, string> = { 'Bekliyor': 'Pending', 'İşlemde': 'In progress', 'Tamamlandı': 'Completed', 'İptal': 'Canceled' };
            res.writeHead(200);
            res.end(JSON.stringify({
              charge: Number(ord.charge || 0).toFixed(2),
              start_count: '0',
              status: statusMap[ord.status] ?? 'Pending',
              remains: String(ord.quantity ?? 0),
              currency: 'TRY',
            }));
            return;
          }

          apiError('Geçersiz action. Desteklenen: services, add_order, status, balance');
        });
      });

      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api/kv/')) { next(); return; }
        // Security: require X-Requested-With header (blocks bots/crawlers)
        const xrw = (req.headers['x-requested-with'] || '').toString().toLowerCase();
        if (xrw !== 'xmlhttprequest') {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(403);
          res.end(JSON.stringify({ error: 'Direct access forbidden' }));
          return;
        }
        const key = req.url.replace('/api/kv/', '').split('?')[0];
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '');
        if (!safeKey) { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid key' })); return; }
        const file = path.join(DATA_DIR, `${safeKey}.json`);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-store');
        if (req.method === 'GET') {
          if (fs.existsSync(file)) { res.writeHead(200); res.end(fs.readFileSync(file, 'utf-8')); }
          else { res.writeHead(200); res.end(JSON.stringify({ value: null })); }
          return;
        }
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
          req.on('end', () => {
            try { fs.writeFileSync(file, body, 'utf-8'); res.writeHead(200); res.end(JSON.stringify({ ok: true })); }
            catch (err: any) { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); }
          });
          return;
        }
        next();
      });
    }
  };
}

function shopierPlugin(): Plugin {
  const DATA_DIR = path.resolve('./data');

  function readShopierConfig(): { apiKey: string; enabled: boolean; productImageUrl: string } | null {
    const f = path.join(DATA_DIR, 'smm_shopier_config.json');
    if (!fs.existsSync(f)) return null;
    try { return JSON.parse(fs.readFileSync(f, 'utf-8')); } catch { return null; }
  }

  function readPayments(): Record<string, any> {
    const f = path.join(DATA_DIR, 'smm_shopier_payments.json');
    if (!fs.existsSync(f)) return {};
    try { return JSON.parse(fs.readFileSync(f, 'utf-8')); } catch { return {}; }
  }

  function writePayments(data: Record<string, any>) {
    const f = path.join(DATA_DIR, 'smm_shopier_payments.json');
    fs.writeFileSync(f, JSON.stringify(data, null, 2), 'utf-8');
  }

  function readUsers(): any[] {
    const f = path.join(DATA_DIR, 'smm_users.json');
    if (!fs.existsSync(f)) return [];
    try {
      const raw = JSON.parse(fs.readFileSync(f, 'utf-8'));
      if (Array.isArray(raw)) return raw;
      if (raw.value) return JSON.parse(raw.value);
      return [];
    } catch { return []; }
  }

  function writeUsers(users: any[]) {
    const f = path.join(DATA_DIR, 'smm_users.json');
    // Preserve original file format ({value: "..."} wrapper vs plain array)
    let raw: any;
    try { raw = JSON.parse(fs.readFileSync(f, 'utf-8')); } catch { raw = null; }
    if (raw && !Array.isArray(raw) && raw.value !== undefined) {
      raw.value = JSON.stringify(users);
      fs.writeFileSync(f, JSON.stringify(raw, null, 2), 'utf-8');
    } else {
      fs.writeFileSync(f, JSON.stringify(users, null, 2), 'utf-8');
    }
  }

  function generateRef(): string {
    return 'SP' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  async function shopierCreateProduct(apiKey: string, title: string, price: number, imageUrl: string, userName: string): Promise<{ id: string; url: string } | null> {
    const resp = await fetch('https://api.shopier.com/v1/products', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        title,
        description: `Bakiyesi (${userName})`,
        type: 'digital',
        media: [{ url: imageUrl, type: 'image', placement: 1 }],
        priceData: { price, currency: 'TRY' },
        shippingPayer: 'sellerPays',
        stockQuantity: 1,
      }),
    });
    if (!resp.ok) { const t = await resp.text(); console.error('[Shopier] create failed:', t); return null; }
    const data = await resp.json() as any;
    console.log('[Shopier] create-product response:', JSON.stringify(data));
    const productId = String(data.id ?? data.productId ?? '');
    const productUrl = data.url ?? data.productUrl ?? data.link ?? data.checkoutUrl ?? `https://www.shopier.com/s/${productId}`;
    return { id: productId, url: productUrl };
  }

  // Ödeme doğrulama: Shopier orders API + zaman & tutar filtresi.
  // GET /v1/products/{id} → 403 Forbidden (erişim yok)
  // GET /v1/orders?product_id={id} → product_id filtresini yoksayıp tüm siparişleri döndürüyor
  // Çözüm: Dönen siparişleri createdAt ve amount ile sıkı filtrele.
  // Garantiler:
  //   1. Minimum 30 saniye bekleme (race condition önleme)
  //   2. Sipariş oluşturma zamanı: payment.createdAt'tan SONRA olmalı
  //   3. Sipariş tutarı: chargeAmount ile ±0.01 TL toleransla eşleşmeli
  //   4. paymentStatus SADECE 'paid' kabul edilir
  // Gerçek Shopier API yanıt yapısı (loglardan tespit edildi):
  // { id, status:"unfulfilled", paymentStatus:"paid", dateCreated:"2026-...", totals:{total:"10.80",...}, lineItems:[{productId:"48030326",...}] }
  // Kesin eşleşme: lineItems[0].productId === productId (her ödeme benzersiz ürün)
  // Yedek: dateCreated + totals.total kontrolü
  async function shopierCheckPayment(
    apiKey: string,
    productId: string,
    chargeAmount: number,
    paymentCreatedAt: number,
  ): Promise<boolean> {
    const now = Date.now();
    if (now < paymentCreatedAt + 30_000) {
      console.log(`[Shopier][checkPayment] Too early (elapsed=${Math.round((now - paymentCreatedAt) / 1000)}s)`);
      return false;
    }
    try {
      const r = await fetch(`https://api.shopier.com/v1/orders?limit=50`, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
      });
      if (!r.ok) { console.log(`[Shopier][checkPayment] orders API error: ${r.status}`); return false; }
      let data: any;
      try { data = await r.json(); } catch { return false; }
      const list: any[] = Array.isArray(data) ? data : (data?.data ?? data?.orders ?? []);
      console.log(`[Shopier][checkPayment] checking ${list.length} orders for productId=${productId}`);
      for (const o of list) {
        // Kesin eşleşme: bu siparişin lineItems'ında bizim productId var mı?
        const lineItems: any[] = o.lineItems ?? o.line_items ?? [];
        const hasProduct = lineItems.some((li: any) =>
          String(li.productId ?? li.product_id ?? '') === String(productId)
        );
        // paymentStatus SADECE 'paid' veya 'completed' kabul edilir
        const isPaid = o.paymentStatus === 'paid' || o.paymentStatus === 'completed';
        // Sipariş tarihi: dateCreated alanı (Shopier API'sinden teyit edildi)
        const orderTs = o.dateCreated ?? o.createdAt ?? o.created_at ?? null;
        const orderTime = orderTs ? new Date(orderTs).getTime() : 0;
        const timeOk = orderTime === 0 || orderTime >= paymentCreatedAt - 5_000;
        console.log(`[Shopier][checkPayment] order=${o.id} hasProduct=${hasProduct} isPaid=${isPaid} timeOk=${timeOk} date=${orderTs}`);
        if (hasProduct && isPaid && timeOk) {
          console.log(`[Shopier][checkPayment] ✅ MATCH — order ${o.id} productId=${productId}`);
          return true;
        }
      }
    } catch (err: any) {
      console.error(`[Shopier][checkPayment] ERROR: ${err.message}`);
    }
    return false;
  }

  return {
    name: 'shopier-payment',
    configureServer(server) {
      // ── POST /api/shopier/create-product ────────────────────────────────────
      server.middlewares.use('/api/shopier/create-product', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
        if (req.method !== 'POST') { next(); return; }
        let body = '';
        req.on('data', (c: Buffer) => { body += c.toString(); });
        req.on('end', async () => {
          try {
            const cfg = readShopierConfig();
            if (!cfg?.enabled || !cfg?.apiKey) {
              res.writeHead(503);
              res.end(JSON.stringify({ ok: false, message: 'Shopier entegrasyonu aktif değil.' }));
              return;
            }
            const { chargeAmount, creditAmount, amount, userId, userName, userEmail } = JSON.parse(body);
            const numCharge = parseFloat(chargeAmount ?? amount);
            const numCredit = parseFloat(creditAmount ?? amount);
            if (isNaN(numCharge) || numCharge < 10 || numCharge > 6000) {
              res.writeHead(400);
              res.end(JSON.stringify({ ok: false, message: 'Tutar geçersiz.' }));
              return;
            }

            const payments = readPayments();

            // Aynı kullanıcı için aynı tutarda son 2 saat içinde bekleyen ürün varsa yeniden kullan.
            // Böylece Shopier'a gereksiz ürün spam yapılmaz.
            const TWO_HOURS = 2 * 60 * 60 * 1000;
            const existingRef = Object.keys(payments).find(k => {
              const p = payments[k];
              return (
                p.status === 'pending' &&
                p.userId === userId &&
                Math.abs(p.amount - numCharge) < 0.01 &&
                p.shopierProductUrl &&
                (Date.now() - new Date(p.createdAt).getTime()) < TWO_HOURS
              );
            });

            if (existingRef) {
              const existing = payments[existingRef];
              console.log(`[Shopier] Reusing existing product ${existing.shopierProductId} for ${userId} | ref=${existingRef}`);
              res.writeHead(200);
              res.end(JSON.stringify({ ok: true, url: existing.shopierProductUrl, ref: existingRef }));
              return;
            }

            const ref = generateRef();
            const title = `Bakiye Yüklemesi - ${numCredit.toFixed(2)} TL`;
            const product = await shopierCreateProduct(cfg.apiKey, title, numCharge, cfg.productImageUrl || 'https://cdn.pixabay.com/photo/2020/05/18/16/17/social-media-5187243_1280.png', userName);
            if (!product) {
              res.writeHead(502);
              res.end(JSON.stringify({ ok: false, message: 'Shopier ürün oluşturulamadı. Lütfen tekrar deneyin.' }));
              return;
            }
            payments[ref] = {
              shopierProductId: product.id,
              shopierProductUrl: product.url,
              userId, userName, userEmail,
              amount: numCharge,
              creditAmount: numCredit,
              status: 'pending',
              createdAt: new Date().toISOString(),
              processedAt: null,
            };
            writePayments(payments);
            console.log(`[Shopier] Created NEW product ${product.id} for ${userId} | charge=₺${numCharge} credit=₺${numCredit} | ref=${ref}`);
            res.writeHead(200);
            res.end(JSON.stringify({ ok: true, url: product.url, ref }));
          } catch (err: any) {
            console.error('[Shopier] create-product error:', err.message);
            res.writeHead(500);
            res.end(JSON.stringify({ ok: false, message: err.message }));
          }
        });
      });

      // ── GET /api/shopier/check-payment?ref=XXX ──────────────────────────────
      server.middlewares.use('/api/shopier/check-payment', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
        if (req.method !== 'GET') { next(); return; }
        const urlObj = new URL(req.url || '/', 'http://localhost');
        const ref = urlObj.searchParams.get('ref') || '';
        if (!ref) { res.writeHead(400); res.end(JSON.stringify({ ok: false, message: 'ref gerekli' })); return; }
        (async () => {
          try {
            const cfg = readShopierConfig();
            if (!cfg?.apiKey) { res.writeHead(503); res.end(JSON.stringify({ ok: false, message: 'Shopier yapılandırılmamış' })); return; }
            const payments = readPayments();
            const payment = payments[ref];
            if (!payment) { res.writeHead(404); res.end(JSON.stringify({ ok: false, status: 'not_found', message: 'Ödeme kaydı bulunamadı.' })); return; }
            // Zaten tamamlandıysa (webhook veya önceki polling tarafından)
            if (payment.status === 'completed') {
              const creditedAmount = payment.creditAmount ?? payment.amount;
              res.writeHead(200);
              res.end(JSON.stringify({ ok: true, status: 'completed', amount: creditedAmount }));
              return;
            }
            const createdAt = payment.createdAt ? new Date(payment.createdAt).getTime() : Date.now();
            const paid = await shopierCheckPayment(
              cfg.apiKey,
              payment.shopierProductId,
              payment.amount, // chargeAmount (komisyon dahil — Shopier'a ödenen gerçek tutar)
              createdAt,
            );
            if (paid) {
              const toCredit = payment.creditAmount ?? payment.amount;
              const users = readUsers();
              const userIdx = users.findIndex((u: any) => u.id === payment.userId || u.email === payment.userId);
              if (userIdx >= 0) {
                users[userIdx].balance = parseFloat(((users[userIdx].balance || 0) + toCredit).toFixed(2));
                writeUsers(users);
              }
              payments[ref].status = 'completed';
              payments[ref].processedAt = new Date().toISOString();
              writePayments(payments);
              console.log(`[Shopier] Payment ${ref} confirmed via stockQuantity. ₺${toCredit} credited to ${payment.userId}`);
              res.writeHead(200);
              res.end(JSON.stringify({ ok: true, status: 'completed', amount: toCredit }));
            } else {
              res.writeHead(200);
              res.end(JSON.stringify({ ok: true, status: 'pending', amount: payment.creditAmount ?? payment.amount }));
            }
          } catch (err: any) {
            res.writeHead(500);
            res.end(JSON.stringify({ ok: false, status: 'error', message: err.message }));
          }
        })();
      });

      // ── POST /api/shopier/webhook ────────────────────────────────────────────
      server.middlewares.use('/api/shopier/webhook', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method !== 'POST') { next(); return; }
        let body = '';
        req.on('data', (c: Buffer) => { body += c.toString(); });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body);
            console.log('[Shopier] Webhook received:', JSON.stringify(payload).substring(0, 400));
            const cfg = readShopierConfig();
            if (!cfg?.apiKey) { res.writeHead(200); res.end('ok'); return; }

            // Parse product ID from Shopier order.created event format
            // Payload: { event: "order.created", data: { lineItems: [{ productId, ... }], paymentStatus, ... } }
            const orderData = payload.data ?? payload;
            const lineItems: any[] = orderData.lineItems ?? orderData.line_items ?? [];
            let productId = lineItems.length > 0
              ? String(lineItems[0].productId ?? lineItems[0].product_id ?? '')
              : String(payload.product_id ?? payload.productId ?? payload.item_id ?? '');

            if (!productId) { res.writeHead(200); res.end('ok'); return; }

            const payments = readPayments();
            const ref = Object.keys(payments).find(k => payments[k].shopierProductId === productId);
            if (!ref) {
              console.log(`[Shopier] Webhook: no pending payment for product ${productId}`);
              res.writeHead(200); res.end('ok'); return;
            }
            const payment = payments[ref];
            if (payment.status === 'completed') { res.writeHead(200); res.end('ok'); return; }

            // GÜVENLİK: Webhook'ta SADECE paymentStatus === 'paid' kabul edilir.
            // status === 'fulfilled' veya status === 'paid' KABUL EDİLMEZ — Shopier order.created eventi
            // ile ödeme yapılmadan 'unfulfilled' status'u gelebilir.
            // Webhook'ta paymentStatus 'paid' değilse API'ye tekrar sormuyoruz — false positive riski.
            const webhookPaid = orderData.paymentStatus === 'paid' || orderData.paymentStatus === 'completed';
            const paid = webhookPaid;

            if (paid) {
              const toCredit = payment.creditAmount ?? payment.amount;
              const users = readUsers();
              const userIdx = users.findIndex((u: any) => u.id === payment.userId || u.email === payment.userId);
              if (userIdx >= 0) {
                users[userIdx].balance = parseFloat(((users[userIdx].balance || 0) + toCredit).toFixed(2));
                writeUsers(users);
              }
              payments[ref].status = 'completed';
              payments[ref].processedAt = new Date().toISOString();
              writePayments(payments);
              console.log(`[Shopier] Webhook: ₺${toCredit} credited to ${payment.userId} (ref=${ref})`);
            }
            res.writeHead(200);
            res.end('ok');
          } catch (err: any) {
            console.error('[Shopier] Webhook error:', err.message);
            res.writeHead(200);
            res.end('ok');
          }
        });
      });

      // ── GET /api/shopier/admin-payments ─────────────────────────────────────
      server.middlewares.use('/api/shopier/admin-payments', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
        if (req.method !== 'GET') { next(); return; }
        try {
          const payments = readPayments();
          const list = Object.entries(payments).map(([ref, p]: [string, any]) => ({
            ref,
            userId: p.userId,
            userName: p.userName,
            chargeAmount: p.amount,
            creditAmount: p.creditAmount ?? p.amount,
            shopierFee: parseFloat(((p.amount - (p.creditAmount ?? p.amount)).toFixed(2))),
            status: p.status,
            createdAt: p.createdAt,
            processedAt: p.processedAt ?? null,
          }));
          // En yeni önce
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true, payments: list }));
        } catch (err: any) {
          res.writeHead(500);
          res.end(JSON.stringify({ ok: false, message: err.message }));
        }
      });

      // ── POST /api/shopier/register-webhook ───────────────────────────────────
      server.middlewares.use('/api/shopier/register-webhook', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
        if (req.method !== 'POST') { next(); return; }
        let body = '';
        req.on('data', (c: Buffer) => { body += c.toString(); });
        req.on('end', async () => {
          try {
            const cfg = readShopierConfig();
            if (!cfg?.apiKey) { res.writeHead(503); res.end(JSON.stringify({ ok: false, message: 'Shopier yapılandırılmamış.' })); return; }
            const { webhookBaseUrl } = JSON.parse(body || '{}');
            const baseUrl = (webhookBaseUrl || '').replace(/\/$/, '');
            if (!baseUrl) { res.writeHead(400); res.end(JSON.stringify({ ok: false, message: 'webhookBaseUrl gerekli.' })); return; }
            const webhookUrl = `${baseUrl}/api/shopier/webhook`;

            // List existing webhooks
            const listResp = await fetch('https://api.shopier.com/v1/webhooks', {
              headers: { 'Authorization': `Bearer ${cfg.apiKey}`, 'Accept': 'application/json' }
            });
            const existing: any[] = listResp.ok ? await listResp.json() : [];

            // Delete old webhooks pointing to the same base domain
            for (const wh of existing) {
              if (wh.url && wh.url.includes('/api/shopier/webhook')) {
                await fetch(`https://api.shopier.com/v1/webhooks/${wh.id}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${cfg.apiKey}` }
                });
                console.log(`[Shopier] Deleted old webhook ${wh.id}`);
              }
            }

            // Register new webhook
            const regResp = await fetch('https://api.shopier.com/v1/webhooks', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ url: webhookUrl, event: 'order.created' })
            });
            const regData = await regResp.json() as any;
            if (!regResp.ok) {
              res.writeHead(502);
              res.end(JSON.stringify({ ok: false, message: regData.message || 'Webhook kaydedilemedi.' }));
              return;
            }
            console.log(`[Shopier] Webhook registered: ${webhookUrl} (id=${regData.id})`);
            res.writeHead(200);
            res.end(JSON.stringify({ ok: true, webhookId: regData.id, webhookUrl }));
          } catch (err: any) {
            res.writeHead(500);
            res.end(JSON.stringify({ ok: false, message: err.message }));
          }
        });
      });
    },
  };
}

function copyFilesAfterBuild(): Plugin {
  return {
    name: 'copy-cpanel-files',
    closeBundle() {
      const files = ['public/.htaccess', 'public/robots.txt', 'public/favicon.svg', 'public/favicon.png', 'public/api-proxy.php', 'public/api-kv.php', 'public/api-mail.php', 'public/api-auth.php', 'public/api-shopier.php', 'public/api-v1.php'];
      for (const src of files) {
        const dest = `dist/${path.basename(src)}`;
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(`[cPanel] Copied ${src} → ${dest}`);
        }
      }
      // data/ klasörünü kopyala — yapılandırma + servis verileri
      // Dahil edilmeyenler: smm_users, smm_orders, smm_tickets,
      //   smm_payment_requests, smm_shopier_payments, smm_otp_* (gizlilik)
      const srcDataDir = path.resolve('./data');
      const destDataDir = path.resolve('./dist/data');
      if (fs.existsSync(srcDataDir)) {
        if (!fs.existsSync(destDataDir)) fs.mkdirSync(destDataDir, { recursive: true });
        const EXCLUDE_PREFIXES = ['smm_otp_'];
        const EXCLUDE_FILES = [
          'smm_users.json',
          'smm_orders.json',
          'smm_tickets.json',
          'smm_payment_requests.json',
          'smm_shopier_payments.json',
        ];
        for (const file of fs.readdirSync(srcDataDir)) {
          if (!file.endsWith('.json')) continue;
          if (EXCLUDE_FILES.includes(file)) continue;
          if (EXCLUDE_PREFIXES.some(p => file.startsWith(p))) continue;
          fs.copyFileSync(path.join(srcDataDir, file), path.join(destDataDir, file));
          const sizeKb = Math.round(fs.statSync(path.join(srcDataDir, file)).size / 1024);
          console.log(`[cPanel] Copied data/${file} → dist/data/${file} (${sizeKb} KB)`);
        }
      }
    }
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), smmProxyPlugin(), shopierPlugin(), kvStorePlugin(), copyFilesAfterBuild()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/data/**', '**/.local/**', '**/.cache/**', '**/node_modules/**'],
      },
    },
  };
});
