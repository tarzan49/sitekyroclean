import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
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
import { useQuizLocation, useQuizService } from "@/context/QuizLocationContext";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { WHATSAPP_BASE } from "@/constants/business";

interface HeaderProps {
  onOpenQuiz?: () => void;
}

const serviceLinks = [
  { to: '/limpeza-sofas',    label: 'Sofás' },
  { to: '/limpeza-colchoes', label: 'Colchões' },
  { to: '/limpeza-tapetes',  label: 'Tapetes' },
  { to: '/limpeza-alcatifas',label: 'Alcatifas' },
  { to: '/limpeza-cadeiras', label: 'Cadeiras' },
  { to: '/impermeabilizacao',label: 'Impermeabilização' },
  { to: '/antes-depois-limpeza', label: 'Antes e Depois' },
];

const Header = ({ onOpenQuiz }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen]             = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const quizLocation = useQuizLocation();
  const quizService  = useQuizService();

  const openQuiz = () => {
    window.dispatchEvent(new CustomEvent('quizOpened'));
    sessionStorage.setItem('hasClickedQuote', '1');
    setIsQuizOpen(true);
  };

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
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent('Olá! Gostaria de pedir um orçamento para limpeza de estofos.')}`;

  // Shared nav label style
  const navItem = (active: boolean) =>
    `text-[11px] font-medium tracking-[0.16em] uppercase transition-colors ${
      active ? 'text-[#111111]' : 'text-[#111111]/45 hover:text-[#111111]'
    }`;

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#111111]/8">
      <div className="mx-auto px-5 md:px-8 max-w-7xl h-14 md:h-[60px] flex items-center justify-between gap-4">

        {/* ── LEFT: logo text ── */}
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
          }}
          className="font-playfair text-base md:text-[17px] font-normal text-[#111111] tracking-tight shrink-0 leading-none"
        >
          Kyro Clean Solutions
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

        {/* ── RIGHT: two outline buttons (desktop) ── */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <button
            onClick={openQuiz}
            className="border border-[#D4AF37] text-[#111111] text-[10px] font-semibold tracking-[0.18em] uppercase px-5 py-2.5 hover:bg-[#D4AF37]/6 transition-colors whitespace-nowrap"
          >
            Agendar limpeza
          </button>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('header_desktop')}
            className="border border-[#25D366] text-[#111111] text-[10px] font-semibold tracking-[0.18em] uppercase px-4 py-2.5 hover:bg-[#25D366]/6 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" strokeWidth={2} />
            WhatsApp
          </a>
        </div>

        {/* ── MOBILE: hamburger left + WA icon right ── */}
        <div className="flex items-center gap-2 md:hidden">
          {/* WhatsApp icon only */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('header_mobile')}
            className="border border-[#25D366] p-2 flex items-center justify-center"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" strokeWidth={2} />
          </a>

          {/* Hamburger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
                aria-label="Menu"
              >
                <span className="block w-5 h-px bg-[#111111]" />
                <span className="block w-5 h-px bg-[#111111]" />
                <span className="block w-3.5 h-px bg-[#111111] self-start" />
              </button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[270px] max-w-[90vw] p-0 flex flex-col rounded-none">
              <SheetHeader className="px-6 py-5 border-b border-[#111111]/8">
                <SheetTitle className="text-left">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <span className="font-playfair text-base font-normal text-[#111111] leading-none">
                      Kyro Clean Solutions
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex-1 flex flex-col px-4 py-4 gap-0.5 overflow-y-auto">
                <button
                  onClick={scrollToTop}
                  className="text-left text-[11px] font-medium tracking-[0.16em] uppercase text-[#111111]/50 hover:text-[#111111] py-4 px-3 transition-colors"
                >
                  Início
                </button>

                <div>
                  <button
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="w-full text-left text-[11px] font-medium tracking-[0.16em] uppercase text-[#111111]/50 hover:text-[#111111] py-4 px-3 flex items-center justify-between transition-colors"
                  >
                    Serviços
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileServicesOpen && (
                    <div className="pl-4 pb-2 space-y-0.5">
                      {serviceLinks.map(s => (
                        <Link
                          key={s.to}
                          to={s.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block text-[11px] tracking-[0.08em] uppercase py-3 px-3 transition-colors ${
                            location.pathname === s.to
                              ? 'text-[#111111]'
                              : 'text-[#111111]/40 hover:text-[#111111]'
                          }`}
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => scrollToSection('testemunhos')}
                  className="text-left text-[11px] font-medium tracking-[0.16em] uppercase text-[#111111]/50 hover:text-[#111111] py-4 px-3 transition-colors"
                >
                  Testemunhos
                </button>

                <Link
                  to="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[11px] font-medium tracking-[0.16em] uppercase text-[#111111]/50 hover:text-[#111111] py-4 px-3 transition-colors"
                >
                  Blog
                </Link>

                <Link
                  to="/perguntas-frequentes-limpeza-estofos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[11px] font-medium tracking-[0.16em] uppercase text-[#111111]/50 hover:text-[#111111] py-4 px-3 transition-colors"
                >
                  FAQ
                </Link>
              </nav>

              <div className="px-4 pb-6 pt-3 border-t border-[#111111]/8 space-y-2.5">
                <button
                  onClick={() => { setMobileMenuOpen(false); openQuiz(); }}
                  className="w-full border border-[#D4AF37] text-[#111111] text-[10px] font-semibold tracking-[0.18em] uppercase py-3.5 hover:bg-[#D4AF37]/6 transition-colors"
                >
                  Agendar limpeza
                </button>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('header_mobile_menu')}
                  className="w-full border border-[#25D366] text-[#111111] text-[10px] font-semibold tracking-[0.18em] uppercase py-3.5 hover:bg-[#25D366]/6 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" strokeWidth={2} />
                  WhatsApp
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>

    <QuizForm
      isOpen={isQuizOpen}
      onClose={() => setIsQuizOpen(false)}
      initialLocation={quizLocation}
      initialService={quizService}
    />
    </>
  );
};

export default Header;
