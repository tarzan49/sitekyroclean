// Escolha simples para os packs de limpeza + impermeabilização (sofá e cadeiras).
// Mobile-first: uma pergunta (lugares ou nº de cadeiras), três opções com o
// total final já com deslocação, um botão. Preços pelo mesmo motor do
// bot (botQuote), nunca escritos à mão.
import { useMemo, useState } from 'react';
import { Check, Minus, Plus, MessageCircle, ShieldCheck, Shield, Droplets, Sofa, Armchair, Camera, type LucideIcon } from 'lucide-react';
import { type PackExtra } from '@/lib/customPack';
import { botQuote } from '@/lib/botQuote';
import { WHATSAPP_BASE } from '@/constants/business';
import { formatEuro } from '@/data/enginePrices';

type Kind = 'sofa' | 'chairs';
const SOFA_SIZES = ['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares', '6-lugares', 'foto'];
const PHOTO_SIZE = 'foto'; // canto, em U ou 7+ lugares: preço pela fotografia

const CHAIR_MAX = 20;

const OPTIONS: { extra: PackExtra; title: string; note: string; icon: LucideIcon; top?: boolean }[] = [
  { extra: 'premium', title: 'Limpeza + Premium', note: 'Proteção até 10 anos', icon: ShieldCheck, top: true },
  { extra: 'essencial', title: 'Limpeza + Essencial', note: 'Proteção de 1 a 2 anos', icon: Shield },
  { extra: 'none', title: 'Só limpeza', note: 'Sem proteção', icon: Droplets },
];

interface Props { kind: Kind; city: string; source: string }

