import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { submitQuizLead, type QuizLeadPayload } from './submissionService';

/**
 * A separação que o negócio não pode perder: **registo operacional** e
 * **medição de marketing** são duas coisas, e só a segunda depende de cookies.
 *
 * Quem recusa análise e publicidade tem o mesmo direito a pedir um orçamento
 * que qualquer outra pessoa: o pedido é enviado, gravado e notificado na mesma.
 * O que não acontece é medição — nem `generate_lead`, nem conversão, nem
 * atribuição guardada.
 *
 * Ficheiro separado de `submissionService.test.ts` de propósito: aquele cobre
 * a paridade de preços entre canais, com centenas de casos gerados, e misturar
 * aqui as asserções de consentimento tornava os dois ilegíveis.
 */

const mocks = vi.hoisted(() => ({ invokeCrm: vi.fn(), invokeEmail: vi.fn(), log: vi.fn() }));
vi.mock('@/lib/quizTracking', () => ({ IS_PRODUCTION: true }));
vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: () => ({ insert: vi.fn() }),
    functions: { invoke: (name: string, opts: unknown) => (name === 'submit-lead' ? mocks.invokeCrm(opts) : mocks.invokeEmail(opts)) },
  },
}));
vi.mock('@/lib/recaptcha', () => ({ getRecaptchaTokenSafe: () => Promise.resolve('token-de-teste') }));
vi.mock('@/lib/errorTracking', () => ({ logError: mocks.log }));

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  window.gtag = vi.fn();
  mocks.invokeCrm.mockReset().mockResolvedValue({ data: { success: true, duplicate: false }, error: null });
  mocks.invokeEmail.mockReset().mockResolvedValue({ data: { success: true }, error: null });
  mocks.log.mockReset();
  vi.stubGlobal('location', new URL('https://cleansolutions.com.pt/limpeza-sofas-lisboa?gclid=Cj0TESTE'));
});
afterEach(() => vi.unstubAllGlobals());

/** Um pedido mínimo mas completo — o suficiente para o pipeline correr. */
function payload(over: Partial<QuizLeadPayload> = {}): QuizLeadPayload {
  return {
    name: 'Pessoa Teste', phone: '912345678', email: 'pessoa@exemplo.invalid', photos: [],
    finalLocation: 'Lisboa', service: 'sofa', serviceType: 'cleaning', waterproofingTier: 'essencial',
    serviceLabel: 'Sofás', serviceTypeLabel: 'Limpeza', crmServiceLabel: 'Sofás',
    detailsSummary: '1x Sofá', priceText: '89€', message: 'Pedido de teste',
    sofaItems: [], mattressItems: [], upsellItems: [], carpetItems: [],
    chairQuantity: '', chairWaterproofQty: 0, chairAntiAcaros: false, calculateServicePrice: 0,
    totalPrice: 89, hasSobOrcamento: false, hasUpsellSobItem: false, finalTravelCost: 10,
    hypoallergenic: null, hypoSurcharge: 0, slotLabel: 'Manhã', ...over,
  };
}

const gtagEvents = () => (window.gtag as ReturnType<typeof vi.fn>).mock.calls
  .filter(call => call[0] === 'event').map(call => call[1]);

describe('consentimento recusado', () => {
  beforeEach(() => { localStorage.setItem('kyro_cookie_consent', 'declined'); });

  it('o pedido é enviado aos dois canais e devolve sucesso', async () => {
    const result = await submitQuizLead(payload());
    expect(mocks.invokeCrm).toHaveBeenCalledTimes(1);
    expect(mocks.invokeEmail).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ crmOk: true, emailOk: true });
    expect(result.leadId).toMatch(/^L-\d{8}-/);
  });

  it('o lead chega ao servidor com nome, telefone e serviço intactos', async () => {
    await submitQuizLead(payload());
    const body = mocks.invokeCrm.mock.calls[0][0].body;
    expect(body.lead).toMatchObject({ name: 'Pessoa Teste', phone: '912345678', service: 'Sofás', location: 'Lisboa' });
    expect(body.lead.lead_id).toMatch(/^L-/);
  });

  /** Sem consentimento não há origem: o campo vai vazio, não inventado. */
  it('não envia atribuição nenhuma, nem sequer o gclid que está no URL', async () => {
    await submitQuizLead(payload());
    const attribution = mocks.invokeCrm.mock.calls[0][0].body.attribution;
    expect(attribution.is_paid).toBe(false);
    expect(attribution.gclid).toBeUndefined();
    expect(attribution.last_source).toBeUndefined();
    expect(JSON.stringify(attribution)).not.toContain('Cj0TESTE');
  });

  it('não dispara generate_lead nem conversão do Google Ads', async () => {
    await submitQuizLead(payload());
    expect(gtagEvents()).toEqual([]);
  });

  /** A nota de campanha no email e no CRM também fica vazia. */
  it('não escreve origem de campanha nas notas do lead', async () => {
    await submitQuizLead(payload());
    const notes = mocks.invokeCrm.mock.calls[0][0].body.lead.notes ?? '';
    expect(notes).not.toContain('Origem da campanha');
    expect(notes).not.toContain('Cj0TESTE');
  });
});

