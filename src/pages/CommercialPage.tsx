import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { MessageCircle, Mail, Phone, FileText, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import CommercialHero from "@/components/CommercialHero";
import { cityPrep } from "@/data/serviceCatalog";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import CompactFAQ from "@/components/CompactFAQ";
import ClientLogos from "@/components/ClientLogos";
import CustomerReviews from "@/components/CustomerReviews";
import VisualExamplesGallery from "@/components/VisualExamplesGallery";
import ChairProcessStory from "@/components/ChairProcessStory";
import DirectoryGroup from "@/components/DirectoryGroup";
import { getLandingProblems } from "@/data/landingServiceCopy";
import { selectLandingProblemImage } from "@/data/landingProblemImages";
import { PROBLEM_IMAGES } from "@/constants/problemCardHelpers";
import escritorioVideo from "@/assets/comercial/poltronas.mp4";
import hotelVideo from "@/assets/comercial/hotel.mp4";
import alojamentoVideo from "@/assets/comercial/alojamento.mp4";
import restauranteVideo from "@/assets/comercial/restaurante.mp4";
import escritorioPoster from "@/assets/comercial/poltronas-poster.jpg";
import hotelPoster from "@/assets/comercial/hotel-poster.jpg";
import alojamentoPoster from "@/assets/comercial/alojamento-poster.jpg";
import restaurantePoster from "@/assets/comercial/restaurante-poster.jpg";
import { useSnapSections } from "@/hooks/useSnapSections";
import { getCommercialPageData, getSector, COMMERCIAL_CITIES, SECTORS, CONTRACT_POINTS, COMMERCIAL_HERO_SERVICE, COMMERCIAL_CONTACT_TEXT, COMMERCIAL_CONTACT_HINT, commercialReviews, SegmentKey, SectorData } from "@/data/commercialSeoData";
import { buildCommercialWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY, BUSINESS_EMAIL, BUSINESS_EMAIL_HREF } from "@/constants/business";
import { buildLocalBusinessNode, buildBreadcrumbNode, buildServiceNode, clearPrerenderedSchema } from "@/lib/seoSchema";

// Vídeo real da equipa em cada tipo de espaço, no topo (dono, 24 Nov: "repõe os vídeos").
const VIDEOS: Record<SectorData["video"], { src: string; poster: string }> = {
  hotel: { src: hotelVideo, poster: hotelPoster },
  alojamento: { src: alojamentoVideo, poster: alojamentoPoster },
  restaurante: { src: restauranteVideo, poster: restaurantePoster },
  escritorio: { src: escritorioVideo, poster: escritorioPoster },
};

const SECTOR_NOUN: Record<SegmentKey, string> = { hoteis: "hotel", "alojamento-local": "alojamento", restaurantes: "restaurante", escritorios: "escritório" };

const CommercialPage = () => {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/limpeza-comercial-/, "").replace(/\/$/, "");
  const sector = getSector(slug);
  const cityData = sector ? null : getCommercialPageData(slug);
  const found = Boolean(sector || cityData);
  useSnapSections(found);

  const title = sector?.title ?? cityData?.title ?? "";
  const description = sector?.metaDescription ?? cityData?.metaDescription ?? "";
  const h1 = sector?.h1 ?? cityData?.h1 ?? "";
  const intro = sector?.intro ?? cityData?.intro ?? "";
  const faqs = sector?.faqs ?? cityData?.faqs ?? [];
  const pageUrl = `${SITE_URL}/limpeza-comercial-${slug}`;

  useEffect(() => {
    clearPrerenderedSchema();
  }, []);

  useEffect(() => {
    if (!found) return;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", pageUrl);
  }, [found, title, description, pageUrl]);

  if (!found) {
    return (
      <>
        <Header />
        <main className="pt-28 pb-16 min-h-screen bg-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="type-page-title font-playfair text-[#111111] mb-4">Página não encontrada</h1>
            <Link to="/" style={{ color: "#D4AF37" }} className="hover:underline">Voltar ao início</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const video = VIDEOS[sector?.video ?? "escritorio"];
  const heroService = COMMERCIAL_HERO_SERVICE[sector?.key ?? "cidade"];
  const reviews = commercialReviews(`/limpeza-comercial-${slug}`, heroService);
  const examples = getLandingProblems(heroService).map(card => {
    const img = selectLandingProblemImage(heroService, card.id, pathname);
    return { id: card.id, label: card.title, description: card.description, src: img?.src ?? PROBLEM_IMAGES[heroService][card.imageIndex], alt: img?.alt ?? card.title, video: img?.video };
  });
  const placeName = cityData?.city.name;
  const processHeading = cityData ? undefined : { text: heroService === "limpeza-colchoes" ? "A limpeza dos colchões no seu" : "A limpeza das cadeiras no seu", gold: SECTOR_NOUN[sector!.key] };
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildCommercialWaMessage(cityData?.city.name, sector?.label))}`;
  const mailHref = `${BUSINESS_EMAIL_HREF}?subject=${encodeURIComponent(`Proposta para empresa: ${h1}`)}&body=${encodeURIComponent(buildCommercialWaMessage(cityData?.city.name, sector?.label))}`;
  const track = `commercial_${slug}`;
  const area = cityData ? { "@type": "City" as const, name: cityData.city.name } : { "@type": "Country" as const, name: "Portugal" };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusinessNode(area),
      buildBreadcrumbNode(`${pageUrl}#breadcrumb`, [
        { name: "Início", item: SITE_URL },
        { name: h1, item: pageUrl },
      ]),
      buildServiceNode({ url: pageUrl, name: h1, description, areaServed: area, serviceType: "Limpeza comercial de estofos" }),
    ],
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        {/* Topo no mesmo molde das outras páginas (CommercialHero): sem valores; avaliação, contacto direto e o vídeo real do tipo de espaço. */}
        <CommercialHero
          title={h1}
          subtitle={intro}
          serviceSlug={heroService}
          city={cityData?.city.name}
          image={video.poster}
          video={video}
          breadcrumbs={[{ label: "Início", to: "/" }, { label: h1 }]}
          whatsappHref={waHref}
          source={`${track}_hero`}
          directContactLabel="Falar diretamente connosco"
        />

        <section id="clientes" className="scroll-mt-20 bg-white py-14 md:py-20">
          <div className="mx-auto w-full max-w-5xl px-5 text-center sm:px-6 lg:px-8"><SectionHeader heading="Quem confia em" goldWord="nós" /></div>
          <ClientLogos />
        </section>

        {sector ? (
          <section id="o-que-limpamos" className="scroll-mt-20 bg-kyro-green py-14 text-white md:py-20">
            <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-6 md:grid-cols-[1fr_minmax(0,320px)] lg:px-8">
              <div>
                <SectionHeader heading="O que" goldWord="limpamos" light={false} />
                <ul>{sector.items.map((it, i) => (
                  <li key={it.item} className="flex gap-4 border-t border-white/15 py-3 first:border-t-0">
                    <span className="font-playfair w-7 shrink-0 text-xl text-[#D4AF37]">{i + 1}</span>
                    <span><span className="block text-base font-semibold text-white">{it.item}</span><span className="block text-[13px] leading-snug text-white/75">{it.detail}</span></span>
                  </li>
                ))}</ul>
              </div>
              <img src={video.poster} alt={h1} loading="lazy" className="hidden aspect-[4/5] max-h-[68svh] w-full rounded-2xl object-cover md:block" />
            </div>
          </section>
        ) : (
          <section id="setores" className="scroll-mt-20 bg-kyro-green py-14 text-white md:py-20">
            <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
              <SectionHeader heading="Escolha o seu" goldWord="setor" light={false} />
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
                {SECTORS.map(s => (
                  <Link key={s.key} to={`/limpeza-comercial-${s.key}`} className="group relative block h-[29svh] min-h-[170px] overflow-hidden rounded-2xl md:h-[56svh]">
                    <img src={VIDEOS[s.video].poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0) 30%, rgba(7,26,18,.92) 100%)" }} />
                    <span className="absolute inset-x-0 bottom-0 p-3 md:p-5"><span className="flex items-center justify-between gap-1 text-[16px] font-semibold leading-tight text-white md:text-xl">{s.label}<ChevronRight className="h-5 w-5 shrink-0 text-[#D4AF37]" /></span><span className="mt-1 hidden text-[13px] leading-snug text-white/80 md:block">{s.short}</span></span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <VisualExamplesGallery key={pathname} id="exemplos" heading="Veja alguns" name="exemplos" examples={examples} />

        {sector && sector.rules.length > 0 && (
          <section id="regras" className="scroll-mt-20 bg-kyro-green py-14 text-white md:py-20">
            <div className="mx-auto w-full max-w-4xl px-5 sm:px-6 lg:px-8">
              <SectionHeader heading="O que a lei" goldWord="pede" light={false} />
              <ul className="space-y-2">
                {sector.rules.map(r => (
                  <li key={r.source} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[14px] leading-snug text-white/90">{r.text}</p>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[12px] text-[#D4AF37] hover:underline"><FileText className="h-3.5 w-3.5" />{r.source}</a>
                  </li>
                ))}
              </ul>
              {sector.rulesNote && <p className="mt-3 text-[13px] leading-snug text-white/75">{sector.rulesNote}</p>}
            </div>
          </section>
        )}

        <section id="contrato" className="scroll-mt-20 bg-[#FDFDF9] py-14 md:py-20">
          <div className="mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="Como" goldWord="trabalhamos" />
            <ul className="grid md:grid-cols-2 md:gap-x-12">{CONTRACT_POINTS.map((p, i) => <li key={p} className="flex items-center gap-4 border-t border-[#E5E0D3] py-3 md:py-5"><span className="font-playfair w-7 shrink-0 text-2xl text-[#D4AF37]">{i + 1}</span><span className="text-[15px] leading-snug text-[#1A1A1A] md:text-base">{p}</span></li>)}</ul>
          </div>
        </section>

        <section id="avaliacoes" className="scroll-mt-20 bg-kyro-green py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="O que dizem os nossos" goldWord="clientes" light={false} />
            <CustomerReviews reviews={reviews} />
          </div>
        </section>

        <ChairProcessStory key={pathname} service={heroService} city={placeName} cityPrep={placeName ? cityPrep(placeName) : "em"} heading={processHeading} />

        <CompactFAQ id="duvidas" faqs={faqs} heading="Dúvidas sobre o serviço para empresas" />

        {/* Sem valores (dono, 24 Nov): nas empresas o contacto é feito diretamente connosco. */}
        <section id="contacto" className="relative isolate scroll-mt-20 overflow-hidden bg-[#071a12] text-white">
          <img src={video.poster} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,.55) 0%, rgba(7,26,18,.82) 45%, rgba(7,26,18,.97) 100%)" }} />
          <div className="mx-auto w-full max-w-2xl px-5 py-5 text-center md:py-14 sm:px-6">
            <SectionHeader heading="Fale diretamente" goldWord="connosco" light={false} />
            <p className="mx-auto mb-7 max-w-md text-base leading-relaxed text-white/90">{COMMERCIAL_CONTACT_TEXT}</p>
            <a href={waHref} target="_blank" rel="noopener noreferrer" data-tracking-source={`${track}_contacto`} className="mx-auto flex min-h-[58px] w-full max-w-md items-center justify-center gap-2 bg-[#16833e] px-5 text-[17px]"><MessageCircle className="h-5 w-5 shrink-0" />Falar diretamente connosco</a>
            <div className="mx-auto mt-7 grid max-w-md grid-cols-1 divide-y divide-white/15 border-y border-white/15">
              <a href={`tel:${PHONE_TEL}`} data-tracking-source={`${track}_contacto`} className="flex min-h-[60px] items-center justify-between gap-3 text-white hover:text-[#D4AF37]"><Phone className="h-5 w-5 shrink-0 text-[#D4AF37]" /><span className="text-lg font-semibold">{PHONE_DISPLAY}</span></a>
              <a href={mailHref} data-tracking-source={`${track}_contacto`} className="flex min-h-[60px] items-center justify-between gap-3 text-white hover:text-[#D4AF37]"><Mail className="h-5 w-5 shrink-0 text-[#D4AF37]" /><span className="text-[15px] font-semibold">{BUSINESS_EMAIL}</span></a>
            </div>
            <p className="mx-auto mt-6 max-w-md text-[13px] leading-relaxed text-white/75">{COMMERCIAL_CONTACT_HINT}</p>
          </div>
        </section>

        <section id="zonas" className="scroll-mt-20 bg-[#FDFDF9] py-14 md:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="Setores e" goldWord="cidades" />
            <div className="space-y-2">
              <DirectoryGroup title={sector ? "Outros setores" : "Setores"}>
                {SECTORS.filter(s => s.key !== sector?.key).map(s => <Link key={s.key} to={`/limpeza-comercial-${s.key}`} className="inline-flex items-center rounded-full border border-[#E8E4DE] bg-white px-3.5 py-2 text-sm font-medium text-[#111111] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5">{s.label}</Link>)}
              </DirectoryGroup>
              <DirectoryGroup title="Limpeza comercial por cidade">
                {COMMERCIAL_CITIES.filter(c => c.slug !== slug).map(c => <Link key={c.slug} to={`/limpeza-comercial-${c.slug}`} className="inline-flex items-center rounded-full border border-[#E8E4DE] bg-white px-3.5 py-2 text-sm font-medium text-[#111111] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5">{c.name}</Link>)}
              </DirectoryGroup>
            </div>
            {cityData && <p className="mt-4 text-[13px] text-[#505650]">{cityData.coverage}</p>}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CommercialPage;
