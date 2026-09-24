import { commercialHeroSubtitle } from './commercialHeroCopy';
import { getLandingTrustPoints } from '../constants/serviceTrustPool';
import { cities, services, cityPrep, getCityLinksForService, getLocationServiceData } from './locationSeoData';
import { municipiosComFreguesias, getFreguesia, generateFreguesiaContent } from './freguesiaSeoData';
import { getPricePageData } from './priceSeoData';
import { getKeywordVariantData, type VariantKey, type ServiceKey } from './keywordVariantData';
import { getLandingProblems, LANDING_PRICE_VERBS } from './landingServiceCopy';
import { selectLandingProblemImage } from './landingProblemImages';
import { PRICE_TABLE } from './locationPriceTestimonialsData';
import { PRICE_FACTORS } from './priceFactors';
import { SERVICE_PROCESS_GUIDES } from './serviceProcessGuides';
import { SOFA_PROCESS_STEPS } from './sofaProcessGuide';
import { pickReviewSubset } from './reviewsPool';
import { packs } from './packComboData';
import { SERVICE_PACK_SLUGS } from '../constants/servicePackSlugs';
import { locationPrices } from '../constants/travel';
import { PRICE_PROMISE, TREATMENT_EXTRAS } from '../constants/commercialPolicy';
import type { LandingService, LandingFaqContext } from './landingFaqPool';
import { getAllProblems } from './problemSeoData';
import { getMaterialsByService } from './materialSeoData';
import { METRO_CITIES } from '../constants/metroCities';
import { MARCA_CITY_SLUGS } from './marcaCities';

const serviceSlugs = { sofa: 'limpeza-sofas', colchao: 'limpeza-colchoes', tapetes: 'limpeza-tapetes', cadeiras: 'limpeza-cadeiras', alcatifas: 'limpeza-alcatifas' } as const;
const variantLabels = { higienizacao: 'Higienização', lavagem: 'Lavagem', impermeabilizacao: 'Impermeabilização' } as const;
const articleLabels = { sofa: 'sofás', colchao: 'colchões', tapetes: 'tapetes', cadeiras: 'cadeiras', alcatifas: 'alcatifas' } as const;
export interface LandingLink { label: string; href: string }
export interface LandingDirectoryGroup { title: string; links: LandingLink[] }

/**
 * Janelas de cobertura dos blocos de diretório ("Também disponível em" e
 * "Zonas ...").
 *
 * Eram os dois um `.slice(0, n)` sobre uma lista ordenada. Como a ordem é
 * estável, as n primeiras entradas recebiam sempre todas as ligações e as
 * restantes não recebiam nenhuma. Mediu-se: 384 variantes de keyword (32
 * cidades × 12) e as freguesias a partir da nona de cada município ficavam
 * sem uma única ligação interna em todo o site, sem nada no conteúdo que o
 * justificasse. É a mesma falha da lista "Disponível em" dos problemas, que
 * mostrava 179 cidades quando existiam 1.354 páginas: uma lista cortada não
 * é uma lista de cobertura.
 *
 * A janela continua a mostrar `size` ligações por página, porque o bloco não
 * pode crescer no telemóvel (Barcelos tem 65 freguesias). O que muda é o
 * ponto de partida: derivado da posição da própria página, de modo que as
 * páginas de um município, entre todas, cobrem a lista inteira. A ordem de
 * partida tem de ser independente da página — foi por isso que a primeira
 * tentativa falhou em Faro e Lisboa: partia da lista já ordenada por área,
 * que muda conforme a cidade que está a ser desenhada.
 *
 * `landingDirectoryCoverage.test.ts` percorre os municípios e as cidades
 * todas e rebenta se alguma entrada deixar de ser alcançada.
 */
export function coverageWindow<T>(items: readonly T[], start: number, size: number): T[] {
  if (items.length <= size) return [...items];
  const offset = ((start % items.length) + items.length) % items.length;
  return Array.from({ length: size }, (_, i) => items[(offset + i) % items.length]);
}

/** Posição da página dentro do seu município: serviço × variante. Determinística
 *  e independente da ordenação por área, ao contrário do nome da cidade. */
export function directorySlot(serviceSlug: string, variantKey: string | undefined): number {
  const serviceIndex = Math.max(0, services.findIndex(item => item.slug === serviceSlug));
  const variantIndex = variantKey === undefined ? 0 : variantKey === 'higienizacao' ? 1 : variantKey === 'lavagem' ? 2 : 3;
  return serviceIndex * 4 + variantIndex;
}

