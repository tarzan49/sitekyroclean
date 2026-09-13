import { Star } from 'lucide-react';
import { GoogleG } from '@/components/icons/GoogleG';
import { REVIEW_COUNT, REVIEW_RATING, SERVICES_COMPLETED_LABEL } from '@/constants/business';
import { GOOGLE_REVIEWS_VIEW_URL } from '@/constants/google';

/** A transparent trust strip that leaves the cleaning result unobstructed. */
export default function HomeHeroTrust() {
  return (
    <div className="mx-auto flex w-fit max-w-full items-center justify-center gap-4 text-white md:gap-7">
      <div className="shrink-0">
        <span className="block font-playfair text-[26px] font-semibold leading-none text-[#E7CE73] md:text-[34px]">{SERVICES_COMPLETED_LABEL}</span>
        <span className="mt-1.5 block text-[10px] leading-tight text-white/80 md:text-xs">serviços realizados</span>
      </div>
      <span className="h-9 w-px shrink-0 bg-white/25 md:h-11" aria-hidden="true" />
      <a
        href={GOOGLE_REVIEWS_VIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-sm py-1 outline-offset-4 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
        aria-label={`${REVIEW_RATING} de 5 estrelas, mais de ${REVIEW_COUNT} avaliações no Google. Ler avaliações`}
      >
        <span className="flex items-center gap-2">
          <GoogleG className="h-5 w-5 shrink-0 md:h-6 md:w-6" />
          <span className="font-playfair text-[26px] font-semibold leading-none md:text-[34px]">{REVIEW_RATING}</span>
          <span className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className="relative block h-2.5 w-2.5 md:h-3 md:w-3">
                <Star className="absolute h-full w-full fill-white/20 text-white/20" />
                <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${Math.max(0, Math.min(1, Number(REVIEW_RATING) - i)) * 100}%` }}>
                  <Star className="h-2.5 w-2.5 fill-[#D4AF37] text-[#D4AF37] md:h-3 md:w-3" />
                </span>
              </span>
            ))}
          </span>
        </span>
        <span className="mt-1.5 block text-[10px] leading-tight text-white/80 md:text-xs"><strong className="font-semibold text-white">{REVIEW_COUNT}+</strong> avaliações Google</span>
      </a>
    </div>
  );
}
