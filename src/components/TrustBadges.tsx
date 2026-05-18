import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import cleanSafeSeal from "@/assets/clean-safe-seal-new.webp";

const TrustBadges = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-10 md:py-14 bg-[#FDFDF9] overflow-hidden border-t border-[rgba(26,78,48,0.08)]"
    >
      <div className="container mx-auto px-4">
        <div
          className={`max-w-4xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">

            {/* Certifications */}
            <div className="flex items-center gap-6">
              <div className="group">
                <img
                  src={cleanSafeSeal}
                  alt="Clean & Safe Certification"
                  className="h-16 md:h-20 w-auto object-contain grayscale-[40%] group-hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                />
              </div>
              {/* Google Reviews badge */}
              <div className="flex flex-col items-center gap-1 bg-[#FFFFFF] rounded-xl px-5 py-3 shadow-sm border border-[rgba(26,78,48,0.10)]">
                <div className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm font-bold text-[#12121e]">5.0</span>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-gold fill-gold" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-[10px] text-[#12121e]/50 font-medium">
                  {t('trustBadges.googleReviews', 'Avaliações Google')}
                </span>
              </div>
            </div>

            {/* Service Area: single elegant line */}
            <div className="flex items-center gap-2 text-[#12121e]/60">
              <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
              <p className="text-sm md:text-base font-medium">
                Atendimento em todo o <span className="text-[#12121e] font-semibold">Grande Porto</span> e <span className="text-[#12121e] font-semibold">Norte de Portugal</span>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
