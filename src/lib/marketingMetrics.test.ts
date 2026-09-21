import { describe, expect, it } from 'vitest';
import {
  buildOfflineConversionsCsv, costMetrics, countFunnel, countPaidSessions, coverage,
  groupByCampaign, groupByChannel, groupByLandingPage, joinLeads, maxRankReached,
  observedOnly, offlineCandidates, paidOnly, rate, STATUS_RANK, UNKNOWN,
  type AttributionRow, type ConversionExportRow, type LeadRow, type SessionEventRow, type StatusHistoryRow,
} from './marketingMetrics';

const lead = (over: Partial<LeadRow> & { id: string }): LeadRow => ({
  created_at: '2026-09-10T10:00:00.000Z', lead_id: `L-${over.id}`, service: 'Sofás', location: 'Lisboa',
  source: 'Website', funnel_status: 'NEW', quoted_value: null, booked_value: null,
  final_revenue: null, amount_received: null, payment_received_at: null, completed_at: null, ...over,
});

const attribution = (over: Partial<AttributionRow> & { lead_id: string }): AttributionRow => ({
  lead_row_id: null, channel: 'form',
  first_source: null, first_medium: null, first_campaign: null, first_landing_page: null, first_seen_at: null,
  last_source: null, last_medium: null, last_campaign: null, last_landing_page: null, last_seen_at: null,
  gclid: null, gbraid: null, wbraid: null,
  campaign_id: null, ad_group_id: null, keyword: null, match_type: null, creative_id: null, ads_device: null, network: null,
  referrer: null, referrer_source: null, landing_page: null, conversion_page: null,
  is_paid: false, ga_client_id: null, ...over,
});

const event = (over: Partial<SessionEventRow> & { session_id: string; action: string }): SessionEventRow => ({
  created_at: '2026-09-10T10:00:00.000Z', page_path: '/limpeza-sofas-lisboa', landing_page: '/limpeza-sofas-lisboa',
  is_paid: false, campaign_id: null, ...over,
});

const history = (over: Partial<StatusHistoryRow> & { new_status: string }): StatusHistoryRow => ({
  lead_row_id: null, lead_id: null, previous_status: null, changed_by: 'admin',
  changed_at: '2026-09-11T10:00:00.000Z', note: null, ...over,
});

describe('até onde o lead chegou', () => {
  /**
   * O caso que torna todas as taxas mentirosas se for ignorado: um lead que
   * fechou e se perdeu esteve válido antes disso. A contar só pelo estado
   * atual, a taxa de validação subia sempre que se perdia um cliente.
   */
  it('conta o ponto mais alto do histórico, não só o estado atual', () => {
    const perdido = lead({ id: 'a', funnel_status: 'LOST' });
    const rows = [
      history({ lead_id: 'L-a', new_status: 'VALID' }),
      history({ lead_id: 'L-a', new_status: 'QUALIFIED' }),
      history({ lead_id: 'L-a', new_status: 'LOST' }),
    ];
    expect(maxRankReached(perdido, rows)).toBe(STATUS_RANK.QUALIFIED);

    const counts = countFunnel([perdido], rows);
    expect(counts).toMatchObject({ leads: 1, valid: 1, qualified: 1, bookings: 0, customers: 0, lost: 1 });
  });

  it('sem histórico usa o estado atual, e um estado desconhecido não rebenta', () => {
    expect(maxRankReached(lead({ id: 'b', funnel_status: 'BOOKED' }), [])).toBe(STATUS_RANK.BOOKED);
    expect(maxRankReached(lead({ id: 'c', funnel_status: 'ESTADO_INVENTADO' }), [])).toBe(0);
    expect(maxRankReached(lead({ id: 'd', funnel_status: null }), [])).toBe(0);
  });

  it('não mistura o histórico de um lead com o de outro', () => {
    const rows = [history({ lead_id: 'L-outro', new_status: 'COMPLETED' })];
    expect(maxRankReached(lead({ id: 'e' }), rows)).toBe(STATUS_RANK.NEW);
  });
});

