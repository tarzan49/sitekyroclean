import { lazy, Suspense, useEffect } from "react";
import { trackSessionTime } from "@/lib/quizTracking";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieBanner from "@/components/CookieBanner";
import PageHead from "@/components/PageHead";
import TopProgressBar from "@/components/TopProgressBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileStickyBar from "@/components/MobileStickyBar";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { getAllLocationRoutes } from "@/data/locationSeoData";
import { getAllFreguesiaRoutes } from "@/data/freguesiaSeoData";
import { getAllMaterialRoutes, getAllMaterialCityRoutes } from "@/data/materialSeoData";
import { getAllPriceRoutes } from "@/data/priceSeoData";
import { getAllProblemCityRoutes } from "@/data/problemCitySeoData";
import { getAllKeywordVariantRoutes } from "@/data/keywordVariantData";
import { getAllPackComboRoutes } from "@/data/packComboData";
import { getAllMarcaSofaRoutes } from "@/data/marcaSofaData";

// Critical path - load immediately
import IndexV1 from "./pages/IndexV1";
const Index = lazy(() => import("./pages/Index"));

// Lazy load non-critical routes for better initial load
const NotFound = lazy(() => import("./pages/NotFound"));
const LimpezaSofas = lazy(() => import("./pages/LimpezaSofas"));
const Impermeabilizacao = lazy(() => import("./pages/Impermeabilizacao"));
const LimpezaTapetes = lazy(() => import("./pages/LimpezaTapetes"));
const LimpezaColchoes = lazy(() => import("./pages/LimpezaColchoes"));
const LimpezaCadeiras = lazy(() => import("./pages/LimpezaCadeiras"));
const LimpezaAlcatifas = lazy(() => import("./pages/LimpezaAlcatifas"));
const NossoProcesso = lazy(() => import("./pages/NossoProcesso"));
const Obrigado = lazy(() => import("./pages/Obrigado"));
const LocationServicePage = lazy(() => import("./pages/LocationServicePage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const ProblemCityPage = lazy(() => import("./pages/ProblemCityPage"));
const MaterialPage = lazy(() => import("./pages/MaterialPage"));
const PricePage = lazy(() => import("./pages/PricePage"));
const BeforeAfterPage = lazy(() => import("./pages/BeforeAfterPage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminDeslocacoes = lazy(() => import("./pages/AdminDeslocacoes"));
const AreasDeServico = lazy(() => import("./pages/AreasDeServico"));
const FreguesiaServicePage = lazy(() => import("./pages/FreguesiaServicePage"));
const SofaVariantPage = lazy(() => import("./pages/SofaVariantPage"));
const ReviewRequest = lazy(() => import("./pages/ReviewRequest"));
const FAQEstofos = lazy(() => import("./pages/FAQEstofos"));
const GlossarioEstofos = lazy(() => import("./pages/GlossarioEstofos"));
const PackComboPage = lazy(() => import("./pages/PackComboPage"));
const Packs = lazy(() => import("./pages/Packs"));
const PacksSitemap = lazy(() => import("./pages/PacksSitemap"));
const MarcaSofaPage = lazy(() => import("./pages/MarcaSofaPage"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const TermosCondicoes = lazy(() => import("./pages/TermosCondicoes"));
const PoliticaDevolucoes = lazy(() => import("./pages/PoliticaDevolucoes"));
const Testemunhos = lazy(() => import("./pages/Testemunhos"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Pre-generate all routes
const locationRoutes = getAllLocationRoutes();
const freguesiaRoutes = getAllFreguesiaRoutes();
const materialRoutes = getAllMaterialRoutes();
const materialCityRoutes = getAllMaterialCityRoutes();
const priceRoutes = getAllPriceRoutes();
const problemCityRoutes = getAllProblemCityRoutes();
const keywordVariantRoutes = getAllKeywordVariantRoutes();
const packComboRoutes = getAllPackComboRoutes();
const marcaSofaRoutes = getAllMarcaSofaRoutes();

// ── Page transition config ────────────────────────────────────────────────────
// Pure opacity only, NO y/transform.
// Reason: any CSS transform on a wrapper creates a new stacking context,
// which breaks position:fixed children (sticky CTAs, headers, progress bar).
// With opacity-only, stacking context only exists when opacity < 1, which is
// only during the brief exit (user already navigated away), not perceptible.
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

const pageTransition = {
  duration: 0.28,
  ease: 'easeInOut' as const,
};

// ── Inner router component, must be inside <BrowserRouter> to use useLocation
const AppRoutes = () => {
  const location = useLocation();
  useScrollReveal();

  return (
    <>
      {/* Gold progress bar, fires on every route change */}
      <TopProgressBar />

      <ScrollToTop />
      <PageHead />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          // transformTemplate removes framer-motion's default translateZ(0) GPU hint
          // which would otherwise create a stacking context and break position:fixed children
          transformTemplate={() => ''}
          style={{ width: '100%', minHeight: '100vh' }}
        >
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes location={location}>
                <Route path="/" element={<IndexV1 />} />
                <Route path="/mockup" element={<Index />} />
                <Route path="/limpeza-sofas" element={<LimpezaSofas />} />
                <Route path="/impermeabilizacao" element={<Impermeabilizacao />} />
                <Route path="/limpeza-tapetes" element={<LimpezaTapetes />} />
                <Route path="/limpeza-colchoes" element={<LimpezaColchoes />} />
                <Route path="/limpeza-cadeiras" element={<LimpezaCadeiras />} />
                <Route path="/limpeza-alcatifas" element={<LimpezaAlcatifas />} />
                <Route path="/nosso-processo" element={<NossoProcesso />} />
                <Route path="/obrigado" element={<Obrigado />} />
                <Route path="/packs" element={<Packs />} />
                <Route path="/guia-de-packs" element={<PacksSitemap />} />
                <Route path="/antes-depois-limpeza" element={<BeforeAfterPage />} />
                {/* Location × Service SEO pages */}
                {locationRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<LocationServicePage />} />
                ))}
                {/* Freguesia SEO pages */}
                {freguesiaRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<FreguesiaServicePage />} />
                ))}
                {/* Keyword variant pages: higienização/lavagem × all services × all locations */}
                {/* MUST be before problemCityRoutes, slugs like "higienizacao-colchao" and "lavagem-tapetes" */}
                {/* in problemSeoData generate identical paths that would shadow these routes otherwise */}
                {keywordVariantRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<SofaVariantPage />} />
                ))}
                {/* Problem SEO pages */}
                <Route path="/problemas/:slug" element={<ProblemPage />} />
                {/* Problem × City SEO pages */}
                {problemCityRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<ProblemCityPage />} />
                ))}
                {/* Material SEO pages */}
                {materialRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<MaterialPage />} />
                ))}
                {/* Material × City SEO pages */}
                {materialCityRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<MaterialPage />} />
                ))}
                {/* Price SEO pages */}
                {priceRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<PricePage />} />
                ))}
                {/* Pack/Combo pages: 4 packs × 5 cities = 20 pages */}
                {packComboRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<PackComboPage />} />
                ))}
                {/* Marca Sofá pages: 8 brands × 10 cities = 80 pages */}
                {marcaSofaRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<MarcaSofaPage />} />
                ))}
                {/* Resource pages */}
                {/* Blog */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/obrigado-pelo-servico" element={<ReviewRequest />} />
                <Route path="/perguntas-frequentes-limpeza-estofos" element={<FAQEstofos />} />
                <Route path="/glossario-limpeza-estofos" element={<GlossarioEstofos />} />
                {/* Legal */}
                <Route path="/testemunhos" element={<Testemunhos />} />
                <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
                <Route path="/termos-e-condicoes" element={<TermosCondicoes />} />
                <Route path="/politica-de-devolucoes" element={<PoliticaDevolucoes />} />
                {/* Admin, painel único */}
                <Route path="/admin/panel" element={<AdminPanel />} />
                <Route path="/admin/deslocacoes" element={<AdminDeslocacoes />} />
                <Route path="/areas-de-servico" element={<AreasDeServico />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

// ── Root app ──────────────────────────────────────────────────────────────────
const SessionTracker = () => {
  useEffect(() => {
    const start = Date.now();
    const send = () => trackSessionTime(Math.round((Date.now() - start) / 1000));
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") send(); });
    window.addEventListener("pagehide", send);
    return () => { send(); };
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionTracker />
        <AppRoutes />
        <WhatsAppButton />
        <MobileStickyBar />
        <CookieBanner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
