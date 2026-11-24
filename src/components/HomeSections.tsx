// Secções novas da página inicial (dono, 24 Nov: "o resto é para refazer tudo, está super default").
// Mesmas peças aprovadas nas páginas de serviço: widget de preço dos packs, história antes/depois/proteção
// com material real, perguntas compactas. Cada secção cabe num ecrã do telemóvel.
import { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from './SectionHeader';
import WaterproofPackPicker from './WaterproofPackPicker';
import CompactFAQ from './CompactFAQ';
import { choiceToItems } from './quiz/basketChoice';
import type { BasketItem } from './quiz/VisitBasket';
const VisitBasketLazy = lazy(() => import('./quiz/VisitBasket'));
import { StoryPlayer, storyFor } from './WaterproofPackSections';
import { cities } from '@/data/serviceCatalog';
import { RESOURCE_FAQS } from '@/data/resourceContent';
import { MessageCircle, Phone } from 'lucide-react';
import { WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY } from '@/constants/business';
import { buildGeneralWaMessage } from '@/lib/whatsappMessages';

const CHIPS = [
  { id: 'sofa' as const, label: 'Sofá' },
  { id: 'chairs' as const, label: 'Cadeiras' },
  { id: 'colchao', label: 'Colchão', href: '/limpeza-colchoes' },
  { id: 'tapete', label: 'Tapete', href: '/limpeza-tapetes' },
];

/** "O seu preço": escolha do artigo + o widget dos packs (Blindado/Protegido/Renovado) com os totais do bot. */
export function HomePriceSection() {
  const [kind, setKind] = useState<'sofa' | 'chairs'>('sofa');
  const [city, setCity] = useState('Lisboa');
  // "Juntar mais artigos" leva a escolha feita para o cesto, como nas páginas de serviço (24 Nov:
  // na inicial o cesto abria vazio, sem o sofá ou as cadeiras que a pessoa tinha acabado de escolher).
  const [basket, setBasket] = useState<BasketItem[] | null>(null);
  const navigate = useNavigate();
  return (
    <section id="preco" className="scroll-mt-20 bg-kyro-green py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <SectionHeader heading="O seu" goldWord="preço" light={false} className="!mb-3" />
        {/* Artigo e localidade numa só linha (para a secção caber num ecrã). */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <select value={kind} aria-label="Artigo" onChange={e => { const v = e.target.value; const chip = CHIPS.find(c => c.id === v); if (chip?.href) navigate(chip.href); else setKind(v as 'sofa' | 'chairs'); }}
            className="h-11 rounded-xl border-2 border-[#D4AF37] bg-white px-3 text-sm font-semibold text-[#1A1A1A]">
            {CHIPS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select value={city} onChange={e => setCity(e.target.value)} aria-label="Localidade"
            className="h-11 rounded-xl border-2 border-[#E5E0D3] bg-white px-3 text-sm font-semibold text-[#1A1A1A]">
            {cities.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="rounded-2xl bg-white p-3 md:p-6">
          <WaterproofPackPicker key={kind} kind={kind} city={city} source="home_picker" onMore={c => setBasket(choiceToItems(c))} compact />
        </div>
      </div>
      {basket && <Suspense fallback={null}><VisitBasketLazy isOpen onClose={() => setBasket(null)} initialCity={city} initialItems={basket} /></Suspense>}
    </section>
  );
}

/** Antes, depois da limpeza e com a proteção: fotografias e vídeo reais, em formato história no telemóvel. */
export function HomeStorySection() {
  const story = storyFor('sofa');
  return (
    <section id="resultado" className="scroll-mt-20 bg-kyro-green py-12 text-white md:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeader heading="Do antes à proteção," goldWord="na mesma visita" light={false} />
        <StoryPlayer story={story} />
        <div className="mt-2 hidden gap-5 md:grid md:grid-cols-3">
          {story.map((p, i) => (
            <figure key={p.label}>
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/30">
                {p.video
                  ? <video src={p.video} poster={p.poster} autoPlay muted loop playsInline preload="metadata" className="aspect-square max-h-[46svh] w-full object-cover" />
                  : <img src={p.image} alt={p.alt} loading="lazy" decoding="async" className="aspect-square max-h-[46svh] w-full object-cover" />}
                <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#D4AF37]">{i + 1} · {p.label}</span>
              </div>
              <figcaption className="mt-3 text-sm leading-relaxed text-white/80">{p.text}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/55">Fotografias e vídeo reais de serviços da nossa equipa.</p>
      </div>
    </section>
  );
}

/** Perguntas gerais (as do site; a da garantia fica de fora por dizer "não prometemos", contra a regra do dono). */
export function HomeFaqSection() {
  const faqs = RESOURCE_FAQS.filter(f => f.id !== 'garantia-e-manchas').map(f => ({ question: f.question, answer: f.answer }));
  return <CompactFAQ id="perguntas" faqs={faqs} heading="Perguntas frequentes" />;
}

/** Fecho da página inicial: a mensagem do topo, o WhatsApp e o telefone (sai o "Calcular o meu preço"; dono, 24 Nov). */
export function HomeClosingSection() {
  return (
    <section id="fecho" className="scroll-mt-20 bg-kyro-green py-12 text-center text-white md:py-16">
      <div className="mx-auto max-w-xl px-5">
        <SectionHeader heading="Os seus estofos como novos," goldWord="ainda hoje." light={false} className="!mb-6" />
        <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage())}`} target="_blank" rel="noopener noreferrer" data-tracking-source="home_closing"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-base font-bold text-white shadow-[0_10px_24px_-10px_rgba(37,211,102,0.7)]">
          <MessageCircle className="h-5 w-5" /> Falar por WhatsApp
        </a>
        <a href={`tel:${PHONE_TEL}`} data-tracking-source="home_closing_phone" className="mt-4 inline-flex items-center gap-2 text-white/80">
          <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
        </a>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.1em] text-[#D4AF37]/85">Todo Portugal <span className="mx-1.5 text-white/30">|</span> Resposta em menos de 1 minuto</p>
      </div>
    </section>
  );
}
