import ResourcePriceSection from '@/components/ResourcePriceSection';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CompactFAQ from '@/components/CompactFAQ';
import { useSnapSections } from '@/hooks/useSnapSections';
import SectionHeader from '@/components/SectionHeader';
import heroVideo from '@/assets/cadeiras-processo/extracao.mp4';
import heroPoster from '@/assets/quiz-videos-capas/cadeiras.jpg';
import mSofa from '@/assets/menu/sofa.webp';
import mColchao from '@/assets/menu/colchao.webp';
import mCadeiras from '@/assets/menu/cadeiras.webp';
import mTapete from '@/assets/menu/tapete.webp';
import mAlcatifa from '@/assets/menu/alcatifa.webp';
import mImper from '@/assets/menu/imper.webp';
import ResourceHubHero from '@/components/ResourceHubHero';
import ResourceNav from '@/components/ResourceNav';
import { RESOURCE_FAQS, RESOURCE_FAQ_TITLE, RESOURCE_FAQ_INTRO, RESOURCE_SERVICES } from '@/data/resourceContent';
import { SITE_URL } from '@/constants/business';
import { clearPrerenderedFaqSchema } from '@/lib/seoSchema';

const SERVICE_PHOTO: Record<string, string> = { '/limpeza-sofas': mSofa, '/limpeza-colchoes': mColchao, '/limpeza-cadeiras': mCadeiras, '/limpeza-tapetes': mTapete, '/limpeza-alcatifas': mAlcatifa, '/impermeabilizacao': mImper };

export default function FAQEstofos() {
  useSnapSections(true);
  useEffect(() => {
    clearPrerenderedFaqSchema();
    document.title = `${RESOURCE_FAQ_TITLE} | Kyro Clean`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', RESOURCE_FAQ_INTRO);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${RESOURCE_FAQ_TITLE} | Kyro Clean`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', RESOURCE_FAQ_INTRO);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${SITE_URL}/perguntas-frequentes-limpeza-estofos`);
  }, []);
  return <><Header /><main className="bg-[#FDFDF9] min-h-screen">
    <ResourceHubHero title={RESOURCE_FAQ_TITLE} description={RESOURCE_FAQ_INTRO} video={heroVideo} poster={heroPoster} />
    <div className="hidden md:block"><ResourceNav afterHero /></div>
    <CompactFAQ id="duvidas" faqs={RESOURCE_FAQS.map(f => ({ question: f.question, answer: f.answer }))} heading="As suas perguntas" dark />
    <section id="servicos" className="scroll-mt-20 bg-[#FDFDF9] py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
        <SectionHeader heading="Preços e cuidados por" goldWord="serviço" light />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">{RESOURCE_SERVICES.map(s => <Link key={s.href} to={s.href} className="group relative overflow-hidden rounded-2xl bg-[#0B2F2A]">
          <img src={SERVICE_PHOTO[s.href]} alt="" width={400} height={300} loading="lazy" decoding="async" className="h-[120px] w-full object-cover sm:h-[180px]" />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-8 text-[17px] font-semibold text-white">{s.label}</span>
        </Link>)}</div>
      </div>
    </section>
    <ResourcePriceSection source="resource_price_faq_estofos" />
  </main><Footer /></>;
}
