import { cityPrep } from "../data/serviceCatalog";

/**
 * WhatsApp opening-message builders.
 * Each function returns the message body only; callers wrap it with
 * `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`.
 */

/** A first enquiry asks for a quote, never implies a confirmed booking. */
export function buildQuoteWaMessage(request: string): string {
  return `${request}\n\nPodem indicar o preço, incluindo a deslocação, e a próxima disponibilidade? Posso enviar fotografias e a localização para receber um orçamento mais preciso.`;
}

export function buildGeneralWaMessage(isEn = false): string {
  if (isEn) return 'Hi! I would like a quote for your cleaning service.\n\nCould you tell me the price, including travel, and your next availability? I can send photos and the location so you can provide a more accurate quote.';
  return 'Olá! Gostaria de saber o preço e a disponibilidade para limpar os meus estofos. Posso enviar fotografias dos artigos e indicar a minha localidade para receber um orçamento.';
}

/**
 * What the price depends on, per kind of item. `blank` ends in an unfinished
 * sentence ("É um sofá de "): WhatsApp opens with the cursor at the end, and
 * finishing a sentence ("3 lugares") takes less thought than filling in a form
 * label. Pages with no place ask the locality too, and there a label reads
 * better than a sentence.
 */
const ITEM_BLANKS = {
  sofa: { blank: 'É um sofá de ', blankWithLocality: 'Localidade e nº de lugares do sofá: ' },
  colchao: { blank: 'É um colchão de ', blankWithLocality: 'Localidade e tamanho do colchão (solteiro, casal ou king): ' },
  tapete: { blank: 'O tapete mede mais ou menos ', blankWithLocality: 'Localidade e medidas do tapete: ' },
  tapetes: { blank: 'Os tapetes medem mais ou menos ', blankWithLocality: 'Localidade e medidas dos tapetes: ' },
  cadeiras: { blank: 'Nº de cadeiras: ', blankWithLocality: 'Localidade e nº de cadeiras: ' },
  alcatifa: { blank: 'A alcatifa tem mais ou menos ', blankWithLocality: 'Localidade e área da alcatifa (m²): ' },
  cabeceira: { blank: 'A cabeceira mede mais ou menos ', blankWithLocality: 'Localidade e largura da cabeceira: ' },
  puff: { blank: 'O puff mede mais ou menos ', blankWithLocality: 'Localidade e medidas do puff: ' },
  sofasNegocio: { blank: 'Nº de sofás e lugares: ', blankWithLocality: 'Localidade, nº de sofás e lugares: ' },
  estofos: { blank: 'Artigos e quantidade: ', blankWithLocality: 'Localidade, artigos e quantidade: ' },
  sofaColchao: { blank: 'Lugares do sofá e tamanho do colchão: ', blankWithLocality: 'Localidade, lugares do sofá e tamanho do colchão: ' },
  salaCompleta: { blank: 'Lugares do sofá, nº de cadeiras e medidas do tapete: ', blankWithLocality: 'Localidade, lugares do sofá, nº de cadeiras e medidas do tapete: ' },
  quartoCompleto: { blank: 'Tamanho do colchão e medidas do tapete: ', blankWithLocality: 'Localidade, tamanho do colchão e medidas do tapete: ' },
} as const;
type ItemKind = keyof typeof ITEM_BLANKS;

/**
 * The one shape every page-specific message has (dono, 28/09/2026:
 * "psicologicamente mais fácil e que converta mais"): a short opening that asks
 * price and availability (the reply bot keys on "disponibilidade"), then one
 * sentence to finish, last, where the cursor already is. It asks only what the
 * price depends on and promises nothing the client has to do later (the old
 * "Envio a seguir uma foto" / "Posso enviar fotografias" were dropped: the bot
 * asks for the photo after the quote). A page that names the place says
 * "em Lisboa" and does not ask it again, also on ad visits (dono, 28/09/2026:
 * "se já tiver a localidade diz só em Lisboa"); the bot confirms the exact
 * locality before the travel fee. Sent untouched, it still names what and where.
 */
function buildItemWaMessage(request: string, kind: ItemKind, placeName?: string | null): string {
  const loc = placeName ? ` ${cityPrep(placeName)} ${placeName}` : '';
  const { blank, blankWithLocality } = ITEM_BLANKS[kind];
  return `Olá! Gostaria de saber o preço e a disponibilidade para ${request}${loc}.\n\n${placeName ? blank : blankWithLocality}`;
}

