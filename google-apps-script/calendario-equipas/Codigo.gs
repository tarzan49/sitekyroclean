/**
 * Calendários das equipas · Kyro Clean Solutions
 *
 * Copia cada serviço do teu calendário para o calendário da equipa que o vai
 * fazer e manda um email a quem tem esse calendário partilhado quando um
 * serviço entra, muda ou é cancelado. Escreves só no teu calendário: as cópias
 * refazem-se a partir dele, e as equipas só as podem ver.
 *
 * Instalação e regras: docs/calendario-equipas.md, no repositório do site.
 * Este ficheiro está no repositório, que é público: não escrevas aqui nomes
 * nem emails. Quem recebe os emails de uma equipa é quem tem o calendário
 * dela partilhado consigo.
 *
 * Corre no Apps Script (V8). O teste está em
 * src/lib/teamCalendarScript.test.ts e carrega este ficheiro tal como está:
 * as funções de decisão não tocam em serviços da Google.
 */

// Uma equipa por região do CRM (dono, 28/09/2026). Aveiro e Coimbra são da
// região Porto e o Alentejo da região Lisboa, como no travel.ts. Uma equipa
// nova é uma linha nova, e o `configurar()` cria-lhe o calendário. A `base`
// (latitude, longitude) só decide as moradas fora de todas as regiões
// (Leiria, Beira Interior): vão para a equipa mais perto. A `cor` pinta os
// serviços novos no calendário do dono (cores de evento da Google: 9 Mirtilo,
// 7 Pavão, 10 Basílico, 6 Tangerina, 5 Banana, 3 Uva, 4 Flamingo) e `corDoCalendario` é a mesma
// cor no calendário da equipa, para as duas coisas baterem certo.
// `escrito` é o que o dono escreve depois de "equipa" para escolher a equipa.
// Desde 29/09/2026 o dono escolhe sempre a equipa, em todas as regiões, pela
// cor do evento (`cor`, com o nome que a app mostra em `nomeDaCor`) ou
// escrevendo "equipa X" ("eu quero agora escolher sempre a equipa"): a região
// que sai da morada só aparece no aviso ao dono, como pista. Antes disto só o
// Porto era escolhido à mão, e a Lisboa 2 recebia sozinha os serviços em que a
// parte do dono era 60% a 80% do valor.
const EQUIPAS = [
  { id: 'porto', nome: 'Kyro · Equipa Porto 1', escrito: ['porto', 'porto 1'], regioes: ['Porto'], base: [41.1496, -8.6110], cor: '9', nomeDaCor: 'Mirtilo', corDoCalendario: '#3f51b5' },
  { id: 'porto2', nome: 'Kyro · Equipa Porto 2', escrito: ['porto 2'], regioes: [], base: null, cor: '7', nomeDaCor: 'Pavão', corDoCalendario: '#039be5' },
  { id: 'braga', nome: 'Kyro · Equipa Braga', escrito: ['braga'], regioes: ['Braga'], base: [41.5454, -8.4265], cor: '10', nomeDaCor: 'Basílico', corDoCalendario: '#0b8043' },
  { id: 'lisboa', nome: 'Kyro · Equipa Lisboa 1', escrito: ['lisboa', 'lisboa 1'], regioes: ['Lisboa'], base: [38.7223, -9.1393], cor: '6', nomeDaCor: 'Tangerina', corDoCalendario: '#f4511e' },
  { id: 'lisboa2', nome: 'Kyro · Equipa Lisboa 2', escrito: ['lisboa 2'], regioes: [], base: null, cor: '3', nomeDaCor: 'Uva', corDoCalendario: '#8e24aa' },
  { id: 'algarve', nome: 'Kyro · Equipa Algarve', escrito: ['algarve'], regioes: ['Algarve'], base: [37.0194, -7.9304], cor: '5', nomeDaCor: 'Banana', corDoCalendario: '#f6bf26' },
  // Coimbra e Figueira da Foz (dono, 10/10/2026: "cria o calendário da equipa de coimbra"). No CRM continuam
  // a contar como região Porto, por isso `regioes` fica vazio, como na Porto 2 e na Lisboa 2.
  { id: 'coimbra', nome: 'Kyro · Equipa Coimbra', escrito: ['coimbra'], regioes: [], base: [40.2033, -8.4103], cor: '4', nomeDaCor: 'Flamingo', corDoCalendario: '#e67c73' },
];

const FUSO_PORTUGAL = 'Europe/Lisbon';
const DIAS_ANTES = 2;
const DIAS_DEPOIS = 365;
const MINUTOS_ENTRE_VERIFICACOES = 15;
const DIA_MS = 24 * 60 * 60 * 1000;

// ── Instalação ────────────────────────────────────────────────────────────

/**
 * Corre-se uma vez, no editor. Cria os calendários que faltarem, liga a cópia
 * automática e faz a primeira cópia sem mandar emails às equipas. Pode voltar
 * a correr-se: não duplica calendários nem cópias.
 */
function configurar() {
  const propriedades = PropertiesService.getScriptProperties();
  for (const equipa of EQUIPAS) {
    const chave = 'calendario:' + equipa.id;
    const guardado = propriedades.getProperty(chave);
    const existente = guardado ? lerCalendario(guardado) : null;
    if (existente) {
      // Um nome novo em `EQUIPAS` (a Lisboa passou a "Lisboa 1") muda o calendário que já existe.
      if (existente.summary !== equipa.nome) Calendar.Calendars.patch({ summary: equipa.nome }, guardado);
      continue;
    }
    const novo = Calendar.Calendars.insert({
      summary: equipa.nome,
      timeZone: FUSO_PORTUGAL,
      description: 'Serviços copiados automaticamente do calendário da Kyro. O que se mudar aqui perde-se: muda-se no calendário principal.',
    });
    propriedades.setProperty(chave, novo.id);
    Logger.log('Criei o calendário "' + equipa.nome + '".');
  }
  desligar();
  ScriptApp.newTrigger('sincronizar').forUserCalendar(Session.getEffectiveUser().getEmail()).onEventUpdated().create();
  // Também os calendários das equipas: o dono muda no telemóvel a hora de uma
  // cópia e, só com o gatilho de 15 minutos, o evento dele (o que o PC e o CRM
  // mostram) ficava até lá com a hora antiga (30/09/2026: "muda só no telemóvel").
  for (const equipa of EQUIPAS) {
    ScriptApp.newTrigger('sincronizar').forUserCalendar(propriedades.getProperty('calendario:' + equipa.id)).onEventUpdated().create();
  }
  ScriptApp.newTrigger('sincronizar').timeBased().everyMinutes(MINUTOS_ENTRE_VERIFICACOES).create();
  sincronizar();
  Logger.log('Pronto. Falta partilhar cada calendário com a equipa (Google Calendar, definições do calendário, "Partilhar com pessoas específicas", permissão "Ver todos os detalhes do evento").');
}

