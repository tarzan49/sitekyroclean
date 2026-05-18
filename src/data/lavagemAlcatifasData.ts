// Wrapper — lavagem × alcatifas subset.
export type { KeywordVariantData } from './keywordVariantData';
export { getKeywordVariantData as getLavagemAlcatifasData } from './keywordVariantData';

import { getAllKeywordVariantRoutes } from './keywordVariantData';
export function getAllLavagemAlcatifasRoutes() {
  return getAllKeywordVariantRoutes().filter(r => r.variantKey === 'lavagem' && r.serviceKey === 'alcatifas');
}
