/**
 * Pré-reservas do bot de WhatsApp (dono, 2026-10-08).
 *
 * Quando um cliente aceita uma hora que o bot lhe ofereceu, a função `bot-api`
 * do site confirma na agenda que a hora continua livre e chama este endereço
 * (implementação como aplicação web, executada como o dono), que escreve um
 * evento "Pré-reserva – …" no calendário do dono. Assim a mesma hora deixa de
 * ser oferecida a outro cliente. O dono confirma (muda o título para
 * "Serviço X€ (Y€) …", como sempre) ou apaga: a pré-reserva não expira sozinha.
 *
 * "Pré-reserva" não é serviço para o resto deste script (`ehServico`): não é
 * copiada para nenhuma equipa nem gera email, e o CRM também a ignora.
 *
 * A chave fica nas propriedades do script (BOT_HOLD_KEY), nunca aqui: este
 * ficheiro está no repositório público. A mesma chave está nas secrets do
 * Supabase (BOT_HOLD_KEY), com o endereço desta aplicação web (BOT_HOLD_URL).
 *
 * Pedido (POST, JSON):
 *   { key, action: 'hold', conversationId, eventId?, title, description, start, end }
 *     start/end em ISO 8601 (UTC). Com eventId de uma pré-reserva que ainda
 *     existe e continua a ser pré-reserva, muda-a em vez de criar outra. Sem
 *     eventId, procura a pré-reserva da conversa pela marca "bot:<conversationId>"
 *     da descrição: um pedido repetido (resposta perdida no caminho) nunca
 *     cria uma segunda.
 *   { key, action: 'release', eventId }
 *     apaga a pré-reserva, só se o título ainda começar por "Pré-reserva".
 *   { key, action: 'book', conversationId, eventId?, title, description, start, end, colorId }
 *     o bot fechou o serviço (dono, 2026-10-09: "fecha e escolhe a equipa", só
 *     de segunda a sexta). Escreve "Serviço X€ (Y€) …" na cor da equipa escolhida,
 *     por cima da pré-reserva da conversa, se houver. A partir daí é um serviço
 *     como os que o dono escreve: o resto deste script copia-o para a equipa e
 *     manda-lhe o email, e o CRM lê-o. Um pedido repetido muda o mesmo serviço.
 *   { key, action: 'update', eventId, phone, title, description, start, end }
 *     o que um cliente com serviço marcado diz depois (código postal, andar, nova
 *     hora, nota para a equipa) vai sozinho para o evento (dono, 2026-10-15: "eu
 *     não ter que meter nada no calendário"). Só um evento "Serviço"/"A confirmar"
 *     cujo título ou descrição tenha o telefone desse cliente; nunca apaga nada.
 *   { key, action: 'cancel', eventId, phone }
 *     o cliente desmarcou: apaga o serviço (dono, 2026-11-03: "o bot apaga o
 *     evento"). Só um evento "Serviço"/"A confirmar" com o telefone desse cliente.
 *     O dono recebe da bot-api um email com o título e a descrição do evento.
 *   { key, action: 'needPhotos' }
 *     os serviços dos próximos 14 dias que ainda não têm a linha "Fotos:" na
 *     descrição e com telefone: [{ eventId, phone }] (phone = o jid da marca "bot:", ou o número: algarismos
 *     com o indicativo, ou os 9 algarismos portugueses). Dono, 2026-10-11: "anexar ao calendário
 *     sempre uma foto daquilo que se vai limpar".
 *   { key, action: 'photos', eventId, images: [{ base64, mime, name }] }
 *     guarda as fotografias que o cliente mandou no WhatsApp numa pasta do
 *     Drive ("Kyro · Fotos dos serviços", só quem tem a ligação as vê), anexa-as
 *     ao evento e escreve "Fotos: …" com as ligações na descrição. A descrição
 *     vai para a cópia da equipa, por isso a equipa vê-as também.
 */

// "A confirmar": o evento preparado depois de o dono escrever "fica agendado" (2026-10-09).
const PRE_RESERVA = /^(pr[ée]-?\s?reserva|a confirmar)\b/i;
const SERVICO_DO_BOT = /^servi[cç]o\b/i;
// As cores das equipas (Mirtilo 9 Porto 1, Grafite 8 Porto 2, Uva 3 Porto 3, Basílico 10 Braga, Tangerina 6 Lisboa 1, Lavanda 1 Lisboa 2, Banana 5 Algarve, Flamingo 4 Coimbra).
const CORES_DAS_EQUIPAS = ['9', '8', '3', '10', '6', '1', '5', '4'];

