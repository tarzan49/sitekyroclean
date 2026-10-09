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
 *   { key, action: 'hold', eventId?, title, description, start, end }
 *     start/end em ISO 8601 (UTC). Com eventId de uma pré-reserva que ainda
 *     existe e continua a ser pré-reserva, muda-a em vez de criar outra.
 *   { key, action: 'release', eventId }
 *     apaga a pré-reserva, só se o título ainda começar por "Pré-reserva".
 */

const PRE_RESERVA = /^pr[ée]-?\s?reserva\b/i;

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
    return respostaBot({ ok: false, error: 'action tem de ser hold ou release' });
  } finally {
    lock.releaseLock();
  }
}

function escreverPreReserva(p) {
  const inicio = new Date(p.start), fim = new Date(p.end);
  if (isNaN(inicio) || isNaN(fim) || fim <= inicio) return { ok: false, error: 'start/end inválidos' };
  const titulo = String(p.title || '');
  if (!PRE_RESERVA.test(titulo)) return { ok: false, error: 'o título tem de começar por "Pré-reserva"' };
  const descricao = String(p.description || '').slice(0, 4000);
  const calendario = CalendarApp.getDefaultCalendar();
  if (p.eventId) {
    const antigo = eventoPorId(calendario, p.eventId);
    if (antigo && PRE_RESERVA.test(antigo.getTitle())) {
      antigo.setTime(inicio, fim);
      antigo.setTitle(titulo);
      antigo.setDescription(descricao);
      return { ok: true, eventId: p.eventId, moved: true };
    }
  }
  const evento = calendario.createEvent(titulo, inicio, fim, { description: descricao });
  return { ok: true, eventId: evento.getId().replace(/@google\.com$/, ''), moved: false };
}

function apagarPreReserva(p) {
  const evento = p.eventId ? eventoPorId(CalendarApp.getDefaultCalendar(), p.eventId) : null;
  if (!evento) return { ok: true, released: false, reason: 'já não existe' };
  if (!PRE_RESERVA.test(evento.getTitle())) return { ok: true, released: false, reason: 'já foi confirmada pelo dono' };
  evento.deleteEvent();
  return { ok: true, released: true };
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
