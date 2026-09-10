import ServiceResultsGallery from "@/components/ServiceResultsGallery";
import type { BeforeAfterCategory } from "@/data/beforeAfterPool";

export interface CarouselSlide {
  src?: string;
  label?: string;
  objectPosition?: string;
  mirror?: boolean;
}

interface ServiceAutoCarouselProps {
  category?: BeforeAfterCategory;
  beforeImage?: string;
  afterImage?: string;
  slides: CarouselSlide[];
  overline?: string;
  title?: string;
  heading?: string;
  subtitle?: string;
  variant?: "light" | "dark";
  portraitImages?: boolean;
  rotateBeforeAfter?: boolean;
}

const ServiceAutoCarousel = ({
  category,
  beforeImage,
  afterImage,
  slides,
  overline = "Resultados Reais",
  heading = "Antes e depois da limpeza",
  subtitle = "Transformações visíveis no próprio dia da intervenção. Sem químicos agressivos, sem esperas.",
  variant = "dark",
  portraitImages = false,
  rotateBeforeAfter = false,
}: ServiceAutoCarouselProps) => {
  const light = variant === "light";
  const textMain = light ? "text-[#111111]" : "text-white";
  const textSub  = light ? "text-[#111111]/55" : "text-white/50";

  const words = heading.trim().split(" ");
  const goldWord = words.pop() ?? "";
  const restTitle = words.join(" ");

  const GalleryCell = ({
    src,
    label,
    labelSide = "left",
    objectPosition,
    mirror,
    portrait,
  }: {
    src: string;
    label: string;
    labelSide?: "left" | "right";
    objectPosition?: string;
    mirror?: boolean;
    portrait?: boolean;
  }) => (
    <div className={`relative overflow-hidden ${portraitImages ? 'aspect-[2/3]' : 'aspect-[3/2]'}`}>
      {portrait ? (
        <img
          src={src}
          alt={label}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: 'rotate(90deg)',
          }}
        />
      ) : (
        <img
          src={src}
          alt={label}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          style={{
            ...(objectPosition ? { objectPosition } : {}),
            ...(mirror ? { transform: "scaleX(-1)" } : {}),
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
      <span
        className={`${category ? "hidden" : "hidden sm:block"} absolute bottom-3 font-bold tracking-[0.2em] uppercase text-white backdrop-blur-sm px-3 py-1.5 ${
          labelSide === "right" ? "right-3" : "left-3"
        } ${
          label === "Antes" ? "text-xs bg-red-900/70 border-l-2 border-red-400"
          : label === "Depois" ? "text-xs bg-green-900/70 border-l-2 border-green-400"
          : "text-[10px] bg-black/45"
        }`}
      >
        {label}
      </span>
    </div>
  );

  return (
    <section className={`py-10 md:py-14 ${light ? "bg-[#FDFDF9]" : "bg-kyro-green"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Editorial header — slightly larger */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
              {overline}
            </p>
          </div>
          <h2 className={`font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] mb-4 ${textMain}`}>
            {restTitle}{" "}
            <em className="not-italic" style={{ color: '#D4AF37' }}>{goldWord}</em>
          </h2>
          <p className={`text-sm md:text-base leading-relaxed max-w-xl ${textSub}`}>
            {subtitle}
          </p>
        </div>

        {category && (
          <div className="grid max-w-5xl items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-10">
            <div className="min-w-0 max-w-[640px] w-full">
              <ServiceResultsGallery key={category} category={category} light={light} />
            </div>
            <div className={`min-w-0 pt-5 border-t lg:pt-0 lg:border-t-0 ${light ? "border-black/10" : "border-white/15"}`}>
              <h3 className={`font-playfair text-xl mb-4 ${textMain}`}>O cuidado em cada pormenor</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                {slides.slice(0, 2).map((slide, i) => slide.src ? (
                  <figure key={slide.src}>
                    <GalleryCell src={slide.src} label={slide.label ?? ""} objectPosition={slide.objectPosition} mirror={slide.mirror} />
                    <figcaption className={`mt-3 text-sm ${textSub}`}>{slide.label || `Pormenor do serviço ${i + 1}`}</figcaption>
                  </figure>
                ) : null)}
              </div>
            </div>
          </div>
        )}

        {/* Static gallery for pages without a selected pool. */}
        {!category && beforeImage && afterImage ? (
          <div className="grid grid-cols-2 gap-1 md:gap-1.5 max-w-5xl">
            {/* Top row — before / after */}
            <GalleryCell src={beforeImage} label="Antes" labelSide="left" portrait={rotateBeforeAfter} />
            <GalleryCell src={afterImage}  label="Depois" labelSide="right" portrait={rotateBeforeAfter} />
            {/* Bottom row — extra photos */}
            {slides.slice(0, 2).map((slide, i) => (
              slide.src ? (
                <GalleryCell
                  key={i}
                  src={slide.src}
                  label={slide.label ?? ""}
                  labelSide={i === 0 ? "left" : "right"}
                  objectPosition={slide.objectPosition}
                  mirror={slide.mirror}
                />
              ) : null
            ))}
          </div>
        ) : null}

      </div>
    </section>
  );
};

export default ServiceAutoCarousel;
