import { describe, expect, it } from 'vitest';
import { tagWaterproofBase } from './waterproofBase';

describe('tagWaterproofBase', () => {
  it('Premium = solvente, Essencial = à base de água, só em impermeabilizações', () => {
    expect(tagWaterproofBase('Serviço 75€ (149€) Impermeabilização Premium de sofá 3 lugares - 900000005 - Ana'))
      .toBe('Serviço 75€ (149€) Impermeabilização Premium (solvente) de sofá 3 lugares - 900000005 - Ana');
    expect(tagWaterproofBase('Limpeza e impermeabilização Essencial de sofá')).toBe('Limpeza e impermeabilização Essencial (à base de água) de sofá');
    expect(tagWaterproofBase('Sofá 3 lugares Premium + 4 cadeiras Essencial, impermeabilização'))
      .toBe('Sofá 3 lugares Premium (solvente) + 4 cadeiras Essencial (à base de água), impermeabilização');
    expect(tagWaterproofBase('Limpeza de sofá Premium')).toBe('Limpeza de sofá Premium');
  });
  it('não repete a etiqueta', () => {
    const once = tagWaterproofBase('Impermeabilização Premium sofá');
    expect(tagWaterproofBase(once)).toBe(once);
  });
  it('anti-ácaros leva sempre (produto Bactran), uma só vez', () => {
    expect(tagWaterproofBase('Serviço 50€ (99€) Limpeza de colchão de casal com anti-ácaros - Lourenço'))
      .toBe('Serviço 50€ (99€) Limpeza de colchão de casal com anti-ácaros (produto Bactran) - Lourenço');
    const once = tagWaterproofBase('Colchão + anti ácaros');
    expect(once).toBe('Colchão + anti ácaros (produto Bactran)');
    expect(tagWaterproofBase(once)).toBe(once);
  });
});
