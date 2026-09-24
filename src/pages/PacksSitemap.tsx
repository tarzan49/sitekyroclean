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
              Vários artigos na mesma visita: uma só deslocação e preço de pack em cada artigo que acrescentar. Escolha a sua localidade e o pack que mais se aproxima do que precisa. Tudo o resto ajusta no configurador.
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
        <section className="py-10 md:py-14 bg-[#FDFDF9]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="type-section-title font-playfair text-[#111111] mb-1">Escolha o ponto de partida</h2>
            <p className="text-base text-[#505650] mb-6">
              Cada pack abre o configurador já com estes artigos. Pode mudar tamanhos, quantidades e tratamentos antes de pedir.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {packs.map(pack => (
                <article key={pack.id} className="flex flex-col rounded-2xl border border-[#E8E4DE] bg-white p-5 md:p-6">
                  <ul className="flex flex-wrap gap-1.5 mb-3" aria-label="Inclui">
                    {packChips(pack.id).map(chip => (
                      <li key={chip} className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-2.5 py-0.5 text-sm font-semibold text-[#111111]">
                        {chip}
                      </li>
                    ))}
                  </ul>
                  <h3 className="font-playfair text-xl font-bold text-[#111111] leading-snug">{pack.name}</h3>
                  <p className="text-base text-[#505650] mt-1">{pack.tagline}</p>
                  <p className="text-base text-[#333] mt-3 flex-1">{PACK_HOOK[pack.id] ?? pack.description}</p>
                  <Link
                    to={`/${pack.slug}-${city.slug}`}
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#111111] px-4 text-base font-semibold text-white hover:bg-[#0d3c47] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
                  >
                    Configurar {cityPrep(city.name)} {city.name}
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
              <h2 className="type-section-title font-playfair text-[#111111] mb-4">Como funciona o preço de pack</h2>
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
            <h2 className="type-section-title font-playfair text-[#111111] mb-2">Todos os packs por localidade</h2>
            <p className="text-base text-[#505650] mb-4">
              Pedido por WhatsApp · {RESPONSE_PROMISE}
            </p>
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
