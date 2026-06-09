import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { trackWhatsAppClick } from "@/lib/quizTracking";

const QuizForm = lazy(() => import('./QuizFormLazy'));
import { MessageCircle } from "lucide-react";
import GoogleReviewsBadge from "@/components/GoogleReviewsBadge";

// Public static assets (URL-encoded for folder names with spaces)
const imgStainDesktop = '/images/fotos%20hero/imagemvinhopc.webp';
const imgStainMobile  = '/images/fotos%20hero/imagemvinhoiphone.webp';

// Slide brand, fotos originais Kyro (colchão de casal PC · sofá texturizado mobile)
const imgHeroDesktop = '/images/fotos%20hero/novafotoheropc.webp';
const imgHeroMobile  = '/images/fotos%20hero/imagemiphoneheronova.webp';

// ── Slide definitions ─────────────────────────────────────────────────────────
interface Slide {
  imgDesktop: string;
  imgMobile: string;
  imgPosition?: string;
  tint: string;
  tag: string;
  problem: string;
  agitation: string;
  cta: string;
}

// 2 slides: dor imediata (Vinho) + proposta de marca (Brand)
const SLIDES: Slide[] = [
  // ── Slide 0, Vinho (urgência imediata, a dor mais aguda)
  {
    imgDesktop:  imgStainDesktop,
    imgMobile:   imgStainMobile,
    imgPosition: 'center 40%',
    tint: 'rgba(60, 5, 5, 0.45)',
    tag: 'KYRO CLEAN SOLUTIONS',
    problem: 'Vinho entornado\nno sofá novo?',
    agitation: 'Não entre em pânico. Não esfregue! Pode estragar as fibras para sempre. Nós removemos a mancha e salvamos o seu tecido hoje.',
    cta: 'Ver preço agora',
  },
  // ── Slide 1, Brand (âncora para visitantes sem problema específico)
  {
    imgDesktop:  imgHeroDesktop,
    imgMobile:   imgHeroMobile,
    imgPosition: 'center 30%',
    tint: 'rgba(8, 10, 30, 0.45)',
    tag: 'KYRO CLEAN SOLUTIONS',
    problem: 'Especialistas em\nhigienização de estofos.',
    agitation: 'Devolvemos a vida ao seu sofá, colchão ou tapete com tecnologia avançada e resultados garantidos no próprio dia.',
    cta: 'Ver preço agora',
  },
];

const INTERVAL_MS = 6000;
const FADE_MS     = 600;  // bg cross-fade duration
const TEXT_OUT_MS = 280;  // text fades out before bg changes

