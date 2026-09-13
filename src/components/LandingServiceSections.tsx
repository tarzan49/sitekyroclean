import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getLandingPageModel } from '@/data/landingPageModel';
import { LANDING_SECTION_ORDER } from '@/data/landingServiceCopy';
import { PROBLEM_IMAGES } from '@/constants/problemCardHelpers';
import { SERVICE_TO_QUIZ, SERVICEKEY_TO_QUIZ } from '@/constants/serviceToQuiz';
import { useQuizLauncher } from '@/hooks/use-quiz-launcher';
import SectionHeader from './SectionHeader';
import PriceWidget from './PriceWidget';
import PriceFactors from './PriceFactors';
import { ServiceTrustDesktop, ServiceTrustMobile } from './ServiceTrustBlock';
import CustomerReviews from './CustomerReviews';
import ProblemCarousel from './ProblemCarousel';
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
  const model = useMemo(() => getLandingPageModel(pathname), [pathname]);
  const { isQuizOpen, openQuiz, closeQuiz } = useQuizLauncher();
  if (!model) return null;
  const hideDirectory = model.serviceSlug === 'limpeza-sofas' && ['localidade', 'variante'].includes(model.family) && isAdsVisit(search);
  const trustVariant = model.family === 'freguesia' ? 2 : 1;
  const trustSeed = model.family === 'freguesia' ? `${model.municipalityName}-${model.locationName}` : model.locationName;
  const quizService = model.serviceKey ? SERVICEKEY_TO_QUIZ[model.serviceKey] : SERVICE_TO_QUIZ[model.serviceSlug];
  const sections = {
    precos: <section id="precos" className="scroll-mt-20 py-14 md:py-20 bg-[#FDFDF9]">
      <div className={container}>
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <SectionHeader overline="Tabela de Preços" heading={`Quanto custa ${model.priceVerb} ${model.prep}`} goldWord={model.locationName} subtitle={model.pricingDescription} />
            {model.variantExplanation && <p className="text-sm leading-relaxed text-[#536259] mb-6">{model.variantExplanation}</p>}
            <div className="hidden md:block"><ServiceTrustDesktop serviceSlug={model.serviceSlug} variant={trustVariant} seedKey={trustSeed} /></div>
          </div>
          <PriceWidget key={`${model.serviceSlug}:${model.municipalityName}`} serviceSlug={model.serviceSlug} initialLocation={model.municipalityName} />
        </div>
        <div className="md:hidden"><ServiceTrustMobile serviceSlug={model.serviceSlug} variant={trustVariant} seedKey={trustSeed} /></div>
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
    problemas: <section id="problemas" className="scroll-mt-20 py-14 md:py-20 bg-[#FDFDF9]">
      <div className={container}>
        <SectionHeader overline="O Que Resolvemos" heading={model.problemHeading.slice(0, -(model.locationName.length + 1))} goldWord={model.locationName} />
        <p className="-mt-5 mb-7 max-w-xl text-sm sm:text-base leading-relaxed text-[#536259]">Reconhece algum destes sinais? Peça uma avaliação e descubra o tratamento adequado ao seu caso.</p>
        <ProblemCarousel key={model.path}>
          {model.problems.map((card, index) => <article key={card.id} data-problem-id={card.id} className="snap-start flex-none w-[84vw] max-w-[380px] md:max-w-none md:w-auto overflow-hidden rounded-sm border border-[#183b2c]/15 bg-[#0c241a] group flex flex-col shadow-[0_8px_24px_rgba(7,26,18,0.10)]">
            <div className="relative h-[185px] sm:h-[220px] overflow-hidden">
              <img src={PROBLEM_IMAGES[model.serviceSlug][card.imageIndex]} alt={card.title} className="w-full h-full object-cover saturate-[0.85] motion-safe:group-hover:scale-[1.03] transition-transform duration-700" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c241a]/35 to-transparent" />
              <span className="absolute top-4 left-4 px-2.5 py-1.5 bg-[#071a12]/85 border border-white/20 text-[#e1c477] text-[10px] font-semibold tracking-[0.16em]">{String(index + 1).padStart(2, '0')} / 04</span>
            </div>
            <div className="p-5 sm:p-6 flex flex-col flex-1">
              <div className="w-7 h-px bg-gold mb-4" />
              <h3 className="font-playfair font-semibold text-white text-[23px] leading-tight mb-3">{card.title}</h3>
              <p className="text-white/75 text-sm leading-relaxed mb-6">{card.description}</p>
              <div className="mt-auto">
                <button type="button" onClick={openQuiz} aria-label={`Pedir avaliação: ${card.title}`} className="w-full min-h-12 flex items-center justify-between gap-3 rounded-sm px-4 py-3 text-sm font-bold text-[#071a12] bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold active:scale-[0.98] transition-all touch-manipulation">Pedir avaliação <ArrowRight className="w-5 h-5 shrink-0" /></button>
                <p className="text-white/60 text-[11px] text-center mt-2.5">Orçamento gratuito · Sem compromisso</p>
              </div>
            </div>
          </article>)}
        </ProblemCarousel>
      </div>
    </section>,
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
