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
// sequer era um tapete): sofá 12, colchão 5, cadeiras 5, tapete 4 + 1 avulsa,
// impermeabilização 1.
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
import sofa01Antes from "@/assets/before-after-pool/sofa-01-antes.webp";
import sofa01Depois from "@/assets/before-after-pool/sofa-01-depois.webp";
import sofa02Antes from "@/assets/before-after-pool/sofa-02-antes.webp";
import sofa02Depois from "@/assets/before-after-pool/sofa-02-depois.webp";
import sofa03Antes from "@/assets/before-after-pool/sofa-03-antes.webp";
import sofa03Depois from "@/assets/before-after-pool/sofa-03-depois.webp";
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
    { kind: "pair", before: sofa03Antes, after: sofa03Depois },
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
