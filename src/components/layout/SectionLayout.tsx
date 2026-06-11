import { LucideIcon, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface BenefitItem {
  icon: LucideIcon;
  text: string;
}

interface SectionLayoutProps {
  // Header
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  
  // Content - Two Column Layout
  contentLabel?: string;
  contentLabelIcon?: LucideIcon;
  contentTitle?: string;
  contentIntro?: string;
  benefits?: BenefitItem[];
  
  // CTA
  ctaText?: string;
  ctaAction?: () => void;
  ctaLink?: string;
  
  // Image
  image?: string;
  imageAlt?: string;
  
  // Layout options
  reversed?: boolean; // Image on left, content on right
  centered?: boolean; // Centered layout without two columns
  className?: string;
  id?: string;
  
  // Children for custom content
  children?: React.ReactNode;
}

export const SectionLayout = ({
  badge,
  badgeIcon: BadgeIcon = Sparkles,
  title,
  titleHighlight,
  subtitle,
  contentLabel,
  contentLabelIcon: ContentLabelIcon,
  contentTitle,
  contentIntro,
  benefits,
  ctaText,
  ctaAction,
  ctaLink,
  image,
  imageAlt,
  reversed = false,
  centered = false,
  className,
  id,
  children,
}: SectionLayoutProps) => {
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

  const scrollToContact = () => {
    const contactSection = document.querySelector('#contactos');
    contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCta = ctaAction || scrollToContact;

  return (
    <section 
      ref={sectionRef}
      id={id}
      className={cn(
        "py-16 md:py-20 bg-gradient-to-b from-secondary/30 via-secondary/10 to-background overflow-hidden",
        className
      )}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {(badge || title) && (
          <div className={`text-center mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            {badge && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <BadgeIcon className="h-5 w-5 text-gold" />
                <span className="text-[#111111] font-semibold tracking-wide">{badge}</span>
              </div>
            )}
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#111111]">
              {title}
              {titleHighlight && (
                <>
                  {' '}<span className="text-turquoise">{titleHighlight}</span>
                </>
              )}
            </h2>
            {subtitle && (
              <p className="text-[#111111]/55 text-base md:text-lg max-w-2xl mx-auto mt-3">
                {subtitle}
              </p>
            )}
            <div className="w-16 h-0.5 bg-gold mx-auto mt-4"></div>
          </div>
        )}

        {/* Two Column Layout */}
        {!centered && (contentTitle || image) && (
          <div className={cn(
            "grid lg:grid-cols-2 gap-8 lg:gap-12 items-center",
            reversed && "lg:[&>*:first-child]:order-2"
          )}>
            {/* Text Column */}
            <div 
              className={`space-y-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: '100ms' }}
            >
              {/* Mini Label */}
              {contentLabel && ContentLabelIcon && (
                <div className="flex items-center gap-2">
                  <ContentLabelIcon className="w-5 h-5 text-gold" />
                  <span className="text-gold font-semibold text-sm tracking-wide uppercase">
                    {contentLabel}
                  </span>
                </div>
              )}

              {/* Content Title */}
              {contentTitle && (
                <h3 className="text-2xl md:text-3xl font-bold text-[#111111] leading-tight">
                  {contentTitle}
                </h3>
              )}

              {/* Intro */}
              {contentIntro && (
                <p className="text-[#111111]/80 leading-relaxed">
                  {contentIntro}
                </p>
              )}

              {/* Benefits List */}
              {benefits && benefits.length > 0 && (
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => {
                    const BenefitIcon = benefit.icon;
                    return (
                      <li 
                        key={index}
                        className={`flex items-start gap-3 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                        style={{ transitionDelay: `${(index + 2) * 100}ms` }}
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-turquoise/10 flex items-center justify-center mt-0.5">
                          <BenefitIcon className="w-3.5 h-3.5 text-turquoise" />
                        </div>
                        <span className="text-[#111111]/80 text-sm md:text-base leading-relaxed">
                          {benefit.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* CTA Button */}
              {ctaText && (
                <div className="pt-2">
                  <Button 
                    onClick={handleCta}
                    className="group bg-gradient-to-r from-gold to-[#d4c78d] hover:from-[#d4c78d] hover:to-gold text-[#111111] font-semibold px-6 py-3 h-auto rounded-full shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* Image Column */}
            {image && (
              <div 
                className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                style={{ transitionDelay: '200ms' }}
              >
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-gold/20 via-turquoise/20 to-gold/20 rounded-3xl blur-xl opacity-50"></div>
                
                {/* Image */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-secondary/10">
                  <img
                    src={image}
                    alt={imageAlt || ""}
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-auto aspect-[4/3] object-cover transition-transform duration-700 hover:scale-[1.02]"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/30 via-transparent to-transparent"></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Children */}
        {children}
      </div>
    </section>
  );
};

// Unified Benefit Item Component
interface UnifiedBenefitProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
  isVisible?: boolean;
}

export const UnifiedBenefitItem = ({ icon: Icon, title, description, index = 0, isVisible = true }: UnifiedBenefitProps) => (
  <div 
    className={`flex items-start gap-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    style={{ transitionDelay: `${(index + 1) * 100}ms` }}
  >
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center">
      <Icon className="w-6 h-6 text-gold" />
    </div>
    <div className="flex-1">
      <h3 className="text-gold font-semibold text-lg md:text-xl mb-2 tracking-wide">
        {title}
      </h3>
      <p className="text-[#111111]/80 text-base md:text-lg leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

export default SectionLayout;
