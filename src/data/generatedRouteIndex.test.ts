import { describe, it, expect } from 'vitest';
import { generatedPageForPath } from './generatedRouteIndex';
import { getAllMaterialRoutes } from './materialSeoData';
import { getAllFreguesiaRoutes } from './freguesiaSeoData';
describe('deferred route selection', () => {
  it('preserves the keyword precedence over overlapping problem routes', () => {
    expect(generatedPageForPath('/higienizacao-colchao-porto')).toBe('SofaVariantPage');
    expect(generatedPageForPath('/limpeza-sofas-lisboa')).toBe('LocationServicePage');
  });
  it('keeps material, parish and trailing-slash routes available', () => {
    expect(generatedPageForPath(getAllMaterialRoutes()[0].path)).toBe('MaterialPage');
    expect(generatedPageForPath(getAllFreguesiaRoutes()[0].path + '/')).toBe('FreguesiaServicePage');
  });
  it('does not accept invented cities or malformed escapes', () => {
    expect(generatedPageForPath('/limpeza-sofas-cidade-inexistente')).toBe('NotFound');
    expect(generatedPageForPath('/%zz')).toBe('NotFound');
  });
});
