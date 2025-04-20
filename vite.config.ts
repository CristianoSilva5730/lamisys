
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only use componentTagger in development if it's available
    // This conditional prevents build errors in production
    mode === 'development' && (() => {
      try {
        // Dynamically import only in dev mode
        const { componentTagger } = require('lovable-tagger');
        return componentTagger();
      } catch (e) {
        // Silently fail if the package is not available
        console.warn('lovable-tagger is not available, skipping...');
        return null;
      }
    })(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Fix Electron compatibility issues
  build: {
    outDir: 'dist',
    minify: process.env.NODE_ENV === 'production',
  }
}));
