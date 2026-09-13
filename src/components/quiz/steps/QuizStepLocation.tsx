import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Check, ChevronRight, Loader2 } from 'lucide-react';
import { locationPrices } from '@/components/quiz/QuizTypes';
import { cities } from '@/data/locationSeoData';
import { detectServiceCity, normalizeCity } from '@/lib/locationDetection';
import { Button } from '@/components/ui/button';

interface QuizStepLocationProps {
  location: string;
  locationQuery: string;
  setLocationQuery: (q: string) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onCitySelect: (city: string) => void;
}

const QuizStepLocation = ({ location, locationQuery, setLocationQuery, scrollContainerRef, onCitySelect }: QuizStepLocationProps) => {
  const [selected, setSelected] = useState(location);
  const [detected, setDetected] = useState('');
  const [editing, setEditing] = useState(!location);
  const [loading, setLoading] = useState(!location);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const request = useRef<AbortController>();
  const manuallyEdited = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location && attempt === 0) return;
    const controller = new AbortController();
    request.current = controller;
    let active = true;
    setLoading(true);
    setMessage('');
    const timeout = window.setTimeout(() => {
      controller.abort();
      if (active) { setLoading(false); setMessage('Pode pesquisar a sua cidade enquanto a localização não está disponível.'); }
    }, 16000);
    detectServiceCity(controller.signal).then(city => {
      if (!active || controller.signal.aborted || manuallyEdited.current) return;
      setDetected(city);
      setSelected(city);
      setEditing(false);
    }).catch(error => {
      if (active && !controller.signal.aborted) setMessage(error instanceof Error ? error.message : 'Escolha a sua cidade abaixo.');
    }).finally(() => { window.clearTimeout(timeout); if (active) setLoading(false); });
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [location, attempt]);

  const stopDetection = () => { manuallyEdited.current = true; request.current?.abort(); setLoading(false); setMessage(''); };
  const choose = (city: string) => { stopDetection(); setSelected(city); setEditing(false); setLocationQuery(''); };
  const area = cities.find(city => city.name === (detected || selected))?.area;
  const regional = area ? cities.filter(city => city.area === area && city.name !== selected && locationPrices[city.name] !== undefined).map(city => city.name).slice(0, 4) : [];
  const matches = locationQuery.trim() ? Object.keys(locationPrices).filter(city => normalizeCity(city).includes(normalizeCity(locationQuery))).slice(0, 6) : regional;

  return (
    <div className="w-full max-w-sm mx-auto text-left py-3 sm:py-1 pr-4 sm:pr-0">
      <p className="text-gold text-sm font-bold tracking-[0.25em] uppercase mb-3">O SEU ORÇAMENTO</p>
      <h2 className="type-quote-title font-playfair    text-white  mb-3">Vamos até si.</h2>
      <p className="text-base text-white/80 leading-relaxed mb-6">Confirme a localidade onde pretende o serviço. Nós tratamos do resto.</p>

      {loading && <div role="status" className="flex items-center gap-3 p-4 mb-4 border border-gold/20 rounded-xl text-base text-white/75"><Loader2 className="w-5 h-5 text-gold animate-spin shrink-0" /><span>A encontrar a sua localidade…<span className="block text-sm text-white/80 mt-1">Permita a localização no navegador ou pesquise abaixo.</span></span></div>}
      {message && <p role="status" className="text-base text-white/70 mb-4 leading-relaxed">{message}</p>}

      {selected && <div className="rounded-xl border border-gold/50 bg-gold/[0.07] p-4 mb-3">
        <div className="flex items-center gap-2 text-sm tracking-[0.13em] uppercase text-gold mb-3"><Navigation className="w-3.5 h-3.5" />{selected === detected ? 'Localidade detetada' : 'Localidade do serviço'}</div>
        <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-gold shrink-0" /><span className="text-xl text-white font-semibold flex-1">{selected}</span><Check className="w-5 h-5 text-gold shrink-0" /></div>
        <button type="button" onClick={() => { stopDetection(); setEditing(!editing); setLocationQuery(''); }} className="text-base text-white/70 underline underline-offset-4 min-h-11 mt-1">{editing ? 'Manter esta localidade' : 'Alterar localidade'}</button>
      </div>}

      {editing && <div className="mb-4 space-y-2">
        <label htmlFor="quiz-location-search" className="block text-base text-white/80 mb-2">{selected ? 'Onde pretende o serviço?' : 'Localidade do serviço'}</label>
        <input ref={input} id="quiz-location-search" type="search" placeholder="Pesquisar localidade" value={locationQuery} onChange={event => { stopDetection(); setLocationQuery(event.target.value); }} onFocus={() => { if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0; }} autoComplete="off" className="w-full h-12 px-4 text-base bg-[#1a2a1a] border border-gold/25 focus:border-gold rounded-xl text-white placeholder:text-white/80" />
        {!locationQuery && regional.length > 0 && <p className="pt-2 text-sm text-white/80">Outras localidades na sua região</p>}
        {matches.length > 0 && <div className="border border-white/10 rounded-xl overflow-hidden bg-[#1a2a1a]">{matches.map(city => <button type="button" key={city} onClick={() => choose(city)} className="w-full min-h-12 flex justify-between items-center gap-3 px-4 py-3 text-left text-base text-white border-b border-white/5 last:border-0 hover:bg-gold/10">{city}<ChevronRight className="w-4 h-4 text-white/80 shrink-0" /></button>)}</div>}
        {locationQuery && matches.length === 0 && <p className="text-base text-white/80 py-2">Localidade não encontrada. Tente o nome do concelho.</p>}
        {!loading && <button type="button" onClick={() => { manuallyEdited.current = false; setAttempt(value => value + 1); }} className="min-h-11 text-base text-gold flex items-center gap-2"><Navigation className="w-4 h-4" />Usar a minha localização</button>}
      </div>}

      {selected && <div className="pt-4 mt-4 border-t border-white/10" aria-live="polite"><div className="flex justify-between gap-3 text-base text-white/85"><span>Deslocação para {selected}</span><span className="font-semibold whitespace-nowrap">{locationPrices[selected]} €</span></div><p className="text-sm text-white/80 mt-2">Este valor será somado ao serviço no total.</p></div>}
      <Button type="button" disabled={!selected || editing} onClick={() => { if (selected) { request.current?.abort(); onCitySelect(selected); } }} className="w-full h-12 mt-6 bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] font-bold tracking-wider uppercase rounded-xl disabled:opacity-35">Continuar<ChevronRight className="w-4 h-4 ml-2" /></Button>
    </div>
  );
};
export default QuizStepLocation;
