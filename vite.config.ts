import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

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
    plugins: [react(), tailwindcss(), copyFilesAfterBuild()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
