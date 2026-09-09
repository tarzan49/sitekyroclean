import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { useState } from 'react';
import PriceWidget from './components/PriceWidget';
import './index.css';

export default function WidgetPreview() {
  const [service, setService] = useState('limpeza-sofas');
  return <main className="min-h-screen bg-[#f5f3ed] px-3 py-6 sm:py-10">
    <div className="mx-auto max-w-[390px]">
      <p className="text-center text-[#103629] text-xl font-semibold tracking-[0.18em] mb-5">KYRO CLEAN</p>
      <label className="block text-xs text-[#345445] mb-2" htmlFor="preview-service">Pré-visualização do widget</label>
      <select id="preview-service" value={service} onChange={e => setService(e.target.value)} className="w-full rounded-lg border border-[#b8c5ba] bg-white text-[#143626] px-3 py-3 mb-5">
        <option value="limpeza-sofas">Lisboa · Limpeza de sofás</option>
        <option value="limpeza-colchoes">Lisboa · Limpeza de colchões</option>
        <option value="limpeza-cadeiras">Lisboa · Limpeza de cadeiras</option>
        <option value="limpeza-tapetes">Lisboa · Limpeza de tapetes</option>
        <option value="impermeabilizacao">Lisboa · Impermeabilização</option>
      </select>
      <PriceWidget key={service} serviceSlug={service} initialLocation="Lisboa" />
    </div>
  </main>;
}
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<BrowserRouter><WidgetPreview /></BrowserRouter>);
