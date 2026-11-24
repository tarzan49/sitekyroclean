// Escolha simples para os packs de limpeza + impermeabilização (sofá e cadeiras).
// Mobile-first: uma pergunta (lugares ou nº de cadeiras), três opções com o
// total final já com deslocação, um botão. Preços pelo mesmo motor do
// bot (botQuote), nunca escritos à mão.
import { useMemo, useState } from 'react';
import { Check, Minus, Plus, MessageCircle, Sofa, Armchair, Camera } from 'lucide-react';
import { BEFORE_AFTER_POOL } from '@/data/beforeAfterPool';
import premiumSofa from '@/assets/picker-premium-sofa.webp';
import essencialSofa from '@/assets/picker-essencial-sofa.webp';
import premiumChair from '@/assets/picker-premium-cadeira.webp';
import essencialChair from '@/assets/picker-essencial-cadeira.webp';
import { type PackExtra } from '@/lib/customPack';
import { botQuote } from '@/lib/botQuote';
import { WHATSAPP_BASE } from '@/constants/business';
import { formatEuro } from '@/data/enginePrices';

type Kind = 'sofa' | 'chairs';
const SOFA_SIZES = ['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares', '6-lugares']; // até 6; canto/U/7+ pede-se no WhatsApp (dono, 24 Nov)
const PHOTO_SIZE = 'foto'; // canto, em U ou 7+ lugares: preço pela fotografia

const CHAIR_MAX = 20;

// Cada pack tem um nome que o define (dono, 24 Nov); "Premium"/"Essencial" ficam por baixo, como o bot diz.
const OPTIONS: { extra: PackExtra; name: string; title: string; note: string; top?: boolean }[] = [
  { extra: 'premium', name: 'Blindado', title: 'Limpeza + Premium', note: 'Anti-manchas e anti-líquidos, até 10 anos', top: true },
  { extra: 'essencial', name: 'Protegido', title: 'Limpeza + Essencial', note: 'A mesma proteção, mais económica: 1 a 2 anos' },
  { extra: 'none', name: 'Renovado', title: 'Só limpeza', note: 'Limpeza profunda, sem proteção' },
];

// Fotografia real que diz a escolha num olhar (dono, 24 Nov): o líquido em cima do tecido nas
// opções com proteção, o artigo limpo no "só limpeza".
const afterOf = (cat: 'sofa' | 'cadeiras') => (BEFORE_AFTER_POOL[cat].find(p => p.kind === 'pair') as { after: string } | undefined)?.after ?? '';
const PHOTO: Record<'sofa' | 'chairs', Record<string, string>> = {
  sofa: { premium: premiumSofa, essencial: essencialSofa, none: afterOf('sofa') },
  chairs: { premium: premiumChair, essencial: essencialChair, none: afterOf('cadeiras') },
};

interface Props { kind: Kind; city: string; source: string; onMore?: () => void }

