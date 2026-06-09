import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getCityLinksForService } from "@/data/locationSeoData";

interface Props {
  serviceSlug: string;
  serviceLabel: string;
}

const ServiceCityLinks = ({ serviceSlug, serviceLabel }: Props) => {
  const cityLinks = getCityLinksForService(serviceSlug);
  const words = serviceLabel.trim().split(" ");
  const goldWord = words.pop() ?? "";
  const restLabel = words.join(" ");

  return (
    <section className="py-14 md:py-20" style={{ backgroundColor: "#FDFDF9" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Editorial header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.85 }}>
              Cobertura Nacional
            </p>
          </div>
          <h2 className="font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] text-[#111111]">
            {restLabel}{" "}
            <em className="not-italic" style={{ color: "#D4AF37" }}>{goldWord}</em>
            {" "}em todo o país
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#111111]/55 max-w-xl">
            Servimos o Grande Porto, Lisboa e outras cidades. Selecione a sua localização para ver disponibilidade e preços.
          </p>
        </div>

        {/* City links */}
        <div className="flex flex-wrap gap-2">
          {cityLinks.map(city => (
            <Link
              key={city.name}
              to={city.path}
              className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
            >
              <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "#D4AF37" }} />
              {city.name}
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ServiceCityLinks;
