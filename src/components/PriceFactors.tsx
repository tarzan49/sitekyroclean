import { Sofa, Ruler, ScanLine, ShieldCheck, Check, Armchair, MapPin, Layers, type LucideIcon } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

type Factor = { icon: LucideIcon; title: string; description: string; examples: string[] };
const factors: Record<string, Factor[]> = {
  "limpeza-sofas": [
    { icon: Sofa, title: "Como é o seu sofá?", description: "O tamanho e o tecido ajudam a definir o trabalho necessário.", examples: ["Número de lugares e tipo de tecido", "Chaise longue ou módulos extra"] },
    { icon: ScanLine, title: "Como está neste momento?", description: "Avaliamos as manchas para escolher os cuidados adequados.", examples: ["Tipo de manchas", "Intensidade e extensão da sujidade"] },
    { icon: ShieldCheck, title: "Quer algum cuidado extra?", description: "Os tratamentos adicionais são opcionais e avaliados à parte.", examples: ["Tratamento de odores", "Impermeabilização do tecido"] },
  ],
  "limpeza-colchoes": [
    { icon: Ruler, title: "Qual é o seu colchão?", description: "O tamanho e o material são o ponto de partida.", examples: ["Solteiro, casal ou king size", "Espuma, molas ou viscoelástico"] },
    { icon: ScanLine, title: "Como está neste momento?", description: "O estado do colchão ajuda a definir os cuidados necessários.", examples: ["Manchas e estado geral", "Tempo desde a última limpeza"] },
    { icon: ShieldCheck, title: "O que quer acrescentar?", description: "Pode pedir outros cuidados no mesmo orçamento.", examples: ["Tratamento anti-ácaros opcional", "Limpeza da cabeceira à parte"] },
  ],
  "limpeza-tapetes": [
    { icon: Ruler, title: "Que tapete tem?", description: "As medidas e as fibras ajudam-nos a preparar o orçamento.", examples: ["Largura e comprimento", "Lã, sintético, seda ou sisal"] },
    { icon: Layers, title: "Que cuidados precisa?", description: "Cada tapete pede uma avaliação do material e do seu estado.", examples: ["Manchas e sujidade acumulada", "Peças artesanais, idade e fibras frágeis"] },
    { icon: MapPin, title: "Como será o serviço?", description: "Confirmamos a logística necessária para a sua peça.", examples: ["Necessidade de recolha", "Condições de entrega"] },
  ],
  "limpeza-cadeiras": [
    { icon: Armchair, title: "Que cadeiras tem?", description: "O formato e o estofamento definem os cuidados a aplicar.", examples: ["Jantar, escritório ou poltrona", "Material e estado das manchas"] },
    { icon: Layers, title: "Quantas quer limpar?", description: "A quantidade influencia o preço por cadeira.", examples: ["Número total de cadeiras", "Escalões de preço por quantidade"] },
    { icon: MapPin, title: "Onde vamos trabalhar?", description: "As condições do espaço ajudam a planear a intervenção.", examples: ["Casa, escritório ou restaurante", "Acesso e disponibilidade do espaço"] },
  ],
  "limpeza-alcatifas": [
    { icon: Ruler, title: "Qual é a área?", description: "Preparamos um orçamento à medida do espaço.", examples: ["Área total a limpar", "Tipo de alcatifa e fibra"] },
    { icon: ScanLine, title: "Como está a alcatifa?", description: "Avaliamos a sujidade e os cuidados necessários antes do serviço.", examples: ["Manchas e estado geral", "Manutenção e tratamentos necessários"] },
    { icon: MapPin, title: "Como é o acesso?", description: "Planeamos o trabalho de acordo com as condições do local.", examples: ["Acessibilidade do espaço", "Disponibilidade da área a limpar"] },
  ],
  "impermeabilizacao": [
    { icon: Sofa, title: "O que quer proteger?", description: "A peça, o tamanho e o tecido definem a aplicação.", examples: ["Tipo e dimensão da peça", "Material do estofamento"] },
    { icon: ShieldCheck, title: "Que proteção procura?", description: "Escolha a opção adequada ao uso da sua casa.", examples: ["Essencial ou Premium", "Uso diário, crianças e animais"] },
    { icon: Layers, title: "Quer juntar a limpeza?", description: "A combinação de serviços é considerada no orçamento.", examples: ["Só impermeabilização", "Limpeza e proteção na mesma visita"] },
  ],
};

export default function PriceFactors({ serviceSlug }: { serviceSlug: string }) {
  const items = factors[serviceSlug];
  if (!items) return null;
  return (
    <section aria-label="Como é calculado o preço" className="bg-[#FDFDF9] py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <SectionHeader overline="O preço, explicado" heading="Cada peça é diferente." goldWord="O cuidado também." />
        <p className="-mt-5 mb-8 max-w-2xl text-base leading-relaxed text-[#46564e] md:-mt-7">Para chegar ao valor final, olhamos para estes detalhes. Assim, sabe o que estamos a avaliar.</p>
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {items.map(({ icon: Icon, title, description, examples }, index) => (
            <article key={title} className={`rounded-2xl border p-6 sm:p-7 ${index === 1 ? "border-[#0d241b] bg-[#0d241b] text-white" : "border-[#dce2da] bg-white text-[#0d241b]"}`}>
              <div className="mb-6 flex items-center justify-between">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${index === 1 ? "bg-white/10 text-[#D4AF37]" : "bg-[#f2f4ed] text-[#183e2e]"}`}>
                  <Icon aria-hidden="true" className="h-9 w-9" strokeWidth={1.4} />
                </div>
                <span aria-hidden="true" className={`text-sm font-semibold tracking-[0.15em] ${index === 1 ? "text-[#D4AF37]" : "text-[#637367]"}`}>0{index + 1}</span>
              </div>
              <h3 className="type-card-title font-playfair  ">{title}</h3>
              <p className={`mt-3 text-base leading-relaxed ${index === 1 ? "text-[#d6e1da]" : "text-[#46564e]"}`}>{description}</p>
              <ul className={`mt-6 space-y-3 border-t pt-5 ${index === 1 ? "border-white/20" : "border-[#e5e9e2]"}`}>
                {examples.map(example => <li key={example} className="flex items-start gap-2.5 text-base leading-relaxed"><Check aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${index === 1 ? "text-[#D4AF37]" : "text-[#326448]"}`} />{example}</li>)}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#eef2ea] px-5 py-5 sm:items-center">
          <ShieldCheck aria-hidden="true" className="h-6 w-6 shrink-0 text-[#28523b]" />
          <p className="text-base leading-relaxed text-[#344b3b]"><strong className="font-semibold text-[#0d241b]">Sabe o valor antes de marcar.</strong> Confirmamos os detalhes, os extras escolhidos e a deslocação no orçamento. Gratuito e sem compromisso.</p>
        </div>
      </div>
    </section>
  );
}
