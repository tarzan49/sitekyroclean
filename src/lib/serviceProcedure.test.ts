import { describe, expect, it } from 'vitest';
import {
  checkProcedure, factsFromTitle, procedureAccountDelta, procedureApplies, procedureClientMessage, procedureClosedMessage, procedurePay, procedurePromptMessage,
  procedureReceiptMessage, procedureReminderMessage, procedureStatusChanges, reminderDue, slotForMedia,
  PROCEDURE_PAY_ENABLED, REVIEW_LINKS, type ProcedureRecord,
} from './serviceProcedure';

// Invented data only: the repo is public.
const rec = (over: Partial<ProcedureRecord> = {}): ProcedureRecord => ({
  calendar_event_id: 'ev1', service_request_id: 's1', team: 'Porto 2', service_day: '2026-10-15',
  prompt_msg_ids: ['m1'], prompted_at: '2026-10-15T17:00:00Z',
  before_msg_id: null, before_at: null, after_msg_id: null, after_at: null, video_msg_id: null, video_at: null,
  reminders_sent: 0, last_reminder_at: null, status: 'em_curso', closed_at: null, penalty_paid: false, ...over,
});
const media = { before_msg_id: 'b', before_at: '2026-10-15T17:05:00Z', after_msg_id: 'a', after_at: '2026-10-15T17:05:10Z', video_msg_id: 'v', video_at: '2026-10-15T17:06:00Z' };
const five = { stars: 5, reviewed_at: '2026-10-18T10:00:00Z' };

describe('checkProcedure', () => {
  it('stays open while the 7 days run, whatever is missing', () => {
    const c = checkProcedure(rec(), [], '2026-10-21');
    expect(c.status).toBe('em_curso');
    expect(c.deadline).toBe('2026-10-22');
    expect(c.missing).toEqual(['before', 'after', 'video', 'review']);
    expect(c.pay).toBeNull();
  });

  it('closes at the end of the 7th day with what is missing', () => {
    const c = checkProcedure(rec(media), [], '2026-10-22');
    expect(c.status).toBe('fechado');
    expect(c.missing).toEqual(['review']);
  });

  it('is complete with both photos, the video and a 4-5 star review in time', () => {
    expect(checkProcedure(rec(media), [{ ...five, stars: 4 }], '2026-10-16').status).toBe('completo');
    expect(checkProcedure(rec(media), [{ ...five, stars: 3 }], '2026-10-22').missing).toEqual(['review']);
    expect(checkProcedure(rec(media), [{ ...five, excluded: 'equipa' }], '2026-10-22').missing).toEqual(['review']);
    expect(checkProcedure(rec(media), [{ ...five, reviewed_at: '2026-10-23T09:00:00Z' }], '2026-10-23').missing).toEqual(['review']);
  });

  it('a video sent after the deadline does not count', () => {
    expect(checkProcedure(rec({ ...media, video_at: '2026-10-23T10:00:00Z' }), [five], '2026-10-23').missing).toEqual(['video']);
  });
});

describe('the pay rule lives in one function', () => {
  const all = { before: true, after: true, video: true, review: true };
  it("'review_compensates' (in force): the four = 50% + 5€, a review makes up for missing media, neither = 45%", () => {
    expect(procedurePay(all)).toEqual({ teamShare: 50, bonus: 5 });
    expect(procedurePay({ ...all, review: false })).toEqual({ teamShare: 50, bonus: 0 });
    expect(procedurePay({ ...all, video: false })).toEqual({ teamShare: 50, bonus: 0 });
    expect(procedurePay({ before: false, after: false, video: false, review: true })).toEqual({ teamShare: 50, bonus: 0 });
    expect(procedurePay({ ...all, video: false, review: false })).toEqual({ teamShare: 45, bonus: 0 });
    expect(procedurePay({ ...all, before: false, review: false })).toEqual({ teamShare: 45, bonus: 0 });
  });
  it("'review_in_50': the four = 50%, anything missing = 45%", () => {
    expect(procedurePay(all, 'review_in_50')).toEqual({ teamShare: 50, bonus: 0 });
    expect(procedurePay({ ...all, review: false }, 'review_in_50')).toEqual({ teamShare: 45, bonus: 0 });
    expect(procedurePay({ ...all, video: false }, 'review_in_50')).toEqual({ teamShare: 45, bonus: 0 });
  });
  it("'review_bonus': photos and video = 50%, the review adds 5€, no video = 45%", () => {
    expect(procedurePay(all, 'review_bonus')).toEqual({ teamShare: 50, bonus: 5 });
    expect(procedurePay({ ...all, review: false }, 'review_bonus')).toEqual({ teamShare: 50, bonus: 0 });
    expect(procedurePay({ ...all, video: false, review: false }, 'review_bonus')).toEqual({ teamShare: 45, bonus: 0 });
  });
  it('the accounts get nothing until the owner confirms the rule', () => {
    expect(PROCEDURE_PAY_ENABLED).toBe(false);
    expect(procedureAccountDelta(rec(), [], '2026-10-22', 80).delta).toBe(0);
  });
  it('switched on: 5% of the service when the deadline closes with neither, the 5€ owed to the team when complete', () => {
    expect(procedureAccountDelta(rec(), [], '2026-10-21', 80, true).delta).toBe(0);
    expect(procedureAccountDelta(rec(), [], '2026-10-22', 80, true).delta).toBe(4);
    expect(procedureAccountDelta(rec(media), [], '2026-10-22', 80, true).delta).toBe(0);
    expect(procedureAccountDelta(rec(media), [five], '2026-10-18', 80, true).delta).toBe(-5);
    expect(procedureAccountDelta(rec({ prompted_at: null }), [], '2026-10-22', 80, true).delta).toBe(0);
  });
});

