import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, MessageCircle, Tag } from "lucide-react";
import { packs, packCities, getFromPrice, getDefaultSelections, calcPackPrices, buildWhatsAppUrl } from "@/data/packComboData";
import { WHATSAPP_BASE } from "@/constants/business";

interface Props {
  packSlugs: string[];
  city?: string;
}

const CHECKER = {
  background: "#071a12",
  backgroundImage: [
    "linear-gradient(45deg,rgba(212,175,55,0.04) 25%,transparent 25%)",
    "linear-gradient(-45deg,rgba(212,175,55,0.04) 25%,transparent 25%)",
    "linear-gradient(45deg,transparent 75%,rgba(212,175,55,0.04) 75%)",
    "linear-gradient(-45deg,transparent 75%,rgba(212,175,55,0.04) 75%)",
  ].join(","),
  backgroundSize: "28px 28px",
  backgroundPosition: "0 0,0 14px,14px -14px,-14px 0px",
};

const ServicePackBanner = ({ packSlugs, city = "porto" }: Props) => {
  const cityObj = packCities.find(c => c.slug === city) ?? packCities[0];

  const relevantPacks = packSlugs
    .map(slug => packs.find(p => p.slug === slug))
    .filter(Boolean) as typeof packs;

  if (!relevantPacks.length) return null;

  return (
    <section className="relative py-14 md:py-20 overflow-hidden" style={CHECKER}>
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(600px,100vw)] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(212,175,55,0.08) 0%,transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-gold/10 text-gold border border-gold/25 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            <Tag className="w-3 h-3" />
            Packs com Desconto, 20% off
          </span>
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-2">
            Complete com um Pack e Poupe Mais
          </h2>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Ao adicionar outro serviço na mesma visita, tem 20% de desconto imediato.
            Reserve directamente via WhatsApp, respondemos em menos de 15 min.
          </p>
        </div>

        {/* Pack cards */}
        <div className={`grid gap-5 ${relevantPacks.length === 1 ? "max-w-sm mx-auto" : relevantPacks.length === 2 ? "sm:grid-cols-2 max-w-2xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"}`}>
          {relevantPacks.map(pack => {
            const defaults = getDefaultSelections(pack);
            const prices = calcPackPrices(pack, defaults);
            const fromPrice = getFromPrice(pack);
            const waUrl = prices ? buildWhatsAppUrl(pack, cityObj, defaults, prices) : WHATSAPP_BASE;
            const savingsLabel = pack.id === 'sofa-impermeabilizacao' ? 'Preço VIP' : 'Poupe 20%';

            return (
              <div
                key={pack.id}
                className="relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:border-gold/40 hover:shadow-[0_8px_40px_rgba(212,175,55,0.12)]"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)" }}
              >
                {/* Gold top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg,transparent,#D4AF37,transparent)" }} />

                <div className="p-6 flex flex-col flex-1">
                  {/* Badge + name */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-playfair font-bold text-white text-lg leading-tight pr-3">{pack.name}</h3>
                    <span className="flex-shrink-0 text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-full border text-green-300 bg-green-900/30 border-green-500/30 whitespace-nowrap">
                      {savingsLabel}
                    </span>
                  </div>

                  {/* Services list */}
                  <ul className="space-y-1.5 mb-5">
                    {pack.selectors.map(sel => (
                      <li key={sel.key} className="flex items-center gap-2 text-sm text-white/60">
                        <CheckCircle className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                        {sel.label}
                      </li>
                    ))}
                  </ul>

                  {/* Pricing block */}
                  {prices && (
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 mb-5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/35">Individual</span>
                        <span className="text-sm text-white/30 line-through tabular-nums">{prices.individualTotal}€</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gold">Pack</span>
                        <span className="font-playfair text-xl font-bold text-gold tabular-nums">{fromPrice}€</span>
                      </div>
                      <p className="text-right text-[10px] text-green-400 font-bold mt-0.5">
                        Poupa {prices.savings}€ ({prices.savingsPct}%)
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-auto flex flex-col gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-11 flex items-center justify-center gap-2 font-bold text-white transition-all active:scale-[0.98] touch-manipulation"
                      style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.25)" }}
                    >
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Falar por WhatsApp</span>
                    </a>
                    <Link
                      to={`/${pack.slug}-${city}`}
                      className="w-full h-9 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-white/50 hover:text-white/80 border border-white/[0.08] hover:border-white/20 transition-all"
                    >
                      Ver detalhes do pack <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom link */}
        <div className="text-center mt-8">
          <Link
            to="/packs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-gold transition-colors"
          >
            Ver todos os packs disponíveis <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicePackBanner;
