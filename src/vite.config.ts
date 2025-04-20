
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
            } catch (error) {
              console.warn('lovable-tagger não disponível:', (error as Error).message);
            }
          }
        };
      } catch (error) {
        console.warn('Erro ao configurar lovable-tagger:', (error as Error).message);
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
    minify: 'esbuild', // Atualizando para usar esbuild em vez de terser
    // Configurações adicionais para evitar problemas com ESM
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Aumentar limite de aviso de tamanho de chunk para evitar avisos
    chunkSizeWarningLimit: 1000,
    // Configuração manual de chunks para melhorar a divisão de código
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
