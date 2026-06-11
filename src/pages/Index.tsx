import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SocialProofBar from "@/components/SocialProofBar";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";

const ResultsSection     = lazy(() => import("@/components/ResultsSection"));
const Services           = lazy(() => import("@/components/Services"));
const PainPointsSolutions = lazy(() => import("@/components/PainPointsSolutions"));
const HowItWorks         = lazy(() => import("@/components/HowItWorks"));
const Testimonials       = lazy(() => import("@/components/Testimonials"));
const HomepageFAQ        = lazy(() => import("@/components/HomepageFAQ"));
const HomepageBlogSection = lazy(() => import("@/components/HomepageBlogSection"));
const FinalCTA           = lazy(() => import("@/components/FinalCTA"));
const Footer             = lazy(() => import("@/components/Footer"));

const SectionLoader = () => (
  <div className="py-12 flex justify-center">
    <div className="w-6 h-6 border border-[#111111]/20 border-t-[#D4AF37] rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <Hero />

        {/* Social proof bar — immediate validation */}
        <SocialProofBar />

        {/* Results — visual proof before/after */}
        <Suspense fallback={<SectionLoader />}>
          <ResultsSection />
        </Suspense>

        {/* Services — scope + price anchoring */}
        <Suspense fallback={<SectionLoader />}>
          <Services />
        </Suspense>

        {/* Pain points — emotional urgency */}
        <Suspense fallback={<SectionLoader />}>
          <PainPointsSolutions />
        </Suspense>

        {/* Testimonials — social proof */}
        <div id="testemunhos" className="scroll-mt-16">
          <Suspense fallback={<SectionLoader />}>
            <Testimonials />
          </Suspense>
        </div>

        {/* Process + guarantees */}
        <div id="como-funciona" className="scroll-mt-16">
          <Suspense fallback={<SectionLoader />}>
            <HowItWorks />
          </Suspense>
        </div>

        {/* FAQ */}
        <div id="faq" className="scroll-mt-16">
          <Suspense fallback={<SectionLoader />}>
            <HomepageFAQ />
          </Suspense>
        </div>

        {/* Blog */}
        <Suspense fallback={<SectionLoader />}>
          <HomepageBlogSection />
        </Suspense>

        {/* Final CTA */}
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
