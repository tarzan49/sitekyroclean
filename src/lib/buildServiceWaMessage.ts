/**
 * Builds a WhatsApp opening message for a given service slug and optional location.
 * Used on LocationServicePage, FreguesiaServicePage, PricePage, and MaterialPage.
 */
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
