import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, MessageCircle } from "lucide-react";
import { packs, packCities, getFromPrice, getDefaultSelections, calcPackPrices, buildWhatsAppUrl } from "@/data/packComboData";
import { WHATSAPP_BASE } from "@/constants/business";

interface Props {
  packSlugs: string[];
  city?: string;
  variant?: "light" | "dark";
}

const ServicePackBanner = ({ packSlugs, city = "porto", variant = "light" }: Props) => {
  const light = variant === "light";
  const cityObj = packCities.find(c => c.slug === city) ?? packCities[0];

  const relevantPacks = packSlugs
    .map(slug => packs.find(p => p.slug === slug))
    .filter(Boolean) as typeof packs;

  if (!relevantPacks.length) return null;

  return (
    <section className={`py-14 md:py-20 ${light ? "bg-[#FDFDF9]" : "bg-kyro-green"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Editorial header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.85 }}>
              Packs com Desconto
            </p>
          </div>
          <h2 className={`font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] mb-4 ${light ? "text-[#111111]" : "text-white"}`}>
            Complete com um Pack <em className="not-italic" style={{ color: "#D4AF37" }}>e Poupe Mais</em>
          </h2>
          <p className={`text-[15px] leading-relaxed max-w-2xl ${light ? "text-[#111111]/55" : "text-white/50"}`}>
            Ao adicionar outro serviço na mesma visita, tem 10% de desconto imediato.
            Reserve directamente via WhatsApp, respondemos em menos de 30 min.
          </p>
        </div>

        {/* Pack cards */}
        <div className={`grid gap-5 ${relevantPacks.length === 1 ? "max-w-sm mx-auto" : relevantPacks.length === 2 ? "sm:grid-cols-2 max-w-2xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"}`}>
          {relevantPacks.map(pack => {
            const defaults = getDefaultSelections(pack);
            const prices = calcPackPrices(pack, defaults);
            const fromPrice = getFromPrice(pack);
            const waUrl = prices ? buildWhatsAppUrl(pack, cityObj, defaults, prices) : WHATSAPP_BASE;
            const isVip = pack.id === 'sofa-impermeabilizacao';

            return (
              <div
                key={pack.id}
                className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/40 ${light ? "bg-white border border-[#E8E4DE]" : "bg-white/[0.04] border border-white/[0.10]"}`}
                style={{ borderTop: "2px solid #D4AF37" }}
              >
                <div className="p-6 md:p-7 flex flex-col flex-1">
                  {/* Name + tagline */}
                  <h3 className={`font-playfair font-bold text-lg leading-tight mb-1.5 ${light ? "text-[#111111]" : "text-white"}`}>{pack.name}</h3>
                  <p className={`text-[13px] leading-relaxed mb-6 ${light ? "text-[#111111]/55" : "text-white/55"}`}>
                    {pack.tagline}
                  </p>

                  {/* Savings hero */}
                  {prices && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-2" style={{ color: "#D4AF37", opacity: 0.85 }}>
                        {isVip ? "Preço Único · Numa Só Visita" : "Poupança neste pack"}
                      </p>
                      <p className="font-playfair text-4xl font-bold tabular-nums leading-none mb-2" style={{ color: "#D4AF37" }}>
                        {isVip ? `${fromPrice}€` : `Poupa ${prices.savings}€`}
                      </p>
                      <p className={`text-sm leading-relaxed ${light ? "text-[#111111]/55" : "text-white/55"}`}>
                        <span className="line-through tabular-nums">{prices.individualTotal}€</span>{" "}
                        <span className={`font-bold tabular-nums ${light ? "text-[#111111]" : "text-white"}`}>{fromPrice}€</span> em pack
                        {!isVip && <span> · {prices.savingsPct}% de desconto</span>}
                      </p>
                    </div>
                  )}

                  <div className="h-px w-full mb-6" style={{ backgroundColor: "#D4AF37", opacity: 0.18 }} />

                  {/* Services list */}
                  <ul className="space-y-1.5 mb-6">
                    {pack.selectors.map(sel => (
                      <li key={sel.key} className={`flex items-center gap-2 text-sm ${light ? "text-[#111111]/65" : "text-white/65"}`}>
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D4AF37" }} />
                        {sel.label}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto flex flex-col gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-11 flex items-center justify-center gap-2 font-bold text-white rounded-xl transition-all active:scale-[0.98] touch-manipulation"
                      style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.25)" }}
                    >
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Falar por WhatsApp</span>
                    </a>
                    <Link
                      to={`/${pack.slug}-${city}`}
                      className={`w-full h-9 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold border transition-all hover:border-[#D4AF37]/40 ${light ? "text-[#111111]/50 hover:text-[#111111] border-[#E8E4DE]" : "text-white/50 hover:text-white border-white/[0.10]"}`}
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
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-[#D4AF37] ${light ? "text-[#111111]/40" : "text-white/40"}`}
          >
            Ver todos os packs disponíveis <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicePackBanner;