const SERVICE_MESSAGES: Record<string, { request: string; kind: ItemKind }> = {
  'limpeza-sofas': { request: 'limpar o meu sofá', kind: 'sofa' },
  'limpeza-colchoes': { request: 'limpar o meu colchão', kind: 'colchao' },
  'limpeza-tapetes': { request: 'limpar os meus tapetes', kind: 'tapetes' },
  'limpeza-cadeiras': { request: 'limpar as minhas cadeiras', kind: 'cadeiras' },
  'limpeza-alcatifas': { request: 'limpar a minha alcatifa', kind: 'alcatifa' },
  'impermeabilizacao': { request: 'impermeabilizar o meu sofá', kind: 'sofa' },
};

/** Shared by service, location, neighbourhood and price landing pages. */
export function buildServiceWaMessage(serviceSlug: string, placeName?: string | null): string {
  const service = SERVICE_MESSAGES[serviceSlug];
  if (!service) return buildGeneralWaMessage();
  return buildItemWaMessage(service.request, service.kind, placeName);
}

/** Used on MaterialPage. */
export function buildMaterialWaMessage(slug: string, cityName: string | null): string {
  const m = (request: string, kind: ItemKind) => buildItemWaMessage(request, kind, cityName);
  if (slug.includes('pele'))       return m('limpar e tratar o meu sofá de pele', 'sofa');
  if (slug.includes('veludo'))     return m('limpar o meu sofá de veludo', 'sofa');
  if (slug.includes('camurca'))    return m('limpar o meu sofá de camurça', 'sofa');
  if (slug.includes('microfibra')) return m('limpar o meu sofá de microfibra', 'sofa');
  if (slug.includes('linho'))      return m('limpar o meu sofá de linho', 'sofa');
  if (slug.includes('sintetico') && slug.includes('sofa')) return m('limpar o meu sofá sintético', 'sofa');
  if (slug.includes('sofa'))       return m('limpar o meu sofá de tecido', 'sofa');
  if (slug.includes('persa'))      return m('lavar o meu tapete persa', 'tapete');
  if (slug.includes('tapete-la') || (slug.includes('tapete') && slug.includes('-la')))
                                   return m('lavar o meu tapete de lã', 'tapete');
  if (slug.includes('sisal'))      return m('limpar o meu tapete de sisal', 'tapete');
  if (slug.includes('tapete'))     return m('limpar o meu tapete sintético', 'tapete');
  return m('limpar os meus estofos', 'estofos');
}

/** Used on the brand pages (sofá, colchão and cadeiras). */
export function buildMarcaWaMessage(item: 'sofa' | 'colchao' | 'cadeiras', marca: string, cityName: string): string {
  const request = item === 'sofa' ? `limpar o meu sofá ${marca}` : item === 'colchao' ? `limpar o meu colchão ${marca}` : `limpar as minhas cadeiras ${marca}`;
  return buildItemWaMessage(request, item, cityName);
}

/**
 * One request per problem page, written as the client would say it: the
 * `keyword` is a search phrase ("limpeza sofá alergias") and reads badly after
 * "para". `problemWaMessages.test.ts` fails if a problem has no entry here.
 */
