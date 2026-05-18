// Wrapper — lavagem × tapetes subset.
export type { KeywordVariantData } from './keywordVariantData';
export { getKeywordVariantData as getLavagemTapetesData } from './keywordVariantData';

import { getAllKeywordVariantRoutes } from './keywordVariantData';
export function getAllLavagemTapetesRoutes() {
  return getAllKeywordVariantRoutes().filter(r => r.variantKey === 'lavagem' && r.serviceKey === 'tapetes');
}
