import { ALCATIFA_PROBLEMS } from './alcatifaProblems';
import { WATERPROOFING_PROBLEMS } from './waterproofingProblems';
import type { LandingService } from './landingFaqPool';

export const LANDING_SECTION_ORDER = ['precos', 'avaliacoes', 'problemas', 'duvidas', 'processo', 'mesma-visita', 'zonas'] as const;
export const LANDING_PRICE_VERBS: Record<LandingService, string> = {
  'limpeza-sofas': 'higienizar um sofá', 'limpeza-colchoes': 'higienizar um colchão',
  'limpeza-tapetes': 'higienizar um tapete', 'limpeza-cadeiras': 'higienizar uma cadeira',
  'limpeza-alcatifas': 'higienizar uma alcatifa', impermeabilizacao: 'impermeabilizar estofos',
};
export interface LandingProblem { id: string; title: string; description: string; imageIndex: number }
// The slots correspond to the four existing PROBLEM_IMAGES for each service.
// Future image alternatives belong to a problem ID, never an arbitrary card position.
const problems: Record<LandingService, { title: string; description: string }[]> = {
  'limpeza-sofas': [
    { title: 'Manchas difíceis no sofá', description: 'Café, vinho ou gordura? Avaliamos o tecido, a antiguidade da mancha e os produtos já usados para escolher o tratamento. As limitações são explicadas antes de começar.' },
    { title: 'Sujidade no interior das fibras', description: 'O pó e os resíduos também se acumulam no estofo. A limpeza trata essa sujidade; anti-ácaros e desbacterização são cuidados opcionais, orçamentados separadamente.' },
    { title: 'Odores desagradáveis', description: 'Animais, humidade ou uso diário podem deixar odores no sofá. Avaliamos a origem e a profundidade antes de recomendar o tratamento, sem garantir a eliminação de todos os cheiros.' },
    { title: 'Desgaste e marcas de uso', description: 'Distinguimos sujidade de alterações permanentes do tecido. A limpeza não repara fibras gastas; podemos avaliar a proteção opcional de tecidos compatíveis para cuidados futuros.' },
  ],
  'limpeza-colchoes': [
    { title: 'Pó e resíduos no colchão', description: 'A superfície e as costuras acumulam resíduos com o uso. Avaliamos o revestimento para escolher a limpeza; o tratamento anti-ácaros é um extra opcional e não uma promessa clínica.' },
    { title: 'Manchas de suor e líquidos', description: 'Suor, bebidas e acidentes podem marcar o revestimento. O tipo de tecido e o tempo decorrido influenciam o resultado, e algumas alterações de cor podem permanecer.' },
    { title: 'Odores acumulados', description: 'A origem do odor pode estar no revestimento ou nas camadas interiores. Explique o que aconteceu e os produtos usados para avaliarmos o alcance da intervenção.' },
    { title: 'Dúvidas sobre os cuidados do colchão', description: 'Se procura higienizar o colchão, ajudamos a distinguir a limpeza dos tratamentos opcionais. Não prometemos resolver sintomas de alergia ou substituir aconselhamento de saúde.' },
  ],
  'limpeza-tapetes': [
    { title: 'Sujidade acumulada nas fibras', description: 'Poeira, areia e resíduos do calçado ficam presos na trama. Avaliamos as fibras e a base para escolher um procedimento compatível com a peça.' },
    { title: 'Manchas de bebidas e alimentos', description: 'Cada derrame precisa de avaliação do material, da cor e dos produtos já aplicados. Não prometemos remoção total de manchas antigas ou alterações permanentes.' },
    { title: 'Pelos e resíduos de animais', description: 'Os pelos podem ficar presos entre as fibras, sobretudo nas zonas de descanso dos animais. Indicamos os cuidados adequados ao tapete e avaliamos eventuais odores associados.' },
    { title: 'Cores alteradas e fibras gastas', description: 'A sujidade pode disfarçar as cores, mas desbotamento e desgaste são situações diferentes. Explicamos o que a limpeza pode melhorar sem prometer restaurar a cor original.' },
  ],
  'limpeza-cadeiras': [
    { title: 'Sujidade do uso diário', description: 'Assentos e encostos acumulam resíduos nas zonas de contacto. Identificamos as partes estofadas e o material de cada modelo antes da limpeza.' },
    { title: 'Manchas visíveis no estofo', description: 'Comida, bebidas ou tinta deixam marcas diferentes. Avaliamos a mancha e o tecido antes de tratar, explicando os limites quando a cor ou a fibra já foram alteradas.' },
    { title: 'Odores retidos no tecido', description: 'O uso, a cozinha e os animais podem deixar odores nas cadeiras. A origem e o estado do enchimento ajudam a definir o tratamento e o resultado possível.' },
    { title: 'Desgaste nas zonas de contacto', description: 'Nem todas as marcas são sujidade removível. Avaliamos o desgaste e a estabilidade do tecido; a limpeza não repara rasgões nem repõe fibras danificadas.' },
  ],
  'limpeza-alcatifas': ALCATIFA_PROBLEMS,
  impermeabilizacao: WATERPROOFING_PROBLEMS,
};

export function getLandingProblems(serviceSlug: LandingService): LandingProblem[] {
  return problems[serviceSlug].map((problem, imageIndex) => ({ ...problem, imageIndex, id: `${serviceSlug}-${imageIndex + 1}` }));
}
