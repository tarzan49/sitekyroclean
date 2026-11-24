import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getAllPosts } from './blogData';
import { BLOG_THEMES } from './blogThemes';

describe('índice do blog', () => {
  it('cada guia está num tema e só num', () => {
    const inThemes = BLOG_THEMES.flatMap(theme => [...theme.slugs]);
    expect([...inThemes].sort()).toEqual(getAllPosts().map(post => post.slug).sort());
  });
  it('cada guia tem a sua fotografia e a sua legenda', () => {
    const alts = readFileSync('src/constants/blogImages.ts', 'utf8');
    for (const post of getAllPosts()) {
      expect(existsSync(`src/assets/blog/${post.slug}.webp`), post.slug).toBe(true);
      expect(alts).toContain(`'${post.slug}': '`);
    }
  });
});
