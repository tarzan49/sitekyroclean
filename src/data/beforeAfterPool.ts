// Pool de fotos antes/depois para o slider rotativo do hero (pedido explícito
// 2026-09-09: "o antes e depois é o que vende a limpeza ao cliente"). Fotos
// reais fornecidas pelo dono via WhatsApp + os pares que já existiam para
// src/pages/BeforeAfterPage.tsx, todas redimensionadas para no máx. 900px no
// lado maior e convertidas para WebP (a pool toda ocupa ~3MB em vez de ~15MB
// nas fotos originais).
//
// "tapete-05" é uma foto avulsa (um tapete persa) sem antes/depois
// correspondente — incluída na pool excecionalmente a pedido explícito,
// por isso o tipo `PoolItem` distingue "pair" (mostra o slider de arrastar)
// de "single" (mostra só a foto, sem comparação).
//
// Alcatifa reaproveita a pool de "tapete" (pedido explícito — não há fotos
// próprias de alcatifa). Impermeabilização só tem 1 par por agora (fica para
// o dono tratar mais fotos depois).
//
// Contagem final (depois de rever visualmente todos os pares — 2 vinham com
// antes/depois trocados, "sofa-12" e "tapete-02" foram removidos por serem
// pares errados: peças de mobília diferentes uma da outra, "tapete-02" nem
// sequer era um tapete): sofá 11, colchão 5, cadeiras 8, tapete 4 + 1 avulsa,
// impermeabilização 4.
//
// Correções feitas 2026-09-09 depois de o dono reportar em produção:
// "colchao-04" tinha antes/depois trocados (ficheiros trocados de novo — a
// troca de uma sessão anterior não chegou a ser commitada). "sofa-03" era na
// verdade uma cadeira azul de escritório, não um sofá — mudada de pool para
// "cadeiras". Todas as fotos de "cadeiras" foram depois substituídas por 7
// pares novos fornecidos pelo dono (as fotos antigas cortavam a cadeira a
// meio numa caixa 4:3) — a categoria usa agora uma caixa 9:16 dedicada
// (ver HeroBeforeAfterPool.tsx), enquadramento em que nenhum dos pares corta
// a cadeira na vertical, sem precisar de barra de fundo. A cadeira azul de
// escritório ("cadeiras-08") foi depois recuperada do histórico do git e
// readicionada — o dono queria-a mantida junto aos 7 pares novos, não
// substituída por eles.
//
// "impermeabilizacao-02/03/04" (2026-09-09): ao contrário de todas as outras
// fotos desta pool (fotos reais de trabalhos), estas 3 são imagens geradas
// por IA (Gemini) — demonstrações ilustrativas do efeito de um tecido
// impermeabilizado (líquido a formar pérolas em vez de absorver / tecido sem
// desgaste), não trabalhos reais da Kyro. Decisão explícita do dono. A dupla
// "impermeabilizacao-02" (lata de refrigerante) tinha a marca visível no
// rótulo — a pedido do dono, foi aplicado blur ovalado e esbatido só nessa
// zona (não um retângulo rígido, para não parecer censura) antes de gerar o
// WebP, para não usar a marca registada em material de marketing.
import cadeiras01Antes from "@/assets/before-after-pool/cadeiras-01-antes.webp";
import cadeiras01Depois from "@/assets/before-after-pool/cadeiras-01-depois.webp";
import cadeiras02Antes from "@/assets/before-after-pool/cadeiras-02-antes.webp";
import cadeiras02Depois from "@/assets/before-after-pool/cadeiras-02-depois.webp";
import cadeiras03Antes from "@/assets/before-after-pool/cadeiras-03-antes.webp";
import cadeiras03Depois from "@/assets/before-after-pool/cadeiras-03-depois.webp";
import cadeiras04Antes from "@/assets/before-after-pool/cadeiras-04-antes.webp";
import cadeiras04Depois from "@/assets/before-after-pool/cadeiras-04-depois.webp";
import cadeiras05Antes from "@/assets/before-after-pool/cadeiras-05-antes.webp";
import cadeiras05Depois from "@/assets/before-after-pool/cadeiras-05-depois.webp";
import cadeiras06Antes from "@/assets/before-after-pool/cadeiras-06-antes.webp";
import cadeiras06Depois from "@/assets/before-after-pool/cadeiras-06-depois.webp";
import cadeiras07Antes from "@/assets/before-after-pool/cadeiras-07-antes.webp";
import cadeiras07Depois from "@/assets/before-after-pool/cadeiras-07-depois.webp";
import cadeiras08Antes from "@/assets/before-after-pool/cadeiras-08-antes.webp";
import cadeiras08Depois from "@/assets/before-after-pool/cadeiras-08-depois.webp";
import colchao01Antes from "@/assets/before-after-pool/colchao-01-antes.webp";
import colchao01Depois from "@/assets/before-after-pool/colchao-01-depois.webp";
import colchao02Antes from "@/assets/before-after-pool/colchao-02-antes.webp";
import colchao02Depois from "@/assets/before-after-pool/colchao-02-depois.webp";
import colchao03Antes from "@/assets/before-after-pool/colchao-03-antes.webp";
import colchao03Depois from "@/assets/before-after-pool/colchao-03-depois.webp";
import colchao04Antes from "@/assets/before-after-pool/colchao-04-antes.webp";
import colchao04Depois from "@/assets/before-after-pool/colchao-04-depois.webp";
import colchao05Antes from "@/assets/before-after-pool/colchao-05-antes.webp";
import colchao05Depois from "@/assets/before-after-pool/colchao-05-depois.webp";
import impermeabilizacao01Antes from "@/assets/before-after-pool/impermeabilizacao-01-antes.webp";
import impermeabilizacao01Depois from "@/assets/before-after-pool/impermeabilizacao-01-depois.webp";
import impermeabilizacao02Antes from "@/assets/before-after-pool/impermeabilizacao-02-antes.webp";
import impermeabilizacao02Depois from "@/assets/before-after-pool/impermeabilizacao-02-depois.webp";
import impermeabilizacao03Antes from "@/assets/before-after-pool/impermeabilizacao-03-antes.webp";
import impermeabilizacao03Depois from "@/assets/before-after-pool/impermeabilizacao-03-depois.webp";
import impermeabilizacao04Antes from "@/assets/before-after-pool/impermeabilizacao-04-antes.webp";
import impermeabilizacao04Depois from "@/assets/before-after-pool/impermeabilizacao-04-depois.webp";
import sofa01Antes from "@/assets/before-after-pool/sofa-01-antes.webp";
import sofa01Depois from "@/assets/before-after-pool/sofa-01-depois.webp";
import sofa02Antes from "@/assets/before-after-pool/sofa-02-antes.webp";
import sofa02Depois from "@/assets/before-after-pool/sofa-02-depois.webp";
import sofa04Antes from "@/assets/before-after-pool/sofa-04-antes.webp";
import sofa04Depois from "@/assets/before-after-pool/sofa-04-depois.webp";
import sofa05Antes from "@/assets/before-after-pool/sofa-05-antes.webp";
import sofa05Depois from "@/assets/before-after-pool/sofa-05-depois.webp";
import sofa06Antes from "@/assets/before-after-pool/sofa-06-antes.webp";
import sofa06Depois from "@/assets/before-after-pool/sofa-06-depois.webp";
import sofa07Antes from "@/assets/before-after-pool/sofa-07-antes.webp";
import sofa07Depois from "@/assets/before-after-pool/sofa-07-depois.webp";
import sofa08Antes from "@/assets/before-after-pool/sofa-08-antes.webp";
import sofa08Depois from "@/assets/before-after-pool/sofa-08-depois.webp";
import sofa09Antes from "@/assets/before-after-pool/sofa-09-antes.webp";
import sofa09Depois from "@/assets/before-after-pool/sofa-09-depois.webp";
import sofa10Antes from "@/assets/before-after-pool/sofa-10-antes.webp";
import sofa10Depois from "@/assets/before-after-pool/sofa-10-depois.webp";
import sofa11Antes from "@/assets/before-after-pool/sofa-11-antes.webp";
import sofa11Depois from "@/assets/before-after-pool/sofa-11-depois.webp";
import sofa13Antes from "@/assets/before-after-pool/sofa-13-antes.webp";
import sofa13Depois from "@/assets/before-after-pool/sofa-13-depois.webp";
import tapete01Antes from "@/assets/before-after-pool/tapete-01-antes.webp";
import tapete01Depois from "@/assets/before-after-pool/tapete-01-depois.webp";
import tapete03Antes from "@/assets/before-after-pool/tapete-03-antes.webp";
import tapete03Depois from "@/assets/before-after-pool/tapete-03-depois.webp";
import tapete04Antes from "@/assets/before-after-pool/tapete-04-antes.webp";
import tapete04Depois from "@/assets/before-after-pool/tapete-04-depois.webp";
import tapete05UnicoSemPar from "@/assets/before-after-pool/tapete-05-unico-sem-par.webp";
import tapete06Antes from "@/assets/before-after-pool/tapete-06-antes.webp";
import tapete06Depois from "@/assets/before-after-pool/tapete-06-depois.webp";

