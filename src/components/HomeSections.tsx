// Secções novas da página inicial (dono, 24 Nov: "o resto é para refazer tudo, está super default").
// Mesmas peças aprovadas nas páginas de serviço: widget de preço dos packs, história antes/depois/proteção
// com material real, perguntas compactas. Cada secção cabe num ecrã do telemóvel.
import { WhatsAppCta } from '@/components/Cta';
import { useState } from 'react';
import SectionHeader from './SectionHeader';
import StepPricePicker, { type StepKind } from './StepPricePicker';
import CompactFAQ from './CompactFAQ';
import { StoryPlayer, storyFor } from './WaterproofPackSections';
import { cities } from '@/data/serviceCatalog';
import { RESOURCE_FAQS } from '@/data/resourceContent';
import { ChevronRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import hoteisImg from '@/assets/comercial/setor-hoteis.webp';
import alojamentoImg from '@/assets/comercial/setor-alojamento-local.webp';
import restaurantesImg from '@/assets/comercial/setor-restaurantes.webp';
import fabricasImg from '@/assets/comercial/setor-fabricas-mobiliario.webp';
import escritoriosImg from '@/assets/comercial/setor-escritorios.webp';
import { WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY } from '@/constants/business';
import { buildGeneralWaMessage } from '@/lib/whatsappMessages';

const HOME_SECTORS = [
  { to: '/limpeza-comercial-hoteis', label: 'Hotéis', img: hoteisImg },
  { to: '/limpeza-comercial-alojamento-local', label: 'Alojamento local', img: alojamentoImg },
  { to: '/limpeza-comercial-restaurantes', label: 'Restaurantes e cafés', img: restaurantesImg },
  { to: '/limpeza-comercial-escritorios', label: 'Escritórios', img: escritoriosImg },
  { to: '/limpeza-comercial-fabricas-mobiliario', label: 'Fábricas de mobiliário', img: fabricasImg },
];

const ARTICLES: { id: StepKind; label: string }[] = [
  { id: 'sofa', label: 'Sofá' }, { id: 'chairs', label: 'Cadeiras' }, { id: 'mattress', label: 'Colchão' },
  { id: 'rug', label: 'Tapete' }, { id: 'carpet', label: 'Alcatifa' }, { id: 'imper', label: 'Impermeabilização' },
];

/** "O seu preço": o artigo e a localidade em cima; por baixo, os passos do orçamento (StepPricePicker). */
export function HomePriceSection() {
  const [kind, setKind] = useState<StepKind>('sofa');
  const [city, setCity] = useState('');
  return (
    <section id="preco" className="scroll-mt-20 bg-kyro-green py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <SectionHeader heading="O seu" goldWord="preço" light={false} className="!mb-3" />
        {/* Artigo e localidade numa só linha (para a secção caber num ecrã). */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <select value={kind} aria-label="Artigo" onChange={e => setKind(e.target.value as StepKind)}
            className="h-11 rounded-xl border-2 border-[#D4AF37] bg-white px-3 text-sm font-semibold text-[#1A1A1A]">
            {ARTICLES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select value={city} onChange={e => setCity(e.target.value)} aria-label="Localidade"
            className={`h-11 rounded-xl border-2 bg-white px-3 text-sm font-semibold text-[#1A1A1A] ${city ? 'border-[#E5E0D3]' : 'border-[#D4AF37]'}`}>
            <option value="" disabled>Localidade</option>
            {cities.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="rounded-2xl bg-white p-3 md:p-6">
          <StepPricePicker key={kind} kind={kind} city={city} onCity={setCity} source="home_picker" />
        </div>
      </div>
    </section>
  );
}

/** Comercial na página inicial (dono, 25 Nov: "abaixo de o seu preço"): os quatro setores e a ligação às páginas de empresas. */
export function HomeCommercialSection() {
  return (
    <section id="empresas" className="scroll-mt-20 bg-[#FDFDF9] py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
        <SectionHeader heading="Para a sua" goldWord="empresa" />
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5 md:gap-4">
          {HOME_SECTORS.map(s => (
            <Link key={s.to} to={s.to} className="group relative block h-[22svh] min-h-[130px] last:col-span-2 md:last:col-span-1 overflow-hidden rounded-2xl md:h-[54svh]">
              <img src={s.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(7,26,18,0) 35%, rgba(7,26,18,.9) 100%)' }} />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-3 text-[16px] font-semibold leading-tight text-white md:p-5 md:text-xl">{s.label}<ChevronRight className="h-5 w-5 shrink-0 text-[#D4AF37]" /></span>
            </Link>
          ))}
        </div>
      </div>
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
        <WhatsAppCta href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage())}`} source="home_closing" />
        <a href={`tel:${PHONE_TEL}`} data-tracking-source="home_closing_phone" className="mt-4 inline-flex items-center gap-2 text-white/80">
          <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
        </a>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.1em] text-[#D4AF37]/85">Todo Portugal <span className="mx-1.5 text-white/30">|</span> Resposta em menos de 1 minuto</p>
      </div>
    </section>
  );
}
