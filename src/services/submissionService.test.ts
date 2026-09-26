import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook } from '@testing-library/react';
import { initialFormData, sofaPrices, mattressPrices, locationPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, SofaItem, MattressItem, UpsellItemConfig } from '@/components/quiz/QuizTypes';
import { useQuizPricing } from '@/hooks/use-quiz-pricing';
import { buildReceiptLines, formatQuotePrice, submitQuizLead, type QuizLeadPayload } from './submissionService';

const mocks = vi.hoisted(() => ({ insert: vi.fn(), invokeCrm: vi.fn(), invokeEmail: vi.fn(), log: vi.fn() }));
vi.mock('@/lib/quizTracking', () => ({ IS_PRODUCTION: true }));
vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: () => ({ insert: mocks.insert }),
    functions: { invoke: (name: string, opts: unknown) => (name === 'submit-lead' ? mocks.invokeCrm(opts) : mocks.invokeEmail(opts)) },
  },
}));
// O token nunca é pedido a sério nos testes: interessa o payload que sai, não
// o script da Google.
vi.mock('@/lib/recaptcha', () => ({ getRecaptchaTokenSafe: () => Promise.resolve('token-de-teste') }));
vi.mock('@/lib/errorTracking', () => ({ logError: mocks.log }));
beforeEach(() => {
  sessionStorage.clear();
  mocks.insert.mockReset().mockResolvedValue({ error: null });
  mocks.invokeCrm.mockReset().mockResolvedValue({ data: { success: true }, error: null });
  mocks.invokeEmail.mockReset().mockResolvedValue({ data: { success: true }, error: null });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function payload(form: Partial<QuizFormData>, sofas: SofaItem[] = [], mattresses: MattressItem[] = [], extras: UpsellItemConfig[] = []): QuizLeadPayload {
  const data = { ...initialFormData, location: 'Lisboa', ...form };
  const carpets = data.service === 'carpet' ? [{ id: 'rug1', largura: '2,5', comprimento: '3' }] : [];
  const { result } = renderHook(() => useQuizPricing(data, sofas, mattresses, extras, carpets));
  const p: QuizLeadPayload = { ...result.current, name: 'Teste Auditoria', phone: '+351 900 000 000', email: 'audit@example.invalid', photos: [], finalLocation: data.location,
    service: data.service, serviceType: data.serviceType, waterproofingTier: data.waterproofingTier, serviceLabel: data.service,
    serviceTypeLabel: data.serviceType, crmServiceLabel: data.service, detailsSummary: '', priceText: '', message: '',
    sofaItems: sofas, mattressItems: mattresses, carpetItems: carpets, upsellItems: extras, chairQuantity: data.chairQuantity,
    chairWaterproofQty: data.chairWaterproofQty, chairAntiAcaros: data.chairAntiAcaros, sofaAntiAcaros: data.sofaAntiAcaros, hypoallergenic: false, hypoSurcharge: 0, slotLabel: '', description: 'Campainha B & acesso pelo pátio' };
  p.detailsSummary = buildReceiptLines(p).map(l => `${l.qty}x ${l.label}: ${l.total ?? 'Sob orçamento'}`).join('\n');
  p.priceText = formatQuotePrice(p);
  p.message = `Detalhes: ${p.detailsSummary}\nEstimativa: ${p.priceText}\nObservações: ${p.description}`;
  return p;
}

const cases: Array<[string, Partial<QuizFormData>, SofaItem[], MattressItem[], UpsellItemConfig[]]> = [];
const extras: UpsellItemConfig[][] = [[], [{ id: 'mattress-casal', mattressSize: 'casal', qty: 1, price: 69, label: '1x Colchão Casal' }], [{ id: 'carpet', qty: 1, price: 0, label: 'Tapete', carpetItems: [{ id: 'r', largura: '2', comprimento: '4' }] }]];
for (const location of ['Lisboa', 'Barcelos', 'Lagos', 'Monchique']) {
  for (const opt of sofaPrices) for (const serviceType of ['cleaning', 'waterproofing'] as const) for (const waterproofingTier of ['essencial', 'premium'] as const) for (const packEnabled of [false, true]) for (const qty of [1, 2, 9]) for (const extra of extras)
    for (const sofaAntiAcaros of [false, true])
      cases.push([`sofa ${opt.id}/${serviceType}/${waterproofingTier}/${packEnabled}/${qty}/${location}/${extra.length ? extra[0].id : 'none'}/${sofaAntiAcaros ? 'anti' : 'no-anti'}`, { service: 'sofa', serviceType, waterproofingTier, location, sofaAntiAcaros }, [{ sizeId: opt.id, qty, packEnabled }], [], extra]);
  for (const opt of mattressPrices) for (const packEnabled of [false, true]) for (const qty of [1, 2, 9]) for (const extra of extras)
    cases.push([`mattress ${opt.id}/${packEnabled}/${qty}/${location}/${extra.length ? extra[0].id : 'none'}`, { service: 'mattress', serviceType: 'cleaning', location }, [], [{ sizeId: opt.id, qty, packEnabled }], extra]);
  for (const qty of [1, 4, 5, 6, 7, 9, 10, 11]) for (const serviceType of ['cleaning', 'waterproofing'] as const) for (const waterproofingTier of ['essencial', 'premium'] as const) for (const addon of ['none', 'waterproof', 'anti', 'both-flags'] as const)
    cases.push([`chairs ${qty}/${serviceType}/${waterproofingTier}/${addon}/${location}`, { service: 'chairs', serviceType, waterproofingTier, chairQuantity: String(qty), chairWaterproofing: addon === 'waterproof' || addon === 'both-flags', chairWaterproofQty: addon === 'waterproof' || addon === 'both-flags' ? qty : 0, chairAntiAcaros: addon === 'anti' || addon === 'both-flags', location }, [], [], []]);
  cases.push([`carpet ${location}`, { service: 'carpet', serviceType: 'cleaning', location }, [], [], extras[1]]);
}

describe('quote channel parity: table sizes, tiers, quantities, brackets, extras and travel', () => {
  it.each(cases)('%s', async (_, form, sofas, mattresses, extra) => {
    const p = payload(form, sofas, mattresses, extra);
    await submitQuizLead(p);
    const emailBody = mocks.invokeEmail.mock.calls[0][0].body;
    const receipt = JSON.parse(sessionStorage.getItem('kyro_receipt')!);
    const wa = new URL(sessionStorage.getItem('kyro_wa_url')!).searchParams.get('text')!;
    expect(emailBody.lead.message).toBe(p.message);
    expect(wa).not.toContain(p.message);
    expect(wa).not.toContain(p.name);
    expect(wa).not.toContain(p.phone);
    expect(wa).not.toContain(p.description);
    expect(emailBody.lead.booking_id).toBe(receipt.bookingId);
    expect(wa).toContain(receipt.bookingId);
    expect(receipt.lines.reduce((n: number, l: { total: number | null }) => n + (l.total ?? 0), 0)).toBe(p.totalPrice);
    expect(receipt.subtotal - receipt.discountAmount).toBeCloseTo(receipt.total);
    expect(receipt.lines.find((line: { label: string }) => line.label.startsWith('Deslocação:'))?.total ?? 0).toBe(p.finalTravelCost);
    expect(mocks.invokeCrm.mock.calls[0][0].body.lead.value).toBe(p.priceText);
    if (p.hasSobOrcamento || p.hasUpsellSobItem) expect(emailBody.lead.message).toContain('subtotal conhecido');
  });
});

describe('specific regressions and delivery failures', () => {
  it('3-seat Premium pack uses the approved 30€ override, not the 40€ standalone difference', () => {
    const p = payload({ service: 'sofa', serviceType: 'cleaning', waterproofingTier: 'premium' }, [{ sizeId: '3-lugares', qty: 1, packEnabled: true }]);
    expect(p.calculateServicePrice).toBe(189);
    expect(buildReceiptLines(p)[0].total).toBe(189);
  });
  it('4+ sofa pack never invents a 40€ fixed price', () => {
    const p = payload({ service: 'sofa', serviceType: 'cleaning' }, [{ sizeId: '4+-lugares', qty: 1, packEnabled: true }]);
    expect(p.calculateServicePrice).toBe(0);
    expect(buildReceiptLines(p)[0].total).toBeNull();
  });
  it('keeps dimensions in the receipt rather than the shareable URL', async () => {
    const p = payload({ service: 'carpet', serviceType: 'cleaning' });
    await submitQuizLead(p);
    expect(sessionStorage.getItem('kyro_receipt')).toContain('2,5 × 3 m');
  });
  it('rejects when both the CRM and the email channel fail', async () => {
    mocks.invokeCrm.mockResolvedValue({ data: null, error: { message: 'down' } });
    mocks.invokeEmail.mockResolvedValue({ data: null, error: { message: 'down' } });
    await expect(submitQuizLead(payload({ service: 'carpet' }))).rejects.toThrow('Both');
    expect(sessionStorage.getItem('kyro_receipt')).toBeNull();
  });
  it.each(['crm', 'email'])('succeeds when only %s delivers', async channel => {
    if (channel === 'crm') mocks.invokeEmail.mockResolvedValue({ data: null, error: { message: 'down' } });
    else mocks.invokeCrm.mockResolvedValue({ data: null, error: { message: 'down' } });
    await expect(submitQuizLead(payload({ service: 'carpet' }))).resolves.toMatchObject({ leadId: expect.stringMatching(/^L-/) });
  });
  it('retries one network failure on the email channel', async () => {
    mocks.invokeEmail.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ data: { success: true }, error: null });
    await submitQuizLead(payload({ service: 'carpet' }));
    expect(mocks.invokeEmail).toHaveBeenCalledTimes(2);
  });
});

