import ServiceFAQ from "@/components/ServiceFAQ";
import { clearPrerenderedSchema } from '../lib/seoSchema';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommercialHero from '@/components/CommercialHero';
import SectionHeader from '@/components/SectionHeader';
import ServiceReviewsGrid from '@/components/ServiceReviewsGrid';
import TreatmentPackPicker from '@/components/TreatmentPackPicker';
import ChairProcessStory from '@/components/ChairProcessStory';
import CustomerReviews from '@/components/CustomerReviews';
import CompactFAQ from '@/components/CompactFAQ';
import { pickReviewSubset } from '@/data/reviewsPool';
import { useSnapSections } from '@/hooks/useSnapSections';
import { getTreatmentPage, getExpansionPage, treatments, expansionCities, treatmentSupplement, treatmentArticles, treatmentSteps, treatmentCare } from '@/data/treatmentSeoData';
import { cities, services, cityPrep } from '@/data/serviceCatalog';
import { SITE_URL, WHATSAPP_BASE } from '@/constants/business';
import { PRICE_PROMISE } from '@/constants/commercialPolicy';
import { buildTreatmentWaMessage } from '@/lib/whatsappMessages';
export default function TreatmentPage() {
  const { pathname } = useLocation();
  const page = getTreatmentPage(pathname) ?? getExpansionPage(pathname);
  // Página nacional (sem cidade): a pessoa escolhe a localidade, para o preço e a mensagem não dizerem
  // sempre "em Lisboa" (auditoria das mensagens, 24 Nov).
  const [pickCity, setPickCity] = useState('');
  useSnapSections(Boolean(page));
  useEffect(() => {
    clearPrerenderedSchema();
    if (!page) return;
    document.title = page.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', page.metaDescription);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', SITE_URL + pathname);
    for (const key of ['og:title', 'twitter:title']) document.querySelector(`meta[property="${key}"],meta[name="${key}"]`)?.setAttribute('content', page.title);
    for (const key of ['og:description', 'twitter:description']) document.querySelector(`meta[property="${key}"],meta[name="${key}"]`)?.setAttribute('content', page.metaDescription);
  }, [pathname, page?.title]);
  if (!page) return null;
  const treatment = treatments.find(item => pathname.startsWith('/' + item.slug));
  const wa = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildTreatmentWaMessage(treatment?.slug, page.city?.name))}`;
  return <><Header /><main className="bg-[#FDFDF9] text-[#111111]">
    {/* Mesmo hero das páginas de serviço (dono, 09/10/2026). O tratamento não tem preço de tabela
        por artigo sozinho, por isso o preço fica "Sob orçamento"; a galeria é a dos colchões e sofás,
        os artigos a que o tratamento se acrescenta. */}
    <CommercialHero title={page.h1} subtitle={treatment?.heroSubtitle} serviceSlug="limpeza-colchoes" secondaryServiceSlug="limpeza-sofas" city={page.city?.name} price="Sob orçamento" breadcrumbs={[{ label: 'Início', to: '/' }, ...(treatment ? [{ label: treatment.name, ...(page.city ? { to: `/${treatment.slug}` } : {}) }] : []), ...(page.city ? [{ label: page.city.name }] : [])]} whatsappHref={wa} source={`treatment_hero_${treatment?.slug ?? 'expansao'}_${page.city?.slug ?? 'national'}`} />
    {/* Modelo novo (dono, 24 Nov: "uma página decente, direita, como as outras"): secções de ecrã inteiro. */}
    <section id="precos" className="scroll-mt-20 bg-[#FDFDF9] py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <h2 className="mb-5 md:mb-10 type-section-title font-playfair text-[#111111]">O seu preço <em className="not-italic" style={{ color: "#D4AF37" }}>{page.city ? `${cityPrep(page.city.name)} ${page.city.name}` : 'com o tratamento'}</em></h2>
        {!page.city && pickCity && <select value={pickCity} onChange={e => setPickCity(e.target.value)} aria-label="Localidade" className="mb-3 h-11 w-full max-w-xs rounded-xl border-2 border-[#D4AF37] bg-white px-3 text-sm font-semibold text-[#1A1A1A]"><option value="" disabled>Localidade</option>{cities.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}</select>}
        <div className="md:rounded-2xl md:border md:border-[#E5E0D3] md:bg-white md:p-6"><TreatmentPackPicker kind="mattress" onCity={setPickCity} city={page.city?.name ?? pickCity} source={`treatment_picker_${treatment?.slug ?? 'tratamento'}`} /></div>
      </div>
    </section>
    <section id="avaliacoes" className="scroll-mt-20 bg-kyro-green py-14 md:py-20 text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionHeader heading="O que dizem os nossos" goldWord="clientes" light={false} />
        <CustomerReviews reviews={pickReviewSubset('limpeza-colchoes', pathname, 6)} />
      </div>
    </section>
    <section id="beneficios" className="scroll-mt-20 bg-[#FDFDF9] py-14 md:py-20">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionHeader heading="O que o tratamento" goldWord="faz" />
        <ul className="space-y-3">{page.benefits.slice(0, 4).map(b => <li key={b} className="flex gap-3 rounded-xl border border-[#E5E0D3] bg-white p-3.5 text-[15px] leading-snug text-[#1A1A1A]"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />{b}</li>)}</ul>
      </div>
    </section>
    <ChairProcessStory service="limpeza-colchoes" city={page.city?.name} cityPrep={page.city ? cityPrep(page.city.name) : 'em'} />
    <CompactFAQ id="duvidas" dark faqs={page.faqs.slice(0, page.city ? 4 : 6)} heading="Dúvidas sobre o tratamento" />
    <section id="localidades" className="bg-[#FDFDF9] py-14"><div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8"><SectionHeader heading="Escolha os artigos e os" goldWord="tratamentos" /><div className="flex flex-wrap gap-2">{services.map(s => <Link className="rounded-full border border-[#E5E0D3] bg-white px-3 py-1.5 text-sm text-[#1A1A1A] hover:border-[#D4AF37]" key={s.slug} to={`/${s.slug}${page.city ? `-${page.city.slug}` : ''}`}>{s.name}</Link>)}{treatments.map(t => <Link className="rounded-full border border-[#E5E0D3] bg-white px-3 py-1.5 text-sm text-[#1A1A1A] hover:border-[#D4AF37]" key={t.slug} to={`/${t.slug}${page.city ? `-${page.city.slug}` : ''}`}>{t.name}</Link>)}<Link to="/guia-de-packs" className="rounded-full border border-[#E5E0D3] bg-white px-3 py-1.5 text-sm text-[#1A1A1A] hover:border-[#D4AF37]">Ver packs</Link></div>
    {!page.city && <details className="mt-8"><summary className="cursor-pointer font-semibold">Consultar localidades</summary><div className="flex flex-wrap gap-3 mt-5">{[...cities, ...expansionCities].map(c => <Link className="underline" key={c.slug} to={`${pathname}-${c.slug}`}>{c.name}</Link>)}</div></details>}</div></section>
  </main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: page.faqs.slice(0, page.city ? 4 : 6).map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }) }} /></>;
}
