import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import nodemailer from 'nodemailer';

const ALLOWED_API_URLS = [
  'https://turkpaneli.com/api/v2',
  'https://resellerprovider.com/api/v2',
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

const DEFAULT_ADMIN_EMAIL = 'admin@bormedia.com';
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

      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api/kv/')) { next(); return; }
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

function copyFilesAfterBuild(): Plugin {
  return {
    name: 'copy-cpanel-files',
    closeBundle() {
      const files = ['public/.htaccess', 'public/api-proxy.php', 'public/api-kv.php', 'public/api-mail.php', 'public/api-auth.php'];
      for (const src of files) {
        const dest = `dist/${path.basename(src)}`;
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log(`[cPanel] Copied ${src} → ${dest}`);
        }
      }
    }
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), smmProxyPlugin(), kvStorePlugin(), copyFilesAfterBuild()],
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
