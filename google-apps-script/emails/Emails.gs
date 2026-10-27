/**
 * Kyro · Emails. Corre na conta cleansolutions.pt25@gmail.com (projeto Apps Script
 * "Kyro · Emails"), não no site: um push para o GitHub não o atualiza.
 *
 * O dono, 27/10/2026: "estás-me a mandar demasiados alertas por e-mail e os e-mails
 * estão a ficar esquecidos. Quando me enviam um e-mail tu devias responder
 * automaticamente ao e-mail e eu devia de alguma forma mais fácil saber que recebi
 * um e-mail." Em 38 horas tinham chegado ~45 alertas do bot e os emails dos clientes
 * ficavam no meio deles. Escolhas dele no mesmo dia:
 *
 * 1. Na caixa de entrada ficam só pessoas. Dois filtros do Gmail mandam os emails do
 *    bot (pedidos@cleansolutions.com.pt) para "Kyro/Precisa de ti" (é ele que decide)
 *    ou "Kyro/Informação" (agenda, contas, follow-ups, lições, pedidos do questionário),
 *    sem passarem pela caixa e por isso sem notificação.
 * 2. Quem escreve pela primeira vez recebe logo a resposta automática (RESPOSTA_PT,
 *    aprovada pelo dono), uma vez por conversa e no máximo uma vez por semana por
 *    pessoa. Nunca a notificações, newsletters, respostas automáticas de outros, nem a
 *    conversas em que já há uma mensagem nossa.
 * 3. Um email de uma pessoa que espera resposta fica com estrela e na pasta
 *    "Por responder". Sai de lá sozinho quando lhe respondes (a resposta automática
 *    não conta como resposta).
 *
 * Instalar: colar este ficheiro e o appsscript.json, correr `configurar` uma vez e
 * autorizar. Desligar: correr `desligar` (tira o acionador; os filtros ficam).
 */

var CONTA = 'cleansolutions.pt25@gmail.com';
var REMETENTE_BOT = 'pedidos@cleansolutions.com.pt';
var NOSSOS_ENDERECOS = [CONTA, REMETENTE_BOT, 'cleansolutions.com.pt'];

var PASTA_PRECISA = 'Kyro/Precisa de ti';
var PASTA_INFO = 'Kyro/Informação';
var PASTA_POR_RESPONDER = 'Por responder';
var PASTA_RESPOSTA_AUTO = 'Kyro/Resposta automática';

/** Assuntos dos alertas em que é o dono que decide (os outros são informação). */
var ASSUNTOS_PRECISA = ['"Responde tu"', '"decides tu"', '"falta isto"', 'desmarcar', '"fim de semana"', '"precisa de ti"', '"escolhe a equipa"'];

var WHATSAPP = 'https://wa.me/351925530647';
var TELEFONE = '925 530 647';
/** Uma pessoa recebe a resposta automática no máximo uma vez neste intervalo. */
var INTERVALO_POR_PESSOA_MS = 7 * 24 * 3600 * 1000;

/** O texto aprovado pelo dono a 27/10/2026. A primeira frase também serve de marca. */
var MARCA_PT = 'Obrigado pelo seu email, já o recebemos e respondemos-lhe por aqui.';
var MARCA_EN = 'Thank you for your email, we have received it and will reply here.';

function respostaAutomatica(nome, ingles) {
  if (ingles) {
    return [
      nome ? 'Hello ' + nome + ',' : 'Hello,',
      '',
      MARCA_EN,
      '',
      'If it is a quote request, the fastest way is WhatsApp: send a photo of what you would like cleaned and your town to +351 ' + TELEFONE + ' and we will send you the price and availability within minutes.',
      WHATSAPP,
      '',
      'Kind regards,',
      'António',
      'Kyro Clean Solutions',
    ].join('\n');
  }
  return [
    nome ? 'Olá ' + nome + ',' : 'Olá,',
    '',
    MARCA_PT,
    '',
    'Se for um pedido de orçamento, o mais rápido é o WhatsApp: envie uma fotografia do que quer limpar e a localidade para o ' + TELEFONE + ' e damos-lhe o preço e a disponibilidade em poucos minutos.',
    WHATSAPP,
    '',
    'Com os melhores cumprimentos,',
    'António',
    'Kyro Clean Solutions',
  ].join('\n');
}

