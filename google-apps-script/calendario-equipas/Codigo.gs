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
// 10 Basílico, 6 Tangerina, 5 Banana) e `corDoCalendario` é a mesma cor no
// calendário da equipa, para as duas coisas baterem certo.
const EQUIPAS = [
  { id: 'porto', nome: 'Kyro · Equipa Porto', regioes: ['Porto'], base: [41.1496, -8.6110], cor: '9', corDoCalendario: '#3f51b5' },
  { id: 'braga', nome: 'Kyro · Equipa Braga', regioes: ['Braga'], base: [41.5454, -8.4265], cor: '10', corDoCalendario: '#0b8043' },
  { id: 'lisboa', nome: 'Kyro · Equipa Lisboa', regioes: ['Lisboa'], base: [38.7223, -9.1393], cor: '6', corDoCalendario: '#f4511e' },
  { id: 'algarve', nome: 'Kyro · Equipa Algarve', regioes: ['Algarve'], base: [37.0194, -7.9304], cor: '5', corDoCalendario: '#f6bf26' },
];

// Muda quando as cores das equipas mudarem, para os calendários voltarem a ser pintados.
const VERSAO_DAS_CORES = '1';

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
  const mapa = mapaComMemoria(PropertiesService.getScriptProperties());
  const desejadas = copiasDesejadas(fonte.eventos, mapa.procurar);
  mapa.guardar(false);
  for (const evento of fonte.eventos) {
    if (!ehServico(evento.summary)) continue;
    const copia = desejadas.copias.get(evento.id);
    const equipa = copia ? nomeDaEquipa(copia.equipaId) : desejadas.adiados.has(evento.id) ? 'MAPA SEM RESPOSTA' : 'SEM EQUIPA';
    const incerto = desejadas.incertos.find(function (i) { return i.evento.id === evento.id; });
    const duvida = incerto ? ' (sem certeza: ' + incerto.duvida + ')' : '';
    Logger.log(equipa + duvida + ' · ' + quando(horaEmPortugal(evento.start), horaEmPortugal(evento.end)) + ' · ' + evento.summary);
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

  const mapa = mapaComMemoria(propriedades);
  const desejadas = copiasDesejadas(fonte.eventos, mapa.procurar);
  mapa.guardar();
  const silencioso = !propriedades.getProperty('primeiraVoltaFeita');
  const acoes = planear(desejadas.copias, existentes, agora, silencioso, desejadas.adiados);

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
    if (chave.indexOf('pendente:') === 0 || chave.indexOf('incerto:') === 0) guardadas[chave] = propriedades.getProperty(chave);
  }
  const pendentes = pendentesNovos(desejadas.pendentes, guardadas, agora);
  const incertos = incertosNovos(desejadas.incertos, guardadas, agora);
  for (const chave in guardadas) if (!(chave in pendentes.atuais) && !(chave in incertos.atuais)) propriedades.deleteProperty(chave);
  propriedades.setProperties(pendentes.atuais);
  propriedades.setProperties(incertos.atuais);
  if (pendentes.novos.length || incertos.novos.length) {
    const mensagem = mensagemParaDono(pendentes.novos, incertos.novos);
    MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), subject: mensagem.assunto, body: mensagem.texto, name: 'Calendários das equipas' });
  }

  pintarServicos(desejadas.copias, propriedades, agora);
  pintarCalendarios(calendarios, propriedades);

  if (silencioso) propriedades.setProperty('primeiraVoltaFeita', new Date(agora).toISOString());
}

/**
 * Pinta no calendário do dono os serviços novos com a cor da equipa (dono,
 * 28/09/2026: "pinta apenas os novos"). Os que já existiam quando as cores
 * foram ligadas não se tocam: mudar um evento mexe na data de alteração, e o
 * CRM trata um evento alterado depois da linha como a versão mais recente,
 * por isso apagaria as correções que o dono lá fez. Um serviço novo é pintado
 * segundos depois de ser criado, antes de haver correções.
 */
