import { lazy, Suspense, useEffect } from "react";
import { trackSessionTime } from "@/lib/quizTracking";
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
import { getAllLocationRoutes } from "@/data/locationSeoData";
import { getAllFreguesiaRoutes } from "@/data/freguesiaSeoData";
import { getAllMaterialRoutes, getAllMaterialCityRoutes } from "@/data/materialSeoData";
import { getAllPriceRoutes } from "@/data/priceSeoData";
import { getAllProblemCityRoutes } from "@/data/problemCitySeoData";
import { getAllKeywordVariantRoutes } from "@/data/keywordVariantRouteData";
import { getAllPackComboRoutes } from "@/data/packComboData";
import { getAllMarcaSofaRoutes } from "@/data/marcaSofaData";
import { getAllMarcaColchaoRoutes } from "@/data/marcaColchaoData";

// Critical path - load immediately
import IndexV1 from "./pages/IndexV1";

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
const FreguesiaServicePage = lazy(() => import("./pages/FreguesiaServicePage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const ProblemCityPage = lazy(() => import("./pages/ProblemCityPage"));
const MaterialPage = lazy(() => import("./pages/MaterialPage"));
const PricePage = lazy(() => import("./pages/PricePage"));
const BeforeAfterPage = lazy(() => import("./pages/BeforeAfterPage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminDeslocacoes = lazy(() => import("./pages/AdminDeslocacoes"));
const AreasDeServico = lazy(() => import("./pages/AreasDeServico"));

const SofaVariantPage = lazy(() => import("./pages/SofaVariantPage"));
const ReviewRequest = lazy(() => import("./pages/ReviewRequest"));
const FAQEstofos = lazy(() => import("./pages/FAQEstofos"));
const GlossarioEstofos = lazy(() => import("./pages/GlossarioEstofos"));
const PackComboPage = lazy(() => import("./pages/PackComboPage"));
const Packs = lazy(() => import("./pages/Packs"));
const PacksSitemap = lazy(() => import("./pages/PacksSitemap"));
const MarcaSofaPage = lazy(() => import("./pages/MarcaSofaPage"));
const MarcaColchaoPage = lazy(() => import("./pages/MarcaColchaoPage"));
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


// Pre-generate all explicit route lists (just path strings — cheap at module load)
// React Router v6 requires * to follow /; patterns like /pack-* are treated as /pack-/*
// and never match /pack-foo-bar. Explicit routes are the only reliable solution.
const locationRoutes = getAllLocationRoutes();
const frequesiaRoutes = getAllFreguesiaRoutes();
const materialRoutes = getAllMaterialRoutes();
const materialCityRoutes = getAllMaterialCityRoutes();
const priceRoutes = getAllPriceRoutes();
// Filter out higienizacao/lavagem prefixes: keywordVariantRoutes cover those paths first
const problemCityRoutes = getAllProblemCityRoutes().filter(
  r => !r.path.startsWith('/higienizacao-') && !r.path.startsWith('/lavagem-')
);
const keywordVariantRoutes = getAllKeywordVariantRoutes();
const packComboRoutes = getAllPackComboRoutes();
const marcaSofaRoutes = getAllMarcaSofaRoutes();
const marcaColchaoRoutes = getAllMarcaColchaoRoutes();

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

      <div key={location.pathname} className="page-fade-in" style={{ width: '100%', minHeight: '100vh' }}>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<IndexV1 />} />
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
                {/* Location × Service SEO pages: 150 explicit routes */}
                {locationRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<LocationServicePage />} />
                ))}
                {/* Freguesia × Service SEO pages: 792 explicit routes */}
                {frequesiaRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<FreguesiaServicePage />} />
                ))}
                {/* Keyword variant pages (higienizacao/lavagem/impermeabilizacao × service × location).
                    Registered BEFORE problem×city to win on overlapping paths like
                    /higienizacao-colchao-porto or /lavagem-tapetes-braga. */}
                {keywordVariantRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<SofaVariantPage />} />
                ))}
                {/* Problem SEO pages */}
                <Route path="/problemas/:slug" element={<ProblemPage />} />
                {/* Problem × City explicit routes (higienizacao-* and lavagem-* filtered out above) */}
                {problemCityRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<ProblemCityPage />} />
                ))}
                {/* Marca Sofá pages: 8 brands × cities */}
                {marcaSofaRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<MarcaSofaPage />} />
                ))}
                {/* Marca Colchão pages: 6 brands × cities */}
                {marcaColchaoRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<MarcaColchaoPage />} />
                ))}
                {/* Material base pages */}
                {materialRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<MaterialPage />} />
                ))}
                {/* Material × City pages */}
                {materialCityRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<MaterialPage />} />
                ))}
                {/* Price pages */}
                {priceRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<PricePage />} />
                ))}
                {/* Pack/Combo pages: 4 packs × 5 cities = 20 pages */}
                {packComboRoutes.map(route => (
                  <Route key={route.path} path={route.path} element={<PackComboPage />} />
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
        </div>
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