// ---------------------------------------------------------------- decisões (testadas)

/** "Maria Silva <maria@x.pt>" → "maria@x.pt". */
function enderecoDe(remetente) {
  var m = /<([^>]+)>/.exec(String(remetente || ''));
  return (m ? m[1] : String(remetente || '')).trim().toLowerCase();
}

/** O primeiro nome, só quando parece mesmo um nome ("rmcp63gmail.Com" não é). */
function primeiroNome(remetente) {
  var texto = String(remetente || '');
  var lt = texto.indexOf('<');
  var nome = (lt > 0 ? texto.slice(0, lt) : '').replace(/["']/g, '').trim();
  if (!nome) return '';
  var primeiro = nome.split(/\s+/)[0];
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ-]{1,19}$/.test(primeiro)) return '';
  return primeiro.split('-').map(function (p) { return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(); }).join('-');
}

function ehNosso(endereco) {
  var e = String(endereco || '').toLowerCase();
  return NOSSOS_ENDERECOS.some(function (n) { return e === n || e.slice(-(n.length + 1)) === '@' + n; });
}

var SEM_RESPOSTA = /(^|[._+-])(no[-_]?reply|do[-_]?not[-_]?reply|mailer-daemon|postmaster|notifica(c|ç)(o|õ)es|notifications?|newsletters?|bounces?|alerts?|news)([._+-]|@)/i;
var DOMINIOS_AUTOMATICOS = [
  'google.com', 'googlemail.com', 'facebookmail.com', 'facebook.com', 'instagram.com', 'meta.com', 'linkedin.com',
  'apple.com', 'tiktok.com', 'namecheap.com', 'resend.com', 'resend.dev', 'supabase.io', 'supabase.com',
  'cloudflare.com', 'github.com', 'stripe.com', 'paypal.com', 'amazon.com', 'microsoft.com', 'wix.com',
];

/** Um remetente automático (notificações, newsletters, serviços) nunca recebe nada. */
function remetenteAutomatico(endereco) {
  var e = String(endereco || '').toLowerCase();
  if (!e || e.indexOf('@') < 0) return true;
  if (SEM_RESPOSTA.test(e)) return true;
  var dominio = e.split('@')[1];
  if (/(^|\.)gov\.pt$|(^|\.)mj\.pt$/.test(dominio)) return true;
  return DOMINIOS_AUTOMATICOS.some(function (d) { return dominio === d || dominio.slice(-(d.length + 1)) === '.' + d; });
}

/** Cabeçalhos de uma mensagem enviada por uma máquina (lista, resposta automática, envio em massa). */
function cabecalhosAutomaticos(cab) {
  var autoSubmitted = String(cab['Auto-Submitted'] || '').toLowerCase();
  var precedence = String(cab['Precedence'] || '').toLowerCase();
  return Boolean(cab['List-Unsubscribe'] || cab['List-Id'] || cab['X-Autoreply'] || cab['X-Autorespond'])
    || (autoSubmitted !== '' && autoSubmitted !== 'no')
    || /bulk|list|junk|auto_reply/.test(precedence);
}

