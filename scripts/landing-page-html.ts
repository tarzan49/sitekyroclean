import { exampleImageSrcSet, EXAMPLE_IMAGE_SIZES } from '../src/lib/responsiveImages';
import type { LandingPageModel } from '../src/data/landingPageModel';
import { LANDING_SECTION_ORDER } from '../src/data/landingServiceCopy';
import { commercialHeroPriceLine, commercialHeroStats } from '../src/data/commercialHeroCopy';
import { FOOTER_NAV, FOOTER_STRIP_LINKS, FOOTER_LEGAL_LINKS } from '../src/data/siteFooterNav';
import { SERVICE_CONDITIONS, SERVICE_CONDITIONS_LINKS } from '../src/constants/commercialPolicy';

export const escapeLandingHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const e = escapeLandingHtml;
const links = (items: { href: string; label: string }[]) => `<ul>${items.map(item => `<li><a href="${e(item.href)}">${e(item.label)}</a></li>`).join('')}</ul>`;

/**
 * Prices render as a <table>, not a list.
 *
 * This HTML is never seen by a person: main.tsx mounts with createRoot, not
 * hydrateRoot, so React discards all of it and draws PriceWidget in its place.
 * The only readers are crawlers that don't run JavaScript, generative engines
 * included, and for them the column headers are the point: "49€" in a list item
 * is a number next to a noun, while the same value under a "Preço" header, in a
 * row keyed by "Sofá 1 lugar", carries its own meaning out of the page.
 *
 * <caption> repeats the h2 on purpose. A table pulled out of its page keeps its
 * caption and loses its heading, and an uncaptioned price table is a grid of
 * euros belonging to no service and no city.
 *
 * The header is "Preço", not "Preço desde": PRICE_TABLE rows are not all
 * starting prices. An add-on row is an increment and "Sob orçamento" is not a
 * price at all, so the narrower header would state something untrue about
 * those rows.
 *
 * Rows come from model.priceRows, which is PRICE_TABLE, the same array
 * PriceWidget reads. The widget and this table cannot disagree on a number,
 * and this change adds no figure the widget doesn't already show.
 */
/**
 * As três páginas que respondem por quem é a empresa: a entidade, a pessoa que
 * assina e o estudo com dados próprios.
 *
 * Estavam ligadas só a partir do rodapé React, que é desenhado depois do
 * JavaScript correr. Para um crawler que não o corre, e é esse o público de
 * todo este HTML, recebiam respetivamente 2, 27 e 0 ligações em 16.262
 * páginas. São as páginas que sustentam o E-E-A-T do site inteiro e eram as
 * menos ligadas dele.
 *
 * Os mesmos três destinos estão no rodapé React (Footer.tsx, coluna Recursos),
 * por isso isto não acrescenta nada que a pessoa não receba.
 */
/**
 * Fase 8, segunda passagem: passou a ser o rodapé inteiro, não só as três
 * páginas de entidade. A medição que motivou isto está em `siteFooterNav.ts`
 * — resumindo, o glossário está no rodapé de todas as páginas e recebia uma
 * ligação interna no HTML estático; o "Antes e Depois", que está na navegação
 * do cabeçalho, recebia zero.
 *
 * As listas vêm de `siteFooterNav.ts`, que é o que o `Footer.tsx` também
 * renderiza: mesma informação, renderização diferente. O bloco Packs fica
 * de fora de propósito (ver o comentário lá).
 */
export const ENTITY_FOOTER_HTML =
  FOOTER_NAV.map(group =>
    `<nav aria-label="${e(group.title)}"><h2>${e(group.title)}</h2><ul>`
    + group.links.map(link => `<li><a href="${e(link.href)}">${e(link.label)}</a></li>`).join('')
    + '</ul></nav>').join('')
  + '<nav aria-label="Outros serviços e zonas"><ul>'
  + FOOTER_STRIP_LINKS.map(link => `<li><a href="${e(link.href)}">${e(link.label)}</a></li>`).join('')
  + '</ul></nav>'
  + '<nav aria-label="Informação legal"><ul>'
  + FOOTER_LEGAL_LINKS.map(link => `<li><a href="${e(link.href)}">${e(link.label)}</a></li>`).join('')
  + '<li><a href="https://www.livroreclamacoes.pt/inicio" rel="nofollow noopener">Livro de Reclamações</a></li>'
  + '</ul></nav>';

/**
 * "Condições do serviço e garantia": o bloco que o rodapé React desenha em
 * todas as páginas (BusinessConditions.tsx), a partir da mesma lista. As
 * páginas landing não o tinham no HTML estático e as restantes tinham uma
 * versão diferente da do React, com outras frases e outra deslocação.
 */
export const SERVICE_CONDITIONS_HTML =
  '<details><summary>Condições do serviço e garantia</summary>'
  + SERVICE_CONDITIONS.map(text => `<p>${e(text)}</p>`).join('')
  + `<p>${SERVICE_CONDITIONS_LINKS.map(link => `<a href="${e(link.href)}">${e(link.label)}</a>`).join(' · ')}</p>`
  + '</details>';