describe('receita', () => {
  /**
   * `quoted_value`, `booked_value`, `final_revenue` e `amount_received` são
   * quatro momentos do mesmo dinheiro. Somá-los conta o mesmo serviço até
   * quatro vezes.
   */
  it('nunca soma orçamentado, marcado, faturado e recebido', () => {
    const counts = countFunnel([
      lead({ id: 'a', funnel_status: 'COMPLETED', quoted_value: 100, booked_value: 100, final_revenue: 100, amount_received: 100 }),
    ], []);
    expect(counts.revenueBilled).toBe(100);
    expect(counts.revenueReceived).toBe(100);
    expect(counts.bookedValueTotal).toBe(100);
    // Um serviço de 100€ não são 400€.
    expect(counts.revenueBilled).not.toBe(400);
  });

  it('separa faturado de recebido: um orçamento aceite não é dinheiro em conta', () => {
    const counts = countFunnel([
      lead({ id: 'a', funnel_status: 'COMPLETED', final_revenue: 120, amount_received: 120 }),
      lead({ id: 'b', funnel_status: 'COMPLETED', final_revenue: 90, amount_received: null }),
      lead({ id: 'c', funnel_status: 'BOOKED', booked_value: 80 }),
    ], []);
    expect(counts.customers).toBe(2);
    expect(counts.revenueBilled).toBe(210);
    expect(counts.revenueReceived).toBe(120);   // um ainda não pagou
    expect(counts.bookedValueTotal).toBe(80);   // e este nem serviço teve ainda
    expect(counts.billedKnownCount).toBe(2);
  });

  it('não conta um valor marcado como se fosse faturado', () => {
    const counts = countFunnel([lead({ id: 'a', funnel_status: 'BOOKED', booked_value: 150 })], []);
    expect(counts.revenueBilled).toBe(0);
    expect(counts.bookedValueTotal).toBe(150);
  });
});

describe('leads não são mudanças de estado', () => {
  /** Nove linhas de histórico do mesmo lead continuam a ser um lead. */
  it('conta cada lead uma vez, por mais estados que tenha passado', () => {
    const l = lead({ id: 'a', lead_id: 'L-a', funnel_status: 'COMPLETED' });
    const rows = ['NEW', 'VALID', 'QUALIFIED', 'QUOTED', 'BOOKED', 'COMPLETED']
      .map(status => history({ lead_id: 'L-a', new_status: status }));
    const counts = countFunnel([l], rows);
    expect(counts.leads).toBe(1);
    expect(counts.customers).toBe(1);
    expect(counts.valid).toBe(1);
  });
});

describe('cobertura da medição', () => {
  /**
   * O número que impede o resto do painel de ser lido como se fosse o total.
   * Um lead sem atribuição — quem recusou cookies — continua a contar como
   * lead operacional e não conta como observado.
   */
  it('separa leads operacionais de leads observados', () => {
    const leads = [lead({ id: 'a', lead_id: 'L-a' }), lead({ id: 'b', lead_id: 'L-b' }), lead({ id: 'c', lead_id: 'L-c' })];
    const joined = joinLeads(leads, [attribution({ lead_id: 'L-a' })], []);
    const c = coverage(joined);
    expect(c.operationalLeads).toBe(3);
    expect(c.observedLeads).toBe(1);
    expect(c.unobservedLeads).toBe(2);
    expect(c.observedShare).toBeCloseTo(1 / 3);
    expect(observedOnly(joined)).toHaveLength(1);
  });
});

