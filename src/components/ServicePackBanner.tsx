import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { packs, packCities, getFromPrice, getDefaultSelections, calcPackPrices, buildWhatsAppUrl } from "@/data/packComboData";
import { WHATSAPP_BASE } from "@/constants/business";

interface Props {
  packSlugs: string[];
  city?: string;
  variant?: "light" | "dark";
}

const ServicePackBanner = ({ packSlugs, city = "porto", variant = "light" }: Props) => {
  const light = variant === "light";
  const bg         = light ? "bg-[#FDFDF9]"          : "bg-kyro-green";
  const textMain   = light ? "text-[#111111]"         : "text-white";
  const textSub    = light ? "text-[#111111]/55"      : "text-white/55";

  const cityObj = packCities.find(c => c.slug === city) ?? packCities[0];
  const relevantPacks = packSlugs
    .map(slug => packs.find(p => p.slug === slug))
    .filter(Boolean) as typeof packs;

  if (!relevantPacks.length) return null;

  const gridCols = relevantPacks.length === 1
    ? "max-w-lg"
    : relevantPacks.length === 2
    ? "sm:grid-cols-2"
    : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className={`py-12 md:py-16 ${bg}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.85 }}>
              Packs com Desconto
            </p>
          </div>
          <h2 className={`font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] mb-3 ${textMain}`}>
            Aproveite a visita e{" "}
            <em className="not-italic" style={{ color: "#D4AF37" }}>poupe mais</em>
          </h2>
          <p className={`text-[15px] leading-relaxed max-w-xl ${textSub}`}>
            Segundo serviço na mesma visita: 10% de desconto automático e sem taxa extra de deslocação.
          </p>
        </div>

        {/* Cards */}
        <div className={`grid gap-3 md:gap-4 ${gridCols}`}>
          {relevantPacks.map(pack => {
            const defaults  = getDefaultSelections(pack);
            const prices    = calcPackPrices(pack, defaults);
            const fromPrice = getFromPrice(pack);
            const waUrl     = prices ? buildWhatsAppUrl(pack, cityObj, defaults, prices) : WHATSAPP_BASE;
            const isVip     = pack.id === 'sofa-impermeabilizacao';

            return (
              <div
                key={pack.id}
                className="overflow-hidden"
                style={{
                  background: light ? "#ffffff" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${light ? "#E8E4DE" : "rgba(255,255,255,0.10)"}`,
                  borderTop: "2px solid #D4AF37",
                }}
              >
                {/* Top row: nome à esquerda, poupança à direita */}
                <div className="flex items-start justify-between gap-4 p-5 md:p-6">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-playfair font-bold text-[1.05rem] leading-snug mb-2.5 ${textMain}`}>
                      {pack.name}
                    </h3>
                    {/* Serviços como pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {pack.selectors.map(sel => (
                        <span
                          key={sel.key}
                          className="text-[11px] px-2 py-0.5 rounded-full"
                          style={{
                            background: light ? "#F0EDE8" : "rgba(255,255,255,0.06)",
                            color: light ? "rgba(17,17,17,0.55)" : "rgba(255,255,255,0.55)",
                          }}
                        >
                          {sel.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Poupança */}
                  {prices && (
                    <div className="text-right flex-shrink-0">
                      <p className="font-playfair font-bold leading-none" style={{ fontSize: "1.75rem", color: "#D4AF37" }}>
                        {isVip ? `${fromPrice}€` : `−${prices.savings}€`}
                      </p>
                      <p className={`text-[11px] mt-1 ${textSub}`}>
                        {isVip ? (
                          "preço único"
                        ) : (
                          <><s>{prices.individualTotal}€</s>{" → "}{fromPrice}€</>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="px-5 pb-5 md:px-6 md:pb-6 flex flex-col gap-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 flex items-center justify-center gap-2 text-white font-semibold text-[13px] tracking-[0.14em] uppercase touch-manipulation transition-all active:scale-[0.98]"
                    style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.28)" }}
                  >
                    <MessageCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                    Quero este pack
                  </a>
                  <Link
                    to="/packs"
                    className={`text-xs text-center py-1.5 transition-colors hover:text-[#D4AF37] flex items-center justify-center gap-1 ${textSub}`}
                  >
                    Ver todos os packs <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ServicePackBanner;
