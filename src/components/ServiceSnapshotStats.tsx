import type { ComponentType, CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

// Mais permissivo que `LucideIcon` de propósito: o bloco da avaliação Google
// (2026-09-09) usa o logótipo "G" a cores reais (GoogleG.tsx), não um ícone
// Lucide de traço único — precisa de aceitar `style`/`strokeWidth` mesmo sem
// os usar, só para poder ser passado no mesmo campo `icon` sem o chamador
// (este componente) ter de distinguir os dois casos.
type StatIcon = LucideIcon | ComponentType<{ className?: string; style?: CSSProperties; strokeWidth?: number }>;

export interface SnapshotStat {
  value: string;
  label: string;
  icon: StatIcon;
}

/** Premium 4-stat strip shown right below the hero on Localidade/Freguesia/Variante
 * pages (avaliação Google, preço desde, duração do serviço, tempo de resposta —
 * conteúdo revisto 2026-09-09, ver nota em cada página que constrói o array).
 * Compact four-column strip on mobile and desktop.
 * Transparent by design: the caller wraps this together with the hero inside one
 * shared photo-background container so the image reads as one continuous shot,
 * not a re-cropped copy. */
const ServiceSnapshotStats = ({ stats }: { stats: SnapshotStat[] }) => {
  return (
    <section className="relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-4"
          style={{ gap: "1px", backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="min-w-0 py-4 md:py-9 px-1 md:px-3 text-center"
              style={{ borderTop: "2px solid rgba(212,175,55,0.55)" }}
            >
              <s.icon className="w-3.5 h-3.5 md:w-4 md:h-4 mx-auto mb-2 md:mb-2.5" style={{ color: "#D4AF37" }} strokeWidth={1.75} />
              <p className="font-playfair font-bold text-[18px] sm:text-2xl md:text-3xl leading-none mb-1.5" style={{ color: "#D4AF37" }}>
                {s.value}
              </p>
              <p className="text-[10px] leading-snug md:text-[10px] font-medium text-white/75 md:text-white/60 md:tracking-[0.22em] md:uppercase">
                <span className="md:hidden">{s.label.startsWith('Desde,') ? 'Desde' : s.label.startsWith('Orçamento,') ? 'Orçamento' : s.label.includes('avaliações Google') ? s.label.replace(' Google', '') : s.label === 'Resposta durante o horário de atendimento' ? 'Resposta no horário de atendimento' : s.label.startsWith('Respondemos em menos') ? 'Resposta' : s.label}</span>
                <span className="hidden md:inline">{s.label}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSnapshotStats;
