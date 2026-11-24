import { MATTRESS_PROBLEM_IMAGES } from './mattressProblemImages';
import { RUG_PROBLEM_IMAGES } from './rugProblemImages';
import { CHAIR_PROBLEM_IMAGES } from './chairProblemImages';
import { ALCATIFA_PROBLEM_IMAGES } from './alcatifaProblemImages';
import { WATERPROOFING_PROBLEM_IMAGES } from './waterproofingProblemImages';

export interface LandingProblemImage { id: string; problemId: string; src: string; alt: string; video?: string }

/** Sofás: fotografias reais da equipa (24 Nov); o resto ainda ilustrativo. Pure data shared by React and Node prerender. */
export const SOFA_PROBLEM_IMAGES = [
  {
    "id": "sofa-desgaste-01",
    "problemId": "limpeza-sofas-4",
    "src": "/images/landing-problems/sofas/sofa-desgaste-01.webp",
    "alt": "Assento de sofá bege baço e escurecido pelo uso"
  },
  {
    "id": "sofa-desgaste-02",
    "problemId": "limpeza-sofas-4",
    "src": "/images/landing-problems/sofas/sofa-desgaste-02.webp",
    "alt": "Assento de sofá cinzento-claro acinzentado pela sujidade do uso"
  },
  {
    "id": "sofa-desgaste-03",
    "problemId": "limpeza-sofas-4",
    "src": "/images/landing-problems/sofas/sofa-desgaste-03.webp",
    "alt": "Assento de sofá bege com a frente amarelada pelo uso"
  },
  {
    "id": "sofa-desgaste-04",
    "problemId": "limpeza-sofas-4",
    "src": "/images/landing-problems/sofas/sofa-desgaste-04.webp",
    "alt": "Assento de sofá escurecido pela sujidade acumulada"
  },
  {
    "id": "sofa-desgaste-05",
    "problemId": "limpeza-sofas-4",
    "src": "/images/landing-problems/sofas/sofa-desgaste-05.webp",
    "alt": "Assento bege com a frente encardida e escurecida"
  },
  {
    "id": "sofa-manchas-01",
    "problemId": "limpeza-sofas-1",
    "src": "/images/landing-problems/sofas/sofa-manchas-01.webp",
    "alt": "Assento de sofá azul-claro com manchas e marcas de água escuras"
  },
  {
    "id": "sofa-manchas-02",
    "problemId": "limpeza-sofas-1",
    "src": "/images/landing-problems/sofas/sofa-manchas-02.webp",
    "alt": "Almofada de sofá verde-lima com manchas escuras grandes"
  },
  {
    "id": "sofa-manchas-03",
    "problemId": "limpeza-sofas-1",
    "src": "/images/landing-problems/sofas/sofa-manchas-03.webp",
    "alt": "Assento de sofá bege aveludado com manchas e marcas de água"
  },
  {
    "id": "sofa-manchas-04",
    "problemId": "limpeza-sofas-1",
    "src": "/images/landing-problems/sofas/sofa-manchas-04.webp",
    "alt": "Dois assentos de sofá bege com várias manchas espalhadas"
  },
  {
    "id": "sofa-manchas-05",
    "problemId": "limpeza-sofas-1",
    "src": "/images/landing-problems/sofas/sofa-manchas-05.webp",
    "alt": "Tecido cinzento de assento com manchas circulares e auréolas"
  },
  {
    "id": "sofa-odores-01",
    "problemId": "limpeza-sofas-3",
    "src": "/images/landing-problems/sofas/sofa-odores-01.webp",
    "alt": "Sofá de microfibra bege com marcas de gordura nas costas e nos braços"
  },
  {
    "id": "sofa-odores-02",
    "problemId": "limpeza-sofas-3",
    "src": "/images/landing-problems/sofas/sofa-odores-02.webp",
    "alt": "Encosto de cadeirão com marcas escuras de suor"
  },
  {
    "id": "sofa-odores-03",
    "problemId": "limpeza-sofas-3",
    "src": "/images/landing-problems/sofas/sofa-odores-03.webp",
    "alt": "Braço de sofá amarelo com gordura e manchas"
  },
  {
    "id": "sofa-odores-04",
    "problemId": "limpeza-sofas-3",
    "src": "/images/landing-problems/sofas/sofa-odores-04.webp",
    "alt": "Braço de sofá vermelho com sujidade escura ao longo da costura"
  },
  {
    "id": "sofa-odores-05",
    "problemId": "limpeza-sofas-3",
    "src": "/images/landing-problems/sofas/sofa-odores-05.webp",
    "alt": "Braço e assento de sofá bege com riscos escuros e manchas de uso"
  },
  {
    "id": "sofa-residuos-01",
    "problemId": "limpeza-sofas-2",
    "src": "/images/landing-problems/sofas/sofa-residuos-01.webp",
    "alt": "Sofá-cama cinzento com migalhas, embalagens e manchas nos assentos"
  },
  {
    "id": "sofa-residuos-02",
    "problemId": "limpeza-sofas-2",
    "src": "/images/landing-problems/sofas/sofa-residuos-02.webp",
    "alt": "Braço de sofá cinzento coberto de pó e pelos"
  },
  {
    "id": "sofa-residuos-03",
    "problemId": "limpeza-sofas-2",
    "src": "/images/landing-problems/sofas/sofa-residuos-03.webp",
    "alt": "Sofá-cama bege com pó e sujidade espalhados no assento"
  },
  {
    "id": "sofa-residuos-04",
    "problemId": "limpeza-sofas-2",
    "src": "/images/landing-problems/sofas/sofa-residuos-04.webp",
    "alt": "Assentos de sofá claro com sujidade e marcas de uso"
  },
  {
    "id": "sofa-residuos-05",
    "problemId": "limpeza-sofas-2",
    "src": "/images/landing-problems/sofas/sofa-residuos-05.webp",
    "alt": "Chaise bege com resíduos e marcas de sujidade"
  }
] as const;

function score(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  // Avalanche the complete key: neighbouring variant IDs must not get correlated scores.
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  return (hash ^ (hash >>> 16)) >>> 0;
}

/** Rendezvous selection: independent by problem, stable by URL, never by visit. */
export function selectLandingProblemImage(serviceSlug: string, problemId: string, pagePath: string) {
  const library: readonly LandingProblemImage[] = serviceSlug === 'limpeza-sofas' ? SOFA_PROBLEM_IMAGES
    : serviceSlug === 'limpeza-colchoes' ? MATTRESS_PROBLEM_IMAGES
    : serviceSlug === 'limpeza-tapetes' ? RUG_PROBLEM_IMAGES
    : serviceSlug === 'limpeza-cadeiras' ? CHAIR_PROBLEM_IMAGES
    : serviceSlug === 'limpeza-alcatifas' ? ALCATIFA_PROBLEM_IMAGES
    : serviceSlug === 'impermeabilizacao' ? WATERPROOFING_PROBLEM_IMAGES : [];
  const path = pagePath.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  const candidates = library.filter(image => image.problemId === problemId);
  return candidates.reduce<LandingProblemImage | undefined>((best, image) => {
    const seed = path + ':' + problemId + ':';
    return !best || score(seed + image.id) > score(seed + best.id) ? image : best;
  }, undefined);
}