describe('custo e ROAS', () => {
  /** A exigência explícita: sem gasto importado, nada de números inventados. */
  const spend = (over: Partial<import('./marketingMetrics').AdSpendRow> = {}) => ({
    campaign_id: '1', cost: 150, currency: 'EUR',
    periodStart: '2026-09-01', periodEnd: '2026-09-30', dateBasis: 'click' as const, ...over,
  });

  it('devolve null em todas as métricas de custo quando o gasto não está ligado', () => {
    const funnel = countFunnel([lead({ id: 'a', funnel_status: 'COMPLETED', final_revenue: 300 })], []);
    for (const metrics of [costMetrics(null, funnel), costMetrics([], funnel)]) {
      expect(metrics).toMatchObject({ cost: null, cpl: null, cpa: null, cac: null, roas: null });
      expect(metrics.unavailableReason).toBe('Dados de custo não ligados.');
    }
  });

  it('calcula CPL, CPA, CAC e ROAS quando há gasto', () => {
    const leads = [
      lead({ id: 'a', funnel_status: 'COMPLETED', final_revenue: 300 }),
      lead({ id: 'b', funnel_status: 'BOOKED' }),
      lead({ id: 'c', funnel_status: 'NEW' }),
    ];
    const metrics = costMetrics([spend()], countFunnel(leads, []));
    expect(metrics.cost).toBe(150);
    expect(metrics.cpl).toBe(50);       // 150 / 3 leads
    expect(metrics.cpa).toBe(75);       // 150 / 2 marcações
    expect(metrics.cac).toBe(150);      // 150 / 1 cliente
    expect(metrics.roas).toBe(2);       // 300 faturados / 150
    expect(metrics.unavailableReason).toBeNull();
    // A base temporal é sempre anunciada, porque custo, lead e serviço vivem
    // em calendários diferentes.
    expect(metrics.warnings.join(' ')).toContain('data do clique');
  });

  /** O ROAS mede a campanha; o atraso de um pagamento não é culpa do anúncio. */
  it('calcula ROAS sobre o faturado, não sobre o recebido', () => {
    const leads = [lead({ id: 'a', funnel_status: 'COMPLETED', final_revenue: 300, amount_received: 0 })];
    expect(costMetrics([spend()], countFunnel(leads, [])).roas).toBe(2);
  });

  it('recusa comparar moedas diferentes em vez de somar números incompatíveis', () => {
    const funnel = countFunnel([lead({ id: 'a', funnel_status: 'COMPLETED', final_revenue: 300 })], []);
    const metrics = costMetrics([spend(), spend({ currency: 'USD' })], funnel);
    expect(metrics.cost).toBeNull();
    expect(metrics.unavailableReason).toContain('moedas');
  });

  it('avisa quando o período do gasto não cobre o período dos leads', () => {
    const funnel = countFunnel([lead({ id: 'a', funnel_status: 'COMPLETED', final_revenue: 300 })], []);
    const metrics = costMetrics([spend({ periodStart: '2026-09-10', periodEnd: '2026-09-20' })], funnel,
      { leadPeriodStart: '2026-09-01', leadPeriodEnd: '2026-09-30' });
    expect(metrics.warnings.join(' ')).toContain('não cobre');
  });

  it('não divide por zero em lado nenhum', () => {
    const metrics = costMetrics([spend({ cost: 100 })], countFunnel([], []));
    expect(metrics).toMatchObject({ cpl: null, cpa: null, cac: null, roas: null });
    expect(rate(3, 0)).toBeNull();
    expect(rate(0, 3)).toBe(0);
  });
});

describe('ligação entre lead e atribuição', () => {
  it('liga por lead_id e, em falta, pelo id da linha', () => {
    const leads = [lead({ id: 'row-1', lead_id: 'L-1' }), lead({ id: 'row-2', lead_id: null })];
    const joined = joinLeads(leads, [
      attribution({ lead_id: 'L-1', last_campaign: 'Porto' }),
      attribution({ lead_id: 'L-x', lead_row_id: 'row-2', last_campaign: 'Lisboa' }),
    ], []);
    expect(joined[0].attribution?.last_campaign).toBe('Porto');
    expect(joined[1].attribution?.last_campaign).toBe('Lisboa');
  });

  /** Um lead sem origem conhecida não é presumido pago só porque existe. */
  it('mantém o lead sem atribuição e não o conta como pago', () => {
    const joined = joinLeads([lead({ id: 'row-1' })], [], []);
    expect(joined[0].attribution).toBeNull();
    expect(paidOnly(joined)).toHaveLength(0);
  });
});

