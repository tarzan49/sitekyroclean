import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getCityLinksForService } from "@/data/locationSeoData";

interface ServiceAreaLinksProps {
  serviceSlug: string;
  serviceName: string;
}

const ServiceAreaLinks = ({ serviceSlug, serviceName }: ServiceAreaLinksProps) => {
  const cityLinks = getCityLinksForService(serviceSlug);

  return (
    <section className="py-10 md:py-14 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg md:text-xl font-bold text-[#1A1A2E] mb-4 text-center">
            {serviceName} por localidade
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {cityLinks.map(city => (
              <Link
                key={city.name}
                to={city.path}
                className="inline-flex items-center gap-1.5 bg-card px-3 py-2 rounded-lg text-xs md:text-sm font-medium text-[#1A1A2E] border border-border/30 hover:border-gold/30 hover:bg-gold/5 transition-all duration-200"
              >
                <MapPin className="w-3 h-3 text-gold flex-shrink-0" />
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceAreaLinks;
