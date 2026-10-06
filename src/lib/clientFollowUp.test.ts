import { describe, expect, it } from 'vitest';
import {
  CLIENT_CONDITION,
  botGuidance,
  campaignRun,
  CAMPAIGNS,
  isQuietTime,
  planAll,
  planClient,
  reviewLinkFor,
  touchResults,
  variantStats,
  waLink,
  type ClientTouch,
  type PlanInput,
} from './clientFollowUp';
import type { ClientRow, ClientService } from './clientRecords';
import { GOOGLE_REVIEW_LINK_LISBOA, GOOGLE_REVIEW_LINK_PORTO } from '../constants/google';

// Dados inventados: o repositório é público.
const PHONE = '351900000001';

const client = (over: Partial<ClientRow> = {}): ClientRow => ({
  id: 'c1',
  phone: PHONE,
  name: null,
  whatsapp_name: 'Maria Teste',
  status: 'por_marcar',
  services: ['Sofá'],
  region: 'Porto',
  from_google_ads: false,
  reviewed_google: false,
  labels: [],
  first_contact_at: '2026-10-06T08:00:00Z',
  last_contact_at: '2026-10-06T09:00:00Z',
  last_client_message_at: '2026-10-06T08:30:00Z',
  notes: null,
  source: 'WhatsApp',
  ...over,
});

const service = (over: Partial<ClientService> = {}): ClientService => ({
  id: 's1',
  request_date: '2026-10-05',
  description: 'Limpeza sofá 3 lugares',
  billed_value: 89,
  client_name: null,
  city: null,
  phone: '+351 900 000 001',
  locality: 'Porto',
  ...over,
});

const touch = (over: Partial<ClientTouch>): ClientTouch => ({
  id: Math.random().toString(36).slice(2),
  client_id: 'c1',
  kind: 'seguimento',
  campaign: null,
  skipped: false,
  note: null,
  created_at: '2026-10-06T13:00:00Z',
  ...over,
});

const plan = (input: Partial<PlanInput>, now: string, today?: string) =>
  planClient({ client: client(), services: [], touches: [], ...input }, { now: new Date(now), today });

const kinds = (actions: { kind: string }[]) => actions.map(a => a.kind);

