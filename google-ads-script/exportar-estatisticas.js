/**
 * Kyro | Exportar estatísticas (dono, 2026-10-06).
 *
 * Corre dentro da conta do Google Ads (Ferramentas → Ações em massa → Scripts),
 * de hora a hora, e manda o gasto, os cliques, as impressões e as conversões
 * de cada campanha nos últimos 14 dias para o painel do site (separador
 * "Google Ads"), pela Edge Function `ads-daily-sync`.
 *
 * Não corre no site: um push para o GitHub não o atualiza. Mudar o script é
 * colá-lo outra vez na conta.
 *
 * ADS_SYNC_KEY é a mesma chave que está nos segredos das Edge Functions do
 * Supabase; a cópia do dono está em ~/Documents/Kyro-segredos/. Nunca a
 * escrever neste ficheiro (o repositório é público): cola-se só na conta.
 */
var ENDPOINT = 'https://kswapioiaetfccxzfwkg.supabase.co/functions/v1/ads-daily-sync';
var ADS_SYNC_KEY = 'COLAR_AQUI_A_CHAVE';
var DAYS = 14;

function main() {
  var tz = AdsApp.currentAccount().getTimeZone();
  var end = new Date();
  var start = new Date(end.getTime() - (DAYS - 1) * 24 * 3600 * 1000);
  var fmt = function (d) { return Utilities.formatDate(d, tz, 'yyyy-MM-dd'); };

  var query =
    'SELECT segments.date, campaign.id, campaign.name, metrics.impressions, ' +
    'metrics.clicks, metrics.cost_micros, metrics.conversions ' +
    'FROM campaign ' +
    "WHERE segments.date BETWEEN '" + fmt(start) + "' AND '" + fmt(end) + "' " +
    'AND metrics.impressions > 0';

  var rows = [];
  var it = AdsApp.search(query);
  while (it.hasNext()) {
    var r = it.next();
    rows.push({
      date: r.segments.date,
      campaignId: String(r.campaign.id),
      campaignName: r.campaign.name,
      impressions: Number(r.metrics.impressions || 0),
      clicks: Number(r.metrics.clicks || 0),
      cost: Number(r.metrics.costMicros || 0) / 1e6,
      conversions: Number(r.metrics.conversions || 0),
    });
  }

  var res = UrlFetchApp.fetch(ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-ads-key': ADS_SYNC_KEY },
    payload: JSON.stringify({ rows: rows }),
    muteHttpExceptions: true,
  });
  Logger.log('Enviadas ' + rows.length + ' linhas: HTTP ' + res.getResponseCode() + ' ' + res.getContentText());
  if (res.getResponseCode() !== 200) throw new Error('O painel recusou: ' + res.getContentText());
}
