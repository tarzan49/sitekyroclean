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
 * What each service asks. `blank` ends in an unfinished sentence ("É um sofá
 * de "): WhatsApp opens with the cursor at the end, and finishing a sentence
 * ("3 lugares") takes less thought than filling in a form label. Pages with no
 * place ask the locality too, and there a label reads better than a sentence.
 */
const SERVICE_MESSAGES: Record<string, { request: string; blank: string; blankWithLocality: string }> = {
  'limpeza-sofas': { request: 'limpar o meu sofá', blank: 'É um sofá de ', blankWithLocality: 'Localidade e nº de lugares do sofá: ' },
  'limpeza-colchoes': { request: 'limpar o meu colchão', blank: 'É um colchão de ', blankWithLocality: 'Localidade e tamanho do colchão (solteiro, casal ou king): ' },
  'limpeza-tapetes': { request: 'limpar os meus tapetes', blank: 'Os tapetes medem mais ou menos ', blankWithLocality: 'Localidade e medidas dos tapetes: ' },
  'limpeza-cadeiras': { request: 'limpar as minhas cadeiras', blank: 'São ', blankWithLocality: 'Localidade e nº de cadeiras: ' },
  'limpeza-alcatifas': { request: 'limpar a minha alcatifa', blank: 'A alcatifa tem mais ou menos ', blankWithLocality: 'Localidade e área da alcatifa (m²): ' },
  'impermeabilizacao': { request: 'impermeabilizar o meu sofá', blank: 'É um sofá de ', blankWithLocality: 'Localidade e nº de lugares do sofá: ' },
};

/**
 * Shared by service, location, neighbourhood and price landing pages.
 *
 * Built to be the easiest message to send (dono, 28/09/2026: "psicologicamente
 * mais fácil e que converta mais"): a short opening that asks price and
 * availability (the reply bot keys on "disponibilidade"), then one sentence
 * to finish, last, where the cursor already is. It asks only what the price
 * depends on and promises nothing the client has to do later (the old "Envio a
 * seguir uma foto" was dropped: the bot asks for the photo after the quote).
 * A page that names the place says "em Lisboa" and does not ask it again,
 * also on ad visits (dono, 28/09/2026: "se já tiver a localidade diz só em
 * Lisboa"); the bot confirms the exact locality before the travel fee.
 * Sent untouched, it still names service and place.
 */
export function buildServiceWaMessage(serviceSlug: string, placeName?: string | null): string {
  const service = SERVICE_MESSAGES[serviceSlug];
  if (!service) return buildGeneralWaMessage();
  const loc = placeName ? ` ${cityPrep(placeName)} ${placeName}` : '';
  const blank = placeName ? service.blank : service.blankWithLocality;
  return `Olá! Gostaria de saber o preço e a disponibilidade para ${service.request}${loc}.\n\n${blank}`;
}

/** Used on MaterialPage. */
export function buildMaterialWaMessage(slug: string, cityName: string | null): string {
  const city = cityName ? ` ${cityPrep(cityName)} ${cityName}` : '';
  if (slug.includes('pele'))       return buildQuoteWaMessage(`Olá! Tenho um sofá de pele e preciso de limpeza e tratamento${city}.`);
  if (slug.includes('veludo'))     return buildQuoteWaMessage(`Olá! Tenho um sofá de veludo e preciso de limpeza especializada${city}.`);
  if (slug.includes('camurca'))    return buildQuoteWaMessage(`Olá! Tenho um sofá de camurça e preciso de limpeza profissional${city}.`);
  if (slug.includes('microfibra')) return buildQuoteWaMessage(`Olá! Tenho um sofá de microfibra para limpar${city}.`);
  if (slug.includes('linho'))      return buildQuoteWaMessage(`Olá! Tenho um sofá de linho para limpar${city}.`);
  if (slug.includes('sintetico') && slug.includes('sofa')) return buildQuoteWaMessage(`Olá! Tenho um sofá sintético para limpar${city}.`);
  if (slug.includes('sofa'))       return buildQuoteWaMessage(`Olá! Tenho um sofá de tecido e preciso de limpeza profissional${city}.`);
  if (slug.includes('persa'))      return buildQuoteWaMessage(`Olá! Tenho um tapete persa e preciso de lavagem especializada${city}.`);
  if (slug.includes('tapete-la') || (slug.includes('tapete') && slug.includes('-la')))
                                   return buildQuoteWaMessage(`Olá! Tenho um tapete de lã para lavagem profissional${city}.`);
  if (slug.includes('sisal'))      return buildQuoteWaMessage(`Olá! Tenho um tapete de sisal para limpar${city}.`);
  if (slug.includes('tapete'))     return buildQuoteWaMessage(`Olá! Tenho um tapete sintético para limpar${city}.`);
  return buildQuoteWaMessage(`Olá! Preciso de limpeza profissional${city}.`);
}

/** Used on ProblemPage. */
export function buildProblemWaMessage(slug: string): string {
  const s = slug ?? '';
  if (s.includes('urgente'))
    return `Olá! Preciso de limpeza urgente. Têm disponibilidade ainda hoje ou amanhã?`;
  if (s.includes('urina'))
    return `Olá! Tenho urina no meu ${s.includes('colchao') ? 'colchão' : 'sofá'} e preciso de tratamento urgente. Qual é o preço e a disponibilidade?`;
  if (s.includes('manchas-vinho'))
    return `Olá! Tenho uma mancha de vinho no sofá e preciso de ajuda. Qual é o preço e a disponibilidade?`;
  if (s.includes('manchas-cafe'))
    return `Olá! Tenho manchas de café no sofá. Podem ajudar? Qual é o preço e a disponibilidade?`;
  if (s.includes('manchas-gordura'))
    return `Olá! Tenho manchas de gordura no sofá. Qual é o serviço adequado, o preço e a disponibilidade?`;
  if (s.includes('manchas-sangue'))
    return `Olá! Tenho manchas de sangue no colchão e preciso de ajuda urgente. Qual é o preço e a disponibilidade?`;
  if (s.includes('mancha')) {
    const item = s.includes('colchao') ? 'colchão' : s.includes('tapete') ? 'tapete' : 'sofá';
    return `Olá! Tenho manchas no meu ${item} e preciso de remoção profissional. Qual é o preço e a disponibilidade?`;
  }
  if (s.includes('cheiro') || s.includes('odor')) {
    const item = s.includes('colchao') ? 'colchão' : s.includes('tapete') ? 'tapete' : 'sofá';
    return `Olá! O meu ${item} tem maus cheiros persistentes. Qual é o serviço, o preço e a disponibilidade?`;
  }
  if (s.includes('acar')) {
    const item = s.includes('colchao') ? 'colchão' : 'sofá';
    return `Olá! Gostaria de conhecer o tratamento anti-ácaros opcional para o meu ${item}. Podem explicar o que inclui e confirmar o preço e a disponibilidade?`;
  }
  if (s.includes('alerg')) {
    const item = s.includes('colchao') ? 'colchão' : 'sofá';
    return `Olá! Tenho alergias e preciso de higienização profissional do meu ${item}. Qual é o preço e a disponibilidade?`;
  }
  if (s.includes('pelos')) {
    const item = s.includes('tapete') ? 'tapete' : 'sofá';
    return `Olá! O meu ${item} tem pelos de animais. Qual é o vosso serviço, o preço e a disponibilidade?`;
  }
  if (s.includes('mofo') || s.includes('bolor')) {
    const item = s.includes('alcatifa') ? 'alcatifa' : 'tapete';
    return `Olá! O meu ${item} tem mofo/bolor. Qual é o serviço, o preço e a disponibilidade para remoção?`;
  }
  if (s.includes('impermeabiliz'))
    return `Olá! Quero impermeabilizar o meu sofá. Qual é o preço e a disponibilidade?`;
  if (s.includes('pele'))
    return `Olá! Tenho um sofá de pele que precisa de limpeza e tratamento. Qual é o preço e a disponibilidade?`;
  if (s.includes('veludo'))
    return `Olá! Tenho um sofá de veludo que precisa de limpeza profissional. Qual é o preço e a disponibilidade?`;
  if (s.includes('persa'))
    return `Olá! Tenho um tapete persa que precisa de lavagem especializada. Qual é o preço e a disponibilidade?`;
  if (s.includes('tapete-la') || (s.includes('tapete') && s.includes('-la')))
    return `Olá! Tenho um tapete de lã que precisa de lavagem profissional. Qual é o preço e a disponibilidade?`;
  if (s.includes('preco') || s.includes('custa') || s.includes('quanto')) {
    const item = s.includes('colchao') ? 'colchão' : s.includes('tapete') ? 'tapete' : 'sofá';
    return `Olá! Gostaria de saber o preço de limpeza profissional de ${item}. Podem dar-me um orçamento e a disponibilidade?`;
  }
  if (s.includes('cadeira'))
    return `Olá! Preciso de limpeza profissional de cadeiras. Qual é o preço e a disponibilidade?`;
  if (s.includes('alcatifa'))
    return `Olá! Preciso de limpeza profissional de alcatifas. Qual é o preço e a disponibilidade?`;
  const item = s.includes('colchao') ? 'colchão' : s.includes('tapete') ? 'tapete' : 'sofá';
  return `Olá! Preciso de limpeza profissional para o meu ${item}. Qual é o preço e quando têm disponibilidade?`;
}

/** Used on SofaVariantPage (higienização/lavagem/impermeabilização keyword variants). */
export function buildVariantWaMessage(
  isWaterproofing: boolean,
  serviceLabel: string,
  variantLabel: string,
  locationName: string
): string {
  const svc = serviceLabel.toLowerCase();
  if (isWaterproofing) {
    const article = svc === 'sofá' || svc === 'sofa' ? 'o meu sofá' : svc === 'cadeiras' ? 'as minhas cadeiras' : 'os meus estofos';
    return `Olá! Gostaria de saber o preço e a próxima disponibilidade para impermeabilizar ${article} ${cityPrep(locationName)} ${locationName}. Posso enviar fotografias para avaliarem o tecido e confirmarem o orçamento.`;
  }
  if (svc === 'sofá' || svc === 'sofa') return buildServiceWaMessage('limpeza-sofas', locationName);
  const variant = variantLabel.toLowerCase();
  return buildQuoteWaMessage(`Olá! Gostaria de pedir um orçamento de ${variant} de ${svc} ${cityPrep(locationName)} ${locationName}.`);
}

/** Used on CommercialPage (B2B: restaurantes, hotéis, escritórios). */
export function buildCommercialWaMessage(cityName: string): string {
  return `Olá! Represento um negócio ${cityPrep(cityName)} ${cityName} (restaurante/hotel/escritório) e tenho interesse num contrato de limpeza recorrente de estofos. Podem enviar-me uma proposta e a vossa disponibilidade?`;
}

/** Only an opaque operational reference belongs in a shareable WhatsApp URL. */
export function buildSubmittedWaMessage(reference?: string | null): string {
  const value = reference?.trim().replace(/^#/, '');
  // Current short booking IDs and opaque lead IDs; never interpolate arbitrary input.
  const safe = value && /^(?:[A-Z0-9]{6,12}|L-\d{8}-[a-z0-9]{8,12})$/.test(value) ? value : null;
  return `Olá! Acabei de enviar o pedido${safe ? ` #${safe}` : ''}. Gostaria de confirmar o orçamento e a próxima disponibilidade. Posso enviar fotografias dos artigos para avaliação.`;
}

/** Páginas pack × cidade: pede orçamento para a combinação, não para um artigo. */
export function buildPackWaMessage(packName: string, cityName: string): string {
  return `Olá! Gostaria de saber o preço e a próxima disponibilidade para uma ${packName.toLowerCase()} ${cityPrep(cityName)} ${cityName}. Posso enviar fotografias dos artigos para confirmarem o orçamento.`;
}
