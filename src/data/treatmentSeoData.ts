import { cities, services, cityPrep } from './locationSeoData';
import { AVAILABILITY_PROMISE, COVERAGE_PROMISE, DRYING_PROMISE, PRICE_PROMISE, RESPONSE_PROMISE, SATISFACTION_PROMISE } from '../constants/commercialPolicy';
export const treatments = [
  { slug: 'tratamento-anti-acaros', name: 'Tratamento anti-ácaros', intro: 'Um cuidado específico para colchões, sofás e cadeiras, que pode acrescentar à limpeza. O tratamento anti-ácaros é escolhido para atuar sobre ácaros; não deve ser confundido com a extração de sujidade do serviço habitual.', benefits: ['Tratamento dirigido ao objetivo de reduzir a presença de ácaros no artigo.', 'Pode juntar o tratamento à limpeza do colchão ou sofá na mesma visita.', 'Avaliação do tecido e das condições de aplicação antes de começar.'], detail: 'A limpeza remove pó, resíduos e partículas acumuladas. O tratamento anti-ácaros é uma intervenção complementar, com produto e aplicação definidos para esse fim. Não prometemos eliminação total, percentagens de eficácia ou alívio de sintomas.' },
  { slug: 'desbacterizacao', name: 'Desbacterização de estofos', intro: 'Um tratamento complementar dirigido à contaminação bacteriana em sofás, colchões e cadeiras. Peça a avaliação do artigo e acrescente este cuidado ao seu orçamento de limpeza.', benefits: ['Um cuidado adicional para superfícies de contacto frequente.', 'Seleção do tratamento conforme o tecido, o uso e o objetivo da intervenção.', 'Possibilidade de combinar limpeza e tratamento na mesma visita.'], detail: 'A desbacterização tem um objetivo diferente da limpeza de manchas e resíduos. Confirmamos a compatibilidade do produto com o artigo e explicamos o modo de aplicação e os cuidados posteriores. Não é uma promessa de esterilização nem substitui a manutenção regular.' },
];
export const expansionCities = [
  { name: 'Aveiro', slug: 'aveiro', context: 'Entre apartamentos junto à ria, moradias e alojamentos de curta duração, as necessidades de limpeza variam com os artigos e a utilização de cada espaço.' },
  { name: 'Coimbra', slug: 'coimbra', context: 'Casas de família, quartos arrendados e apartamentos em mudança de ocupantes pedem soluções diferentes para sofás, colchões e cadeiras.' },
];
export function getTreatmentRoutes() {
  return treatments.flatMap(t => [{ path: `/${t.slug}`, treatmentSlug: t.slug, citySlug: '' }, ...[...cities, ...expansionCities].map(c => ({ path: `/${t.slug}-${c.slug}`, treatmentSlug: t.slug, citySlug: c.slug }))]);
}
export function getExpansionRoutes() {
  return expansionCities.flatMap(c => [{ path: `/limpeza-estofos-${c.slug}`, citySlug: c.slug, serviceSlug: '' }, ...services.map(s => ({ path: `/${s.slug}-${c.slug}`, citySlug: c.slug, serviceSlug: s.slug }))]);
}
export function getTreatmentPage(path: string) {
  const route = getTreatmentRoutes().find(r => r.path === path);
  if (!route) return null;
  const treatment = treatments.find(t => t.slug === route.treatmentSlug)!;
  const city = [...cities, ...expansionCities].find(c => c.slug === route.citySlug);
  const expansion = expansionCities.some(c => c.slug === route.citySlug);
  const h1 = `${treatment.name}${city ? ` ${cityPrep(city.name)} ${city.name}` : ''}`;
  return { path, h1, title: `${h1} | Kyro Clean Solutions`, metaDescription: `${h1}: tratamento complementar para sofá, colchão e cadeiras. Orçamento personalizado, resposta em menos de 10 minutos.`, intro: treatment.intro, benefits: treatment.benefits, detail: treatment.detail, city, expansion,
    coverage: expansion ? `Atendimento ${cityPrep(city!.name)} ${city!.name} sob consulta. Confirme a morada, a deslocação e a disponibilidade antes de marcar. Ainda não anunciamos uma equipa permanente nesta cidade.` : city ? `Serviço ${cityPrep(city.name)} ${city.name}, com deslocação confirmada no orçamento. ${AVAILABILITY_PROMISE}` : COVERAGE_PROMISE,
    faqs: [
      { question: 'Este tratamento está incluído na limpeza normal?', answer: 'Não. É um extra opcional e deve constar do orçamento. Escolhemos consigo os artigos e o tratamento adequado.' },
      { question: 'Quanto custa?', answer: 'Peça orçamento indicando o artigo, o tamanho ou as medidas, a quantidade e a localidade. O preço depende da configuração; não há um preço único para todos os artigos. ' + PRICE_PROMISE },
      { question: 'Quando posso voltar a usar o artigo?', answer: DRYING_PROMISE + ' O tratamento pode exigir cuidados ou um intervalo de utilização próprios, comunicados pela equipa conforme o produto aplicado.' },
      { question: 'Como peço este extra?', answer: 'Envie uma fotografia e diga que pretende incluir ' + treatment.name.toLowerCase() + '. ' + RESPONSE_PROMISE + '.' },
      { question: 'E se não ficar satisfeito?', answer: SATISFACTION_PROMISE },
    ] };
}
export function getExpansionPage(path: string) {
  const route = getExpansionRoutes().find(r => r.path === path);
  if (!route) return null;
  const city = expansionCities.find(c => c.slug === route.citySlug)!;
  const service = services.find(s => s.slug === route.serviceSlug);
  const h1 = `${service?.name ?? 'Limpeza de estofos'} em ${city.name}`;
  return { path, city, h1, title: `${h1} | Disponibilidade sob consulta | Kyro Clean`, metaDescription: `${h1}: peça uma proposta para a sua morada. Disponibilidade e deslocação sob consulta. Resposta em menos de 10 minutos.`, intro: `${city.context} A Kyro Clean está a desenvolver a cobertura nesta região. Consulte-nos para avaliarmos o seu pedido; confirme a disponibilidade para a sua morada antes de marcar.`, benefits: ['Orçamento adaptado aos artigos e à morada.', 'Sofás, colchões, cadeiras, tapetes e alcatifas.', 'Impermeabilização Essencial de 1 a 2 anos ou Premium até 10 anos, para sofás e cadeiras.'], detail: 'Envie a localidade, fotografias e medidas dos artigos. Tapetes e alcatifas são sempre sob orçamento. A deslocação e a data são confirmadas antes da marcação.', coverage: COVERAGE_PROMISE, faqs: [{ question: 'Há uma equipa permanente nesta cidade?', answer: 'Ainda não anunciamos uma equipa permanente. O atendimento é avaliado caso a caso; confirme a disponibilidade para a sua morada.' }, { question: 'Quando respondem?', answer: RESPONSE_PROMISE + '.' }, { question: 'Como são definidos os preços?', answer: PRICE_PROMISE }, { question: 'Quanto demora a secagem?', answer: DRYING_PROMISE }], expansion: true };
}
