/**
 * WhatsApp opening-message builders.
 * Each function returns the message body only; callers wrap it with
 * `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`.
 */

/** Used on LocationServicePage, FreguesiaServicePage, PricePage, and MaterialPage. */
export function buildServiceWaMessage(serviceSlug: string, placeName?: string | null): string {
  const loc = placeName ? ` em ${placeName}` : '';
  switch (serviceSlug) {
    case 'limpeza-sofas':
      return `Olá! Preciso de limpeza profissional de sofá${loc}. Qual é o preço e disponibilidade?`;
    case 'limpeza-colchoes':
      return `Olá! Preciso de higienização profissional de colchão${loc}. Qual é o preço e disponibilidade?`;
    case 'limpeza-tapetes':
      return `Olá! Preciso de lavagem profissional de tapetes${loc}. Qual é o preço e disponibilidade?`;
    case 'limpeza-cadeiras':
      return `Olá! Preciso de limpeza profissional de cadeiras${loc}. Qual é o preço e disponibilidade?`;
    case 'limpeza-alcatifas':
      return `Olá! Preciso de limpeza profissional de alcatifas${loc}. Qual é o preço e disponibilidade?`;
    case 'impermeabilizacao':
      return `Olá! Tenho interesse em impermeabilizar os meus estofos${loc}. Qual é o preço e disponibilidade?`;
    default:
      return `Olá! Gostaria de pedir um orçamento${loc}. Qual é o preço e disponibilidade?`;
  }
}

/** Used on MaterialPage. */
export function buildMaterialWaMessage(slug: string, cityName: string | null): string {
  const city = cityName ? ` em ${cityName}` : '';
  if (slug.includes('pele'))       return `Olá! Tenho um sofá de pele e preciso de limpeza e tratamento${city}. Qual é o preço?`;
  if (slug.includes('veludo'))     return `Olá! Tenho um sofá de veludo e preciso de limpeza especializada${city}. Qual é o preço?`;
  if (slug.includes('camurca'))    return `Olá! Tenho um sofá de camurça e preciso de limpeza profissional${city}. Qual é o preço?`;
  if (slug.includes('microfibra')) return `Olá! Tenho um sofá de microfibra para limpar${city}. Qual é o preço?`;
  if (slug.includes('linho'))      return `Olá! Tenho um sofá de linho para limpar${city}. Qual é o preço?`;
  if (slug.includes('sintetico') && slug.includes('sofa')) return `Olá! Tenho um sofá sintético para limpar${city}. Qual é o preço?`;
  if (slug.includes('sofa'))       return `Olá! Tenho um sofá de tecido e preciso de limpeza profissional${city}. Qual é o preço?`;
  if (slug.includes('persa'))      return `Olá! Tenho um tapete persa e preciso de lavagem especializada${city}. Qual é o preço?`;
  if (slug.includes('tapete-la') || (slug.includes('tapete') && slug.includes('-la')))
                                   return `Olá! Tenho um tapete de lã para lavagem profissional${city}. Qual é o preço?`;
  if (slug.includes('sisal'))      return `Olá! Tenho um tapete de sisal para limpar${city}. Qual é o preço?`;
  if (slug.includes('tapete'))     return `Olá! Tenho um tapete sintético para limpar${city}. Qual é o preço?`;
  return `Olá! Preciso de limpeza profissional${city}. Qual é o preço e disponibilidade?`;
}

