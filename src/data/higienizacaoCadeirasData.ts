// Wrapper — higienização × cadeiras subset.
export type { KeywordVariantData } from './keywordVariantData';
export { getKeywordVariantData as getHigienizacaoCadeirasData } from './keywordVariantData';

import { getAllKeywordVariantRoutes } from './keywordVariantData';
export function getAllHigienizacaoCadeirasRoutes() {
  return getAllKeywordVariantRoutes().filter(r => r.variantKey === 'higienizacao' && r.serviceKey === 'cadeiras');
}
