import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 6);
const WRONG = 'Código errado ou expirado. Tenta o código que a app mostra agora.';

function CodeInput({ value, onChange, onEnter }: { value: string; onChange: (v: string) => void; onEnter: () => void }) {
  return (
    <input
      autoFocus
      inputMode="numeric"
      autoComplete="one-time-code"
      aria-label="Código de 6 números"
      placeholder="000000"
      value={value}
      onChange={e => onChange(onlyDigits(e.target.value))}
      onKeyDown={e => { if (e.key === 'Enter' && value.length === 6) onEnter(); }}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-xl tracking-[0.4em] text-gray-900 outline-none focus:border-gold"
    />
  );
}

/** Depois da senha: o código da app. A sessão passa a aal2 e o painel abre. */
export function AdminMfaChallenge({ factorId }: { factorId: string }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verify = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setBusy(false);
    if (err) { setCode(''); setError(WRONG); }
  };
  return (
    <div className="min-h-screen bg-[#12121e] flex items-center justify-center p-4">
      <div className="bg-[#13132B] border border-gold/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <h1 className="font-playfair text-white font-bold mb-2">Segundo código</h1>
        <p className="text-sm text-white/60 mb-5">Escreve o código de 6 números da app do telemóvel.</p>
        <CodeInput value={code} onChange={setCode} onEnter={verify} />
        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
        <button onClick={verify} disabled={busy || code.length !== 6} className="mt-4 w-full bg-[#D4AF37] text-[#12121e] font-bold py-3 rounded-xl text-sm disabled:opacity-50">
          {busy ? 'A confirmar...' : 'Confirmar'}
        </button>
        <button onClick={() => supabase.auth.signOut()} className="mt-3 w-full text-white/50 py-2 text-sm">Sair</button>
      </div>
    </div>
  );
}

/** Dentro do painel, enquanto a conta não tem segundo fator: ler o QR e confirmar um código. */
export function AdminMfaEnroll() {
  const [setup, setSetup] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    // Uma tentativa anterior que ficou a meio impede outra com o mesmo nome: tira-se primeiro.
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) if (f.factor_type === 'totp' && f.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Painel Kyro', issuer: 'Kyro' });
    setBusy(false);
    if (err || !data) { setError(`Não foi possível começar: ${err?.message ?? 'tenta outra vez'}`); return; }
    setSetup({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };
  const confirm = async () => {
    if (!setup) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.mfa.challengeAndVerify({ factorId: setup.id, code });
    setBusy(false);
    if (err) { setCode(''); setError(WRONG); }
  };

  return (
    <section className="mb-6 rounded-2xl border border-[#D4AF37]/50 bg-white p-4 text-gray-800">
      <div className="flex flex-wrap items-center gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0 text-[#8B6914]" />
        <p className="flex-1 text-sm"><b>Falta o segundo código.</b> Sem ele, uma senha roubada abre o painel.</p>
        {!setup && <button onClick={start} disabled={busy} className="rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-bold text-[#12121e] disabled:opacity-50">{busy ? 'A preparar...' : 'Ativar'}</button>}
      </div>
      {setup && (
        <div className="mx-auto mt-4 max-w-xs space-y-3 text-center text-sm">
          <p>1. Na app de códigos (Google Authenticator, por exemplo), lê este QR:</p>
          <img src={setup.qr} alt="QR para a app de códigos" className="mx-auto h-48 w-48 bg-white" />
          <p className="break-all text-xs text-gray-500">Sem câmara, escreve na app: {setup.secret}</p>
          <p>2. Escreve o código de 6 números que a app mostra:</p>
          <CodeInput value={code} onChange={setCode} onEnter={confirm} />
          <button onClick={confirm} disabled={busy || code.length !== 6} className="w-full rounded-xl bg-[#D4AF37] py-3 font-bold text-[#12121e] disabled:opacity-50">{busy ? 'A confirmar...' : 'Confirmar'}</button>
        </div>
      )}
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </section>
  );
}
