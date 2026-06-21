export interface CarouselSlide {
  src?: string;
  label?: string;
  objectPosition?: string;
  mirror?: boolean;
}

interface ServiceAutoCarouselProps {
  beforeImage?: string;
  afterImage?: string;
  slides: CarouselSlide[];
  overline?: string;
  title?: string;
  heading?: string;
  subtitle?: string;
  variant?: "light" | "dark";
  portraitImages?: boolean;
}

const ServiceAutoCarousel = ({
  beforeImage,
  afterImage,
  slides,
  overline = "Resultados Reais",
  heading = "Antes e depois da limpeza",
  subtitle = "Transformações visíveis no próprio dia da intervenção. Sem químicos agressivos, sem esperas.",
  variant = "dark",
  portraitImages = false,
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
  }: {
    src: string;
    label: string;
    labelSide?: "left" | "right";
    objectPosition?: string;
    mirror?: boolean;
  }) => (
    <div className={`relative overflow-hidden ${portraitImages ? 'aspect-[2/3]' : 'aspect-[3/2]'}`}>
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
      <span
        className={`absolute bottom-3 font-bold tracking-[0.2em] uppercase text-white backdrop-blur-sm px-3 py-1.5 ${
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
    <section className={`py-12 md:py-20 ${light ? "bg-[#FDFDF9]" : "bg-kyro-green"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Editorial header — slightly larger */}
        <div className="mb-10 md:mb-14">
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

        {/* 2×2 photo grid */}
        {beforeImage && afterImage ? (
          <div className="grid grid-cols-2 gap-1 md:gap-1.5 max-w-5xl">
            {/* Top row — before / after */}
            <GalleryCell src={beforeImage} label="Antes" labelSide="left" />
            <GalleryCell src={afterImage}  label="Depois" labelSide="right" />
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
