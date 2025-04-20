
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
    // Development mode plugin for Lovable features
    mode === 'development' && (() => {
      if (process.env.NODE_ENV === 'production') return null;
      
      try {
        return {
          name: 'lovable-tagger-wrapper',
          async buildStart() {
            try {
              // Only import in development
              if (process.env.NODE_ENV !== 'production') {
                console.log('Ambiente de desenvolvimento, lovable-tagger será importado em runtime');
              }
            } catch (error: unknown) {
              const err = error as Error;
              console.warn('lovable-tagger não disponível:', err.message);
            }
          }
        };
      } catch (error: unknown) {
        const err = error as Error;
        console.warn('Erro ao configurar lovable-tagger:', err.message);
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
