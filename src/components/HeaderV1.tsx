import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, useNavigate, useLocation } from "react-router-dom";
import kyroLogo from "@/assets/kyro-logo.webp";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { trackCallClick } from "@/lib/analytics";
import QuizForm from "./QuizFormLazy";
import { useQuizLocation, useQuizService } from "@/context/QuizLocationContext";

interface HeaderProps {
  onOpenQuiz?: () => void;
}

type NavLinkHome     = { type: 'home';     label: string };
type NavLinkServices = { type: 'services'; label: string };
type NavLinkAnchor   = { type: 'anchor';   label: string; anchor: string };
type NavLinkRoute    = { type: 'link';     label: string; to: string; mobileOnly?: boolean };
type NavLink = NavLinkHome | NavLinkServices | NavLinkAnchor | NavLinkRoute;

const Header = ({ onOpenQuiz }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const quizLocation = useQuizLocation();
  const quizService = useQuizService();

  const openQuiz = () => {
    window.dispatchEvent(new CustomEvent('quizOpened'));
    sessionStorage.setItem('hasClickedQuote', '1');
    setIsQuizOpen(true);
  };

  const serviceLinks = [
    { to: '/limpeza-sofas', label: 'Sofás' },
    { to: '/limpeza-colchoes', label: 'Colchões' },
    { to: '/limpeza-tapetes', label: 'Tapetes' },
    { to: '/limpeza-alcatifas', label: 'Alcatifas' },
    { to: '/limpeza-cadeiras', label: 'Cadeiras' },
    { to: '/impermeabilizacao', label: 'Impermeabilização' },
    { to: '/antes-depois-limpeza', label: 'Antes e Depois' },
  ];

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);

    if (location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
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

  const isHomePage = location.pathname === "/";
  const isServicePage = serviceLinks.some(s => location.pathname === s.to);

  const navLinks: NavLink[] = [
    { type: 'home',     label: t('header.nav.home', 'INÍCIO') },
    { type: 'services', label: t('header.nav.servicesShort', 'SERVIÇOS') },
    { type: 'anchor',   anchor: 'como-funciona', label: 'COMO FUNCIONA' },
    { type: 'anchor',   anchor: 'testemunhos',   label: t('header.nav.testimonials', 'TESTEMUNHOS').toUpperCase() },
    { type: 'link',     label: 'FAQ',       to: '/perguntas-frequentes-limpeza-estofos' },
    { type: 'link',     label: 'GLOSSÁRIO', to: '/glossario-limpeza-estofos', mobileOnly: true },
    { type: 'link',     label: 'BLOG',      to: '/blog' },
  ];

  return (
    <>
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
    >
      {/* Main Navigation - Velour Garments Style */}
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        
        {/* LEFT: Menu Button (Mobile) / Nav (Desktop) */}
        <div className="flex items-center">
          {/* Mobile Menu Trigger - Clean hamburger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button
                className="flex flex-col justify-center items-center w-12 h-12 -ml-2"
                aria-label="Menu"
              >
                <span className="block w-5 h-[1.5px] bg-[#0d3c47] mb-1"></span>
                <span className="block w-5 h-[1.5px] bg-[#0d3c47] mb-1"></span>
                <span className="block w-5 h-[1.5px] bg-[#0d3c47]"></span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] max-w-[90vw] p-0 flex flex-col">
              <SheetHeader className="p-5 border-b">
                <SheetTitle className="text-left">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <img
                      src={kyroLogo}
                      alt="Kyro Clean Solutions"
                      width={40}
                      height={40}
                      className="h-10 w-auto object-contain"
                      loading="lazy"
                    />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              
              {/* Mobile Navigation Links */}
              <nav className="flex-1 flex flex-col p-4 gap-1">
                {navLinks.map((link, index) => (
                  link.type === 'home' ? (
                    <button
                      key={index}
                      onClick={scrollToTop}
                      className={`text-left text-base font-medium transition-colors py-4 px-4 rounded-lg min-h-[52px] ${
                        isHomePage 
                          ? 'text-[#0d3c47] bg-[#0d3c47]/5 border-l-2 border-[#beb47d]' 
                          : 'text-[#0d3c47]/80 hover:text-[#0d3c47] hover:bg-[#0d3c47]/5 active:bg-[#0d3c47]/10'
                      }`}
                    >
                      {link.label}
                    </button>
                  ) : link.type === 'services' ? (
                    <div key={index}>
                      <button
                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                        className={`w-full text-left text-base font-medium transition-colors py-4 px-4 rounded-lg min-h-[52px] flex items-center justify-between ${
                          isServicePage 
                            ? 'text-[#0d3c47] bg-[#0d3c47]/5 border-l-2 border-[#beb47d]' 
                            : 'text-[#0d3c47]/80 hover:text-[#0d3c47] hover:bg-[#0d3c47]/5 active:bg-[#0d3c47]/10'
                        }`}
                      >
                        {link.label}
                        <ChevronDown className={`h-4 w-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {mobileServicesOpen && (
                        <div className="pl-4 space-y-1 mt-1">
                          {serviceLinks.map((service) => (
                            <Link
                              key={service.to}
                              to={service.to}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center text-sm font-medium transition-colors py-3 px-4 rounded-lg min-h-[48px] ${
                                location.pathname === service.to 
                                  ? 'text-[#0d3c47] bg-[#beb47d]/20' 
                                  : 'text-[#0d3c47]/70 hover:text-[#0d3c47] hover:bg-[#0d3c47]/5'
                              }`}
                            >
                              {service.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : link.type === 'anchor' ? (
                    <button
                      key={index}
                      onClick={() => scrollToSection(link.anchor)}
                      className="text-left text-base font-medium transition-colors py-4 px-4 rounded-lg min-h-[52px] text-[#0d3c47]/80 hover:text-[#0d3c47] hover:bg-[#0d3c47]/5 active:bg-[#0d3c47]/10"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={index}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-left text-base font-medium transition-colors py-4 px-4 rounded-lg min-h-[52px] ${
                        location.pathname === link.to
                          ? 'text-[#0d3c47] bg-[#0d3c47]/5 border-l-2 border-[#beb47d]'
                          : 'text-[#0d3c47]/80 hover:text-[#0d3c47] hover:bg-[#0d3c47]/5 active:bg-[#0d3c47]/10'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </nav>

              {/* Mobile CTA - Quiz + Phone */}
              <div className="p-4 border-t space-y-2">
                <div className="relative group w-full">
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                  <button
                    onClick={() => { setMobileMenuOpen(false); openQuiz(); }}
                    className={[
                      'relative w-full rounded-full font-bold text-[#12121e] touch-manipulation',
                      'py-4 px-6 text-base',
                      'bg-gradient-to-r from-[#C9A84C] via-[#EDD96A] to-[#C9A84C]',
                      'shadow-[0_6px_22px_rgba(201,168,76,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                      'active:scale-[0.95] transition-all duration-150 animate-cta-glow',
                    ].join(' ')}
                  >
                    <span className="tracking-wide">Pedir orçamento rápido</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-8">
            {navLinks.map((link, index) => (
              link.type === 'home' ? (
                <button 
                  key={index}
                  onClick={scrollToTop} 
                  className={`relative text-sm font-medium transition-colors tracking-wide ${
                    isHomePage ? 'text-[#0d3c47]' : 'text-[#0d3c47]/70 hover:text-[#0d3c47]'
                  }`}
                >
                  {link.label}
                  {isHomePage && (
                    <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-[#beb47d]" />
                  )}
                </button>
              ) : link.type === 'services' ? (
                <HoverCard openDelay={0} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <Link 
                      to="/#servicos"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('servicos');
                      }}
                      className={`relative text-sm font-medium transition-colors tracking-wide flex items-center gap-1 ${
                        isServicePage ? 'text-[#0d3c47]' : 'text-[#0d3c47]/70 hover:text-[#0d3c47]'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className="h-3 w-3" />
                      {isServicePage && (
                        <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-[#beb47d]" />
                      )}
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-48 p-2" align="start">
                    <div className="flex flex-col gap-1">
                      {serviceLinks.map((service) => (
                        <Link
                          key={service.to}
                          to={service.to}
                          className={`text-sm px-3 py-2 rounded-md transition-colors ${
                            location.pathname === service.to 
                              ? 'bg-[#beb47d]/20 text-[#0d3c47] font-medium' 
                              : 'text-[#0d3c47]/80 hover:bg-[#0d3c47]/5 hover:text-[#0d3c47]'
                          }`}
                        >
                          {service.label}
                        </Link>
                      ))}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : link.type === 'anchor' ? (
                <button
                  key={index}
                  onClick={() => scrollToSection(link.anchor)}
                  className="relative text-sm font-medium transition-colors tracking-wide text-[#0d3c47]/70 hover:text-[#0d3c47]"
                >
                  {link.label}
                </button>
              ) : link.mobileOnly ? null : (
                <Link
                  key={index}
                  to={link.to}
                  className={`relative text-sm font-medium transition-colors tracking-wide ${
                    location.pathname === link.to ? 'text-[#0d3c47]' : 'text-[#0d3c47]/70 hover:text-[#0d3c47]'
                  }`}
                >
                  {link.label}
                  {location.pathname === link.to && (
                    <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-[#beb47d]" />
                  )}
                </Link>
              )
            ))}
          </nav>
        </div>

        {/* CENTER: Logo */}
        <Link 
          to="/" 
          onClick={(e) => {
            if (location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="absolute left-1/2 -translate-x-1/2 flex items-center"
        >
          <img 
            src={kyroLogo} 
            alt="Kyro Clean Solutions Logo"
            width={40}
            height={40}
            className="h-8 md:h-10 w-auto object-contain"
            loading="eager" 
            decoding="async" 
            fetchPriority="high" 
          />
        </Link>

        {/* RIGHT: CTA + Language Selector */}
        <div className="flex items-center gap-3">
          {/* Desktop CTA Button */}
          <div className="relative group hidden md:block">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
            <button
              onClick={openQuiz}
              className={[
                'relative rounded-full font-bold text-[#12121e] touch-manipulation',
                'px-5 py-2 text-sm',
                'bg-gradient-to-r from-[#C9A84C] via-[#EDD96A] to-[#C9A84C]',
                'shadow-[0_6px_22px_rgba(201,168,76,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                'hover:shadow-[0_10px_32px_rgba(201,168,76,0.60),0_4px_10px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.36)]',
                'hover:scale-[1.025] active:scale-[0.95]',
                'active:shadow-[0_2px_8px_rgba(201,168,76,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
                'transition-all duration-150 animate-cta-glow',
              ].join(' ')}
            >
              <span className="tracking-wide">{t('hero.newYear.ctaPrimary', 'Pedir orçamento rápido')}</span>
            </button>
          </div>


        </div>
      </div>
    </header>

    <QuizForm isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} initialLocation={quizLocation} initialService={quizService} />
    </>
  );
};

export default Header;