function pintarServicos(copias, propriedades, agora) {
  let desde = Number(propriedades.getProperty('coresDesde'));
  if (!desde) {
    desde = agora;
    propriedades.setProperty('coresDesde', String(agora));
  }
  copias.forEach(function (copia) {
    const cor = corEmFalta(copia.origem, copia.equipaId, desde);
    if (cor) Calendar.Events.patch({ colorId: cor }, 'primary', copia.origem.id, { sendUpdates: 'none' });
  });
}

/** Os calendários das equipas com a mesma cor dos serviços, na lista do dono. Uma vez por versão das cores. */
function pintarCalendarios(calendarios, propriedades) {
  if (propriedades.getProperty('coresDosCalendarios') === VERSAO_DAS_CORES) return;
  for (const equipa of EQUIPAS) {
    Calendar.CalendarList.patch({ backgroundColor: equipa.corDoCalendario, foregroundColor: '#ffffff' }, calendarios[equipa.id], { colorRgbFormat: true });
  }
  propriedades.setProperty('coresDosCalendarios', VERSAO_DAS_CORES);
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

const EQUIPA_ESCRITA = /\bequipa\s+(porto|braga|lisboa|algarve)\b/;
const REGIAO_ESCRITA = { porto: 'Porto', braga: 'Braga', lisboa: 'Lisboa', algarve: 'Algarve' };

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

/** Uma equipa escolhida pelo Maps nunca é certa: diz-se o que o Maps encontrou. */
function duvidaDoMapa(resultado) {
  const foraDasRegioes = !(resultado.codigoPostal && regiaoPorCodigoPostal(resultado.codigoPostal));
  return 'pelo Google Maps, que encontrou "' + resultado.morada + '"'
    + (resultado.parcial ? ' (só parte da morada)' : '')
    + (foraDasRegioes ? ', fora das zonas das equipas: foi a equipa mais perto' : '');
}

/**
 * A cor a pôr num serviço do calendário do dono, ou null se não é preciso:
 * só serviços criados depois de as cores serem ligadas, e só quando a cor
 * ainda não é a da equipa (um serviço que muda de equipa muda de cor).
 */
function corEmFalta(origem, equipaId, desdeMs) {
  if (!origem.created || Date.parse(origem.created) < desdeMs) return null;
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
 * A cópia que cada serviço devia ter, por id do evento original; os serviços
 * que não se sabe a que equipa mandar; os `incertos`, que seguem para uma
 * equipa mas de que o dono é avisado (dono, 28/09/2026: "quando não tiveres
 * 100% certeza envia-me um alerta no email"); e os `adiados`, cuja morada o
 * Maps não conseguiu procurar agora (a cópia que tiverem fica como está).
 * `procurarNoMapa(morada)` só é chamado quando o código postal e as listas do
 * site não chegam.
 */
function copiasDesejadas(origens, procurarNoMapa) {
  const copias = new Map();
  const pendentes = [];
  const incertos = [];
  const adiados = new Set();
  for (const origem of origens) {
    if (origem.status === 'cancelled' || !ehServico(origem.summary)) continue;
    const pelaLista = origemDaRegiao(origem);
    let equipa = pelaLista ? equipaDaRegiao(pelaLista.regiao) : null;
    let duvida = pelaLista ? pelaLista.duvida : null;
    let pelaMorada = null;
    const morada = !equipa && procurarNoMapa ? moradaDoEvento(origem) : '';
    if (morada) {
      const resultado = procurarNoMapa(morada);
      if (resultado === undefined) {
        adiados.add(origem.id);
        continue;
      }
      equipa = equipaPeloMapa(resultado);
      if (equipa) {
        pelaMorada = resultado.morada;
        duvida = duvidaDoMapa(resultado);
      }
    }
    if (!equipa) {
      pendentes.push(origem);
      continue;
    }
    copias.set(origem.id, {
      equipaId: equipa.id,
      corpo: corpoDaCopia(origem, pelaMorada),
      fimMs: fimEmMs(origem.end),
      pelaMorada: pelaMorada,
      origem: origem,
    });
    if (duvida) incertos.push({ evento: origem, equipaId: equipa.id, duvida: duvida });
  }
  return { copias: copias, pendentes: pendentes, incertos: incertos, adiados: adiados };
}

/**
 * O que fazer para as cópias ficarem iguais ao teu calendário. Uma cópia que
 * não devia existir apaga-se; uma que mudou de equipa sai de uma e entra na
 * outra. Só se avisa a equipa de serviços que ainda não acabaram, e nunca na
 * primeira volta (as equipas veem o calendário todo quando o recebem). Um
 * serviço adiado (o Maps não respondeu) não mexe na cópia que já tiver.
 */
function planear(desejadas, existentes, agora, silencioso, adiados) {
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
    if (adiados && adiados.has(existente.origemId)) continue;
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
  return avisosNovos(pendentes.map(function (evento) { return { evento: evento }; }), 'pendente:', guardadas, agora);
}

/** O mesmo para os serviços enviados sem certeza: outro aviso se o evento ou a equipa mudarem. */
function incertosNovos(incertos, guardadas, agora) {
  return avisosNovos(incertos, 'incerto:', guardadas, agora);
}

function avisosNovos(itens, prefixo, guardadas, agora) {
  const novos = [];
  const atuais = {};
  for (const item of itens) {
    const evento = item.evento;
    if (fimEmMs(evento.end) <= agora) continue;
    const chave = prefixo + evento.id;
    atuais[chave] = resumo(JSON.stringify([evento.summary || '', evento.location || '', evento.description || '', item.equipaId || '']));
    if (guardadas[chave] !== atuais[chave]) novos.push(prefixo === 'pendente:' ? evento : item);
  }
  return { novos: novos, atuais: atuais };
}

/** Um só email por volta: os serviços sem equipa e os enviados sem certeza. As horas são as de Portugal. */
function mensagemParaDono(semEquipa, incertos) {
  incertos = incertos || [];
  const linha = function (evento) { return '• ' + quando(horaEmPortugal(evento.start), horaEmPortugal(evento.end)) + ' (hora de Portugal)'; };
  const linhas = [];
  if (incertos.length) {
    linhas.push('Enviei ' + (incertos.length === 1 ? 'este serviço' : 'estes serviços') + ' sem ter a certeza da equipa. Confirma:', '');
    for (const item of incertos) {
      linhas.push(linha(item.evento), '  ' + item.evento.summary, '  → ' + nomeDaEquipa(item.equipaId) + ', ' + item.duvida, '');
    }
    linhas.push('Se a equipa estiver errada, escreve no evento "equipa porto", "equipa braga", "equipa lisboa" ou "equipa algarve", ou o código postal. O serviço muda sozinho de equipa.');
  }
  if (semEquipa.length) {
    if (linhas.length) linhas.push('', '');
    linhas.push('Nem o código postal, nem a localidade, nem o Google Maps disseram onde ' + (semEquipa.length === 1 ? 'é este serviço' : 'são estes serviços') + ':', '');
    for (const evento of semEquipa) linhas.push(linha(evento), '  ' + evento.summary);
    linhas.push(
      '',
      'Acrescenta o código postal à morada (por exemplo 4000-123) ou escreve no evento "equipa porto", "equipa braga", "equipa lisboa" ou "equipa algarve".',
      'Assim que guardares, o serviço segue para a equipa certa.'
    );
  }
  let assunto;
  if (semEquipa.length && incertos.length) assunto = 'Serviços para confirmar';
  else if (semEquipa.length) assunto = semEquipa.length === 1 ? 'Serviço sem equipa' : semEquipa.length + ' serviços sem equipa';
  else assunto = incertos.length === 1 ? 'Serviço enviado sem certeza' : incertos.length + ' serviços enviados sem certeza';
  return { assunto: assunto, texto: linhas.join('\n') };
}
