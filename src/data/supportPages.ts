// Textos das páginas de apoio (404, /obrigado e /obrigado-pelo-servico), partilhados entre o React e o
// HTML estático (scripts/prerender.ts). Sem imports com alias `@/`, para correr em Node puro.

export const NOT_FOUND_H1 = 'Página não encontrada';
export const NOT_FOUND_TEXT = 'O endereço que procura não existe ou foi movido. Fale connosco pelo WhatsApp e dizemos-lhe o preço e a próxima hora livre em menos de 1 minuto.';
export const NOT_FOUND_LINKS_HEADING = 'Escolha o seu serviço';
export const NOT_FOUND_LINKS: readonly { href: string; label: string }[] = [
  { href: '/limpeza-sofas', label: 'Limpeza de sofás' },
  { href: '/limpeza-colchoes', label: 'Limpeza de colchões' },
  { href: '/limpeza-cadeiras', label: 'Limpeza de cadeiras' },
  { href: '/limpeza-tapetes', label: 'Limpeza de tapetes' },
  { href: '/limpeza-alcatifas', label: 'Limpeza de alcatifas' },
  { href: '/impermeabilizacao', label: 'Impermeabilização' },
  { href: '/blog', label: 'Guias e preços' },
];

/** `/obrigado` sem pedido nesta sessão: é o que um crawler vê. */
export const QUOTE_EMPTY_H1 = ['O próximo passo é simples.', 'Falamos no WhatsApp?'] as const;
export const QUOTE_EMPTY_TEXT = 'Os detalhes do pedido não estão disponíveis nesta sessão. Fale connosco para o localizar.';
export const QUOTE_SUMMARY_TITLE = 'Resumo do pedido';
export const QUOTE_CONFIRM_LABEL = 'Confirmar pelo WhatsApp';

/** `/obrigado-pelo-servico` sem nome, peça nem cidade no endereço. */
/** Título do separador e da pré-visualização no WhatsApp. */
export const REVIEW_PAGE_TITLE = 'Obrigado | Kyro Clean Solutions';
export const REVIEW_H1 = 'Obrigado pela confiança';
export const REVIEW_ASK = 'Se puder deixar a sua opinião no Google, demora 10 segundos e ajuda-nos muito.';
export const REVIEW_BUTTON = 'Deixar avaliação no Google';
export const REVIEW_WHATSAPP = 'Ou fale connosco pelo WhatsApp';
