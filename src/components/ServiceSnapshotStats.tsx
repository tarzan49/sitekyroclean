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
 * Two-column strip on mobile; four columns on desktop.
 * Transparent by design: the caller wraps this together with the hero inside one
 * shared photo-background container so the image reads as one continuous shot,
 * not a re-cropped copy. */
const ServiceSnapshotStats = ({ stats }: { stats: SnapshotStat[] }) => {
  return (
    <section className="relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-2 py-2 md:grid-cols-4 md:gap-px md:py-0 md:bg-white/[0.08]"
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="min-w-0 px-3 py-4 text-center border-white/10 odd:border-r [&:nth-child(n+3)]:border-t md:odd:border-r-0 md:border-t-2 md:[&:nth-child(n+3)]:border-t-2 md:border-[#D4AF37]/55 md:py-9"
            >
              <div className="flex items-center justify-center gap-2 mb-1.5 md:block">
                <s.icon className="w-4 h-4 shrink-0 md:mx-auto md:mb-2.5" style={{ color: "#D4AF37" }} strokeWidth={1.75} />
                <p className="min-w-0 font-playfair font-semibold text-[22px] leading-tight text-white md:font-bold md:text-3xl md:leading-none md:text-[#D4AF37]">
                  {s.value.replace('<10min', '<10 min').replace('3 a 6h', '3 a 6 h')}
                </p>
              </div>
              <p className="text-xs leading-snug md:text-[10px] font-medium text-white/75 md:text-white/60 md:tracking-[0.22em] md:uppercase">
                <span className="md:hidden">{s.label.startsWith('Desde,') ? 'Desde' : s.label.startsWith('Orçamento,') ? 'Orçamento' : s.label === 'Pronto a usar' ? 'Secagem média' : s.label === 'Resposta durante o horário de atendimento' ? 'Resposta*' : s.label.startsWith('Respondemos em menos') ? 'Resposta' : s.label}</span>
                <span className="hidden md:inline">{s.label}</span>
              </p>
            </div>
          ))}
        </div>
        {stats.some(s => s.label === 'Resposta durante o horário de atendimento') && (
          <p className="md:hidden text-center text-[10px] leading-relaxed text-white/65 pb-3 pt-1">*Durante o horário de atendimento.</p>
        )}
      </div>
    </section>
  );
};

export default ServiceSnapshotStats;
