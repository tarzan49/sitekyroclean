import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTrackingDeliveryStatus } from '@/lib/quizTracking';

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
  return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
    <strong>Estado da recolha</strong>
    {!health ? <p>A verificar a última gravação...</p> : health.error ? <p role="alert">Não foi possível verificar a recolha. Confirme a ligação e as permissões da base de dados.</p> : <>
      <p>Último evento recebido: {health.last ? new Date(health.last).toLocaleString('pt-PT', { timeZone: 'Europe/Copenhagen' }) : 'nenhum registo disponível'} (Copenhaga).</p>
      <p>{health.failures} falhas de entrega reportadas nas últimas 24 horas.</p>
      {(!health.last || Date.now() - Date.parse(health.last) > 86400000) && <p className="font-semibold text-amber-800">Sem eventos nas últimas 24 horas. Verifique a recolha antes de interpretar zeros como ausência de contactos.</p>}
    </>}
    {local.pending > 0 && <p className="text-amber-800">Este navegador tem {local.pending} eventos à espera de confirmação. A entrega é repetida quando há ligação.</p>}
    <p className="mt-1 text-xs text-slate-500">Atualização automática a cada minuto. A ausência de erros reportados não prova que todos os dispositivos entregaram os eventos.</p>
  </div>;
}
