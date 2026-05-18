// Wrapper — re-exports the higienização × sofá subset from the central engine.
export type { KeywordVariantData as SofaVariantData } from './keywordVariantData';
export { getKeywordVariantData as getHigienizacaoSofaData } from './keywordVariantData';

import { getAllKeywordVariantRoutes } from './keywordVariantData';
export function getAllHigienizacaoSofaRoutes() {
  return getAllKeywordVariantRoutes().filter(r => r.variantKey === 'higienizacao' && r.serviceKey === 'sofa');
}
