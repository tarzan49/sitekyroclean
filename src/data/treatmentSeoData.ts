import { cities, services, cityPrep } from './serviceCatalog';
import { AVAILABILITY_PROMISE, COVERAGE_PROMISE, DRYING_PROMISE, PRICE_PROMISE, RESPONSE_PROMISE, SATISFACTION_PROMISE } from '../constants/commercialPolicy';
export const treatmentSupplement = {
  heading: 'Um suplemento à limpeza, escolhido por si',
  body: 'A limpeza é a base: remove sujidade, pó e resíduos do estofo. O tratamento anti-ácaros e a desbacterização acrescentam um cuidado específico à intervenção, mediante avaliação do artigo. Este suplemento é opcional, tem um valor adicional e só é realizado quando o escolhe no orçamento.',
  identity: 'Na Kyro, anti-ácaros e desbacterização são dois nomes para o mesmo tratamento complementar. No orçamento aparece como Anti-ácaros: não precisa de pedir os dois nem de pagar dois suplementos para o mesmo artigo.',
};
export const treatmentArticles = [
  { title: 'Colchões', serviceSlug: 'limpeza-colchoes', body: 'Aproveite a limpeza do colchão para acrescentar o tratamento. Indique o tamanho e quantos colchões pretende tratar; pode escolher o suplemento apenas para os artigos que desejar.', image: '/images/treatments/colchao.webp', alt: 'Limpeza por extração da superfície de um colchão' },
  { title: 'Sofás', serviceSlug: 'limpeza-sofas', body: 'Um complemento à limpeza dos estofos da sala, adaptado ao artigo. Diga o número de lugares e envie uma fotografia para identificarmos o sofá e confirmarmos o pedido.', image: '/images/treatments/sofa.webp', alt: 'Limpeza do assento de um sofá com equipamento de extração' },
  { title: 'Cadeiras estofadas', serviceSlug: 'limpeza-cadeiras', body: 'Pode juntar o tratamento à limpeza das cadeiras da sala de jantar ou de trabalho. Indique a quantidade de cadeiras a limpar e quais pretende incluir no suplemento.', image: '/images/treatments/cadeira.webp', alt: 'Pormenor do tecido de uma cadeira estofada' },
];
export const treatmentSteps = [
  { title: 'Diga-nos o que pretende limpar', body: 'Envie fotografias, tamanhos ou quantidades e a localidade. Diga que quer acrescentar o tratamento anti-ácaros ou a desbacterização.' },
  { title: 'Confirme a limpeza e o suplemento', body: 'Recebe uma proposta com os artigos, a limpeza, o tratamento escolhido e a deslocação. A visita fica combinada depois de confirmar o pedido.' },
  { title: 'Receba a equipa em casa', body: 'Avaliamos o revestimento e as condições de aplicação. A limpeza e o tratamento complementar são realizados na mesma visita, de acordo com o que ficou orçamentado.' },
  { title: 'Saiba quando voltar a utilizar', body: 'No final, explicamos a ventilação, a secagem e os cuidados próprios do produto aplicado. Aguarde o prazo indicado pela equipa antes de voltar a usar o artigo.' },
];
export const treatmentCare = [
  { title: 'Deixe secar completamente', body: 'Mantenha o espaço ventilado e siga as indicações da equipa. Volte a colocar capas, roupa de cama e almofadas apenas quando o artigo estiver seco e o prazo indicado tiver terminado.' },
  { title: 'Mantenha uma rotina de limpeza', body: 'Aspire os estofos e cuide das capas e da roupa de cama de acordo com as etiquetas. O tratamento complementa estes cuidados e não dispensa a manutenção habitual.' },
  { title: 'Evite aplicar outros produtos', body: 'Não misture produtos nem aplique sprays sobre o estofo acabado de tratar sem confirmar a compatibilidade. Se surgir alguma dúvida, fale connosco antes de intervir.' },
];
export const treatments = [
  {
    slug: 'tratamento-anti-acaros', name: 'Tratamento anti-ácaros',
    heroSubtitle: 'Um suplemento opcional à limpeza de colchões, sofás e cadeiras. Tudo na mesma visita.',
    intro: 'Vai limpar o colchão, o sofá ou as cadeiras? Pode aproveitar a mesma visita para acrescentar o tratamento anti-ácaros. Escolha os artigos que pretende tratar e receba o valor da limpeza e do suplemento antes de marcar.',
    benefits: ['Pode escolher o suplemento só para alguns dos artigos da limpeza.', 'Limpeza e tratamento na mesma visita, sem uma segunda marcação.', 'Aplicação avaliada para o revestimento, com cuidados explicados no final.'],
    detail: 'O tratamento é dirigido ao cuidado anti-ácaros do estofo. A remoção de pó e resíduos continua a fazer parte da limpeza; o suplemento não a substitui. Os resultados dependem do artigo e das condições de aplicação, sem promessa de eliminação total ou de alívio de sintomas.',
    contextHeading: 'Quando acrescentar o tratamento anti-ácaros?',
    contextBody: 'Quando pretende um cuidado complementar na limpeza dos estofos que usa todos os dias. Pode incluí-lo no colchão ao renovar a roupa de cama, no sofá durante uma limpeza mais completa da sala ou apenas nas cadeiras que escolher. Descreva o seu objetivo à equipa para confirmar a adequação ao artigo.',
  },
  {
    slug: 'desbacterizacao', name: 'Desbacterização de estofos',
    heroSubtitle: 'Um cuidado complementar à limpeza de sofás, colchões e cadeiras, com suplemento confirmado no orçamento.',
    intro: 'A desbacterização acrescenta um cuidado específico à limpeza dos seus estofos. Pode pedi-la para sofás, colchões e cadeiras, na mesma visita e com o suplemento identificado antes da marcação.',
    benefits: ['Um cuidado complementar para os estofos de uso diário.', 'Escolha quais os artigos que recebem limpeza com tratamento.', 'Orçamento confirmado antes da visita, com o suplemento identificado.'],
    detail: 'A limpeza trata a sujidade e os resíduos; a desbacterização tem um objetivo complementar dirigido à contaminação bacteriana. A aplicação depende da compatibilidade com o revestimento e das indicações do produto. Não equivale a esterilização nem substitui a limpeza regular.',
    contextHeading: 'Quando incluir a desbacterização?',
    contextBody: 'Ao planear uma limpeza mais completa de artigos usados por várias pessoas, como o sofá da sala, as cadeiras de jantar ou um colchão que vai voltar a utilizar. Explique o uso do artigo e o cuidado pretendido: a equipa avalia se este complemento se adequa ao pedido.',
  },
];
export function treatmentContentSections(treatment: typeof treatments[number]) {
  return [
    { heading: treatmentSupplement.heading, body: treatmentSupplement.body + '\n\n' + treatmentSupplement.identity },
    { heading: treatment.contextHeading, body: treatment.contextBody },
    ...treatmentSteps.map(a => ({ heading: a.title, body: a.body })),
    ...treatmentCare.map(a => ({ heading: a.title, body: a.body })),
    { heading: 'Uma proposta clara, antes de marcar', body: PRICE_PROMISE },
  ];
}
// Aveiro e Coimbra saíram daqui em 2026-09-10: passaram a cidades reais em
// locationSeoData.ts (com página de localidade/freguesia/preço/variantes
// próprias e deslocação confirmada em travel.ts), por isso já não são
// "cobertura ainda por confirmar". Mantinham aqui geravam rotas
// /{servico}-{cidade} duplicadas com LocationServicePage.tsx — a versão
// pré-renderizada (a que o Google vê) acabava a mostrar sempre o placeholder
// "Disponibilidade sob consulta" em vez da página real. As páginas de
// tratamento (tratamento-anti-acaros-aveiro etc.) continuam a ser geradas
// normalmente, agora via `cities` em vez de `expansionCities`.
export const expansionCities: { name: string; slug: string; context: string }[] = [];
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
  return { path, h1, title: `${h1} | Kyro Clean Solutions`, metaDescription: `${h1}: tratamento complementar para sofá, colchão e cadeiras. Orçamento personalizado, resposta em menos de 5 minutos.`, intro: treatment.intro, benefits: treatment.benefits, detail: treatment.detail, city, expansion,
    coverage: expansion ? `Atendimento ${cityPrep(city!.name)} ${city!.name} sob consulta. Confirme a morada, a deslocação e a disponibilidade antes de marcar. Ainda não anunciamos uma equipa permanente nesta cidade.` : city ? `Serviço ${cityPrep(city.name)} ${city.name}, com deslocação confirmada no orçamento. ${AVAILABILITY_PROMISE}` : COVERAGE_PROMISE,
    faqs: [
      { question: 'Este tratamento está incluído na limpeza normal?', answer: 'Não. É um suplemento opcional à limpeza, com valor adicional identificado no orçamento. Pode escolher quais os colchões, sofás ou cadeiras que recebem o tratamento.' },
      { question: 'Anti-ácaros e desbacterização são dois extras diferentes?', answer: treatmentSupplement.identity },
      { question: 'O tratamento substitui a limpeza do estofo?', answer: 'Não. A limpeza remove sujidade, pó e resíduos. O tratamento é um complemento com um objetivo específico e não substitui essa remoção nem a manutenção regular do artigo.' },
      { question: 'Posso acrescentar também impermeabilização ao mesmo artigo?', answer: 'No mesmo artigo, anti-ácaros e impermeabilização são opções alternativas. Pode escolher tratamentos diferentes para artigos diferentes; confirmamos cada escolha no orçamento.' },
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
  const h1 = `${service?.name ?? 'Limpeza de estofos'} ${cityPrep(city.name)} ${city.name}`;
  return { path, city, h1, title: `${h1} | Disponibilidade sob consulta | Kyro Clean`, metaDescription: `${h1}: peça uma proposta para a sua morada. Disponibilidade e deslocação sob consulta. Resposta em menos de 5 minutos.`, intro: `${city.context} A Kyro Clean está a desenvolver a cobertura nesta região. Consulte-nos para avaliarmos o seu pedido; confirme a disponibilidade para a sua morada antes de marcar.`, benefits: ['Orçamento adaptado aos artigos e à morada.', 'Sofás, colchões, cadeiras, tapetes e alcatifas.', 'Impermeabilização Essencial de 1 a 2 anos ou Premium até 10 anos, para sofás e cadeiras.'], detail: 'Envie a localidade, fotografias e medidas dos artigos. Tapetes e alcatifas são sempre sob orçamento. A deslocação e a data são confirmadas antes da marcação.', coverage: COVERAGE_PROMISE, faqs: [{ question: 'Há uma equipa permanente nesta cidade?', answer: 'Ainda não anunciamos uma equipa permanente. O atendimento é avaliado caso a caso; confirme a disponibilidade para a sua morada.' }, { question: 'Quando respondem?', answer: RESPONSE_PROMISE + '.' }, { question: 'Como são definidos os preços?', answer: PRICE_PROMISE }, { question: 'Quanto demora a secagem?', answer: DRYING_PROMISE }], expansion: true };
}
