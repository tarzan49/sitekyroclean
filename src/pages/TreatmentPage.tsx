import ServiceFAQ from "@/components/ServiceFAQ";
import { clearPrerenderedSchema } from '../lib/seoSchema';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommercialHero from '@/components/CommercialHero';
import { getTreatmentPage, getExpansionPage, treatments, expansionCities } from '@/data/treatmentSeoData';
import { cities, services } from '@/data/serviceCatalog';
import { SITE_URL, WHATSAPP_BASE } from '@/constants/business';
import { PRICE_PROMISE } from '@/constants/commercialPolicy';
import { buildTreatmentWaMessage } from '@/lib/whatsappMessages';
export default function TreatmentPage() {
  const { pathname } = useLocation();
  const page = getTreatmentPage(pathname) ?? getExpansionPage(pathname);
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
    <section className="max-w-5xl mx-auto px-5 pt-12"><p className="text-lg leading-relaxed max-w-3xl">{page.intro}</p></section>
    <section className="max-w-5xl mx-auto px-5 pt-8 pb-14"><h2 className="font-playfair text-3xl mb-8">O que pode acrescentar ao seu cuidado habitual</h2><div className="grid md:grid-cols-3 gap-5">{page.benefits.map(b => <article key={b} className="p-6 bg-white border border-[#E8E4DE] rounded-xl"><CheckCircle2 className="text-[#9B7D20] mb-4" /><p>{b}</p></article>)}</div><p className="mt-8 leading-relaxed">{page.detail}</p></section>
    <section id="precos" className="bg-[#F0EEE7] px-5 py-12 scroll-mt-20"><div className="max-w-5xl mx-auto"><h2 className="font-playfair text-3xl mb-5">Uma proposta clara, antes de marcar</h2><p className="mb-4">{PRICE_PROMISE}</p><p>{page.coverage}</p></div></section>
    <ServiceFAQ faqs={page.faqs} includeSchema={false} />
    <section className="max-w-5xl mx-auto px-5 pb-16"><h2 className="font-playfair text-2xl mb-5">Escolha os artigos e os tratamentos</h2><div className="flex flex-wrap gap-3">{services.map(s => <Link className="border rounded-lg p-3" key={s.slug} to={`/${s.slug}${page.city ? `-${page.city.slug}` : ''}`}>{s.name}</Link>)}{treatments.map(t => <Link className="border rounded-lg p-3" key={t.slug} to={`/${t.slug}${page.city ? `-${page.city.slug}` : ''}`}>{t.name}</Link>)}<Link to="/guia-de-packs" className="border rounded-lg p-3">Ver packs</Link></div>
    {!page.city && <details className="mt-8"><summary className="cursor-pointer font-semibold">Consultar localidades</summary><div className="flex flex-wrap gap-3 mt-5">{[...cities, ...expansionCities].map(c => <Link className="underline" key={c.slug} to={`${pathname}-${c.slug}`}>{c.name}</Link>)}</div></details>}</section>
  </main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: page.faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }) }} /></>;
}
