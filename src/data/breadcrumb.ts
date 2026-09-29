// A migalha das quatro famílias landing (localidade, freguesia, preço e
// variante), escrita uma vez para quem a vê e para o que a página declara.
//
// Não importa nada pesado: o `PricePage.tsx` usa-a e as famílias landing
// deixaram de carregar os seus catálogos na entrada normal (ver
// `use-landing-model.ts`). `import type` é apagado na compilação, por isso o
// modelo landing e os catálogos que ele lê não vêm atrás.
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
 * Porto" já é a migalha de /limpeza-sofas-porto. Cada passo é uma página que
 * existe: a página inicial, o hub do serviço e a própria página.
 */
export function landingBreadcrumb(model: Pick<LandingPageModel, 'family' | 'path' | 'serviceName' | 'serviceBaseRoute' | 'heroLocationName' | 'municipalityName'>): BreadcrumbStep[] {
  const page = model.family === 'preco'
    ? `Preços ${cityPrep(model.municipalityName)} ${model.municipalityName}`
    : model.heroLocationName;
  return [
    { name: 'Início', path: '/' },
    { name: model.serviceName, path: model.serviceBaseRoute },
    { name: page, path: model.path },
  ];
}
