/** Maps service slug (URL) → quiz service key */
export const SERVICE_TO_QUIZ: Record<string, string> = {
  'limpeza-sofas':    'sofa',
  'limpeza-colchoes': 'mattress',
  'limpeza-tapetes':  'carpet',
  'limpeza-cadeiras': 'chairs',
  'limpeza-alcatifas': 'carpet',
};

/** Maps SofaVariantPage serviceKey → quiz service key */
export const SERVICEKEY_TO_QUIZ: Record<string, string> = {
  sofa:      'sofa',
  colchao:   'mattress',
  tapetes:   'carpet',
  cadeiras:  'chairs',
  alcatifas: 'carpet',
};
