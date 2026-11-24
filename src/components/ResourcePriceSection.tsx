// Widget de preço no fim dos recursos de texto (perguntas, glossário, estudo, blog): o mesmo das páginas de sofás,
// com a localidade (dono, 24 Nov: "como o blog": texto corrido, topo novo e o preço no fim).
import { useState } from 'react';
import SofaPricePicker from '@/components/SofaPricePicker';
import RugPricePicker from '@/components/RugPricePicker';
import CarpetPricePicker from '@/components/CarpetPricePicker';
import ImperPricePicker from '@/components/ImperPricePicker';
import TreatmentPackPicker from '@/components/TreatmentPackPicker';
import WaterproofPackPicker from '@/components/WaterproofPackPicker';
import { cities } from '@/data/serviceCatalog';

// O widget do serviço do artigo (blog); sem serviço, o dos sofás.
function Picker({ service, ...p }: { service?: string; city: string; source: string; onCity: (city: string) => void }) {
  if (service === 'limpeza-tapetes') return <RugPricePicker {...p} />;
  if (service === 'limpeza-alcatifas') return <CarpetPricePicker {...p} />;
  if (service === 'impermeabilizacao') return <ImperPricePicker {...p} />;
  if (service === 'limpeza-colchoes') return <TreatmentPackPicker kind="mattress" {...p} />;
  if (service === 'limpeza-cadeiras') return <WaterproofPackPicker kind="chairs" {...p} />;
  return <SofaPricePicker {...p} />;
}

export default function ResourcePriceSection({ source, service }: { source: string; service?: string }) {
  const [city, setCity] = useState('');
  return <section id="precos" className="scroll-mt-20 border-t border-[#E5E0D3] bg-[#FDFDF9] py-3 md:py-16">
    <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-center justify-between gap-3 md:mb-6">
        <h2 className="type-section-title font-playfair text-[#111111]">O seu <em className="not-italic" style={{ color: '#D4AF37' }}>preço</em></h2>
        <select aria-label="Localidade" value={city} onChange={e => setCity(e.target.value)} className={`${city ? "" : "hidden "}h-9 max-w-[150px] rounded-lg border-2 border-[#D4AF37] bg-white px-2 text-sm font-semibold text-[#1A1A1A]`}>
          <option value="" disabled>Localidade</option>{cities.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div className="md:rounded-2xl md:border md:border-[#E5E0D3] md:bg-white md:p-6"><Picker service={service} city={city} onCity={setCity} source={source} /></div>
    </div>
  </section>;
}
