import { SATISFACTION_PROMISE } from '../constants/commercialPolicy';
export interface GuaranteeItem {
  label: string;
  title: string;
  body: string;
  image?: string;
  mirror?: boolean;
}

const DEFAULT_ITEMS: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "Não ficou satisfeito? Repetimos",
    body: SATISFACTION_PROMISE,
  },
  {
    label: "Qualidade",
    title: "Selo Kyro em cada visita",
    body: "Cada intervenção é executada com os mesmos padrões rigorosos, independentemente do tipo de estofo ou da dimensão do trabalho.",
  },
  {
    label: "Segurança",
    title: "Seguro para toda a família",
    body: "Produtos certificados, não tóxicos e testados. Crianças, bebés e animais podem regressar ao espaço imediatamente após a secagem.",
  },
];

interface ServiceEliteGuaranteeProps {
  heading?: string;
  subtitle?: string;
  variant?: "light" | "dark";
  items?: GuaranteeItem[];
}

const ServiceEliteGuarantee = ({
  heading = "A nossa promessa em cada visita",
  subtitle = "Contacte-nos até 48 horas após o serviço para acionar a repetição gratuita.",
  variant = "light",
  items = DEFAULT_ITEMS,
}: ServiceEliteGuaranteeProps) => {
  const dark = variant === "dark";
  const textMain = dark ? "text-white" : "text-[#111111]";
  const textSub  = dark ? "text-white/60" : "text-[#111111]/65";

  const words = heading.trim().split(" ");
  const goldWord = words.pop() ?? "";
  const restHeading = words.join(" ");

  return (
    <section id="compromisso" className={`py-14 md:py-20 ${dark ? "bg-kyro-green" : "bg-[#FDFDF9]"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Editorial header */}
        <div className="mb-7 md:mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <p className="text-sm font-bold tracking-[0.08em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
              O nosso compromisso
            </p>
          </div>
          <h2 className={`type-section-title font-playfair      mb-4 ${textMain}`}>
            {restHeading}{" "}
            <em className="not-italic" style={{ color: '#D4AF37' }}>{goldWord}</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">
          {items.map(item => (
            <figure key={item.label} className="min-w-0">
              {item.image && <img
                src={item.image}
                srcSet={item.image.endsWith('-800.webp') ? `${item.image.replace('-800.webp', '-400.webp')} 400w, ${item.image} 800w` : undefined}
                sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1279px) 30vw, 390px"
                width={800}
                height={500}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="aspect-[8/5] w-full rounded-xl object-cover"
              />}
              <figcaption className={`mt-3 text-lg font-semibold leading-snug ${textMain}`}>{item.title}</figcaption>
            </figure>
          ))}
        </div>
        <p className={`mt-6 text-xs leading-relaxed ${textSub}`}>Imagens ilustrativas.</p>
        <p className={`mt-2 text-sm leading-relaxed ${textSub}`}>{subtitle}</p>

      </div>
    </section>
  );
};

export default ServiceEliteGuarantee;
