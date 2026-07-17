import type { LucideIcon } from "lucide-react";

export interface SnapshotStat {
  value: string;
  label: string;
  icon: LucideIcon;
}

/** Premium 4-stat strip shown right below the hero on Localidade/Freguesia/Variante
 * pages (5.0★, preço desde, zonas cobertas, tempo de resposta). Mobile-first 2×2 grid.
 * Transparent by design: the caller wraps this together with the hero inside one
 * shared photo-background container so the image reads as one continuous shot,
 * not a re-cropped copy. */
const ServiceSnapshotStats = ({ stats }: { stats: SnapshotStat[] }) => {
  return (
    <section className="relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ gap: "1px", backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="py-7 md:py-9 px-3 text-center"
              style={{ borderTop: "2px solid rgba(212,175,55,0.55)" }}
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
