// Slim route-generation for keyword variant pages.
// Only imports location data — keeps the 13 large content functions in
// keywordVariantData.ts out of the initial bundle.

import { cities } from './locationSeoData';
import { municipiosComFreguesias } from './freguesiaSeoData';

export type ServiceKey = 'sofa' | 'colchao' | 'tapetes' | 'cadeiras' | 'alcatifas';
export type VariantKey = 'higienizacao' | 'lavagem' | 'impermeabilizacao';

export interface KeywordVariantRoute {
  path: string;
  variantKey: VariantKey;
  serviceKey: ServiceKey;
  locationPart: string;
}

const SERVICES_FOR_VARIANT: Record<VariantKey, ServiceKey[]> = {
  higienizacao:      ['sofa', 'colchao', 'tapetes', 'cadeiras', 'alcatifas'],
  lavagem:           ['sofa', 'colchao', 'tapetes', 'cadeiras', 'alcatifas'],
  impermeabilizacao: ['sofa', 'cadeiras'],
};

const VARIANTS: VariantKey[] = ['higienizacao', 'lavagem', 'impermeabilizacao'];

export function getAllKeywordVariantRoutes(): KeywordVariantRoute[] {
  const routes: KeywordVariantRoute[] = [];

  for (const v of VARIANTS) {
    const services = SERVICES_FOR_VARIANT[v];
    for (const s of services) {
      for (const city of cities) {
        routes.push({ path: `/${v}-${s}-${city.slug}`, variantKey: v, serviceKey: s, locationPart: city.slug });
      }
      for (const mun of municipiosComFreguesias) {
        for (const freg of mun.freguesias) {
          const locPart = `${mun.slug}-${freg.slug}`;
          routes.push({ path: `/${v}-${s}-${locPart}`, variantKey: v, serviceKey: s, locationPart: locPart });
        }
      }
    }
  }
  return routes;
}
