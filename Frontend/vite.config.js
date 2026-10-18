import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // En desarrollo, las peticiones a /api/... se reenvían al backend de
      // Express (ver /backend). Ajusta el target si cambias el puerto en
      // backend/.env.
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
