import { Star, Sparkles, ExternalLink, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface Review {
  name: string;
  text: string;
  rating: number;
}

interface ServiceTestimonialsProps {
  reviews: Review[];
  title?: string;
}

const ServiceTestimonials = ({ reviews, title = "O que dizem os nossos clientes" }: ServiceTestimonialsProps) => {
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const googleReviewsUrl = "https://www.google.com/search?q=Clean%20Solutions%20Reviews&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxI2MzE3NbQ0MDCwMDc0NDI2NjY03sDI-IpR3DknNTFPITg_p7QkMz-vWCEotSwztbx4ESsuGQDbPwsUTgAAAA&rldimm=6475190008711233313&tbm=lcl&hl=en&authuser=3&sa=X&ved=0CCEQ9fQKKABqFwoTCOCM2YHYhpEDFQAAAAAdAAAAABAG#";

  return (
    <section ref={sectionRef} className="py-14 md:py-20 bg-gradient-to-b from-secondary/20 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Premium Header */}
        <div className={`text-center mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-gold" />
            <span className="text-gold font-semibold tracking-wide uppercase text-sm">Testemunhos</span>
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-[#1A1A2E] mb-2">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-turquoise font-semibold">
            Resultados que falam por si.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mt-5"></div>
        </div>

        {/* Premium Review Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10">
          {reviews.map((review, i) => (
            <div 
              key={i} 
              className={`group relative bg-white/95 backdrop-blur-sm p-6 md:p-7 rounded-[22px] shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              {/* Hover glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-gold/10 via-turquoise/10 to-gold/10 rounded-[26px] blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Quote icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-10 h-10 text-gold" />
              </div>

              {/* Stars */}
              <div className="relative flex gap-1.5 mb-4">
                {[...Array(review.rating)].map((_, j) => (
                  <Star 
                    key={j} 
                    className="h-5 w-5 fill-gold text-gold transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" 
                    style={{ transitionDelay: `${j * 50}ms` }}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="relative text-base text-[#1A1A2E]/80 leading-relaxed mb-4">
                "{review.text}"
              </p>

              {/* Name */}
              <p className="relative font-bold text-[#1A1A2E] text-base flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-turquoise to-teal flex items-center justify-center text-white text-sm font-bold">
                  {review.name.charAt(0)}
                </span>
                {review.name}
              </p>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '500ms' }}>
          <a 
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              variant="outline"
              className="group bg-[#FFFFFF] hover:bg-gold/5 border-2 border-gold/30 hover:border-gold text-[#1A1A2E] font-semibold px-6 py-5 h-auto rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span>Veja mais opiniões reais no Google</span>
              <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServiceTestimonials;