import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

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

function kvStorePlugin(): Plugin {
  const DATA_DIR = path.resolve('./data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  return {
    name: 'kv-store',
    configureServer(server) {
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
      const files = ['public/.htaccess', 'public/api-proxy.php'];
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