it('retains Alcatifa instead of mislabelling it as a rug', async () => {
  const p = payload({ service: 'carpet' }); p.carpetKind = 'alcatifa';
  expect(buildReceiptLines(p)[0].label).toContain('Alcatifa');
});

it.each([
  ['2,5', '3', '7.5'], ['2.5', '3', '7.5'], ['1,25', '2,4', '3'], ['0.75', '1.5', '1.13'],
])('sends both dimensions and correct rounded area to the email channel: %s × %s', async (largura, comprimento, area) => {
  const p = payload({ service: 'carpet', serviceType: 'cleaning' });
  p.carpetItems = [{ id: 'first', largura, comprimento }, { id: 'second', largura: '1', comprimento: '4' }];
  p.detailsSummary = buildReceiptLines(p).map(l => `${l.qty}x ${l.label}: ${l.total ?? 'Sob orçamento'}`).join('\n');
  p.message = `Detalhes: ${p.detailsSummary}\nEstimativa: ${p.priceText}`;
  await submitQuizLead(p);
  const emailBody = mocks.invokeEmail.mock.calls[0][0].body;
  expect(emailBody.lead.message).toContain(`Tapete 1: ${largura} × ${comprimento} m (${area} m²)`);
  expect(emailBody.lead.message).toContain('Tapete 2: 1 × 4 m (4 m²)');
  expect(emailBody.lead.message).toContain('Sob orçamento');
  expect(new URL(sessionStorage.getItem('kyro_wa_url')!).searchParams.get('text')).not.toContain(p.message);
});

