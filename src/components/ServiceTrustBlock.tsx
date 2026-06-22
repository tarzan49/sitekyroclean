import { Star, ExternalLink, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SERVICE_TRUST_POOL, type TrustPoint } from "@/constants/serviceTrustPool";
import { GOOGLE_REVIEWS_SHORT_URL } from "@/constants/google";

interface Props {
  serviceSlug: string;
  variant?: 0 | 1 | 2;
  /** false = compacto (sem desc), true = completo */
  fullDesc?: boolean;
  /** Se true, mostra botão colapsável em mobile abaixo do wrapper pai */
  mobileCollapsible?: boolean;
}

function Points({ points, fullDesc }: { points: TrustPoint[]; fullDesc: boolean }) {
  return (
    <>
      <div className="flex flex-col">
        {points.map((p, i) => (
          <div
            key={i}
            className="flex gap-4 py-4"
            style={{
              borderTop: "1px solid rgba(17,17,17,0.08)",
              borderLeft: "3px solid #D4AF37",
              paddingLeft: "14px",
            }}
          >
            <div className="flex-1 min-w-0">
              {p.stat && (
                <p className="font-playfair text-xl font-bold leading-none mb-1" style={{ color: "#D4AF37" }}>
                  {p.stat}
                </p>
              )}
              <p className="text-sm font-semibold leading-snug mb-0.5" style={{ color: "#111111" }}>
                {p.title}
              </p>
              {fullDesc && (
                <p className="text-[13px] leading-relaxed" style={{ color: "rgba(17,17,17,0.50)" }}>
                  {p.desc}
                </p>
              )}
            </div>
          </div>
        ))}
        <div style={{ borderTop: "1px solid rgba(17,17,17,0.08)" }} />
      </div>
      <a
        href={GOOGLE_REVIEWS_SHORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex mt-4 items-center gap-3 px-4 py-3 border transition-all hover:shadow-md group w-full"
        style={{ borderColor: "rgba(17,17,17,0.10)", background: "white" }}
      >
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />)}
        </div>
        <div className="h-3.5 w-px flex-shrink-0" style={{ background: "rgba(17,17,17,0.12)" }} />
        <span className="text-sm font-semibold" style={{ color: "#111111" }}>5.0</span>
        <span className="text-xs flex-1" style={{ color: "rgba(17,17,17,0.45)" }}>+60 avaliações · Deixar avaliação</span>
        <ExternalLink className="w-3 h-3 opacity-30 group-hover:opacity-60 transition-opacity flex-shrink-0" style={{ color: "#111111" }} />
      </a>
    </>
  );
}

/** Versão desktop (always visible, with full descriptions) */
export function ServiceTrustDesktop({ serviceSlug, variant = 0 }: Props) {
  const points = SERVICE_TRUST_POOL[serviceSlug]?.[variant] ?? [];
  if (!points.length) return null;
  return (
    <div className="mt-8">
      <Points points={points} fullDesc />
    </div>
  );
}

/** Versão mobile colapsável (compact, no descriptions) */
export function ServiceTrustMobile({ serviceSlug, variant = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const points = SERVICE_TRUST_POOL[serviceSlug]?.[variant] ?? [];
  if (!points.length) return null;
  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 border transition-all"
        style={{ borderColor: "rgba(17,17,17,0.12)", background: "white" }}
      >
        <span className="text-sm font-semibold" style={{ color: "#111111" }}>Porquê escolher a Kyro Clean?</span>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200 flex-shrink-0"
          style={{ color: "#D4AF37", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="border-x border-b px-4 pt-4 pb-2" style={{ borderColor: "rgba(17,17,17,0.12)" }}>
          <Points points={points} fullDesc={false} />
        </div>
      )}
    </div>
  );
}
