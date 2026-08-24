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

// Static prerender plugin — injects per-route meta tags for Google indexing
function prerenderPlugin(): Plugin {
  return {
    name: 'prerender-routes',
    closeBundle: {
      sequential: true,
      async handler() {
        const { prerenderRoutes } = await import('./scripts/prerender');
        const outDir = path.resolve(__dirname, 'dist');
        console.log('\n🔧 Prerendering routes...\n');
        const n = prerenderRoutes(outDir);
        console.log(`\n✅ Prerendered ${n} routes\n`);
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
    prerenderPlugin(),
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
          // Radix UI primitives
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-data';
          }
        },
      },
    },
  },
}));
