import heroSofaD              from "@/assets/hero-sofa-cleaning-new.webp";
import heroSofaM              from "@/assets/hero-sofa-cleaning-new-mobile.webp";
import heroMattressD          from "@/assets/hero-mattress-cleaning-new.webp";
import heroMattressM          from "@/assets/hero-mattress-cleaning-new-mobile.webp";
import heroCarpetD            from "@/assets/hero-carpet-cleaning-new.webp";
import heroCarpetM            from "@/assets/hero-carpet-cleaning-new-mobile.webp";
import heroChairD             from "@/assets/hero-chair-cleaning-new.webp";
import heroChairM             from "@/assets/hero-chair-cleaning-new-mobile.webp";
import heroRugD               from "@/assets/hero-rug-cleaning-new.webp";
import heroRugM               from "@/assets/hero-rug-cleaning-new-mobile.webp";
import heroWaterproofD        from "@/assets/hero-waterproofing.webp";
import heroWaterproofM        from "@/assets/hero-waterproofing-mobile.webp";
import resultSofa              from "@/assets/galeria-sofa-depois.webp";
import resultColchao           from "@/assets/galeria-colchao-depois.webp";
import resultTapetes           from "@/assets/galeria-tapete-depois.webp";
import resultCadeiras          from "@/assets/galeria-cadeira-depois.webp";
import resultAlcatifas         from "@/assets/galeria-alcatifa-resultado.webp";
import resultImpermeabilizacao from "@/assets/galeria-impermeabilizacao-depois.webp";

export const SERVICE_HERO_IMAGES: Record<string, { d: string; m: string }> = {
  "limpeza-sofas":     { d: heroSofaD,       m: heroSofaM },
  "limpeza-colchoes":  { d: heroMattressD,   m: heroMattressM },
  "limpeza-tapetes":   { d: heroCarpetD,     m: heroCarpetM },
  "limpeza-cadeiras":  { d: heroChairD,      m: heroChairM },
  "limpeza-alcatifas": { d: heroRugD,        m: heroRugM },
  "impermeabilizacao": { d: heroWaterproofD, m: heroWaterproofM },
};

export const SERVICE_RESULT_IMAGES: Record<string, string> = {
  "limpeza-sofas":     resultSofa,
  "limpeza-colchoes":  resultColchao,
  "limpeza-tapetes":   resultTapetes,
  "limpeza-cadeiras":  resultCadeiras,
  "limpeza-alcatifas": resultAlcatifas,
  "impermeabilizacao": resultImpermeabilizacao,
};

export const SERVICE_RESULT_CONTENT: Record<string, (place: string) => { desc: string; checks: string[] }> = {
  'limpeza-sofas':     p => ({ desc: `Sofás de ${p} tratados com extração a quente: manchas, ácaros e odores eliminados. Tecido revitalizado e pronto a usar em 4 a 6 horas.`, checks: ['Remoção de 99% dos ácaros', 'Manchas antigas eliminadas', 'Pronto em 4–6h'] }),
  'limpeza-colchoes':  p => ({ desc: `Colchões higienizados ao domicílio em ${p}: eliminação de ácaros, manchas de suor e odores para noites mais saudáveis. Seco no mesmo dia.`, checks: ['99% ácaros eliminados', 'Sem resíduos químicos', 'Seco no mesmo dia'] }),
  'limpeza-tapetes':   p => ({ desc: `Tapetes de ${p} lavados em profundidade: fibras revitalizadas, cores recuperadas e alergénios eliminados. Recolha e entrega incluídas.`, checks: ['Fibras e cores revitalizadas', 'Alergénios eliminados', 'Recolha e entrega'] }),
  'limpeza-cadeiras':  p => ({ desc: `Cadeiras estofadas em ${p} limpas com equipamento profissional: ideal para escritórios, restaurantes e residências. Resultado imediato.`, checks: ['Resultado imediato', 'Ideal para restaurantes', 'Sem resíduos'] }),
  'limpeza-alcatifas': p => ({ desc: `Alcatifas de ${p} tratadas com extração profunda: poeira, ácaros e manchas removidos das fibras. Ideal para espaços comerciais e residências.`, checks: ['Extração profunda', 'Ideal para espaços comerciais', 'Seco rapidamente'] }),
  'impermeabilizacao': p => ({ desc: `Proteção invisível aplicada em ${p} por especialistas: barreira duradoura contra líquidos e manchas. Totalmente ativa em 24 horas.`, checks: ['Barreira invisível e duradoura', 'Ativa em 24 horas', 'Proteção contra manchas'] }),
};

export const SERVICE_HERO_FALLBACK = { d: heroSofaD, m: heroSofaM };
export const SERVICE_RESULT_FALLBACK = resultSofa;
