import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getCityLinksForService } from "@/data/locationSeoData";

interface Props {
  serviceSlug: string;
  serviceLabel: string;
}

const ServiceCityLinks = ({ serviceSlug, serviceLabel }: Props) => {
  const cityLinks = getCityLinksForService(serviceSlug);

  return (
    <section className="py-12 md:py-16 bg-[#FDFDF9]">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Cobertura</p>
            <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
          </div>
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-2">
            {serviceLabel} em todo o país
          </h2>
          <p className="text-sm text-[#1A1A2E]/55 mb-8 max-w-xl mx-auto">
            Servimos o Grande Porto, Lisboa e outras cidades. Selecione a sua localização para ver disponibilidade e preços.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {cityLinks.map(city => (
              <Link
                key={city.name}
                to={city.path}
                className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
              >
                <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "#D4AF37" }} />
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceCityLinks;
