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

/** A pesquisa do Gmail para "mexeu depois de `ms`", com 10 min de margem (o after: aceita segundos). */
function depoisDe(ms) { return 'after:' + Math.floor((ms - 10 * 60 * 1000) / 1000); }

/**
 * Corre de 5 em 5 minutos e só lê o que mudou desde a última volta. Ler 14 dias e 100 conversas a cada volta,
 * mais a ponte a ler 2 dias a cada minuto, esgotava a quota diária do Gmail: a ponte ficava ~17 h por dia
 * sem ler e o bot não respondia (16 Nov, Faisal).
 */
function verificar() {
  var props = PropertiesService.getScriptProperties();
  var instaladoEm = Number(props.getProperty('instaladoEm') || Date.now());
  var agora = Date.now();
  var porResponder = pasta(PASTA_POR_RESPONDER);
  var respostaAuto = pasta(PASTA_RESPOSTA_AUTO);
  // A primeira volta (ou depois de 14 dias parado) vê os 14 dias; as outras só o que chegou desde a anterior.
  var ultimaVolta = Number(props.getProperty('verificadoEm') || 0);
  var janela = ultimaVolta && agora - ultimaVolta < 14 * 864e5 ? depoisDe(ultimaVolta) : 'newer_than:14d';

  // Conversas na caixa de entrada com pessoas (os alertas do bot já não passam por lá).
  var base = 'in:inbox ' + janela + ' -from:me -from:' + REMETENTE_BOT;
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
    // Com o bot de email ligado (kyro-bot src/email.ts) é ele que responde: o texto automático calava-se à segunda mensagem.
    if (d.responder && principais[conversa.getId()] && props.getProperty('botEmail') !== 'on') {
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

  // Sai de "Por responder" o que já tem resposta tua (só as conversas que mexeram desde a última volta),
  // ou que arquivaste (arquivar = tratado).
  var etiqueta = 'label:' + PASTA_POR_RESPONDER.toLowerCase().replace(/[\s\/]+/g, '-');
  GmailApp.search(etiqueta + ' ' + janela, 0, 100).concat(GmailApp.search(etiqueta + ' -in:inbox', 0, 100)).forEach(function (conversa) {
    var mensagens = conversa.getMessages();
    var d = decidir(mensagens.map(paraDecisao), agora, instaladoEm, 0);
    if (d.porResponder && conversa.isInInbox()) return;
    conversa.removeLabel(porResponder);
    mensagens.forEach(function (m) { if (m.isStarred()) m.unstar(); });
  });
  props.setProperty('verificadoEm', String(agora));
}

// ---------------------------------------------------------------- ponte para o bot

/**
 * Publicado como aplicação Web, para o servidor do bot ler e responder a emails sem ter a
 * palavra-passe da conta. Só aceita pedidos com a chave `ponteKey` das propriedades do script.
 */
function respostaPonte(dados) {
  return ContentService.createTextOutput(JSON.stringify(dados)).setMimeType(ContentService.MimeType.JSON);
}

// A ponte usa a API do Gmail (serviço avançado), não o GmailApp: o GmailApp tem um limite diário de chamadas que a
// ponte, a perguntar a cada minuto, esgotava. A 17 Nov ficou cega das 00h às 14h08 e o Jorge esperou 1h30
// pela resposta. A API conta por unidades, com uma quota muito acima disto.

function cabecalhoApi(msg, nome) {
  var h = ((msg.payload && msg.payload.headers) || []).filter(function (x) { return x.name.toLowerCase() === nome.toLowerCase(); })[0];
  return h ? h.value : '';
}

function partesApi(parte, saida) {
  saida = saida || [];
  if (!parte) return saida;
  saida.push(parte);
  (parte.parts || []).forEach(function (p) { partesApi(p, saida); });
  return saida;
}

/** A API devolve base64 "web safe" às vezes sem o `=` final, que o Utilities exige. */
function bytesDe(dados) {
  var d = String(dados || '').replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  while (d.length % 4) d += '=';
  return Utilities.base64Decode(d);
}

function textoDe(dados) {
  return dados ? Utilities.newBlob(bytesDe(dados)).getDataAsString('UTF-8') : '';
}

function corpoApi(msg) {
  var partes = partesApi(msg.payload);
  var texto = partes.filter(function (p) { return p.mimeType === 'text/plain' && !p.filename; })[0];
  if (texto) return textoDe(texto.body.data);
  var html = partes.filter(function (p) { return p.mimeType === 'text/html' && !p.filename; })[0];
  return html ? textoDe(html.body.data).replace(/<br\s*\/?>|<\/p>|<\/div>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';
}

function anexosApi(msg) {
  return partesApi(msg.payload).filter(function (p) { return p.filename && p.body && p.body.attachmentId; });
}

function clienteDaConversaApi(mensagens) {
  var deles = mensagens.filter(function (m) { return !ehNosso(enderecoDe(cabecalhoApi(m, 'From'))); }).pop();
  if (deles) return enderecoDe(cabecalhoApi(deles, 'From'));
  return enderecoDe(String(cabecalhoApi(mensagens[0], 'To')).split(',')[0]);
}

/**
 * O bot pergunta a cada minuto. Só procura mensagens desde `desde` (a última leitura que correu bem, em ms), nunca
 * mais de 2 dias.
 */
function ponteListar(desde) {
  var base = 'newer_than:2d' + (Number(desde) ? ' ' + depoisDe(Number(desde)) : '') + ' -in:spam -in:trash -from:' + REMETENTE_BOT;
  var lista = Gmail.Users.Messages.list('me', { q: base, maxResults: 100 });
  var ids = {};
  ((lista && lista.messages) || []).forEach(function (m) { ids[m.threadId] = true; });
  var saida = [];
  Object.keys(ids).forEach(function (tid) {
    var mensagens = Gmail.Users.Threads.get('me', tid, { format: 'full' }).messages || [];
    var cliente = clienteDaConversaApi(mensagens);
    mensagens.forEach(function (m) {
      var data = Number(m.internalDate);
      var etiquetas = m.labelIds || [];
      if (data < desde || etiquetas.indexOf('DRAFT') >= 0) return;
      var deCompleto = cabecalhoApi(m, 'From');
      var de = enderecoDe(deCompleto);
      var nossa = ehNosso(de);
      var corpo = corpoApi(m);
      if (nossa && ehRespostaAutomatica(corpo)) return;
      var cab = {};
      ['Auto-Submitted', 'Precedence', 'List-Unsubscribe', 'List-Id', 'X-Autoreply', 'X-Autorespond'].forEach(function (n) { cab[n] = cabecalhoApi(m, n); });
      saida.push({
        id: m.id, threadId: tid, client: cliente, name: nossa ? '' : primeiroNome(deCompleto), fromMe: nossa,
        subject: cabecalhoApi(m, 'Subject'), date: data, body: corpo,
        primary: etiquetas.indexOf('CATEGORY_PERSONAL') >= 0 || !etiquetas.some(function (l) { return /^CATEGORY_/.test(l); }),
        automatic: !nossa && (remetenteAutomatico(de) || cabecalhosAutomaticos(cab)),
        attachments: anexosApi(m).map(function (a) { return { name: a.filename, mime: a.mimeType }; })
      });
    });
  });
  saida.sort(function (a, b) { return a.date - b.date; });
  return { ok: true, messages: saida };
}

/** Cabeçalho com acentos (assunto, nome) em UTF-8, como manda o RFC 2047. */
function cabecalhoUtf8(t) {
  return /^[\x20-\x7e]*$/.test(t) ? t : '=?UTF-8?B?' + Utilities.base64Encode(t, Utilities.Charset.UTF_8) + '?=';
}

function base64Linhas(b64) { return b64.replace(/(.{76})/g, '$1\r\n'); }

/** Email em MIME, texto e HTML em UTF-8 (os "������" do 17 Nov eram o corpo simples do GmailApp), mais os anexos. */
function mimeDe(p, assunto, emResposta) {
  var mista = 'kyro-m-' + Utilities.getUuid(), alt = 'kyro-a-' + Utilities.getUuid();
  var l = [
    'To: ' + p.to,
    'Subject: ' + cabecalhoUtf8(assunto),
    'MIME-Version: 1.0'
  ];
  if (emResposta) l.push('In-Reply-To: ' + emResposta, 'References: ' + emResposta);
  l.push('Content-Type: multipart/mixed; boundary="' + mista + '"', '', '--' + mista,
    'Content-Type: multipart/alternative; boundary="' + alt + '"', '',
    '--' + alt, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '',
    base64Linhas(Utilities.base64Encode(p.body || '', Utilities.Charset.UTF_8)));
  if (p.html) l.push('--' + alt, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '',
    base64Linhas(Utilities.base64Encode(p.html, Utilities.Charset.UTF_8)));
  l.push('--' + alt + '--');
  (p.attachments || []).forEach(function (a) {
    l.push('--' + mista, 'Content-Type: ' + a.mime + '; name="' + cabecalhoUtf8(a.name) + '"',
      'Content-Disposition: attachment; filename="' + cabecalhoUtf8(a.name) + '"', 'Content-Transfer-Encoding: base64', '',
      base64Linhas(a.base64));
  });
  l.push('--' + mista + '--');
  return l.join('\r\n');
}

function ponteResponder(p) {
  var assunto = p.subject || 'Kyro Clean Solutions', emResposta = '', threadId;
  if (p.threadId) {
    var mensagens = Gmail.Users.Threads.get('me', p.threadId, { format: 'metadata', metadataHeaders: ['From', 'Subject', 'Message-ID'] }).messages || [];
    var deles = mensagens.filter(function (m) { return enderecoDe(cabecalhoApi(m, 'From')) === String(p.to).toLowerCase(); }).pop();
    if (!deles) return { ok: false, error: 'conversa sem mensagens de ' + p.to };
    assunto = cabecalhoApi(deles, 'Subject') || assunto;
    if (!/^re:/i.test(assunto)) assunto = 'Re: ' + assunto;
    emResposta = cabecalhoApi(deles, 'Message-ID');
    threadId = p.threadId;
  }
  var raw = Utilities.base64EncodeWebSafe(Utilities.newBlob(mimeDe(p, assunto, emResposta)).getBytes());
  var pedido = { raw: raw };
  if (threadId) pedido.threadId = threadId;
  var enviada = Gmail.Users.Messages.send(pedido, 'me');
  return { ok: true, id: enviada.id };
}

function doPost(e) {
  var p;
  try { p = JSON.parse(e.postData.contents); } catch (err) { return respostaPonte({ ok: false, error: 'pedido inválido' }); }
  var chave = PropertiesService.getScriptProperties().getProperty('ponteKey');
  if (!chave || p.key !== chave) return respostaPonte({ ok: false, error: 'chave errada' });
  try {
    if (p.action === 'list') return respostaPonte(ponteListar(Number(p.since) || 0));
    if (p.action === 'reply') return respostaPonte(ponteResponder(p));
    if (p.action === 'attachment') {
      var msg = Gmail.Users.Messages.get('me', p.messageId, { format: 'full' });
      var anexo = anexosApi(msg)[Number(p.index) || 0];
      var bytes = bytesDe(Gmail.Users.Messages.Attachments.get('me', p.messageId, anexo.body.attachmentId).data);
      return respostaPonte({ ok: true, base64: Utilities.base64Encode(bytes), mime: anexo.mimeType });
    }
    return respostaPonte({ ok: false, error: 'ação desconhecida' });
  } catch (err) { return respostaPonte({ ok: false, error: String(err) }); }
}

/** Correr uma vez à mão, com a chave escrita aqui só nesse momento; nunca fazer commit dela. */
function definirPonte(chave) {
  PropertiesService.getScriptProperties().setProperties({ ponteKey: chave, botEmail: 'on' });
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
  // Sem filtros nenhuns, a lista vem a null e não um objeto vazio.
  var lista = Gmail.Users.Settings.Filters.list('me');
  var existentes = (lista && lista.filter) || [];
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
