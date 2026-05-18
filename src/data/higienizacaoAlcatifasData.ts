// Wrapper — higienização × alcatifas subset.
export type { KeywordVariantData } from './keywordVariantData';
export { getKeywordVariantData as getHigienizacaoAlcatifasData } from './keywordVariantData';

import { getAllKeywordVariantRoutes } from './keywordVariantData';
export function getAllHigienizacaoAlcatifasRoutes() {
  return getAllKeywordVariantRoutes().filter(r => r.variantKey === 'higienizacao' && r.serviceKey === 'alcatifas');
}
