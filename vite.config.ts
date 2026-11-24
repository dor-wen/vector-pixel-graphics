import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // './' erlaubt Deployment in einem Unterordner des Webservers
  base: './',
});
