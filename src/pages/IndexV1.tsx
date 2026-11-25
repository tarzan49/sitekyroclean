import { lazy, Suspense, useEffect } from "react";
import Header from "@/components/Header";
import HeroV1 from "@/components/HeroV1";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";

const HomepageBlogSection  = lazy(() => import("@/components/HomepageBlogSection"));
const Services             = lazy(() => import("@/components/Services"));
const HomeServiceVideos    = lazy(() => import("@/components/HomeServiceVideos"));
const HomePriceSection     = lazy(() => import("@/components/HomeSections").then(m => ({ default: m.HomePriceSection })));
const HomeStorySection     = lazy(() => import("@/components/HomeSections").then(m => ({ default: m.HomeStorySection })));
const HomeFaqSection       = lazy(() => import("@/components/HomeSections").then(m => ({ default: m.HomeFaqSection })));
const HomeClosingSection   = lazy(() => import("@/components/HomeSections").then(m => ({ default: m.HomeClosingSection })));
const PainPointsSolutionsV1 = lazy(() => import("@/components/PainPointsSolutionsV1"));
const HowItWorksV1         = lazy(() => import("@/components/HowItWorksV1"));
const TestimonialsV1       = lazy(() => import("@/components/TestimonialsV1"));
const FinalCTAV1           = lazy(() => import("@/components/FinalCTAV1"));
const Footer               = lazy(() => import("@/components/Footer"));

// Ocupa já um ecrã: quando a secção chega, a página não muda de altura a meio do scroll.
const SectionLoader = () => (
  <div className="flex min-h-[100dvh] items-center justify-center">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

const IndexV1 = () => {
  // Secções de ecrã inteiro com encaixe no scroll, como nas páginas de serviço (dono, 24 Nov).
  useEffect(() => {
    document.documentElement.classList.add('snap-sections', 'snap-home');
    return () => document.documentElement.classList.remove('snap-sections', 'snap-home');
  }, []);

  return (
    <div className="min-h-screen" data-home-scroller>
      <Header />
      <main>
        <HeroV1 />

        <Suspense fallback={<SectionLoader />}>
          <HomeServiceVideos />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <HomePriceSection />
        </Suspense>

        <div id="testemunhos" className="scroll-mt-16">
          <Suspense fallback={<SectionLoader />}>
            <TestimonialsV1 />
          </Suspense>
        </div>

        <Suspense fallback={<SectionLoader />}>
          <HomeStorySection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <HomeFaqSection />
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
