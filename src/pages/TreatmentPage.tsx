import ServiceFAQ from "@/components/ServiceFAQ";
import { clearPrerenderedSchema } from '../lib/seoSchema';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommercialHero from '@/components/CommercialHero';
import SectionHeader from '@/components/SectionHeader';
import ServiceReviewsGrid from '@/components/ServiceReviewsGrid';
import { getTreatmentPage, getExpansionPage, treatments, expansionCities, treatmentSupplement, treatmentArticles, treatmentSteps, treatmentCare } from '@/data/treatmentSeoData';
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
    <section className="py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionHeader overline="Limpeza + cuidado complementar" heading="A sua limpeza, com um" goldWord="cuidado extra" subtitle={page.intro} />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14 items-start">
          <div className="rounded-2xl bg-kyro-green text-white p-6 sm:p-8 border-t-2 border-[#D4AF37]">
            <ShieldCheck aria-hidden="true" className="w-8 h-8 text-[#D4AF37] mb-5" />
            <h2 className="text-2xl font-semibold mb-4">{treatmentSupplement.heading}</h2>
            <p className="text-base text-white/85 leading-relaxed">{treatmentSupplement.body}</p>
            <p className="mt-5 pt-5 border-t border-white/15 text-base text-white/85 leading-relaxed">{treatmentSupplement.identity}</p>
          </div>
          <div className="space-y-5">
            {page.benefits.map(b => <div key={b} className="flex gap-4 border-b border-[#E5E0D3] pb-5"><CheckCircle2 aria-hidden="true" className="text-[#D4AF37] w-6 h-6 shrink-0" /><p className="text-base leading-relaxed text-[#47574c]">{b}</p></div>)}
            <p className="text-base leading-relaxed text-[#47574c]">{page.detail}</p>
          </div>
        </div>
      </div>
    </section>
    {treatment && <>
      <section className="bg-kyro-green py-14 md:py-20 text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <SectionHeader overline="Os artigos de sua casa" heading="O mesmo cuidado, do quarto" goldWord="à sala" light={false} subtitle="Acrescente o suplemento aos artigos que escolher. Não precisa de tratar todos os estofos do pedido." />
          <div className="grid gap-6 md:grid-cols-3">
            {treatmentArticles.map(article => <article key={article.serviceSlug} className="overflow-hidden rounded-2xl bg-white text-[#111111] flex flex-col">
              <img src={article.image} alt={article.alt} width={800} height={600} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
              <div className="p-6 flex flex-col flex-1"><h3 className="text-2xl font-semibold mb-3">{article.title}</h3><p className="text-base leading-relaxed text-[#47574c] mb-5">{article.body}</p><Link className="mt-auto inline-flex items-center gap-2 min-h-11 text-base font-semibold text-[#234536] hover:underline" to={`/${article.serviceSlug}${page.city ? `-${page.city.slug}` : ''}`}>Ver limpeza de {article.title.toLowerCase()}<ArrowRight aria-hidden="true" className="w-4 h-4 shrink-0" /></Link></div>
            </article>)}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-white/75">As imagens mostram a limpeza dos artigos. O aspeto antes e depois não mede a eficácia do tratamento complementar.</p>
        </div>
      </section>
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12"><h2 className="type-section-title mb-5">{treatment.contextHeading}</h2><p className="text-base leading-relaxed text-[#47574c]">{treatment.contextBody}</p></div>
          <SectionHeader overline="Da primeira mensagem ao final da visita" heading="Como funciona, passo" goldWord="a passo" />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{treatmentSteps.map((step, index) => <li key={step.title} className="border-t-2 border-[#D4AF37] pt-5"><span className="text-3xl font-semibold text-[#aa862b]">{String(index + 1).padStart(2, '0')}</span><h3 className="text-xl font-semibold mt-4 mb-3">{step.title}</h3><p className="text-base leading-relaxed text-[#47574c]">{step.body}</p></li>)}</ol>
        </div>
      </section>
      <section id="precos" className="bg-kyro-green py-14 md:py-20 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16 items-center">
          <div><SectionHeader overline="Limpeza e suplemento no mesmo orçamento" heading="Saiba o valor antes" goldWord="de marcar" light={false} subtitle="Diga-nos os artigos, os tamanhos ou quantidades e a localidade. Confirmamos consigo a limpeza e o tratamento pretendido." /><p className="text-base leading-relaxed text-white/80">{PRICE_PROMISE}</p></div>
          <div className="border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8">
            <h3 className="text-2xl font-semibold mb-5">Uma proposta clara</h3>
            <ul className="space-y-4 mb-7">{['Limpeza dos artigos escolhidos', 'Suplemento de tratamento identificado', 'Deslocação e disponibilidade confirmadas'].map(label => <li key={label} className="flex items-start gap-3 text-base"><CheckCircle2 aria-hidden="true" className="w-5 h-5 shrink-0 text-[#D4AF37]" />{label}</li>)}</ul>
            <a href={wa} target="_blank" rel="noopener noreferrer" data-tracking-source={`treatment_quote_${treatment.slug}`} className="flex items-center justify-center gap-3 min-h-14 p-4 rounded-xl bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] font-bold text-center"><MessageCircle aria-hidden="true" className="w-5 h-5 shrink-0" />Pedir preço e disponibilidade</a>
            <p className="text-sm leading-relaxed text-white/75 mt-5">{page.coverage}</p>
          </div>
        </div>
      </section>
      <section className="py-14 md:py-20"><div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8"><SectionHeader overline="Depois da visita" heading="Cuidados que continuam" goldWord="em casa" /><div className="grid gap-7 md:grid-cols-3">{treatmentCare.map(care => <article key={care.title} className="border-l-2 border-[#D4AF37] pl-5"><h3 className="text-xl font-semibold mb-3">{care.title}</h3><p className="text-base leading-relaxed text-[#47574c]">{care.body}</p></article>)}</div></div></section>
      <section id="avaliacoes" className="py-14 md:py-20 bg-kyro-green text-white"><div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8"><SectionHeader overline="Avaliações reais" heading="Quem já recebeu" goldWord="a Kyro" light={false} subtitle="Experiências de clientes com os nossos serviços de limpeza." /><ServiceReviewsGrid serviceSlug="limpeza-colchoes" seed={pathname} heading="" /></div></section>
    </>}
    <ServiceFAQ faqs={page.faqs} variant="light" heading="Dúvidas sobre o tratamento" includeSchema={false} />
    <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pb-16"><h2 className="font-playfair text-2xl mb-5">Escolha os artigos e os tratamentos</h2><div className="flex flex-wrap gap-3">{services.map(s => <Link className="border rounded-lg p-3" key={s.slug} to={`/${s.slug}${page.city ? `-${page.city.slug}` : ''}`}>{s.name}</Link>)}{treatments.map(t => <Link className="border rounded-lg p-3" key={t.slug} to={`/${t.slug}${page.city ? `-${page.city.slug}` : ''}`}>{t.name}</Link>)}<Link to="/guia-de-packs" className="border rounded-lg p-3">Ver packs</Link></div>
    {!page.city && <details className="mt-8"><summary className="cursor-pointer font-semibold">Consultar localidades</summary><div className="flex flex-wrap gap-3 mt-5">{[...cities, ...expansionCities].map(c => <Link className="underline" key={c.slug} to={`${pathname}-${c.slug}`}>{c.name}</Link>)}</div></details>}</section>
  </main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: page.faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }) }} /></>;
}