function doPost(e) {
  let pedido;
  try {
    pedido = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (erro) {
    return respostaBot({ ok: false, error: 'JSON inválido' });
  }
  const chave = PropertiesService.getScriptProperties().getProperty('BOT_HOLD_KEY');
  if (!chave || pedido.key !== chave) return respostaBot({ ok: false, error: 'chave inválida' });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return respostaBot({ ok: false, error: 'ocupado, tenta outra vez' });
  try {
    if (pedido.action === 'hold') return respostaBot(escreverPreReserva(pedido));
    if (pedido.action === 'release') return respostaBot(apagarPreReserva(pedido));
    if (pedido.action === 'book') return respostaBot(escreverServico(pedido));
    if (pedido.action === 'update') return respostaBot(atualizarServico(pedido));
    if (pedido.action === 'cancel') return respostaBot(apagarServico(pedido));
    if (pedido.action === 'needPhotos') return respostaBot(servicosSemFotos());
    if (pedido.action === 'photos') return respostaBot(anexarFotos(pedido));
    return respostaBot({ ok: false, error: 'action tem de ser hold, book, release, update, cancel, needPhotos ou photos' });
  } catch (erro) {
    // Sem isto a Google responde com uma página de erro em HTML e a bot-api não sabe porquê.
    return respostaBot({ ok: false, error: String(erro && erro.message || erro) });
  } finally {
    lock.releaseLock();
  }
}

function escreverPreReserva(p) {
  const inicio = new Date(p.start), fim = new Date(p.end);
  if (isNaN(inicio) || isNaN(fim) || fim <= inicio) return { ok: false, error: 'start/end inválidos' };
  const titulo = String(p.title || '');
  if (!PRE_RESERVA.test(titulo)) return { ok: false, error: 'o título tem de começar por "Pré-reserva" ou "A confirmar"' };
  const descricao = String(p.description || '').slice(0, 4000);
  const calendario = CalendarApp.getDefaultCalendar();
  const antigo = (p.eventId && eventoPorId(calendario, p.eventId)) || preReservaDaConversa(calendario, p.conversationId);
  if (antigo && PRE_RESERVA.test(antigo.getTitle())) {
    antigo.setTime(inicio, fim);
    antigo.setTitle(titulo);
    antigo.setDescription(descricao);
    return { ok: true, eventId: antigo.getId().replace(/@google\.com$/, ''), moved: true };
  }
  const evento = calendario.createEvent(titulo, inicio, fim, { description: descricao });
  return { ok: true, eventId: evento.getId().replace(/@google\.com$/, ''), moved: false };
}

function escreverServico(p) {
  const inicio = new Date(p.start), fim = new Date(p.end);
  if (isNaN(inicio) || isNaN(fim) || fim <= inicio) return { ok: false, error: 'start/end inválidos' };
  const titulo = String(p.title || '');
  if (!SERVICO_DO_BOT.test(titulo)) return { ok: false, error: 'o título tem de começar por "Serviço"' };
  const cor = String(p.colorId || '');
  if (CORES_DAS_EQUIPAS.indexOf(cor) < 0) return { ok: false, error: 'colorId tem de ser a cor de uma equipa' };
  const descricao = String(p.description || '').slice(0, 4000);
  const calendario = CalendarApp.getDefaultCalendar();
  // A pré-reserva da conversa vira o serviço; um pedido repetido encontra o serviço que já escreveu.
  const antigo = (p.eventId && eventoPorId(calendario, p.eventId)) || preReservaDaConversa(calendario, p.conversationId)
    || servicoDaConversa(calendario, p.conversationId);
  let evento;
  if (antigo && (PRE_RESERVA.test(antigo.getTitle()) || descricaoDaConversa(antigo, p.conversationId))) {
    antigo.setTime(inicio, fim);
    antigo.setTitle(titulo);
    antigo.setDescription(descricao);
    evento = antigo;
  } else {
    evento = calendario.createEvent(titulo, inicio, fim, { description: descricao });
  }
  evento.setColor(cor);
  return { ok: true, eventId: evento.getId().replace(/@google\.com$/, ''), moved: evento === antigo };
}

function atualizarServico(p) {
  const evento = p.eventId ? eventoPorId(CalendarApp.getDefaultCalendar(), p.eventId) : null;
  if (!evento) return { ok: false, error: 'evento não encontrado' };
  const titulo = String(p.title || ''), descricao = String(p.description || '').slice(0, 4000);
  if (!/^(a confirmar\s*·\s*)?servi[cç]o\b/i.test(evento.getTitle()) || !/^(a confirmar\s*·\s*)?servi[cç]o\b/i.test(titulo)) return { ok: false, error: 'só serviços' };
  const nove = String(p.phone || '').replace(/\D/g, '').slice(-9);
  const algarismos = (evento.getTitle() + ' ' + evento.getDescription()).replace(/\D/g, '');
  if (nove.length !== 9 || algarismos.indexOf(nove) < 0) return { ok: false, error: 'o evento não é deste cliente' };
  const inicio = new Date(p.start), fim = new Date(p.end);
  if (isNaN(inicio) || isNaN(fim) || fim <= inicio) return { ok: false, error: 'start/end inválidos' };
  if (inicio.getTime() !== evento.getStartTime().getTime() || fim.getTime() !== evento.getEndTime().getTime()) evento.setTime(inicio, fim);
  if (titulo && titulo !== evento.getTitle()) evento.setTitle(titulo);
  if (descricao && descricao !== evento.getDescription()) evento.setDescription(descricao);
  return { ok: true, eventId: evento.getId().replace(/@google\.com$/, '') };
}

function apagarServico(p) {
  const evento = p.eventId ? eventoPorId(CalendarApp.getDefaultCalendar(), p.eventId) : null;
  if (!evento) return { ok: true, deleted: false, reason: 'já não existe' };
  if (!/^(a confirmar\s*·\s*)?servi[cç]o\b/i.test(evento.getTitle())) return { ok: false, error: 'só serviços' };
  const nove = String(p.phone || '').replace(/\D/g, '').slice(-9);
  const algarismos = (evento.getTitle() + ' ' + evento.getDescription()).replace(/\D/g, '');
  if (nove.length !== 9 || algarismos.indexOf(nove) < 0) return { ok: false, error: 'o evento não é deste cliente' };
  try {
    evento.deleteEvent();
  } catch (erro) {
    return { ok: true, deleted: false, reason: 'já não existe' };
  }
  return { ok: true, deleted: true };
}

function servicoDaConversa(calendario, conversa) {
  if (!conversa) return null;
  const agora = Date.now();
  const eventos = calendario.getEvents(new Date(agora - 2 * 86400000), new Date(agora + 120 * 86400000), { search: 'bot:' + conversa });
  for (let i = 0; i < eventos.length; i++) {
    if (SERVICO_DO_BOT.test(eventos[i].getTitle()) && descricaoDaConversa(eventos[i], conversa)) return eventos[i];
  }
  return null;
}

function descricaoDaConversa(evento, conversa) {
  return !!conversa && String(evento.getDescription() || '').split('\n').indexOf('bot:' + conversa) >= 0;
}

function apagarPreReserva(p) {
  const evento = p.eventId ? eventoPorId(CalendarApp.getDefaultCalendar(), p.eventId) : null;
  if (!evento) return { ok: true, released: false, reason: 'já não existe' };
  if (!PRE_RESERVA.test(evento.getTitle())) return { ok: true, released: false, reason: 'já foi confirmada pelo dono' };
  try {
    evento.deleteEvent();
  } catch (erro) {
    // A Google devolve por id um evento já apagado, que depois não se deixa apagar.
    return { ok: true, released: false, reason: 'já não existe' };
  }
  return { ok: true, released: true };
}

function preReservaDaConversa(calendario, conversa) {
  if (!conversa) return null;
  const marca = 'bot:' + conversa;
  const agora = Date.now();
  const eventos = calendario.getEvents(new Date(agora - 2 * 86400000), new Date(agora + 120 * 86400000), { search: marca });
  for (let i = 0; i < eventos.length; i++) {
    const linhas = String(eventos[i].getDescription() || '').split('\n');
    if (linhas.indexOf(marca) >= 0 && PRE_RESERVA.test(eventos[i].getTitle())) return eventos[i];
  }
  return null;
}

function eventoPorId(calendario, id) {
  try {
    return calendario.getEventById(String(id).indexOf('@') >= 0 ? id : id + '@google.com');
  } catch (erro) {
    return null;
  }
}

function respostaBot(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}

const LINHA_FOTOS = /^Fotos:/m;
const PASTA_FOTOS = 'Kyro · Fotos dos serviços';
const TELEFONE = /(?:\+?351[\s-]?)?\b(9[1236]\d)[\s-]?(\d{3})[\s-]?(\d{3})\b/;
const TELEFONE_INDICATIVO = /(?:^|\D)(\+\d(?:(?:[\s.-]|\s?\(|\)\s?)?\d){8,14}|\d{10,15})(?!\d)/;
const MARCA_CONVERSA = /\bbot:(\d+@(?:s\.whatsapp\.net|lid))\b/;

// A marca "bot:" é a própria conversa; sem ela, o número do título, e só depois o da descrição.
function telefoneDoEvento(titulo, descricao) {
  const marca = MARCA_CONVERSA.exec(descricao);
  if (marca) return marca[1];
  const textos = [titulo, descricao];
  for (let i = 0; i < textos.length; i++) {
    const indicativo = TELEFONE_INDICATIVO.exec(textos[i]);
    if (indicativo) return indicativo[1].replace(/\D/g, '');
    const nacional = TELEFONE.exec(textos[i]);
    if (nacional) return nacional[1] + nacional[2] + nacional[3];
  }
  return null;
}

function servicosSemFotos() {
  const agora = Date.now();
  const eventos = CalendarApp.getDefaultCalendar().getEvents(new Date(agora - 3600000), new Date(agora + 14 * 86400000));
  const lista = [];
  for (let i = 0; i < eventos.length; i++) {
    const ev = eventos[i];
    if (!SERVICO_DO_BOT.test(ev.getTitle())) continue;
    const descricao = String(ev.getDescription() || '');
    if (LINHA_FOTOS.test(descricao)) continue;
    const telefone = telefoneDoEvento(ev.getTitle(), descricao);
    if (telefone) lista.push({ eventId: ev.getId().replace(/@google\.com$/, ''), phone: telefone });
  }
  return { ok: true, events: lista };
}

function pastaDasFotos() {
  const pastas = DriveApp.getFoldersByName(PASTA_FOTOS);
  return pastas.hasNext() ? pastas.next() : DriveApp.createFolder(PASTA_FOTOS);
}

function anexarFotos(p) {
  const calendario = CalendarApp.getDefaultCalendar();
  const evento = p.eventId ? eventoPorId(calendario, p.eventId) : null;
  if (!evento) return { ok: false, error: 'evento não existe' };
  const descricao = String(evento.getDescription() || '');
  if (LINHA_FOTOS.test(descricao)) return { ok: true, already: true };
  const imagens = Array.isArray(p.images) ? p.images.slice(0, 6) : [];
  if (!imagens.length) return { ok: false, error: 'sem imagens' };
  const pasta = pastaDasFotos();
  const anexos = [];
  for (let i = 0; i < imagens.length; i++) {
    const img = imagens[i];
    const blob = Utilities.newBlob(Utilities.base64Decode(String(img.base64 || '')), String(img.mime || 'image/jpeg'), String(img.name || ('foto-' + (i + 1) + '.jpg')));
    const ficheiro = pasta.createFile(blob);
    ficheiro.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    anexos.push({ fileUrl: ficheiro.getUrl(), fileId: ficheiro.getId(), title: ficheiro.getName(), mimeType: ficheiro.getMimeType() });
  }
  const linha = 'Fotos: ' + anexos.map(function (a) { return a.fileUrl; }).join(' ');
  const id = evento.getId().replace(/@google\.com$/, '');
  Calendar.Events.patch({ description: (descricao ? descricao + '\n\n' : '') + linha, attachments: anexos }, 'primary', id, { supportsAttachments: true, sendUpdates: 'none' });
  return { ok: true, files: anexos.length };
}
