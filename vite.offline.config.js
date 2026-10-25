import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// A separate classic file:// build. Public images are copied by package_offline.py;
// JavaScript, CSS and font assets are inlined into index.html.
export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-offline',
    emptyOutDir: true,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 6500,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