export const PROBLEM_WA_REQUESTS: Record<string, { request: string; kind: ItemKind }> = {
  'manchas-sofa': { request: 'tirar as manchas do meu sofá', kind: 'sofa' },
  'manchas-vinho-sofa': { request: 'tirar uma mancha de vinho do meu sofá', kind: 'sofa' },
  'manchas-cafe-sofa': { request: 'tirar manchas de café do meu sofá', kind: 'sofa' },
  'manchas-gordura-sofa': { request: 'tirar manchas de gordura do meu sofá', kind: 'sofa' },
  'manchas-colchao': { request: 'tirar as manchas do meu colchão', kind: 'colchao' },
  'manchas-tapete': { request: 'tirar as manchas do meu tapete', kind: 'tapete' },
  'cheiro-sofa': { request: 'tirar o mau cheiro do meu sofá', kind: 'sofa' },
  'cheiro-urina-sofa': { request: 'tirar o cheiro a urina do meu sofá', kind: 'sofa' },
  'cheiro-colchao': { request: 'tirar o mau cheiro do meu colchão', kind: 'colchao' },
  'urina-colchao': { request: 'limpar urina do meu colchão', kind: 'colchao' },
  'cheiro-tapete': { request: 'tirar o mau cheiro do meu tapete', kind: 'tapete' },
  'acaros-colchao': { request: 'limpar o meu colchão com tratamento anti-ácaros', kind: 'colchao' },
  'acaros-sofa': { request: 'limpar o meu sofá com tratamento anti-ácaros', kind: 'sofa' },
  'alergias-sofa': { request: 'limpar o meu sofá por causa de alergias', kind: 'sofa' },
  'alergias-colchao': { request: 'limpar o meu colchão por causa de alergias', kind: 'colchao' },
  'pelos-animais-sofa': { request: 'tirar pelos de animais do meu sofá', kind: 'sofa' },
  'pelos-animais-tapete': { request: 'tirar pelos de animais do meu tapete', kind: 'tapete' },
  'tapete-persa': { request: 'lavar o meu tapete persa', kind: 'tapete' },
  'tapete-la': { request: 'lavar o meu tapete de lã', kind: 'tapete' },
  'mofo-tapete': { request: 'tirar o mofo do meu tapete', kind: 'tapete' },
  'mofo-alcatifa': { request: 'tirar o mofo da minha alcatifa', kind: 'alcatifa' },
  'impermeabilizar-sofa': { request: 'impermeabilizar o meu sofá', kind: 'sofa' },
  'preco-limpeza-sofa': { request: 'limpar o meu sofá', kind: 'sofa' },
  'preco-limpeza-colchao': { request: 'limpar o meu colchão', kind: 'colchao' },
  'preco-limpeza-tapete': { request: 'lavar o meu tapete', kind: 'tapete' },
  'limpeza-profunda-sofa': { request: 'uma limpeza profunda ao meu sofá', kind: 'sofa' },
  'limpeza-sofa-domicilio': { request: 'limpar o meu sofá ao domicílio', kind: 'sofa' },
  'limpeza-sofa-urgente': { request: 'limpar o meu sofá com urgência', kind: 'sofa' },
  'limpeza-colchao-urgente': { request: 'limpar o meu colchão com urgência', kind: 'colchao' },
  'empresa-limpeza-estofos': { request: 'limpar os meus estofos', kind: 'estofos' },
  'limpeza-sofa-profissional': { request: 'limpar o meu sofá', kind: 'sofa' },
  'limpeza-cadeiras-escritorio': { request: 'limpar cadeiras de escritório', kind: 'cadeiras' },
  'limpeza-alcatifas-empresa': { request: 'limpar a alcatifa da minha empresa', kind: 'alcatifa' },
  'manchas-sangue-colchao': { request: 'tirar uma mancha de sangue do meu colchão', kind: 'colchao' },
  'limpeza-sofa-bebe': { request: 'limpar o meu sofá com produtos seguros para bebés', kind: 'sofa' },
  'manchas-tinta-sofa': { request: 'tirar uma mancha de tinta do meu sofá', kind: 'sofa' },
  'sofa-amarelado': { request: 'limpar o meu sofá amarelado', kind: 'sofa' },
  'limpeza-cabeceira-cama': { request: 'limpar a cabeceira da minha cama', kind: 'cabeceira' },
  'limpeza-sofa-chenille': { request: 'limpar o meu sofá de chenille', kind: 'sofa' },
  'limpeza-puff': { request: 'limpar o meu puff', kind: 'puff' },
  'manchas-suor-sofa': { request: 'tirar manchas de suor do meu sofá', kind: 'sofa' },
  'limpeza-colchao-bebe': { request: 'limpar o colchão do meu bebé', kind: 'colchao' },
  'limpeza-sofa-hotel': { request: 'limpar os sofás do meu hotel', kind: 'sofasNegocio' },
  'acaros-tapete': { request: 'limpar o meu tapete por causa dos ácaros', kind: 'tapete' },
  'limpeza-sofa-perto-de-mim': { request: 'limpar o meu sofá', kind: 'sofa' },
  'limpeza-sofa-antes-depois': { request: 'limpar o meu sofá', kind: 'sofa' },
  'etiqueta-limpeza-sofa': { request: 'limpar o meu sofá', kind: 'sofa' },
  'manchas-castanhas-apos-limpeza': { request: 'tirar manchas castanhas do meu sofá', kind: 'sofa' },
  'mancha-volta-apos-limpeza': { request: 'tirar uma mancha teimosa do meu sofá', kind: 'sofa' },
  'sofa-demora-secar': { request: 'limpar o meu sofá', kind: 'sofa' },
  'cheiro-mofo-sofa': { request: 'tirar o cheiro a mofo do meu sofá', kind: 'sofa' },
  'tapete-encolheu': { request: 'lavar o meu tapete', kind: 'tapete' },
  'impermeabilizacao-duracao': { request: 'impermeabilizar o meu sofá', kind: 'sofa' },
  'sofa-couro-ressecado': { request: 'tratar o meu sofá de couro ressecado', kind: 'sofa' },
};

/** Used by the problem hero (problem hub and problem × city pages). */
export function buildProblemWaMessage(slug: string, cityName?: string | null): string {
  const entry = PROBLEM_WA_REQUESTS[slug] ?? { request: 'limpar os meus estofos', kind: 'estofos' as const };
  return buildItemWaMessage(entry.request, entry.kind, cityName);
}