describe('seguimento de orçamentos (dois e parar)', () => {
  it('sugere o 1.º seguimento 4 horas depois da nossa última mensagem, com o nome', () => {
    const p = plan({}, '2026-10-06T13:00:00Z'); // 14h em Lisboa; a nossa mensagem foi às 10h
    const a = p.today.find(x => x.kind === 'seguimento')!;
    expect(a).toMatchObject({ due: '2026-10-06', notBefore: '14h00', priority: 1, send: 'auto' });
    expect(a.messages.map(m => m.id)).toEqual(['seguimento-preco', 'seguimento-foto']);
    expect(a.messages[0].text).toBe('Maria, ainda temos [dia 1] às [hora 1] ou [dia 2] às [hora 2] para o seu sofá. Como gostaria de avançar?');
    expect(a.messages[1].text).toContain('diga-nos só quantos lugares tem');
    expect(p.stage).toBe('orcamento_aberto');
  });

  it('o 2.º é cerca de 20 horas depois do 1.º e é o último', () => {
    const one = [touch({ created_at: '2026-10-06T13:00:00Z' })];
    const p = plan({ touches: one }, '2026-10-07T10:00:00Z');
    const a = p.today.find(x => x.kind === 'seguimento')!;
    expect(a).toMatchObject({ due: '2026-10-07', notBefore: '10h00', priority: 2 });
    expect(a.messages[0].text).toMatch(/^Bom dia, Maria! Tudo bem\? Só para não perder a vaga/);

    const two = [...one, touch({ created_at: '2026-10-07T09:30:00Z' })];
    const stop = plan({ touches: two }, '2026-10-07T15:00:00Z');
    expect(kinds(stop.today)).not.toContain('seguimento');
    expect(stop.blocked.find(b => b.kind === 'seguimento')?.reason).toBe('Já levou 2 seguimentos sem resposta: parar.');
  });

  it('para ao fim de 3 dias sem resposta', () => {
    const p = plan({ client: client({ last_client_message_at: '2026-10-01T10:00:00Z', last_contact_at: '2026-10-01T11:00:00Z' }) }, '2026-10-06T10:00:00Z');
    expect(p.today).toEqual([]);
    expect(p.blocked[0].reason).toMatch(/^Sem resposta há 5 dias/);
    expect(p.stage).toBe('orcamento_parado');
  });

  it('empurra para as 9h30 do dia seguinte o que calharia de noite', () => {
    const c = client({ last_client_message_at: '2026-10-06T16:30:00Z', last_contact_at: '2026-10-06T18:00:00Z' }); // 19h em Lisboa
    const p = plan({ client: c }, '2026-10-06T21:00:00Z');
    expect(p.today).toEqual([]);
    expect(p.soon[0]).toMatchObject({ kind: 'seguimento', due: '2026-10-07', notBefore: '9h30' });
    expect(isQuietTime(new Date('2026-10-06T21:00:00Z'))).toBe(true);
    expect(isQuietTime(new Date('2026-10-06T09:00:00Z'))).toBe(false);
  });

  it('com data combinada, só nessa data', () => {
    const c = client({ follow_up_at: '2026-11-02', follow_up_reason: 'o sofá novo chega em novembro' });
    expect(plan({ client: c }, '2026-10-06T13:00:00Z').today).toEqual([]);
    const due = plan({ client: c }, '2026-11-02T10:00:00Z');
    expect(due.today[0]).toMatchObject({ kind: 'lembrete', priority: 1 });
    expect(due.today[0].why).toContain('o sofá novo chega em novembro');
  });
});

describe('responder primeiro', () => {
  it('quem escreveu por último passa à frente de tudo e trava o resto', () => {
    const c = client({ last_client_message_at: '2026-10-06T09:00:00Z', last_contact_at: '2026-10-06T09:00:00Z', status: 'cliente' });
    const p = plan({ client: c, services: [service()] }, '2026-10-06T10:00:00Z');
    expect(kinds(p.today)).toEqual(['responder']);
    expect(p.blocked.find(b => b.kind === 'avaliacao')?.reason).toBe('Primeiro responder: escreveu-nos por último.');
  });

  it('um envio registado conta como resposta nossa', () => {
    const c = client({ last_client_message_at: '2026-10-06T09:00:00Z', last_contact_at: '2026-10-06T09:00:00Z' });
    const p = plan({ client: c, touches: [touch({ kind: 'responder', created_at: '2026-10-06T09:10:00Z' })] }, '2026-10-06T10:00:00Z');
    expect(kinds(p.today)).not.toContain('responder');
  });
});

