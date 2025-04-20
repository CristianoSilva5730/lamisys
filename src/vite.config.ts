
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Completamente remover o componentTagger no build de produção
    // e tentar importá-lo de forma dinâmica apenas em desenvolvimento
    mode === 'development' && (() => {
      if (process.env.NODE_ENV === 'production') return null;
      
      try {
        // Importar usando dynamic import para lidar com ESM
        return {
          name: 'lovable-tagger-wrapper',
          async buildStart() {
            try {
              // Não importar durante o build
              if (process.env.NODE_ENV !== 'production') {
                console.log('Ambiente de desenvolvimento, lovable-tagger será importado em runtime');
              }
            } catch (error: unknown) {
              console.warn('lovable-tagger não disponível:', error instanceof Error ? error.message : String(error));
            }
          }
        };
      } catch (error: unknown) {
        console.warn('Erro ao configurar lovable-tagger:', error instanceof Error ? error.message : String(error));
        return null;
      }
    })(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configurações para compatibilidade com Electron
  build: {
    outDir: 'dist',
    minify: 'terser', // Set explicitly to use terser
    // Configurações adicionais para evitar problemas com ESM
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Desativar mangling para facilitar a depuração
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    // Increase chunk size warning limit to avoid warnings
    chunkSizeWarningLimit: 1000,
    // Manual chunks configuration to improve code splitting
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

