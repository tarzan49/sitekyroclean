import { ExternalLink, Star, MapPin, Phone, Users } from "lucide-react";
import { REVIEW_RATING, REVIEW_COUNT, PHONE_TEL, PHONE_DISPLAY } from "@/constants/business";
import { GOOGLE_REVIEWS_VIEW_URL } from "@/constants/google";
import { trackCallClick } from "@/lib/analytics";
import { GoogleG } from "@/components/icons/GoogleG";

type TrustRatingBadgeProps = {
  variant: "hero" | "heroMobile" | "compact" | "mapsLink" | "floatingHero" | "mapsLinkClients" | "pillSmall" | "horizontal" | "card";
};

const pillClass = "flex items-center gap-2 bg-black/30 border border-white/[0.14] rounded-full px-4 py-2 backdrop-blur-sm";

const TrustRatingBadge = ({ variant }: TrustRatingBadgeProps) => {
  switch (variant) {
    case "heroMobile":
      return (
        <a
          href={GOOGLE_REVIEWS_VIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[66px] items-center gap-2.5 rounded-2xl border border-white/80 bg-white/[0.96] px-3 py-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md"
          aria-label={`${REVIEW_RATING} de 5, ${REVIEW_COUNT}+ avaliações no Google`}
        >
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F7F8F8]">
            <GoogleG className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="font-playfair text-xl font-bold leading-none text-[#0B2F2A]">{REVIEW_RATING}</span>
              <Star className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" aria-hidden="true" />
            </span>
            <span className="mt-1 block text-sm font-bold uppercase leading-tight tracking-[0.1em] text-[#0B2F2A]/60">{REVIEW_COUNT}+ avaliações Google</span>
          </span>
        </a>
      );

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
              <span className="text-white font-bold text-base">{REVIEW_RATING}</span>
              <span className="text-white/80 text-sm">Google</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white/80 text-sm font-medium">{REVIEW_COUNT}+ avaliações</span>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white/80 text-sm font-medium">+1100 clientes</span>
          </div>
          <a
            href={`tel:${PHONE_TEL}`}
            onClick={() => trackCallClick('hero_mobile')}
            className="md:hidden inline-flex items-center gap-1.5 text-white/80 text-sm mt-2.5 hover:text-white/70 transition-colors"
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
          <span className="text-base text-white/80 ml-1">{REVIEW_RATING} · {REVIEW_COUNT}+ avaliações</span>
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
          <span className="text-white/80 text-sm font-semibold tracking-wide">
            {REVIEW_RATING} · {REVIEW_COUNT}+ avaliações Google
          </span>
        </a>
      );

    case "floatingHero":
      return (
        <a
          href={GOOGLE_REVIEWS_VIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex min-h-[88px] min-w-[330px] items-center gap-4 overflow-hidden rounded-[22px] border border-white/80 bg-white/[0.96] px-5 py-4 shadow-[0_22px_55px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
          aria-label={`${REVIEW_RATING} de 5, ${REVIEW_COUNT}+ avaliações no Google`}
        >
          <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" aria-hidden="true" />
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-black/[0.06] bg-[#F7F8F8] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <GoogleG className="h-7 w-7" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold uppercase tracking-[0.2em] text-[#0B2F2A]/60">Avaliação Google</span>
            <span className="mt-1 flex items-end gap-2">
              <span className="font-playfair text-[2rem] font-bold leading-[0.9] text-[#0B2F2A]">{REVIEW_RATING}</span>
              <span className="flex gap-0.5 pb-0.5" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </span>
            </span>
            <span className="mt-1.5 block text-sm font-semibold tracking-wide text-[#0B2F2A]/65">
              {REVIEW_COUNT}+ avaliações de clientes
            </span>
          </span>
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0B2F2A] text-white shadow-sm transition-transform group-hover:translate-x-0.5">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </a>
      );

    case "mapsLinkClients":
      // Escondido em mobile/tablet (pedido explícito 2026-09-09: "o subtitulo
      // + 100+ avaliacoes + 1000 clientes tem que estar em somente 2 frases,
      // neste momento ocupam um quadrado significativo da tela do iphone" —
      // essa informação passou a viver no 1º bloco do ServiceSnapshotStats
      // logo abaixo, que já mostra nota+avaliações Google de forma compacta).
      // Desktop mantém os 2 pills como estavam.
      return (
        <div className="hidden lg:flex lg:items-center gap-2 w-full lg:w-auto">
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
            <span className="text-white/80 text-sm font-semibold tracking-wide">
              {REVIEW_RATING} · {REVIEW_COUNT}+ avaliações Google
            </span>
          </a>
          <div className={`${pillClass} justify-center whitespace-nowrap`}>
            <Users className="w-3.5 h-3.5 text-gold flex-shrink-0" strokeWidth={2} />
            <span className="text-white/80 text-sm font-semibold tracking-wide">+1100 clientes</span>
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
          <span className="text-white/80 text-sm">{REVIEW_RATING} · {REVIEW_COUNT}+ avaliações</span>
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
          <span className="text-white font-bold text-base">{REVIEW_RATING}</span>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-white/80 text-sm">{REVIEW_COUNT}+ avaliações no Google</span>
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
          <p className="text-base text-[#777]">{REVIEW_COUNT}+ avaliações no Google</p>
        </div>
      );
  }
};

export default TrustRatingBadge;