/** Desliga a cópia automática. Os calendários das equipas ficam como estão. */
function desligar() {
  for (const gatilho of ScriptApp.getProjectTriggers()) {
    if (gatilho.getHandlerFunction() === 'sincronizar') ScriptApp.deleteTrigger(gatilho);
  }
}

/** Mostra no registo para que equipa iria cada serviço futuro, sem mudar nada. */
function verificar() {
  const agora = Date.now();
  const fonte = listarEventos('primary', agora, agora + DIAS_DEPOIS * DIA_MS, null);
  const mapa = mapaComMemoria(PropertiesService.getScriptProperties());
  const desejadas = copiasDesejadas(fonte.eventos, mapa.procurar);
  mapa.guardar(false);
  for (const evento of fonte.eventos) {
    if (!ehServico(evento.summary)) continue;
    const copia = desejadas.copias.get(evento.id);
    const porEscolher = desejadas.porEscolher.find(function (i) { return i.evento.id === evento.id; });
    const equipa = copia ? nomeDaEquipa(copia.equipaId) : 'POR ESCOLHER' + (porEscolher && porEscolher.zona ? ' (zona ' + porEscolher.zona + ')' : '');
    Logger.log(equipa + ' · ' + quando(horaEmPortugal(evento.start), horaEmPortugal(evento.end)) + ' · ' + evento.summary);
  }
}

// ── Sincronização ─────────────────────────────────────────────────────────

/** Chamada pelos gatilhos: quando mudas um evento e a cada 15 minutos. */
function sincronizar() {
  const trinco = LockService.getScriptLock();
  // Outra volta em curso: espera por ela. Se demorar, a volta seguinte apanha o que faltar.
  if (!trinco.tryLock(25 * 1000)) return;
  try {
    sincronizarAgora();
  } finally {
    trinco.releaseLock();
  }
}

function sincronizarAgora() {
  const propriedades = PropertiesService.getScriptProperties();
  const agora = Date.now();
  const inicio = agora - DIAS_ANTES * DIA_MS;
  const fim = agora + DIAS_DEPOIS * DIA_MS;

  const calendarios = {};
  const existentes = [];
  const eventosDasEquipas = [];
  for (const equipa of EQUIPAS) {
    const id = propriedades.getProperty('calendario:' + equipa.id);
    if (!id) throw new Error('Falta o calendário "' + equipa.nome + '": corre configurar() no editor.');
    calendarios[equipa.id] = id;
    for (const copia of listarEventos(id, inicio, fim, FUSO_PORTUGAL).eventos) {
      const origemId = propriedadePrivada(copia, 'kyroOrigem');
      if (origemId) existentes.push({ equipaId: equipa.id, evento: copia, origemId: origemId });
      eventosDasEquipas.push({ equipaId: equipa.id, evento: copia });
    }
  }

  const fonte = listarEventos('primary', inicio, fim, null);
  // Serviços criados à mão no calendário de uma equipa passam para o do dono,
  // que é o que o CRM lê (dono, 29/09/2026: "todos os serviços que eu coloco
  // no calendário têm de aparecer no CRM, ponto"). Ver `paraMover`.
  const movidos = new Set();
  for (const item of paraMover(eventosDasEquipas, fonte.eventos)) {
    try {
      Calendar.Events.move(calendarios[item.equipaId], item.evento.id, 'primary', { sendUpdates: 'none' });
      const equipa = EQUIPAS.find(function (e) { return e.id === item.equipaId; });
      const movido = Calendar.Events.patch({ colorId: equipa.cor }, 'primary', item.evento.id, { sendUpdates: 'none' });
      fonte.eventos.push(movido);
      movidos.add(item.evento.id);
    } catch (erro) {
      // Fica onde está, e o dono recebe o aviso de serviço criado fora do calendário dele.
      Logger.log('Não consegui mover "' + (item.evento.summary || '') + '": ' + (erro && erro.message));
    }
  }
  const eventosAindaNasEquipas = eventosDasEquipas.filter(function (item) { return !movidos.has(item.evento.id); });
  // Uma cópia cujo serviço não veio na lista (mudado para fora da janela, ou
  // uma falha da Google) só se apaga se o próprio evento disser que já não
  // existe. Nunca por não ter aparecido.
  const vistos = new Set(fonte.eventos.map(function (e) { return e.id; }));
  for (const existente of existentes) {
    if (vistos.has(existente.origemId)) continue;
    vistos.add(existente.origemId);
    const evento = lerEvento('primary', existente.origemId);
    if (evento && evento.status !== 'cancelled') fonte.eventos.push(evento);
  }

  // Uma cópia mudada à mão (no telemóvel, o dono abre a cópia da equipa e
  // muda-lhe o dia) passa essa mudança para o evento do dono, e daí para o
  // CRM e para a equipa, em vez de ficar só na cópia. Ver `edicoesNasCopias`.
  for (const edicao of edicoesNasCopias(existentes, fonte.eventos)) {
    const atualizado = Calendar.Events.patch(edicao.alteracao, 'primary', edicao.origem.id, { sendUpdates: 'none' });
    fonte.eventos[fonte.eventos.indexOf(edicao.origem)] = atualizado;
  }

  const mapa = mapaComMemoria(propriedades);
  const desejadas = copiasDesejadas(fonte.eventos, mapa.procurar);
  mapa.guardar();
  const silencioso = !propriedades.getProperty('primeiraVoltaFeita');
  const porEscolher = new Set(desejadas.porEscolher.map(function (item) { return item.evento.id; }));
  const acoes = planear(desejadas.copias, existentes, agora, silencioso, porEscolher);

  const pessoas = {};
  for (const acao of acoes) {
    const calendario = calendarios[acao.equipaId];
    if (acao.tipo === 'criar') Calendar.Events.insert(acao.corpo, calendario, { sendUpdates: 'none' });
    else if (acao.tipo === 'atualizar') Calendar.Events.update(acao.corpo, calendario, acao.copia.id, { sendUpdates: 'none' });
    else apagarEvento(calendario, acao.copia.id);
    if (!acao.aviso) continue;
    if (!pessoas[acao.equipaId]) pessoas[acao.equipaId] = pessoasDoCalendario(calendario);
    if (!pessoas[acao.equipaId].length) continue;
    const mensagem = mensagemParaEquipa(acao, EQUIPAS.find(function (e) { return e.id === acao.equipaId; }));
    MailApp.sendEmail({ to: pessoas[acao.equipaId].join(','), subject: mensagem.assunto, body: mensagem.texto, name: 'Kyro Clean Solutions' });
  }

  const guardadas = {};
  for (const chave of propriedades.getKeys()) {
    if (/^(pendente|incerto|escolher|mao):/.test(chave)) guardadas[chave] = propriedades.getProperty(chave);
  }
  const escolhas = escolhasNovas(desejadas.porEscolher, guardadas, agora);
  const aMao = aMaoNovos(criadosAMao(eventosAindaNasEquipas), guardadas, agora);
  // As chaves `pendente:` e `incerto:` são dos avisos de antes de 29/09/2026 e saem aqui.
  for (const chave in guardadas) {
    if (!(chave in escolhas.atuais) && !(chave in aMao.atuais)) propriedades.deleteProperty(chave);
  }
  propriedades.setProperties(escolhas.atuais);
  propriedades.setProperties(aMao.atuais);
  if (escolhas.novos.length || aMao.novos.length) {
    const mensagem = mensagemParaDono(escolhas.novos, aMao.novos);
    MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), subject: mensagem.assunto, body: mensagem.texto, name: 'Calendários das equipas' });
  }

  pintarServicos(desejadas.copias, agora);
  pintarCalendarios(calendarios);

  if (silencioso) propriedades.setProperty('primeiraVoltaFeita', new Date(agora).toISOString());
}

