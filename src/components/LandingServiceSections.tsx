import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { bootstrapLandingModel } from '@/data/landingModelBootstrap';
import type { LandingPageModel } from '@/data/landingPageModel';
import { LANDING_SECTION_ORDER } from '@/data/landingServiceCopy';
import { PROBLEM_IMAGES } from '@/constants/problemCardHelpers';
import { SERVICE_TO_QUIZ, SERVICEKEY_TO_QUIZ } from '@/constants/serviceToQuiz';
import { useQuizLauncher } from '@/hooks/use-quiz-launcher';
import SectionHeader from './SectionHeader';
import PriceWidget from './PriceWidget';
import PriceFactors from './PriceFactors';
import { ServiceTrustDesktop, ServiceTrustMobile } from './ServiceTrustBlock';
import CustomerReviews from './CustomerReviews';
import VisualExamplesGallery from './VisualExamplesGallery';
import ServiceFAQ from './ServiceFAQ';
import SofaProcessGuide from './SofaProcessGuide';
import ServiceProcessGuide from './ServiceProcessGuide';
import ServicePackBanner from './ServicePackBanner';
import DirectoryGroup from './DirectoryGroup';
import QuizFormLazy from './QuizFormLazy';
import { isAdsVisit } from './AdsLandingNavigation';

const container = 'max-w-7xl mx-auto px-5 sm:px-6 lg:px-8';

/** The seven-section composition for the four SEO landing families only. */
export default function LandingServiceSections() {
  const { pathname, search } = useLocation();
  // Entrada normal (vinda do Google): o modelo veio no HTML, sem catálogos.
  const fromHtml = bootstrapLandingModel(pathname);
  // Navegação dentro do site: aí sim o catálogo é preciso, e só aí.
  const [loaded, setLoaded] = useState<{ path: string; model: LandingPageModel | null } | null>(null);
  useEffect(() => {
    if (fromHtml) return;
    let current = true;
    void import('@/data/landingPageModel').then(({ getLandingPageModel }) => {
      if (current) setLoaded({ path: pathname, model: getLandingPageModel(pathname) });
    });
    return () => { current = false; };
  }, [pathname, fromHtml]);
  const model = fromHtml ?? (loaded?.path === pathname ? loaded.model : null);
  const { isQuizOpen, openQuiz, closeQuiz } = useQuizLauncher();
  if (!model) return null;
  const hideDirectory = model.serviceSlug === 'limpeza-sofas' && ['localidade', 'variante'].includes(model.family) && isAdsVisit(search);
  const quizService = model.serviceKey ? SERVICEKEY_TO_QUIZ[model.serviceKey] : SERVICE_TO_QUIZ[model.serviceSlug];
  const sections = {
    precos: <section id="precos" className="scroll-mt-20 py-14 md:py-20 bg-[#FDFDF9]">
      <div className={container}>
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <SectionHeader overline="Tabela de Preços" heading={`Quanto custa ${model.priceVerb} ${model.prep}`} goldWord={model.locationName} />
            <div className="hidden md:block">
              {model.variantExplanation && <p className="mt-4 text-sm leading-relaxed text-[#536259] mb-6">{model.variantExplanation}</p>}
              <ServiceTrustDesktop serviceSlug={model.serviceSlug} points={model.trustPoints} />
            </div>
          </div>
          <PriceWidget key={`${model.serviceSlug}:${model.municipalityName}`} serviceSlug={model.serviceSlug} initialLocation={model.municipalityName} />
        </div>
        <div className="md:hidden"><ServiceTrustMobile serviceSlug={model.serviceSlug} points={model.trustPoints} /></div>
        {model.family === 'preco' && <details className="mt-7 border-t border-[#173629]/20">
          <summary className="min-h-12 py-4 cursor-pointer font-semibold text-[#173629]">Como é calculado o preço?</summary>
          <PriceFactors serviceSlug={model.serviceSlug} embedded />
        </details>}
      </div>
    </section>,
    avaliacoes: <section id="avaliacoes" className="scroll-mt-20 py-14 md:py-20 bg-kyro-green">
      <div className={container}>
        <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
        <CustomerReviews reviews={model.reviews} />
      </div>
    </section>,
    problemas: <VisualExamplesGallery key={model.path} id="problemas" overline="Problemas comuns" heading="Veja alguns" name="exemplos" onEnquire={openQuiz} examples={model.problems.map(card => ({
      id: card.id, label: card.title, description: card.description,
      src: card.image?.src ?? PROBLEM_IMAGES[model.serviceSlug][card.imageIndex],
      alt: card.image?.alt ?? card.title,
    }))} />,
    duvidas: <div id="duvidas" className="scroll-mt-20"><ServiceFAQ key={model.path} faqs={model.faqs} heading={model.faqHeading} /></div>,
    processo: model.serviceSlug === 'limpeza-sofas' ? <SofaProcessGuide key={model.path} city={model.locationName} cityPrep={model.prep} /> : <ServiceProcessGuide key={model.path} serviceSlug={model.serviceSlug} city={model.locationName} cityPrep={model.prep} />,
    'mesma-visita': <div id="mesma-visita" className="scroll-mt-20"><ServicePackBanner packSlugs={model.packSlugs} city={model.municipalitySlug} variant="dark" /></div>,
    zonas: <section id="zonas" className="scroll-mt-20 py-14 md:py-20 bg-[#FDFDF9]">
      <div className={container}>
        <SectionHeader overline="Explore por categoria" heading={`Serviços e zonas de atendimento ${model.prep}`} goldWord={model.locationName} subtitle="Encontre a sua zona e explore outros serviços. Abra uma categoria para ver mais." />
        <div className="max-w-4xl border-t border-[#D4AF37]/25">
          {model.directory.map(group => <DirectoryGroup key={group.title} title={group.title}>
            {group.links.map(link => <Link key={link.href} to={link.href} className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all">{link.label}</Link>)}
          </DirectoryGroup>)}
        </div>
      </div>
    </section>,
  };
  return <>
    {LANDING_SECTION_ORDER.filter(section => section !== 'zonas' || !hideDirectory).map(section => <div key={section} data-landing-section={section}>{sections[section]}</div>)}
    <QuizFormLazy isOpen={isQuizOpen} onClose={closeQuiz} initialLocation={model.municipalityName} initialService={quizService} initialServiceType={model.serviceSlug === 'impermeabilizacao' ? 'waterproofing' : 'cleaning'} initialCarpetKind={model.serviceSlug === 'limpeza-alcatifas' ? 'alcatifa' : 'tapete'} />
  </>;
}
