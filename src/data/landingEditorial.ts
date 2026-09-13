import type { LandingFaqContext, LandingService } from './landingFaqPool';

interface EditorialContext {
  family: LandingFaqContext['family'];
  serviceSlug: LandingService;
  serviceLabel: string;
  place: string;
  municipality: string;
}

// Differentiate the purpose of the page, not an invented local condition or method.
const briefs: Record<LandingService, { assessment: string; request: string; budget: string }> = {
  'limpeza-sofas': { assessment: 'avaliação do tecido, das manchas e do estado do sofá', request: 'Indique os lugares, a chaise longue e os módulos e envie uma fotografia do conjunto.', budget: 'Compare as configurações por número de lugares e identifique chaise longue e módulos adicionais.' },
  'limpeza-colchoes': { assessment: 'avaliação do revestimento, das manchas e das condições de secagem', request: 'Envie as medidas e a etiqueta do colchão e indique as faces que pretende tratar.', budget: 'Identifique o tamanho, o número de colchões e os tratamentos opcionais pretendidos.' },
  'limpeza-tapetes': { assessment: 'avaliação das fibras, das cores e da base de cada peça', request: 'Envie as medidas e fotografias da frente e do verso para confirmar o método e a modalidade do serviço.', budget: 'Cada tapete é avaliado pelas medidas, pelo material e pelo estado; não existe um preço fixo por m².' },
  'limpeza-cadeiras': { assessment: 'avaliação dos assentos, encostos e restantes partes estofadas', request: 'Indique a quantidade de cada modelo e mostre as zonas que pretende limpar.', budget: 'Compare o escalão da quantidade pretendida e identifique os modelos e as partes estofadas.' },
  'limpeza-alcatifas': { assessment: 'avaliação das fibras, da instalação e das zonas de passagem', request: 'Indique as medidas por área e as condições de acesso e circulação durante a visita.', budget: 'A proposta depende das áreas, do estado e do acesso; alcatifas não têm preço fixo por m².' },
  impermeabilizacao: { assessment: 'avaliação da compatibilidade do tecido e do seu estado antes da proteção', request: 'Compare Essencial e Premium e confirme as peças a proteger; a limpeza prévia é avaliada separadamente.', budget: 'Compare Essencial e Premium para as peças escolhidas e confirme se também é necessária limpeza prévia.' },
};

export function getLandingEditorial(context: EditorialContext) {
  const { family, serviceSlug, serviceLabel, place, municipality } = context;
  const brief = briefs[serviceSlug];
  const where = `${place === 'Porto' ? 'no' : 'em'} ${place}`;
  const consultation = municipality === 'Aveiro' || municipality === 'Coimbra';
  const quoteOnly = serviceSlug === 'limpeza-tapetes' || serviceSlug === 'limpeza-alcatifas';
  const metaWhere = family === 'freguesia' ? `em ${place}, ${municipality}` : where;
  let intro: string;
  if (family === 'preco') {
    intro = `${serviceLabel} ${where}: ${quoteOnly ? 'serviço sob orçamento' : 'estimativa conforme os artigos e as opções escolhidas'}. ${brief.budget}`;
  } else if (family === 'freguesia') {
    intro = `${serviceLabel} em ${place}, município de ${municipality}, com ${brief.assessment}. ${brief.request}`;
  } else if (family === 'variante') {
    intro = `${serviceLabel} ${where}, com o procedimento definido pelo material e pelo estado da peça. ${brief.request}`;
  } else {
    intro = `${serviceLabel} ${where}, com ${brief.assessment}. ${brief.request}`;
  }
  if (consultation) intro += ' Disponibilidade sob consulta.';
  const metaDescription = `${family === 'preco' ? 'Preços: ' : ''}${serviceLabel} ${metaWhere}. ${quoteOnly ? 'Sob orçamento' : 'Orçamento gratuito'}, com deslocação discriminada.${consultation ? ' Disponibilidade sob consulta.' : ' Avaliação antes da marcação.'}`;
  return { intro, metaDescription };
}