/** Used on ProblemPage. */
export function buildProblemWaMessage(slug: string): string {
  const s = slug ?? '';
  if (s.includes('urgente'))
    return `Olá! Preciso de limpeza urgente. Têm disponibilidade ainda hoje ou amanhã?`;
  if (s.includes('urina'))
    return `Olá! Tenho urina no meu ${s.includes('colchao') ? 'colchão' : 'sofá'} e preciso de tratamento urgente. Qual é o preço e disponibilidade?`;
  if (s.includes('manchas-vinho'))
    return `Olá! Tenho uma mancha de vinho no sofá e preciso de ajuda. Qual é o preço?`;
  if (s.includes('manchas-cafe'))
    return `Olá! Tenho manchas de café no sofá. Podem ajudar? Qual é o preço?`;
  if (s.includes('manchas-gordura'))
    return `Olá! Tenho manchas de gordura no sofá. Qual é o serviço adequado e o preço?`;
  if (s.includes('manchas-sangue'))
    return `Olá! Tenho manchas de sangue no colchão e preciso de ajuda urgente. Qual é o preço?`;
  if (s.includes('mancha')) {
    const item = s.includes('colchao') ? 'colchão' : s.includes('tapete') ? 'tapete' : 'sofá';
    return `Olá! Tenho manchas no meu ${item} e preciso de remoção profissional. Qual é o preço?`;
  }
  if (s.includes('cheiro') || s.includes('odor')) {
    const item = s.includes('colchao') ? 'colchão' : s.includes('tapete') ? 'tapete' : 'sofá';
    return `Olá! O meu ${item} tem maus cheiros persistentes. Qual é o serviço e o preço?`;
  }
  if (s.includes('acar')) {
    const item = s.includes('colchao') ? 'colchão' : 'sofá';
    return `Olá! Preciso de eliminação de ácaros do meu ${item}. Qual é o serviço e o preço?`;
  }
  if (s.includes('alerg')) {
    const item = s.includes('colchao') ? 'colchão' : 'sofá';
    return `Olá! Tenho alergias e preciso de higienização profissional do meu ${item}. Qual é o preço?`;
  }
  if (s.includes('pelos')) {
    const item = s.includes('tapete') ? 'tapete' : 'sofá';
    return `Olá! O meu ${item} tem pelos de animais. Qual é o vosso serviço e preço?`;
  }
  if (s.includes('mofo') || s.includes('bolor')) {
    const item = s.includes('alcatifa') ? 'alcatifa' : 'tapete';
    return `Olá! O meu ${item} tem mofo/bolor. Qual é o serviço e preço para remoção?`;
  }
  if (s.includes('impermeabiliz'))
    return `Olá! Quero impermeabilizar o meu sofá. Qual é o preço e disponibilidade?`;
  if (s.includes('pele'))
    return `Olá! Tenho um sofá de pele que precisa de limpeza e tratamento. Qual é o preço?`;
  if (s.includes('veludo'))
    return `Olá! Tenho um sofá de veludo que precisa de limpeza profissional. Qual é o preço?`;
  if (s.includes('persa'))
    return `Olá! Tenho um tapete persa que precisa de lavagem especializada. Qual é o preço?`;
  if (s.includes('tapete-la') || (s.includes('tapete') && s.includes('-la')))
    return `Olá! Tenho um tapete de lã que precisa de lavagem profissional. Qual é o preço?`;
  if (s.includes('preco') || s.includes('custa') || s.includes('quanto')) {
    const item = s.includes('colchao') ? 'colchão' : s.includes('tapete') ? 'tapete' : 'sofá';
    return `Olá! Gostaria de saber o preço de limpeza profissional de ${item}. Podem dar-me um orçamento?`;
  }
  if (s.includes('cadeira'))
    return `Olá! Preciso de limpeza profissional de cadeiras. Qual é o preço e disponibilidade?`;
  if (s.includes('alcatifa'))
    return `Olá! Preciso de limpeza profissional de alcatifas. Qual é o preço?`;
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
    return `Olá! Tenho interesse em impermeabilizar o meu ${svc} em ${locationName}. Qual é o preço e quando têm disponibilidade?`;
  }
  const variant = variantLabel.toLowerCase();
  return `Olá! Preciso de ${variant} profissional para o meu ${svc} em ${locationName}. Podem dar-me um orçamento e indicar a vossa disponibilidade?`;
}