/**
 * As freguesias do bloco "Zonas ...".
 *
 * Aqui a janela rotativa não chega, e a razão é específica das variantes: o
 * bloco de `/lavagem-colchao-porto` só emite URLs `/lavagem-colchao-porto-*`,
 * por isso é a **única** página do site que pode ligar a essas freguesias.
 * Rodar a janela entre serviços e variantes não cobre nada, porque cada par
 * serviço × variante liga apenas às suas próprias páginas.
 *
 * A outra fonte de ligações para uma freguesia é o bloco "Freguesias
 * próximas" das freguesias vizinhas, que usa o mesmo par serviço × variante.
 * O que fica por cobrir são as freguesias que nenhum `nearby` menciona: no
 * máximo quatro por município (Maia tem quatro, Porto tem duas). Essas vêm
 * primeiro e o resto da janela é preenchido a rodar, por isso o bloco
 * continua a mostrar oito ligações e não cresce no telemóvel.
 */
export function zoneLinks<T extends { slug: string; nearby?: string[] }>(freguesias: readonly T[], slot: number, size: number): T[] {
  const alcancadas = new Set(freguesias.flatMap(freg => freg.nearby ?? []));
  const semOrigem = freguesias.filter(freg => !alcancadas.has(freg.slug));
  const restantes = freguesias.filter(freg => alcancadas.has(freg.slug));
  const preenchimento = coverageWindow(restantes, slot * size, Math.max(0, size - semOrigem.length));
  return [...semOrigem, ...preenchimento];
}

/**
 * As cidades do bloco "Também disponível em".
 *
 * A janela corre sobre a ordem canónica de `cities`, que é igual em todas as
 * páginas, e só depois o resultado é ordenado por área para ser mostrado. Se
 * a janela corresse já sobre a lista ordenada por área — como na primeira
 * versão — o ponto de partida mudava de página para página e a cobertura
 * deixava de estar garantida: Faro e Lisboa, as primeiras das suas áreas,
 * continuavam sem receber ligação nenhuma.
 */
export function coverageCityLinks(serviceSlug: string, municipalityName: string, variantKey: string | undefined, size: number) {
  const canonical = cities.filter(city => city.name !== municipalityName);
  const index = cities.findIndex(city => city.name === municipalityName);
  const chosen = coverageWindow(canonical, (index < 0 ? 0 : index) + directorySlot(serviceSlug, variantKey), size);
  const area = cities.find(city => city.name === municipalityName)?.area;
  return [...chosen]
    .sort((a, b) => Number(b.area === area) - Number(a.area === area))
    .map(city => ({ name: city.name, path: `/${serviceSlug}-${city.slug}` }));
}

