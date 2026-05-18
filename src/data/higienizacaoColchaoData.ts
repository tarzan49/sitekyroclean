// Wrapper — higienização × colchão subset.
export type { KeywordVariantData } from './keywordVariantData';
export { getKeywordVariantData as getHigienizacaoColchaoData } from './keywordVariantData';

import { getAllKeywordVariantRoutes } from './keywordVariantData';
export function getAllHigienizacaoColchaoRoutes() {
  return getAllKeywordVariantRoutes().filter(r => r.variantKey === 'higienizacao' && r.serviceKey === 'colchao');
}