/**
 * Marca no calendário do dono os serviços que ainda não acabaram com a cor
 * da equipa e a linha "Equipa: …" na descrição (dono, 28/09/2026: "quero o
 * meu com cores em vez de ser tudo azul", "pinta só os serviços para a
 * frente", "eu assim não vejo que equipa vai"). Mudar o evento
 * mexe na data de alteração do evento, e o CRM (`calendarSync.ts`) relê um
 * evento alterado depois da linha e escreve por cima das correções feitas no
 * CRM. Isso só acontece com eventos criados depois de 26/09/2026 às 15:00 UTC
 * (os únicos que o CRM acompanha), e esses são pintados segundos depois de
 * criados, antes de haver correções. Um serviço que muda de equipa muda de
 * cor logo a seguir à alteração do dono.
 */
function pintarServicos(copias, agora) {
  copias.forEach(function (copia) {
    const alteracao = marcaDaEquipa(copia.origem, copia.equipaId, agora);
    if (alteracao) Calendar.Events.patch(alteracao, 'primary', copia.origem.id, { sendUpdates: 'none' });
  });
}

/**
 * Os calendários das equipas na lista do dono: com a cor da equipa e
 * escondidos, e o calendário dele à vista. O dono vê cada serviço uma vez, no
 * seu calendário, com a cor da equipa. Tirá-los da lista (29/09/2026, para a
 * app do telemóvel deixar de propor o último calendário usado) não é possível:
 * a Google recusa que o dono de um calendário o tire da sua própria lista
 * ("The data owner of a calendar cannot remove such a calendar"). Um serviço
 * que o dono grave num calendário de equipa passa para o dele com a cor dessa
 * equipa (`paraMover`).
 *
 * Confirma-se em todas as voltas, não uma vez: escolher um calendário de
 * equipa na app do telemóvel volta a pô-lo à vista, e a 30/09/2026 a Lisboa 2
 * e o Algarve estavam visíveis e o dono via cada serviço a dobrar ("pedi para
 * só ser um"). Só escreve quando alguma coisa está errada.
 */
function pintarCalendarios(calendarios) {
  for (const equipa of EQUIPAS) {
    const entrada = Calendar.CalendarList.get(calendarios[equipa.id]);
    if (!calendarioPorArrumar(entrada, equipa, true)) continue;
    Calendar.CalendarList.patch(
      { backgroundColor: equipa.corDoCalendario, foregroundColor: '#ffffff', hidden: true, selected: false },
      calendarios[equipa.id],
      { colorRgbFormat: true }
    );
  }
  const dono = Session.getEffectiveUser().getEmail();
  if (calendarioPorArrumar(Calendar.CalendarList.get(dono), null, false)) {
    Calendar.CalendarList.patch({ hidden: false, selected: true }, dono);
  }
}

/** Se a entrada da lista do dono não está como deve: escondida (equipas) ou à vista (o dele), e com a cor da equipa. */
function calendarioPorArrumar(entrada, equipa, escondido) {
  if (!entrada) return false;
  if (Boolean(entrada.hidden) !== escondido || Boolean(entrada.selected) === escondido) return true;
  return Boolean(equipa) && String(entrada.backgroundColor || '').toLowerCase() !== equipa.corDoCalendario;
}

// ── Leitura e escrita na Google ───────────────────────────────────────────

function listarEventos(calendario, inicioMs, fimMs, fuso) {
  const eventos = [];
  let pagina = null;
  let fusoDoCalendario = null;
  do {
    const opcoes = { timeMin: new Date(inicioMs).toISOString(), timeMax: new Date(fimMs).toISOString(), singleEvents: true, maxResults: 2500 };
    if (fuso) opcoes.timeZone = fuso;
    if (pagina) opcoes.pageToken = pagina;
    const resposta = Calendar.Events.list(calendario, opcoes);
    fusoDoCalendario = resposta.timeZone;
    for (const evento of resposta.items || []) eventos.push(evento);
    pagina = resposta.nextPageToken;
  } while (pagina);
  return { eventos: eventos, fuso: fusoDoCalendario };
}

const DESAPARECIDO = /not found|404|410|deleted/i;

/** null se o evento já não existe; qualquer outro erro interrompe a volta, para não apagar nada por engano. */
function lerEvento(calendario, id) {
  try {
    return Calendar.Events.get(calendario, id);
  } catch (erro) {
    if (DESAPARECIDO.test(String(erro && erro.message))) return null;
    throw erro;
  }
}

function lerCalendario(id) {
  try {
    return Calendar.Calendars.get(id);
  } catch (erro) {
    if (DESAPARECIDO.test(String(erro && erro.message))) return null;
    throw erro;
  }
}

function apagarEvento(calendario, id) {
  try {
    Calendar.Events.remove(calendario, id, { sendUpdates: 'none' });
  } catch (erro) {
    if (!DESAPARECIDO.test(String(erro && erro.message))) throw erro;
  }
}

/** Quem recebe os emails: as pessoas com quem o calendário da equipa está partilhado (ver ou editar), menos o dono. */
function pessoasDoCalendario(calendario) {
  const dono = Session.getEffectiveUser().getEmail().toLowerCase();
  const regras = Calendar.Acl.list(calendario).items || [];
  return regras
    .filter(function (r) {
      return r.scope && (r.scope.type === 'user' || r.scope.type === 'group') && (r.role === 'reader' || r.role === 'writer')
        && r.scope.value && r.scope.value.toLowerCase() !== dono;
    })
    .map(function (r) { return r.scope.value; });
}

// Muda quando a forma de procurar muda, para as respostas antigas não servirem.
const MEMORIA_DO_MAPA = 'mapa3:';

/**
 * O Google Maps com memória: cada morada procura-se uma vez, porque o script
 * corre a cada 15 minutos e o Maps tem limite diário. Só fica guardado o que
 * serviu nesta volta, por isso a memória não cresce. `undefined` quer dizer
 * que o Maps falhou e se tenta na volta seguinte.
 */