/** Inglês só quando o texto o mostra claramente; na dúvida, português. */
function emIngles(texto) {
  var t = ' ' + String(texto || '').toLowerCase().replace(/[^a-zà-ÿ' ]+/g, ' ') + ' ';
  var en = (t.match(/ (hello|hi|dear|please|would|could|thank|thanks|you|your|the|and|for|quote|cleaning|sofa|couch|carpet|rug|mattress|price|regards) /g) || []).length;
  var pt = (t.match(/ (olá|ola|bom|boa|obrigad[oa]|gostaria|queria|para|uma|um|o|a|de|do|da|que|sofá|tapete|colchão|preço|orçamento|limpeza|cumprimentos) /g) || []).length;
  return en >= 3 && en > pt * 2;
}

/** Uma mensagem nossa que é a resposta automática não é uma resposta do dono. */
function ehRespostaAutomatica(corpo) {
  var c = String(corpo || '');
  return c.indexOf(MARCA_PT) >= 0 || c.indexOf(MARCA_EN) >= 0;
}

/**
 * O que fazer com uma conversa. `mensagens` vem da mais antiga para a mais recente:
 * { de, corpo, cabecalhos, data }. Devolve { responder, porResponder, motivo }.
 */
function decidir(mensagens, agora, instaladoEm, ultimaRespostaAPessoa) {
  if (!mensagens || !mensagens.length) return { responder: false, porResponder: false, motivo: 'vazia' };
  var nossas = mensagens.filter(function (m) { return ehNosso(enderecoDe(m.de)); });
  var reais = nossas.filter(function (m) { return !ehRespostaAutomatica(m.corpo); });
  var ultima = mensagens[mensagens.length - 1];
  var ultimaDeles = mensagens.filter(function (m) { return !ehNosso(enderecoDe(m.de)); }).pop();
  if (!ultimaDeles) return { responder: false, porResponder: false, motivo: 'só nossas' };
  var endereco = enderecoDe(ultimaDeles.de);
  if (remetenteAutomatico(endereco) || cabecalhosAutomaticos(ultimaDeles.cabecalhos || {})) {
    return { responder: false, porResponder: false, motivo: 'automático' };
  }
  // Por responder: a última mensagem é deles, ou é só a nossa resposta automática.
  var ultimaRealNossa = reais.length ? reais[reais.length - 1] : null;
  var porResponder = !ultimaRealNossa || ultimaRealNossa.data < ultimaDeles.data;
  if (!porResponder) return { responder: false, porResponder: false, motivo: 'respondida' };
  // Resposta automática: conversa nova (nenhuma mensagem nossa), chegada depois da instalação.
  if (nossas.length) return { responder: false, porResponder: true, motivo: 'conversa com mensagens nossas' };
  if (ultimaDeles.data < instaladoEm) return { responder: false, porResponder: true, motivo: 'antes da instalação' };
  if (ultimaRespostaAPessoa && agora - ultimaRespostaAPessoa < INTERVALO_POR_PESSOA_MS) {
    return { responder: false, porResponder: true, motivo: 'já respondida esta semana' };
  }
  if (ultima !== ultimaDeles) return { responder: false, porResponder: true, motivo: 'última não é deles' };
  return { responder: true, porResponder: true, motivo: 'nova' };
}

/** A pesquisa do Gmail para os alertas em que é o dono que decide (e o contrário). */
function consultaPrecisa() { return 'subject:(' + ASSUNTOS_PRECISA.join(' OR ') + ')'; }
function consultaInfo() { return '-subject:(' + ASSUNTOS_PRECISA.join(' OR ') + ')'; }

// ---------------------------------------------------------------- Gmail

function cabecalhosDe(msg) {
  var nomes = ['Auto-Submitted', 'Precedence', 'List-Unsubscribe', 'List-Id', 'X-Autoreply', 'X-Autorespond'];
  var cab = {};
  nomes.forEach(function (n) { try { cab[n] = msg.getHeader(n); } catch (e) { cab[n] = ''; } });
  return cab;
}

function paraDecisao(msg) {
  return { de: msg.getFrom(), corpo: msg.getPlainBody(), cabecalhos: cabecalhosDe(msg), data: msg.getDate().getTime() };
}

function pasta(nome) { return GmailApp.getUserLabelByName(nome) || GmailApp.createLabel(nome); }

/** Corre de 5 em 5 minutos. */
function verificar() {
  var props = PropertiesService.getScriptProperties();
  var instaladoEm = Number(props.getProperty('instaladoEm') || Date.now());
  var agora = Date.now();
  var porResponder = pasta(PASTA_POR_RESPONDER);
  var respostaAuto = pasta(PASTA_RESPOSTA_AUTO);

  // Conversas na caixa de entrada com pessoas (os alertas do bot já não passam por lá).
  var base = 'in:inbox newer_than:14d -from:me -from:' + REMETENTE_BOT;
  var conversas = GmailApp.search(base + ' -category:promotions -category:social -category:forums', 0, 50);
  // A resposta automática só sai para o separador Principal: o Gmail põe lá as pessoas.
  var principais = {};
  GmailApp.search(base + ' category:primary', 0, 50).forEach(function (c) { principais[c.getId()] = true; });
  conversas.forEach(function (conversa) {
    var mensagens = conversa.getMessages();
    var dados = mensagens.map(paraDecisao);
    var deles = dados.filter(function (m) { return !ehNosso(enderecoDe(m.de)); }).pop();
    var chave = deles ? 'pessoa:' + enderecoDe(deles.de) : '';
    var ultimaRespostaAPessoa = chave ? Number(props.getProperty(chave) || 0) : 0;
    var d = decidir(dados, agora, instaladoEm, ultimaRespostaAPessoa);
    if (d.responder && principais[conversa.getId()]) {
      var ultima = mensagens[mensagens.length - 1];
      ultima.reply(respostaAutomatica(primeiroNome(ultima.getFrom()), emIngles(ultima.getSubject() + ' ' + ultima.getPlainBody())), { name: 'Kyro Clean Solutions' });
      conversa.addLabel(respostaAuto);
      props.setProperty(chave, String(agora));
      console.log('Resposta automática: ' + enderecoDe(ultima.getFrom()) + ' · ' + ultima.getSubject());
    }
    if (d.porResponder) {
      conversa.addLabel(porResponder);
      var ultimaDeles = mensagens.filter(function (m) { return !ehNosso(enderecoDe(m.getFrom())); }).pop();
      if (ultimaDeles && !ultimaDeles.isStarred()) ultimaDeles.star();
    }
  });

  // Sai de "Por responder" o que já tem resposta tua, ou que arquivaste (arquivar = tratado).
  porResponder.getThreads(0, 100).forEach(function (conversa) {
    var mensagens = conversa.getMessages();
    var d = decidir(mensagens.map(paraDecisao), agora, instaladoEm, 0);
    if (d.porResponder && conversa.isInInbox()) return;
    conversa.removeLabel(porResponder);
    mensagens.forEach(function (m) { if (m.isStarred()) m.unstar(); });
  });
}

// ---------------------------------------------------------------- instalação

function idDaPasta(nome, cor) {
  var existentes = Gmail.Users.Labels.list('me').labels || [];
  var achada = existentes.filter(function (l) { return l.name === nome; })[0];
  if (achada) return achada.id;
  var nova = { name: nome, labelListVisibility: 'labelShow', messageListVisibility: 'show' };
  if (cor) nova.color = cor;
  return Gmail.Users.Labels.create(nova, 'me').id;
}

function criarFiltro(criterio, acao) {
  var existentes = Gmail.Users.Settings.Filters.list('me').filter || [];
  var igual = existentes.some(function (f) {
    return f.criteria && f.criteria.from === criterio.from && f.criteria.query === criterio.query;
  });
  if (!igual) Gmail.Users.Settings.Filters.create({ criteria: criterio, action: acao }, 'me');
}

/** Tira da caixa de entrada os alertas do bot que já lá estão, para as duas pastas. */
function arrumarAlertasAntigos() {
  [[consultaPrecisa(), PASTA_PRECISA, false], [consultaInfo(), PASTA_INFO, true]].forEach(function (p) {
    var destino = pasta(p[1]);
    for (var volta = 0; volta < 20; volta++) {
      var conversas = GmailApp.search('in:inbox from:' + REMETENTE_BOT + ' ' + p[0], 0, 100);
      if (!conversas.length) break;
      destino.addToThreads(conversas);
      if (p[2]) GmailApp.markThreadsRead(conversas);
      GmailApp.moveThreadsToArchive(conversas);
    }
  });
}

/** Correr uma vez. Pode correr-se outra vez sem duplicar nada. */
function configurar() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('instaladoEm')) props.setProperty('instaladoEm', String(Date.now()));
  idDaPasta('Kyro', null);
  var precisa = idDaPasta(PASTA_PRECISA, { backgroundColor: '#fb4c2f', textColor: '#ffffff' });
  var info = idDaPasta(PASTA_INFO, { backgroundColor: '#cccccc', textColor: '#000000' });
  idDaPasta(PASTA_POR_RESPONDER, { backgroundColor: '#ffad47', textColor: '#000000' });
  idDaPasta(PASTA_RESPOSTA_AUTO, null);
  criarFiltro({ from: REMETENTE_BOT, query: consultaPrecisa() }, { addLabelIds: [precisa], removeLabelIds: ['INBOX'] });
  criarFiltro({ from: REMETENTE_BOT, query: consultaInfo() }, { addLabelIds: [info], removeLabelIds: ['INBOX', 'UNREAD'] });
  arrumarAlertasAntigos();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'verificar') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('verificar').timeBased().everyMinutes(5).create();
  verificar();
}

function desligar() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
}
