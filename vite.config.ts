import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Os quatro plugins de closeBundle escrevem no dist/, por isso levam
// `apply: 'build'`. Sem isso corriam também no dev server, que chama o
// closeBundle ao fechar e ao reiniciar, e reinicia sempre que muda um ficheiro
// que este config alcança pelos import() (os scripts/*.ts e os módulos de
// src/data e src/constants que eles leem; um `git rebase` basta). O prerender
// pegava então num dist/index.html já prerenderizado, não encontrava a
// `<div id="root"></div>` vazia e todas as páginas ficavam com o corpo da
// homepage (visto a 2026-09-30).

// Sitemap generation plugin — runs after every build
function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    apply: 'build',
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

// Em dev os sitemaps não existem (são artefactos de build), por isso os
// links "Abrir XML" do Sitemap Monitor davam 404 em localhost. Gera-os
// para uma pasta temporária à primeira visita e serve-os de lá, sem
// tocar em public/ nem mandar ninguém para produção.
function sitemapDevPlugin(): Plugin {
  return {
    name: 'serve-sitemap',
    apply: 'serve',
    configureServer(server) {
      let dir: string | null = null;
      server.middlewares.use(async (req, res, next) => {
        const name = req.url?.split('?')[0].slice(1) ?? '';
        if (!/^sitemap[\w-]*\.xml$/.test(name)) return next();
        const fs = await import('fs');
        const os = await import('os');
        if (!dir) {
          const { generateSitemaps } = await import('./scripts/generate-sitemap');
          dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kyro-sitemaps-'));
          generateSitemaps(dir);
        }
        const file = path.join(dir, name);
        if (!fs.existsSync(file)) return next();
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.end(fs.readFileSync(file));
      });
    },
  };
}

// llms.txt plugin — the plain-text site summary read by generative engines
function llmsTxtPlugin(): Plugin {
  return {
    name: 'generate-llms-txt',
    apply: 'build',
    closeBundle: {
      sequential: true,
      async handler() {
        const { generateLlmsTxt } = await import('./scripts/generate-llms-txt');
        const outDir = path.resolve(__dirname, 'dist');
        console.log('\n🔧 Generating llms.txt...\n');
        generateLlmsTxt(outDir);
      },
    },
  };
}

// Static prerender plugin — injects per-route meta tags for Google indexing
function prerenderPlugin(): Plugin {
  return {
    name: 'prerender-routes',
    apply: 'build',
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

// CSP hash plugin — swaps 'unsafe-inline' in _headers for a hash of the
// actual inline script, once index.html and _headers are both in dist.
function cspHashPlugin(): Plugin {
  return {
    name: 'inject-csp-script-hash',
    apply: 'build',
    closeBundle: {
      sequential: true,
      async handler() {
        const { injectCspScriptHash } = await import('./scripts/generate-csp-hash');
        const outDir = path.resolve(__dirname, 'dist');
        const cspHash = injectCspScriptHash(outDir);
        console.log(`\n🔒 CSP script-src hash: ${cspHash}\n`);
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
    sitemapDevPlugin(),
    llmsTxtPlugin(),
    prerenderPlugin(),
    cspHashPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0,
    manifest: true,
    rollupOptions: {
      output: {
        onlyExplicitManualChunks: true,
        manualChunks: (id) => {
          // One tree-shaken icon module instead of a request for each icon.
          if (id.includes('node_modules/lucide-react/')) return 'vendor-icons';
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