describe('por campanha', () => {
  it('agrupa por campanha × grupo × palavra-chave e escreve "Não disponível" no que falta', () => {
    const leads = [
      lead({ id: 'a', lead_id: 'L-a', funnel_status: 'COMPLETED', final_revenue: 200 }),
      lead({ id: 'b', lead_id: 'L-b', funnel_status: 'VALID' }),
      lead({ id: 'c', lead_id: 'L-c' }),
    ];
    const attributions = [
      attribution({ lead_id: 'L-a', last_campaign: '221', ad_group_id: '33', keyword: 'limpeza sofas', match_type: 'e', ads_device: 'm', is_paid: true }),
      attribution({ lead_id: 'L-b', last_campaign: '221', ad_group_id: '33', keyword: 'limpeza sofas', match_type: 'e', ads_device: 'm', is_paid: true }),
      attribution({ lead_id: 'L-c', is_paid: false }),
    ];
    const rows = groupByCampaign(joinLeads(leads, attributions, []));
    expect(rows[0]).toMatchObject({ campaign: '221', adGroup: '33', keyword: 'limpeza sofas', leads: 2, valid: 2, customers: 1, revenueBilled: 200 });
    expect(rows[1]).toMatchObject({ campaign: UNKNOWN, keyword: UNKNOWN, leads: 1 });
  });

  /** Um nome de campanha com separadores lá dentro não pode juntar duas linhas. */
  it('não confunde campanhas cujo nome contém o separador', () => {
    const leads = [lead({ id: 'a', lead_id: 'L-a' }), lead({ id: 'b', lead_id: 'L-b' })];
    const rows = groupByCampaign(joinLeads(leads, [
      attribution({ lead_id: 'L-a', last_campaign: 'A', ad_group_id: 'B|C' }),
      attribution({ lead_id: 'L-b', last_campaign: 'A|B', ad_group_id: 'C' }),
    ], []));
    expect(rows).toHaveLength(2);
  });
});

describe('por landing page', () => {
  it('conta sessões, não eventos, e divide leads por sessões', () => {
    const events = [
      event({ session_id: 's1', action: 'page_view' }),
      event({ session_id: 's1', action: 'page_view', page_path: '/packs', landing_page: '/limpeza-sofas-lisboa' }),
      event({ session_id: 's1', action: 'whatsapp_click' }),
      event({ session_id: 's2', action: 'page_view' }),
      event({ session_id: 's3', action: 'page_view', page_path: '/limpeza-sofas-porto', landing_page: '/limpeza-sofas-porto' }),
      event({ session_id: 's4', action: 'page_view' }),
    ];
    const joined = joinLeads([lead({ id: 'a', lead_id: 'L-a' })], [attribution({ lead_id: 'L-a', landing_page: '/limpeza-sofas-lisboa' })], []);
    const rows = groupByLandingPage(joined, events);
    const lisboa = rows.find(row => row.path === '/limpeza-sofas-lisboa')!;
    // Três sessões entraram por Lisboa, apesar de haver quatro eventos lá.
    expect(lisboa.sessions).toBe(3);
    expect(lisboa.ctaClicks).toBe(1);
    expect(lisboa.observedLeads).toBe(1);
    expect(lisboa.observedConversionRate).toBeCloseTo(1 / 3);
    expect(rows.find(row => row.path === '/limpeza-sofas-porto')!.observedConversionRate).toBe(0);
  });

  /**
   * O erro que o utilizador pediu explicitamente para não cometer: dividir
   * todos os leads operacionais pelas sessões consentidas. As duas pontas da
   * divisão têm de vir da mesma população.
   */
  it('não mistura leads sem atribuição no numerador de uma taxa por sessão', () => {
    const events = [event({ session_id: 's1', action: 'page_view' })];
    const leads = [
      lead({ id: 'a', lead_id: 'L-a' }),   // observado
      lead({ id: 'b', lead_id: 'L-b' }),   // recusou cookies: sem atribuição
      lead({ id: 'c', lead_id: 'L-c' }),
    ];
    const joined = joinLeads(leads, [attribution({ lead_id: 'L-a', landing_page: '/limpeza-sofas-lisboa' })], []);
    const row = groupByLandingPage(joined, events).find(r => r.path === '/limpeza-sofas-lisboa')!;
    expect(row.sessions).toBe(1);
    expect(row.observedLeads).toBe(1);
    // 1/1 e não 3/1, que daria uma conversão de 300%.
    expect(row.observedConversionRate).toBe(1);
  });
});