function mapaComMemoria(propriedades) {
  const todas = propriedades.getProperties();
  const usadas = {};
  return {
    procurar: function (morada) {
      const chave = MEMORIA_DO_MAPA + resumo(morada);
      if (chave in todas) {
        usadas[chave] = todas[chave];
        return JSON.parse(todas[chave]);
      }
      let resultado;
      try {
        resultado = lerMapa(morada);
      } catch (erro) {
        Logger.log('O Maps falhou para "' + morada + '": ' + erro);
        return undefined;
      }
      usadas[chave] = JSON.stringify(resultado);
      return resultado;
    },
    guardar: function (apagarAsOutras) {
      if (apagarAsOutras !== false) {
        for (const chave in todas) if (/^mapa\d*:/.test(chave) && !(chave in usadas)) propriedades.deleteProperty(chave);
      }
      propriedades.setProperties(usadas);
    },
  };
}

/**
 * Procura a morada no Google Maps (o serviço Maps do Apps Script, sem chave)
 * e fica com a melhor resposta, como quem a procura no telemóvel (dono,
 * 28/09/2026: tudo automático, sem perguntas). Tenta a morada como está,
 * depois sem andar e lado, depois só o último bocado. O código postal do
 * sítio encontrado decide a região, como no CRM; sem ele, pergunta-se ao
 * Maps o código postal daquele ponto.
 */
function lerMapa(morada) {
  const mapa = Maps.newGeocoder().setRegion('pt').setLanguage('pt-PT');
  // A primeira resposta que encontre a morada inteira; sem nenhuma assim, a
  // primeira que diga pelo menos uma localidade.
  let lugar = null;
  for (const pesquisa of pesquisasDoMapa(morada)) {
    const resposta = mapa.geocode(pesquisa + ', Portugal');
    if (resposta.status !== 'OK' && resposta.status !== 'ZERO_RESULTS') throw new Error(resposta.status);
    const primeiro = (resposta.results || [])[0];
    // "Portugal" ou um distrito inteiro não dizem onde é o serviço.
    const serve = primeiro && componenteDoMapa(primeiro, 'country') === 'PT' && primeiro.types.indexOf('country') < 0
      && primeiro.types.indexOf('administrative_area_level_1') < 0;
    if (!serve) continue;
    if (!lugar) lugar = primeiro;
    if (!primeiro.partial_match) {
      lugar = primeiro;
      break;
    }
  }
  if (!lugar) return { encontrado: false };
  const ponto = lugar.geometry.location;
  let codigoPostal = componenteDoMapa(lugar, 'postal_code');
  if (!codigoPostal) {
    const inverso = mapa.reverseGeocode(ponto.lat, ponto.lng);
    for (const outro of inverso.results || []) {
      codigoPostal = componenteDoMapa(outro, 'postal_code');
      if (codigoPostal) break;
    }
  }
  const nomes = ['locality', 'sublocality', 'neighborhood', 'administrative_area_level_3', 'administrative_area_level_2']
    .map(function (tipo) { return componenteDoMapa(lugar, tipo, 'long_name'); })
    .filter(Boolean);
  return {
    encontrado: true,
    parcial: Boolean(lugar.partial_match),
    nomes: nomes,
    morada: lugar.formatted_address,
    codigoPostal: codigoPostal || null,
    lat: ponto.lat,
    lng: ponto.lng,
  };
}

function componenteDoMapa(lugar, tipo, campo) {
  for (const parte of lugar.address_components || []) if (parte.types.indexOf(tipo) >= 0) return parte[campo || 'short_name'];
  return null;
}

// ── Decisões (sem tocar na Google; é isto que o teste cobre) ──────────────

/** Direção de texto, espaços invisíveis e hífenes tipográficos que o Google Contacts mete à volta dos telefones. */
function limpar(texto) {
  return String(texto || '')
    .replace(/[​-‏‪-‮⁦-⁩﻿]/g, '')
    .replace(/[   ]/g, ' ')
    .replace(/[‐-―−]/g, '-');
}

