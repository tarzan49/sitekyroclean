import { Star } from "lucide-react";
import ServiceSchedulingBar from "./ServiceSchedulingBar";

import sofaD        from "@/assets/service-sofa-new.webp";
import sofaM        from "@/assets/service-sofa-new-mobile.webp";
import mattressD    from "@/assets/service-mattress-branded.webp";
import mattressM    from "@/assets/service-mattress-branded-mobile.webp";
import chairsD      from "@/assets/service-chairs-new.webp";
import chairsM      from "@/assets/service-chairs-new-mobile.webp";
import carpetD      from "@/assets/service-carpet-new.webp";
import carpetM      from "@/assets/service-carpet-new-mobile.webp";
import rugsD        from "@/assets/service-rugs-new.webp";
import rugsM        from "@/assets/service-rugs-new-mobile.webp";
import waterproofD  from "@/assets/hero-waterproofing.webp";
import waterproofM  from "@/assets/hero-waterproofing-mobile.webp";

const HERO_IMAGES: Record<string, { d: string; m: string }> = {
  "limpeza-sofas":     { d: sofaD,       m: sofaM },
  "limpeza-colchoes":  { d: mattressD,   m: mattressM },
  "limpeza-cadeiras":  { d: chairsD,     m: chairsM },
  "limpeza-tapetes":   { d: carpetD,     m: carpetM },
  "limpeza-alcatifas": { d: rugsD,       m: rugsM },
  "impermeabilizacao": { d: waterproofD, m: waterproofM },
};

interface ServiceHeroProps {
  badge?: string;
  title: string;
  subtitle: string;
  serviceSlug: string;
}

const ServiceHero = ({
  badge = "Especialistas em Higienização Profunda",
  title,
  subtitle,
  serviceSlug,
}: ServiceHeroProps) => {
  const imgs = HERO_IMAGES[serviceSlug];

  return (
    <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden min-h-[540px] md:min-h-[620px] flex items-end">

      {/* ── Full-bleed background image, mobile version below 768px ── */}
      {imgs && (
        <picture className="absolute inset-0 w-full h-full" aria-hidden="true">
          <source media="(max-width: 767px)" srcSet={imgs.m} type="image/webp" />
          <source media="(min-width: 768px)" srcSet={imgs.d} type="image/webp" />
          <img
            src={imgs.d}
            alt={title}
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </picture>
      )}

      {/* ── Gradient overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl">

          <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>
            {badge}
          </p>

          <h1 className="font-playfair text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
            {title}
          </h1>

          <p className="text-sm md:text-base text-white/70 max-w-xl leading-relaxed mb-6">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />
                ))}
              </div>
              <span className="text-white font-bold text-sm">5.0</span>
              <span className="text-white/50 text-xs">Google</span>
            </div>
            <div className="h-3.5 w-px bg-white/20" />
            <span className="text-white/55 text-xs font-medium">50+ avaliações</span>
            <div className="h-3.5 w-px bg-white/20" />
            <span className="text-white/55 text-xs font-medium">+1000 clientes</span>
          </div>

          <ServiceSchedulingBar serviceSlug={serviceSlug} />
        </div>
      </div>
    </section>
  );
};

export default ServiceHero;
