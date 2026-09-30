// A migalha das quatro famílias landing (localidade, freguesia, preço e
// variante), escrita uma vez para quem a vê e para o que a página declara.
//
// Não importa nada pesado: o `PricePage.tsx` e o `FreguesiaServicePage.tsx`
// usam-na e as famílias landing deixaram de carregar os seus catálogos na
// entrada normal (ver `use-landing-model.ts`). `import type` é apagado na
// compilação, por isso o modelo landing e os catálogos que ele lê não vêm atrás.
import { cityPrep } from './serviceCatalog';
import type { LandingPageModel } from './landingPageModel';

/** Um passo da migalha: o texto e a página para onde aponta. */
export interface BreadcrumbStep { name: string; path: string }

/**
 * Início › serviço › a própria página. É a mesma nos quatro sítios onde a
 * migalha aparece: o hero e o JSON-LD do React, a <nav> do HTML estático
 * (`renderLandingPageHtml`) e o BreadcrumbList que o `emit()` do
 * scripts/prerender.ts declara a partir do modelo.
 *
 * Nas páginas de preço o último passo é "Preços no Porto" e não "Porto". Até
 * 30/09/2026 as 420 páginas mostravam "… › Porto" (o hero montava a migalha
 * sozinho e o HTML estático repetia-a) e declaravam "… › Preços no Porto".
 * Ficou o que declaravam: é o nome da página, e "Início › Limpeza de Sofás ›
 * Porto" já é a migalha de /limpeza-sofas-porto.
 *
 * Nas freguesias há um passo a mais, o município: "Início › Limpeza de Sofás ›
 * Porto › Paranhos" (dono, 30/09/2026). Até essa data as 4.170 páginas
 * mostravam "… › Paranhos" e o HTML estático declarava "… › Porto ›
 * Paranhos". O passo distingue as 13 freguesias com o mesmo nome em dois
 * municípios (Santa Clara, em Coimbra e em Lisboa). As variantes de keyword
 * com freguesia ficam com três passos (dono, mesmo dia): o último já diz
 * "Paranhos, Porto".
 *
 * Cada passo é uma página que existe: a página inicial, o hub do serviço, o
 * serviço no município (há página de localidade para os 69 municípios com
 * freguesias, nos seis serviços) e a própria página.
 */
export function landingBreadcrumb(model: Pick<LandingPageModel, 'family' | 'path' | 'serviceSlug' | 'serviceName' | 'serviceBaseRoute' | 'heroLocationName' | 'municipalitySlug' | 'municipalityName'>): BreadcrumbStep[] {
  const page = model.family === 'preco'
    ? `Preços ${cityPrep(model.municipalityName)} ${model.municipalityName}`
    : model.heroLocationName;
  return [
    { name: 'Início', path: '/' },
    { name: model.serviceName, path: model.serviceBaseRoute },
    ...(model.family === 'freguesia' ? [{ name: model.municipalityName, path: `/${model.serviceSlug}-${model.municipalitySlug}` }] : []),
    { name: page, path: model.path },
  ];
}

/**
 * Os passos como o hero (`CommercialHero`) os desenha: o último é a própria
 * página, em texto e sem ligação, como na <nav> do HTML estático.
 */
export function heroBreadcrumb(steps: BreadcrumbStep[]): { label: string; to?: string }[] {
  return steps.map((step, index) => ({ label: step.name, to: index < steps.length - 1 ? step.path : undefined }));
}