describe('depois do serviço', () => {
  const done = client({ status: 'cliente', last_client_message_at: '2026-10-05T17:00:00Z', last_contact_at: '2026-10-05T18:00:00Z' });

  it('pede a avaliação com o link da ficha da equipa', () => {
    const p = plan({ client: done, services: [service({ locality: 'Lisboa' })] }, '2026-10-06T10:00:00Z');
    const a = p.today.find(x => x.kind === 'avaliacao')!;
    expect(a.send).toBe('auto');
    expect(a.messages.map(m => m.id).sort()).toEqual(['avaliacao-a', 'avaliacao-b']);
    for (const m of a.messages) {
      expect(m.text).toContain(GOOGLE_REVIEW_LINK_LISBOA);
      expect(m.text).not.toContain(GOOGLE_REVIEW_LINK_PORTO);
    }
    expect(a.messages.find(m => m.id === 'avaliacao-b')!.text).toContain('resultado da limpeza do sofá');
    expect(reviewLinkFor('Algarve')).toBe(GOOGLE_REVIEW_LINK_PORTO);
    expect(p.stage).toBe('cliente_recente');
  });

  it('tapete com recolha: só depois da entrega, e com o OK do dono', () => {
    const p = plan({ client: done, services: [service({ description: 'Lavagem tapete 6m2 com recolha' })] }, '2026-10-06T10:00:00Z');
    expect(kinds(p.today)).not.toContain('avaliacao');
    expect(p.soon.find(x => x.kind === 'avaliacao')).toMatchObject({ due: '2026-10-11', send: 'owner_ok' });
  });

  it('um só lembrete, um dia depois, e mais nada', () => {
    const asked = [touch({ kind: 'avaliacao', template: 'avaliacao-a', created_at: '2026-10-05T19:00:00Z' })];
    const p = plan({ client: done, services: [service()], touches: asked }, '2026-10-06T10:00:00Z');
    const r = p.today.find(x => x.kind === 'avaliacao_lembrete')!;
    expect(r.messages[0].text).toMatch(/^Bom dia, Maria! Desculpe voltar a incomodar/);
    const twice = [...asked, touch({ kind: 'avaliacao_lembrete', created_at: '2026-10-06T10:30:00Z' })];
    const after = plan({ client: done, services: [service()], touches: twice }, '2026-10-08T10:00:00Z');
    expect(kinds([...after.today, ...after.soon]).filter(k => k.startsWith('avaliacao'))).toEqual([]);
  });

  it('quem já avaliou recebe, uma vez, o pedido de recomendação, que o bot pode enviar sozinho', () => {
    const c = client({ status: 'cliente', reviewed_google: true, last_client_message_at: '2026-09-27T10:00:00Z', last_contact_at: '2026-09-27T10:05:00Z' });
    const p = plan({ client: c, services: [service({ request_date: '2026-09-26' })] }, '2026-10-06T10:00:00Z');
    const a = p.today.find(x => x.kind === 'recomendacao')!;
    expect(a.send).toBe('auto');
    expect(a.messages.find(m => m.id === 'recomendacao-a')!.text).toContain('Muito obrigado pela sua avaliação');
    const asked = plan({ client: c, services: [service({ request_date: '2026-09-26' })], touches: [touch({ kind: 'recomendacao', created_at: '2026-10-01T10:00:00Z' })] }, '2026-10-06T10:00:00Z');
    expect(kinds(asked.today)).not.toContain('recomendacao');
  });
});

describe('manutenção', () => {
  const old = client({ status: 'cliente', last_client_message_at: '2025-10-02T10:00:00Z', last_contact_at: '2025-10-02T11:00:00Z' });
  const mattress = service({ request_date: '2025-10-01', description: 'Limpeza colchão casal' });

  it('lembra no intervalo que o site recomenda, com a condição de cliente na versão A', () => {
    const p = plan({ client: old, services: [mattress] }, '2026-10-06T10:00:00Z');
    const a = p.today.find(x => x.kind === 'manutencao')!;
    expect(a.due).toBe('2026-10-01');
    const versionA = a.messages.find(m => m.id === 'manutencao-a')!.text;
    expect(versionA).toContain('Já passaram cerca de um ano desde que limpámos o seu colchão.');
    expect(versionA).toContain('12 a 18 meses');
    expect(versionA).toContain(CLIENT_CONDITION);
    expect(a.messages.find(m => m.id === 'manutencao-b')!.text).not.toContain(CLIENT_CONDITION);
    expect(p.stage).toBe('manutencao');
  });

  it('uma mensagem comercial de cada vez, com intervalo', () => {
    const p = plan({ client: old, services: [mattress], touches: [touch({ kind: 'campanha', campaign: 'regresso-2026', created_at: '2026-09-26T10:00:00Z' })] }, '2026-10-06T10:00:00Z');
    expect(kinds(p.today)).toEqual([]);
    expect(p.blocked.find(b => b.kind === 'manutencao')?.reason).toMatch(/uma de cada vez, com 45 dias de intervalo/);
  });

  it('respeita quem não quer promoções, quem não quer mensagens e quem tem uma queixa em aberto', () => {
    expect(plan({ client: { ...old, contact_preference: 'sem_promocoes' }, services: [mattress] }, '2026-10-06T10:00:00Z').blocked[0].reason)
      .toBe('Não quer promoções: só mensagens do próprio serviço.');
    const recent = client({ status: 'cliente', last_client_message_at: '2026-10-05T17:00:00Z', last_contact_at: '2026-10-05T18:00:00Z' });
    const stop = plan({ client: { ...recent, contact_preference: 'nao_contactar', contact_note: 'pediu a 06/10' }, services: [service()] }, '2026-10-06T10:00:00Z');
    expect(stop.today).toEqual([]);
    expect(stop.blocked[0].reason).toBe('Pediu para não receber mensagens (pediu a 06/10). Só responder se escrever.');
    expect(stop.stage).toBe('nao_contactar');
    const hold = plan({ client: { ...recent, on_hold_reason: 'mancha voltou, equipa volta dia 9' }, services: [service()] }, '2026-10-06T10:00:00Z');
    expect(hold.blocked[0].reason).toBe('Em pausa: mancha voltou, equipa volta dia 9');
    expect(hold.stage).toBe('em_pausa');
  });
});

