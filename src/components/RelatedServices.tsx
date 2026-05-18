import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/locationSeoData";

interface RelatedServicesProps {
  currentService: string;
}

// Map service key → slug from locationSeoData services array
const SERVICE_MAP: Record<
  string,
  { link: string; title: string; price: string; titleKey: string }
> = {
  sofas: {
    link: "/limpeza-sofas",
    title: "Limpeza de Sofás",
    price: "Desde 39€",
    titleKey: "services.items.sofas.title",
  },
  colchoes: {
    link: "/limpeza-colchoes",
    title: "Limpeza de Colchões",
    price: "Desde 39€",
    titleKey: "services.items.mattresses.title",
  },
  tapetes: {
    link: "/limpeza-tapetes",
    title: "Limpeza de Tapetes",
    price: "Desde 5€/m²",
    titleKey: "services.items.carpets.title",
  },
  cadeiras: {
    link: "/limpeza-cadeiras",
    title: "Limpeza de Cadeiras",
    price: "Desde 10€",
    titleKey: "services.items.chairs.title",
  },
  alcatifas: {
    link: "/limpeza-alcatifas",
    title: "Limpeza de Alcatifas",
    price: "Desde 3€/m²",
    titleKey: "services.items.rugs.title",
  },
  impermeabilizacao: {
    link: "/impermeabilizacao",
    title: "Impermeabilização",
    price: "Desde 25€",
    titleKey: "services.items.waterproofing.title",
  },
};

const ALL_KEYS = Object.keys(SERVICE_MAP);

const RelatedServices = ({ currentService }: RelatedServicesProps) => {
  const { t } = useTranslation();
  const related = ALL_KEYS.filter((k) => k !== currentService).slice(0, 4);

  return (
    <section className="py-12 md:py-16 bg-[#FDFDF9]">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-3" style={{ color: '#D4AF37' }}>
            Complete o Cuidado
          </p>
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#1A1A2E]">
            Aproveite a visita para tratar de mais peças
          </h2>
          <p className="text-[#1A1A2E]/50 text-sm mt-1.5">
            Incluímos tudo na mesma deslocação — sem custo adicional de transporte.
          </p>
          <div className="w-12 h-px mx-auto mt-3" style={{ backgroundColor: '#D4AF37', opacity: 0.4 }} />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
          {related.map((key) => {
            const svc = SERVICE_MAP[key];
            const dataService = services.find((s) => s.baseRoute === svc.link);
            return (
              <Link
                key={key}
                to={svc.link}
                className="group relative flex flex-col gap-2 bg-[#FFFFFF] rounded-2xl p-4 md:p-5 border border-[rgba(26,78,48,0.08)] hover:border-[#1a1a2e]/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Left accent line: purple premium on hover */}
                <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-gray-100 group-hover:bg-[#1a1a2e] transition-colors duration-300" />

                {/* Title */}
                <span className="text-sm font-semibold text-[#1A1A2E] leading-snug pl-3 group-hover:text-[#1a1a2e] transition-colors">
                  {t(svc.titleKey, svc.title)}
                </span>

                {/* Price */}
                <span className="text-xs font-bold text-gold pl-3">
                  {svc.price}
                </span>

                {/* Arrow */}
                <div className="flex items-center gap-1 pl-3 mt-auto">
                  <span className="text-[11px] text-[#1A1A2E]/40 group-hover:text-[#1a1a2e] transition-colors">
                    Saber mais
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#1A1A2E]/25 group-hover:text-[#1a1a2e] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RelatedServices;
