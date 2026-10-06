// Email diário de seguimentos (dono, 2026-10-06: "notificações passado x
// tempo"). A lista do que fazer hoje, pela ordem da vista Hoje do painel, com
// um botão por pessoa que abre o WhatsApp com a mensagem já escrita. O WhatsApp
// deixa-a na caixa de texto: nada sai sem o dono carregar em enviar. As
// campanhas aparecem só como contagem, porque vão em lote e o dono quer ver a
// lista e o texto antes (regra de 05/10/2026); a lista está no painel.

import { campaignCalendar, isQuietTime, waLink, type ActionKind, type FollowUpAction, type PlannedClient } from './clientFollowUp';
import { displayName, formatPhone } from './clientRecords';
import { lisbonDay } from './crmClosings';

export const DIGEST_SECTIONS: { title: string; kinds: ActionKind[]; tip: string }[] = [
  { title: 'Responder primeiro', kinds: ['responder'], tip: 'Escreveram por último e ninguém respondeu. Ler a conversa toda antes.' },
  { title: 'Fechar orçamentos', kinds: ['seguimento'], tip: 'Dois seguimentos no máximo e parar. As horas saem do calendário, em hora de Portugal.' },
  { title: 'Combinado para hoje', kinds: ['lembrete'], tip: 'A pessoa pediu para voltarmos a falar por esta altura.' },
  { title: 'Serviços marcados', kinds: ['vespera', 'mesma_visita'], tip: 'Lembrar na véspera; um segundo artigo na mesma visita fica com preço de pack.' },
  { title: 'Depois do serviço', kinds: ['avaliacao', 'avaliacao_lembrete'], tip: 'Avaliação com o link da ficha certa (Lisboa ou Porto). Um só lembrete.' },
  { title: 'Clientes que já confiam em nós', kinds: ['recomendacao', 'manutencao'], tip: 'Recomendações e manutenção: os clientes mais baratos de conseguir.' },
];

export interface DigestItem {
  name: string;
  phone: string;
  region: string | null;
  action: FollowUpAction;
}

export interface Digest {
  subject: string;
  html: string;
  text: string;
  /** Pessoas com alguma coisa para hoje (sem contar as campanhas). */
  count: number;
  sections: { title: string; tip: string; items: DigestItem[] }[];
  campaigns: { name: string; end: string; eligible: number }[];
}

