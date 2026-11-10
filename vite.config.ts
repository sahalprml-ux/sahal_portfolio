import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` keeps asset paths relative, so the build works at a domain root
// or under a sub-path (e.g. GitHub Pages project sites) without changes.
export default defineConfig({
  base: './',
  plugins: [react()],
});