describe('consentimento aceite', () => {
  beforeEach(() => { localStorage.setItem('kyro_cookie_consent', 'accepted'); });

  it('envia o pedido e guarda a atribuição', async () => {
    await submitQuizLead(payload());
    const attribution = mocks.invokeCrm.mock.calls[0][0].body.attribution;
    expect(attribution).toMatchObject({ gclid: 'Cj0TESTE', is_paid: true, channel: 'form' });
  });

  /** Nenhum dado pessoal entra no objeto de atribuição, nunca. */
  it('a atribuição não leva nome, telefone nem email', async () => {
    await submitQuizLead(payload());
    const serialized = JSON.stringify(mocks.invokeCrm.mock.calls[0][0].body.attribution);
    expect(serialized).not.toContain('Pessoa Teste');
    expect(serialized).not.toContain('912345678');
    expect(serialized).not.toContain('pessoa@exemplo.invalid');
  });
});

describe('idempotência do lado do cliente', () => {
  beforeEach(() => { localStorage.setItem('kyro_cookie_consent', 'accepted'); });

  /**
   * O caso do duplo clique e do retry depois de timeout: o identificador é
   * gerado uma vez por submissão e sobrevive à repetição, para o servidor
   * poder reconhecer que é o mesmo pedido.
   */
  it('reutiliza o mesmo lead_id quando a primeira tentativa falha', async () => {
    mocks.invokeCrm.mockResolvedValueOnce({ data: null, error: { message: 'timeout' } });
    mocks.invokeEmail.mockResolvedValueOnce({ data: null, error: { message: 'timeout' } });
    mocks.invokeEmail.mockResolvedValueOnce({ data: null, error: { message: 'timeout' } });
    await expect(submitQuizLead(payload())).rejects.toThrow();

    mocks.invokeCrm.mockResolvedValue({ data: { success: true, duplicate: false }, error: null });
    mocks.invokeEmail.mockResolvedValue({ data: { success: true }, error: null });
    await submitQuizLead(payload());

    const ids = mocks.invokeCrm.mock.calls.map(([opts]) => opts.body.lead.lead_id);
    expect(new Set(ids).size).toBe(1);
  });

  /**
   * E o inverso, que é igualmente importante: quem volta na semana seguinte
   * para pedir outro serviço é um lead novo, não uma repetição bloqueada.
   */
  it('gera um lead_id novo depois de uma submissão bem sucedida', async () => {
    await submitQuizLead(payload());
    await submitQuizLead(payload({ service: 'mattress' }));
    const ids = mocks.invokeCrm.mock.calls.map(([opts]) => opts.body.lead.lead_id);
    expect(new Set(ids).size).toBe(2);
  });

  /** Um duplicado reconhecido pelo servidor é sucesso, não erro. */
  it('trata a resposta duplicate do servidor como entrega bem sucedida', async () => {
    mocks.invokeCrm.mockResolvedValue({ data: { success: true, duplicate: true }, error: null });
    const result = await submitQuizLead(payload());
    expect(result).toMatchObject({ crmOk: true, duplicate: true });
  });
});

describe('uma falha de medição nunca trava o pedido', () => {
  beforeEach(() => { localStorage.setItem('kyro_cookie_consent', 'accepted'); });

  it('entrega o pedido mesmo quando o gtag rebenta', async () => {
    window.gtag = vi.fn(() => { throw new Error('bloqueado por extensão'); });
    const result = await submitQuizLead(payload());
    expect(result.crmOk).toBe(true);
    expect(result.emailOk).toBe(true);
  });

  it('entrega o pedido mesmo sem armazenamento disponível', async () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('bloqueado'); };
    try {
      const result = await submitQuizLead(payload());
      expect(result.crmOk).toBe(true);
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});
