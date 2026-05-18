import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Sitemap generation plugin — runs after every build
function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    closeBundle: {
      sequential: true,
      async handler() {
        const { generateSitemaps } = await import('./scripts/generate-sitemap');
        const outDir = path.resolve(__dirname, 'dist');
        console.log('\n🔧 Generating sitemaps...\n');
        generateSitemaps(outDir);
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    sitemapPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core — tiny, always cached
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // Framer Motion — large, rarely changes
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer';
          }
          // i18next — localisation
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'vendor-i18n';
          }
          // Radix UI primitives
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          // Supabase / tanstack
          if (id.includes('node_modules/@supabase') || id.includes('node_modules/@tanstack')) {
            return 'vendor-data';
          }
        },
      },
    },
  },
}));