describe('por canal', () => {
  /** A linha que não se pode cruzar: um clique no WhatsApp nunca é um cliente. */
  it('mantém cliques e leads em colunas separadas', () => {
    const events = [
      event({ session_id: 's1', action: 'whatsapp_click' }),
      event({ session_id: 's2', action: 'whatsapp_click' }),
      event({ session_id: 's3', action: 'call_click' }),
    ];
    const joined = joinLeads([lead({ id: 'a', lead_id: 'L-a', funnel_status: 'COMPLETED', completed_at: '2026-09-15T14:30:00Z' })], [attribution({ lead_id: 'L-a', channel: 'form' })], []);
    const rows = groupByChannel(joined, events);
    const whatsapp = rows.find(row => row.channel === 'whatsapp')!;
    expect(whatsapp.clicks).toBe(2);
    expect(whatsapp.leads).toBe(0);
    expect(whatsapp.customers).toBe(0);
    expect(rows.find(row => row.channel === 'phone')!.clicks).toBe(1);
    // O formulário não tem cliques equivalentes: `null` e não `0`, que se leria
    // como "houve zero cliques" em vez de "não se mede assim".
    expect(rows.find(row => row.channel === 'form')!).toMatchObject({ clicks: null, leads: 1, customers: 1 });
  });

  it('conta contactos confirmados à parte dos cliques, sem os deduzir deles', () => {
    const events = [event({ session_id: 's1', action: 'whatsapp_click' }), event({ session_id: 's2', action: 'whatsapp_click' })];
    const contacts = [{ id: 'c1', occurred_at: '2026-09-12T10:00:00.000Z', channel: 'whatsapp', direction: 'inbound', lead_row_id: null, note: 'Conversa real', logged_by: 'admin' }];
    const whatsapp = groupByChannel([], events, contacts).find(row => row.channel === 'whatsapp')!;
    expect(whatsapp.clicks).toBe(2);
    expect(whatsapp.confirmedContacts).toBe(1);  // dois cliques, uma conversa a sério
    expect(whatsapp.leads).toBe(0);
    expect(whatsapp.measurable).toContain('fora');
  });
});

describe('sessões pagas', () => {
  it('conta sessões distintas, não eventos', () => {
    expect(countPaidSessions([
      event({ session_id: 's1', action: 'page_view', is_paid: true }),
      event({ session_id: 's1', action: 'whatsapp_click', is_paid: true }),
      event({ session_id: 's2', action: 'page_view', is_paid: false }),
    ])).toBe(1);
  });
});