export default function WaterproofPackPicker({ kind, city, source }: Props) {
  const [size, setSize] = useState('3-lugares');
  const [qty, setQty] = useState(6);
  const [extra, setExtra] = useState<PackExtra>('premium');

  const byPhoto = kind === 'sofa' && size === PHOTO_SIZE;
  // Os mesmos totais que o bot dá no WhatsApp: a própria função do bot (botQuote), com a deslocação da cidade.
  const totals = useMemo(() => Object.fromEntries(OPTIONS.map(o => {
    if (kind === 'sofa' && size === PHOTO_SIZE) return [o.extra, null];
    const treatment = o.extra === 'premium' ? 'clean+premium' : o.extra === 'essencial' ? 'clean+essencial' : 'clean';
    const item = kind === 'sofa' ? (size === '6-lugares' ? { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto', treatment } : { kind: 'sofa', size, treatment }) : { kind: 'chairs', qty, treatment };
    const r = botQuote({ city, items: [item] }) as { ok: boolean; quote?: boolean; total?: number | null };
    return [o.extra, r.ok && !r.quote && typeof r.total === 'number' ? r.total : null];
  })) as Record<PackExtra, number | null>, [kind, size, qty, city]);

  const seats = Number(size.split('-')[0]);
  const what = byPhoto ? 'sofá de canto, em U ou com mais de 6 lugares (envio fotografia)' : kind === 'sofa' ? `sofá de ${seats} ${seats === 1 ? 'lugar' : 'lugares'}` : `${qty} ${qty === 1 ? 'cadeira' : 'cadeiras'}`;
  const chosen = OPTIONS.find(o => o.extra === extra)!;
  const total = totals[extra];
  const msg = `Olá! Gostaria de saber o preço e a disponibilidade: ${chosen.title.toLowerCase()} de ${what}, em ${city}${total ? ` (vi ${formatEuro(total)} no site)` : ''}.`;
  const ItemIcon = kind === 'sofa' ? Sofa : Armchair;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4 md:gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
      {/* 1. Uma só pergunta */}
      <div>
        <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37] md:block">Passo 1</p>
        <p className="mb-2 text-base font-semibold text-[#1A1A1A] md:mb-4 md:mt-1 md:text-lg">{kind === 'sofa' ? 'Quantos lugares tem o sofá?' : 'Quantas cadeiras?'}</p>
        {kind === 'sofa' ? (
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Lugares">
            {SOFA_SIZES.map(id => {
              const active = size === id;
              if (id === PHOTO_SIZE) return (
                <button key={id} type="button" role="radio" aria-checked={active} onClick={() => setSize(id)}
                  className={`col-span-2 flex min-h-[48px] flex-col md:min-h-[60px] items-center justify-center gap-1 rounded-2xl border-2 transition-all ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_6px_20px_-8px_rgba(212,175,55,0.6)]' : 'border-[#E5E0D3] bg-white hover:border-[#D4AF37]/50'}`}>
                  <Camera className={`hidden h-5 w-5 md:block ${active ? 'text-[#D4AF37]' : 'text-[#B5AD99]'}`} />
                  <span className={`text-sm font-semibold leading-tight ${active ? 'text-[#1A1A1A]' : 'text-[#555]'}`}>Canto, U ou 7+</span>
                </button>
              );
              return (
                <button key={id} type="button" role="radio" aria-checked={active} onClick={() => setSize(id)}
                  className={`flex min-h-[48px] flex-col md:min-h-[60px] items-center justify-center gap-1 rounded-2xl border-2 transition-all ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_6px_20px_-8px_rgba(212,175,55,0.6)]' : 'border-[#E5E0D3] bg-white hover:border-[#D4AF37]/50'}`}>
                  <ItemIcon className={`hidden h-5 w-5 md:block ${active ? 'text-[#D4AF37]' : 'text-[#B5AD99]'}`} />
                  <span className={`text-xl font-semibold leading-none ${active ? 'text-[#1A1A1A]' : 'text-[#555]'}`}>{id.split('-')[0]}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border-2 border-[#E5E0D3] bg-white p-2">
            <button type="button" aria-label="Menos uma cadeira" onClick={() => setQty(q => Math.max(1, q - 1))} className="grid h-12 w-12 place-items-center rounded-xl bg-[#F3F0E7] text-[#1A1A1A] hover:bg-[#E9E3D3]"><Minus className="h-5 w-5" /></button>
            <span className="flex items-center gap-2 text-2xl font-semibold text-[#1A1A1A]"><ItemIcon className="h-5 w-5 text-[#D4AF37]" />{qty}</span>
            <button type="button" aria-label="Mais uma cadeira" onClick={() => setQty(q => Math.min(CHAIR_MAX, q + 1))} className="grid h-12 w-12 place-items-center rounded-xl bg-[#F3F0E7] text-[#1A1A1A] hover:bg-[#E9E3D3]"><Plus className="h-5 w-5" /></button>
          </div>
        )}
        <p className={`${byPhoto ? '' : 'hidden'} mt-2 text-xs leading-relaxed text-[#666] md:mt-3 md:text-sm`}>{kind === 'sofa' ? (byPhoto ? 'Envie-nos uma fotografia do sofá e dizemos-lhe o preço em menos de 1 minuto.' : 'Sofá de canto, em U ou com mais de 6 lugares: o preço é dado pela fotografia.') : `Mais de ${CHAIR_MAX} cadeiras: peça o preço no WhatsApp.`}</p>
      </div>

      {/* 2. Três opções com o total final, 3. um botão */}
      <div>
        <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37] md:block">Passo 2</p>
        <p className="mb-2 text-base font-semibold text-[#1A1A1A] md:mb-4 md:mt-1 md:text-lg">Escolha a opção</p>
        <div className="flex flex-col gap-2 md:gap-3" role="radiogroup" aria-label="Opção">
          {OPTIONS.map(o => {
            const active = extra === o.extra;
            const value = totals[o.extra];
            const Icon = o.icon;
            return (
              <button key={o.extra} type="button" role="radio" aria-checked={active} onClick={() => setExtra(o.extra)}
                className={`relative flex min-h-[60px] items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 md:min-h-[66px] md:py-3 text-left sm:gap-3 sm:px-4 transition-all ${active ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFBEF] to-[#F7EFD6] shadow-[0_10px_30px_-12px_rgba(212,175,55,0.55)]' : 'border-[#E5E0D3] bg-white hover:border-[#D4AF37]/50'}`}>
                {o.top && <span className="absolute -top-2.5 left-4 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">Mais escolhida</span>}
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-11 sm:w-11 ${active ? 'bg-[#D4AF37] text-white' : 'bg-[#F3F0E7] text-[#D4AF37]'}`}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block whitespace-nowrap text-[15px] font-semibold leading-tight text-[#1A1A1A] sm:text-base">{o.title}</span>
                  <span className="block text-[13px] text-[#666] sm:text-sm">{o.note}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className={`whitespace-nowrap text-lg font-bold sm:text-xl ${active ? 'text-[#1A1A1A]' : 'text-[#444]'}`}>{value === null ? <span className="block w-[4.5rem] whitespace-normal text-right text-xs font-semibold leading-tight text-[#D4AF37]">{byPhoto ? 'Pela fotografia' : 'Sob orçamento'}</span> : formatEuro(value)}</span>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? 'border-[#D4AF37] bg-[#D4AF37] text-white' : 'border-[#CFC8B6]'}`}>{active && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                </span>
              </button>
            );
          })}
        </div>
        {!byPhoto && <p className="mt-2 text-xs text-[#666] md:mt-3 md:text-sm">Preço final em {city}, com a deslocação incluída.</p>}

        <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" data-tracking-source={source}
          className="mt-3 flex min-h-12 w-full md:mt-5 md:min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#25D366] whitespace-nowrap px-3 text-center text-[15px] font-bold text-white sm:text-base shadow-[0_10px_24px_-10px_rgba(37,211,102,0.7)] transition-transform hover:-translate-y-0.5">
          {byPhoto ? <Camera className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />} {byPhoto ? 'Enviar fotografia no WhatsApp' : 'Pedir este orçamento no WhatsApp'}
        </a>
        <p className="hidden">Resposta em menos de 1 minuto</p>
      </div>
    </div>
  );
}
