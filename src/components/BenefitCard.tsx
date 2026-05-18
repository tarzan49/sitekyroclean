import { useEffect, useRef, useState } from 'react';
import { Shield, Sparkles, Heart, Clock, Leaf, Home, Star, Users, Droplets, Zap } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';

interface BenefitCardProps {
  title: string;
  description: string;
  index: number;
  iconType?: 'shield' | 'sparkles' | 'heart' | 'clock' | 'leaf' | 'home' | 'star' | 'users' | 'droplets' | 'zap';
}

const iconMap = {
  shield: Shield,
  sparkles: Sparkles,
  heart: Heart,
  clock: Clock,
  leaf: Leaf,
  home: Home,
  star: Star,
  users: Users,
  droplets: Droplets,
  zap: Zap,
};

const BenefitCard = ({ title, description, index, iconType = 'shield' }: BenefitCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = iconMap[iconType];

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`
        bg-[#FFFFFF] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md border border-[rgba(26,78,48,0.08)]
        active:shadow-lg md:hover:shadow-lg active:border-gold/30 md:hover:border-gold/30 
        transition-all duration-300 touch-manipulation
        transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}
      `}
      style={{ 
        transitionDelay: `${index * 80}ms`,
        transitionProperty: 'transform, opacity, box-shadow, border-color'
      }}
    >
      <div className="flex gap-3 md:gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gold/10 flex items-center justify-center">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-gold" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 
            className="text-base md:text-lg font-bold text-[#1A1A2E] mb-1 md:mb-2 leading-snug"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }}
          />
          <p className="text-[#1A1A2E]/55 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BenefitCard;