describe('serviço marcado', () => {
  const booked = client({ status: 'marcado', last_client_message_at: '2026-10-04T10:00:00Z', last_contact_at: '2026-10-04T10:05:00Z' });

  it('lembra na véspera', () => {
    const p = plan({ client: booked, services: [service({ request_date: '2026-10-07' })] }, '2026-10-06T10:00:00Z');
    const a = p.today.find(x => x.kind === 'vespera')!;
    expect(a.messages[0].text).toBe('Bom dia, Maria! Tudo bem?\n\nSó para lembrar: amanhã às [hora] estamos aí para a limpeza do sofá. Até amanhã');
    expect(p.stage).toBe('marcado');
  });

  it('2 a 5 dias antes, oferece um segundo artigo com o preço de pack do site', () => {
    const p = plan({ client: booked, services: [service({ request_date: '2026-10-10' })] }, '2026-10-06T10:00:00Z');
    const a = p.today.find(x => x.kind === 'mesma_visita')!;
    expect(a.messages[0].text).toContain('Para sábado (dia 10) está tudo combinado para a limpeza do sofá.');
    expect(a.messages[0].text).toContain('o de casal, por exemplo, fica por 55€ em vez de 69€');
    // Abaixo do mínimo do preço de pack não se promete nada.
    const small = plan({ client: booked, services: [service({ request_date: '2026-10-10', description: 'Limpeza 1 cadeira', billed_value: 30 })] }, '2026-10-06T10:00:00Z');
    expect(kinds(small.today)).not.toContain('mesma_visita');
  });
});

