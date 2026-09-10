import ServiceFAQ from "@/components/ServiceFAQ";
import { clearPrerenderedSchema } from '../lib/seoSchema';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustRatingBadge from '@/components/TrustRatingBadge';
import { getTreatmentPage, getExpansionPage, treatments, expansionCities } from '@/data/treatmentSeoData';
import { cities, services } from '@/data/locationSeoData';
import { SITE_URL, WHATSAPP_BASE } from '@/constants/business';
import { PRICE_PROMISE } from '@/constants/commercialPolicy';
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
  const wa = `${WHATSAPP_BASE}?text=${encodeURIComponent(`Olá! Gostaria de pedir orçamento: ${page.h1}.\nArtigo e quantidade: \nMedidas: \nLocalidade: ${page.city?.name ?? ''}\nPosso enviar fotografias para avaliação.`)}`;
  return <><Header /><main className="bg-[#FDFDF9] text-[#111111]">
    <section className="bg-[#071a12] text-white pt-28 pb-16 px-5"><div className="max-w-5xl mx-auto">
      <p className="text-gold uppercase tracking-widest text-xs mb-5">Cuidado à medida dos seus estofos</p>
      <h1 className="font-playfair text-4xl md:text-6xl max-w-4xl mb-6">{page.h1}</h1>
      <p className="text-white/75 max-w-2xl text-lg leading-relaxed mb-7">{page.intro}</p>
      <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-gold text-[#071a12] font-bold rounded-lg px-6 py-4"><MessageCircle className="w-5 h-5" />Pedir orçamento personalizado</a>
      <p className="text-sm text-white/70 my-4">Resposta em menos de 10 minutos · Sem compromisso</p><TrustRatingBadge variant="horizontal" />
    </div></section>
    <section className="max-w-5xl mx-auto px-5 py-14"><h2 className="font-playfair text-3xl mb-8">O que pode acrescentar ao seu cuidado habitual</h2><div className="grid md:grid-cols-3 gap-5">{page.benefits.map(b => <article key={b} className="p-6 bg-white border border-[#E8E4DE] rounded-xl"><CheckCircle2 className="text-[#9B7D20] mb-4" /><p>{b}</p></article>)}</div><p className="mt-8 leading-relaxed">{page.detail}</p></section>
    <section className="bg-[#F0EEE7] px-5 py-12"><div className="max-w-5xl mx-auto"><h2 className="font-playfair text-3xl mb-5">Uma proposta clara, antes de marcar</h2><p className="mb-4">{PRICE_PROMISE}</p><p>{page.coverage}</p></div></section>
    <ServiceFAQ faqs={page.faqs} includeSchema={false} />
    <section className="max-w-5xl mx-auto px-5 pb-16"><h2 className="font-playfair text-2xl mb-5">Escolha os artigos e os tratamentos</h2><div className="flex flex-wrap gap-3">{services.map(s => <Link className="border rounded-lg p-3" key={s.slug} to={`/${s.slug}${page.city ? `-${page.city.slug}` : ''}`}>{s.name}</Link>)}{treatments.map(t => <Link className="border rounded-lg p-3" key={t.slug} to={`/${t.slug}${page.city ? `-${page.city.slug}` : ''}`}>{t.name}</Link>)}<Link to="/packs" className="border rounded-lg p-3">Montar o meu pack</Link></div>
    {!page.city && <details className="mt-8"><summary className="cursor-pointer font-semibold">Consultar localidades</summary><div className="flex flex-wrap gap-3 mt-5">{[...cities, ...expansionCities].map(c => <Link className="underline" key={c.slug} to={`${pathname}-${c.slug}`}>{c.name}</Link>)}</div></details>}</section>
  </main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: page.faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }) }} /></>;
}