// ── Hero Component ────────────────────────────────────────────────────────────
const Hero = () => {
  const [isQuizOpen, setIsQuizOpen]     = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [current, setCurrent]           = useState(0);
  const [textIn, setTextIn]             = useState(true);  // controls text fade
  const [paused, setPaused]             = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Open quiz ──────────────────────────────────────────────────────────────
  const handleOpenQuiz = () => {
    window.dispatchEvent(new CustomEvent('quizOpened'));
    sessionStorage.setItem('hasClickedQuote', '1');
    setIsQuizOpen(true);
  };

  useEffect(() => {
    window.addEventListener('openQuiz', handleOpenQuiz);
    return () => window.removeEventListener('openQuiz', handleOpenQuiz);
  }, []);

  // ── Sticky CTA scroll logic ────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const heroSection  = document.getElementById('orcamento');
      const finalCta     = document.querySelector('[data-section="final-cta"]');
      let shouldShow = false;
      if (heroSection) {
        shouldShow = heroSection.getBoundingClientRect().bottom < 100;
      }
      if (finalCta) {
        const r = finalCta.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) shouldShow = false;
      }
      setShowStickyCTA(shouldShow);
      window.dispatchEvent(new CustomEvent('stickyCtaChange', { detail: { isVisible: shouldShow } }));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Carousel auto-advance ─────────────────────────────────────────────────
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => {
        const next = (prev + 1) % SLIDES.length;
        // fade text out, then swap slide + fade text back in
        setTextIn(false);
        setTimeout(() => {
          setCurrent(next);
          setTextIn(true);
        }, TEXT_OUT_MS);
        return prev; // keep current until setTimeout fires
      });
    }, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused]);

  const goTo = (idx: number) => {
    if (idx === current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setTextIn(false);
    setTimeout(() => {
      setCurrent(idx);
      setTextIn(true);
    }, TEXT_OUT_MS);
    setPaused(false);
  };

  const slide = SLIDES[current];

  return (
    <>
      <section
        id="orcamento"
        className="relative min-h-[85vh] md:min-h-[90vh] flex items-center z-[1] pt-[56px] sm:pt-[70px] md:pt-[100px] pb-[48px] md:pb-[80px] overflow-hidden"
        aria-label="Kyro Clean Solutions - Limpeza e Proteção Premium"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* ── Stacked backgrounds, cross-fade via opacity ── */}
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 z-0 transition-opacity"
            style={{
              transitionDuration: `${FADE_MS}ms`,
              opacity: i === current ? 1 : 0,
            }}
          >
            {/*
              <picture> lets the browser pick the right source natively:
              - mobile  (<768 px): portrait/focused crop → subject stays visible behind text
              - desktop (≥768 px): landscape crop → cinematic wide composition
            */}
            <picture>
              <source media="(max-width: 767px)" srcSet={s.imgMobile} type="image/webp" />
              <source media="(max-width: 767px)" srcSet={s.imgMobile.replace('.webp', '.png')} />
              <source srcSet={s.imgDesktop} type="image/webp" />
              <img
                src={s.imgDesktop.replace('.webp', '.png')}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: s.imgPosition ?? 'center 30%' }}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding={i === 0 ? 'sync' : 'async'}
                fetchPriority={i === 0 ? 'high' : 'low'}
              />
            </picture>
            {/* Per-slide colour tint */}
            <div
              className="absolute inset-0"
              style={{ background: s.tint }}
            />
          </div>
        ))}

        {/* ── Base dark gradient, left side (content area) ── */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0B2F2A]/88 via-[#0B2F2A]/55 to-transparent pointer-events-none" />
        <div className="md:hidden absolute inset-0 z-[1] bg-kyro-green/72 pointer-events-none" />
        {/* ── Bottom gradient, guarantees trust block legibility on any photo ── */}
        <div className="absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

        {/* ── Content ── */}
        <div className="container mx-auto px-5 md:px-8 relative z-10">
          <div className="max-w-2xl">

            {/* Slide tag / badge */}
            <div
              className="inline-flex items-start mb-4"
              style={{
                opacity: textIn ? 1 : 0,
                transform: textIn ? 'translateY(0)' : 'translateY(-8px)',
                transition: `opacity ${TEXT_OUT_MS}ms ease, transform ${TEXT_OUT_MS}ms ease`,
              }}
            >
              <div className="flex flex-col gap-1">
                <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                <span
                  className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
                >
                  {slide.tag}
                </span>
              </div>
            </div>

            {/* H1, Problem */}
            <h1
              className="font-cormorant text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-[1.2] mb-3 md:mb-5 whitespace-pre-line"
              style={{
                opacity: textIn ? 1 : 0,
                transform: textIn ? 'translateY(0)' : 'translateY(12px)',
                transition: `opacity ${TEXT_OUT_MS + 60}ms ease, transform ${TEXT_OUT_MS + 60}ms ease`,
                textShadow: '0 2px 16px rgba(0,0,0,0.65)',
              }}
            >
              {slide.problem}
            </h1>

            {/* Subheadline, Agitation */}
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl text-white leading-relaxed mb-6 md:mb-8 max-w-xl"
              style={{
                opacity: textIn ? 1 : 0,
                transform: textIn ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity ${TEXT_OUT_MS + 120}ms ease, transform ${TEXT_OUT_MS + 120}ms ease`,
                textShadow: '0 1px 10px rgba(0,0,0,0.55)',
              }}
            >
              {slide.agitation}
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 w-full max-w-sm mt-8 md:mt-10">

              {/* ── PRIMARY, Golden fill button (the only filled button) ── */}
              <div className="relative group">
                {/* Soft ambient halo, subtle, not distracting */}
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />

                <button
                  onClick={handleOpenQuiz}
                  className={[
                    // Layout, Mobile First: 58px tall, full width
                    'relative w-full rounded-full font-bold text-[#12121e] touch-manipulation',
                    'h-[58px] md:h-[52px] px-8 text-base md:text-[17px]',
                    // Gold gradient fill
                    'bg-gradient-to-r from-[#C9A84C] via-[#EDD96A] to-[#C9A84C]',
                    // Inner glow (top highlight + bottom depth) + outer shadow
                    'shadow-[0_6px_22px_rgba(201,168,76,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                    // Hover: lift
                    'hover:shadow-[0_10px_32px_rgba(201,168,76,0.60),0_4px_10px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.36)]',
                    'hover:scale-[1.025]',
                    // Click feedback, feels like a real physical button press
                    'active:scale-[0.95] active:shadow-[0_2px_8px_rgba(201,168,76,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
                    'transition-all duration-150',
                  ].join(' ')}
                >
                  <span className="tracking-wide">{slide.cta}</span>
                </button>
              </div>

              {/* ── SECONDARY, WhatsApp ── */}
              <div className="relative group">
                <div className="absolute -inset-1.5 rounded-full bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                <a
                  href={`https://wa.me/351925530647?text=${encodeURIComponent('Olá, gostaria de saber mais sobre os vossos serviços de higienização.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('hero')}
                  className={[
                    'relative flex items-center justify-center gap-2 w-full rounded-full font-bold text-white touch-manipulation',
                    'h-[58px] md:h-[52px] px-8 text-base md:text-[17px]',
                    'bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851]',
                    'shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                    'hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)]',
                    'hover:scale-[1.025]',
                    'active:scale-[0.95] active:shadow-[0_2px_8px_rgba(37,211,102,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
                    'transition-all duration-150',
                  ].join(' ')}
                >
                  <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
                  <span className="tracking-wide">Falar por WhatsApp</span>
                </a>
              </div>

              {/* Google Reviews Badge */}
              <div className="flex justify-center pt-1">
                <GoogleReviewsBadge variant="light" className="shadow-[0_2px_12px_rgba(0,0,0,0.4)]" />
              </div>
            </div>

            {/* ── Slide counter ── */}
            <div className="mt-5">
              <span className="text-[10px] text-white/25 font-mono tracking-widest">
                {current + 1}/{SLIDES.length}
              </span>
            </div>

          </div>
        </div>

        <Suspense fallback={null}>
          <QuizForm isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
        </Suspense>
      </section>

      {/* ── Sticky CTAs (unchanged) ── */}
      {!isQuizOpen && (
        <>
          {/* Mobile sticky */}
          <div
            className={`fixed bottom-0 left-0 right-0 bg-kyro-green/97 backdrop-blur-md border-t border-gold/20 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 md:hidden transition-transform duration-300 shadow-2xl ${
              showStickyCTA ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <a
              href={`https://wa.me/351925530647?text=${encodeURIComponent('Olá! Gostaria de pedir um orçamento para limpeza de estofos.')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('hero_sticky_mobile')}
              className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-[#25D366] shadow-[0_4px_24px_rgba(37,211,102,0.50)] active:scale-[0.98] transition-all touch-manipulation"
            >
              <MessageCircle className="w-5 h-5 text-white flex-shrink-0" strokeWidth={2} />
              <span className="text-white font-black text-base tracking-wide">Falar no WhatsApp</span>
            </a>
          </div>

          {/* Desktop sticky removido, o header já tem o botão sempre visível */}
        </>
      )}
    </>
  );
};

export default Hero;
