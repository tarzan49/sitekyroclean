// O script dos calendários das equipas corre na Google (Apps Script), não no
// site, mas decide para que equipa vai cada serviço com as mesmas regras do
// CRM. Este teste carrega os ficheiros .gs tal como estão e rebenta se as duas
// leituras divergirem. Só dados inventados: o repositório é público.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { CRM_LOCALITIES, localityFromPostalCode, parseServiceEvent, placeIndex } from '@/lib/calendarServices';

const DIR = path.resolve(__dirname, '../../google-apps-script/calendario-equipas');

function lugaresGs(): string {
  const { municipalities, parishes } = placeIndex();
  const lista = (pares: Array<[string, string]>) => pares.map(p => `    ${JSON.stringify(p)},`).join('\n');
  return [
    '// Gerado a partir de src/lib/calendarServices.ts (placeIndex): os concelhos e',
    '// freguesias que o CRM usa para saber a região de um serviço. Não se edita à',
    '// mão. Quando o teste src/lib/teamCalendarScript.test.ts falhar por causa',
    '// deste ficheiro, corre `npx vitest run src/lib/teamCalendarScript.test.ts -u`',
    '// e cola o resultado no ficheiro Lugares do projeto no Apps Script.',
    'var LUGARES = {',
    '  concelhos: [',
    lista(municipalities),
    '  ],',
    '  freguesias: [',
    lista(parishes),
    '  ],',
    '};',
    '',
  ].join('\n');
}

// Só o que as funções de decisão usam da Google: a data num fuso horário.
const Utilities = {
  formatDate: (date: Date, timeZone: string) => new Intl.DateTimeFormat('sv-SE', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).format(date).replace(' ', 'T'),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function carregar(): any {
  const ctx = vm.createContext({ Utilities });
  vm.runInContext(readFileSync(path.join(DIR, 'Lugares.gs'), 'utf8'), ctx);
  vm.runInContext(readFileSync(path.join(DIR, 'Codigo.gs'), 'utf8'), ctx);
  return ctx;
}

const gs = carregar();
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value));

interface Evento {
  id: string;
  summary: string;
  location?: string;
  description?: string;
  status?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
}

const COPENHAGA = 'Europe/Copenhagen';
function evento(id: string, summary: string, inicio = '2026-10-03T15:00:00+02:00', fim = '2026-10-03T16:00:00+02:00'): Evento {
  return { id, summary, status: 'confirmed', start: { dateTime: inicio, timeZone: COPENHAGA }, end: { dateTime: fim, timeZone: COPENHAGA } };
}

// Uma cópia como a Google a devolve depois de a criar.
function copiaGravada(corpo: Evento & { extendedProperties: unknown }, id: string) {
  return { ...plain(corpo), id };
}

const AGORA = Date.parse('2026-09-28T09:00:00Z');

describe('Lugares.gs', () => {
  it('é a lista de concelhos e freguesias do CRM', async () => {
    await expect(lugaresGs()).toMatchFileSnapshot(path.join(DIR, 'Lugares.gs'));
  });
});

