import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { packs, packCities } from '@/data/packComboData';

interface Props {
  packSlugs: string[];
  city?: string;
  variant?: 'light' | 'dark';
}

export default function ServicePackBanner({ packSlugs, city, variant = 'light' }: Props) {
  const local = packCities.find(c => c.slug === city);
  const relevant = packs.filter(p => packSlugs.includes(p.slug));
  const light = variant === 'light';

  return (
    <section className={`py-14 md:py-20 ${light ? 'bg-[#FDFDF9] text-[#111111]' : 'bg-[#071a12] text-white'}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionHeader
          overline="O pack à sua medida"
          heading="Aproveite a"
          goldWord="mesma visita"
          light={light}
          subtitle="Escolha os artigos e os tratamentos que precisa. Consulte a estimativa, as condições do desconto e a deslocação antes de pedir a confirmação."
        />
        <div className={`grid gap-3 ${relevant.length === 2 ? 'md:grid-cols-2' : relevant.length > 3 ? 'sm:grid-cols-2' : ''}`}>
          {relevant.map(pack => (
            <Link
              className={`group flex items-center justify-between gap-4 p-4 sm:p-5 rounded-sm border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37] hover:border-[#D4AF37]/60 ${light ? 'bg-white border-black/15' : 'bg-white/[0.025] border-white/15 hover:bg-[#183528]'}`}
              to={local ? `/${pack.slug}-${local.slug}` : '/packs'}
              key={pack.id}
            >
              <span className="min-w-0">
                <span className="block font-playfair text-xl sm:text-2xl font-bold leading-tight">{pack.name}</span>
                <span className={`block mt-2 text-sm leading-relaxed ${light ? 'text-black/60' : 'text-white/65'}`}>
                  Personalize esta combinação{local ? ` em ${local.name}` : ''}
                </span>
              </span>
              <ArrowRight className="shrink-0 w-5 h-5 text-[#D4AF37]" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <Link
          to="/packs"
          className="inline-flex items-center gap-3 min-h-11 mt-5 text-sm font-semibold text-[#D4AF37] hover:underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
        >
          Montar o meu pack de raiz <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
