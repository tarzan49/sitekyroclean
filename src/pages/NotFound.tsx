import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, Phone, ArrowRight, Sofa, BedDouble, Shield, BookOpen } from "lucide-react";
import { trackCallClick } from "@/lib/analytics";
import { PHONE_TEL, PHONE_DISPLAY } from "@/constants/business";

const popularPages = [
  { to: "/limpeza-sofas",    icon: Sofa,       label: "Limpeza de Sofás",    desc: "Extração profissional ao domicílio" },
  { to: "/limpeza-colchoes", icon: BedDouble,  label: "Limpeza de Colchões", desc: "Higienização e remoção de ácaros" },
  { to: "/impermeabilizacao",icon: Shield,     label: "Impermeabilização",   desc: "Essencial ou Premium, até 5 anos" },
  { to: "/blog",             icon: BookOpen,   label: "Blog",                desc: "Dicas e guias de manutenção" },
];

const NotFound = () => {
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, follow');
    return () => { robotsMeta?.setAttribute('content', 'index, follow'); };
  }, []);

  return (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
    style={{ background: "linear-gradient(160deg, #071a12 0%, #0B2F2A 55%, #0a2218 100%)" }}>

    {/* Dot grid */}
    <div className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

    {/* Ambient glows */}
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
      style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.10) 0%, transparent 70%)" }} />
    <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
      style={{ background: "radial-gradient(ellipse, rgba(26,78,48,0.25) 0%, transparent 70%)" }} />

    <div className="relative z-10 w-full max-w-2xl mx-auto text-center">

      {/* 404 */}
      <h1 className="font-playfair text-[8rem] md:text-[11rem] font-bold leading-none mb-2 select-none"
        style={{
          background: "linear-gradient(135deg, #B8912A 0%, #EDD96A 50%, #B8912A 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 40px rgba(212,175,55,0.35))",
        }}>
        404
      </h1>

      {/* Message */}
      <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-gold/70 mb-3">
        Página não encontrada
      </p>
      <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-3 leading-snug">
        Esta página foi limpa, e não deixou rasto.
      </h2>
      <p className="text-white/50 text-base max-w-md mx-auto mb-10 leading-relaxed">
        O endereço que procura não existe ou foi movido. Mas podemos ajudá-lo a encontrar o que precisa.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
        <Link to="/"
          className="flex items-center gap-2 bg-gradient-to-r from-[#B8912A] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#EDD96A] text-[#071a12] font-bold text-sm px-7 py-3.5 rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:shadow-[0_4px_28px_rgba(212,175,55,0.5)] transition-all active:scale-[0.97]">
          <Home className="w-4 h-4" />
          Voltar ao início
        </Link>
        <a href={`tel:${PHONE_TEL}`}
          onClick={() => trackCallClick('not_found_page')}
          className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-semibold text-sm px-7 py-3.5 rounded-full transition-all active:scale-[0.97] backdrop-blur-sm">
          <Phone className="w-4 h-4 text-gold" />
          {PHONE_DISPLAY}
        </a>
      </div>

      {/* Popular pages */}
      <p className="text-[10px] font-bold tracking-[0.28em] uppercase text-white/30 mb-5">
        Páginas populares
      </p>
      <div className="grid grid-cols-2 gap-3">
        {popularPages.map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to}
            className="group flex items-start gap-3 text-left p-4 rounded-2xl border border-white/8 hover:border-gold/30 transition-all"
            style={{ background: "rgba(11,47,42,0.55)", backdropFilter: "blur(12px)" }}>
            <span className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-gold/20 transition-colors">
              <Icon className="w-4 h-4 text-gold" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm leading-snug mb-0.5 group-hover:text-gold transition-colors">{label}</p>
              <p className="text-white/40 text-xs leading-snug">{desc}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-gold/60 flex-shrink-0 mt-1 ml-auto transition-all group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  </div>
  );
};

export default NotFound;
