import { lazy, Suspense } from 'react';
const Sections = lazy(() => import('./LandingServiceSections'));
export default function LazyLandingServiceSections() {
  return <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}><Sections /></Suspense>;
}