describe('região e equipa de cada serviço', () => {
  it('dá a cada código postal a mesma região que o CRM', () => {
    const diferentes: string[] = [];
    for (let n = 1000; n <= 9999; n++) {
      if (gs.regiaoPorCodigoPostal(String(n)) !== localityFromPostalCode(String(n))) diferentes.push(String(n));
    }
    expect(diferentes).toEqual([]);
  });

  const titulos = [
    'Serviço 70€ (140€) Limpeza sofá 3 lugares - +351 910 000 001 - Ana Teste - Rua das Flores 8, 2835-000 Santo António da Charneca',
    'Serviço 45€ (89€) limpeza colchão - +351 910 000 002 - Rui Exemplo - Avenida Central 26\n2700-000 Amadora',
    'Serviço 60€ (120€) Limpeza sofá 4 lugares Montijo - +351 910 000 003 - Marta Fictícia',
    'Serviço 40€ (79€) Limpeza sofá 2 lugares Porto',
    'Serviço 190€ (380€) Impermeabilização de 8 cadeiras Canidelo',
    'Serviço 25€(50€) Limpeza de tapete Quarteira',
    'Serviço 100€(190€) limpeza sofá e colchão braga',
    'Serviço 60€ (119€) limpeza sofá Avenida de Sintra 27 Cascais',
    'Limpeza 50€ (99€) sofá 3 lugares, 4400-000 Vila Nova de Gaia',
    'Serviço 85€ (170€) impermeabilização Olhos de Água Albufeira',
  ];

  it.each(titulos)('encontra a mesma região que o CRM: %s', titulo => {
    const crm = parseServiceEvent({ id: 'x', summary: titulo, description: '', location: '', startDate: '2026-10-03', created: '', updated: '', status: 'confirmed' });
    expect(crm?.locality).toBeTruthy();
    expect(gs.regiaoDoEvento({ summary: titulo })).toBe(crm!.locality);
  });

  it('tem uma equipa para cada região do CRM', () => {
    for (const regiao of CRM_LOCALITIES) expect(gs.equipaDaRegiao(regiao).id).toBe(regiao.toLowerCase());
    expect(gs.equipaDaRegiao(null)).toBeNull();
    // Aveiro e Coimbra (região Porto) e o Alentejo (região Lisboa), como no travel.ts.
    expect(gs.equipaDaRegiao(gs.regiaoDoEvento({ summary: 'Serviço 45€ (89€) sofá, 3800-000 Aveiro' })).id).toBe('porto');
    expect(gs.equipaDaRegiao(gs.regiaoDoEvento({ summary: 'Serviço 45€ (89€) sofá, 7520-000 Sines' })).id).toBe('lisboa');
    expect(gs.equipaDaRegiao(gs.regiaoDoEvento({ summary: 'Serviço 45€ (89€) sofá, 4800-000 Guimarães' })).id).toBe('braga');
    expect(gs.equipaDaRegiao(gs.regiaoDoEvento({ summary: 'Serviço 45€ (89€) sofá, 8600-000 Lagos' })).id).toBe('algarve');
  });

  it('obedece a "equipa X" escrito no evento, antes do código postal', () => {
    expect(gs.regiaoDoEvento({ summary: 'Serviço 60€ (120€) tapete Carvalhosa equipa braga' })).toBe('Braga');
    expect(gs.regiaoDoEvento({ summary: 'Serviço 50€ (99€) sofá, 4000-000 Porto', description: 'Equipa Lisboa' })).toBe('Lisboa');
  });

  it('não confunde o nome da rua com a cidade', () => {
    expect(gs.regiaoDoEvento({ summary: 'Serviço 50€ (99€) sofá - Rua de Braga 12, Almada' })).toBe('Lisboa');
  });

  it('não adivinha quando não há morada', () => {
    expect(gs.regiaoDoEvento({ summary: 'Serviço 70€ (130€) imper cadeiras' })).toBeNull();
  });

  it('reconhece os serviços como o CRM, e também um "Serviço" sem valor', () => {
    expect(gs.ehServico('Serviço 70€ (140€) sofá')).toBe(true);
    expect(gs.ehServico('servico lisboa 1 colchao 69€')).toBe(true);
    expect(gs.ehServico('Limpeza 50€ (99€) Impermeabilização')).toBe(true);
    expect(gs.ehServico('Serviço 1 poltrona, Valongo')).toBe(true);
    expect(gs.ehServico('Limpeza da casa')).toBe(false);
    expect(gs.ehServico('Ligar ao cliente do sofá 89€')).toBe(false);
    expect(gs.ehServico(undefined)).toBe(false);
  });
});

