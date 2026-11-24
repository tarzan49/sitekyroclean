import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Utensils, BedDouble, Briefcase, Home, MessageCircle, Phone, CheckCircle2, Quote, FileText, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import CompactFAQ from "@/components/CompactFAQ";
import escritorioVideo from "@/assets/comercial/poltronas.mp4";
import escritorioPoster from "@/assets/comercial/poltronas-poster.jpg";
import hotelVideo from "@/assets/comercial/hotel.mp4";
import hotelPoster from "@/assets/comercial/hotel-poster.jpg";
import alojamentoVideo from "@/assets/comercial/alojamento.mp4";
import alojamentoPoster from "@/assets/comercial/alojamento-poster.jpg";
import restauranteVideo from "@/assets/comercial/restaurante.mp4";
import restaurantePoster from "@/assets/comercial/restaurante-poster.jpg";
import { useSnapSections } from "@/hooks/useSnapSections";
import { getCommercialPageData, getSector, COMMERCIAL_CITIES, SECTORS, CONTRACT_POINTS, SegmentKey, SectorData } from "@/data/commercialSeoData";
import { buildCommercialWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY, REVIEW_RATING, REVIEW_COUNT, CLIENTS_SERVED_LABEL } from "@/constants/business";
import { buildLocalBusinessNode, buildBreadcrumbNode, buildServiceNode, clearPrerenderedSchema } from "@/lib/seoSchema";

const SECTOR_ICONS: Record<SegmentKey, typeof Utensils> = {
  hoteis: BedDouble,
  "alojamento-local": Home,
  restaurantes: Utensils,
  escritorios: Briefcase,
};

const VIDEOS: Record<SectorData["video"], { src: string; poster: string }> = {
  hotel: { src: hotelVideo, poster: hotelPoster },
  alojamento: { src: alojamentoVideo, poster: alojamentoPoster },
  restaurante: { src: restauranteVideo, poster: restaurantePoster },
  escritorio: { src: escritorioVideo, poster: escritorioPoster },
};

