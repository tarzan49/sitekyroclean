import { lazy, Suspense, useEffect, useState } from 'react';
const Sections = lazy(() => import('./LandingServiceSections'));
const fallback = <div className="min-h-screen" aria-busy="true" />;

/** Defers fetching the below-hero chunk to idle time so it never competes with the hero's LCP resources on first load. */
export default function LazyLandingServiceSections() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const win = window as typeof window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(() => setReady(true), { timeout: 800 });
      return () => win.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);
  if (!ready) return fallback;
  return <Suspense fallback={fallback}><Sections /></Suspense>;
}