/** Resolves only the four landing families. Existing URL definitions are unchanged. */
export function getLandingPageModel(pathname: string) {
  const path = pathname.split(/[?#]/)[0].replace(/\/$/, '');
  let family: LandingFaqContext['family'] = 'localidade';
  let serviceSlug: LandingService | undefined;
  let locationPart = '';
  let variantKey: VariantKey | undefined;
  let serviceKey: ServiceKey | undefined;
  const candidate = path.startsWith('/preco-') ? path.slice(7) : path.slice(1);
  if (path.startsWith('/preco-')) family = 'preco';
  for (const service of services) {
    if (service.slug === 'impermeabilizacao' && /^\/impermeabilizacao-(sofa|cadeiras)-/.test(path)) continue;
    if (candidate.startsWith(`${service.slug}-`)) {
      serviceSlug = service.slug as LandingService;
      locationPart = candidate.slice(service.slug.length + 1);
      break;
    }
  }
  if (!serviceSlug && family !== 'preco') {
    for (const variant of Object.keys(variantLabels) as VariantKey[]) {
      for (const key of Object.keys(serviceSlugs) as ServiceKey[]) {
        const prefix = `/${variant}-${key}-`;
        if (!path.startsWith(prefix)) continue;
        if (variant === 'impermeabilizacao' && key !== 'sofa' && key !== 'cadeiras') return null;
        variantKey = variant; serviceKey = key; family = 'variante';
        serviceSlug = variant === 'impermeabilizacao' ? 'impermeabilizacao' : serviceSlugs[key];
        locationPart = path.slice(prefix.length);
      }
    }
  }
  if (!serviceSlug) return null;
  const city = cities.find(item => item.slug === locationPart);
  const municipality = city ? municipiosComFreguesias.find(item => item.slug === city.slug)
    : municipiosComFreguesias.find(item => locationPart.startsWith(`${item.slug}-`) && item.freguesias.some(freg => `${item.slug}-${freg.slug}` === locationPart));
  const parish = !city && municipality ? getFreguesia(municipality.slug, locationPart.slice(municipality.slug.length + 1)) : null;
  if (!city && !parish) return null;
  if (family === 'preco' && !city) return null;
  if (family === 'localidade' && parish) family = 'freguesia';
  const municipalitySlug = city?.slug ?? municipality!.slug;
  const municipalityName = city?.name ?? municipality!.name;
  const locationName = parish?.name ?? city!.name;
  const service = services.find(item => item.slug === serviceSlug)!;
  const data = family === 'variante' ? getKeywordVariantData(variantKey!, serviceKey!, locationPart)
    : family === 'preco' ? getPricePageData(serviceSlug, municipalitySlug)
    : parish ? generateFreguesiaContent(service.name, serviceSlug, service.priceFrom, parish.name, parish.slug, municipalityName)
    : getLocationServiceData(serviceSlug, municipalitySlug);
  if (!data) return null;
  const prep = parish ? 'em' : cityPrep(locationName);
  const serviceLabel = variantKey && serviceKey ? `${variantLabels[variantKey]} de ${articleLabels[serviceKey]}` : service.name;
  const reviewSeed = family === 'freguesia' ? `${municipalityName}-${locationName}`
    : family === 'variante' ? (parish ? `${locationName}, ${municipalityName}` : locationName) : municipalitySlug;
  const priceVerb = variantKey === 'impermeabilizacao' && serviceKey === 'cadeiras' ? 'impermeabilizar cadeiras' : LANDING_PRICE_VERBS[serviceSlug];
  const fee = locationPrices[municipalityName];
  const pricingDescription = `${serviceSlug === 'limpeza-tapetes' ? 'Orçamento à medida de cada tapete.' : serviceSlug === 'limpeza-alcatifas' ? 'Orçamento à medida de cada espaço, sem preço fixo por m².' : 'Estimativa confirmada antes da marcação.'} ${fee === undefined ? 'Deslocação confirmada antes da marcação.' : `Deslocação +${fee}€ para ${municipalityName}.`} Orçamento gratuito e sem compromisso.`;
  const packSlugs = SERVICE_PACK_SLUGS[serviceSlug];
  const packLinks: LandingLink[] = packs.filter(pack => packSlugs.includes(pack.slug)).map(pack => ({ label: pack.name, href: `/${pack.slug}-${municipalitySlug}` }));
  const directory: LandingDirectoryGroup[] = [];
  const localPath = (slug: string, part = locationPart) => `/${family === 'preco' ? 'preco-' : ''}${slug}-${part}`;
  if (parish && municipality) {
    const nearby = municipality.freguesias.filter(freg => parish.nearby.includes(freg.slug));
    if (nearby.length) directory.push({ title: 'Freguesias próximas', links: nearby.map(freg => ({ label: freg.name, href: variantKey ? `/${variantKey}-${serviceKey}-${municipalitySlug}-${freg.slug}` : `/${serviceSlug}-${municipalitySlug}-${freg.slug}` })) });
  } else if (family !== 'preco' && municipality) {
    directory.push({ title: `Zonas ${prep} ${locationName}`, links: zoneLinks(municipality.freguesias, directorySlot(serviceSlug, variantKey), 8).map(freg => ({ label: freg.name, href: variantKey ? `/${variantKey}-${serviceKey}-${municipalitySlug}-${freg.slug}` : `/${serviceSlug}-${municipalitySlug}-${freg.slug}` })) });
  }
  directory.push({ title: `Outros serviços ${prep} ${locationName}`, links: services.filter(item => item.slug !== serviceSlug).map(item => ({ label: item.name, href: localPath(item.slug) })) });
  if (family !== 'freguesia') directory.push({ title: family === 'preco' ? 'Preços noutras cidades' : 'Também disponível em', links: coverageCityLinks(serviceSlug, municipalityName, variantKey, family === 'localidade' ? 6 : 8).map(item => ({ label: item.name, href: variantKey ? `/${variantKey}-${serviceKey}-${cities.find(city => city.name === item.name)!.slug}` : family === 'preco' ? `/preco-${item.path.slice(1)}` : item.path })) });
  if (family === 'freguesia' || family === 'localidade') {
    const relatedProblems = getAllProblems().filter(problem => problem.visible && problem.relatedServices.includes(serviceSlug!) && (METRO_CITIES.has(municipalitySlug) || problem.relatedCities.includes(municipalitySlug))).slice(0, 5);
    if (relatedProblems.length) directory.push({ title: `Problemas que resolvemos em ${municipalityName}`, links: relatedProblems.map(problem => ({ label: problem.keyword, href: `/${problem.slug}-${municipalitySlug}` })) });
  }
  if (family === 'localidade') {
    const materials = getMaterialsByService(serviceSlug);
    if (materials.length) directory.push({ title: `Por tipo de material ${prep} ${locationName}`, links: materials.map(material => ({ label: material.name, href: `/${material.slug}-${municipalitySlug}` })) });
    const brands = serviceSlug === 'limpeza-sofas' ? ['ikea', 'natuzzi', 'kave-home', 'leroy-merlin', 'moviflor', 'conforama', 'el-corte-ingles', 'roche-bobois']
      : serviceSlug === 'limpeza-colchoes' ? ['ikea', 'conforama', 'molaflex', 'pikolin', 'colmol', 'mindol']
      : serviceSlug === 'limpeza-cadeiras' ? ['ikea', 'conforama', 'leroy-merlin', 'herman-miller', 'moviflor', 'el-corte-ingles'] : [];
    if ((MARCA_CITY_SLUGS as readonly string[]).includes(municipalitySlug) && brands.length) {
      const prefix = serviceSlug === 'limpeza-sofas' ? 'limpeza-sofa' : serviceSlug === 'limpeza-colchoes' ? 'limpeza-colchao' : 'limpeza-cadeiras';
      directory.push({ title: 'Por marca', links: brands.map(brand => ({ label: brand.replace(/-/g, ' '), href: `/${prefix}-${brand}-${municipalitySlug}` })) });
    }
  }
  if (family !== 'localidade') directory.push({ title: parish ? `Serviço no município de ${municipalityName}` : 'Página do serviço', links: [{ label: `${service.name} em ${municipalityName}`, href: `/${serviceSlug}-${municipalitySlug}` }, ...(family === 'variante' && parish ? [{ label: `${service.name} em ${locationName}`, href: `/${serviceSlug}-${locationPart}` }] : [])] });
  return {
    path, family, serviceSlug, serviceKey, serviceLabel, municipalitySlug, municipalityName, locationName, prep,
    // Campos que os heroes das quatro familias liam do catalogo da sua
    // familia. Vindos daqui, o hero monta-se a partir do HTML e o catalogo
    // deixa de ser preciso na entrada normal.
    variantKey, parishSlug: parish?.slug ?? null, locationPart,
    // Nas variantes, o nome que o hero mostra inclui o municipio
    // ("Santa Clara, Coimbra"), ao contrario de `locationName`, que os
    // titulos das seccoes usam. Preserva-se o texto exato de cada familia.
    heroLocationName: ('locationName' in data && typeof data.locationName === 'string') ? data.locationName : locationName,
    serviceName: service.name, serviceBaseRoute: service.baseRoute,
    priceFrom: ('priceFrom' in data && typeof data.priceFrom === 'string') ? data.priceFrom : service.priceFrom,
    title: data.title, metaDescription: data.metaDescription, h1: data.h1, intro: commercialHeroSubtitle(serviceSlug, municipalityName),
    editorialIntro: data.intro,
    trustPoints: getLandingTrustPoints(serviceSlug, family, municipalityName, locationName),
    priceHeading: `Quanto custa ${priceVerb} ${prep} ${locationName}`,
    priceVerb, pricingDescription, pricePolicy: PRICE_PROMISE,
    variantExplanation: family === 'variante' ? (serviceSlug === 'impermeabilizacao' ? 'A impermeabilização é uma proteção opcional de tecidos compatíveis. A limpeza prévia, se necessária, é combinada e orçamentada separadamente.' : `Limpeza, lavagem e higienização podem descrever o mesmo pedido. O procedimento é escolhido pelo material e pelo estado da peça. ${TREATMENT_EXTRAS}`) : undefined,
    priceRows: family === 'preco' ? getPricePageData(serviceSlug, municipalitySlug)!.priceTable : PRICE_TABLE[serviceSlug],
    priceFactors: family === 'preco' ? PRICE_FACTORS[serviceSlug] : [],
    problems: getLandingProblems(serviceSlug).map(problem => ({ ...problem, image: selectLandingProblemImage(serviceSlug, problem.id, path) })),
    problemHeading: serviceSlug === 'impermeabilizacao' ? `Derrames e situações em que a proteção pode ajudar ${prep} ${locationName}` : `Problemas de ${service.name.replace('Limpeza de ', '').toLowerCase()} que resolvemos ${prep} ${locationName}`,
    reviews: pickReviewSubset(serviceSlug, `${path}:${reviewSeed}`, 6),
    faqs: data.faqs,
    faqHeading: `Perguntas sobre ${family === 'preco' ? `preços de ${service.name.toLowerCase()}` : serviceLabel.toLowerCase()} ${prep} ${locationName}`,
    processSteps: serviceSlug === 'limpeza-sofas' ? SOFA_PROCESS_STEPS : SERVICE_PROCESS_GUIDES[serviceSlug].steps,
    packSlugs, packLinks,
    directory: directory.filter(group => group.links.length),
  };
}
export type LandingPageModel = NonNullable<ReturnType<typeof getLandingPageModel>>;
