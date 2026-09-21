import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as Dialog from '@radix-ui/react-dialog';
import { localDate, PLATFORM_LABEL, type MarketingPlatform } from '@/lib/marketingPlatforms';
// Existing marketing tables are not in the legacy generated schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
const inputStyle = 'mt-1 w-full min-h-11 rounded-lg border border-gray-300 px-3 py-2 text-sm';

export function SpendForm({ platform, onSaved }: { platform: MarketingPlatform; onSaved: () => void }) {
  const [date, setDate] = useState(localDate());
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  return <form className="p-4 border-t space-y-3" onSubmit={async e => {
    e.preventDefault();
    const value = Number(amount.replace(',', '.'));
    if (!amount.trim() || !Number.isFinite(value) || value < 0 || !date || date > localDate()) return;
    setBusy(true); setMessage('');
    try {
      const { error } = await db.from('ad_spend_daily').upsert({ platform, spend_date: date, amount: value, updated_at: new Date().toISOString() }, { onConflict: 'platform,spend_date' });
      if (error) throw error;
      setMessage('Gasto do dia guardado.'); setAmount(''); onSaved();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível guardar o gasto. Confirme a migração e o acesso administrativo.'); }
    finally { setBusy(false); }
  }}>
    <p className="text-sm font-semibold">Registar gasto real de {PLATFORM_LABEL[platform]}</p>
    <p className="text-xs text-gray-500">Total das campanhas nesse dia, em euros, conforme o relatório da plataforma. Guardar substitui o valor anterior desse dia. Registe 0 nos dias sem gasto; dias em falta não são zero.</p>
    <div className="grid sm:grid-cols-3 gap-3 items-end">
      <label className="text-sm">Dia (Portugal)<input type="date" required max={localDate()} value={date} onChange={e => setDate(e.target.value)} className={inputStyle} /></label>
      <label className="text-sm">Gasto (€)<input required inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} className={inputStyle} placeholder="Ex.: 15,20" /></label>
      <button disabled={busy} className="min-h-11 px-4 bg-navy text-white rounded-lg disabled:opacity-50">{busy ? 'A guardar…' : 'Guardar gasto'}</button>
    </div>
    {message && <p role="status" className="text-sm">{message}</p>}
  </form>;
}

export function ManualMarketingLead({ platform, onClose, onSaved }: { platform: MarketingPlatform; onClose: () => void; onSaved: () => void }) {
  const [requestId] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <Dialog.Root open onOpenChange={open => { if (!open && !busy) onClose(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" /><Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%_-_2rem)] max-w-lg rounded-2xl bg-white p-5 max-h-[90dvh] overflow-y-auto">
    <div><Dialog.Title className="font-semibold text-lg">Registar pedido de {PLATFORM_LABEL[platform]}</Dialog.Title><Dialog.Description className="text-sm text-gray-500 mt-2">Para pedidos reais que chegaram por mensagem ou chamada fora do formulário. Se o pedido já existe, abra-o no CRM e registe apenas o contacto para evitar duplicados. A origem fica identificada como declaração manual.</Dialog.Description></div>
    <Dialog.Close disabled={busy} className="min-h-11 underline text-sm">Fechar</Dialog.Close>
    <form className="space-y-3" onSubmit={async e => {
      e.preventDefault(); const form = new FormData(e.currentTarget); setBusy(true); setError('');
      try {
        const { error: failure } = await db.rpc('register_marketing_lead', { request_id: requestId, platform,
          customer_name: form.get('name'), customer_phone: form.get('phone'), service_name: form.get('service'),
          locality: form.get('location'), campaign: form.get('campaign'), contact_channel: form.get('channel'), evidence: form.get('evidence') });
        if (failure) throw failure;
        onSaved(); onClose();
      } catch { setError('Não foi possível guardar. Confirme a migração e o acesso administrativo. Pode repetir sem duplicar este pedido.'); }
      finally { setBusy(false); }
    }}>
      {([['name','Nome',true,150],['phone','Telefone',false,40],['service','Serviço',true,150],['location','Localidade',false,150],['campaign','Campanha (se conhecida)',false,250]] as const).map(([name,label,required,max]) => <label key={name} className="block text-sm">{label}<input name={name} required={required} maxLength={max} className={inputStyle} /></label>)}
      <label className="block text-sm">Canal<select name="channel" className={inputStyle}><option value="whatsapp">WhatsApp</option><option value="phone">Telefone</option><option value="email">Email</option><option value="other">Instagram / Messenger / outro</option></select></label>
      <label className="block text-sm">Como confirmou que veio deste anúncio?<textarea name="evidence" required maxLength={2000} rows={2} className={inputStyle} placeholder="Ex.: a conversa identifica o anúncio de origem." /></label>
      <p className="text-xs text-gray-500">Este registo não envia conversões para as plataformas nem cria uma visita ao site.</p>
      {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
      <button disabled={busy} className="min-h-11 w-full rounded-lg bg-navy text-white disabled:opacity-50">{busy ? 'A guardar…' : 'Guardar pedido real'}</button>
    </form>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