/** Used on SofaVariantPage (higienização/lavagem/impermeabilização keyword variants). */
export function buildVariantWaMessage(
  isWaterproofing: boolean,
  serviceLabel: string,
  variantLabel: string,
  locationName: string
): string {
  const svc = serviceLabel.toLowerCase();
  const items: Record<string, { item: string; kind: ItemKind }> = {
    'sofá': { item: 'o meu sofá', kind: 'sofa' },
    'colchão': { item: 'o meu colchão', kind: 'colchao' },
    'tapetes': { item: 'os meus tapetes', kind: 'tapetes' },
    'cadeiras': { item: 'as minhas cadeiras', kind: 'cadeiras' },
    'alcatifas': { item: 'a minha alcatifa', kind: 'alcatifa' },
  };
  const found = items[svc === 'sofa' ? 'sofá' : svc] ?? { item: 'os meus estofos', kind: 'estofos' as const };
  // Waterproofing is sold for sofas and chairs only.
  const target = isWaterproofing && found.kind !== 'sofa' && found.kind !== 'cadeiras' ? { item: 'os meus estofos', kind: 'estofos' as const } : found;
  const verb = isWaterproofing ? 'impermeabilizar' : /lavagem/i.test(variantLabel) ? 'lavar' : /higieniza/i.test(variantLabel) ? 'higienizar' : 'limpar';
  return buildItemWaMessage(`${verb} ${target.item}`, target.kind, locationName);
}

/** Used on TreatmentPage (anti-ácaros, desbacterização, with or without a city). */
export function buildTreatmentWaMessage(treatmentSlug: string | undefined, cityName?: string | null): string {
  const request = treatmentSlug === 'tratamento-anti-acaros' ? 'fazer o tratamento anti-ácaros'
    : treatmentSlug === 'desbacterizacao' ? 'desbacterizar os meus estofos'
    : 'limpar os meus estofos';
  return buildItemWaMessage(request, 'estofos', cityName);
}

/** Used on CommercialPage (B2B: restaurantes, hotéis, escritórios). */
export function buildCommercialWaMessage(cityName: string): string {
  return `Olá! Represento um negócio ${cityPrep(cityName)} ${cityName} (restaurante/hotel/escritório) e tenho interesse num contrato de limpeza recorrente de estofos. Podem enviar-me uma proposta e a vossa disponibilidade?`;
}

/**
 * Only an opaque operational reference belongs in a shareable WhatsApp URL.
 * `photoQuote`: o pedido tem artigos sob orçamento (tapetes, alcatifa, sofá
 * grande). A mensagem diz logo que vêm fotografias, que é o que falta para o
 * preço (dono, 2026-10-06: os pedidos sem preço fechavam metade das vezes).
 * O início ("Acabei de enviar o pedido #X") não muda: o bot procura-o.
 */
export function buildSubmittedWaMessage(reference?: string | null, opts: { photoQuote?: boolean } = {}): string {
  const value = reference?.trim().replace(/^#/, '');
  // Current short booking IDs and opaque lead IDs; never interpolate arbitrary input.
  const safe = value && /^(?:[A-Z0-9]{6,12}|L-\d{8}-[a-z0-9]{8,12})$/.test(value) ? value : null;
  const ask = opts.photoQuote
    ? 'Envio já as fotografias para saber o preço e a disponibilidade.'
    : 'Gostaria de confirmar o orçamento e a próxima disponibilidade. Posso enviar fotografias dos artigos para avaliação.';
  return `Olá! Acabei de enviar o pedido${safe ? ` #${safe}` : ''}. ${ask}`;
}

const PACK_MESSAGES: Record<string, { request: string; kind: ItemKind }> = {
  'sofa-colchao': { request: 'limpar o meu sofá e o meu colchão', kind: 'sofaColchao' },
  'sofa-impermeabilizacao': { request: 'limpar e impermeabilizar o meu sofá', kind: 'sofa' },
  'sala-completa': { request: 'limpar o sofá, as cadeiras e o tapete da sala', kind: 'salaCompleta' },
  'quarto-completo': { request: 'limpar o meu colchão e o meu tapete', kind: 'quartoCompleto' },
};

/** Páginas pack × cidade: pede preço para a combinação, não para um artigo. */
export function buildPackWaMessage(packId: string, cityName: string): string {
  const pack = PACK_MESSAGES[packId] ?? { request: 'limpar os meus estofos', kind: 'estofos' as const };
  return buildItemWaMessage(pack.request, pack.kind, cityName);
}
