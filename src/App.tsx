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
const ServiceAreaRouter = lazy(() => import("./pages/ServiceAreaRouter"));
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
                {/* Location × Service + Freguesia × Service: 942 routes → 6 splat patterns.
                    ServiceAreaRouter checks if the * param is a known city slug;
                    if yes → LocationServicePage, if no → FreguesiaServicePage. */}
                <Route path="/limpeza-sofas-*" element={<ServiceAreaRouter />} />
                <Route path="/limpeza-colchoes-*" element={<ServiceAreaRouter />} />
                <Route path="/limpeza-tapetes-*" element={<ServiceAreaRouter />} />
                <Route path="/limpeza-cadeiras-*" element={<ServiceAreaRouter />} />
                <Route path="/limpeza-alcatifas-*" element={<ServiceAreaRouter />} />

                {/* Keyword variant patterns — higienizacao/lavagem: no conflicts */}
                <Route path="/higienizacao-*" element={<SofaVariantPage />} />
                <Route path="/lavagem-*" element={<SofaVariantPage />} />
                {/* Impermeabilizacao variants: more-specific patterns must come before the location catch-all */}
                <Route path="/impermeabilizacao-sofa-*" element={<SofaVariantPage />} />
                <Route path="/impermeabilizacao-colchao-*" element={<SofaVariantPage />} />
                <Route path="/impermeabilizacao-tapetes-*" element={<SofaVariantPage />} />
                <Route path="/impermeabilizacao-cadeiras-*" element={<SofaVariantPage />} />
                <Route path="/impermeabilizacao-alcatifas-*" element={<SofaVariantPage />} />
                {/* Impermeabilizacao × location/freguesia catch-all */}
                <Route path="/impermeabilizacao-*" element={<ServiceAreaRouter />} />

                {/* Problem SEO pages */}
                <Route path="/problemas/:slug" element={<ProblemPage />} />
                {/* Problem × City pattern routes — no data import needed.
                    More-specific patterns before /limpeza-sofa-*, /limpeza-cadeiras-* etc. */}
                <Route path="/manchas-*" element={<ProblemCityPage />} />
                <Route path="/cheiro-*" element={<ProblemCityPage />} />
                <Route path="/urina-*" element={<ProblemCityPage />} />
                <Route path="/acaros-*" element={<ProblemCityPage />} />
                <Route path="/alergias-*" element={<ProblemCityPage />} />
                <Route path="/pelos-animais-*" element={<ProblemCityPage />} />
                <Route path="/tapete-persa-*" element={<ProblemCityPage />} />
                <Route path="/tapete-la-*" element={<ProblemCityPage />} />
                <Route path="/mofo-*" element={<ProblemCityPage />} />
                <Route path="/impermeabilizar-*" element={<ProblemCityPage />} />
                <Route path="/preco-limpeza-sofa-*" element={<ProblemCityPage />} />
                <Route path="/preco-limpeza-colchao-*" element={<ProblemCityPage />} />
                <Route path="/preco-limpeza-tapete-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-profunda-*" element={<ProblemCityPage />} />
                <Route path="/empresa-limpeza-estofos-*" element={<ProblemCityPage />} />
                <Route path="/sofa-amarelado-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-cabeceira-cama-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-puff-*" element={<ProblemCityPage />} />
                {/* Slugs that overlap /limpeza-sofa-*, /limpeza-colchao-*, /limpeza-cadeiras-*, /limpeza-alcatifas-* */}
                <Route path="/limpeza-sofa-tecido-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-sofa-pele-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-sofa-veludo-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-sofa-bebe-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-sofa-urgente-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-sofa-domicilio-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-sofa-profissional-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-sofa-microfibra-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-sofa-chenille-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-sofa-hotel-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-sofa-perto-de-mim-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-sofa-antes-depois-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-colchao-urgente-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-colchao-bebe-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-cadeiras-escritorio-*" element={<ProblemCityPage />} />
                <Route path="/limpeza-alcatifas-empresa-*" element={<ProblemCityPage />} />

                {/* Marca Sofá brand patterns (more specific) before general material patterns */}
                {['ikea', 'natuzzi', 'roche-bobois', 'conforama', 'el-corte-ingles', 'kave-home', 'leroy-merlin', 'moviflor'].map(brand => (
                  <Route key={brand} path={`/limpeza-sofa-${brand}-*`} element={<MarcaSofaPage />} />
                ))}
                {/* Material pages: singular-prefix patterns (sofa/colchao/tapete/cadeira/alcatifa) */}
                <Route path="/limpeza-sofa-*" element={<MaterialPage />} />
                <Route path="/limpeza-colchao-*" element={<MaterialPage />} />
                <Route path="/limpeza-tapete-*" element={<MaterialPage />} />
                <Route path="/limpeza-cadeira-*" element={<MaterialPage />} />
                <Route path="/limpeza-alcatifa-*" element={<MaterialPage />} />

                {/* Price pages: service-specific patterns (avoids /preco-limpeza-sofa-* problem×city paths) */}
                <Route path="/preco-limpeza-sofas-*" element={<PricePage />} />
                <Route path="/preco-limpeza-colchoes-*" element={<PricePage />} />
                <Route path="/preco-limpeza-tapetes-*" element={<PricePage />} />
                <Route path="/preco-limpeza-cadeiras-*" element={<PricePage />} />
                <Route path="/preco-limpeza-alcatifas-*" element={<PricePage />} />
                <Route path="/preco-impermeabilizacao-*" element={<PricePage />} />

                {/* Pack/Combo pages */}
                <Route path="/pack-*" element={<PackComboPage />} />
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