describe('campanhas', () => {
  it('a edição em curso ou a próxima, com o ano no identificador', () => {
    const natal = CAMPAIGNS.find(c => c.id === 'natal')!;
    expect(campaignRun(natal, '2026-12-05')).toMatchObject({ id: 'natal-2026', active: true });
    expect(campaignRun(natal, '2026-12-20')).toMatchObject({ id: 'natal-2027', start: '2027-12-01', active: false });
  });

  it('clientes antigos recebem a condição de cliente; não interessados só 90 dias depois; nunca duas vezes', () => {
    const now = '2026-12-05T10:00:00Z';
    const old = client({ status: 'cliente', last_client_message_at: '2026-08-21T10:00:00Z', last_contact_at: '2026-08-21T11:00:00Z' });
    const p = plan({ client: old, services: [service({ request_date: '2026-08-20' })] }, now);
    const a = p.today.find(x => x.kind === 'campanha')!;
    expect(a).toMatchObject({ campaignId: 'natal-2026', send: 'owner_ok' });
    expect(a.messages[0].text).toContain(`Como já é nosso cliente, se quiser voltar a limpar o sofá, ${CLIENT_CONDITION}.`);

    const no = client({ status: 'nao_interessado', last_client_message_at: '2026-11-20T10:00:00Z', last_contact_at: '2026-11-20T10:05:00Z' });
    expect(plan({ client: no }, now).blocked[0].reason).toBe('Disse que não há 15 dias: esperar 90.');

    const sent = plan({ client: old, services: [service({ request_date: '2026-08-20' })], touches: [touch({ kind: 'campanha', campaign: 'natal-2026', created_at: '2026-12-02T10:00:00Z' })] }, now);
    expect(kinds(sent.today)).not.toContain('campanha');
  });

  it('a Black Friday diz até quando é', () => {
    const old = client({ status: 'cliente', last_client_message_at: '2026-08-21T10:00:00Z', last_contact_at: '2026-08-21T11:00:00Z' });
    const p = plan({ client: old, services: [service({ request_date: '2026-08-20' })] }, '2026-11-23T10:00:00Z');
    expect(p.today[0].messages[0].text).toContain('quem marcar até segunda (dia 30)');
  });
});

describe('aprender com os resultados', () => {
  it('com envios suficientes das duas versões, sugere primeiro a que resultou mais', () => {
    const c = client({ status: 'cliente', last_client_message_at: '2026-10-05T17:00:00Z', last_contact_at: '2026-10-05T18:00:00Z' });
    const input = { client: c, services: [service()], touches: [] };
    const now = new Date('2026-10-06T10:00:00Z');
    const bWins = { 'avaliacao-a': { sent: 10, won: 2 }, 'avaliacao-b': { sent: 10, won: 6 } };
    expect(planClient(input, { now, variantStats: bWins }).today[0].messages[0].id).toBe('avaliacao-b');
    const aWins = { 'avaliacao-a': { sent: 10, won: 7 }, 'avaliacao-b': { sent: 10, won: 6 } };
    expect(planClient(input, { now, variantStats: aWins }).today[0].messages[0].id).toBe('avaliacao-a');
  });

  it('conta resultados por versão e por tipo, ligando o CRM pelo telefone', () => {
    const c = client({ status: 'cliente', reviewed_google: true, last_client_message_at: '2026-09-21T10:00:00Z' });
    const touches = [
      touch({ kind: 'avaliacao', template: 'avaliacao-b', created_at: '2026-09-15T10:00:00Z' }),
      touch({ kind: 'manutencao', template: 'manutencao-a', created_at: '2026-09-16T10:00:00Z' }),
    ];
    const services = [service({ request_date: '2026-09-25', booked_at: '2026-09-20T10:00:00Z', billed_value: 120 })];
    const stats = variantStats([{ client: c, services, touches }], new Date('2026-10-06T10:00:00Z'));
    expect(stats).toEqual({ 'avaliacao-b': { sent: 1, won: 1 }, 'manutencao-a': { sent: 1, won: 1 } });
    const results = touchResults([{ client: c, services, touches }], '2026-09-01', '2026-10-06T09:00:00Z');
    expect(results.find(r => r.kind === 'manutencao')).toMatchObject({ sent: 1, known: 1, replied: 1, booked: 1, billed: 120 });

    const planned = planAll({ clients: [c], services, touches }, { now: new Date('2026-10-06T10:00:00Z') });
    expect(planned[0].services).toHaveLength(1);
    expect(botGuidance(planned[0], '2026-10-06').join(' ')).toContain('Já é cliente (1 serviço)');
  });
});

describe('ligações', () => {
  it('abre o WhatsApp com a mensagem já escrita', () => {
    expect(waLink('+351 900 000 001', 'Olá & até já')).toBe('https://wa.me/351900000001?text=Ol%C3%A1%20%26%20at%C3%A9%20j%C3%A1');
    expect(waLink('00351900000001')).toBe('https://wa.me/351900000001');
  });
});
