import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SocialProofBar from "@/components/SocialProofBar";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";

// Lazy load sections below the fold
const HomepageBlogSection = lazy(() => import("@/components/HomepageBlogSection"));
const Services = lazy(() => import("@/components/Services"));
const PainPointsSolutions = lazy(() => import("@/components/PainPointsSolutions"));
const HowItWorks = lazy(() => import("@/components/HowItWorks"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const HomepageFAQ = lazy(() => import("@/components/HomepageFAQ"));
const FinalCTA = lazy(() => import("@/components/FinalCTA"));
const Footer = lazy(() => import("@/components/Footer"));

// Simple loading placeholder
const SectionLoader = () => (
  <div className="py-8 flex justify-center">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  const handleOpenQuiz = () => {
    window.dispatchEvent(new CustomEvent('openQuiz'));
  };

  return (
    <div className="min-h-screen">
      <Header onOpenQuiz={handleOpenQuiz} />
      <main>
        {/* 1. Hero: Proposta de valor + CTA primário */}
        <Hero />
        
        {/* 2. Social Proof Bar: Validação imediata */}
        <SocialProofBar />
        
        {/* 3. Services: Amplitude + ancoragem de preços */}
        <Suspense fallback={<SectionLoader />}>
          <Services />
        </Suspense>

        {/* 5. Pain Points: Urgência emocional */}
        <Suspense fallback={<SectionLoader />}>
          <PainPointsSolutions />
        </Suspense>
        
        {/* 6. Testimonials: Prova social */}
        <div id="testemunhos" className="scroll-mt-16">
          <Suspense fallback={<SectionLoader />}>
            <Testimonials />
          </Suspense>
        </div>

        {/* 7. How It Works + Qualidade Garantida */}
        <div id="como-funciona" className="scroll-mt-16">
          <Suspense fallback={<SectionLoader />}>
            <HowItWorks />
          </Suspense>
        </div>

        {/* 9. FAQ: Resolve objeções finais */}
        <div id="faq" className="scroll-mt-16">
          <Suspense fallback={<SectionLoader />}>
            <HomepageFAQ />
          </Suspense>
        </div>
        
        {/* 10. Blog: Freshness signal + internal links */}
        <Suspense fallback={<SectionLoader />}>
          <HomepageBlogSection />
        </Suspense>

        {/* 11. Final CTA: Captura indecisos */}
        <Suspense fallback={<SectionLoader />}>
          <FinalCTA />
        </Suspense>
      </main>
      
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      
      <LocalBusinessSchema />
    </div>
  );
};

export default Index;
