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

// Cada região do CRM vai para uma equipa. Braga segue com o Porto e o Algarve
// com Lisboa (decisão do dono, 28/09/2026). Uma equipa nova é uma linha nova,
// e o `configurar()` cria-lhe o calendário.
const EQUIPAS = [
  { id: 'porto', nome: 'Kyro · Equipa Porto', regioes: ['Porto', 'Braga'] },
  { id: 'lisboa', nome: 'Kyro · Equipa Lisboa', regioes: ['Lisboa', 'Algarve'] },
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
    if (guardado && lerCalendario(guardado)) continue;
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
  const desejadas = copiasDesejadas(fonte.eventos, fonte.fuso);
  for (const evento of fonte.eventos) {
    if (!ehServico(evento.summary)) continue;
    const copia = desejadas.copias.get(evento.id);
    const equipa = copia ? nomeDaEquipa(copia.equipaId) : 'SEM EQUIPA';
    Logger.log(equipa + ' · ' + quando(horaEmPortugal(evento.start, fonte.fuso), horaEmPortugal(evento.end, fonte.fuso)) + ' · ' + evento.summary);
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
  for (const equipa of EQUIPAS) {
    const id = propriedades.getProperty('calendario:' + equipa.id);
    if (!id) throw new Error('Falta o calendário "' + equipa.nome + '": corre configurar() no editor.');
    calendarios[equipa.id] = id;
    for (const copia of listarEventos(id, inicio, fim, FUSO_PORTUGAL).eventos) {
      const origemId = propriedadePrivada(copia, 'kyroOrigem');
      if (origemId) existentes.push({ equipaId: equipa.id, evento: copia, origemId: origemId });
    }
  }

  const fonte = listarEventos('primary', inicio, fim, null);
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

  const desejadas = copiasDesejadas(fonte.eventos, fonte.fuso);
  const silencioso = !propriedades.getProperty('primeiraVoltaFeita');
  const acoes = planear(desejadas.copias, existentes, agora, silencioso);

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
    if (chave.indexOf('pendente:') === 0) guardadas[chave] = propriedades.getProperty(chave);
  }
  const pendentes = pendentesNovos(desejadas.pendentes, guardadas, agora);
  for (const chave in guardadas) if (!(chave in pendentes.atuais)) propriedades.deleteProperty(chave);
  propriedades.setProperties(pendentes.atuais);
  if (pendentes.novos.length) {
    const mensagem = mensagemParaDono(pendentes.novos, fonte.fuso);
    MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), subject: mensagem.assunto, body: mensagem.texto, name: 'Calendários das equipas' });
  }

  if (silencioso) propriedades.setProperty('primeiraVoltaFeita', new Date(agora).toISOString());
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

const EQUIPA_ESCRITA = /\bequipa\s+(porto|braga|lisboa|algarve)\b/;
const REGIAO_ESCRITA = { porto: 'Porto', braga: 'Braga', lisboa: 'Lisboa', algarve: 'Algarve' };

/**
 * Por esta ordem: "equipa porto" (ou lisboa, braga, algarve) escrito no evento;
 * o código postal; os concelhos servidos; as freguesias desses concelhos. As
 * listas vêm do site (Lugares.gs) e são as mesmas que o CRM usa.
 */
function regiaoDoEvento(evento) {
  const texto = [evento.location, evento.summary, evento.description].map(limpar).filter(Boolean).join('\n');
  const escrita = EQUIPA_ESCRITA.exec(normalizar(texto));
  if (escrita) return REGIAO_ESCRITA[escrita[1]];
  const postal = /\b(\d{4})-\d{3}\b/.exec(texto);
  const pelaMorada = postal && regiaoPorCodigoPostal(postal[1]);
  if (pelaMorada) return pelaMorada;
  const lugar = encontrarLugar(texto, LUGARES.concelhos) || encontrarLugar(texto, LUGARES.freguesias);
  return lugar ? lugar.regiao : null;
}

function equipaDaRegiao(regiao) {
  return EQUIPAS.find(function (e) { return e.regioes.indexOf(regiao) >= 0; }) || null;
}