// O único testemunho B2B real (avaliação Google). Nunca acrescentar outros sem o dono os dar.
const LUMIERE = "Somos um restaurante que prima pela qualidade e gostamos de contratar empresas de excelência com o mesmo reflexo! São eles que tornam o nosso ambiente mais limpo e charmoso! Recomendo 5⭐️";

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
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildCommercialWaMessage(cityData?.city.name, sector?.label))}`;
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

  const ctaButtons = (where: string, light: boolean) => (
    <div className="flex max-w-md flex-col gap-2.5 sm:flex-row">
      <a href={waHref} target="_blank" rel="noopener noreferrer" data-tracking-source={`${track}_${where}`} className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#16833e] px-4 text-base font-semibold text-white hover:bg-[#116b32]"><MessageCircle className="h-5 w-5" />Pedir proposta no WhatsApp</a>
      <a href={`tel:${PHONE_TEL}`} data-tracking-source={`${track}_${where}`} className={`flex min-h-[52px] items-center justify-center gap-2 rounded-lg border px-4 text-base font-semibold ${light ? "border-white/30 text-white hover:bg-white/10" : "border-[#111111]/20 text-[#111111]"}`}><Phone className="h-4 w-4" />{PHONE_DISPLAY}</a>
    </div>
  );

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        {/* Topo de ecrã inteiro com vídeo real da equipa no tipo de espaço da página. */}
        <section data-commercial-hero className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#071a12] text-white">
          <video src={video.src} poster={video.poster} autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.35) 0%, rgba(7,26,18,0.55) 45%, rgba(7,26,18,0.95) 85%)" }} />
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-8 pt-20 sm:px-6 md:pb-16 md:pt-28 lg:px-8">
            <div className="hidden md:block"><PageBreadcrumb items={[{ label: "Início", to: "/" }, { label: h1 }]} /></div>
            <h1 className="font-playfair mb-3 max-w-2xl text-[28px] font-semibold leading-tight text-white md:text-5xl" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>{h1}</h1>
            <p className="mb-5 max-w-lg text-[15px] leading-relaxed text-white/80">{intro}</p>
            <p className="mb-5 flex flex-wrap items-center gap-x-2 text-sm text-white/85"><span className="font-bold text-[#D4AF37]">{REVIEW_RATING}★</span> Google · {REVIEW_COUNT}+ avaliações · {CLIENTS_SERVED_LABEL} clientes</p>
            {ctaButtons("hero", true)}
          </div>
        </section>

        {sector ? (
          <section id="o-que-limpamos" className="scroll-mt-20 bg-[#FDFDF9] py-14 md:py-20">
            <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
              <SectionHeader heading="O que" goldWord="limpamos" />
              <ul className="grid gap-2 md:grid-cols-2">
                {sector.items.map(it => (
                  <li key={it.item} className="rounded-xl border border-[#E5E0D3] bg-white px-4 py-3" style={{ borderLeft: "3px solid #D4AF37" }}>
                    <p className="text-[15px] font-semibold text-[#111111]">{it.item}</p>
                    <p className="text-[13px] leading-snug text-[#505650]">{it.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : (
          <section id="setores" className="scroll-mt-20 bg-[#FDFDF9] py-14 md:py-20">
            <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
              <SectionHeader heading="Escolha o seu" goldWord="setor" />
              <div className="grid gap-2.5 md:grid-cols-2">
                {SECTORS.map(s => {
                  const Icon = SECTOR_ICONS[s.key];
                  return (
                    <Link key={s.key} to={`/limpeza-comercial-${s.key}`} className="flex items-center gap-3 rounded-xl border border-[#E5E0D3] bg-white px-4 py-3 hover:border-[#D4AF37]" style={{ borderLeft: "3px solid #D4AF37" }}>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#D4AF37]/10"><Icon className="h-5 w-5 text-[#D4AF37]" /></span>
                      <span className="flex-1"><span className="block text-[15px] font-semibold text-[#111111]">{s.label}</span><span className="block text-[13px] leading-snug text-[#505650]">{s.short}</span></span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-[#D4AF37]" />
                    </Link>
                  );
                })}
              </div>
              <p className="mt-4 text-[13px] text-[#505650]">{cityData?.coverage}</p>
            </div>
          </section>
        )}

        {sector && sector.rules.length > 0 && (
          <section id="regras" className="scroll-mt-20 bg-kyro-green py-14 text-white md:py-20">
            <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
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

        <section id="contrato" className={`scroll-mt-20 py-14 md:py-20 ${sector && sector.rules.length > 0 ? "bg-[#FDFDF9]" : "bg-kyro-green text-white"}`}>
          <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="Como" goldWord="trabalhamos" light={!(sector && sector.rules.length > 0) ? false : true} />
            <ul className="space-y-2">{CONTRACT_POINTS.map(p => {
              const dark = !(sector && sector.rules.length > 0);
              return <li key={p} className={`flex gap-2.5 rounded-xl border px-3 py-2 text-[14px] leading-snug ${dark ? "border-white/10 bg-white/[0.04] text-white/90" : "border-[#E5E0D3] bg-white text-[#111111]"}`}><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />{p}</li>;
            })}</ul>
          </div>
        </section>

        <section id="testemunho" className="scroll-mt-20 bg-[#FDFDF9] py-14 md:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="Quem já trabalha" goldWord="connosco" />
            <figure className="rounded-2xl border border-[#D4AF37]/30 bg-white p-6 md:p-10">
              <Quote className="mb-3 h-9 w-9 text-[#D4AF37]/50" />
              <blockquote className="font-playfair text-lg leading-relaxed text-[#111111]/85 md:text-xl">"{LUMIERE}"</blockquote>
              <figcaption className="mt-4 text-sm"><span className="font-bold text-[#111111]">Lumiere Restaurante</span> · <span className="text-[#505650]">avaliação Google verificada</span></figcaption>
            </figure>
          </div>
        </section>

        <CompactFAQ id="duvidas" dark faqs={faqs} heading="Dúvidas sobre o serviço para empresas" />

        <section id="proposta" className="scroll-mt-20 bg-[#FDFDF9] py-14 md:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="Peça a sua" goldWord="proposta" />
            <p className="mb-5 text-base leading-relaxed text-[#505650]">Diga-nos o tipo de espaço, as peças e a frequência, de preferência com fotografias. Respondemos em menos de 1 minuto no WhatsApp.</p>
            {ctaButtons("cta", false)}
            {sector && (
              <details className="mt-6"><summary className="cursor-pointer text-base font-semibold text-[#111111]">Outros setores</summary>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SECTORS.filter(s => s.key !== sector.key).map(s => <Link key={s.key} to={`/limpeza-comercial-${s.key}`} className="rounded-full border border-[#E5E0D3] bg-white px-3 py-1.5 text-sm text-[#1A1A1A] hover:border-[#D4AF37]">{s.label}</Link>)}
                </div>
              </details>
            )}
            <details className="mt-3"><summary className="cursor-pointer text-base font-semibold text-[#111111]">Limpeza comercial por cidade</summary>
              <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                {COMMERCIAL_CITIES.filter(c => c.slug !== slug).map(c => <Link key={c.slug} to={`/limpeza-comercial-${c.slug}`} className="rounded-full border border-[#E5E0D3] bg-white px-3 py-1.5 text-sm text-[#1A1A1A] hover:border-[#D4AF37]">{c.name}</Link>)}
              </div>
            </details>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CommercialPage;
