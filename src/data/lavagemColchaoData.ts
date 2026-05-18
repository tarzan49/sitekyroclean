// Wrapper — lavagem × colchão subset.
export type { KeywordVariantData } from './keywordVariantData';
export { getKeywordVariantData as getLavagemColchaoData } from './keywordVariantData';

import { getAllKeywordVariantRoutes } from './keywordVariantData';
export function getAllLavagemColchaoRoutes() {
  return getAllKeywordVariantRoutes().filter(r => r.variantKey === 'lavagem' && r.serviceKey === 'colchao');
}
