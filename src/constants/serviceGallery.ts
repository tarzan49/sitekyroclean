// Imagens antes/depois por serviço — mesmas usadas nas 6 páginas de Serviço Principal.
// Reaproveitadas em Material e Preço para dar às 436 páginas uma secção de imagens real.

import sofaBefore from "@/assets/galeria-sofa-antes.webp";
import sofaAfter from "@/assets/galeria-sofa-depois.webp";
import sofaResultado from "@/assets/sofa-pele-pormenor.png";
import sofaProcesso from "@/assets/sofa-extracao.png";

import colchaoBefore from "@/assets/galeria-colchao-antes.webp";
import colchaoAfter from "@/assets/galeria-colchao-depois.webp";
import colchaoResultado from "@/assets/galeria-colchao-resultado.webp";
import colchaoProcesso from "@/assets/galeria-colchao-processo.webp";

import tapeteBefore from "@/assets/galeria-tapete-antes.webp";
import tapeteAfter from "@/assets/galeria-tapete-depois.webp";
// Nota: galeria-tapete-processo.webp / hero-carpet-cleaning-new.webp / public/images/tapetes/v1.png
// são todos a MESMA foto duplicada sob nomes diferentes — por isso a "Extração" usa aqui a foto do
// tapete persa (distinta), evitando repetir a foto usada como Pormenor nos materiais sem foto própria.
const tapetePersaExtracao = "/images/variant-heroes/tapetes/tapetes-v2.png";

import cadeiraBefore from "@/assets/galeria-cadeira-antes.webp";
import cadeiraAfter from "@/assets/galeria-cadeira-depois.webp";
import cadeiraResultado from "@/assets/galeria-cadeira-resultado.webp";
import cadeiraProcesso from "@/assets/galeria-cadeira-processo.webp";

import alcatifaBefore from "@/assets/tapete-antes.webp";
import alcatifaAfter from "@/assets/tapete-depois.webp";
import alcatifaResultado from "@/assets/galeria-alcatifa-resultado.webp";
import alcatifaProcesso from "@/assets/galeria-alcatifa-processo.webp";

import impermeabilizacaoBefore from "@/assets/galeria-impermeabilizacao-antes.webp";
import impermeabilizacaoAfter from "@/assets/galeria-impermeabilizacao-depois.webp";
import impermeabilizacaoResultado from "@/assets/galeria-impermeabilizacao-resultado.webp";
import impermeabilizacaoProcesso from "@/assets/galeria-impermeabilizacao-processo.webp";

export interface ServiceGallery {
  before: string;
  after: string;
  slides: { src: string; label: string }[];
  rotateBeforeAfter?: boolean;
}

export const SERVICE_GALLERY: Record<string, ServiceGallery> = {
  "limpeza-sofas": {
    before: sofaBefore,
    after: sofaAfter,
    slides: [
      { src: sofaResultado, label: "Pormenor" },
      { src: sofaProcesso, label: "Extração Profissional" },
    ],
  },
  "limpeza-colchoes": {
    before: colchaoBefore,
    after: colchaoAfter,
    slides: [
      { src: colchaoResultado, label: "Pormenor" },
      { src: colchaoProcesso, label: "Extração" },
    ],
  },
  "limpeza-tapetes": {
    before: tapeteBefore,
    after: tapeteAfter,
    slides: [
      { src: alcatifaResultado, label: "Técnico" },
      { src: tapetePersaExtracao, label: "Extração" },
    ],
  },
  "limpeza-cadeiras": {
    before: cadeiraBefore,
    after: cadeiraAfter,
    slides: [
      { src: cadeiraResultado, label: "Pormenor" },
      { src: cadeiraProcesso, label: "Extração" },
    ],
    rotateBeforeAfter: true,
  },
  "limpeza-alcatifas": {
    before: alcatifaBefore,
    after: alcatifaAfter,
    slides: [
      { src: alcatifaProcesso, label: "Pormenor" },
      { src: alcatifaResultado, label: "Extração" },
    ],
  },
  "impermeabilizacao": {
    before: impermeabilizacaoBefore,
    after: impermeabilizacaoAfter,
    slides: [
      { src: impermeabilizacaoResultado, label: "Pormenor" },
      { src: impermeabilizacaoProcesso, label: "Impermeável" },
    ],
  },
};
