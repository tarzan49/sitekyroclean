import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

const SocialProofBar = () => {
  const { t } = useTranslation();

  const items = [
    t('socialProof.guarantee', 'Garantia de satisfação'),
    t('socialProof.rating', 'Avaliação 5.0 no Google'),
    t('socialProof.clients', 'Mais de 1000 clientes satisfeitos'),
    t('socialProof.specialists', 'Técnicos especializados'),
  ];

  return (
    <div className="bg-kyro-green text-primary-foreground py-3 md:py-3.5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-gold" />
                <span className="text-[11px] md:text-xs font-medium text-primary-foreground/90 whitespace-nowrap">
                  {item}
                </span>
              </span>
              {index < items.length - 1 && (
                <span className="hidden md:inline text-white/20">•</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialProofBar;
