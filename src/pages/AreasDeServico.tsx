import DirectoryGroup from "@/components/DirectoryGroup";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Phone, ChevronDown, Search, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import SectionHeader from "@/components/SectionHeader";
import { cities, services } from "@/data/locationSeoData";
import { municipiosComFreguesias, getFreguesiaStats } from "@/data/freguesiaSeoData";
import { SITE_URL, PHONE_TEL, PHONE_DISPLAY } from "@/constants/business";

type Area = "porto" | "lisboa" | "algarve";

const REGIONS: { area: Area; heading: string; goldWord: string }[] = [
  { area: "porto", heading: "", goldWord: "Porto e Norte" },
  { area: "lisboa", heading: "", goldWord: "Lisboa e Margem Sul" },
  { area: "algarve", heading: "", goldWord: "Algarve" },
];

function citiesForArea(area: Area) {
  return cities.filter(c => c.area === area);
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT").trim();

const RegionSection = ({ heading, goldWord, area, query }: { heading: string; goldWord: string; area: Area; query: string }) => {
  const search = normalize(query);
  const areaCities = citiesForArea(area).filter(city => {
    const municipality = municipiosComFreguesias.find(m => m.slug === city.slug);
    return !search || normalize(city.name).includes(search) || municipality?.freguesias.some(f => normalize(f.name).includes(search));
  }).sort((a, b) => a.name.localeCompare(b.name, "pt-PT"));
  if (!areaCities.length) return null;
  return (
    <details open={search ? true : undefined} className="group/region border-b border-[#E8E4DE]">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37] [&::-webkit-details-marker]:hidden">
        <MapPin aria-hidden="true" className="h-5 w-5 shrink-0 text-[#B8912A]" />
        <span className="flex-1 font-semibold text-[#111111]">{heading} {goldWord}</span>
        <span className="text-xs text-[#666]">{areaCities.length}</span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 text-[#B8912A] group-open/region:rotate-180" />
      </summary>
      <div className="pb-5 pl-3 sm:pl-8">
        {areaCities.map(city => {
          const municipality = municipiosComFreguesias.find(m => m.slug === city.slug);
          const freguesias = (municipality?.freguesias ?? []).filter(f => !search || normalize(city.name).includes(search) || normalize(f.name).includes(search));
          return <details key={city.slug} open={search ? true : undefined} className="group/city border-t border-[#E8E4DE]">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37] [&::-webkit-details-marker]:hidden">
              <span className="flex-1 text-sm font-semibold text-[#111111]">{city.name}</span>
              <ChevronDown aria-hidden="true" className="h-4 w-4 text-[#B8912A] group-open/city:rotate-180" />
            </summary>
            <div className="pl-3 sm:pl-5">
              <DirectoryGroup title={`Serviços em ${city.name}`}>
                {services.map(svc => <Link key={svc.slug} to={`/${svc.slug}-${city.slug}`}>{svc.name}</Link>)}
              </DirectoryGroup>
              <DirectoryGroup title={`Freguesias de ${city.name}`} open={search ? true : undefined}>
                {freguesias.map(f => <Link key={f.slug} to={`/limpeza-sofas-${city.slug}-${f.slug}`}>{f.name}</Link>)}
              </DirectoryGroup>
            </div>
          </details>;
        })}
      </div>
    </details>
  );
};

const AreasDeServico = () => {
  const [query, setQuery] = useState("");
  const search = normalize(query);
  const hasResults = cities.some(city => normalize(city.name).includes(search) || municipiosComFreguesias.find(m => m.slug === city.slug)?.freguesias.some(f => normalize(f.name).includes(search)));
  const stats = getFreguesiaStats();

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-24 md:pt-28 pb-10 md:pb-14 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.85 }}>
                Cobertura Nacional
              </p>
            </div>
            <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] text-[#111111]">
              Áreas de{" "}
              <em className="not-italic" style={{ color: "#D4AF37" }}>Serviço</em>
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#111111]/55 leading-relaxed max-w-2xl">
              A Kyro Clean Solutions presta serviços de limpeza profissional de estofos ao domicílio em {stats.municipios} municípios e {stats.freguesias} freguesias, do Porto ao Algarve.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <QuizButton />
              <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center gap-2 bg-secondary text-[#111111] font-semibold text-sm px-5 py-2.5 rounded-full border border-border/30 hover:bg-secondary/80 transition-colors">
                <Phone className="w-4 h-4" /> {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        <section className="bg-[#FDFDF9] py-10 md:py-14">
          <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
            <p className="mb-5 text-sm leading-relaxed text-[#666]">Escolha a região, depois o concelho e o serviço. Também pode pesquisar diretamente uma localidade ou freguesia.</p>
            <div className="relative mb-6">
              <label htmlFor="area-search" className="sr-only">Pesquisar localidade ou freguesia</label>
              <Search aria-hidden="true" className="absolute left-4 top-4 h-4 w-4 text-[#857443]" />
              <input id="area-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Pesquisar localidade ou freguesia…" className="min-h-12 w-full rounded-lg border border-[#E8E4DE] bg-white py-3 pl-11 pr-12 text-base text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 [&::-webkit-search-cancel-button]:appearance-none" />
              {query && <button type="button" aria-label="Limpar pesquisa" onClick={() => setQuery("")} className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-[#666] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]"><X aria-hidden="true" className="h-4 w-4" /></button>}
            </div>
            <div className="border-t border-[#E8E4DE]">
              {REGIONS.map(r => <RegionSection key={`${r.area}-${Boolean(search)}`} {...r} query={query} />)}
            </div>
            <p role="status" className="mt-4 text-sm text-[#666]">{!hasResults ? "Não encontrámos essa localidade. Experimente outro nome ou pesquise pelo concelho." : search ? "Resultados nas regiões abaixo." : ""}</p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 md:py-14 bg-kyro-green">
          <div className="container mx-auto px-4 max-w-4xl">
            <SectionHeader
              overline="Comece já"
              heading="Precisa de limpeza profissional na sua"
              goldWord="cidade?"
              subtitle="Peça o seu orçamento gratuito: resposta em menos de 10 minutos."
              light={false}
            />
            <QuizButton />
          </div>
        </section>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebPage",
                  "@id": `${SITE_URL}/areas-de-servico#webpage`,
                  "url": `${SITE_URL}/areas-de-servico`,
                  "name": "Áreas de Serviço | Kyro Clean Solutions",
                  "description": `Serviços de limpeza profissional em ${stats.municipios} municípios e ${stats.freguesias} freguesias do Porto, Lisboa e Algarve.`,
                  "inLanguage": "pt-PT",
                  "isPartOf": { "@id": `${SITE_URL}/#website` },
                  "publisher": { "@id": `${SITE_URL}/#business` },
                  "breadcrumb": { "@id": `${SITE_URL}/areas-de-servico#breadcrumb` },
                },
                {
                  "@type": "BreadcrumbList",
                  "@id": `${SITE_URL}/areas-de-servico#breadcrumb`,
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": `${SITE_URL}/` },
                    { "@type": "ListItem", "position": 2, "name": "Áreas de Serviço", "item": `${SITE_URL}/areas-de-servico` },
                  ],
                },
              ],
            }),
          }}
        />
      </main>
      <Footer />
    </>
  );
};

export default AreasDeServico;