export type BeforeAfterCategory = "sofa" | "colchao" | "cadeiras" | "tapete" | "impermeabilizacao";

export type PoolItem = { kind: "pair"; before: string; after: string } | { kind: "single"; image: string };

export const BEFORE_AFTER_POOL: Record<BeforeAfterCategory, PoolItem[]> = {
  sofa: [
    { kind: "pair", before: sofa01Antes, after: sofa01Depois },
    { kind: "pair", before: sofa02Antes, after: sofa02Depois },
    { kind: "pair", before: sofa04Antes, after: sofa04Depois },
    { kind: "pair", before: sofa05Antes, after: sofa05Depois },
    { kind: "pair", before: sofa06Antes, after: sofa06Depois },
    { kind: "pair", before: sofa07Antes, after: sofa07Depois },
    { kind: "pair", before: sofa08Antes, after: sofa08Depois },
    { kind: "pair", before: sofa09Antes, after: sofa09Depois },
    { kind: "pair", before: sofa10Antes, after: sofa10Depois },
    { kind: "pair", before: sofa11Antes, after: sofa11Depois },
    { kind: "pair", before: sofa13Antes, after: sofa13Depois },
  ],
  colchao: [
    { kind: "pair", before: colchao01Antes, after: colchao01Depois },
    { kind: "pair", before: colchao02Antes, after: colchao02Depois },
    { kind: "pair", before: colchao03Antes, after: colchao03Depois },
    { kind: "pair", before: colchao04Antes, after: colchao04Depois },
    { kind: "pair", before: colchao05Antes, after: colchao05Depois },
  ],
  cadeiras: [
    { kind: "pair", before: cadeiras01Antes, after: cadeiras01Depois },
    { kind: "pair", before: cadeiras02Antes, after: cadeiras02Depois },
    { kind: "pair", before: cadeiras03Antes, after: cadeiras03Depois },
    { kind: "pair", before: cadeiras04Antes, after: cadeiras04Depois },
    { kind: "pair", before: cadeiras05Antes, after: cadeiras05Depois },
    { kind: "pair", before: cadeiras06Antes, after: cadeiras06Depois },
    { kind: "pair", before: cadeiras07Antes, after: cadeiras07Depois },
    { kind: "pair", before: cadeiras08Antes, after: cadeiras08Depois },
  ],
  tapete: [
    { kind: "pair", before: tapete01Antes, after: tapete01Depois },
    { kind: "pair", before: tapete03Antes, after: tapete03Depois },
    { kind: "pair", before: tapete04Antes, after: tapete04Depois },
    { kind: "single", image: tapete05UnicoSemPar },
    { kind: "pair", before: tapete06Antes, after: tapete06Depois },
  ],
  impermeabilizacao: [
    { kind: "pair", before: impermeabilizacao01Antes, after: impermeabilizacao01Depois },
    { kind: "pair", before: impermeabilizacao02Antes, after: impermeabilizacao02Depois },
    { kind: "pair", before: impermeabilizacao03Antes, after: impermeabilizacao03Depois },
    { kind: "pair", before: impermeabilizacao04Antes, after: impermeabilizacao04Depois },
  ],
};

// serviceSlug -> categoria da pool. Alcatifa reaproveita tapete (pedido
// explícito, sem fotos próprias). Devolve null para serviços sem pool
// (a página mantém a foto estática antiga nesse caso).
export function categoryForServiceSlug(serviceSlug: string | undefined | null): BeforeAfterCategory | null {
  switch (serviceSlug) {
    case "limpeza-sofas": return "sofa";
    case "limpeza-colchoes": return "colchao";
    case "limpeza-cadeiras": return "cadeiras";
    case "limpeza-tapetes": return "tapete";
    case "limpeza-alcatifas": return "tapete";
    case "impermeabilizacao": return "impermeabilizacao";
    default: return null;
  }
}
