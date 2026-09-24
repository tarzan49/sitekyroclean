import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { packs, packCities, PACK_HOOK } from '@/data/packComboData';

interface Props {
  packSlugs: string[];
  city?: string;
  variant?: 'light' | 'dark';
}

export default function ServicePackBanner({ packSlugs, city, variant = 'light' }: Props) {
  const local = packCities.find(c => c.slug === city);
  const relevant = packs.filter(p => packSlugs.includes(p.slug));
  const light = variant === 'light';
  const options = relevant.map(pack => ({
    id: pack.id,
    title: pack.name,
    description: PACK_HOOK[pack.id] ?? `Personalize esta combinação${local ? ` em ${local.name}` : ''}`,
    to: local ? `/${pack.slug}-${local.slug}` : '/guia-de-packs',
  }));

  return (
    <section className={`py-14 md:py-20 ${light ? 'bg-[#FDFDF9] text-[#111111]' : 'bg-[#071a12] text-white'}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionHeader
          overline="O pack à sua medida"
          heading="Aproveite a"
          goldWord="mesma visita"
          light={light}
          subtitle="Escolha os artigos e os tratamentos que precisa. O primeiro fica ao preço de tabela e cada artigo acrescentado entra com preço de pack, com uma só deslocação."
        />
        <div className={`grid gap-3 ${options.length > 3 ? 'sm:grid-cols-2' : ''}`}>
          {options.map(option => (
            <Link
              className={`group flex items-center justify-between gap-4 p-4 sm:p-5 rounded-sm border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37] hover:border-[#D4AF37]/60 ${light ? 'bg-white border-black/15' : 'bg-white/[0.025] border-white/15 hover:bg-[#183528]'}`}
              to={option.to}
              key={option.id}
            >
              <span className="min-w-0">
                <span className="block font-playfair text-xl sm:text-2xl font-bold leading-tight">{option.title}</span>
                <span className={`block mt-2 text-base leading-relaxed ${light ? 'text-black/60' : 'text-white/80'}`}>
                  {option.description}
                </span>
              </span>
              <ArrowRight className="shrink-0 w-5 h-5 text-[#D4AF37]" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
