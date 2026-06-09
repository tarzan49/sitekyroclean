import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import HeroV1 from "@/components/HeroV1";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";

const HomepageBlogSection  = lazy(() => import("@/components/HomepageBlogSection"));
const Services             = lazy(() => import("@/components/Services"));
const PainPointsSolutionsV1 = lazy(() => import("@/components/PainPointsSolutionsV1"));
const HowItWorksV1         = lazy(() => import("@/components/HowItWorksV1"));
const TestimonialsV1       = lazy(() => import("@/components/TestimonialsV1"));
const FinalCTAV1           = lazy(() => import("@/components/FinalCTAV1"));
const Footer               = lazy(() => import("@/components/Footer"));

const SectionLoader = () => (
  <div className="py-8 flex justify-center">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

const IndexV1 = () => {
  const handleOpenQuiz = () => {
    window.dispatchEvent(new CustomEvent('openQuiz'));
  };

  return (
    <div className="min-h-screen">
      <Header onOpenQuiz={handleOpenQuiz} />
      <main>
        <HeroV1 />

        <Suspense fallback={<SectionLoader />}>
          <Services />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <PainPointsSolutionsV1 />
        </Suspense>

        <div id="testemunhos" className="scroll-mt-16">
          <Suspense fallback={<SectionLoader />}>
            <TestimonialsV1 />
          </Suspense>
        </div>

        <div id="como-funciona" className="scroll-mt-16">
          <Suspense fallback={<SectionLoader />}>
            <HowItWorksV1 />
          </Suspense>
        </div>

        <Suspense fallback={<SectionLoader />}>
          <HomepageBlogSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <FinalCTAV1 />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      <LocalBusinessSchema />
    </div>
  );
};

export default IndexV1;
