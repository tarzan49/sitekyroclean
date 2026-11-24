import { describe, expect, it } from 'vitest';
import { GOOGLE_REVIEW_LINK_LISBOA, GOOGLE_REVIEW_LINK_PORTO } from '../constants/google';
import { reviewLinkForCity } from './reviewLink';

describe('ficha do Google da página de avaliação', () => {
  it.each(['Lisboa', 'cascais', 'Setúbal', 'setubal', 'Sintra', 'Grândola'])('%s avalia na ficha de Lisboa', city => {
    expect(reviewLinkForCity(city)).toBe(GOOGLE_REVIEW_LINK_LISBOA);
  });
  it.each(['Porto', 'Braga', 'Coimbra', 'Faro', 'Funchal', '', undefined, 'Terra Inventada'])('%s avalia na ficha do Porto', city => {
    expect(reviewLinkForCity(city)).toBe(GOOGLE_REVIEW_LINK_PORTO);
  });
  it('a zona do endereço manda', () => {
    expect(reviewLinkForCity('Odivelas de Cima', 'lisboa')).toBe(GOOGLE_REVIEW_LINK_LISBOA);
    expect(reviewLinkForCity('Lisboa', 'porto')).toBe(GOOGLE_REVIEW_LINK_PORTO);
  });
});
