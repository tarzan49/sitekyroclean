/**
 * llms.txt generator for Kyro Clean Solutions
 *
 * Emits dist/llms.txt — the plain-text summary that generative engines
 * (ChatGPT, Perplexity, Claude, Gemini) read to understand what this site is
 * and which pages answer which question, without crawling 15.000+ routes.
 * Format follows the llmstxt.org convention: H1, a summary blockquote,
 * then `## ` sections of `- [title](url): description` links.
 *
 * Every number here is READ FROM THE REAL SOURCE, never typed in. This file
 * is the one place where the whole business is summarised in one page, which
 * makes it exactly the kind of file that silently goes stale — so it holds no
 * facts of its own. Prices come from serviceCatalog, the travel fee range
 * from constants/travel, the rating and coverage from constants/business.
 * If a price changes in its source, this file changes on the next build.
 *
 * Runs as a Vite closeBundle step (see vite.config.ts), alongside the sitemap
 * and prerender plugins. Can also run standalone: npx tsx scripts/generate-llms-txt.ts
 */

import fs from 'fs';
import path from 'path';
import { services, cities } from '../src/data/serviceCatalog';
import { locationPrices } from '../src/constants/travel';
import {
  SITE_URL,
  PHONE_DISPLAY,
  BUSINESS_EMAIL,
  REVIEW_RATING,
  REVIEW_COUNT,
  CLIENTS_SERVED_LABEL,
} from '../src/constants/business';
import { getAllPosts } from '../src/data/blogData';

/** Human labels for the four coverage areas in serviceCatalog's `area` field. */
const AREA_LABELS: Record<string, string> = {
  // Aveiro e Coimbra são Centro, servidas pela equipa do Porto por não
  // haver equipa própria no Centro — daí o rótulo não ser só "Norte".
  porto: 'Grande Porto, Norte e Centro',
  braga: 'Braga e Minho',
  lisboa: 'Lisboa, Setúbal e Alentejo Litoral',
  algarve: 'Algarve',
};

export function buildLlmsTxt(): string {
  const travelFees = Object.values(locationPrices);
  const travelMin = Math.min(...travelFees);
  const travelMax = Math.max(...travelFees);

  const citiesByArea = new Map<string, string[]>();
  for (const city of cities) {
    const list = citiesByArea.get(city.area) ?? [];
    list.push(city.name);
    citiesByArea.set(city.area, list);
  }

  const posts = getAllPosts();

  const lines: string[] = [];

  lines.push('# Kyro Clean Solutions');
  lines.push('');
  lines.push(
    `> Empresa portuguesa de limpeza e higienização de estofos ao domicílio: sofás, ` +
    `colchões, tapetes, cadeiras e alcatifas, além de impermeabilização de sofás e ` +
    `cadeiras. Atende ${cities.length} cidades em ${citiesByArea.size} regiões, com ` +
    `${CLIENTS_SERVED_LABEL} clientes servidos e ${REVIEW_RATING}/5 em ` +
    `${REVIEW_COUNT} avaliações Google.`,
  );
  lines.push('');
  lines.push('Como ler os preços deste site:');
  lines.push('');
  lines.push('- Os valores em euros são preços de partida por artigo, não o total do serviço.');
  lines.push(`- A deslocação é cobrada à parte e varia entre ${travelMin}€ e ${travelMax}€ conforme a cidade.`);
  lines.push('- Tapetes e alcatifas não têm preço de tabela: dependem das medidas e são sempre orçamentados.');
  lines.push('- O preço final é confirmado com o cliente antes da marcação, com base nos artigos, medidas, tratamento e deslocação.');
  lines.push('');

  lines.push('## Serviços');
  lines.push('');
  for (const service of services) {
    const price = service.priceFrom === 'Sob orçamento'
      ? 'sob orçamento, conforme as medidas'
      : `desde ${service.priceFrom} por artigo`;
    lines.push(`- [${service.name}](${SITE_URL}${service.baseRoute}): ${price}.`);
  }
  lines.push('');

  lines.push('## Cobertura');
  lines.push('');
  lines.push(
    `Serviço ao domicílio. Cada serviço tem uma página própria por cidade, no formato ` +
    `${SITE_URL}/{serviço}-{cidade} (exemplo: ${SITE_URL}/limpeza-sofas-porto).`,
  );
  lines.push('');
  for (const [area, label] of Object.entries(AREA_LABELS)) {
    const list = citiesByArea.get(area);
    if (!list?.length) continue;
    lines.push(`- **${label}** (${list.length} cidades): ${list.join(', ')}.`);
  }
  lines.push('');
  lines.push(`- [Todas as áreas de serviço](${SITE_URL}/areas-de-servico): lista completa das cidades e freguesias atendidas.`);
  lines.push('');

  lines.push('## Respostas e referência');
  lines.push('');
  lines.push(`- [Perguntas frequentes sobre limpeza de estofos](${SITE_URL}/perguntas-frequentes-limpeza-estofos): preços, duração, secagem, garantias e o que está incluído.`);
  lines.push(`- [Glossário de limpeza de estofos](${SITE_URL}/glossario-limpeza-estofos): definições dos termos técnicos usados nos orçamentos.`);
  lines.push(`- [Antes e depois](${SITE_URL}/antes-depois-limpeza): fotografias de trabalhos reais, por tipo de artigo e de sujidade.`);
  lines.push(`- [Guia de packs](${SITE_URL}/guia-de-packs): combinações de artigos na mesma visita, com preço de pack no artigo acrescentado, por cidade.`);
  lines.push('');

  lines.push('## Artigos');
  lines.push('');
  for (const post of posts) {
    lines.push(`- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.metaDescription}`);
  }
  lines.push('');

  lines.push('## Contacto');
  lines.push('');
  lines.push(`- Telefone e WhatsApp: ${PHONE_DISPLAY} (+351)`);
  lines.push(`- Email: ${BUSINESS_EMAIL}`);
  lines.push(`- Pedidos de orçamento: ${SITE_URL}`);
  lines.push('');

  return lines.join('\n');
}

export function generateLlmsTxt(outDir: string): void {
  const content = buildLlmsTxt();
  fs.writeFileSync(path.join(outDir, 'llms.txt'), content, 'utf-8');
  console.log(`✅ llms.txt (${content.length} caracteres)`);
}

// Standalone: npx tsx scripts/generate-llms-txt.ts
if (process.argv[1] && process.argv[1].endsWith('generate-llms-txt.ts')) {
  generateLlmsTxt(path.resolve(process.cwd(), 'dist'));
}
