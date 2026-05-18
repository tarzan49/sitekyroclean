// Wrapper — re-exports the lavagem × sofá subset from the central engine.
export type { KeywordVariantData as SofaVariantData } from './keywordVariantData';
export { getKeywordVariantData as getLavagemSofaData } from './keywordVariantData';

import { getAllKeywordVariantRoutes } from './keywordVariantData';
export function getAllLavagemSofaRoutes() {
  return getAllKeywordVariantRoutes().filter(r => r.variantKey === 'lavagem' && r.serviceKey === 'sofa');
}
