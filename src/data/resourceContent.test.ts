import { describe, expect, it } from 'vitest';
import { getAllPosts } from './blogData';
import { glossaryTerms } from './glossaryTerms';
import { getResourceCommercial, getResourceOffer, getResourceWhatsapp, RESOURCE_FAQS, resourceHeroSubtitle } from './resourceContent';
import { sofaPrices, mattressPrices } from '../components/quiz/QuizTypes';
import { pickReviewSubset } from './reviewsPool';

describe('recursos comerciais e inventário', () => {
  it('preserva 26 artigos, 100 âncoras únicas e quatro respostas em cada página FAQ', () => {
    expect(getAllPosts()).toHaveLength(26);
    expect(new Set(getAllPosts().map(p => p.slug)).size).toBe(26);
    expect(glossaryTerms).toHaveLength(100);
    expect(new Set(glossaryTerms.map(t => t.id)).size).toBe(100);
    expect(RESOURCE_FAQS).toHaveLength(4);
    for (const post of getAllPosts()) {
      expect(post.faq, post.slug).toHaveLength(4);
      for (const slug of post.relatedPosts) expect(getAllPosts().some(p => p.slug === slug), slug).toBe(true);
    }
  });
  it('mantém o contexto do artigo no WhatsApp e dados comerciais iguais aos componentes partilhados', () => {
    for (const post of getAllPosts()) {
      const model = getResourceCommercial(post);
      const message = new URL(getResourceWhatsapp(post)).searchParams.get('text');
      expect(message).toContain(post.title);
      expect(message).toContain('localidade');
      expect(model.priceRows.length).toBeGreaterThan(0);
      expect(model.reviews).toEqual(pickReviewSubset(model.serviceSlug, `/blog/${post.slug}:blog-${post.slug}`, 6));
      expect(resourceHeroSubtitle(post)).not.toContain('?.');
      if (/tapetes|alcatifas/.test(model.serviceSlug)) {
        expect(model.priceRows.every(row => /sob orçamento/i.test(row.price))).toBe(true);
        expect(getResourceOffer(post).title).toContain('sob orçamento');
      }
    }
  });
  it('os preços editoriais acompanham as tabelas reais', () => {
    const sofa = getAllPosts().find(p => p.slug === 'quanto-custa-limpar-sofa-profissional')!;
    const mattress = getAllPosts().find(p => p.slug === 'quanto-custa-limpar-colchao-profissional')!;
    for (const size of sofaPrices.slice(0, 3)) expect(sofa.sections[0].body).toContain(`${size.cleaningPrice}€`);
    for (const size of mattressPrices.filter(p => ['solteiro', 'casal', 'king'].includes(p.id))) expect(mattress.sections[0].body).toContain(`${size.cleaningPrice}€`);
  });
  it('não repõe ofertas, métodos universais e promessas retiradas', () => {
    const copy = JSON.stringify([getAllPosts(), glossaryTerms, RESOURCE_FAQS]);
    expect(copy).not.toMatch(/Preços 2025|devolvemos o dinheiro|80 a 100|99[,.]9%|entregue em 24|recolha e entrega de tapetes em Portugal/i);
    expect(copy).not.toContain('—');
    expect(getAllPosts().some(p => p.slug === 'impermeabilizacao-tapete-guia')).toBe(false);
  });
});
