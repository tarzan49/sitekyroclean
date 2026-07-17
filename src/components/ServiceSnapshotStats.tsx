import type { LucideIcon } from "lucide-react";

export interface SnapshotStat {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface ServiceSnapshotStatsProps {
  stats: SnapshotStat[];
  /** Optional hero photo continued behind the strip (same image as the hero above),
   * darkened enough to keep the gold numbers/labels fully legible. Falls back to a
   * flat dark green when omitted. */
  bgImage?: string;
}

/** Premium 4-stat strip shown right below the hero on Localidade/Freguesia/Variante
 * pages (5.0★, preço desde, zonas cobertas, tempo de resposta). Mobile-first 2×2 grid. */
const ServiceSnapshotStats = ({ stats, bgImage }: ServiceSnapshotStatsProps) => {
  return (
    <section className="relative border-b border-white/5 overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundColor: "#071a12" }} aria-hidden="true" />
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(7,26,18,0.88)" }} aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ gap: "1px", backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="py-7 md:py-9 px-3 text-center"
              style={{ backgroundColor: "rgba(7,26,18,0.55)", borderTop: "2px solid rgba(212,175,55,0.55)" }}
            >
              <s.icon className="w-4 h-4 mx-auto mb-2.5" style={{ color: "#D4AF37" }} strokeWidth={1.75} />
              <p className="font-playfair font-bold text-2xl md:text-3xl leading-none mb-1.5" style={{ color: "#D4AF37" }}>
                {s.value}
              </p>
              <p className="text-[9px] md:text-[10px] font-medium text-white/45 tracking-[0.22em] uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSnapshotStats;
