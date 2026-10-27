import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: '/' si le site est à la racine du domaine (ltfinance.org).
// Si vous le placez dans un sous-dossier, mettez par ex. base: '/site/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: { port: 5173 },
});
