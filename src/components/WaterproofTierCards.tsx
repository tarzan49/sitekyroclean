// Cartões "Essencial ou Premium?" (dono, 24 Nov: "está top assim"): a diferença num olhar e os preços do bot.
// Usado em /impermeabilizacao; pode entrar nas outras páginas de impermeabilização.
import SectionHeader from '@/components/SectionHeader';
import { waterproofTierCards } from '@/data/waterproofTiers';
import { cityPrep as cityPrepOf } from '@/data/serviceCatalog';

// "Essencial ou Premium?" num ecrã (dono, 24 Nov): dois cartões lado a lado que mostram a diferença num olhar
// (anos de proteção em grande, lavagens em pontos) e os preços do bot para o sofá e para as cadeiras.
export default function WaterproofTierCards({ city }: { city: string }) {
  const cards = waterproofTierCards(city).map(c => ({ ...c, tier: { name: c.name, chairPrice: c.chair } }));
  return (
    <section id="versoes" className="py-14 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionHeader heading="Essencial ou" goldWord="Premium?" />
        <div className="grid grid-cols-2 gap-2.5 md:gap-5">
          {cards.map(c => (
            <div key={c.tier.name} className={`relative flex flex-col rounded-2xl p-3 md:p-6 ${c.top ? 'border-2 border-[#D4AF37] bg-[#0c241a] text-white shadow-[0_16px_40px_-18px_rgba(212,175,55,0.7)]' : 'border border-[#E5E0D3] bg-[#FDFDF9] text-[#1A1A1A]'}`}>
              {c.top && <span className="absolute -top-2.5 left-3 rounded-full bg-[#D4AF37] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0c241a]">Mais escolhido</span>}
              <p className="text-lg font-bold leading-tight md:text-2xl">{c.tier.name}</p>
              <p className={`text-[11px] md:text-sm ${c.top ? 'text-white/60' : 'text-[#777]'}`}>{c.base}</p>
              <p className={`mt-3 font-playfair text-4xl font-bold leading-none md:text-6xl ${c.top ? 'text-[#D4AF37]' : 'text-[#1A1A1A]'}`}>{c.years}</p>
              <p className={`text-[11px] md:text-sm ${c.top ? 'text-white/70' : 'text-[#555]'}`}>{c.yearsLabel}</p>
              <div className="mt-3 flex gap-1" aria-label={`Aguenta até ${c.washes} lavagens`}>
                {[0, 1, 2, 3, 4].map(n => <span key={n} className={`h-2 flex-1 rounded-full ${n < c.washes ? 'bg-[#D4AF37]' : c.top ? 'bg-white/15' : 'bg-[#E5E0D3]'}`} />)}
              </div>
              <p className={`mt-1 text-[11px] md:text-sm ${c.top ? 'text-white/70' : 'text-[#555]'}`}>Até {c.washes} lavagens</p>
              <p className={`mt-3 text-[12px] leading-snug md:text-sm ${c.top ? 'text-white/85' : 'text-[#444]'}`}>{c.ideal}</p>
              <div className={`mt-auto pt-3 text-[12px] md:text-sm ${c.top ? 'border-white/15' : 'border-[#E5E0D3]'} border-t mt-3`}>
                <p className="flex items-baseline justify-between gap-1"><span className={c.top ? 'text-white/70' : 'text-[#666]'}>Sofá 3 lug.</span><span className="text-base font-bold md:text-lg">{c.sofa}</span></p>
                <p className="flex items-baseline justify-between gap-1"><span className={c.top ? 'text-white/70' : 'text-[#666]'}>Cadeira</span><span className="font-semibold">{c.tier.chairPrice}</span></p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#666]">Nas duas, os líquidos ficam à superfície e saem com um pano. Preços {cityPrepOf(city)} {city}, com a deslocação incluída. Só em tecido: na pele não fazemos impermeabilização.</p>
      </div>
    </section>
  );
}
