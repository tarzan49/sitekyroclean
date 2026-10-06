// Serviços do mês (dono, 2026-10-06): para cada serviço, quantas vezes foi
// pedido, quanto dinheiro deu e o ticket médio, para ver o que vale a pena
// investir. Um serviço muito pedido não é forçosamente o que dá mais dinheiro.
// Lê só a descrição da linha do CRM (escrita pelo dono ou tirada do evento).
//
// Serviço = tipo × artigo ("Limpeza de sofá", "Impermeabilização de sofá").
// Uma linha com vários artigos conta como pedido em cada um. O dinheiro dessa
// linha reparte-se pelos artigos em proporção do ticket médio de cada um quando
// é pedido sozinho, para o faturado por serviço somar o faturado do mês. É uma
// estimativa, e a página diz que é.

export const SERVICE_ITEMS = ['Sofá', 'Colchão', 'Tapete', 'Cadeiras', 'Alcatifa', 'Cabeceira', 'Outro'] as const;
export type ServiceItem = (typeof SERVICE_ITEMS)[number];

export type ServiceType = 'Limpeza' | 'Impermeabilização';

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Poltronas, chaises e cadeirões são estofos do mesmo tipo que um sofá.
const ITEM_PATTERNS: [Exclude<ServiceItem, 'Outro'>, RegExp][] = [
  ['Sofá', /\bsofa|poltron|chaise|cadeirao|cadeiroes|\bmaple|\bpuff|\bpufe/],
  ['Colchão', /colch|sommier/],
  ['Tapete', /tapete|carpete/],
  ['Cadeiras', /\bcadeiras?\b/],
  ['Alcatifa', /alcatif/],
  ['Cabeceira', /cabeceira/],
];

export function itemsOf(description: string): ServiceItem[] {
  const d = normalize(description);
  const found = ITEM_PATTERNS.filter(([, re]) => re.test(d)).map(([item]) => item);
  return found.length ? found : ['Outro'];
}

/** A impermeabilização já leva a limpeza, por isso uma linha com as duas conta como impermeabilização. */
export function typeOf(description: string): ServiceType {
  return /impermeabiliz/.test(normalize(description)) ? 'Impermeabilização' : 'Limpeza';
}

const ITEM_NAME: Record<ServiceItem, string> = {
  'Sofá': 'sofá', 'Colchão': 'colchão', 'Tapete': 'tapete', 'Cadeiras': 'cadeiras',
  'Alcatifa': 'alcatifa', 'Cabeceira': 'cabeceira', 'Outro': 'outros',
};

/** "Limpeza de sofá", "Impermeabilização de cadeiras". */
export function servicesOf(description: string): string[] {
  const type = typeOf(description);
  return itemsOf(description).map(i => (i === 'Outro' ? `${type} (outros)` : `${type} de ${ITEM_NAME[i]}`));
}

export interface MixRow {
  billed_value: number;
  my_cut: number;
  description: string;
}

export interface ServiceLine {
  label: string;
  /** Linhas que incluem este serviço; uma linha pode contar em vários. */
  count: number;
  /** Faturado atribuído (linhas sozinhas por inteiro, linhas com vários serviços repartidas). */
  billed: number;
  cut: number;
  /** Faturado atribuído a dividir pelos pedidos. */
  average: number;
  /** Pedidos em que vinha sozinho. */
  alone: number;
  /** 1 = o mais pedido. */
  countRank: number;
  /** 1 = o que deu mais dinheiro. */
  billedRank: number;
}

export interface ServiceMix {
  count: number;
  billed: number;
  cut: number;
  /** Ticket médio: faturado a dividir pelas linhas. */
  average: number;
  /** Ordenado do mais pedido para o menos pedido. */
  services: ServiceLine[];
  /** Linhas com mais de um serviço, cujo dinheiro foi repartido. */
  combined: number;
}

const value = (r: MixRow) => Number(r.billed_value) || 0;
const cutValue = (r: MixRow) => Number(r.my_cut) || 0;

/** Ticket médio de cada serviço quando é pedido sozinho: o peso da repartição. */
function soloAverages(rows: MixRow[]): Map<string, number> {
  const sums = new Map<string, { n: number; total: number }>();
  for (const r of rows) {
    const s = servicesOf(r.description ?? '');
    if (s.length !== 1) continue;
    const acc = sums.get(s[0]) ?? { n: 0, total: 0 };
    acc.n++; acc.total += value(r);
    sums.set(s[0], acc);
  }
  return new Map([...sums].map(([k, v]) => [k, v.total / v.n]));
}

/**
 * @param weightRows linhas usadas para o ticket médio "sozinho" que pesa a repartição;
 *   por omissão as do próprio período. Passar o histórico todo dá pesos mais estáveis.
 */
export function summarizeServiceMix(rows: MixRow[], weightRows: MixRow[] = rows): ServiceMix {
  const weights = soloAverages(weightRows);
  const lines = new Map<string, ServiceLine>();
  let combined = 0;

  for (const r of rows) {
    const services = servicesOf(r.description ?? '');
    if (services.length > 1) combined++;
    // Sem ticket sozinho conhecido, o serviço pesa o mesmo que a média dos outros (ou 1).
    const known = services.map(s => weights.get(s)).filter((w): w is number => w !== undefined && w > 0);
    const fallback = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 1;
    const w = services.map(s => weights.get(s) || fallback);
    const totalW = w.reduce((a, b) => a + b, 0);
    services.forEach((s, i) => {
      const l = lines.get(s) ?? { label: s, count: 0, billed: 0, cut: 0, average: 0, alone: 0, countRank: 0, billedRank: 0 };
      l.count++;
      if (services.length === 1) l.alone++;
      l.billed += value(r) * (w[i] / totalW);
      l.cut += cutValue(r) * (w[i] / totalW);
      lines.set(s, l);
    });
  }

  const services = [...lines.values()].map(l => ({ ...l, average: l.billed / l.count }));
  [...services].sort((a, b) => b.billed - a.billed).forEach((l, i) => { l.billedRank = i + 1; });
  services.sort((a, b) => b.count - a.count || b.billed - a.billed).forEach((l, i) => { l.countRank = i + 1; });

  const count = rows.length;
  const billed = rows.reduce((s, r) => s + value(r), 0);
  return {
    count, billed,
    cut: rows.reduce((s, r) => s + cutValue(r), 0),
    average: count ? billed / count : 0,
    services,
    combined,
  };
}