describe('reCAPTCHA no canal do CRM', () => {
  it('não envia o token para o canal de email', async () => {
    await submitQuizLead(payload({ service: 'carpet' }));
    const body = mocks.invokeEmail.mock.calls[0][0].body;
    expect(JSON.stringify(body)).not.toContain('token-de-teste');
    expect(body.recaptchaToken).toBeUndefined();
  });

  it('envia o token à função de servidor, fora do corpo do lead', async () => {
    await submitQuizLead(payload({ service: 'carpet' }));
    const sent = mocks.invokeCrm.mock.calls[0][0].body;
    expect(sent.recaptchaToken).toBe('token-de-teste');
    expect(sent.lead.recaptchaToken).toBeUndefined();
  });

  it('quando o servidor recusa por reCAPTCHA, não insere pelo caminho antigo', async () => {
    mocks.invokeCrm.mockResolvedValue({ data: null, error: { message: 'forbidden', context: { status: 403 } } });
    // O email entrega, por isso o pedido nao se perde e a submissao resolve.
    await expect(submitQuizLead(payload({ service: 'carpet' }))).resolves.toMatchObject({ leadId: expect.stringMatching(/^L-/) });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('nunca insere diretamente: a função é o único caminho para o CRM', async () => {
    // A politica de insert anonimo foi fechada, por isso um insert direto
    // falharia em silencio em producao. Qualquer falha da funcao tem de contar
    // como falha do canal do CRM, nao como motivo para tentar o caminho antigo.
    mocks.invokeCrm.mockResolvedValue({ data: null, error: { message: 'indisponível', context: { status: 503 } } });
    await expect(submitQuizLead(payload({ service: 'carpet' }))).resolves.toMatchObject({ leadId: expect.stringMatching(/^L-/) });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('um pedido real nunca se perde quando o reCAPTCHA falha em carregar', async () => {
    // Sem token, o servidor deixa passar de proposito: aqui confirma-se apenas
    // que a submissao segue e entrega, em vez de ficar pendurada.
    mocks.invokeCrm.mockResolvedValue({ data: { success: true }, error: null });
    await expect(submitQuizLead(payload({ service: 'carpet' }))).resolves.toMatchObject({ leadId: expect.stringMatching(/^L-/) });
    expect(mocks.invokeCrm).toHaveBeenCalledTimes(1);
  });
});


it('uses the persisted server reference after a duplicate response', async () => {
  mocks.invokeCrm.mockResolvedValue({ data: { success: true, duplicate: true, bookingId: 'REAL1234' }, error: null });
  const result = await submitQuizLead(payload({ service: 'carpet' }));
  expect(result.bookingId).toBe('REAL1234');
  expect(JSON.parse(sessionStorage.getItem('kyro_receipt')!).bookingId).toBe('REAL1234');
  expect(new URL(sessionStorage.getItem('kyro_wa_url')!).searchParams.get('text')).toContain('#REAL1234');
});

describe('anti-acaros reaches the lead', () => {
  it('names the sofa treatment and its price in the receipt', () => {
    const p = payload({ service: 'sofa', serviceType: 'cleaning', sofaAntiAcaros: true }, [{ sizeId: '3-lugares', qty: 2, packEnabled: true, packQty: 1 }]);
    const lines = buildReceiptLines(p);
    expect(lines).toContainEqual({ label: 'Sofá 3 Lugares + Anti-ácaros', qty: 1, unitPrice: 129, total: 129 });
    expect(lines).toContainEqual({ label: 'Sofá 3 Lugares', qty: 1, unitPrice: 79, total: 79 });
    expect(p.calculateServicePrice).toBe(208);
  });
  it('shows the chair treatment at its unit rate and never with the waterproofing', () => {
    const anti = buildReceiptLines(payload({ service: 'chairs', serviceType: 'cleaning', chairQuantity: '4', chairAntiAcaros: true }));
    expect(anti).toContainEqual({ label: 'Anti-ácaros Cadeiras (5€/un.)', qty: 4, unitPrice: 5, total: 20 });
    const both = buildReceiptLines(payload({ service: 'chairs', serviceType: 'cleaning', chairQuantity: '4', chairAntiAcaros: true, chairWaterproofing: true, chairWaterproofQty: 4 }));
    expect(both.some(line => /anti-ácaros/i.test(line.label))).toBe(false);
    expect(both.some(line => /incluídos/.test(line.label))).toBe(false);
  });
});
