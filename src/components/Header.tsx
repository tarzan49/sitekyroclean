import { buildGeneralWaMessage } from "@/lib/whatsappMessages";
import { useEffect, useState } from "react";
import { ChevronDown, MessageCircle, Phone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import QuizForm from "./QuizFormLazy";
import BasketButton from "./BasketButton";
import { useQuizLocation, useQuizService } from "@/context/QuizLocationContext";
import { WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";

const serviceLinks = [
  { to: '/limpeza-sofas',    label: 'Sofás' },
  { to: '/limpeza-colchoes', label: 'Colchões' },
  { to: '/limpeza-tapetes',  label: 'Tapetes' },
  { to: '/limpeza-alcatifas',label: 'Alcatifas' },
  { to: '/limpeza-cadeiras', label: 'Cadeiras' },
  { to: '/impermeabilizacao',label: 'Impermeabilização' },
];
// No menu do telemóvel: as 5 peças + os packs, aos pares, e a impermeabilização em linha inteira.
const mobileServiceLinks = [...serviceLinks.slice(0, 5), { to: '/guia-de-packs', label: 'Packs' }, serviceLinks[5]];

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

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { anchor: id } });
    }
  };

  const scrollToTop = () => {
    setMobileMenuOpen(false);
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const isServicePage = serviceLinks.some(s => location.pathname === s.to);
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage())}`;

  // Shared nav label style
  const navItem = (active: boolean) =>
    `text-[11px] font-medium tracking-[0.16em] uppercase transition-colors ${
      active ? 'text-[#111111]' : 'text-[#111111]/45 hover:text-[#111111]'
    }`;

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#111111]/8">
      <div className="mx-auto px-3 sm:px-5 md:px-8 max-w-7xl h-14 md:h-[60px] flex items-center justify-between gap-2 md:gap-4">

        {/* ── LEFT: logo text ── */}
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
          }}
          className="flex h-11 min-w-0 flex-1 items-center justify-start leading-none md:h-auto md:block md:flex-none md:text-left md:shrink-0"
        >
          {/* Marca com mais presença (dono, 24 Nov): nome inteiro numa linha, letra forte e escura, "Kyro" a dourado. */}
          <span className="inline-flex h-11 items-center whitespace-nowrap font-playfair text-[15px] min-[400px]:text-[17px] font-bold tracking-[-0.03em] text-[#111111] md:hidden">
            <span className="text-[#D4AF37]">KYRO</span>&nbsp;Clean Solutions
          </span>
          <span className="hidden font-playfair text-[21px] font-bold tracking-[-0.02em] text-[#111111] md:inline">
            <span className="text-[#D4AF37]">KYRO</span> Clean Solutions
          </span>
        </Link>

        {/* ── CENTER: desktop nav ── */}
        <nav className="hidden md:flex items-center gap-7 mx-auto">

          <button onClick={scrollToTop} className={navItem(location.pathname === '/')}>
            Início
          </button>

          <HoverCard openDelay={0} closeDelay={80}>
            <HoverCardTrigger asChild>
              <button
                onClick={() => scrollToSection('servicos')}
                className={`${navItem(isServicePage)} flex items-center gap-1`}
              >
                Serviços
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-44 p-1.5 rounded-none border border-[#111111]/10 shadow-lg" align="center">
              {serviceLinks.map(s => (
                <Link
                  key={s.to}
                  to={s.to}
                  className={`block text-[11px] tracking-[0.08em] uppercase px-3 py-2.5 transition-colors ${
                    location.pathname === s.to
                      ? 'text-[#111111] bg-[#D4AF37]/10'
                      : 'text-[#111111]/55 hover:text-[#111111] hover:bg-[#111111]/4'
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </HoverCardContent>
          </HoverCard>

          <button
            onClick={() => scrollToSection('testemunhos')}
            className={navItem(false)}
          >
            Testemunhos
          </button>

          <Link to="/blog" className={navItem(location.pathname === '/blog')}>
            Blog
          </Link>

          <Link
            to="/perguntas-frequentes-limpeza-estofos"
            className={navItem(location.pathname === '/perguntas-frequentes-limpeza-estofos')}
          >
            FAQ
          </Link>
        </nav>

        {/* ── RIGHT: three solid buttons (desktop) ── */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <BasketButton onOpen={openQuiz} className="h-10 w-10" />
          <a
            href={`tel:${PHONE_TEL}`}
            data-tracking-source="header_desktop"
            className="border border-[#D1D5DB] bg-[#E5E7EB] text-[#111111] text-[10px] font-semibold tracking-[0.18em] uppercase px-4 py-2.5 hover:bg-[#DDE0E4] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 text-[#555555] flex-shrink-0" strokeWidth={2} />
            Ligar
          </a>
          <button
            onClick={openQuiz}
            className="border border-[#D4AF37] bg-gradient-to-r from-[#202020] to-[#4A4A4A] text-white text-[10px] font-semibold tracking-[0.18em] uppercase px-5 py-2.5 hover:from-[#2A2A2A] hover:to-[#555555] transition-colors whitespace-nowrap"
          >
            Agendar limpeza
          </button>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            data-tracking-source="header_desktop"
            className="border border-[#25D366] bg-[#25D366] text-white text-[10px] font-semibold tracking-[0.18em] uppercase px-4 py-2.5 hover:bg-[#20BD5A] hover:border-[#20BD5A] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 text-white flex-shrink-0" strokeWidth={2} />
            WhatsApp
          </a>
        </div>

        {/* ── MOBILE: call, WhatsApp and menu controls on the right ── */}
        <div className="flex items-center gap-1 min-[400px]:gap-1.5 sm:gap-2 md:hidden shrink-0">
          <BasketButton onOpen={openQuiz} className="w-10 min-[400px]:w-11" />
          {/* Call icon only */}
          <a
            href={`tel:${PHONE_TEL}`}
            data-tracking-source="header_mobile"
            className="w-10 min-[400px]:w-11 h-11 border border-[#D1D5DB] bg-[#E5E7EB] flex items-center justify-center touch-manipulation transition-colors active:bg-[#DDE0E4]"
            aria-label="Ligar"
          >
            <Phone className="w-4 h-4 text-[#555555]" strokeWidth={2} />
          </a>

          {/* WhatsApp icon only */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            data-tracking-source="header_mobile"
            className="w-10 min-[400px]:w-11 h-11 border border-[#25D366] bg-[#25D366] flex items-center justify-center touch-manipulation transition-colors active:bg-[#20BD5A]"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-white" strokeWidth={2} />
          </a>

          {/* Hamburger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="flex flex-col justify-center items-center w-11 h-11 gap-[5px]"
                aria-label="Menu"
              >
                <span className="block w-5 h-px bg-[#111111]" />
                <span className="block w-5 h-px bg-[#111111]" />
                <span className="block w-5 h-px bg-[#111111]" />
              </button>
            </SheetTrigger>

            {/* Menu do telemóvel premium (dono, 24 Nov): verde escuro, letra grande, dourado só no essencial. */}
            <SheetContent side="left" className="w-[86vw] max-w-[340px] p-0 flex flex-col rounded-none border-r-0 bg-[#0c241a] text-white [&>button]:text-white [&>button]:opacity-80">
              <SheetHeader className="px-6 pt-5 pb-4 border-b border-white/10">
                <SheetTitle className="text-left">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block">
                    <span className="block font-playfair text-xl font-normal text-white leading-none">Kyro Clean Solutions</span>
                    <span className="mt-2 flex items-center gap-1.5 text-xs font-normal text-white/70">
                      <span className="text-[#D4AF37] tracking-[0.1em]">★★★★★</span>{REVIEW_RATING} · +{REVIEW_COUNT} avaliações Google
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex-1 overflow-y-auto px-6 pt-4 pb-2">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">Serviços</p>
                <div className="grid grid-cols-2 gap-2">
                  {mobileServiceLinks.map(s => {
                    const active = location.pathname === s.to;
                    return <Link key={s.to} to={s.to} onClick={() => setMobileMenuOpen(false)}
                      className={`${s.to === '/impermeabilizacao' ? 'col-span-2 ' : ''}flex min-h-11 items-center rounded-xl border px-3 text-[15px] font-medium transition-colors ${active ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white' : 'border-white/15 bg-white/[0.04] text-white/90 active:bg-white/10'}`}>
                      {s.label}
                    </Link>;
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-2">
                  <button onClick={() => scrollToSection('testemunhos')} className="flex min-h-11 items-center font-playfair text-[17px] text-white">Testemunhos</button>
                  <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center font-playfair text-[17px] text-white">Blog</Link>
                  <Link to="/perguntas-frequentes-limpeza-estofos" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center font-playfair text-[17px] text-white">FAQ</Link>
                </div>
              </nav>

              <div className="px-6 pb-5 pt-3 border-t border-white/10 space-y-2">
                <a href={waHref} target="_blank" rel="noopener noreferrer" data-tracking-source="header_mobile_menu"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(37,211,102,0.7)]">
                  <MessageCircle className="w-4 h-4" strokeWidth={2.2} />
                  Pedir preço no WhatsApp
                </a>
                <button onClick={() => { setMobileMenuOpen(false); openQuiz(); }}
                  className="flex min-h-12 w-full items-center justify-center rounded-xl border border-[#D4AF37] text-[15px] font-semibold text-[#D4AF37]">
                  Agendar limpeza
                </button>
                <a href={`tel:${PHONE_TEL}`} data-tracking-source="header_mobile_menu" onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-11 w-full items-center justify-center gap-2 text-sm text-white/75">
                  <Phone className="w-4 h-4" strokeWidth={2} />
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