function nomeDaEquipa(id) {
  const equipa = EQUIPAS.find(function (e) { return e.id === id; });
  return equipa ? equipa.nome.replace(/^Kyro · /, '') : id;
}

/**
 * A hora que escreveste no evento é a hora de Portugal (dono, 28/09/2026: "a
 * hora para eles tem de ser sempre em Portugal"). Desde 23/08/2026 o teu
 * calendário está no fuso de Copenhaga, por isso um serviço marcado para as
 * 15:00 fica guardado às 15:00 de Copenhaga, que são 14:00 em Portugal. A
 * cópia leva os números que escreveste (15:00), no fuso de Portugal. Um
 * evento criado com o calendário no fuso de Lisboa não muda.
 */
function horaEmPortugal(momento, fusoDoCalendario) {
  if (momento.date) return { date: momento.date };
  const fuso = momento.timeZone || fusoDoCalendario || FUSO_PORTUGAL;
  const relogio = Utilities.formatDate(new Date(momento.dateTime), fuso, "yyyy-MM-dd'T'HH:mm:ss");
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

function corpoDaCopia(origem, fusoDoCalendario) {
  const corpo = {
    summary: origem.summary || '',
    location: origem.location || '',
    description: origem.description || '',
    start: horaEmPortugal(origem.start, fusoDoCalendario),
    end: horaEmPortugal(origem.end, fusoDoCalendario),
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
 * serviços que não se sabe a que equipa mandar.
 */
function copiasDesejadas(origens, fusoDoCalendario) {
  const copias = new Map();
  const pendentes = [];
  for (const origem of origens) {
    if (origem.status === 'cancelled' || !ehServico(origem.summary)) continue;
    const equipa = equipaDaRegiao(regiaoDoEvento(origem));
    if (!equipa) {
      pendentes.push(origem);
      continue;
    }
    copias.set(origem.id, { equipaId: equipa.id, corpo: corpoDaCopia(origem, fusoDoCalendario), fimMs: fimEmMs(origem.end) });
  }
  return { copias: copias, pendentes: pendentes };
}

/**
 * O que fazer para as cópias ficarem iguais ao teu calendário. Uma cópia que
 * não devia existir apaga-se; uma que mudou de equipa sai de uma e entra na
 * outra. Só se avisa a equipa de serviços que ainda não acabaram, e nunca na
 * primeira volta (as equipas veem o calendário todo quando o recebem).
 */
function planear(desejadas, existentes, agora, silencioso) {
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
 * Os serviços sem equipa de que o dono ainda não foi avisado (ou que mudaram
 * desde o aviso). `atuais` é o que fica guardado para a volta seguinte.
 */
function pendentesNovos(pendentes, guardadas, agora) {
  const novos = [];
  const atuais = {};
  for (const evento of pendentes) {
    if (fimEmMs(evento.end) <= agora) continue;
    const chave = 'pendente:' + evento.id;
    atuais[chave] = resumo(JSON.stringify([evento.summary || '', evento.location || '', evento.description || '']));
    if (guardadas[chave] !== atuais[chave]) novos.push(evento);
  }
  return { novos: novos, atuais: atuais };
}

function mensagemParaDono(eventos, fusoDoCalendario) {
  const linhas = ['Não sei a que equipa mandar ' + (eventos.length === 1 ? 'este serviço' : 'estes serviços') + ':', ''];
  for (const evento of eventos) {
    linhas.push('• ' + quando(horaEmPortugal(evento.start, fusoDoCalendario), horaEmPortugal(evento.end, fusoDoCalendario)));
    linhas.push('  ' + evento.summary);
  }
  linhas.push(
    '',
    'Acrescenta o código postal à morada (por exemplo 4000-123) ou escreve "equipa porto" ou "equipa lisboa" no evento.',
    'Assim que guardares, o serviço segue para a equipa certa.'
  );
  return { assunto: eventos.length === 1 ? 'Serviço sem equipa' : eventos.length + ' serviços sem equipa', texto: linhas.join('\n') };
}
