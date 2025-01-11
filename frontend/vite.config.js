import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permet l'accès depuis l'hôte
    watch: {
      usePolling: true, // Active le mode polling
    },
  },
});
