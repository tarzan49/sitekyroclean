// Wrapper — lavagem × cadeiras subset.
export type { KeywordVariantData } from './keywordVariantData';
export { getKeywordVariantData as getLavagemCadeirasData } from './keywordVariantData';

import { getAllKeywordVariantRoutes } from './keywordVariantData';
export function getAllLavagemCadeirasRoutes() {
  return getAllKeywordVariantRoutes().filter(r => r.variantKey === 'lavagem' && r.serviceKey === 'cadeiras');
}
