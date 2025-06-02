// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// REMOVE THIS LINE: import basicSsl from '@vitejs/plugin-basic-ssl'; // This plugin enables HTTPS

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // REMOVE THIS LINE: basicSsl() // Remove the plugin from here
  ],
  server: {
    host: true,
    // REMOVE THIS LINE: https: true // This disables HTTPS
  }
});