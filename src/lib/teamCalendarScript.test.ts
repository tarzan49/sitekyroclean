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
  colorId?: string;
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

  it('escolhe a equipa pela cor ou pelo que está escrito, em todas as regiões, e nunca pela morada', () => {
    // Dono, 29/09/2026: "eu quero agora escolher sempre a equipa".
    const equipa = (summary: string, colorId?: string, description = '') =>
      gs.copiasDesejadas([{ ...evento('l1', summary), colorId, description }]).copias.get('l1')?.equipaId ?? null;
    const lisboa = 'Serviço 45€ (89€) sofá - Rua X 3, 1600-000 Lisboa';
    expect(equipa(lisboa)).toBeNull();
    expect(equipa(lisboa, '6')).toBe('lisboa');
    expect(equipa(lisboa, '3')).toBe('lisboa2');
    // A cor escolhe, mesmo que a morada seja de outra região.
    expect(equipa(lisboa, '10')).toBe('braga');
    expect(equipa('Serviço 45€ (89€) sofá, 8600-000 Lagos', '5')).toBe('algarve');
    // A parte do dono (70% de 100€) já não escolhe a Lisboa 2.
    expect(equipa('Serviço 70€ (100€) sofá - Rua X 3, 1600-000 Lisboa')).toBeNull();
    // O que está escrito ganha à cor.
    expect(equipa(`${lisboa} equipa lisboa 2`, '6')).toBe('lisboa2');
    expect(equipa(lisboa, undefined, 'Equipa Lisboa2')).toBe('lisboa2');
    expect(equipa('Serviço 45€ (89€) sofá, 4000-000 Porto - equipa lisboa 1')).toBe('lisboa');
    // Uma cor que não é de nenhuma equipa não é uma escolha.
    expect(equipa(lisboa, '11')).toBeNull();
    // Cada equipa com a sua cor.
    expect(['9', '7', '10', '6', '3', '5', '4'].map(cor => gs.equipaPelaCor({ colorId: cor }).id))
      .toEqual(['porto', 'porto2', 'braga', 'lisboa', 'lisboa2', 'algarve', 'coimbra']);
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
  // Com cor: o dono escolheu a equipa (Tangerina, a Lisboa 1; Mirtilo, a Porto 1).
  const lisboa = { ...evento('a1', 'Serviço 70€ (140€) sofá - +351 910 000 001 - Ana Teste - Rua X 8, 2835-000 Charneca'), colorId: '6' };
  const porto = { ...evento('b2', 'Serviço 40€ (79€) sofá - +351 910 000 002 - Rui Exemplo - Rua Y 3, 4000-000 Porto'), colorId: '9' };
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

  it('cria cada serviço na equipa escolhida e deixa de fora o que não é serviço ou não tem equipa', () => {
    const { copias, porEscolher } = estado([lisboa, porto, semMorada, pessoal]);
    expect([...copias.keys()]).toEqual(['a1', 'b2']);
    expect(porEscolher.map((i: { evento: Evento }) => i.evento.id)).toEqual(['c3']);
    const acoes = gs.planear(copias, [], AGORA, false);
    expect(resumoDe(acoes)).toEqual(['criar:lisboa:novo', 'criar:porto:novo']);
    // 15:00 no calendário do dono (Copenhaga) = 14:00 em Portugal.
    expect(acoes[0].corpo.start).toEqual({ dateTime: '2026-10-03T14:00:00', timeZone: 'Europe/Lisbon' });
    expect(acoes[0].corpo.summary).toBe(lisboa.summary);
  });

  it('não avisa na primeira volta nem de serviços que já passaram', () => {
    expect(resumoDe(gs.planear(estado([lisboa]).copias, [], AGORA, true))).toEqual(['criar:lisboa:null']);
    const passado = { ...evento('p1', lisboa.summary, '2026-09-27T10:00:00+02:00', '2026-09-27T11:00:00+02:00'), colorId: '6' };
    expect(resumoDe(gs.planear(estado([passado]).copias, [], AGORA, false))).toEqual(['criar:lisboa:null']);
  });

  it('não faz nada quando nada mudou', () => {
    expect(gs.planear(estado([lisboa, porto]).copias, copiasDe([lisboa, porto]), AGORA, false)).toEqual([]);
  });

  it('atualiza a cópia quando o serviço muda, e diz à equipa o que era antes', () => {
    const mudado = { ...evento('a1', lisboa.summary, '2026-10-04T10:00:00+02:00', '2026-10-04T11:00:00+02:00'), colorId: '6' };
    const acoes = gs.planear(estado([mudado]).copias, copiasDe([lisboa]), AGORA, false);
    expect(resumoDe(acoes)).toEqual(['atualizar:lisboa:alterado']);
    const mensagem = gs.mensagemParaEquipa(acoes[0], gs.equipaDaRegiao('Lisboa'));
    expect(mensagem.assunto).toBe('Serviço alterado: domingo, 04/10, das 09:00 às 10:00');
    expect(mensagem.texto).toContain('Antes: sábado, 03/10, das 14:00 às 15:00');
  });

  it('muda o serviço de equipa quando o dono muda a cor', () => {
    const mudouParaBraga = { ...lisboa, colorId: '10' };
    const acoes = gs.planear(estado([mudouParaBraga]).copias, copiasDe([lisboa]), AGORA, false);
    expect(resumoDe(acoes)).toEqual(['apagar:lisboa:retirado', 'criar:braga:novo']);
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
    expect(mensagem.texto).toContain('Está no calendário "Kyro · Equipa Lisboa 1".');
  });

  describe('o Maps só dá a morada à equipa e a zona ao dono', () => {
    // Moradas inventadas, com respostas do Maps inventadas.
    const semCidade = { ...evento('m1', 'Serviço 45€ (89€) Limpeza de sofá - +351 910 000 003 - Rua Inventada 376, 1º'), colorId: '9' };
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

    it('dá à equipa a morada que o Maps encontrou quando o evento não tem local, sem mudar a equipa escolhida', () => {
      const mapa = mapaDeTeste({
        'Rua Inventada 376, 1º': { encontrado: true, morada: 'Rua Inventada 376, 4710-000 Braga, Portugal', codigoPostal: '4710-000', lat: 41.55, lng: -8.42 },
      });
      const { copias } = gs.copiasDesejadas([semCidade], mapa.procurar);
      expect(copias.get('m1').equipaId).toBe('porto');
      expect(copias.get('m1').corpo.location).toBe('Rua Inventada 376, 4710-000 Braga, Portugal');
      // Sem resposta do Maps, a cópia segue na mesma, sem morada.
      expect(gs.copiasDesejadas([semCidade], mapaDeTeste({}).procurar).copias.get('m1').corpo.location).toBe('');
      // Com local no evento, o Maps não é chamado.
      const comLocal = mapaDeTeste({});
      gs.copiasDesejadas([{ ...semCidade, location: 'Rua Inventada 376, Porto' }], comLocal.procurar);
      expect(comLocal.perguntas).toEqual([]);
    });

    it('diz ao dono a zona de um serviço por escolher: pela morada, ou pelo Maps', () => {
      const zona = (e: Evento, respostas: Record<string, unknown> = {}) => gs.copiasDesejadas([e], mapaDeTeste(respostas).procurar).porEscolher[0].zona;
      expect(zona(evento('z1', 'Serviço 45€ (89€) sofá, 4450-000 Matosinhos'))).toBe('Porto');
      expect(zona(aldeia, { 'Rua Central, 06, Aldeia Inventada': { encontrado: true, codigoPostal: '8600-000', lat: 37.1, lng: -8.67 } })).toBe('Algarve');
      expect(zona(aldeia, { 'Rua Central, 06, Aldeia Inventada': { encontrado: false } })).toBeNull();
      expect(zona(evento('z2', 'Serviço 70€ (130€) imper cadeiras'))).toBeNull();
    });

    it('fora de todas as regiões, a zona é a da equipa mais perto; nas ilhas não adivinha', () => {
      expect(gs.equipaPeloMapa({ encontrado: true, codigoPostal: '2400-000', lat: 39.74, lng: -8.81 }).id).toBe('coimbra');
      expect(gs.equipaPeloMapa({ encontrado: true, codigoPostal: '6300-000', lat: 40.54, lng: -7.27 }).id).toBe('coimbra');
      expect(gs.equipaPeloMapa({ encontrado: true, codigoPostal: null, lat: 37.95, lng: -8.87 }).id).toBe('lisboa');
      expect(gs.equipaPeloMapa({ encontrado: true, codigoPostal: '9000-000', lat: 32.65, lng: -16.91 })).toBeNull();
      expect(gs.equipaPeloMapa({ encontrado: false })).toBeNull();
    });

    it('tenta a morada inteira, depois sem andar e lado, depois só a localidade', () => {
      expect([...gs.pesquisasDoMapa('Rua Inventada 28 , cave esquerda')]).toEqual(['Rua Inventada 28 , cave esquerda', 'rua inventada 28']);
      expect([...gs.pesquisasDoMapa('Rua Central, 06, Aldeia Inventada')]).toEqual(['Rua Central, 06, Aldeia Inventada', 'Aldeia Inventada']);
      expect([...gs.pesquisasDoMapa('Rua Nova 11, 2º esq, Vale Inventado')]).toEqual(['Rua Nova 11, 2º esq, Vale Inventado', 'rua nova 11, vale inventado', 'Vale Inventado']);
    });
  });

  it('pinta os serviços daqui para a frente com a cor da equipa, e volta a pintar se mudarem de equipa', () => {
    // Dono, 28/09/2026: "quero o meu com cores em vez de ser tudo azul", "pinta só os serviços para a frente".
    const semCor = { ...lisboa, colorId: undefined };
    expect(gs.corEmFalta(semCor, 'lisboa', AGORA)).toBe('6');
    expect(gs.corEmFalta(semCor, 'porto', AGORA)).toBe('9');
    expect(gs.corEmFalta({ ...semCor, colorId: '6' }, 'lisboa', AGORA)).toBeNull();
    expect(gs.corEmFalta({ ...semCor, colorId: '6' }, 'braga', AGORA)).toBe('10');
    const passado = evento('p9', lisboa.summary, '2026-09-27T10:00:00+02:00', '2026-09-27T11:00:00+02:00');
    expect(gs.corEmFalta(passado, 'lisboa', AGORA)).toBeNull();
    // Cada equipa com uma cor diferente.
    const cores = ['porto', 'porto2', 'braga', 'lisboa', 'lisboa2', 'algarve'].map(id => gs.corEmFalta(semCor, id, AGORA));
    expect(new Set(cores).size).toBe(6);
  });

  it('escreve a equipa na descrição do serviço do dono, sem isso mudar a equipa nem a cópia', () => {
    // Dono, 28/09/2026: "eu assim não vejo que equipa vai".
    const marca = gs.marcaDaEquipa(lisboa, 'lisboa2', AGORA);
    expect(marca).toEqual({ colorId: '3', description: 'Equipa: Lisboa 2' });
    expect(gs.descricaoComEquipa('Portão verde', 'porto')).toBe('Equipa: Porto 1\n\nPortão verde');
    expect(gs.descricaoComEquipa('Portão verde', 'porto2')).toBe('Equipa: Porto 2\n\nPortão verde');
    expect(gs.descricaoComEquipa('Equipa: Porto\n\nPortão verde', 'braga')).toBe('Equipa: Braga\n\nPortão verde');
    expect(gs.descricaoComEquipa('Equipa: Porto<br><br>Portão verde', 'braga')).toBe('Equipa: Braga\n\nPortão verde');
    // Já marcado: nada a fazer. Já passou: não se toca.
    expect(gs.marcaDaEquipa({ ...lisboa, colorId: '6', description: 'Equipa: Lisboa 1' }, 'lisboa', AGORA)).toBeNull();
    const passado = evento('p8', lisboa.summary, '2026-09-27T10:00:00+02:00', '2026-09-27T11:00:00+02:00');
    expect(gs.marcaDaEquipa(passado, 'lisboa', AGORA)).toBeNull();

    // A linha não decide a equipa: sem cor, o serviço fica por escolher mesmo com "Equipa: Porto" escrito pelo script.
    const mudou = { ...evento('s1', 'Serviço 45€ (89€) sofá - Rua Nova 3, Seixal'), description: 'Equipa: Porto' };
    expect(gs.copiasDesejadas([mudou]).copias.size).toBe(0);
    const { copias } = gs.copiasDesejadas([{ ...mudou, colorId: '6' }]);
    expect(copias.get('s1').equipaId).toBe('lisboa');
    // A cópia da equipa não leva a linha, por isso escrevê-la não gera "Serviço alterado".
    expect(copias.get('s1').corpo.description).toBe('');
    const semLinha = gs.copiasDesejadas([{ ...mudou, colorId: '6', description: '' }]).copias.get('s1');
    expect(copias.get('s1').corpo.extendedProperties.private.kyroAssinatura).toBe(semLinha.corpo.extendedProperties.private.kyroAssinatura);
  });

  describe('a escolha da equipa', () => {
    // Dono, 28/09/2026, só no Porto: "eu tenho que selecionar qual é cada"; a 29/09 em todas as regiões.
    const servico = (id: string, colorId?: string, extra = '', cidade = '4450-000 Matosinhos') =>
      ({ ...evento(id, `Serviço 45€ (89€) sofá - +351 910 000 007 - Rua Z 5, ${cidade}${extra}`), colorId });
    const equipa = (e: Evento) => gs.copiasDesejadas([e]).copias.get(e.id)?.equipaId ?? null;

    it('sem cor nem "equipa X", nenhum serviço segue sozinho, em região nenhuma', () => {
      const eventos = [servico('e1'), servico('e2', undefined, '', '1600-000 Lisboa'), servico('e3', undefined, '', '3800-000 Aveiro')];
      const { copias, porEscolher } = gs.copiasDesejadas(eventos);
      expect(copias.size).toBe(0);
      expect(porEscolher.map((i: { evento: Evento; zona: string }) => `${i.evento.id} ${i.zona}`)).toEqual(['e1 Porto', 'e2 Lisboa', 'e3 Porto']);
    });

    it('escolhe pela cor do evento, e a linha que o script escreve não é uma escolha', () => {
      expect(equipa(servico('e1', '9'))).toBe('porto');
      expect(equipa(servico('e1', '7'))).toBe('porto2');
      expect(equipa(servico('e1', '6'))).toBe('lisboa');
      expect(equipa({ ...servico('e1'), description: 'Equipa: Porto 2' })).toBeNull();
    });

    it('ou pelo que está escrito, que ganha à cor', () => {
      expect(equipa(servico('e1', '9', ' equipa porto 2'))).toBe('porto2');
      expect(equipa(servico('e1', undefined, ' Equipa Porto2'))).toBe('porto2');
      expect(equipa(servico('e1', '7', ' equipa porto 1'))).toBe('porto');
      expect(equipa(servico('e1', undefined, ' equipa porto'))).toBe('porto');
    });

    it('muda de equipa quando o dono muda a cor, e não mexe na cópia enquanto está por escolher', () => {
      const naPorto1 = gs.copiasDesejadas([servico('e1', '9')]);
      const [origemId, c] = [...naPorto1.copias][0];
      const existentes = [{ equipaId: c.equipaId, origemId, evento: copiaGravada(c.corpo, 'copia-e1') }];
      const planearCom = (e: Evento, copias = existentes) => {
        const d = gs.copiasDesejadas([e]);
        const porEscolher = new Set(d.porEscolher.map((i: { evento: Evento }) => i.evento.id));
        return resumoDe(gs.planear(d.copias, copias, AGORA, false, porEscolher));
      };
      expect(planearCom(servico('e1', '7'))).toEqual(['apagar:porto:retirado', 'criar:porto2:novo']);
      expect(planearCom(servico('e1'))).toEqual([]);
      expect(planearCom(servico('e1'), [{ ...existentes[0], equipaId: 'lisboa' }])).toEqual([]);
    });

    it('pinta e marca a equipa escrita como as outras', () => {
      expect(gs.marcaDaEquipa(servico('e1', '7'), 'porto2', AGORA)).toEqual({ description: 'Equipa: Porto 2' });
      expect(gs.marcaDaEquipa(servico('e1', '9', ' equipa porto 2'), 'porto2', AGORA)).toEqual({ colorId: '7', description: 'Equipa: Porto 2' });
    });

    it('pede ao dono que escolha, uma vez por serviço, com a zona como pista e as cores de todas as equipas', () => {
      const { porEscolher } = gs.copiasDesejadas([servico('e1'), servico('e2', undefined, '', '1600-000 Lisboa'), semMorada]);
      const primeira = gs.escolhasNovas(porEscolher, {}, AGORA);
      expect(primeira.novos).toHaveLength(3);
      expect(gs.escolhasNovas(porEscolher, primeira.atuais, AGORA).novos).toEqual([]);
      const mudado = [{ ...porEscolher[2], evento: { ...semMorada, summary: `${semMorada.summary} Seixal` } }];
      expect(gs.escolhasNovas(mudado, primeira.atuais, AGORA).novos).toHaveLength(1);

      const mensagem = gs.mensagemParaDono(primeira.novos);
      expect(mensagem.assunto).toBe('Escolhe a equipa de 3 serviços');
      expect(mensagem.texto).toContain('Estes serviços estão à espera que escolhas a equipa:');
      expect(mensagem.texto).toContain('(a morada parece ser da zona Lisboa)');
      expect(mensagem.texto).toContain('sábado, 03/10, das 14:00 às 15:00 (hora de Portugal)');
      for (const linha of ['Mirtilo = Equipa Porto 1', 'Pavão = Equipa Porto 2', 'Basílico = Equipa Braga', 'Tangerina = Equipa Lisboa 1', 'Uva = Equipa Lisboa 2', 'Banana = Equipa Algarve', 'Flamingo = Equipa Coimbra']) {
        expect(mensagem.texto).toContain(linha);
      }
      expect(mensagem.texto).toContain('"equipa porto 1", "equipa porto 2", "equipa braga", "equipa lisboa 1", "equipa lisboa 2", "equipa algarve" ou "equipa coimbra"');
      expect(gs.mensagemParaDono(primeira.novos.slice(0, 1)).assunto).toBe('Escolhe a equipa deste serviço');
    });
  });

  it('avisa o dono dos serviços criados à mão no calendário de uma equipa, e deixa as cópias em paz', () => {
    const copia = { ...evento('k1', 'Serviço 45€ (89€) sofá - Porto'), extendedProperties: { private: { kyroOrigem: 'e1' } } };
    const aMao = evento('m1', 'Serviço 115€ (230€) colchão - +351 910 000 009 - Rua Inventada 21, 2685-400');
    const cancelado = { ...evento('m2', 'Serviço 30€ (60€) tapete'), status: 'cancelled' };
    const itens = gs.criadosAMao([
      { equipaId: 'porto', evento: copia },
      { equipaId: 'porto', evento: aMao },
      { equipaId: 'lisboa', evento: cancelado },
    ]);
    expect(itens.map((i: { evento: Evento }) => i.evento.id)).toEqual(['m1']);

    const primeira = gs.aMaoNovos(itens, {}, AGORA);
    expect(primeira.novos).toHaveLength(1);
    expect(gs.aMaoNovos(itens, primeira.atuais, AGORA).novos).toEqual([]);
    // Mudado para outra equipa à mão: avisa outra vez.
    expect(gs.aMaoNovos([{ equipaId: 'lisboa', evento: aMao }], primeira.atuais, AGORA).novos).toHaveLength(1);

    const mensagem = gs.mensagemParaDono([], primeira.novos);
    expect(mensagem.assunto).toBe('Serviço criado fora do teu calendário');
    expect(mensagem.texto).toContain('está no calendário da Equipa Porto 1');
    expect(mensagem.texto).toContain('não entra no CRM');
    expect(gs.mensagemParaDono([{ evento: semMorada, zona: null }], primeira.novos).assunto).toBe('Serviços para confirmar');
  });

  it('passa para o evento do dono o dia mudado à mão na cópia da equipa, e só isso', () => {
    const origem = { ...evento('o1', 'Serviço 115€ (230€) colchões - Rua Inventada 6, Pucariça', '2026-10-01T12:00:00+02:00', '2026-10-01T13:00:00+02:00'), updated: '2026-09-27T23:43:30Z' };
    origem.start = { ...origem.start, timeZone: 'Europe/Copenhagen' };
    const corpo = gs.corpoDaCopia(origem);
    const escrita = { ...evento('c1', corpo.summary, '2026-10-01T11:00:00+01:00', '2026-10-01T12:00:00+01:00'), description: corpo.description, extendedProperties: corpo.extendedProperties, updated: '2026-09-27T23:50:00Z' };
    // Cópia tal como o script a escreveu: nada a fazer.
    expect(gs.edicoesNasCopias([{ equipaId: 'lisboa', evento: escrita, origemId: 'o1' }], [origem])).toEqual([]);

    const mudada = { ...escrita, start: { dateTime: '2026-10-16T11:00:00+01:00' }, end: { dateTime: '2026-10-16T12:00:00+01:00' }, updated: '2026-09-29T10:40:50Z' };
    const [edicao] = gs.edicoesNasCopias([{ equipaId: 'lisboa', evento: mudada, origemId: 'o1' }], [origem]);
    expect(edicao.origem.id).toBe('o1');
    expect(edicao.alteracao).toEqual({
      start: { dateTime: '2026-10-16T10:00:00.000Z', timeZone: 'Europe/Copenhagen' },
      end: { dateTime: '2026-10-16T11:00:00.000Z', timeZone: 'Europe/Copenhagen' },
    });
    // O dono mudou o evento dele depois: ganha o dele, e a cópia refaz-se.
    const maisRecente = { ...origem, updated: '2026-09-29T11:00:00Z' };
    expect(gs.edicoesNasCopias([{ equipaId: 'lisboa', evento: mudada, origemId: 'o1' }], [maisRecente])).toEqual([]);
  });

  it('passa para o calendário do dono os serviços criados à mão no de uma equipa, sem duplicar', () => {
    const copia = { ...evento('k1', 'Serviço 45€ (89€) sofá - Porto'), extendedProperties: { private: { kyroOrigem: 'e1' } } };
    const aMao = evento('m1', 'Serviço 60€ (120€) tapetes - Rua Inventada 88 Póvoa de Varzim', '2026-09-30T11:00:00+01:00', '2026-09-30T12:00:00+01:00');
    const nota = evento('m2', 'Ligar ao fornecedor');
    const cancelado = { ...evento('m3', 'Serviço 30€ (60€) tapete'), status: 'cancelled' };
    // Já recriado no calendário do dono (mesmo título e hora, noutro fuso): não se passa outra vez.
    const repetido = evento('m4', 'Serviço 75€ (149€) sofá - Gaia', '2026-10-05T12:30:00+01:00', '2026-10-05T13:30:00+01:00');
    const doDono = evento('d4', 'Serviço 75€ (149€)  sofá - Gaia', '2026-10-05T13:30:00+02:00', '2026-10-05T14:30:00+02:00');
    const itens = [
      { equipaId: 'porto', evento: copia },
      { equipaId: 'porto2', evento: aMao },
      { equipaId: 'porto', evento: nota },
      { equipaId: 'lisboa', evento: cancelado },
      { equipaId: 'porto', evento: repetido },
    ];
    expect(gs.paraMover(itens, [doDono]).map((i: { evento: Evento }) => i.evento.id)).toEqual(['m1']);
    expect(gs.paraMover(itens, []).map((i: { evento: Evento }) => i.evento.id)).toEqual(['m1', 'm4']);
  });

  it('volta a esconder um calendário de equipa que a app do telemóvel pôs à vista, e não mexe no que está certo', () => {
    const lisboa2 = { id: 'lisboa2', corDoCalendario: '#8e24aa' };
    const certo = { hidden: true, selected: false, backgroundColor: lisboa2.corDoCalendario };
    expect(gs.calendarioPorArrumar(certo, lisboa2, true)).toBe(false);
    expect(gs.calendarioPorArrumar({ ...certo, backgroundColor: lisboa2.corDoCalendario.toUpperCase() }, lisboa2, true)).toBe(false);
    // Escolhida na app ao criar um serviço: fica à vista e o dono vê o serviço a dobrar.
    expect(gs.calendarioPorArrumar({ ...certo, hidden: false }, lisboa2, true)).toBe(true);
    expect(gs.calendarioPorArrumar({ ...certo, selected: true }, lisboa2, true)).toBe(true);
    expect(gs.calendarioPorArrumar({ ...certo, backgroundColor: '#000000' }, lisboa2, true)).toBe(true);
    // O do dono fica à vista.
    expect(gs.calendarioPorArrumar({ hidden: false, selected: true }, null, false)).toBe(false);
    expect(gs.calendarioPorArrumar({ selected: false }, null, false)).toBe(true);
  });
});
