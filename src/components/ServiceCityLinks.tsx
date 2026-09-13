import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, MapPin, Search, X } from "lucide-react";
import { cities } from "@/data/locationSeoData";

interface Props {
  serviceSlug: string;
  serviceLabel: string;
}

const ServiceCityLinks = ({ serviceSlug, serviceLabel }: Props) => {
  const id = useId();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT").trim();
  const search = normalize(query);
  const regions = [
    { area: "porto", label: "Porto", hint: "Grande Porto e concelhos próximos" },
    { area: "braga", label: "Braga e Minho", hint: "Braga, Viana do Castelo e concelhos próximos" },
    { area: "lisboa", label: "Lisboa e Margem Sul", hint: "Lisboa, Cascais, Sintra e Setúbal" },
    { area: "algarve", label: "Algarve", hint: "De Aljezur a Vila Real de Santo António" },
  ].map(region => ({
    ...region,
    cities: cities.filter(city => city.area === region.area && normalize(city.name).includes(search))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-PT")),
  }));
  const resultCount = regions.reduce((total, region) => total + region.cities.length, 0);
  const words = serviceLabel.trim().split(" ");
  const goldWord = words.pop() ?? "";
  const restLabel = words.join(" ");

  return (
    <section className="py-14 md:py-20" style={{ backgroundColor: "#FDFDF9" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Editorial header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
            <p className="text-sm font-bold tracking-[0.08em] uppercase" style={{ color: "#D4AF37", opacity: 0.85 }}>
              Áreas de serviço
            </p>
          </div>
          <h2 className="type-section-title font-playfair      text-[#111111]">
            {restLabel}{" "}
            <em className="not-italic" style={{ color: "#D4AF37" }}>{goldWord}</em>
            {" "}perto de si
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#505650] max-w-xl">
            Escolha a sua região ou pesquise a localidade para consultar o serviço na sua zona.
          </p>
        </div>

        <div className="max-w-3xl">
          <label htmlFor={`${id}-search`} className="sr-only">Pesquisar localidade</label>
          <div className="relative mb-5">
            <Search aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#857443]" />
            <input
              id={`${id}-search`}
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Pesquisar localidade…"
              className="w-full min-h-12 rounded-lg border border-[#E8E4DE] bg-white py-3 pl-11 pr-14 text-base text-[#111111] placeholder:text-[#777] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && <button type="button" aria-label="Limpar pesquisa" onClick={() => setQuery("")} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-[#666] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]">
              <X aria-hidden="true" className="h-4 w-4" />
            </button>}
          </div>
          <p role="status" className={search ? "mb-3 text-base text-[#666]" : "sr-only"}>
            {search ? `${resultCount} ${resultCount === 1 ? "localidade encontrada" : "localidades encontradas"}` : ""}
          </p>
          <div className="divide-y divide-[#E8E4DE] border-y border-[#E8E4DE]">
            {regions.filter(region => region.cities.length > 0).map(region => {
              const open = Boolean(search) || expanded === region.area;
              return (
                <div key={region.area}>
                  <button
                    type="button"
                    id={`${id}-${region.area}-trigger`}
                    aria-expanded={open}
                    aria-controls={`${id}-${region.area}`}
                    aria-disabled={Boolean(search)}
                    onClick={() => { if (!search) setExpanded(open ? null : region.area); }}
                    className="flex w-full items-center gap-3 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37] sm:gap-4"
                  >
                    <MapPin aria-hidden="true" className="h-5 w-5 shrink-0 text-[#B8912A]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-[#111111] sm:text-lg">{region.label}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-[#666] sm:text-base">{region.hint}</span>
                    </span>
                    <span className="text-sm tabular-nums text-[#666]">{region.cities.length}<span className="hidden sm:inline"> {region.cities.length === 1 ? "localidade" : "localidades"}</span></span>
                    <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-[#857443] transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  <div id={`${id}-${region.area}`} role="region" aria-labelledby={`${id}-${region.area}-trigger`} hidden={!open}>
                    <div className="grid grid-cols-1 gap-x-6 pb-5 pl-8 sm:grid-cols-2 sm:pl-9 lg:grid-cols-3">
                      {region.cities.map(city => (
                        <Link key={city.slug} to={`/${serviceSlug}-${city.slug}`} className="flex min-h-11 items-center rounded-sm py-2 pr-2 text-base text-[#444] transition-colors hover:text-[#96731D] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]">
                          {city.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {resultCount === 0 && <p className="py-5 text-base leading-relaxed text-[#666]">Não encontrámos essa localidade. Experimente pesquisar pelo nome do concelho.</p>}
        </div>

      </div>
    </section>
  );
};

export default ServiceCityLinks;
