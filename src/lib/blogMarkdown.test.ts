import { describe, it, expect } from 'vitest';
import { renderBlogBody } from './blogMarkdown';
import { getAllPosts } from '@/data/blogData';

describe('renderBlogBody', () => {
  it('converte negrito em <strong> em vez de deixar os asteriscos à vista', () => {
    expect(renderBlogBody('**Tamanho e configuração**, conta.')).toBe(
      '<p><strong>Tamanho e configuração</strong>, conta.</p>',
    );
  });

  it('dá estrutura às listas em vez de as deixar como texto corrido', () => {
    expect(renderBlogBody('- Sofá de 1 lugar\n- Sofá de 2 lugares')).toBe(
      '<ul><li>Sofá de 1 lugar</li><li>Sofá de 2 lugares</li></ul>',
    );
    expect(renderBlogBody('1. Inspeção\n2. Aspiração')).toBe(
      '<ol><li>Inspeção</li><li>Aspiração</li></ol>',
    );
  });

  it('separa uma linha de introdução da lista que vem a seguir', () => {
    expect(renderBlogBody('**Residencial:**\n- Cadeiras de sala')).toBe(
      '<p><strong>Residencial:</strong></p>\n<ul><li>Cadeiras de sala</li></ul>',
    );
  });

  it('escapa o texto do autor antes de aplicar markdown', () => {
    expect(renderBlogBody('Um <script> e um & solto')).toBe(
      '<p>Um &lt;script&gt; e um &amp; solto</p>',
    );
  });

  it('nenhum artigo publicado deixa asteriscos de markdown no HTML final', () => {
    for (const post of getAllPosts()) {
      for (const section of post.sections) {
        expect(renderBlogBody(section.body), `${post.slug}: ${section.heading}`).not.toContain('**');
      }
    }
  });
});
