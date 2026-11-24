// Onde está ligado o modelo novo (secções de ecrã inteiro com encaixe, widget do bot, passo a passo real).
// Uma só regra para todas as páginas que usam o LandingServiceSections (dono, 24 Nov: o site todo, um serviço de cada vez).
// Sofás, cadeiras e tapetes: todas as famílias; colchões: por cidade (packs-tratamento alarga as famílias dos colchões aqui).
export const NEW_MODEL_ALL_FAMILIES = ['limpeza-sofas', 'limpeza-cadeiras', 'limpeza-tapetes', 'limpeza-colchoes', 'limpeza-alcatifas']; // colchões em todas as famílias (packs-tratamento, 24 Nov)
export const NEW_MODEL_CITY_ONLY: string[] = [];

export function isNewModel(model: { serviceSlug?: string; family?: string } | null | undefined): boolean {
  if (!model?.serviceSlug) return false;
  return NEW_MODEL_ALL_FAMILIES.includes(model.serviceSlug) || (NEW_MODEL_CITY_ONLY.includes(model.serviceSlug) && model.family === 'localidade');
}
