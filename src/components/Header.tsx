import { PriceCta, WhatsAppCta } from '@/components/Cta';
import { buildGeneralWaMessage } from "@/lib/whatsappMessages";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ChevronDown, MessageCircle, Phone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, useNavigate, useLocation } from "react-router-dom";
import QuizForm from "./QuizFormLazy";
import BasketButton from "./BasketButton";
import { useQuizLocation, useQuizService } from "@/context/QuizLocationContext";
import { WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";

const loadServiceList = () => import("./HeaderServiceList");
const HeaderServiceList = lazy(loadServiceList);

const serviceLinks = [
  { to: '/limpeza-sofas',    label: 'Sofás' },
  { to: '/limpeza-colchoes', label: 'Colchões' },
  { to: '/limpeza-cadeiras', label: 'Cadeiras' },
  { to: '/limpeza-tapetes',  label: 'Tapetes' },
  { to: '/limpeza-alcatifas',label: 'Alcatifas' },
  { to: '/impermeabilizacao',label: 'Impermeabilização' },
];
const FAQ_PATH = '/perguntas-frequentes-limpeza-estofos';

/** Enquanto a lista com fotografias não chega, os mesmos links em texto: o menu nunca abre vazio. */
const PlainServices = ({ dark = false, onNavigate }: { dark?: boolean; onNavigate: () => void }) => (
  <ul className={`grid grid-cols-2 ${dark ? 'gap-2' : 'gap-1'}`}>
    {serviceLinks.map(s => <li key={s.to}><Link to={s.to} onClick={onNavigate} className={`flex items-center rounded-xl px-3 font-semibold ${dark ? 'min-h-[74px] border border-white/15 bg-white/[0.05] text-[15px] text-white' : 'min-h-[72px] text-[15px] text-[#111111]'}`}>{s.label}</Link></li>)}
  </ul>
);

const Header = () => {
  // Altura real do menu fixo, para as secções de ecrã inteiro (index.css, dono 24 Nov).
  useEffect(() => {
    const set = () => document.documentElement.style.setProperty("--header-h", `${document.querySelector("header")?.getBoundingClientRect().height ?? 64}px`);
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);
  const { isQuizOpen, openQuiz, closeQuiz } = useQuizLauncher();
  const navigate  = useNavigate();
  const location  = useLocation();
  const quizLocation = useQuizLocation();
  const quizService  = useQuizService();

  // Serviços no computador: abre com o rato, com o teclado ou com um clique; fecha com Escape ou ao sair.
  const [servicesOpen, setServicesOpen] = useState(false);
  const closeTimer = useRef<number>();
  const openServices = () => { window.clearTimeout(closeTimer.current); void loadServiceList(); setServicesOpen(true); };
  // O rato abre ao passar: o clique a seguir nunca o fecha (no toque e no teclado abre e fecha).
  const pressed = useRef<{ mouse: boolean; open: boolean } | null>(null);
  const toggleServices = () => {
    const p = pressed.current; pressed.current = null;
    if (p?.mouse) return openServices();
    if (p ? p.open : servicesOpen) setServicesOpen(false); else openServices();
  };
  const closeServicesSoon = () => { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setServicesOpen(false), 140); };
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);
  useEffect(() => { setServicesOpen(false); }, [location.pathname]);

  // Sombra só depois de descer: no topo, a barra fica limpa.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // As avaliações da própria página, quando as tem; senão, as da página inicial.
  const goToReviews = () => {
    setMobileMenuOpen(false);
    const here = document.getElementById("testemunhos") ?? document.getElementById("avaliacoes");
    if (here) window.setTimeout(() => here.scrollIntoView({ behavior: "smooth" }), 60);
    else navigate("/", { state: { anchor: "testemunhos" } });
  };

  const isServicePage = serviceLinks.some(s => location.pathname === s.to);
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage())}`;
  const closeMenu = () => setMobileMenuOpen(false);

  const navItem = (active: boolean) =>
    `relative flex h-10 items-center whitespace-nowrap text-[15px] font-medium transition-colors after:absolute after:inset-x-0 after:bottom-1 after:h-[2px] after:origin-left after:rounded-full after:bg-[#D4AF37] after:transition-transform after:duration-200 ${
      active ? 'text-[#111111] after:scale-x-100' : 'text-[#111111]/75 after:scale-x-0 hover:text-[#111111] hover:after:scale-x-100'
    }`;

  return (
    <>
    {/* Barra de cima refeita (dono, 25 Nov: "tanto no mobile como no pc podia ser bem bem melhor"): letra legível,
        um só estilo de botões, serviços com fotografia real e "desde" do motor. A altura não muda (57/61 px), porque as
        secções de ecrã inteiro contam com ela. */}
    <header className={`fixed top-0 left-0 right-0 z-50 border-b bg-white transition-shadow duration-200 ${scrolled ? 'border-transparent shadow-[0_6px_24px_-12px_rgba(11,47,42,0.28)]' : 'border-[#111111]/8'}`}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 pl-3 pr-1.5 sm:px-5 md:h-[60px] lg:gap-5 lg:px-8">

        <Link
          to="/"
          aria-label="Kyro Clean Solutions, página inicial"
          onClick={(e) => {
            closeMenu();
            if (location.pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
          }}
          className="flex h-11 min-w-0 shrink items-center whitespace-nowrap font-playfair text-[15.5px] font-bold leading-none tracking-[-0.03em] text-[#111111] max-[359px]:text-[13px] min-[400px]:text-[17px] md:text-[20px] xl:text-[21px]"
        >
          <span className="text-[#D4AF37]">KYRO</span>&nbsp;Clean Solutions
        </Link>

        {/* Computador */}
        <nav aria-label="Menu principal" className="mx-auto hidden items-center gap-5 lg:flex xl:gap-8">
          <div
            className="relative"
            onMouseEnter={openServices}
            onMouseLeave={closeServicesSoon}
            onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setServicesOpen(false); }}
            onKeyDown={e => { if (e.key === "Escape") setServicesOpen(false); }}
          >
            <button type="button" aria-expanded={servicesOpen} aria-controls="menu-servicos" onPointerDown={e => { pressed.current = { mouse: e.pointerType === 'mouse', open: servicesOpen }; }} onClick={toggleServices} className={`${navItem(isServicePage || servicesOpen)} gap-1`}>
              Serviços
              <ChevronDown className={`h-4 w-4 opacity-60 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {servicesOpen && (
              <div id="menu-servicos" className="absolute left-1/2 top-full w-[500px] -translate-x-1/2 pt-2.5">
                <div className="rounded-2xl border border-[#111111]/8 bg-white p-2.5 shadow-[0_24px_60px_-20px_rgba(11,47,42,0.35)]">
                  <Suspense fallback={<PlainServices onNavigate={() => setServicesOpen(false)} />}>
                    <HeaderServiceList onNavigate={() => setServicesOpen(false)} />
                  </Suspense>
                  <Link to="/guia-de-packs" onClick={() => setServicesOpen(false)} className="mt-2 flex items-center justify-between rounded-xl bg-[#0B2F2A] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#123d36]">
                    Packs: limpeza e proteção na mesma visita
                    <span aria-hidden className="text-[#D4AF37]">→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link to="/guia-de-packs" className={navItem(location.pathname === '/guia-de-packs')}>Packs</Link>
          <button type="button" onClick={goToReviews} className={navItem(false)}>Testemunhos</button>
          <Link to="/blog" className={navItem(location.pathname.startsWith('/blog'))}>Blog</Link>
          <Link to={FAQ_PATH} className={navItem(location.pathname === FAQ_PATH)}>Perguntas</Link>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <a href={`tel:${PHONE_TEL}`} data-tracking-source="header_desktop" className="mr-1 hidden h-10 items-center gap-2 whitespace-nowrap text-[15px] font-semibold text-[#111111] transition-colors hover:text-[#0B2F2A] min-[1440px]:flex">
            <Phone className="h-4 w-4 text-[#D4AF37]" strokeWidth={2.2} />
            {PHONE_DISPLAY}
          </a>
          <BasketButton onOpen={openQuiz} />
          <PriceCta onClick={openQuiz} small className="max-xl:hidden" />
          <WhatsAppCta href={waHref} source="header_desktop" small />
        </div>

        {/* Telemóvel: telefone e cesto leves, WhatsApp em destaque, menu */}
        <div className="flex shrink-0 items-center lg:hidden">
          <a href={`tel:${PHONE_TEL}`} data-tracking-source="header_mobile" aria-label="Ligar" className="grid h-11 w-10 min-w-0 touch-manipulation place-items-center text-[#0B2F2A] active:opacity-60">
            <Phone className="h-[19px] w-[19px]" strokeWidth={2} />
          </a>
          <BasketButton onOpen={openQuiz} className="!w-10 !min-w-0" />
          <a href={waHref} target="_blank" rel="noopener noreferrer" data-tracking-source="header_mobile" aria-label="WhatsApp" className="grid h-11 w-11 min-w-0 touch-manipulation place-items-center active:opacity-80">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#188344,#13753b)] text-white shadow-[0_5px_14px_-6px_rgba(6,27,19,0.5)]"><MessageCircle className="h-[18px] w-[18px]" strokeWidth={2.2} /></span>
          </a>

          <Sheet open={mobileMenuOpen} onOpenChange={open => { if (open) void loadServiceList(); setMobileMenuOpen(open); }}>
            <SheetTrigger asChild>
              <button type="button" aria-label="Menu" className="flex h-11 w-11 min-w-0 flex-col items-center justify-center gap-[6px] active:opacity-60">
                <span className="block h-[2px] w-[22px] rounded-full bg-[#111111]" />
                <span className="block h-[2px] w-[22px] rounded-full bg-[#111111]" />
                <span className="block h-[2px] w-[14px] self-center rounded-full bg-[#D4AF37]" style={{ marginLeft: 8 }} />
              </button>
            </SheetTrigger>

            <SheetContent side="right" tabIndex={-1} onOpenAutoFocus={e => { e.preventDefault(); (e.currentTarget as HTMLElement).focus(); }} className="flex w-[88vw] max-w-[360px] flex-col gap-0 rounded-none outline-none border-l-0 bg-[#0B2F2A] p-0 text-white [&>button]:text-white [&>button]:opacity-80">
              <SheetHeader className="border-b border-white/10 px-5 pb-3.5 pt-4">
                <SheetTitle className="text-left">
                  <Link to="/" onClick={closeMenu} className="block">
                    <span className="block font-playfair text-[19px] font-bold leading-none tracking-[-0.02em] text-white"><span className="text-[#D4AF37]">KYRO</span> Clean Solutions</span>
                    <span className="mt-2 flex items-center gap-1.5 text-xs font-normal text-white/75">
                      <span className="tracking-[0.1em] text-[#D4AF37]">★★★★★</span>{REVIEW_RATING} · +{REVIEW_COUNT} avaliações Google
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <nav aria-label="Menu" className="flex-1 overflow-y-auto px-5 pb-2 pt-3.5">
                <Suspense fallback={<PlainServices dark onNavigate={closeMenu} />}>
                  <HeaderServiceList dark onNavigate={closeMenu} />
                </Suspense>
                <div className="mt-3 grid grid-cols-2 border-t border-white/10 pt-1.5">
                  <Link to="/guia-de-packs" onClick={closeMenu} className="flex min-h-11 items-center text-[16px] font-medium text-white">Packs</Link>
                  <button type="button" onClick={goToReviews} className="flex min-h-11 items-center text-[16px] font-medium text-white">Testemunhos</button>
                  <Link to="/blog" onClick={closeMenu} className="flex min-h-11 items-center text-[16px] font-medium text-white">Blog</Link>
                  <Link to={FAQ_PATH} onClick={closeMenu} className="flex min-h-11 items-center text-[16px] font-medium text-white">Perguntas</Link>
                </div>
              </nav>

              <div className="space-y-2 border-t border-white/10 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
                <WhatsAppCta href={waHref} source="header_mobile_menu" />
                <PriceCta onClick={() => { closeMenu(); openQuiz(); }} />
                <a href={`tel:${PHONE_TEL}`} data-tracking-source="header_mobile_menu" onClick={closeMenu}
                  className="flex min-h-11 w-full items-center justify-center gap-2 text-sm text-white/80">
                  <Phone className="h-4 w-4 text-[#D4AF37]" strokeWidth={2} />
                  Ligar {PHONE_DISPLAY}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>

    <QuizForm
      isOpen={isQuizOpen}
      onClose={closeQuiz}
      initialLocation={quizLocation}
      initialService={quizService}
    />
    </>
  );
};

export default Header;
