import { clearPrerenderedSchema } from '../lib/seoSchema';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Trash2, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cities } from '@/data/locationSeoData';
import { getAllPackComboRoutes, getPackByCityAndId } from '@/data/packComboData';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import { calculateCustomPack, makePackItem, PACK_KIND_LABEL, EXTRA_LABEL, type PackKind, type CustomPackItem, type PackExtra } from '@/lib/customPack';
import { PRICE_PROMISE, DRYING_PROMISE, SATISFACTION_PROMISE, AVAILABILITY_PROMISE } from '@/constants/commercialPolicy';
import { SITE_URL, WHATSAPP_BASE } from '@/constants/business';
const money = (n: number) => n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
const input = 'w-full min-h-12 rounded-lg border border-[#DAD5C7] bg-white px-3 py-2 text-base text-[#111111]';
export default function CustomPackPage() {
  const { pathname } = useLocation();
  const route = getAllPackComboRoutes().find(r => r.path === pathname);
  const preset = route && getPackByCityAndId(route.packId, route.citySlug);
  const [items, setItems] = useState<CustomPackItem[]>([]);
  const [city, setCity] = useState('');
  useEffect(() => {
    clearPrerenderedSchema();
    setCity(preset?.city.name ?? '');
    const kinds: PackKind[] = preset?.pack.id === 'sofa-colchao' ? ['sofa', 'mattress'] : preset?.pack.id === 'sala-completa' ? ['sofa', 'rug', 'chairs'] : preset?.pack.id === 'quarto-completo' ? ['mattress', 'rug'] : ['sofa'];
    setItems(kinds.map((kind, i) => ({ ...makePackItem(kind, `initial-${i}`), extra: preset?.pack.id === 'sofa-impermeabilizacao' ? 'premium' : 'none' })));
    document.title = `${preset ? `${preset.pack.name} em ${preset.city.name}` : 'Monte o seu pack de limpeza'} | Kyro Clean Solutions`;
    const description = 'Escolha os artigos, tamanhos e tratamentos para a mesma visita. Tapetes e alcatifas sob orçamento. Deslocação discriminada. Resposta em menos de 10 minutos.';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', SITE_URL + pathname);
    for (const key of ['og:title','twitter:title']) document.querySelector(`meta[property="${key}"],meta[name="${key}"]`)?.setAttribute('content', document.title);
    for (const key of ['og:description','twitter:description']) document.querySelector(`meta[property="${key}"],meta[name="${key}"]`)?.setAttribute('content', description);
  }, [pathname]);
  const prices = calculateCustomPack(items, city);
  const patch = (id: string, values: Partial<CustomPackItem>) => setItems(old => old.map(item => item.id === id ? { ...item, ...values } : item));
  const msg = [`Olá! Gostaria de confirmar este pack personalizado em ${city}:`, ...prices.lines.map(l => `${l.label}: ${l.amount === null ? 'sob orçamento' : money(l.amount)}${l.quote && l.amount !== null ? ' + extra sob orçamento' : ''}`), `Serviços tabelados: ${money(prices.subtotal)}`, `Deslocação: ${prices.travel === null ? 'a confirmar' : money(prices.travel)}`, `${prices.quote ? 'Subtotal conhecido' : 'Estimativa total'}: ${money(prices.total)}${prices.quote ? ' + valores sob orçamento' : ''}`, 'Podem confirmar o valor e a disponibilidade?'].join('\n');
  return <><Header /><main className="bg-[#FDFDF9] text-[#111111] pt-28 pb-16"><div className="max-w-6xl mx-auto px-5">
    <p className="text-[#1A4E30] uppercase tracking-widest text-sm mb-4">Uma visita, os artigos que escolher</p><h1 className="type-page-title font-playfair   mb-5">{preset ? `${preset.pack.name} em ${preset.city.name}` : 'Monte o seu pack de limpeza'}</h1>
    <p className="max-w-3xl text-lg text-[#555] mb-9">Adicione os seus sofás, colchões, cadeiras, tapetes ou alcatifas. Pode alterar esta combinação e escolher os tratamentos de cada artigo.</p>
    <div className="grid lg:grid-cols-[1fr_360px] gap-7 items-start"><section aria-label="Configurar artigos" className="space-y-5">
      <label className="block font-semibold">Localidade<select className={`${input} mt-2`} value={city} onChange={e => setCity(e.target.value)}><option value="">Escolha a localidade</option>{cities.map(c => <option key={c.slug}>{c.name}</option>)}<option>Aveiro</option><option>Coimbra</option><option>Outra localidade</option></select></label>
      {items.map((item, idx) => <article key={item.id} className="bg-white border border-[#E5E0D3] rounded-xl p-5 space-y-4"><div className="flex items-center justify-between gap-4"><h2 className="type-quote-title font-playfair ">{idx + 1}. {PACK_KIND_LABEL[item.kind]}</h2><button type="button" aria-label={`Remover artigo ${idx + 1}`} onClick={() => setItems(old => old.filter(i => i.id !== item.id))} className="p-3"><Trash2 className="w-5 h-5" /></button></div>
        <div className="grid sm:grid-cols-2 gap-4">{(item.kind === 'sofa' || item.kind === 'mattress') && <label>Tamanho<select className={`${input} mt-1`} value={item.size} onChange={e => patch(item.id, { size: e.target.value })}>{(item.kind === 'sofa' ? sofaPrices : mattressPrices).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label>}
        <label>Quantidade<input type="number" min="1" max="100" className={`${input} mt-1`} value={item.qty || ''} onChange={e => patch(item.id, { qty: Number(e.target.value) })} /></label></div>
        {item.kind === 'sofa' && <label className="flex items-center gap-3 py-2"><input type="checkbox" className="w-5 h-5" checked={item.chaise} onChange={e => patch(item.id, { chaise: e.target.checked })} />Com chaise longue</label>}
        {(item.kind === 'rug' || item.kind === 'carpet') ? <><p className="text-base">Sempre sob orçamento. Indique as medidas de cada peça ou área; adicione outra linha se forem diferentes.</p><div className="grid grid-cols-2 gap-3"><label>Largura (m)<input inputMode="decimal" className={`${input} mt-1`} value={item.width} onChange={e => patch(item.id, { width: e.target.value })} /></label><label>Comprimento (m)<input inputMode="decimal" className={`${input} mt-1`} value={item.length} onChange={e => patch(item.id, { length: e.target.value })} /></label></div></> : <label className="block">Tratamento<select className={`${input} mt-1`} value={item.extra} onChange={e => patch(item.id, { extra: e.target.value as PackExtra })}><option value="none">Só limpeza</option>{item.kind !== 'mattress' && <><option value="premium">{EXTRA_LABEL.premium}</option><option value="essencial">{EXTRA_LABEL.essencial}</option></>}<option value="anti-acaros">{EXTRA_LABEL['anti-acaros']}{item.kind === 'chairs' ? ' · 5€/un.' : ''}</option><option value="desbacterizacao">{EXTRA_LABEL.desbacterizacao}</option></select></label>}
      </article>)}
      <div className="flex flex-wrap gap-3">{(Object.keys(PACK_KIND_LABEL) as PackKind[]).map(kind => <button type="button" key={kind} onClick={() => setItems(old => [...old, makePackItem(kind, crypto.randomUUID())])} className="flex gap-2 items-center rounded-lg border border-[#B4A166] p-3 font-semibold"><Plus className="w-4 h-4" />{PACK_KIND_LABEL[kind]}</button>)}</div>
    </section><aside className="bg-[#071a12] text-white rounded-xl p-6 lg:sticky lg:top-24"><h2 className="type-section-title font-playfair  mb-5">O seu pack</h2><div className="space-y-4 text-base">{prices.lines.map((line, i) => <div key={items[i].id} className="border-b border-white/15 pb-3"><p className="text-white/75">{line.label}</p><p className="font-semibold mt-1">{line.amount === null ? 'Sob orçamento' : money(line.amount)}{line.quote && line.amount !== null ? ' + extra sob orçamento' : ''}</p></div>)}<p>Serviços tabelados: {money(prices.subtotal)}</p><p>Deslocação: {prices.travel === null ? 'A confirmar' : money(prices.travel)}</p><p className="text-lg font-semibold">{prices.quote ? 'Subtotal conhecido' : 'Estimativa total'}: {money(prices.total)}</p>{prices.quote && <p className="text-gold">Acrescem os artigos ou extras sob orçamento.</p>}</div>
      <p className="text-sm text-white/80 mt-5">Preços de tabela por artigo. Uma deslocação. Valores sob orçamento confirmados separadamente.</p>
      {prices.valid ? <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mt-6 bg-gold text-[#071a12] rounded-lg p-4 font-bold"><MessageCircle className="w-5 h-5" />Confirmar o meu orçamento</a> : <p role="status" className="mt-6 rounded-lg bg-white/10 p-4">Escolha a localidade e complete quantidades e medidas válidas para pedir a confirmação.</p>}<p className="text-sm text-white/70 mt-4">Resposta em menos de 10 minutos</p></aside></div>
    <section className="mt-14 max-w-3xl space-y-4"><h2 className="type-section-title font-playfair ">Antes de marcar</h2><p>{PRICE_PROMISE}</p><p>{AVAILABILITY_PROMISE}</p><p>{DRYING_PROMISE}</p><p>{SATISFACTION_PROMISE}</p><p>Impermeabilização Premium: até 10 anos, conforme utilização e cuidados. Essencial: 1 a 2 anos. A cura do tratamento pode exigir 24 horas; confirme as instruções da equipa.</p><div className="flex flex-wrap gap-5 pt-4"><Link className="underline" to="/tratamento-anti-acaros">Conhecer o tratamento anti-ácaros</Link><Link className="underline" to="/desbacterizacao">Conhecer a desbacterização</Link><Link className="underline" to="/guia-de-packs">Packs por localidade</Link></div></section>
  </div></main><Footer /></>;
}
