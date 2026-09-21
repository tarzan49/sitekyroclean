import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceFAQ from '@/components/ServiceFAQ';
import ResourceLeadCard from '@/components/ResourceLeadCard';
import ResourceHubHero from '@/components/ResourceHubHero';
import ResourceNav from '@/components/ResourceNav';
import { RESOURCE_FAQS, RESOURCE_FAQ_TITLE, RESOURCE_FAQ_INTRO, RESOURCE_SERVICES } from '@/data/resourceContent';
import { SITE_URL } from '@/constants/business';
import { clearPrerenderedFaqSchema } from '@/lib/seoSchema';

export default function FAQEstofos() {
  useEffect(() => {
    clearPrerenderedFaqSchema();
    document.title = `${RESOURCE_FAQ_TITLE} | Kyro Clean`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', RESOURCE_FAQ_INTRO);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${RESOURCE_FAQ_TITLE} | Kyro Clean`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', RESOURCE_FAQ_INTRO);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${SITE_URL}/perguntas-frequentes-limpeza-estofos`);
  }, []);
  return <><Header /><main className="bg-[#FDFDF9] min-h-screen">
    <ResourceHubHero title={RESOURCE_FAQ_TITLE} description={RESOURCE_FAQ_INTRO} />
    <ResourceNav afterHero />
    <div className="max-w-6xl mx-auto px-5 py-8 sm:py-12">
      <p className="text-sm text-[#536259] mb-5"><Link to="/blog" className="underline">Recursos</Link> / Perguntas frequentes</p>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
        <div className="min-w-0">
          <ServiceFAQ faqs={RESOURCE_FAQS} variant="light" heading="As suas perguntas" description="Toque numa pergunta para ver as condições do serviço." />
        </div>
        <ResourceLeadCard />
      </div>
      <section className="py-8 border-t border-[#dfe5df]"><h2 className="type-card-title mb-4">Preços e cuidados por serviço</h2><div className="flex flex-wrap gap-3">{RESOURCE_SERVICES.map(s=><Link key={s.href} to={s.href} className="border border-[#dfe5df] rounded-sm px-4 py-3 text-[#173e2b] min-h-11">{s.label}</Link>)}</div></section>
    </div>
  </main><Footer /></>;
}
