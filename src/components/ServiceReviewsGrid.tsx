import { Star, BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { pickReviewSubset, type PoolReview } from "@/data/reviewsPool";
import { GoogleG } from "@/components/icons/GoogleG";

interface Props {
  serviceSlug: string;
  /** Identifica a página de forma estável (cidade/freguesia/material/
   *  problema) para escolher sempre o mesmo conjunto de 6 avaliações nessa
   *  página, mas conjuntos diferentes em páginas diferentes. */
  seed: string;
  /** Título da secção — por omissão "Avaliações reais". Passar "" omite o
   *  cabeçalho interno (quando a página já tem o seu próprio SectionHeader). */
  heading?: string;
}

function ReviewCard({ r }: { r: PoolReview }) {
  return (
    <div
      className="flex flex-col p-5 rounded-xl bg-white transition-all duration-200 hover:-translate-y-0.5 h-full"
      style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.05)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, s) => (
            <Star key={s} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />
          ))}
        </div>
        <GoogleG className="w-4 h-4 flex-shrink-0 opacity-70" />
      </div>
      <p className="text-[13.5px] leading-relaxed text-[#111111]/70 flex-1 mb-4">"{r.text}"</p>
      <div className="flex items-center gap-2.5 pt-3" style={{ borderTop: "1px solid rgba(17,17,17,0.06)" }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0d3324, #071a12)" }}
        >
          {r.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-xs font-bold text-[#111111] truncate">{r.name}</p>
            <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D4AF37" }} />
          </div>
          <p className="text-[10px] text-[#111111]/40">{r.city ? `${r.city} · ` : ''}Avaliação Google verificada</p>
        </div>
      </div>
    </div>
  );
}

/** Grelha de 6 avaliações do serviço, escolhidas de um pool maior por seed
 *  (ver src/data/reviewsPool.ts) — usado em todas as páginas de serviço/
 *  freguesia/localidade/preço/material/problema.
 *
 *  Em mobile (abaixo de `sm`) mostra-se como carrossel a deslizar sozinho em
 *  loop, igual ao da homepage (TestimonialsV1.tsx) — pedido explícito
 *  2026-09-09: "nas avaliacoes n faz sentido estar assim em mobile... em vez
 *  de tar assim colocas as avaliacoes como estao na homepage, a deslizar
 *  para o lado em loop... assim para o cliente a pagina n fica tao
 *  comprida" (a grelha antiga virava 1 coluna abaixo de `sm`, ficando com
 *  6 cartões inteiros empilhados, uma das páginas mais compridas do site
 *  em mobile). Tablet/desktop (`sm`+) mantêm a grelha estática como estava. */
export default function ServiceReviewsGrid({ serviceSlug, seed, heading = "Avaliações reais" }: Props) {
  const reviews = pickReviewSubset(serviceSlug, seed, 6);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const timer = setInterval(() => emblaApi.scrollNext(), 4500);
    return () => clearInterval(timer);
  }, [emblaApi]);

  if (!reviews.length) return null;

  return (
    <div>
      {heading && (
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
          <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.85 }}>{heading}</p>
        </div>
      )}

      {/* Mobile: carrossel a deslizar sozinho em loop */}
      <div className="sm:hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {reviews.map((r, i) => (
              <div key={i} className="flex-none w-full px-0.5">
                <ReviewCard r={r} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {reviews.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === selectedIndex ? 16 : 6,
                backgroundColor: i === selectedIndex ? "#D4AF37" : "rgba(17,17,17,0.15)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Tablet/desktop: grelha estática */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((r, i) => <ReviewCard key={i} r={r} />)}
      </div>
    </div>
  );
}
