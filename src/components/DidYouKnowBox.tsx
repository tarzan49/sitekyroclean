import { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DidYouKnowBoxProps {
  text: string;
}

const DidYouKnowBox = ({ text }: DidYouKnowBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl md:rounded-2xl cursor-pointer",
        "bg-kyro-green/90 backdrop-blur-lg",
        "border transition-all duration-300",
        isOpen
          ? "border-gold/50 shadow-[0_8px_40px_rgba(190,180,125,0.18)]"
          : "border-gold/25 shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* Gold gradient top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      {/* Header - always visible */}
      <div className="flex items-center justify-between p-4 md:p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-gold" strokeWidth={1.5} />
          </div>
          <h4 className="font-playfair text-base md:text-lg font-bold text-white">
            Sabia que:
          </h4>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-gold/60 transition-transform duration-300 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {/* Content - expandable */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 md:px-5 pb-5 pt-0">
          {/* Subtle divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-4" />
          <p className="text-white/75 text-sm md:text-base leading-relaxed">
            {text}
          </p>
        </div>
      </div>

      {/* Bottom gold gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </div>
  );
};

export default DidYouKnowBox;
