import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook } from '@testing-library/react';
import { initialFormData, sofaPrices, mattressPrices, locationPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, SofaItem, MattressItem, UpsellItemConfig } from '@/components/quiz/QuizTypes';
import { useQuizPricing } from '@/hooks/use-quiz-pricing';
import { buildReceiptLines, formatQuotePrice, submitQuizLead, type QuizLeadPayload } from './submissionService';

const mocks = vi.hoisted(() => ({ insert: vi.fn(), fetch: vi.fn(), log: vi.fn() }));
vi.mock('@/lib/quizTracking', () => ({ IS_PRODUCTION: true }));
vi.mock('@/lib/supabase', () => ({ isSupabaseConfigured: true, supabase: { from: () => ({ insert: mocks.insert }) } }));
vi.mock('@/lib/errorTracking', () => ({ logError: mocks.log }));
beforeEach(() => { sessionStorage.clear(); vi.stubGlobal('fetch', mocks.fetch); mocks.fetch.mockReset().mockResolvedValue({ ok: true }); mocks.insert.mockReset().mockResolvedValue({ error: null }); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function payload(form: Partial<QuizFormData>, sofas: SofaItem[] = [], mattresses: MattressItem[] = [], extras: UpsellItemConfig[] = []): QuizLeadPayload {
  const data = { ...initialFormData, location: 'Lisboa', ...form };
  const carpets = data.service === 'carpet' ? [{ id: 'rug1', largura: '2,5', comprimento: '3' }] : [];
  const { result } = renderHook(() => useQuizPricing(data, sofas, mattresses, extras, carpets));
  const p: QuizLeadPayload = { ...result.current, name: 'Teste Auditoria', phone: '+351 900 000 000', email: 'audit@example.invalid', photos: [], finalLocation: data.location,
    service: data.service, serviceType: data.serviceType, waterproofingTier: data.waterproofingTier, serviceLabel: data.service,
    serviceTypeLabel: data.serviceType, crmServiceLabel: data.service, detailsSummary: '', priceText: '', message: '',
    sofaItems: sofas, mattressItems: mattresses, carpetItems: carpets, upsellItems: extras, chairQuantity: data.chairQuantity,
    chairWaterproofQty: data.chairWaterproofQty, chairAntiAcaros: data.chairAntiAcaros, hypoallergenic: false, hypoSurcharge: 0, slotLabel: '', description: 'Campainha B & acesso pelo pátio' };
  p.detailsSummary = buildReceiptLines(p).map(l => `${l.qty}x ${l.label}: ${l.total ?? 'Sob orçamento'}`).join('\n');
  p.priceText = formatQuotePrice(p);
  p.message = `Detalhes: ${p.detailsSummary}\nEstimativa: ${p.priceText}\nObservações: ${p.description}`;
  return p;
}

const cases: Array<[string, Partial<QuizFormData>, SofaItem[], MattressItem[], UpsellItemConfig[]]> = [];
const extras: UpsellItemConfig[][] = [[], [{ id: 'mattress-casal', mattressSize: 'casal', qty: 1, price: 69, label: '1x Colchão Casal' }], [{ id: 'carpet', qty: 1, price: 0, label: 'Tapete', carpetItems: [{ id: 'r', largura: '2', comprimento: '4' }] }]];
for (const location of ['Lisboa', 'Barcelos', 'Lagos', 'Monchique']) {
  for (const opt of sofaPrices) for (const serviceType of ['cleaning', 'waterproofing'] as const) for (const waterproofingTier of ['essencial', 'premium'] as const) for (const packEnabled of [false, true]) for (const qty of [1, 2, 9]) for (const extra of extras)
    cases.push([`sofa ${opt.id}/${serviceType}/${waterproofingTier}/${packEnabled}/${qty}/${location}/${extra.length ? extra[0].id : 'none'}`, { service: 'sofa', serviceType, waterproofingTier, location }, [{ sizeId: opt.id, qty, packEnabled }], [], extra]);
  for (const opt of mattressPrices) for (const packEnabled of [false, true]) for (const qty of [1, 2, 9]) for (const extra of extras)
    cases.push([`mattress ${opt.id}/${packEnabled}/${qty}/${location}/${extra.length ? extra[0].id : 'none'}`, { service: 'mattress', serviceType: 'cleaning', location }, [], [{ sizeId: opt.id, qty, packEnabled }], extra]);
  for (const qty of [1, 4, 5, 6, 7, 9, 10, 11]) for (const serviceType of ['cleaning', 'waterproofing'] as const) for (const waterproofingTier of ['essencial', 'premium'] as const) for (const addon of ['none', 'waterproof', 'anti'] as const)
    cases.push([`chairs ${qty}/${serviceType}/${waterproofingTier}/${addon}/${location}`, { service: 'chairs', serviceType, waterproofingTier, chairQuantity: String(qty), chairWaterproofQty: addon === 'waterproof' ? qty : 0, chairAntiAcaros: addon === 'anti', location }, [], [], []]);
  cases.push([`carpet ${location}`, { service: 'carpet', serviceType: 'cleaning', location }, [], [], extras[1]]);
}

describe('quote channel parity: table sizes, tiers, quantities, brackets, extras and travel', () => {
  it.each(cases)('%s', async (_, form, sofas, mattresses, extra) => {
    const p = payload(form, sofas, mattresses, extra);
    await submitQuizLead(p);
    const sent = mocks.fetch.mock.calls[0][1].body as FormData;
    const receipt = JSON.parse(sessionStorage.getItem('kyro_receipt')!);
    const wa = new URL(sessionStorage.getItem('kyro_wa_url')!).searchParams.get('text')!;
    expect(sent.get('message')).toContain(p.message);
    expect(wa).toContain(p.message);
    expect(wa).toContain(p.name);
    expect(wa).toContain(p.phone);
    expect(wa).toContain(p.description);
    expect(sent.get('booking_id')).toBe(receipt.bookingId);
    expect(wa).toContain(receipt.bookingId);
    expect(receipt.lines.reduce((n: number, l: { total: number | null }) => n + (l.total ?? 0), 0)).toBe(p.totalPrice);
    expect(receipt.subtotal - receipt.discountAmount).toBeCloseTo(receipt.total);
    expect(receipt.lines.at(-1).total).toBe(locationPrices[form.location!]);
    expect(mocks.insert.mock.calls[0][0].value).toBe(p.priceText);
    if (p.hasSobOrcamento || p.hasUpsellSobItem) expect(wa).toContain('subtotal conhecido');
  });
});

describe('specific regressions and delivery failures', () => {
  it('3-seat Premium pack uses the approved 30€ override, not the 40€ standalone difference', () => {
    const p = payload({ service: 'sofa', serviceType: 'cleaning', waterproofingTier: 'premium' }, [{ sizeId: '3-lugares', qty: 1, packEnabled: true }]);
    expect(p.calculateServicePrice).toBe(199);
    expect(p.packDiscountActive).toBe(false);
    expect(buildReceiptLines(p)[0].total).toBe(199);
  });
  it('4+ sofa pack never invents a 40€ fixed price', () => {
    const p = payload({ service: 'sofa', serviceType: 'cleaning' }, [{ sizeId: '4+-lugares', qty: 1, packEnabled: true }]);
    expect(p.calculateServicePrice).toBe(0);
    expect(buildReceiptLines(p)[0].total).toBeNull();
  });
  it('keeps dimensions for each carpet in the message', async () => {
    const p = payload({ service: 'carpet', serviceType: 'cleaning' });
    await submitQuizLead(p);
    expect(new URL(sessionStorage.getItem('kyro_wa_url')!).searchParams.get('text')).toContain('2,5 × 3 m');
  });
  it('preserves file contents and filenames in the Formspree request', async () => {
    const p = payload({ service: 'carpet' });
    p.photos = [new File(['sample'], 'teste.jpg', { type: 'image/jpeg' })];
    await submitQuizLead(p);
    expect((mocks.fetch.mock.calls[0][1].body.get('foto_1') as File).name).toBe('teste.jpg');
  });
  it('rejects when CRM returns an error object and Formspree returns HTTP error', async () => {
    mocks.insert.mockResolvedValue({ error: { message: 'denied' } }); mocks.fetch.mockResolvedValue({ ok: false, status: 422 });
    await expect(submitQuizLead(payload({ service: 'carpet' }))).rejects.toThrow('Both');
    expect(sessionStorage.getItem('kyro_receipt')).toBeNull();
  });
  it.each(['crm', 'formspree'])('succeeds when only %s delivers', async channel => {
    if (channel === 'crm') mocks.fetch.mockResolvedValue({ ok: false, status: 500 });
    else mocks.insert.mockResolvedValue({ error: { message: 'denied' } });
    await expect(submitQuizLead(payload({ service: 'carpet' }))).resolves.toBeUndefined();
  });
  it('retries one network failure', async () => {
    mocks.fetch.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ ok: true });
    await submitQuizLead(payload({ service: 'carpet' }));
    expect(mocks.fetch).toHaveBeenCalledTimes(2);
  });
});

it('retains Alcatifa instead of mislabelling it as a rug', async () => {
  const p = payload({ service: 'carpet' }); p.carpetKind = 'alcatifa';
  expect(buildReceiptLines(p)[0].label).toContain('Alcatifa');
});