describe('hora da cópia', () => {
  // Dono, 28/09/2026: um serviço às 15:00 no calendário dele (Copenhaga) é às 14:00 em Portugal.
  it('mostra à equipa o mesmo instante na hora de Portugal: uma hora a menos que Copenhaga', () => {
    expect(plain(gs.horaEmPortugal({ dateTime: '2026-09-28T15:00:00+02:00', timeZone: COPENHAGA }))).toEqual({ dateTime: '2026-09-28T14:00:00', timeZone: 'Europe/Lisbon' });
    expect(plain(gs.horaEmPortugal({ dateTime: '2026-11-10T09:30:00+01:00', timeZone: COPENHAGA }))).toEqual({ dateTime: '2026-11-10T08:30:00', timeZone: 'Europe/Lisbon' });
  });

  it('não depende do fuso em que o evento foi criado, e copia dias inteiros', () => {
    // Criado com o calendário em Lisboa, devolvido pela Google em Copenhaga: 12:00+02:00 = 11:00 em Lisboa.
    expect(gs.horaEmPortugal({ dateTime: '2026-07-22T12:00:00+02:00', timeZone: 'Europe/Lisbon' }).dateTime).toBe('2026-07-22T11:00:00');
    expect(gs.horaEmPortugal({ dateTime: '2026-07-22T12:00:00+02:00' }).dateTime).toBe('2026-07-22T11:00:00');
    expect(plain(gs.horaEmPortugal({ date: '2026-10-01' }))).toEqual({ date: '2026-10-01' });
  });

  it('escreve o dia em português', () => {
    expect(gs.quando({ dateTime: '2026-09-27T12:00:00' }, { dateTime: '2026-09-27T13:30:00' })).toBe('domingo, 27/09, das 12:00 às 13:30');
    expect(gs.quando({ date: '2026-09-26' }, { date: '2026-09-27' })).toBe('sábado, 26/09, dia inteiro');
  });
});