/** Semantic no-JS fallback, with the same model and order as the React composition. */
export function renderLandingPageHtml(model: LandingPageModel): string {
  const sections = {
    precos: `<h2>${e(model.priceHeading)}</h2>${model.variantExplanation ? `<p>${e(model.variantExplanation)}</p>` : ''}<table><caption>${e(model.priceHeading)}</caption><thead><tr><th scope="col">Artigo</th><th scope="col">Preço</th></tr></thead><tbody>${model.priceRows.map(row => `<tr><th scope="row">${e(row.item)}</th><td>${e(row.price)}</td></tr>`).join('')}</tbody></table><p>${e(model.pricePolicy)}</p><details data-landing-trust><summary>Porquê escolher a Kyro Clean?</summary>${model.trustPoints.map(point => `<article><h3>${e((point.stat ? point.stat + ' ' : '') + point.titleGold + (point.titleRest ?? ''))}</h3><p>${e(point.desc)}</p></article>`).join('')}</details>${model.priceFactors.length ? `<details><summary>Como é calculado o preço?</summary>${model.priceFactors.map(factor => `<article><h3>${e(factor.title)}</h3><p>${e(factor.description)}</p><ul>${factor.examples.map(example => `<li>${e(example)}</li>`).join('')}</ul></article>`).join('')}</details>` : ''}`,
    avaliacoes: `<h2>O que dizem os nossos clientes</h2>${model.reviews.map(review => `<figure><blockquote>${e(review.text)}</blockquote><figcaption>${e(review.name)}${review.city ? ` · ${e(review.city)}` : ''}</figcaption></figure>`).join('')}`,
    problemas: `<h2>${e(model.problemHeading)}</h2>${model.problems.map(problem => `<article data-problem-id="${e(problem.id)}">${problem.image ? `<figure><img src="${e(problem.image.src)}" srcset="${e(exampleImageSrcSet(problem.image.src) ?? problem.image.src)}" sizes="${EXAMPLE_IMAGE_SIZES}" fetchpriority="low" alt="${e(problem.image.alt)}" width="1200" height="675" loading="lazy" decoding="async"><figcaption>Imagem ilustrativa</figcaption></figure>` : ''}<h3>${e(problem.title)}</h3><p>${e(problem.description)}</p></article>`).join('')}`,
    duvidas: `<h2>${e(model.faqHeading)}</h2>${model.faqs.map(faq => `<details><summary>${e(faq.question)}</summary><p>${e(faq.answer)}</p></details>`).join('')}`,
    processo: `<h2>Como funciona: ${e(model.serviceLabel.toLowerCase())}</h2><ol>${model.processSteps.map(step => `<li><h3>${e(step.title)}</h3><p>${e(step.description)}</p></li>`).join('')}</ol>`,
    'mesma-visita': `<h2>Aproveite a mesma visita</h2>${links(model.packLinks)}`,
    zonas: `<h2>Serviços e zonas de atendimento ${e(model.prep)} ${e(model.locationName)}</h2>${model.directory.map(group => `<details><summary>${e(group.title)}</summary>${links(group.links)}</details>`).join('')}`,
  };
    // Os factos do hero, escritos com as mesmas funções que o CommercialHero usa
  // para os desenhar. Nenhum destes valores é novo na página: o preço de
  // partida, a deslocação da cidade, a avaliação, o tempo de resposta e o de
  // secagem já estavam todos no hero para quem visita o site. O que faltava era
  // chegarem aqui: "Desde 49€" e "deslocação 10€" não apareciam uma única vez
  // no HTML estático, que é o único que um crawler sem JavaScript lê.
  const heroFacts = `<p>${e(commercialHeroPriceLine(model.serviceSlug, model.municipalityName, model.priceFrom))}</p><ul>${commercialHeroStats(model.serviceSlug).map(stat => `<li>${e(stat.value)} · ${e(stat.label)}</li>`).join('')}</ul>`;
  // A mesma migalha que o CommercialHero desenha para quem vê a página:
  // Início, o serviço (ligado ao seu hub) e a localidade como texto. Não é
  // informação nova, é a que faltava no HTML estático — e era a razão de os
  // seis serviços-pilar quase não receberem ligações internas num site de
  // 16.000 páginas, apesar de cada uma delas pertencer a um.
  const breadcrumb = `<nav aria-label="Breadcrumb"><ol>`
    + `<li><a href="/">Início</a></li>`
    + `<li><a href="${e(model.serviceBaseRoute)}">${e(model.serviceName)}</a></li>`
    + `<li>${e(model.heroLocationName)}</li>`
    + `</ol></nav>`;

  return `<main>${breadcrumb}<h1>${e(model.h1)}</h1><p>${e(model.intro)}</p>${heroFacts}${LANDING_SECTION_ORDER.map(section => `<section id="${section}" data-landing-section="${section}">${sections[section]}</section>`).join('\n')}${SERVICE_CONDITIONS_HTML}${ENTITY_FOOTER_HTML}</main>`;
}
