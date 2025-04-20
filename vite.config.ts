
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only use componentTagger in development and only if it's available
    mode === 'development' && (() => {
      try {
        // Dynamic import to handle ESM modules
        return {
          name: 'lovable-tagger-wrapper',
          async configResolved() {
            if (process.env.NODE_ENV !== 'production') {
              console.log('Development environment, lovable-tagger will be imported at runtime');
            }
          }
        };
      } catch (error) {
        console.warn('Error configuring lovable-tagger:', (error as Error).message);
        return null;
      }
    })(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Build configuration for production
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    // Additional settings for ESM compatibility
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Manual chunk configuration for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-avatar'
          ],
          charts: ['recharts'],
          forms: ['react-hook-form', 'zod']
        }
      }
    }
  }
}));