describe('o que muda nos calendários das equipas', () => {
  const lisboa = evento('a1', 'Serviço 70€ (140€) sofá - +351 910 000 001 - Ana Teste - Rua X 8, 2835-000 Charneca');
  const porto = evento('b2', 'Serviço 40€ (79€) sofá - +351 910 000 002 - Rui Exemplo - Rua Y 3, 4000-000 Porto');
  const semMorada = evento('c3', 'Serviço 70€ (130€) imper cadeiras');
  const pessoal = evento('d4', 'Jantar');

  function estado(origens: Evento[]) {
    return gs.copiasDesejadas(origens);
  }
  // As cópias que existiriam depois de uma volta com estes eventos.
  function copiasDe(origens: Evento[]) {
    const { copias } = estado(origens);
    return [...copias].map(([origemId, c]: [string, { equipaId: string; corpo: Evento & { extendedProperties: unknown } }]) =>
      ({ equipaId: c.equipaId, origemId, evento: copiaGravada(c.corpo, `copia-${origemId}`) }));
  }
  const resumoDe = (acoes: Array<{ tipo: string; equipaId: string; aviso: string | null }>) => acoes.map(a => `${a.tipo}:${a.equipaId}:${a.aviso}`);

  it('cria cada serviço na equipa certa e deixa de fora o que não é serviço ou não tem equipa', () => {
    const { copias, pendentes } = estado([lisboa, porto, semMorada, pessoal]);
    expect([...copias.keys()]).toEqual(['a1', 'b2']);
    expect(pendentes.map((e: Evento) => e.id)).toEqual(['c3']);
    const acoes = gs.planear(copias, [], AGORA, false);
    expect(resumoDe(acoes)).toEqual(['criar:lisboa:novo', 'criar:porto:novo']);
    // 15:00 no calendário do dono (Copenhaga) = 14:00 em Portugal.
    expect(acoes[0].corpo.start).toEqual({ dateTime: '2026-10-03T14:00:00', timeZone: 'Europe/Lisbon' });
    expect(acoes[0].corpo.summary).toBe(lisboa.summary);
  });

  it('não avisa na primeira volta nem de serviços que já passaram', () => {
    expect(resumoDe(gs.planear(estado([lisboa]).copias, [], AGORA, true))).toEqual(['criar:lisboa:null']);
    const passado = evento('p1', lisboa.summary, '2026-09-27T10:00:00+02:00', '2026-09-27T11:00:00+02:00');
    expect(resumoDe(gs.planear(estado([passado]).copias, [], AGORA, false))).toEqual(['criar:lisboa:null']);
  });

  it('não faz nada quando nada mudou', () => {
    expect(gs.planear(estado([lisboa, porto]).copias, copiasDe([lisboa, porto]), AGORA, false)).toEqual([]);
  });

  it('atualiza a cópia quando o serviço muda, e diz à equipa o que era antes', () => {
    const mudado = evento('a1', lisboa.summary, '2026-10-04T10:00:00+02:00', '2026-10-04T11:00:00+02:00');
    const acoes = gs.planear(estado([mudado]).copias, copiasDe([lisboa]), AGORA, false);
    expect(resumoDe(acoes)).toEqual(['atualizar:lisboa:alterado']);
    const mensagem = gs.mensagemParaEquipa(acoes[0], gs.equipaDaRegiao('Lisboa'));
    expect(mensagem.assunto).toBe('Serviço alterado: domingo, 04/10, das 09:00 às 10:00');
    expect(mensagem.texto).toContain('Antes: sábado, 03/10, das 14:00 às 15:00');
  });

  it('muda o serviço de equipa quando a morada muda de região', () => {
    const mudouParaOPorto = { ...lisboa, summary: lisboa.summary.replace('2835-000 Charneca', '4000-000 Porto') };
    const acoes = gs.planear(estado([mudouParaOPorto]).copias, copiasDe([lisboa]), AGORA, false);
    expect(resumoDe(acoes)).toEqual(['apagar:lisboa:retirado', 'criar:porto:novo']);
  });

  it('apaga a cópia de um serviço cancelado ou que deixou de ser serviço', () => {
    expect(resumoDe(gs.planear(estado([porto]).copias, copiasDe([lisboa, porto]), AGORA, false))).toEqual(['apagar:lisboa:cancelado']);
    const cancelado = { ...lisboa, status: 'cancelled' };
    expect(resumoDe(gs.planear(estado([cancelado]).copias, copiasDe([lisboa]), AGORA, false))).toEqual(['apagar:lisboa:cancelado']);
  });

  it('apaga cópias repetidas sem avisar ninguém', () => {
    const [copia] = copiasDe([lisboa]);
    const repetida = { ...copia, evento: { ...copia.evento, id: 'copia-repetida' } };
    expect(resumoDe(gs.planear(estado([lisboa]).copias, [copia, repetida], AGORA, false))).toEqual(['apagar:lisboa:null']);
  });

  it('escreve à equipa o serviço como está no calendário do dono', () => {
    const [acao] = gs.planear(estado([lisboa]).copias, [], AGORA, false);
    const mensagem = gs.mensagemParaEquipa(acao, gs.equipaDaRegiao('Lisboa'));
    expect(mensagem.assunto).toBe('Novo serviço: sábado, 03/10, das 14:00 às 15:00');
    expect(mensagem.texto).toContain(lisboa.summary);
    expect(mensagem.texto).toContain('Está no calendário "Kyro · Equipa Lisboa".');
  });

  describe('quando o código postal e as listas do site não chegam, procura a morada no Maps', () => {
    // Moradas inventadas, com respostas do Maps inventadas.
    const semCidade = evento('m1', 'Serviço 45€ (89€) Limpeza de sofá - +351 910 000 003 - Rua Inventada 376, 1º');
    const aldeia = evento('m2', 'Serviço 115€ (230€) Limpeza de colchões - Joana Teste - 910000004 - Rua Central, 06 -Aldeia Inventada');
    const mapaDeTeste = (respostas: Record<string, unknown>) => {
      const perguntas: string[] = [];
      return { perguntas, procurar: (morada: string) => { perguntas.push(morada); return respostas[morada]; } };
    };

    it('manda ao Maps só a morada, sem o serviço, o telefone e o nome', () => {
      expect(gs.moradaDoEvento(semCidade)).toBe('Rua Inventada 376, 1º');
      expect(gs.moradaDoEvento(aldeia)).toBe('Rua Central, 06, Aldeia Inventada');
      expect(gs.moradaDoEvento(evento('m3', 'Serviço 45€ (89€) sofá - +351 910 000 005 Rita Exemplo - Rua Nova 11, Vale Inventado'))).toBe('Rua Nova 11, Vale Inventado');
      expect(gs.moradaDoEvento(evento('m4', 'Serviço 70€ (130€) imper cadeiras'))).toBe('');
    });

    it('decide a equipa pelo código postal do sítio encontrado, e dá o sítio à equipa', () => {
      const mapa = mapaDeTeste({
        'Rua Inventada 376, 1º': { encontrado: true, morada: 'Rua Inventada 376, 4000-000 Porto, Portugal', codigoPostal: '4000-000', lat: 41.15, lng: -8.61 },
      });
      const { copias, pendentes } = gs.copiasDesejadas([semCidade, lisboa], mapa.procurar);
      expect(copias.get('m1').equipaId).toBe('porto');
      expect(copias.get('m1').corpo.location).toBe('Rua Inventada 376, 4000-000 Porto, Portugal');
      expect(pendentes).toEqual([]);
      // O que já se resolve pelo código postal nunca vai ao Maps.
      expect(mapa.perguntas).toEqual(['Rua Inventada 376, 1º']);
    });

    it('fora de todas as regiões, vai para a equipa mais perto; nas ilhas não adivinha', () => {
      expect(gs.equipaPeloMapa({ encontrado: true, codigoPostal: '2400-000', lat: 39.74, lng: -8.81 }).id).toBe('lisboa');
      expect(gs.equipaPeloMapa({ encontrado: true, codigoPostal: '6300-000', lat: 40.54, lng: -7.27 }).id).toBe('porto');
      expect(gs.equipaPeloMapa({ encontrado: true, codigoPostal: null, lat: 37.95, lng: -8.87 }).id).toBe('lisboa');
      expect(gs.equipaPeloMapa({ encontrado: true, codigoPostal: '9000-000', lat: 32.65, lng: -16.91 })).toBeNull();
      expect(gs.equipaPeloMapa({ encontrado: false })).toBeNull();
    });

    it('fica com a melhor resposta do Maps, mesmo parcial: tudo automático', () => {
      // Dono, 28/09/2026: sem perguntas. Uma rua sem cidade vai para onde o Maps a põe.
      const ruaSemCidade = { encontrado: true, parcial: true, nomes: ['Braga'], morada: 'Rua Inventada 376, 4710-000 Braga', codigoPostal: '4710-000', lat: 41.55, lng: -8.42 };
      const mapa = mapaDeTeste({ 'Rua Inventada 376, 1º': ruaSemCidade });
      const { copias, pendentes } = gs.copiasDesejadas([semCidade], mapa.procurar);
      expect(copias.get('m1').equipaId).toBe('braga');
      expect(copias.get('m1').corpo.location).toBe('Rua Inventada 376, 4710-000 Braga');
      expect(pendentes).toEqual([]);
    });

    it('tenta a morada inteira, depois sem andar e lado, depois só a localidade', () => {
      expect([...gs.pesquisasDoMapa('Rua Inventada 28 , cave esquerda')]).toEqual(['Rua Inventada 28 , cave esquerda', 'rua inventada 28']);
      expect([...gs.pesquisasDoMapa('Rua Central, 06, Aldeia Inventada')]).toEqual(['Rua Central, 06, Aldeia Inventada', 'Aldeia Inventada']);
      expect([...gs.pesquisasDoMapa('Rua Nova 11, 2º esq, Vale Inventado')]).toEqual(['Rua Nova 11, 2º esq, Vale Inventado', 'rua nova 11, vale inventado', 'Vale Inventado']);
    });

    it('manda o serviço e avisa o dono quando a equipa não é certa', () => {
      // Dono, 28/09/2026: "quando não tiveres 100% certeza envia-me um alerta no email".
      // Caso real, com telefone inventado: rua sem cidade, que o dono confirmou ser no Porto.
      const ruaSemCidade = evento('r1', 'Serviço 45€ (89€) Limpeza de sofá de 3 lugares - +351 910 000 006 - Rua D. João IV 376, 1º, 105');
      const pelaFreguesia = evento('f1', 'Serviço 40€ (79€) Limpeza de sofá - Rua Nova 3, Canidelo');
      const mapa = mapaDeTeste({
        'Rua D. João IV 376, 1º, 105': { encontrado: true, parcial: false, nomes: ['Porto'], morada: 'R. de Dom João IV 376, 4000-000 Porto', codigoPostal: '4000-000', lat: 41.15, lng: -8.60 },
      });
      const { copias, incertos } = gs.copiasDesejadas([ruaSemCidade, pelaFreguesia, lisboa], mapa.procurar);
      expect(copias.get('r1').equipaId).toBe('porto');
      expect(copias.get('f1').equipaId).toBe('porto');
      // Pelo código postal é certo: não há aviso.
      expect(incertos.map((i: { evento: Evento }) => i.evento.id)).toEqual(['r1', 'f1']);
      expect(incertos[0].duvida).toBe('pelo Google Maps, que encontrou "R. de Dom João IV 376, 4000-000 Porto"');
      expect(incertos[1].duvida).toContain('pela freguesia "canidelo"');

      const primeira = gs.incertosNovos(incertos, {}, AGORA);
      expect(primeira.novos).toHaveLength(2);
      expect(gs.incertosNovos(incertos, primeira.atuais, AGORA).novos).toEqual([]);
      const mudouDeEquipa = [{ ...incertos[0], equipaId: 'lisboa' }];
      expect(gs.incertosNovos(mudouDeEquipa, primeira.atuais, AGORA).novos).toHaveLength(1);

      const mensagem = gs.mensagemParaDono([], primeira.novos);
      expect(mensagem.assunto).toBe('2 serviços enviados sem certeza');
      expect(mensagem.texto).toContain('→ Equipa Porto, pelo Google Maps, que encontrou "R. de Dom João IV 376, 4000-000 Porto"');
      expect(mensagem.texto).toContain('(hora de Portugal)');
      expect(gs.mensagemParaDono([semMorada], primeira.novos).assunto).toBe('Serviços para confirmar');
    });

    it('diz quando a equipa foi a mais perto, fora das zonas das equipas', () => {
      expect(gs.duvidaDoMapa({ encontrado: true, parcial: true, morada: 'Aldeia, 2400-000 Leiria', codigoPostal: '2400-000', lat: 39.74, lng: -8.81 }))
        .toBe('pelo Google Maps, que encontrou "Aldeia, 2400-000 Leiria" (só parte da morada), fora das zonas das equipas: foi a equipa mais perto');
    });

    it('avisa o dono só quando nem o Maps encontra a morada', () => {
      const mapa = mapaDeTeste({ 'Rua Central, 06, Aldeia Inventada': { encontrado: false } });
      const { copias, pendentes } = gs.copiasDesejadas([aldeia], mapa.procurar);
      expect(copias.size).toBe(0);
      expect(pendentes.map((e: Evento) => e.id)).toEqual(['m2']);
    });

    it('se o Maps não responder, não mexe na cópia que já existe nem avisa ninguém', () => {
      const encontrado = mapaDeTeste({ 'Rua Inventada 376, 1º': { encontrado: true, morada: 'Porto', codigoPostal: '4000-000', lat: 41.15, lng: -8.61 } });
      const { copias } = gs.copiasDesejadas([semCidade], encontrado.procurar);
      const existentes = [...copias].map(([origemId, c]: [string, { equipaId: string; corpo: Evento & { extendedProperties: unknown } }]) =>
        ({ equipaId: c.equipaId, origemId, evento: copiaGravada(c.corpo, 'copia-m1') }));
      const semResposta = gs.copiasDesejadas([{ ...semCidade, summary: `${semCidade.summary} B` }], mapaDeTeste({}).procurar);
      expect([...semResposta.adiados]).toEqual(['m1']);
      expect(semResposta.pendentes).toEqual([]);
      expect(gs.planear(semResposta.copias, existentes, AGORA, false, semResposta.adiados)).toEqual([]);
    });
  });

  it('avisa o dono uma vez de cada serviço sem equipa, e outra vez se ele o mudar', () => {
    const primeira = gs.pendentesNovos([semMorada], {}, AGORA);
    expect(primeira.novos.map((e: Evento) => e.id)).toEqual(['c3']);
    expect(gs.pendentesNovos([semMorada], primeira.atuais, AGORA).novos).toEqual([]);
    const mudado = { ...semMorada, summary: `${semMorada.summary} Seixal` };
    expect(gs.pendentesNovos([mudado], primeira.atuais, AGORA).novos).toHaveLength(1);
    const mensagem = gs.mensagemParaDono(primeira.novos);
    expect(mensagem.assunto).toBe('Serviço sem equipa');
    expect(mensagem.texto).toContain('sábado, 03/10, das 14:00 às 15:00');
  });
});
