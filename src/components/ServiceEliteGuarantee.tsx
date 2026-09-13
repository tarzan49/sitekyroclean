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
          <p className={`text-base md:text-base leading-relaxed max-w-xl ${textSub}`}>
            {subtitle}
          </p>
        </div>

        <div className="grid items-start gap-7 md:grid-cols-2 md:gap-12">
          {items[0]?.image && <figure className="min-w-0 overflow-hidden">
            <img
              src={items[0].image}
              srcSet={items[0].image.replace('-800.webp', '-400.webp') + ' 400w, ' + items[0].image + ' 800w'}
              sizes="(max-width: 767px) calc(100vw - 40px), 580px"
              width={800}
              height={500}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-[8/5] w-full rounded-xl object-cover"
            />
            <figcaption className={`mt-2 text-xs ${textSub}`}>Imagem ilustrativa</figcaption>
          </figure>}
          <div className="min-w-0">
            {items.map((item, i) => (
              <div key={item.label} className={`py-5 first:pt-0 last:pb-0 ${i ? dark ? "border-t border-white/15" : "border-t border-[#173629]/15" : ""}`}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">{item.label}</p>
                <h3 className={`mb-2 text-xl font-semibold leading-snug ${textMain}`}>{item.title}</h3>
                <p className={`text-base leading-relaxed ${textSub}`}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ServiceEliteGuarantee;
