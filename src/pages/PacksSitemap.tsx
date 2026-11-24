import { useSnapSections } from "@/hooks/useSnapSections";
import { useState } from "react";
import DirectoryGroup from "@/components/DirectoryGroup";
import { Link } from "react-router-dom";
import { ArrowRight, Check, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { packs, packCities, PACK_HOOK, PACK_KINDS, PACK_INITIAL_EXTRA } from "@/data/packComboData";
import { PACK_PERK_BULLETS, PACK_PERK_LIMIT } from "@/constants/packPerks";
import { cityPrep } from "@/data/serviceCatalog";
import { SITE_URL } from "@/constants/business";
import { RESPONSE_PROMISE } from "@/constants/commercialPolicy";
import type { PackKind } from "@/lib/customPack";

const KIND_LABEL: Record<PackKind, string> = {
  sofa: "Sofá",
  mattress: "Colchão",
  chairs: "Cadeiras",
  rug: "Tapete",
  carpet: "Alcatifa",
};

/** O que o configurador de cada pack traz já escolhido ao abrir. */
function packChips(packId: string): string[] {
  const chips = (PACK_KINDS[packId] ?? []).map(kind => KIND_LABEL[kind]);
  const extra = PACK_INITIAL_EXTRA[packId];
  if (extra === "premium" || extra === "essencial") chips.push("Impermeabilização");
  return chips;
}

const PacksSitemap = () => {
  useSnapSections(true); // modelo novo (dono, 24 Nov)
  const [citySlug, setCitySlug] = useState<string>(packCities[0].slug);
  const city = packCities.find(c => c.slug === citySlug) ?? packCities[0];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/guia-de-packs#webpage`,
        "url": `${SITE_URL}/guia-de-packs`,
        "name": "Guia de Packs de Limpeza | Kyro Clean Solutions",
        "inLanguage": "pt-PT",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "publisher": { "@id": `${SITE_URL}/#business` },
        "breadcrumb": { "@id": `${SITE_URL}/guia-de-packs#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/guia-de-packs#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Início", "item": `${SITE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Guia de Packs", "item": `${SITE_URL}/guia-de-packs` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header />
      <main>

        {/* Hero: diz o que é um pack e pede a localidade logo à entrada */}
        <section data-mobile-hero="text" className="pt-24 md:pt-28 pb-10 md:pb-14 bg-checker-dark">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 text-sm text-white/80 mb-6">
              <Link to="/" className="hover:text-white">Início</Link>
              <span>/</span>
              <span>Guia de Packs</span>
            </nav>
            <p className="text-sm font-bold tracking-[0.08em] uppercase mb-2" style={{ color: "#D4AF37" }}>
              {packs.length} packs · {packCities.length} localidades
            </p>
            <h1 className="type-page-title font-playfair text-white mb-3">
              Packs de Limpeza
            </h1>
            <p className="text-white/80 text-base max-w-xl mb-6">
              Vários artigos na mesma visita: uma só deslocação e cada artigo ao preço de tabela. Escolha a sua localidade e o pack que mais se aproxima do que precisa. Na página de cada pack escolhe os tamanhos e vê o total.
            </p>
            <label htmlFor="pack-city" className="block text-sm font-semibold text-white mb-2">
              Onde fica a sua casa?
            </label>
            <div className="relative max-w-sm">
              <MapPin aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#D4AF37" }} />
              <select
                id="pack-city"
                value={citySlug}
                onChange={event => setCitySlug(event.target.value)}
                className="min-h-12 w-full appearance-none rounded-xl border border-white/20 bg-white pl-10 pr-10 text-base font-semibold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                {packCities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              <ArrowRight aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-[#505650]" />
            </div>
          </div>
        </section>

        {/* Os quatro packs */}
        <section id="packs" className="py-10 md:py-14 bg-[#FDFDF9]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="type-section-title font-playfair text-[#111111] mb-4">Escolha o seu <em className="not-italic" style={{ color: "#D4AF37" }}>pack</em></h2>
            <div className="grid gap-2 md:flex md:snap-x md:snap-mandatory md:gap-4 md:overflow-x-auto md:pb-2">
              {packs.map(pack => (
                <article key={pack.id} className="relative flex items-center justify-between gap-3 rounded-xl border border-[#E8E4DE] bg-white px-4 py-2.5 md:shrink-0 md:snap-start md:flex-col md:items-stretch md:justify-start md:rounded-2xl md:w-[calc(33.333%-11px)] md:p-6" style={{ borderTop: "2px solid #D4AF37" }}>
                  <ul className="mb-3 hidden flex-wrap gap-1.5 md:flex" aria-label="Inclui">
                    {packChips(pack.id).map(chip => (
                      <li key={chip} className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-2.5 py-0.5 text-sm font-semibold text-[#111111]">
                        {chip}
                      </li>
                    ))}
                  </ul>
                  <h3 className="font-playfair text-[15px] font-bold leading-snug text-[#111111] md:text-xl">{pack.name}</h3>
                  <p className="mt-1 hidden text-base text-[#505650] md:block">{pack.tagline}</p>
                  <p className="mt-3 hidden flex-1 text-base text-[#333] md:block">{PACK_HOOK[pack.id] ?? pack.description}</p>
                  <Link
                    to={`/${pack.slug}-${city.slug}`}
                    aria-label={`Ver o preço: ${pack.name} ${cityPrep(city.name)} ${city.name}`}
                    className="inline-flex min-h-9 shrink-0 items-center md:mt-5 md:min-h-12 md:w-full justify-center gap-2 rounded-xl bg-[#111111] px-3 text-sm font-semibold text-white after:absolute after:inset-0 hover:bg-[#0d3c47] md:px-4 md:text-base md:after:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
                  >
                    <span className="hidden md:inline">Ver o preço {cityPrep(city.name)} {city.name}</span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4" style={{ color: "#D4AF37" }} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona o preço de pack */}
        <section className="pb-10 md:pb-14 bg-[#FDFDF9]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5 md:p-6">
              <h2 className="type-section-title font-playfair text-[#111111] mb-4">Como funciona um <em className="not-italic" style={{ color: "#D4AF37" }}>pack</em></h2>
              <ul className="space-y-3">
                {PACK_PERK_BULLETS.map(bullet => (
                  <li key={bullet} className="flex gap-3 text-base text-[#333]">
                    <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" style={{ color: "#D4AF37" }} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-[#505650]">{PACK_PERK_LIMIT}</p>
            </div>
          </div>
        </section>

        {/* Diretório completo: mantém as 244 ligações no HTML */}
        <section className="py-10 md:py-14 bg-white border-t border-[#E8E4DE]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="type-section-title font-playfair text-[#111111] mb-4">Packs por <em className="not-italic" style={{ color: "#D4AF37" }}>localidade</em></h2>
            {packs.map(pack => (
              <DirectoryGroup key={pack.id} title={pack.name}>
                {packCities.map(c => (
                  <Link key={c.slug} to={`/${pack.slug}-${c.slug}`}>{c.name}</Link>
                ))}
              </DirectoryGroup>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default PacksSitemap;
