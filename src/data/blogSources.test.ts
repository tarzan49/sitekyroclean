import { describe, it, expect } from 'vitest';
import { BLOG_SOURCES, getBlogSources } from './blogSources';
import { getAllPosts } from './blogData';

describe('fontes dos artigos', () => {
  it('cada id citado por um artigo existe no catálogo', () => {
    for (const post of getAllPosts()) {
      expect(() => getBlogSources(post.sources), post.slug).not.toThrow();
    }
  });

  it('toda a fonte tem editor, data de verificação e o que sustenta', () => {
    for (const source of Object.values(BLOG_SOURCES)) {
      expect(source.publisher.length, source.id).toBeGreaterThan(3);
      expect(source.checkedOn, source.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.supports.length, source.id).toBeGreaterThan(30);
      expect(source.url, source.id).toMatch(/^https:\/\//);
    }
  });

  it('nenhum artigo atribui números a autoridades de saúde sem citar fonte', () => {
    // A armadilha concreta que originou isto: uma estimativa atribuída à OMS
    // que a OMS nunca publicou. Se voltar a aparecer uma atribuição destas num
    // artigo sem `sources`, este teste apanha-a.
    const autoridades = /Organização Mundial de Saúde|\bOMS\b|Direção-Geral da Saúde|\bDGS\b|SPAIC|Cochrane/;
    for (const post of getAllPosts()) {
      const texto = [post.intro, ...post.sections.flatMap(s => [s.body, s.tip ?? '']), ...post.faq.map(f => f.a)].join(' ');
      if (autoridades.test(texto)) {
        expect(post.sources?.length ?? 0, `${post.slug} cita uma autoridade sem fonte`).toBeGreaterThan(0);
      }
    }
  });
});