export default function WaterproofPackPicker({ kind, city, source, onMore }: Props) {
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

  // "Em vez de": a limpeza e a impermeabilização pedidas em separado (cada uma com a sua deslocação), pelo bot.
  // É a única comparação permitida (pack contra separado; regra do dono, 19 Nov).
  const separate = useMemo(() => {
    if (kind === 'sofa' && size === PHOTO_SIZE) return {} as Record<string, number | null>;
    const one = (treatment: string) => {
      const item = kind === 'sofa' ? (size === '6-lugares' ? { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto', treatment } : { kind: 'sofa', size, treatment }) : { kind: 'chairs', qty, treatment };
      const r = botQuote({ city, items: [item] }) as { ok: boolean; quote?: boolean; total?: number | null };
      return r.ok && !r.quote && typeof r.total === 'number' ? r.total : null;
    };
    const clean = one('clean');
    const pick = (t: string) => { const w = one(t); return clean !== null && w !== null ? clean + w : null; };
    return { premium: pick('premium'), essencial: pick('essencial') } as Record<string, number | null>;
  }, [kind, size, qty, city]);

  const seats = Number(size.split('-')[0]);
  const what = byPhoto ? 'sofá de canto, em U ou com mais de 6 lugares (envio fotografia)' : kind === 'sofa' ? `sofá de ${seats} ${seats === 1 ? 'lugar' : 'lugares'}` : `${qty} ${qty === 1 ? 'cadeira' : 'cadeiras'}`;
  const chosen = OPTIONS.find(o => o.extra === extra)!;
  const total = totals[extra];
  // Mensagem pronta no WhatsApp com a escolha completa (dono, 24 Nov): o nome do pack, o que inclui, a peça,
  // a cidade e o total que viu. O bot lê-a como um orçamento já escolhido e segue para as horas.
  const WHAT_INCLUDES: Record<string, string> = {
    premium: 'limpeza + impermeabilização Premium, proteção anti-manchas e anti-líquidos até 10 anos',
    essencial: 'limpeza + impermeabilização Essencial, proteção anti-manchas e anti-líquidos de 1 a 2 anos',
    none: 'só limpeza, sem impermeabilização',
  };
  const piece = byPhoto ? 'sofá de canto, em U ou com mais de 6 lugares' : what;
  const msg = `Olá! Gostaria de saber o preço e a disponibilidade do pack ${chosen.name} (${WHAT_INCLUDES[extra]}) para ${kind === 'sofa' ? 'um ' : ''}${piece}, em ${city}${total && !byPhoto ? `, por ${formatEuro(total)}` : ''}. Envio a fotografia ${kind === 'sofa' ? 'do sofá' : 'das cadeiras'}.`;
  const ItemIcon = kind === 'sofa' ? Sofa : Armchair;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4 md:gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
      {/* 1. Uma só pergunta */}
      <div>
        <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37] md:block">Passo 1</p>
        <p className="mb-2 text-base font-semibold text-[#1A1A1A] md:mb-4 md:mt-1 md:text-lg">{kind === 'sofa' ? 'Quantos lugares tem o sofá?' : 'Quantas cadeiras?'}</p>
        {kind === 'sofa' ? (
          <div className="grid grid-cols-6 gap-1.5 md:grid-cols-3 md:gap-2" role="radiogroup" aria-label="Lugares">
            {SOFA_SIZES.map(id => {
              const active = size === id;
              // Canto, U ou 7+: no telemóvel uma linha por baixo dos números (para a secção caber num ecrã).
              if (id === PHOTO_SIZE) return (
                <button key={id} type="button" role="radio" aria-checked={active} onClick={() => setSize(id)}
                  className={`col-span-6 flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-sm font-semibold transition-all md:col-span-2 md:min-h-[60px] md:flex-col md:rounded-2xl md:border-2 ${active ? 'text-[#1A1A1A] md:border-[#D4AF37] md:bg-[#D4AF37]/10' : 'text-[#555] underline decoration-[#D4AF37] underline-offset-4 md:border-[#E5E0D3] md:bg-white md:no-underline'}`}>
                  <Camera className={`h-4 w-4 md:h-5 md:w-5 ${active ? 'text-[#D4AF37]' : 'text-[#B5AD99]'}`} />
                  <span>Canto, U ou 7+ lugares</span>
                </button>
              );
              return (
                <button key={id} type="button" role="radio" aria-checked={active} onClick={() => setSize(id)}
                  className={`flex min-h-[44px] flex-col md:min-h-[60px] items-center justify-center gap-1 rounded-2xl border-2 transition-all ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_6px_20px_-8px_rgba(212,175,55,0.6)]' : 'border-[#E5E0D3] bg-white hover:border-[#D4AF37]/50'}`}>
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
        {onMore && <button type="button" onClick={onMore} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 px-3 text-sm font-bold text-[#1A1A1A] transition-colors hover:bg-[#D4AF37]/20 md:mt-3 md:min-h-12"><Plus className="h-4 w-4 text-[#D4AF37]" strokeWidth={3} />Juntar mais artigos à mesma visita</button>}
        <p className={`${byPhoto ? '' : 'hidden'} mt-2 text-xs leading-relaxed text-[#666] md:mt-3 md:text-sm`}>{kind === 'sofa' ? (byPhoto ? 'Envie-nos uma fotografia do sofá e dizemos-lhe o preço em menos de 1 minuto.' : 'Sofá de canto, em U ou com mais de 6 lugares: o preço é dado pela fotografia.') : `Mais de ${CHAIR_MAX} cadeiras: peça o preço no WhatsApp.`}</p>
      </div>

      {/* 2. Três opções com o total final, 3. um botão */}
      <div>
        <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37] md:block">Passo 2</p>
        <p className="mb-2 hidden text-base font-semibold text-[#1A1A1A] md:mb-4 md:mt-1 md:block md:text-lg">Escolha a opção</p>
        <div className="flex flex-col gap-2.5 pt-1.5 md:gap-3" role="radiogroup" aria-label="Opção">
          {OPTIONS.map(o => {
            const active = extra === o.extra;
            const value = totals[o.extra];
            return (
              <button key={o.extra} type="button" role="radio" aria-checked={active} onClick={() => setExtra(o.extra)}
                className={`relative flex min-h-[58px] items-stretch rounded-2xl border-2 text-left transition-all md:min-h-[84px] ${active ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFBEF] to-[#F7EFD6] shadow-[0_10px_30px_-12px_rgba(212,175,55,0.55)]' : 'border-[#E5E0D3] bg-white hover:border-[#D4AF37]/50'}`}>
                {o.top && <span className="absolute -top-3 right-3 z-10 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">Mais escolhido</span>}
                <img src={PHOTO[kind][o.extra]} alt="" loading="lazy" decoding="async" className="w-[76px] shrink-0 rounded-l-[14px] object-cover md:w-[100px]" />
                <span className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2">
                  <span className="block text-lg font-bold leading-tight text-[#1A1A1A]">{o.name}</span>
                  <span className="block text-[12px] leading-snug text-[#555] sm:text-[13px]">{o.note}</span>
                </span>
                <span className="flex items-center gap-2 pr-3">
                  <span className="flex flex-col items-end leading-tight">
                    {value !== null && separate[o.extra] && separate[o.extra]! > value && <span className="text-[11px] text-[#888] line-through">{formatEuro(separate[o.extra]!)}</span>}
                    <span className={`whitespace-nowrap text-lg font-bold sm:text-xl ${active ? 'text-[#1A1A1A]' : 'text-[#444]'}`}>{value === null ? <span className="block w-[4.5rem] whitespace-normal text-right text-xs font-semibold leading-tight text-[#D4AF37]">{byPhoto ? 'Pela fotografia' : 'Sob orçamento'}</span> : formatEuro(value)}</span>
                  </span>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? 'border-[#D4AF37] bg-[#D4AF37] text-white' : 'border-[#CFC8B6]'}`}>{active && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                </span>
              </button>
            );
          })}
        </div>
        {!byPhoto && <p className="mt-2 text-xs text-[#666] md:mt-3 md:text-sm">Preço final em {city}, deslocação incluída.</p>}

        <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" data-tracking-source={source}
          className="mt-3 flex min-h-12 w-full md:mt-5 md:min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#25D366] whitespace-nowrap px-3 text-center text-[15px] font-bold text-white sm:text-base shadow-[0_10px_24px_-10px_rgba(37,211,102,0.7)] transition-transform hover:-translate-y-0.5">
          {byPhoto ? <Camera className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />} {byPhoto ? 'Enviar fotografia no WhatsApp' : 'Pedir este orçamento no WhatsApp'}
        </a>
        <p className="hidden">Resposta em menos de 1 minuto</p>
      </div>
    </div>
  );
}
