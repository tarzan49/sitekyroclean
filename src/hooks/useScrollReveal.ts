import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MIN_HEIGHT = 120;
const SELECTOR = 'section:not([data-no-reveal])';

function getSections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter(
    el => el.offsetHeight >= MIN_HEIGHT
  );
}

function applyFocus(heroSection: HTMLElement | null, contentSections: HTMLElement[]) {
  // Hero section is always fully visible — never dimmed
  if (heroSection) {
    heroSection.classList.remove('sr-inactive');
    heroSection.classList.add('sr-active');
  }

  if (contentSections.length === 0) return;

  contentSections.forEach((el) => {
    const rect = el.getBoundingClientRect();
    // Only dim sections that are fully below the viewport (not yet reached)
    if (rect.top >= window.innerHeight) {
      el.classList.remove('sr-active');
      el.classList.add('sr-inactive');
    } else {
      el.classList.remove('sr-inactive');
      el.classList.add('sr-active');
    }
  });
}

export function useScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    let heroSection: HTMLElement | null = null;
    let contentSections: HTMLElement[] = [];
    let rafId = 0;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        applyFocus(heroSection, contentSections);
        ticking = false;
      });
    };

    const setup = () => {
      const all = getSections();
      if (all.length === 0) return;

      // First section = hero/title — always stays at full opacity
      heroSection = all[0];
      // Remaining sections participate in the focus scroll effect
      contentSections = all.slice(1);

      const involved = [heroSection, ...contentSections];

      // Mark all as ready (enables CSS transitions)
      involved.forEach(el => el.classList.add('sr-ready'));

      // Apply initial state without transition (avoid flash on load)
      involved.forEach(el => el.classList.add('sr-no-transition'));
      applyFocus(heroSection, contentSections);
      requestAnimationFrame(() => {
        involved.forEach(el => el.classList.remove('sr-no-transition'));
      });

      window.addEventListener('scroll', onScroll, { passive: true });
    };

    // Wait for Framer Motion page transition (280ms) + lazy Suspense
    const timer = setTimeout(setup, 340);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      document
        .querySelectorAll<HTMLElement>('section.sr-ready')
        .forEach(el => el.classList.remove('sr-ready', 'sr-active', 'sr-inactive', 'sr-no-transition'));
    };
  }, [pathname]);
}