describe('when the procedure counts', () => {
  it('only with the bot message, from 15/10 in Porto and 19/10 in the other teams', () => {
    expect(procedureApplies(rec())).toBe(true);
    expect(procedureApplies(rec({ prompted_at: null }))).toBe(false);
    expect(procedureApplies(rec({ service_day: '2026-10-14' }))).toBe(false);
    expect(procedureApplies(rec({ team: 'Lisboa 1', service_day: '2026-10-18' }))).toBe(false);
    expect(procedureApplies(rec({ team: 'Lisboa 1', service_day: '2026-10-19' }))).toBe(true);
  });
});

describe('photos and video sent in reply', () => {
  it('a caption decides; without one, the first photo is before and the next after', () => {
    expect(slotForMedia(rec(), 'image', 'Depois')).toBe('after');
    expect(slotForMedia(rec(), 'image', 'antes da limpeza')).toBe('before');
    expect(slotForMedia(rec(), 'image', null)).toBe('before');
    expect(slotForMedia(rec({ before_msg_id: 'b' }), 'image', '')).toBe('after');
    expect(slotForMedia(rec(), 'video', 'antes')).toBe('video');
  });
});

describe('messages', () => {
  const noDash = /—|–/;
  it('the service message asks for a reply with the photos and the video and says the next one is for the client', () => {
    const m = procedurePromptMessage({ label: 'Ana, Paranhos', what: 'Limpeza de sofá', team: 'Porto 2', serviceDay: '2026-10-15', time: '15h' });
    expect(m).toContain('Serviço terminado: Ana, Paranhos (Limpeza de sofá), 15/10 às 15h.');
    expect(m).toContain('Responde a esta mensagem com a fotografia de antes, a fotografia de depois e o vídeo.');
    expect(m).toContain('A mensagem a seguir é para mandares ao cliente: reencaminha-a ou copia-a. O prazo para a avaliação é 22/10. Obrigado!');
    expect(m).not.toMatch(noDash);
  });
  it('the client message: first name, the service, the right review link, the owner\'s 10% line', () => {
    const m = procedureClientMessage({ firstName: 'Ana', what: 'Limpeza de sofá de 3 lugares', team: 'Porto 2' });
    expect(m).toBe([
      'Olá Ana, obrigado por nos ter recebido hoje! Esperamos que tenha gostado do resultado do serviço (limpeza de sofá de 3 lugares). Se ficou contente com o trabalho, uma avaliação no Google ajuda-nos muito e ajuda outros clientes a escolher. Demora menos de um minuto:',
      REVIEW_LINKS.porto,
      'Como agradecimento, fica com 10% de desconto no próximo serviço. Obrigado!',
    ].join('\n'));
    expect(m).not.toMatch(noDash);
    const lx = procedureClientMessage({ firstName: null, what: null, team: 'Lisboa 1' });
    expect(lx.startsWith('Olá, obrigado por nos ter recebido hoje! Esperamos que tenha gostado do resultado do serviço.')).toBe(true);
    expect(lx).toContain(REVIEW_LINKS.lisboa);
  });
  it('the closing message says the team share from procedurePay', () => {
    expect(procedureClosedMessage('Ana', '2026-10-15', ['video', 'review'], { teamShare: 45, bonus: 0 }))
      .toBe('O prazo do serviço Ana, 15/10, acabou sem vídeo e avaliação do cliente. O procedimento deste serviço ficou incompleto. Neste serviço a equipa fica com 45%.');
    expect(procedureClosedMessage('Ana', '2026-10-15', ['review'], { teamShare: 50, bonus: 0 })).toContain('a equipa fica com 50%.');
  });
  it('the receipt says what arrived and what is missing', () => {
    expect(procedureReceiptMessage('Ana, Paranhos', ['before', 'after'], { missing: ['video', 'review'], deadline: '2026-10-22' }))
      .toBe('Recebido para Ana, Paranhos: fotografia de antes e fotografia de depois. Falta: vídeo. E a avaliação do cliente até 22/10.');
    expect(procedureReceiptMessage('Ana', ['video'], { missing: ['review'], deadline: '2026-10-22' }))
      .toBe('Recebido para Ana: vídeo. Fotografias e vídeo completos, obrigado. Falta só a avaliação do cliente até 22/10.');
    expect(procedureReceiptMessage('Ana', ['video'], { missing: [], deadline: '2026-10-22' })).toBe('Recebido para Ana: vídeo. Procedimento completo, obrigado!');
  });
  it('the reminder', () => {
    const m = procedureReminderMessage('Ana', { missing: ['video', 'review'], deadline: '2026-10-22' }, '2026-10-15');
    expect(m).toBe('Lembrete do serviço Ana, 15/10. Falta: vídeo e avaliação do cliente. Responde à mensagem desse serviço com o que falta. Se o cliente ainda não avaliou, manda-lhe outra vez o link. Prazo: 22/10.');
    expect(m).not.toMatch(noDash);
  });
});