export interface DigestOptions {
  now: Date;
  panelUrl: string;
  /** A última leitura do WhatsApp (snapshotAt). */
  snapshot: string | null;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const WEEKDAY_DATE = new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', weekday: 'long', day: 'numeric', month: 'long' });
const STAMP = new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export function digestItems(planned: PlannedClient[]): Digest['sections'] {
  return DIGEST_SECTIONS.map(section => ({
    title: section.title,
    tip: section.tip,
    items: planned
      .flatMap(p => p.plan.today.filter(a => section.kinds.includes(a.kind)).map(action => ({
        name: displayName(p.client, p.services),
        phone: p.client.phone,
        region: p.client.region,
        action,
      })))
      .sort((a, b) => a.action.priority - b.action.priority || a.action.due.localeCompare(b.action.due)),
  })).filter(s => s.items.length > 0);
}

export function buildDigest(planned: PlannedClient[], opts: DigestOptions): Digest {
  const today = lisbonDay(opts.now);
  const sections = digestItems(planned);
  const people = new Set(sections.flatMap(s => s.items.map(i => i.phone)));
  const campaigns = campaignCalendar(today)
    .filter(r => r.active)
    .map(r => ({
      name: r.campaign.name,
      end: r.end,
      eligible: planned.filter(p => p.plan.today.some(a => a.kind === 'campanha' && a.campaignId === r.id)).length,
    }))
    .filter(c => c.eligible > 0);
  const answer = sections.find(s => s.title === 'Responder primeiro')?.items.length ?? 0;
  const count = people.size;
  const subject = count
    ? `Kyro · ${count} ${count === 1 ? 'pessoa' : 'pessoas'} para seguir hoje${answer ? ` (${answer} por responder)` : ''}`
    : 'Kyro · nada para seguir hoje';

  const dateLine = WEEKDAY_DATE.format(opts.now);
  const snapshotLine = opts.snapshot
    ? `As conversas do WhatsApp são da leitura de ${STAMP.format(new Date(opts.snapshot))}: o que aconteceu depois disso pode ainda não estar aqui.`
    : 'Ainda não há leitura do WhatsApp nas fichas.';
  const quiet = isQuietTime(opts.now);

  const itemHtml = (i: DigestItem) => {
    const a = i.action;
    const msg = a.messages[0];
    const link = waLink(i.phone, msg?.text);
    const meta = [i.region, formatPhone(i.phone)].filter(Boolean).join(' · ');
    return `<div style="border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;margin:0 0 10px">
<p style="margin:0;font-size:15px;font-weight:600;color:#0B2F2A">${esc(i.name)} <span style="font-weight:400;color:#6b7280;font-size:13px">· ${esc(meta)}</span></p>
<p style="margin:4px 0 0;font-size:13px;color:#1f2937"><strong>${esc(a.title)}${a.notBefore && a.due === today ? ` (a partir das ${esc(a.notBefore)})` : ''}.</strong> ${esc(a.why)}</p>
${a.check ? `<p style="margin:4px 0 0;font-size:13px;color:#92400e"><strong>Antes de enviar:</strong> ${esc(a.check)}</p>` : ''}
${msg ? `<div style="white-space:pre-wrap;background:#f9fafb;border-radius:8px;padding:10px;margin:8px 0;font-size:13px;color:#111827">${esc(msg.text)}</div>` : ''}
<a href="${esc(link)}" style="display:inline-block;background:#0B2F2A;color:#ffffff;text-decoration:none;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600">${msg ? 'Abrir no WhatsApp com a mensagem' : 'Abrir a conversa'}</a>
</div>`;
  };

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;padding:8px;color:#0B2F2A">
<div style="border-top:3px solid #D4AF37;padding-top:12px">
<h1 style="font-size:20px;margin:0">Seguimentos de hoje</h1>
<p style="margin:2px 0 14px;color:#6b7280;font-size:13px">${esc(dateLine)} · ${count} ${count === 1 ? 'pessoa' : 'pessoas'}</p>
${quiet ? '<p style="font-size:13px;background:#fef3c7;color:#92400e;padding:8px 10px;border-radius:8px">Agora é de noite: nenhuma mensagem sai antes das 9h30.</p>' : ''}
${sections.map(s => `<h2 style="font-size:15px;margin:22px 0 2px">${esc(s.title)} (${s.items.length})</h2>
<p style="font-size:12px;color:#6b7280;margin:0 0 8px">${esc(s.tip)}</p>
${s.items.map(itemHtml).join('\n')}`).join('\n')}
${campaigns.length ? `<h2 style="font-size:15px;margin:22px 0 2px">Campanhas a decorrer</h2>
${campaigns.map(c => `<p style="font-size:13px;margin:4px 0">${esc(c.name)}: ${c.eligible} contactos elegíveis, até ${c.end.slice(8, 10)}/${c.end.slice(5, 7)}. A lista e o texto estão no painel (Clientes, vista Campanhas): vão em lote, só com o teu OK.</p>`).join('\n')}` : ''}
<p style="font-size:12px;color:#6b7280;margin:24px 0 4px">${esc(snapshotLine)} O botão abre a conversa com a mensagem escrita: nada é enviado sem carregares em enviar. Depois de enviar, marca "Enviei" no painel para o seguimento seguinte sair na altura certa.</p>
<p style="font-size:12px;margin:0"><a href="${esc(opts.panelUrl)}" style="color:#8B6914">Abrir o painel</a></p>
</div></div>`;

  const text = [
    `Seguimentos de hoje: ${dateLine} (${count} ${count === 1 ? 'pessoa' : 'pessoas'})`,
    quiet ? 'Agora é de noite: nenhuma mensagem sai antes das 9h30.' : '',
    ...sections.flatMap(s => [
      '',
      `${s.title.toUpperCase()} (${s.items.length})`,
      ...s.items.flatMap(i => [
        `- ${i.name} (${[i.region, formatPhone(i.phone)].filter(Boolean).join(', ')}): ${i.action.title}. ${i.action.why}`,
        i.action.check ? `  Antes de enviar: ${i.action.check}` : '',
        `  ${waLink(i.phone, i.action.messages[0]?.text)}`,
      ].filter(Boolean)),
    ]),
    ...(campaigns.length ? ['', 'CAMPANHAS', ...campaigns.map(c => `- ${c.name}: ${c.eligible} elegíveis (lista no painel)`)] : []),
    '',
    snapshotLine,
    `Painel: ${opts.panelUrl}`,
  ].filter((l, i, all) => l !== '' || all[i - 1] !== '').join('\n');

  return { subject, html, text, count, sections, campaigns };
}
