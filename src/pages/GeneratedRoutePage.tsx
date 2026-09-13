import { lazy, useEffect, useState, type ComponentType } from 'react';
import { useLocation } from 'react-router-dom';
const TreatmentPage = lazy(() => import('./TreatmentPage'));
const NotFound = lazy(() => import("./NotFound"));
const LocationServicePage = lazy(() => import("./LocationServicePage"));
const FreguesiaServicePage = lazy(() => import("./FreguesiaServicePage"));
const ProblemCityPage = lazy(() => import("./ProblemCityPage"));
const CommercialPage = lazy(() => import("./CommercialPage"));
const MaterialPage = lazy(() => import("./MaterialPage"));
const PricePage = lazy(() => import("./PricePage"));
const SofaVariantPage = lazy(() => import("./SofaVariantPage"));
const PackComboPage = lazy(() => import("./PackComboPage"));
const MarcaSofaPage = lazy(() => import("./MarcaSofaPage"));
const MarcaColchaoPage = lazy(() => import("./MarcaColchaoPage"));
const MarcaCadeirasPage = lazy(() => import("./MarcaCadeirasPage"));
const pages: Record<string, ComponentType> = { TreatmentPage, NotFound, LocationServicePage, FreguesiaServicePage, ProblemCityPage, CommercialPage, MaterialPage, PricePage, SofaVariantPage, PackComboPage, MarcaSofaPage, MarcaColchaoPage, MarcaCadeirasPage };

// The build declares the exact page type. Catalogs are needed only for SPA
// navigation or unknown URLs, not to rediscover the page just served.
const initialPath = typeof document !== 'undefined' ? document.querySelector('meta[name="kyro-route-path"]')?.getAttribute('content') : null;
const initialPage = typeof document !== 'undefined' ? document.querySelector('meta[name="kyro-route-page"]')?.getAttribute('content') : null;
export default function GeneratedRoutePage() {
  const { pathname } = useLocation();
  const fromHtml = pathname.replace(/\/$/, '') === initialPath && initialPage && pages[initialPage] ? initialPage : null;
  const [resolved, setResolved] = useState<string | null>(fromHtml);
  useEffect(() => {
    if (fromHtml) return;
    let current = true;
    void import('../data/generatedRouteIndex').then(({ generatedPageForPath }) => { if (current) setResolved(generatedPageForPath(pathname)); });
    return () => { current = false; };
  }, [pathname, fromHtml]);
  const Page = resolved ? pages[resolved] ?? NotFound : null;
  return Page ? <Page /> : <div className="min-h-screen bg-background" aria-busy="true" />;
}
