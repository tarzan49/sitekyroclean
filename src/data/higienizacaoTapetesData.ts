// Wrapper — higienização × tapetes subset.
export type { KeywordVariantData } from './keywordVariantData';
export { getKeywordVariantData as getHigienizacaoTapetesData } from './keywordVariantData';

import { getAllKeywordVariantRoutes } from './keywordVariantData';
export function getAllHigienizacaoTapetesRoutes() {
  return getAllKeywordVariantRoutes().filter(r => r.variantKey === 'higienizacao' && r.serviceKey === 'tapetes');
}
