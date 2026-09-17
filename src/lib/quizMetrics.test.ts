import { describe, expect, it } from 'vitest';
import { classifyMetrics, fetchAllRows, type MetricEvent } from './quizMetrics';
const e = (id: string, action: string, step: number, session_id = 'legacy', value: number | null = null, page_path = '/'): MetricEvent => ({ id, action, step, session_id, value, page_path });
describe('metrics integrity', () => {
  it('never counts quantity progression or contact clicks as submissions', () => {
    const s = classifyMetrics([e('a','start',0), e('b','complete',3), e('c','complete',4), e('d','whatsapp_click',0), e('f','session_time',0,'legacy',10)]);
    expect(s.completes).toHaveLength(1); expect(s.completionRate).toBe(100);
    expect(s.dropoff.every(x => x.reached === 0)).toBe(true); expect(s.legacy).toBe(true);
  });
  it('deduplicates attempts and events, excludes admin, permits skipped steps and matches the weekly cohort', () => {
    const s = classifyMetrics([e('a','start',-1,'v2:q:1'),e('b','start',3,'v2:q:1'),e('b','start',3,'v2:q:1'),e('c','complete',4,'v2:q:1'),e('d','complete',4,'v2:q:1'),e('e','complete',4,'v2:q:older'),e('f','start',-1,'v2:q:admin',null,'/admin/panel')]);
    expect(s.starts).toHaveLength(1); expect(s.completes).toHaveLength(2); expect(s.completionRate).toBe(100);
    // Saltou o passo 2 (quiz aberto já preenchido) mas chegou ao 3: conta como passado.
    expect(s.dropoff.map(d => d.reached)).toEqual([1, 1, 1, 1, 1, 0]);
    expect(s.dropoff.every(d => d.dropped === 0)).toBe(true);
  });
  it('places each attempt at the furthest step it reached and counts only the ones without a submission', () => {
    const s = classifyMetrics([
      // Abriu e saiu sem ver passo nenhum.
      e('a1','start',-1,'v2:q:a'),
      // Parou nas quantidades; a linha `abandon` confirma onde, não decide o abandono.
      e('b1','start',-1,'v2:q:b'),e('b2','start',0,'v2:q:b'),e('b3','start',3,'v2:q:b'),e('b4','abandon',3,'v2:q:b'),
      // Saiu, voltou e saiu outra vez: duas linhas `abandon`, uma só tentativa.
      e('c1','start',-1,'v2:q:c'),e('c2','start',0,'v2:q:c'),e('c3','abandon',0,'v2:q:c'),e('c4','start',3,'v2:q:c'),e('c5','abandon',3,'v2:q:c'),
      // Chegou ao contacto e submeteu: não desistiu em lado nenhum.
      e('d1','start',-1,'v2:q:d'),e('d2','start',4,'v2:q:d'),e('d3','complete',4,'v2:q:d'),
    ]);
    expect([s.attemptsTotal, s.attemptsCompleted, s.attemptsAbandoned]).toEqual([4, 1, 3]);
    expect(s.dropoff.map(d => d.reached)).toEqual([4, 3, 3, 3, 3, 1]);
    expect(s.dropoff.map(d => d.dropped)).toEqual([1, 0, 0, 0, 2, 0]);
    // Desistiram + concluíram fecha no total de aberturas: sem diferença por explicar.
    expect(s.dropoff.reduce((n, d) => n + d.dropped, 0) + s.attemptsCompleted).toBe(s.attemptsTotal);
    expect(s.dropoff[4].dropRate).toBeCloseTo(66.7, 1);
  });
  it('sums active time deltas and takes the maximum old cumulative duration', () => {
    const s = classifyMetrics([e('a','session_time',0,'old',10),e('b','session_time',0,'old',20),e('c','session_time',0,'v2:visit',15),e('d','session_time',0,'v2:visit',15)]);
    expect(s.avgSessionSeconds).toBe(25);
  });
  it('reads beyond 1000 rows even when the server applies a smaller page cap', async () => {
    const data = Array.from({length:1257},(_,id)=>id);
    expect(await fetchAllRows(async from=>({data:data.slice(from,from+100),error:null,count:data.length}))).toEqual(data);
  });
  it('does not present partial results after a page fails', async () => {
    await expect(fetchAllRows(async from=>from?{data:null,error:new Error('denied')}:{data:[1],error:null,count:2})).rejects.toThrow('denied');
  });
});