describe('reminders', () => {
  const open = { missing: ['video' as const], status: 'em_curso' as const };
  it('the day after and on the 5th day, from 10h Lisbon, once each', () => {
    expect(reminderDue(rec(), open, new Date('2026-10-16T08:59:00Z'))).toBeNull(); // 9h59 in Lisbon
    expect(reminderDue(rec(), open, new Date('2026-10-16T09:00:00Z'))).toBe(0);
    expect(reminderDue(rec({ reminders_sent: 1 }), open, new Date('2026-10-17T12:00:00Z'))).toBeNull();
    expect(reminderDue(rec({ reminders_sent: 1 }), open, new Date('2026-10-20T12:00:00Z'))).toBe(1);
    expect(reminderDue(rec({ reminders_sent: 2 }), open, new Date('2026-10-21T12:00:00Z'))).toBeNull();
  });
  it('nothing when complete or closed', () => {
    expect(reminderDue(rec(), { missing: [], status: 'completo' }, new Date('2026-10-16T12:00:00Z'))).toBeNull();
    expect(reminderDue(rec(), { missing: ['video'], status: 'fechado' }, new Date('2026-10-23T12:00:00Z'))).toBeNull();
  });
});

describe('status kept in the table', () => {
  it('only what changed, closed_at kept once set', () => {
    const changes = procedureStatusChanges([rec(), rec({ calendar_event_id: 'ev2', service_request_id: 's2', ...media })],
      [{ ...five, service_request_id: 's2' }], '2026-10-22', '2026-10-23T00:05:00Z');
    expect(changes).toEqual([
      { calendar_event_id: 'ev1', status: 'fechado', closed_at: '2026-10-23T00:05:00Z' },
      { calendar_event_id: 'ev2', status: 'completo', closed_at: '2026-10-23T00:05:00Z' },
    ]);
  });
});

describe('factsFromTitle', () => {
  it('reads the service and the first name of the owner format', () => {
    expect(factsFromTitle('Serviço 45€ (89€) (anúncio) Limpeza de sofá - 912345678 - Ana Teste - Rua Inventada 1, 4000-000 Porto'))
      .toEqual({ what: 'Limpeza de sofá', firstName: 'Ana' });
    expect(factsFromTitle('Serviço 60€ (119€) colchão casal')).toEqual({ what: 'colchão casal', firstName: null });
  });
});

describe('procedureWeeklySummary', () => {
  it('counts per week (Monday) and team, only services with the bot message', async () => {
    const { procedureWeeklySummary } = await import('./serviceProcedure');
    const rows = procedureWeeklySummary([
      rec({ ...media }), rec({ calendar_event_id: 'e2', service_day: '2026-10-18' }), rec({ calendar_event_id: 'e3', prompted_at: null }),
      rec({ calendar_event_id: 'e4', team: 'Porto 1', service_day: '2026-10-20' }),
    ], r => (r.calendar_event_id === 'ev1' ? [five] : []), '2026-10-26');
    expect(rows).toEqual([
      { week: '2026-10-19', team: 'Porto 1', services: 1, media: 0, review: 0, complete: 0, open: 1, closedIncomplete: 0 },
      { week: '2026-10-12', team: 'Porto 2', services: 2, media: 1, review: 1, complete: 1, open: 0, closedIncomplete: 1 },
    ]);
  });
});
