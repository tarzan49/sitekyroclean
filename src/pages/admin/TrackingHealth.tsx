import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTrackingDeliveryStatus } from '@/lib/quizTracking';
import { areTagsLoaded } from '@/lib/gtag';
import { isMetaPixelLoaded } from '@/lib/metaPixel';
import { getConsent } from '@/lib/consent';
import { ADS_LEAD_CONVERSION_LABEL, GA4_MEASUREMENT_ID, GOOGLE_ADS_ID, META_PIXEL_ID, trackingEnv } from '@/constants/tracking';

/** Read-only signals, never claim that missing error reports prove delivery. */
export function TrackingHealth() {
  const [health, setHealth] = useState<{ last: string | null; failures: number; error: boolean } | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [latest, failures] = await Promise.all([
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- admin tables are absent from generated schema
          (supabase as any).from('quiz_events').select('created_at').not('page_path', 'like', '/admin%').order('created_at', { ascending: false }).limit(1),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- admin tables are absent from generated schema
          (supabase as any).from('error_logs').select('id', { count: 'exact', head: true }).eq('source', 'TrackingDelivery').gte('created_at', new Date(Date.now() - 86400000).toISOString()),
        ]);
        if (latest.error || failures.error) throw new Error('Health query failed');
        if (active) setHealth({ last: latest.data?.[0]?.created_at || null, failures: failures.count || 0, error: false });
      } catch { if (active) setHealth({ last: null, failures: 0, error: true }); }
    };
    void load();
    const interval = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 60000);
    return () => { active = false; clearInterval(interval); };
  }, []);
  const local = getTrackingDeliveryStatus();
  // Estado da Google tag **neste** browser. Não diz nada sobre os visitantes:
  // é um sinal de diagnóstico para quando o painel está a zeros e é preciso
  // separar "ninguém visitou" de "a recolha está desligada".
  const consent = getConsent();
  return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
    <strong>Estado da recolha</strong>
    {!health ? <p>A verificar a última gravação...</p> : health.error ? <p role="alert">Não foi possível verificar a recolha. Confirme a ligação e as permissões da base de dados.</p> : <>
      <p>Último evento recebido: {health.last ? new Date(health.last).toLocaleString('pt-PT', { timeZone: 'Europe/Copenhagen' }) : 'nenhum registo disponível'} (Copenhaga).</p>
      <p>{health.failures} falhas de entrega reportadas nas últimas 24 horas.</p>
      {(!health.last || Date.now() - Date.parse(health.last) > 86400000) && <p className="font-semibold text-amber-800">Sem eventos nas últimas 24 horas. Verifique a recolha antes de interpretar zeros como ausência de contactos.</p>}
    </>}
    {local.pending > 0 && <p className="text-amber-800">Este navegador tem {local.pending} eventos à espera de confirmação. A entrega é repetida quando há ligação.</p>}
    <p className="mt-2 text-xs text-slate-600">
      Google tag neste browser: {areTagsLoaded() ? 'carregada' : 'não carregada'}
      {' · '}consentimento: {consent ?? 'sem decisão'}
      {' · '}ambiente: {trackingEnv()}
      {' · '}GA4 {GA4_MEASUREMENT_ID} · Ads {GOOGLE_ADS_ID}
      {' · '}Pixel Meta {META_PIXEL_ID}: {isMetaPixelLoaded() ? 'carregado' : 'não carregado'}
    </p>
    {!ADS_LEAD_CONVERSION_LABEL && <p className="mt-1 text-xs font-semibold text-amber-800">Etiqueta da conversão do Google Ads em falta (VITE_GOOGLE_ADS_LEAD_CONVERSION_LABEL no Cloudflare Pages): o lead confirmado sai para o GA4 e para o Pixel da Meta, mas a conversão do Google Ads não é enviada.</p>}
    <p className="mt-1 text-xs text-slate-500">Atualização automática a cada minuto. A ausência de erros reportados não prova que todos os dispositivos entregaram os eventos.</p>
  </div>;
}