function normalizar(texto) {
  return limpar(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const NUMERO = '(?:\\d{1,3}(?:\\.\\d{3})+|\\d+)(?:[.,]\\d{1,2})?';
// O mesmo valor em euros que o CRM lê: "70€ (140€)", "50€/100€", "22,5 (55€)".
const VALOR = new RegExp('(' + NUMERO + ')\\s*(?:€(?:\\s*(?:\\(\\s*(' + NUMERO + ')\\s*€\\s*\\)?|\\/\\s*(' + NUMERO + ')\\s*€))?|\\(\\s*(' + NUMERO + ')\\s*€\\s*\\)?)');

/**
 * O CRM só conta um evento que comece por "Serviço" ou "Limpeza" e tenha um
 * valor. Aqui um "Serviço" sem valor também segue para a equipa: um serviço
 * sem preço escrito continua a ter de ser feito.
 */
function ehServico(titulo) {
  const inicio = normalizar(titulo);
  if (/^servico\b/.test(inicio)) return true;
  return /^limpeza\b/.test(inicio) && VALOR.test(limpar(titulo));
}

/** Igual a `localityFromPostalCode` do CRM (o teste compara os 9000 códigos). */
function regiaoPorCodigoPostal(codigo) {
  const n = Number(String(codigo).slice(0, 4));
  if (!Number.isInteger(n)) return null;
  if (n >= 2400 && n < 2500) return null;
  if (n >= 1000 && n < 3000) return 'Lisboa';
  if (n >= 7000 && n < 8000) return 'Lisboa';
  if (n >= 8000 && n < 9000) return 'Algarve';
  if ((n >= 4700 && n < 4780) || (n >= 4800 && n < 5000)) return 'Braga';
  if (n >= 3000 && n < 6000) return 'Porto';
  return null;
}

// O nome da rua não é o sítio ("Rua de Braga", "Avenida de Sintra"): corta-se
// do tipo de via até ao número da porta, à vírgula ou ao fim da linha.
const NOME_DE_RUA = /(^|[\s,.])(rua|r|avenida|av|travessa|tv|largo|praceta|praca|estrada|alameda|urbanizacao|urb|bairro|beco|calcada)[\s.][^,\n\d]*/g;

/** O sítio da lista que acaba mais tarde no texto (a cidade vem no fim da morada); em empate, o nome mais longo. */
function encontrarLugar(texto, lista) {
  const palheiro = ' ' + normalizar(texto).replace(NOME_DE_RUA, '$1 ').replace(/[^a-z0-9]+/g, ' ') + ' ';
  let melhor = null;
  for (const par of lista) {
    const agulha = ' ' + par[0].replace(/[^a-z0-9]+/g, ' ') + ' ';
    const em = palheiro.lastIndexOf(agulha);
    if (em < 0) continue;
    const fim = em + agulha.length;
    if (!melhor || fim > melhor.fim || (fim === melhor.fim && par[0].length > melhor.lugar.length)) {
      melhor = { lugar: par[0], regiao: par[1], fim: fim };
    }
  }
  return melhor;
}

const EQUIPA_ESCRITA = /\bequipa\s+(porto|braga|lisboa|algarve|coimbra)\b/;
const REGIAO_ESCRITA = { porto: 'Porto', braga: 'Braga', lisboa: 'Lisboa', algarve: 'Algarve', coimbra: 'Porto' };

/**
 * Por esta ordem: "equipa porto" (ou lisboa, braga, algarve) escrito no evento;
 * o código postal; os concelhos servidos; as freguesias desses concelhos. As
 * listas vêm do site (Lugares.gs) e são as mesmas que o CRM usa.
 */
function regiaoDoEvento(evento) {
  const origem = origemDaRegiao(evento);
  return origem ? origem.regiao : null;
}

/**
 * A região e de onde veio. `duvida` diz porque não é certa: uma freguesia
 * pode ser o apelido do cliente ou ter o mesmo nome noutro sítio (o CRM
 * marca-a "Rever" pela mesma razão). O resto conta como certo.
 */
function origemDaRegiao(evento) {
  const texto = [evento.location, evento.summary, evento.description].map(limpar).filter(Boolean).join('\n');
  const escrita = EQUIPA_ESCRITA.exec(normalizar(texto));
  if (escrita) return { regiao: REGIAO_ESCRITA[escrita[1]], duvida: null };
  const postal = /\b(\d{4})-\d{3}\b/.exec(texto);
  const pelaMorada = postal && regiaoPorCodigoPostal(postal[1]);
  if (pelaMorada) return { regiao: pelaMorada, duvida: null };
  const concelho = encontrarLugar(texto, LUGARES.concelhos);
  if (concelho) return { regiao: concelho.regiao, duvida: null };
  const freguesia = encontrarLugar(texto, LUGARES.freguesias);
  if (freguesia) return { regiao: freguesia.regiao, duvida: 'pela freguesia "' + freguesia.lugar + '", sem código postal nem concelho escritos' };
  return null;
}

/**
 * A equipa escrita no evento ("equipa lisboa 2", "equipa porto 2"), que ganha
 * a tudo e conta como certa.
 */
function equipaEscrita(evento) {
  const texto = normalizar([evento.location, evento.summary, evento.description].filter(Boolean).join('\n'));
  const escrito = /\bequipa\s+(braga|algarve|coimbra|(?:porto|lisboa)(?:\s*[12])?)\b/.exec(texto);
  if (!escrito) return null;
  const nome = escrito[1].replace(/^(porto|lisboa)\s*([12])$/, '$1 $2');
  return EQUIPAS.find(function (e) { return e.escrito.indexOf(nome) >= 0; }) || null;
}

/** "equipa porto 1", "equipa porto 2", … ou "equipa algarve": o que se escreve para escolher cada equipa. */
function equipasParaEscrever() {
  const nomes = EQUIPAS.map(function (e) { return '"equipa ' + e.escrito[e.escrito.length - 1] + '"'; });
  return nomes.slice(0, -1).join(', ') + ' ou ' + nomes[nomes.length - 1];
}

/**
 * A equipa da cor do evento, em qualquer região; null se a cor não é de
 * nenhuma (serviço por escolher). Antes de 29/09/2026 só valia no Porto (dono,
 * 28/09: "eu tenho que selecionar qual é cada, nenhum serviço do Porto é
 * automático"); a 29/09 passou a valer para todas.
 */
function equipaPelaCor(evento) {
  return EQUIPAS.find(function (e) { return e.cor === evento.colorId; }) || null;
}

function equipaDaRegiao(regiao) {
  return EQUIPAS.find(function (e) { return e.regioes.indexOf(regiao) >= 0; }) || null;
}

const TELEFONES = /(?:\+|00)\d[\d\s-]{6,}\d|(?<![\d-])[29]\d{2}\s?\d{3}\s?\d{3}(?![\d-])/g;
const PALAVRAS_DE_RUA = /^(rua|r\.|avenida|av\.?|travessa|tv\.?|largo|praceta|praca|estrada|alameda|urbanizacao|urb\.?|bairro|beco|calcada|quinta|lugar|lote|cp\b|edificio|edf\.?)/;

function pareceNome(texto) {
  const palavras = texto.split(/\s+/).filter(Boolean);
  return palavras.length >= 1 && palavras.length <= 4 && !/\d/.test(texto)
    && /^[\p{L}][\p{L}'.\s-]*$/u.test(texto) && !PALAVRAS_DE_RUA.test(normalizar(texto));
}

/**
 * A morada escrita no evento, para procurar no Maps: sem o primeiro bocado do
 * título (o serviço e os valores), sem telefones e sem o nome do cliente, que
 * é o bocado só com letras ao lado do telefone. No formato do dono
 * ("serviço - telefone - nome - morada") sobra a morada. Um título sem
 * separadores não tem morada à parte e não se procura.
 */
function moradaDoEvento(evento) {
  const partes = limpar(evento.summary).split(/\s+-\s*|\s*-\s+/).map(function (p) { return p.trim(); });
  partes.shift();
  const comTelefone = partes.map(function (p) { return p.replace(TELEFONES, ' ') !== p; });
  const morada = partes
    .map(function (p) { return p.replace(TELEFONES, ' ').replace(/\s+/g, ' ').trim(); })
    .filter(function (p, i) { return p && !(pareceNome(p) && (comTelefone[i] || comTelefone[i - 1] || comTelefone[i + 1])); });
  return [limpar(evento.location)].concat(morada).filter(Boolean).join(', ').replace(/\s*\n\s*/g, ', ').replace(/\s+/g, ' ').trim();
}

// Andar, lado e divisão da casa, já sem acentos: o Maps não os conhece e dá
// uma resposta parcial ("Rua X 28, cave esquerda").
const RUIDO_DA_MORADA = /(^|\s)(cave|sub-?cave|r\/c|rc|res-do-chao|res do chao|\d+\s*[ºª°]\.?\s*(andar)?|andar|esq\.?|esquerd[oa]|dt[oa]?\.?|direit[oa]|frente|tras|apto\.?|apartamento|fracao)(?=$|\s)/g;

/**
 * As pesquisas a fazer no Maps, por ordem: a morada como está; sem andar e
 * lado; e o último bocado, que é onde se costuma escrever a localidade.
 */
function pesquisasDoMapa(morada) {
  const inteira = morada.replace(/\s+/g, ' ').trim();
  // Os bocados que sobram depois de tirar o andar e o lado ("cave esquerda" não sobra).
  const partes = inteira.split(',').map(function (parte) { return parte.trim(); }).filter(function (parte) {
    return normalizar(parte).replace(RUIDO_DA_MORADA, ' ').trim();
  });
  const semRuido = partes
    .map(function (parte) { return normalizar(parte).replace(RUIDO_DA_MORADA, ' ').replace(/\s+/g, ' ').trim(); })
    .join(', ');
  const ultima = partes.length > 1 ? partes[partes.length - 1] : '';
  const vistas = {};
  return [inteira, semRuido, ultima].filter(function (pesquisa) {
    const chave = normalizar(pesquisa).replace(/[^a-z0-9]/g, '');
    if (!/[a-z]{3}/.test(chave) || vistas[chave]) return false;
    vistas[chave] = true;
    return true;
  });
}

function noContinente(lat, lng) {
  return lat > 36.9 && lat < 42.2 && lng > -9.6 && lng < -6.1;
}

/**
 * A equipa de uma morada encontrada no Maps: pelo código postal, com as regras
 * do CRM; fora de todas as regiões (Leiria, Beira Interior), a equipa com a
 * base mais perto. Ilhas e estrangeiro ficam sem equipa.
 */
function equipaPeloMapa(resultado) {
  if (!resultado || !resultado.encontrado) return null;
  const regiao = resultado.codigoPostal ? regiaoPorCodigoPostal(resultado.codigoPostal) : null;
  if (regiao) return equipaDaRegiao(regiao);
  if (!noContinente(resultado.lat, resultado.lng)) return null;
  let maisPerto = null;
  let menor = Infinity;
  for (const equipa of EQUIPAS) {
    if (!equipa.base) continue;
    const dLat = resultado.lat - equipa.base[0];
    const dLng = (resultado.lng - equipa.base[1]) * Math.cos(resultado.lat * Math.PI / 180);
    const distancia = dLat * dLat + dLng * dLng;
    if (distancia < menor) {
      menor = distancia;
      maisPerto = equipa;
    }
  }
  return maisPerto;
}

// "Equipa: Porto", na primeira linha da descrição do serviço do dono. Com dois
// pontos de propósito: "equipa porto" escrito à mão é uma ordem do dono
// (`equipaEscrita`), esta linha é só informação.
const LINHA_DA_EQUIPA = /^Equipa: [^\n<]*(?:\s*<br\s*\/?>|\n)*/i;

function semLinhaDaEquipa(evento) {
  const descricao = String(evento.description || '');
  if (!LINHA_DA_EQUIPA.test(descricao)) return evento;
  const limpo = {};
  for (const chave in evento) limpo[chave] = evento[chave];
  limpo.description = descricao.replace(LINHA_DA_EQUIPA, '');
  return limpo;
}

function descricaoComEquipa(descricao, equipaId) {
  const equipa = EQUIPAS.find(function (e) { return e.id === equipaId; });
  const resto = String(descricao || '').replace(LINHA_DA_EQUIPA, '');
  return 'Equipa: ' + equipa.nome.replace(/^Kyro · Equipa /, '') + (resto ? '\n\n' + resto : '');
}

/**
 * O que mudar num serviço do calendário do dono que ainda não acabou: a cor
 * da equipa e a linha "Equipa: …" no topo da descrição (dono, 28/09/2026: "eu
 * assim não vejo que equipa vai"). null se já está tudo certo.
 */
function marcaDaEquipa(origem, equipaId, agora) {
  const alteracao = {};
  const cor = corEmFalta(origem, equipaId, agora);
  if (cor) alteracao.colorId = cor;
  const descricao = descricaoComEquipa(origem.description, equipaId);
  if (fimEmMs(origem.end) > agora && descricao !== (origem.description || '')) alteracao.description = descricao;
  return Object.keys(alteracao).length ? alteracao : null;
}

/** A cor a pôr num serviço do calendário do dono: null se já acabou ou se já tem a da equipa. */
function corEmFalta(origem, equipaId, agora) {
  if (fimEmMs(origem.end) <= agora) return null;
  const equipa = EQUIPAS.find(function (e) { return e.id === equipaId; });
  if (!equipa || origem.colorId === equipa.cor) return null;
  return equipa.cor;
}

function nomeDaEquipa(id) {
  const equipa = EQUIPAS.find(function (e) { return e.id === id; });
  return equipa ? equipa.nome.replace(/^Kyro · /, '') : id;
}

/**
 * A cópia leva o mesmo instante do evento, mostrado na hora de Portugal. O
 * calendário do dono está no fuso de Copenhaga desde 23/08/2026 e a hora que
 * lá está é a de Copenhaga (dono, 28/09/2026: "estou com uma hora de avanço";
 * um serviço às 15:00 no calendário dele é às 14:00 em Portugal). Não se
 * copiam os números do relógio: isso punha a equipa uma hora atrasada.
 */
function horaEmPortugal(momento) {
  if (momento.date) return { date: momento.date };
  const relogio = Utilities.formatDate(new Date(momento.dateTime), FUSO_PORTUGAL, "yyyy-MM-dd'T'HH:mm:ss");
  return { dateTime: relogio, timeZone: FUSO_PORTUGAL };
}

function fimEmMs(momento) {
  return Date.parse(momento.dateTime || momento.date + 'T00:00:00Z');
}

/** Um resumo curto de um texto, para saber se a cópia mudou sem guardar o texto. */
function resumo(texto) {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h * 33) ^ texto.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function propriedadePrivada(evento, chave) {
  const privadas = evento.extendedProperties && evento.extendedProperties.private;
  return (privadas && privadas[chave]) || null;
}

/**
 * As cópias que alguém mudou à mão depois da última escrita do script: o
 * conteúdo já não bate com a assinatura guardada, a cópia foi mudada depois do
 * evento do dono, e o título ou as horas são diferentes dos dele. O dono fê-lo
 * a 29/09/2026 (mudou um serviço de 1 para 16/10 na cópia da Lisboa 1) e o
 * evento dele, que é o que o CRM lê, ficou no dia 1. Passa para o evento do
 * dono o título e as horas da cópia; a equipa recebe depois o aviso de
 * alteração, como se ele tivesse mudado o seu. O fuso do evento do dono fica.
 */
function edicoesNasCopias(existentes, eventosDoDono) {
  const porId = new Map(eventosDoDono.map(function (e) { return [e.id, e]; }));
  const edicoes = [];
  for (const existente of existentes) {
    const copia = existente.evento;
    const origem = porId.get(existente.origemId);
    if (!origem || origem.status === 'cancelled' || copia.status === 'cancelled') continue;
    const conteudo = resumo(JSON.stringify([copia.summary || '', copia.location || '', copia.description || '', horaEmPortugal(copia.start), horaEmPortugal(copia.end)]));
    if (conteudo === propriedadePrivada(copia, 'kyroAssinatura')) continue;
    if (!(Date.parse(copia.updated) > Date.parse(origem.updated))) continue;
    const alteracao = {};
    if ((copia.summary || '') !== (origem.summary || '')) alteracao.summary = copia.summary || '';
    for (const ponta of ['start', 'end']) {
      if (fimEmMs(copia[ponta]) === fimEmMs(origem[ponta])) continue;
      alteracao[ponta] = copia[ponta].date
        ? { date: copia[ponta].date }
        : { dateTime: new Date(fimEmMs(copia[ponta])).toISOString(), timeZone: origem[ponta].timeZone || copia[ponta].timeZone };
    }
    if (Object.keys(alteracao).length) edicoes.push({ origem: origem, alteracao: alteracao });
  }
  return edicoes;
}

/** `moradaNoMapa`: a morada que o Maps encontrou, que vai para o "Onde" da cópia quando o evento não tem local. */
function corpoDaCopia(origem, moradaNoMapa) {
  const corpo = {
    summary: origem.summary || '',
    location: origem.location || moradaNoMapa || '',
    description: origem.description || '',
    start: horaEmPortugal(origem.start),
    end: horaEmPortugal(origem.end),
  };
  corpo.reminders = { useDefault: true };
  corpo.extendedProperties = {
    private: {
      kyroOrigem: origem.id,
      kyroAssinatura: resumo(JSON.stringify([corpo.summary, corpo.location, corpo.description, corpo.start, corpo.end])),
    },
  };
  return corpo;
}

/**
 * A cópia que cada serviço devia ter, por id do evento original, e os
 * `porEscolher`: serviços sem a cor de nenhuma equipa nem "equipa X" escrito,
 * que não seguem para nenhuma até o dono escolher. `procurarNoMapa(morada)`
 * serve para dar à equipa a morada do Maps quando o evento não tem local, e
 * para dizer ao dono em que zona parece ser um serviço por escolher.
 */
function copiasDesejadas(origens, procurarNoMapa) {
  const copias = new Map();
  const porEscolher = [];
  for (const original of origens) {
    // A linha "Equipa: …" que o script escreve na descrição não conta para
    // nada: nem para a equipa, nem para a cópia, nem para os avisos.
    const origem = semLinhaDaEquipa(original);
    if (origem.status === 'cancelled' || !ehServico(origem.summary)) continue;
    // O que está escrito ganha à cor.
    const equipa = equipaEscrita(origem) || equipaPelaCor(origem);
    if (!equipa) {
      porEscolher.push({ evento: origem, zona: zonaDoEvento(origem, procurarNoMapa) });
      continue;
    }
    const noMapa = origem.location ? null : procurarMorada(origem, procurarNoMapa);
    const pelaMorada = noMapa && noMapa.encontrado ? noMapa.morada : null;
    copias.set(origem.id, {
      equipaId: equipa.id,
      corpo: corpoDaCopia(origem, pelaMorada),
      fimMs: fimEmMs(origem.end),
      pelaMorada: pelaMorada,
      origem: original,
    });
  }
  return { copias: copias, porEscolher: porEscolher };
}

/** A resposta do Maps para a morada do evento (sem o serviço, o telefone e o nome), ou null. */
function procurarMorada(origem, procurarNoMapa) {
  const morada = procurarNoMapa ? moradaDoEvento(origem) : '';
  return (morada && procurarNoMapa(morada)) || null;
}

/**
 * A região onde parece ser o serviço, para o aviso ao dono. É só uma pista:
 * quem escolhe a equipa é sempre ele.
 */
function zonaDoEvento(origem, procurarNoMapa) {
  const pelaLista = origemDaRegiao(origem);
  if (pelaLista) return pelaLista.regiao;
  const equipa = equipaPeloMapa(procurarMorada(origem, procurarNoMapa));
  return equipa && equipa.regioes.length ? equipa.regioes[0] : null;
}

/**
 * O que fazer para as cópias ficarem iguais ao teu calendário. Uma cópia que
 * não devia existir apaga-se; uma que mudou de equipa sai de uma e entra na
 * outra. Só se avisa a equipa de serviços que ainda não acabaram, e nunca na
 * primeira volta (as equipas veem o calendário todo quando o recebem). Um
 * serviço adiado (o Maps não respondeu) não mexe na cópia que já tiver. Um
 * serviço do Porto por escolher fica onde está se já estiver numa equipa do
 * Porto, e sai de qualquer outra (a morada passou para o Porto).
 */
function planear(desejadas, existentes, agora, silencioso, porEscolher) {
  const acoes = [];
  const vistas = new Set();
  const aviso = function (tipo, fimMs) { return !silencioso && fimMs > agora ? tipo : null; };
  for (const existente of existentes) {
    const copia = existente.evento;
    if (vistas.has(existente.origemId)) {
      acoes.push({ tipo: 'apagar', equipaId: existente.equipaId, copia: copia, aviso: null });
      continue;
    }
    vistas.add(existente.origemId);
    // Enquanto o dono não escolhe a equipa (tirou a cor, por exemplo), a cópia
    // que já existe fica como está.
    if (porEscolher && porEscolher.has(existente.origemId)) continue;
    const desejada = desejadas.get(existente.origemId);
    if (!desejada) {
      acoes.push({ tipo: 'apagar', equipaId: existente.equipaId, copia: copia, aviso: aviso('cancelado', fimEmMs(copia.end)) });
    } else if (desejada.equipaId !== existente.equipaId) {
      acoes.push({ tipo: 'apagar', equipaId: existente.equipaId, copia: copia, aviso: aviso('retirado', fimEmMs(copia.end)) });
      acoes.push({ tipo: 'criar', equipaId: desejada.equipaId, corpo: desejada.corpo, aviso: aviso('novo', desejada.fimMs) });
    } else if (propriedadePrivada(copia, 'kyroAssinatura') !== desejada.corpo.extendedProperties.private.kyroAssinatura) {
      const fim = Math.max(fimEmMs(copia.end), desejada.fimMs);
      acoes.push({ tipo: 'atualizar', equipaId: existente.equipaId, copia: copia, corpo: desejada.corpo, aviso: aviso('alterado', fim) });
    }
  }
  desejadas.forEach(function (desejada, origemId) {
    if (!vistas.has(origemId)) acoes.push({ tipo: 'criar', equipaId: desejada.equipaId, corpo: desejada.corpo, aviso: aviso('novo', desejada.fimMs) });
  });
  return acoes;
}

const DIAS_DA_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

/** "domingo, 27/09, das 12:00 às 13:00", a partir da hora de Portugal. */
function quando(inicio, fim) {
  const dia = (inicio.dateTime || inicio.date).slice(0, 10).split('-').map(Number);
  const semana = DIAS_DA_SEMANA[new Date(Date.UTC(dia[0], dia[1] - 1, dia[2])).getUTCDay()];
  const data = semana + ', ' + String(dia[2]).padStart(2, '0') + '/' + String(dia[1]).padStart(2, '0');
  if (!inicio.dateTime) return data + ', dia inteiro';
  return data + ', das ' + inicio.dateTime.slice(11, 16) + ' às ' + fim.dateTime.slice(11, 16);
}

function mensagemParaEquipa(acao, equipa) {
  const nome = equipa.nome.replace(/^Kyro · /, '');
  const atual = acao.corpo || acao.copia;
  const dataAtual = quando(atual.start, atual.end);
  const textos = {
    novo: ['Novo serviço: ', 'Novo serviço para a ' + nome + '.'],
    alterado: ['Serviço alterado: ', 'Um serviço da ' + nome + ' foi alterado.'],
    cancelado: ['Serviço cancelado: ', 'Este serviço foi cancelado e saiu da agenda da ' + nome + '.'],
    retirado: ['Serviço retirado: ', 'Este serviço passou para outra equipa e saiu da agenda da ' + nome + '.'],
  }[acao.aviso];
  const linhas = [textos[1], '', atual.summary, '', 'Quando: ' + dataAtual];
  if (atual.location) linhas.push('Onde: ' + atual.location);
  if (acao.aviso === 'alterado') {
    const dataAntes = quando(acao.copia.start, acao.copia.end);
    if (dataAntes !== dataAtual) linhas.push('Antes: ' + dataAntes);
    if ((acao.copia.summary || '') !== (atual.summary || '')) linhas.push('', 'Antes estava escrito:', acao.copia.summary || '');
  }
  if (atual.description) linhas.push('', atual.description);
  if (acao.aviso === 'novo' || acao.aviso === 'alterado') linhas.push('', 'Está no calendário "' + equipa.nome + '".');
  return { assunto: textos[0] + dataAtual, texto: linhas.join('\n') };
}

/**
 * Os serviços por escolher de que o dono ainda não foi avisado (ou que mudaram
 * desde o aviso). `atuais` é o que fica guardado para a volta seguinte.
 */
function escolhasNovas(porEscolher, guardadas, agora) {
  return avisosNovos(porEscolher, 'escolher:', guardadas, agora);
}

/**
 * Os serviços criados à mão no calendário de uma equipa que passam para o
 * calendário do dono. No telemóvel, a app grava o evento novo no último
 * calendário usado, e a 29/09/2026 quatro serviços ficaram nos calendários
 * da Porto 1, Porto 2 e Lisboa 1: não entravam no CRM, que só lê o calendário
 * do dono. Passam com a cor da equipa onde estavam: escolher o calendário da
 * equipa na app é a forma de o dono escolher a equipa (30/09/2026, depois de
 * uma versão que os passava sem cor e lhe desfazia a escolha: "selecionei a
 * equipa de Lisboa e passado vinte segundos desseleciona"). Daí seguem como
 * os outros: entram no CRM e a cópia volta a ser feita na equipa escolhida. Não passa o que não é serviço (título sem "Serviço") nem
 * o que o dono já tem no calendário dele com o mesmo título e a mesma hora
 * (recriado à mão sem apagar o da equipa): isso ficaria a dobrar no CRM, e
 * esses continuam a dar o aviso de `criadosAMao`.
 */
function paraMover(eventosDasEquipas, eventosDoDono) {
  const chave = function (evento) {
    const inicio = evento.start && (evento.start.dateTime || evento.start.date);
    return normalizar(evento.summary || '').replace(/\s+/g, ' ').trim() + '|' + Date.parse(inicio);
  };
  const doDono = new Set(eventosDoDono.filter(function (e) { return e.status !== 'cancelled'; }).map(chave));
  return criadosAMao(eventosDasEquipas).filter(function (item) {
    return ehServico(item.evento.summary || '') && !doDono.has(chave(item.evento));
  });
}

/**
 * Os eventos que estão no calendário de uma equipa sem terem sido copiados
 * pelo script (sem `kyroOrigem`). Os serviços passam para o calendário do
 * dono (`paraMover`); os que ficarem (não são serviço, já existiam no dele,
 * ou a mudança falhou) geram um aviso ao dono.
 */
function criadosAMao(eventosDasEquipas) {
  return eventosDasEquipas.filter(function (item) {
    return item.evento.status !== 'cancelled' && !propriedadePrivada(item.evento, 'kyroOrigem');
  });
}

/** O mesmo aviso dos outros: uma vez por evento, e outra se ele ou a equipa mudarem. */
function aMaoNovos(itens, guardadas, agora) {
  return avisosNovos(itens, 'mao:', guardadas, agora);
}

function avisosNovos(itens, prefixo, guardadas, agora) {
  const novos = [];
  const atuais = {};
  for (const item of itens) {
    const evento = item.evento;
    if (fimEmMs(evento.end) <= agora) continue;
    const chave = prefixo + evento.id;
    atuais[chave] = resumo(JSON.stringify([evento.summary || '', evento.location || '', evento.description || '', item.equipaId || '']));
    if (guardadas[chave] !== atuais[chave]) novos.push(item);
  }
  return { novos: novos, atuais: atuais };
}

/**
 * Um só email por volta: os serviços à espera que o dono escolha a equipa e os
 * criados à mão no calendário de uma equipa. As horas são as de Portugal.
 */
function mensagemParaDono(porEscolher, aMao) {
  porEscolher = porEscolher || [];
  aMao = aMao || [];
  const linha = function (evento) { return '• ' + quando(horaEmPortugal(evento.start), horaEmPortugal(evento.end)) + ' (hora de Portugal)'; };
  const linhas = [];
  if (aMao.length) {
    linhas.push((aMao.length === 1 ? 'Este serviço foi criado' : 'Estes serviços foram criados') + ' diretamente no calendário de uma equipa, e não no teu:', '');
    for (const item of aMao) linhas.push(linha(item.evento), '  ' + (item.evento.summary || '(sem título)'), '  → está no calendário da ' + nomeDaEquipa(item.equipaId), '');
    linhas.push(
      'Assim não entra no CRM, não fica com a cor da equipa no teu calendário e não muda de equipa sozinho.',
      'Cria-o no teu calendário, com a cor da equipa, e apaga este do calendário da equipa.'
    );
  }
  if (porEscolher.length) {
    if (linhas.length) linhas.push('', '');
    linhas.push((porEscolher.length === 1 ? 'Este serviço está' : 'Estes serviços estão') + ' à espera que escolhas a equipa:', '');
    for (const item of porEscolher) {
      linhas.push(linha(item.evento), '  ' + item.evento.summary);
      if (item.zona) linhas.push('  (a morada parece ser da zona ' + item.zona + ')');
      linhas.push('');
    }
    linhas.push('No teu calendário, dá ao evento a cor da equipa:');
    for (const equipa of EQUIPAS) linhas.push('  ' + equipa.nomeDaCor + ' = ' + nomeDaEquipa(equipa.id));
    linhas.push('', 'Ou escreve no evento ' + equipasParaEscrever() + '. Assim que guardares, o serviço segue para essa equipa.');
  }
  let assunto;
  if (aMao.length && porEscolher.length) assunto = 'Serviços para confirmar';
  else if (aMao.length) assunto = aMao.length === 1 ? 'Serviço criado fora do teu calendário' : aMao.length + ' serviços criados fora do teu calendário';
  else assunto = porEscolher.length === 1 ? 'Escolhe a equipa deste serviço' : 'Escolhe a equipa de ' + porEscolher.length + ' serviços';
  return { assunto: assunto, texto: linhas.join('\n') };
}
