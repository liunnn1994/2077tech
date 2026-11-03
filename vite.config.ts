import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default defineConfig({
  plugins: [svelte()],
  server: { watch: { ignored: ['**/.svelte-check/**'] } },
  build: { target: 'es2024', assetsInlineLimit: 0, sourcemap: true },
});
