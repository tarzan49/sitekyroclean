/**
 * O identificador de uma tentativa de submissão.
 *
 * Isto é a peça que torna a deduplicação real em vez de cosmética. O `lead_id`
 * não pode ser gerado dentro de `submitQuizLead`: se for, cada nova tentativa
 * da **mesma** submissão (duplo clique, retry depois de um timeout, refresh
 * com reenvio) traz um identificador novo, e o servidor não tem como saber que
 * é o mesmo pedido. Gerado aqui, sobrevive a todas essas repetições e só muda
 * quando a submissão anterior fecha com sucesso.
 *
 * Vive em `sessionStorage` e **não** depende do consentimento: é um dado
 * operacional do pedido, não medição. Uma pessoa que recuse cookies continua a
 * ter direito a que o seu pedido não seja duplicado.
 *
 * Se o armazenamento estiver bloqueado, degrada para um identificador em
 * memória — que ainda cobre o duplo clique e o retry na mesma página, que são
 * os casos comuns; o refresh perde-o, e nessa altura a proteção que resta é a
 * do servidor (o índice único em `leads.lead_id` não ajuda aí, mas o
 * `transaction_id` do lado da Google e a janela de deduplicação por telefone
 * ainda ajudam). Documentado por ser uma limitação real e não um detalhe.
 */

const KEY = 'kyro_submission_id_v1';

let inMemory: string | null = null;

function generate(): string {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
  return `L-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${random}`;
}

/**
 * O identificador da submissão em curso, criando-o se ainda não existir.
 *
 * Chamar isto duas vezes seguidas devolve o mesmo valor — é esse o ponto.
 */
export function currentSubmissionId(): string {
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) { inMemory = stored; return stored; }
  } catch { /* storage blocked */ }
  if (inMemory) return inMemory;
  inMemory = generate();
  try { sessionStorage.setItem(KEY, inMemory); } catch { /* storage blocked */ }
  return inMemory;
}

/**
 * Fecha a submissão atual.
 *
 * Chamado **só depois de o pedido ter sido entregue**. A partir daqui, um
 * pedido novo da mesma pessoa — outro serviço, outra semana — recebe um
 * identificador novo e é um lead a sério, não uma repetição. Não fazer isto
 * era o outro erro possível: bloquear um cliente que voltou.
 */
export function clearSubmissionId(): void {
  inMemory = null;
  try { sessionStorage.removeItem(KEY); } catch { /* storage blocked */ }
}
