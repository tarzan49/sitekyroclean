import type { LandingPageModel } from '../src/data/landingPageModel';
import { LANDING_SECTION_ORDER } from '../src/data/landingServiceCopy';

export const escapeLandingHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const e = escapeLandingHtml;
const links = (items: { href: string; label: string }[]) => `<ul>${items.map(item => `<li><a href="${e(item.href)}">${e(item.label)}</a></li>`).join('')}</ul>`;

/** Semantic no-JS fallback, with the same model and order as the React composition. */
export function renderLandingPageHtml(model: LandingPageModel): string {
  const sections = {
    precos: `<h2>${e(model.priceHeading)}</h2><p>${e(model.pricingDescription)}</p><p data-landing-editorial>${e(model.editorialIntro)}</p>${model.variantExplanation ? `<p>${e(model.variantExplanation)}</p>` : ''}<ul>${model.priceRows.map(row => `<li>${e(row.item)}: ${e(row.price)}</li>`).join('')}</ul><p>${e(model.pricePolicy)}</p><details data-landing-trust><summary>Porquê escolher a Kyro Clean?</summary>${model.trustPoints.map(point => `<article><h3>${e((point.stat ? point.stat + ' ' : '') + point.titleGold + (point.titleRest ?? ''))}</h3><p>${e(point.desc)}</p></article>`).join('')}</details>${model.priceFactors.length ? `<details><summary>Como é calculado o preço?</summary>${model.priceFactors.map(factor => `<article><h3>${e(factor.title)}</h3><p>${e(factor.description)}</p><ul>${factor.examples.map(example => `<li>${e(example)}</li>`).join('')}</ul></article>`).join('')}</details>` : ''}`,
    avaliacoes: `<h2>O que dizem os nossos clientes</h2>${model.reviews.map(review => `<figure><blockquote>${e(review.text)}</blockquote><figcaption>${e(review.name)}${review.city ? ` · ${e(review.city)}` : ''}</figcaption></figure>`).join('')}`,
    problemas: `<h2>${e(model.problemHeading)}</h2>${model.problems.map(problem => `<article data-problem-id="${e(problem.id)}">${problem.image ? `<figure><img src="${e(problem.image.src)}" alt="${e(problem.image.alt)}" width="1200" height="675" loading="lazy" decoding="async"><figcaption>Imagem ilustrativa</figcaption></figure>` : ''}<h3>${e(problem.title)}</h3><p>${e(problem.description)}</p></article>`).join('')}`,
    duvidas: `<h2>${e(model.faqHeading)}</h2>${model.faqs.map(faq => `<details><summary>${e(faq.question)}</summary><p>${e(faq.answer)}</p></details>`).join('')}`,
    processo: `<h2>Como funciona: ${e(model.serviceLabel.toLowerCase())}</h2><ol>${model.processSteps.map(step => `<li><h3>${e(step.title)}</h3><p>${e(step.description)}</p></li>`).join('')}</ol>`,
    'mesma-visita': `<h2>Aproveite a mesma visita</h2>${links(model.packLinks)}`,
    zonas: `<h2>Serviços e zonas de atendimento ${e(model.prep)} ${e(model.locationName)}</h2>${model.directory.map(group => `<details><summary>${e(group.title)}</summary>${links(group.links)}</details>`).join('')}`,
  };
  return `<main><h1>${e(model.h1)}</h1><p>${e(model.intro)}</p>${LANDING_SECTION_ORDER.map(section => `<section id="${section}" data-landing-section="${section}">${sections[section]}</section>`).join('\n')}</main>`;
}
