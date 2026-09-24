import { usePageTracking } from '@/hooks/use-page-tracking';
import { lazy, Suspense, useEffect } from "react";
import { trackSessionTime, isPublicTrackingPage } from "@/lib/quizTracking";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieBanner from "@/components/CookieBanner";
import PageHead from "@/components/PageHead";
import TopProgressBar from "@/components/TopProgressBar";
import MobileStickyBar from "@/components/MobileStickyBar";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const LocationPreview = import.meta.env.DEV ? lazy(() => import("./pages/LocationPreview")) : null;


// Critical path - load immediately
const IndexV1 = lazy(() => import("./pages/IndexV1"));
const GeneratedRoutePage = lazy(() => import("./pages/GeneratedRoutePage"));

const QuoteVisualPreview = import.meta.env.DEV ? lazy(() => import('./pages/QuoteVisualPreview')) : null;

// Lazy load non-critical routes for better initial load
const LimpezaSofas = lazy(() => import("./pages/LimpezaSofas"));
const Impermeabilizacao = lazy(() => import("./pages/Impermeabilizacao"));
const LimpezaTapetes = lazy(() => import("./pages/LimpezaTapetes"));
const LimpezaColchoes = lazy(() => import("./pages/LimpezaColchoes"));
const LimpezaCadeiras = lazy(() => import("./pages/LimpezaCadeiras"));
const LimpezaAlcatifas = lazy(() => import("./pages/LimpezaAlcatifas"));
const Obrigado = lazy(() => import("./pages/Obrigado"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const EnServicePage = lazy(() => import("./pages/EnServicePage"));
const EnGuidePage = lazy(() => import("./pages/EnGuidePage"));
const BeforeAfterPage = lazy(() => import("./pages/BeforeAfterPage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminDeslocacoes = lazy(() => import("./pages/AdminDeslocacoes"));
const AreasDeServico = lazy(() => import("./pages/AreasDeServico"));
const Sobre = lazy(() => import("./pages/Sobre"));
const Autor = lazy(() => import("./pages/Autor"));
const Estudo = lazy(() => import("./pages/Estudo"));

const ReviewRequest = lazy(() => import("./pages/ReviewRequest"));
const FAQEstofos = lazy(() => import("./pages/FAQEstofos"));
const GlossarioEstofos = lazy(() => import("./pages/GlossarioEstofos"));
const PacksSitemap = lazy(() => import("./pages/PacksSitemap"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const TermosCondicoes = lazy(() => import("./pages/TermosCondicoes"));
const PoliticaDevolucoes = lazy(() => import("./pages/PoliticaDevolucoes"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
  </div>
);


// ── Inner router component, must be inside <BrowserRouter> to use useLocation
const AppRoutes = () => {
  useScrollReveal();
  // Atribuição + page_view por mudança de rota. Ver o porquê em use-page-tracking.ts.
  usePageTracking();

  return (
    <>
      {/* Gold progress bar, fires on every route change */}
      <TopProgressBar />

      <ScrollToTop />
      <PageHead />

      <div key={location.pathname} className="page-content" style={{ width: '100%', minHeight: '100vh' }}>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {QuoteVisualPreview && <Route path="/__preview/orcamento" element={<QuoteVisualPreview />} />}
                {LocationPreview && <Route path="/__preview/localizacao" element={<LocationPreview />} />}
                <Route path="/" element={<IndexV1 />} />
                <Route path="/limpeza-sofas" element={<LimpezaSofas />} />
                <Route path="/impermeabilizacao" element={<Impermeabilizacao />} />
                <Route path="/limpeza-tapetes" element={<LimpezaTapetes />} />
                <Route path="/limpeza-colchoes" element={<LimpezaColchoes />} />
                <Route path="/limpeza-cadeiras" element={<LimpezaCadeiras />} />
                <Route path="/limpeza-alcatifas" element={<LimpezaAlcatifas />} />
                <Route path="/obrigado" element={<Obrigado />} />
                <Route path="/guia-de-packs" element={<PacksSitemap />} />
                <Route path="/antes-depois-limpeza" element={<BeforeAfterPage />} />
                {/* Problem SEO pages */}
                <Route path="/problemas/:slug" element={<ProblemPage />} />
                {/* English tourist SEO pages — isolated /en/ namespace, no PT overlap */}
                <Route path="/en/airbnb-portugal-cleaning-guide" element={<EnGuidePage />} />
                <Route path="/en/:slug" element={<EnServicePage />} />
                {/* Resource pages */}
                {/* Blog */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/obrigado-pelo-servico" element={<ReviewRequest />} />
                <Route path="/perguntas-frequentes-limpeza-estofos" element={<FAQEstofos />} />
                <Route path="/glossario-limpeza-estofos" element={<GlossarioEstofos />} />
                {/* Legal */}
                <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
                <Route path="/termos-e-condicoes" element={<TermosCondicoes />} />
                <Route path="/politica-de-devolucoes" element={<PoliticaDevolucoes />} />
                {/* Admin, painel único */}
                <Route path="/admin/panel" element={<AdminPanel />} />
                <Route path="/admin/deslocacoes" element={<AdminDeslocacoes />} />
                <Route path="/areas-de-servico" element={<AreasDeServico />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/autor/:slug" element={<Autor />} />
                <Route path="/estudo-limpeza-estofos-portugal" element={<Estudo />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

                <Route path="*" element={<GeneratedRoutePage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
    </>
  );
};

// ── Root app ──────────────────────────────────────────────────────────────────
const SessionTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!isPublicTrackingPage()) return;
    let last = document.visibilityState === 'visible' ? Date.now() : 0;
    const send = () => {
      const now = Date.now();
      if (last) trackSessionTime((now - last) / 1000, pathname);
      last = document.visibilityState === 'visible' ? now : 0;
    };
    const hide = () => { send(); last = 0; };
    const timer = window.setInterval(send, 15000);
    document.addEventListener('visibilitychange', send);
    window.addEventListener('pagehide', hide);
    return () => { hide(); clearInterval(timer); document.removeEventListener('visibilitychange', send); window.removeEventListener('pagehide', hide); };

  }, [pathname]);
  return null;
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <SessionTracker />
      <AppRoutes />

      <MobileStickyBar />
      <CookieBanner />
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
