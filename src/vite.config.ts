
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
            } catch (e: unknown) {
              console.warn('lovable-tagger não disponível:', e instanceof Error ? e.message : String(e));
            }
          }
        };
      } catch (e: unknown) {
        console.warn('Erro ao configurar lovable-tagger:', e instanceof Error ? e.message : String(e));
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
    minify: process.env.NODE_ENV === 'production',
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
  }
}));
