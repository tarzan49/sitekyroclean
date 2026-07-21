import { Star, MapPin, Phone, Users } from "lucide-react";
import { REVIEW_RATING, REVIEW_COUNT, PHONE_TEL, PHONE_DISPLAY } from "@/constants/business";
import { GOOGLE_REVIEWS_VIEW_URL } from "@/constants/google";
import { trackCallClick } from "@/lib/analytics";

type TrustRatingBadgeProps = {
  variant: "hero" | "compact" | "mapsLink" | "mapsLinkClients" | "pillSmall" | "horizontal" | "card";
};

const pillClass = "flex items-center gap-2 bg-black/30 border border-white/[0.14] rounded-full px-4 py-2 backdrop-blur-sm";

const TrustRatingBadge = ({ variant }: TrustRatingBadgeProps) => {
  switch (variant) {
    case "hero":
      return (
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />
                ))}
              </div>
              <span className="text-white font-bold text-sm">{REVIEW_RATING}</span>
              <span className="text-white/50 text-xs">Google</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white/60 text-xs font-medium">{REVIEW_COUNT}+ avaliações</span>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white/60 text-xs font-medium">+1000 clientes</span>
          </div>
          <a
            href={`tel:${PHONE_TEL}`}
            onClick={() => trackCallClick('hero_mobile')}
            className="md:hidden inline-flex items-center gap-1.5 text-white/45 text-xs mt-2.5 hover:text-white/70 transition-colors"
          >
            <Phone className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
            Prefere ligar? {PHONE_DISPLAY}
          </a>
        </div>
      );

    case "compact":
      return (
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />
          ))}
          <span className="text-sm text-white/60 ml-1">{REVIEW_RATING} · {REVIEW_COUNT}+ avaliações</span>
        </div>
      );

    case "mapsLink":
      return (
        <a
          href={GOOGLE_REVIEWS_VIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${pillClass} hover:bg-black/45 transition-colors group`}
        >
          <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0 group-hover:scale-110 transition-transform" strokeWidth={2} />
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" />
            ))}
          </div>
          <span className="text-white/80 text-[11px] font-semibold tracking-wide">
            {REVIEW_RATING} · {REVIEW_COUNT}+ avaliações Google
          </span>
        </a>
      );

    case "mapsLinkClients":
      return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <a
            href={GOOGLE_REVIEWS_VIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${pillClass} hover:bg-black/45 transition-colors group justify-center whitespace-nowrap`}
          >
            <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0 group-hover:scale-110 transition-transform" strokeWidth={2} />
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
            <span className="text-white/80 text-[11px] font-semibold tracking-wide">
              {REVIEW_RATING} · {REVIEW_COUNT}+ avaliações Google
            </span>
          </a>
          <div className={`${pillClass} justify-center whitespace-nowrap`}>
            <Users className="w-3.5 h-3.5 text-gold flex-shrink-0" strokeWidth={2} />
            <span className="text-white/80 text-[11px] font-semibold tracking-wide">+1000 clientes</span>
          </div>
        </div>
      );

    case "pillSmall":
      return (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-gold text-gold" />
            ))}
          </div>
          <span className="text-white/50 text-[11px]">{REVIEW_RATING} · {REVIEW_COUNT}+ avaliações</span>
        </div>
      );

    case "horizontal":
      return (
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
            ))}
          </div>
          <span className="text-white font-bold text-sm">{REVIEW_RATING}</span>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-white/45 text-[12px]">{REVIEW_COUNT}+ avaliações no Google</span>
        </div>
      );

    case "card":
      return (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-[#111111]">{REVIEW_RATING}</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
          </div>
          <p className="text-sm text-[#777]">{REVIEW_COUNT}+ avaliações no Google</p>
        </div>
      );
  }
};

export default TrustRatingBadge;
