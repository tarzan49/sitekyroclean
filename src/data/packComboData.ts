import { cities } from './locationSeoData';
// These are editable starting combinations, not separate price lists.
// Live amounts come from the same article tables used by the quote form.
export interface PackCombo { id: string; name: string; slug: string; tagline: string; description: string; service1Slug: string; service2Slug: string; }
export const packs: PackCombo[] = [
  { id: 'sofa-colchao', name: 'Pack Sofá + Colchão', slug: 'pack-sofa-e-colchao', tagline: 'Sala e quarto na mesma visita', description: 'Comece com sofá e colchão e adapte os tamanhos, quantidades e tratamentos. A estimativa e a deslocação aparecem no resumo.', service1Slug: 'limpeza-sofas', service2Slug: 'limpeza-colchoes' },
  { id: 'sofa-impermeabilizacao', name: 'Pack Sofá + Impermeabilização', slug: 'pack-sofa-impermeabilizacao', tagline: 'Limpe e proteja o seu sofá', description: 'Escolha limpeza com impermeabilização Premium até 10 anos, ou Essencial de 1 a 2 anos. O preço acompanha o tamanho e a versão escolhida.', service1Slug: 'limpeza-sofas', service2Slug: 'impermeabilizacao' },
  { id: 'sala-completa', name: 'Pack Sala Completa', slug: 'pack-sala-completa', tagline: 'Sofá, cadeiras e tapetes à sua medida', description: 'Escolha os artigos da sala. Os tapetes ficam sempre sob orçamento: indique largura e comprimento de cada peça.', service1Slug: 'limpeza-sofas', service2Slug: 'limpeza-tapetes' },
  { id: 'quarto-completo', name: 'Pack Quarto Completo', slug: 'pack-quarto-completo', tagline: 'Personalize os cuidados do quarto', description: 'Combine colchões e tapetes e acrescente, se pretender, tratamento anti-ácaros ou desbacterização. Tapetes sempre sob orçamento, mediante medidas.', service1Slug: 'limpeza-colchoes', service2Slug: 'limpeza-tapetes' },
];
export const packCities = cities;
export function getAllPackComboRoutes() { return packs.flatMap(pack => packCities.map(city => ({ path: `/${pack.slug}-${city.slug}`, packId: pack.id, citySlug: city.slug }))); }
export function getPackByCityAndId(packId: string, citySlug: string) {
  const pack = packs.find(p => p.id === packId); const city = packCities.find(c => c.slug === citySlug);
  return pack && city ? { pack, city } : null;
}