describe('conversões offline para o Google Ads', () => {
  const noExports: ConversionExportRow[] = [];

  it('só é candidato quem chegou ao estado pedido E tem identificador de clique', () => {
    const leads = [
      lead({ id: 'a', lead_id: 'L-a', funnel_status: 'COMPLETED', final_revenue: 149.5, completed_at: '2026-09-15T14:30:00.000Z' }),
      lead({ id: 'b', lead_id: 'L-b', funnel_status: 'COMPLETED', final_revenue: 90 }),  // sem gclid
      lead({ id: 'c', lead_id: 'L-c', funnel_status: 'NEW' }),                            // ainda não é cliente
    ];
    const attributions = [
      attribution({ lead_id: 'L-a', gclid: 'CjABCDEF', is_paid: true }),
      attribution({ lead_id: 'L-b', is_paid: false }),
      attribution({ lead_id: 'L-c', gclid: 'CjZZZZ', is_paid: true }),
    ];
    const candidates = offlineCandidates(joinLeads(leads, attributions, []), noExports,
      { conversionAction: 'Cliente Kyro', minRank: STATUS_RANK.COMPLETED });
    expect(candidates.map(c => c.lead_id)).toEqual(['L-a']);
  });

  /** Exportar duas vezes a mesma conversão importa-a duas vezes no Google Ads. */
  it('exclui quem já foi exportado para aquela ação', () => {
    const joined = joinLeads(
      [lead({ id: 'a', lead_id: 'L-a', funnel_status: 'COMPLETED', completed_at: '2026-09-15T14:30:00Z' })],
      [attribution({ lead_id: 'L-a', gclid: 'Cj1', is_paid: true })], []);
    const exported: ConversionExportRow[] = [{
      id: 'x', lead_id: 'L-a', conversion_action: 'Cliente', click_id: 'Cj1',
      conversion_time: '2026-09-15T00:00:00.000Z', value: null, currency: 'EUR',
      status: 'exported', exported_at: '2026-09-16T00:00:00.000Z', submitted_at: null, resolved_at: null,
    }];
    expect(offlineCandidates(joined, exported, { conversionAction: 'Cliente', minRank: STATUS_RANK.COMPLETED })).toHaveLength(0);
    // ... mas continua elegível para uma ação diferente.
    expect(offlineCandidates(joined, exported, { conversionAction: 'Lead qualificado', minRank: STATUS_RANK.QUALIFIED })).toHaveLength(0); // Sem data de qualificação, não se inventa.
  });

  it('reserva BRAID para Data Manager, não o escreve na coluna GCLID', () => {
    const joined = joinLeads(
      [lead({ id: 'a', lead_id: 'L-a', funnel_status: 'COMPLETED', completed_at: '2026-09-15T14:30:00Z' })],
      [attribution({ lead_id: 'L-a', gbraid: 'GB123', is_paid: true })], []);
    const candidates = offlineCandidates(joined, noExports, { conversionAction: 'X', minRank: STATUS_RANK.COMPLETED });
    expect(candidates).toHaveLength(0);
  });

  it('escreve o CSV no formato que a Google aceita, com o NOME da ação', () => {
    const csv = buildOfflineConversionsCsv([{
      lead_id: 'L-a', lead_row_id: 'a', click_id: 'CjABCDEF',
      conversion_time: '2026-09-15T14:30:00.000Z', value: 149.5,
    }], { conversionAction: 'Cliente Kyro' });
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Parameters:TimeZone=UTC');
    expect(lines[1]).toBe('Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency');
    // Formato de data da Google: sem "T" e sem "Z". Um "T" rejeita o ficheiro todo.
    expect(lines[2]).toBe('CjABCDEF,Cliente Kyro,2026-09-15 14:30:00,149.5,EUR');
  });
});


describe('datas reais e CSV offline', () => {
  it('usa a primeira qualificação documentada, nunca a criação nem o orçamento como receita', () => {
    const l = lead({id:'dated',funnel_status:'BOOKED',quoted_value:999});
    const h = [history({lead_id:'L-dated',new_status:'QUALIFIED',changed_at:'2026-09-12T09:00:00Z'}),history({lead_id:'L-dated',new_status:'BOOKED',changed_at:'2026-09-13T09:00:00Z'})];
    const joined = joinLeads([l],[attribution({lead_id:'L-dated',gclid:'click'})],h);
    expect(offlineCandidates(joined,[],{conversionAction:'Qualificado',minRank:STATUS_RANK.QUALIFIED,history:h})).toMatchObject([{conversion_time:'2026-09-12T09:00:00Z',value:null}]);
  });
  it('converte a hora para o fuso declarado e escapa nomes com vírgulas', () => {
    const csv = buildOfflineConversionsCsv([{lead_id:'L-a',lead_row_id:'a',click_id:'click',conversion_time:'2026-09-12T09:00:00Z',value:null}],{conversionAction:'Pedido, "válido"',timezone:'Europe/Lisbon'});
    expect(csv).toContain('Parameters:TimeZone=Europe/Lisbon');
    expect(csv).toContain('click,"Pedido, ""válido""",2026-09-12 10:00:00,,EUR');
  });
});
