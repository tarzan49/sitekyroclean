export const criticalStyles = `
  .hero-placeholder {
    background: linear-gradient(135deg, #0d3c47 0%, #1a5a5f 100%);
    min-height: 100vh;
  }
`;

export const preloadCriticalResources = (): void => {
  const origins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  origins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    if (!document.head.querySelector(`link[href="${origin}"]`)) {
      document.head.appendChild(link);
    }
  });
};

export const measureWebVitals = (): void => {
  if (typeof window === 'undefined') return;

  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.debug('[Performance] LCP:', lastEntry.startTime);
  });
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

  const fidObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const fidEntry = entry as PerformanceEntry & { processingStart?: number };
      if (fidEntry.processingStart !== undefined) {
        console.debug('[Performance] FID:', fidEntry.processingStart - entry.startTime);
      }
    });
  });
  fidObserver.observe({ type: 'first-input', buffered: true });

  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const layoutEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
      if (!layoutEntry.hadRecentInput) {
        clsValue += layoutEntry.value ?? 0;
      }
    });
    console.debug('[Performance] CLS:', clsValue);
  });
  clsObserver.observe({ type: 'layout-shift', buffered: true });
};
