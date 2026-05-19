import { useState, useEffect, useRef, lazy, Suspense } from "react";

const QuizForm = lazy(() => import('./QuizFormLazy'));
import { Phone, MessageCircle, Trophy, Shield, Clock, CheckCircle } from "lucide-react";
import GoogleReviewsBadge from "@/components/GoogleReviewsBadge";
import { trackCallClick } from "@/lib/analytics";

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

// Badge style is uniform across all slides, Kyro gold/amber
const BADGE_CLS = 'text-amber-200 bg-amber-400/[0.18] border-amber-400/40';

// 2 slides: dor imediata (Vinho) + proposta de marca (Brand)
const SLIDES: Slide[] = [
  // ── Slide 0, Vinho (urgência imediata, a dor mais aguda)
  {
    imgDesktop:  imgStainDesktop,
    imgMobile:   imgStainMobile,
    imgPosition: 'center 40%',
    tint: 'rgba(60, 5, 5, 0.45)',
    tag: 'Emergência de Manchas',
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
              {current === 3 ? (
                /* ── Luxury brand badge, Slide 0 only ── */
                <div className="flex flex-col gap-1">
                  {/* Fine gold rule above */}
                  <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                  <span
                    className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase"
                    style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
                  >
                    {slide.tag}
                  </span>
                </div>
              ) : (
                /* ── Standard text badge, all other slides ── */
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>
                  {slide.tag}
                </p>
              )}
            </div>

            {/* H1, Problem */}
            <h1
              className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.25] mb-3 md:mb-5 whitespace-pre-line"
              style={{
                opacity: textIn ? 1 : 0,
                transform: textIn ? 'translateY(0)' : 'translateY(12px)',
                transition: `opacity ${TEXT_OUT_MS + 60}ms ease, transform ${TEXT_OUT_MS + 60}ms ease`,
              }}
            >
              {slide.problem}
            </h1>

            {/* Subheadline, Agitation */}
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-6 md:mb-8 max-w-xl"
              style={{
                opacity: textIn ? 1 : 0,
                transform: textIn ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity ${TEXT_OUT_MS + 120}ms ease, transform ${TEXT_OUT_MS + 120}ms ease`,
              }}
            >
              {slide.agitation}
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {([
                { Icon: Trophy,      label: 'N.º1 no Porto'        },
                { Icon: Shield,      label: 'Qualidade Garantida'   },
                { Icon: Clock,       label: 'Resposta em menos de 1h'         },
                { Icon: CheckCircle, label: 'Orçamento Gratuito'   },
              ] as const).map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 bg-black/30 border border-white/[0.14] rounded-full px-2.5 py-1 backdrop-blur-sm">
                  <Icon className="w-3 h-3 text-gold flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-white/85 text-[11px] font-semibold leading-none">{label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 w-full max-w-sm">

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
                    // Periodic glow pulse
                    'animate-cta-glow',
                  ].join(' ')}
                >
                  <span className="tracking-wide">{slide.cta}</span>
                </button>
              </div>

              {/* ── SECONDARY, WhatsApp (transparent, elegant link style) ── */}
              <a
                href={`https://wa.me/351925530647?text=${encodeURIComponent('Olá, gostaria de saber mais sobre os vossos serviços de higienização.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-[48px] md:h-[44px] text-white/75 font-medium text-sm border border-white/20 rounded-full hover:bg-white/[0.07] hover:border-white/35 hover:text-white transition-all duration-200"
              >
                <MessageCircle className="w-[18px] h-[18px] text-[#25D366] flex-shrink-0" strokeWidth={2} />
                <span>Prefiro falar por WhatsApp</span>
              </a>

              {/* ── TRUST micro-copy + phone anchor ── */}
              <div className="flex flex-col items-center gap-2 pt-2">
                {/* Google Reviews Badge */}
                <GoogleReviewsBadge variant="light" className="shadow-[0_2px_12px_rgba(0,0,0,0.4)]" />

                {/* Phone number, bold, pure white, tel: link */}
                <a
                  href="tel:925530647"
                  onClick={() => trackCallClick('hero_phone_link')}
                  className="flex items-center gap-1.5 text-white hover:text-gold transition-colors duration-150"
                  style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.80)' }}
                >
                  <Phone className="w-3.5 h-3.5 text-gold animate-phone-shake flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-sm font-bold tracking-wide">925 530 647</span>
                </a>
              </div>
            </div>

            {/* ── Slide dots ── */}
            <div className="flex items-center gap-2 mt-6">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="transition-all duration-300 rounded-full focus:outline-none"
                  style={{
                    width:  i === current ? '24px' : '8px',
                    height: '8px',
                    background: i === current ? '#C9A84C' : 'rgba(255,255,255,0.35)',
                  }}
                />
              ))}
              {/* Progress bar on active dot */}
              <span className="ml-2 text-[11px] text-white/35 font-mono">
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
            <div className="flex gap-2">
              <button
                onClick={handleOpenQuiz}
                className="flex-1 bg-gradient-to-r from-[#C9A84C] via-[#E8D070] to-[#C9A84C] text-[#1A1A2E] font-bold text-sm py-3.5 h-auto rounded-full shadow-lg animate-cta-glow"
              >
                Orçamento rápido (30 seg)
              </button>
              <a
                href="tel:925530647"
                onClick={() => trackCallClick('hero_sticky_mobile')}
                className="flex items-center justify-center gap-1.5 px-4 text-white font-semibold text-sm border border-white/25 rounded-full hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4 text-gold animate-phone-shake" strokeWidth={2.5} />
              </a>
            </div>
          </div>

          {/* Desktop sticky removido, o header já tem o botão sempre visível */}
        </>
      )}
    </>
  );
};

export default Hero;
