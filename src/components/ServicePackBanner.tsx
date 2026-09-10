import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { packs, packCities } from '@/data/packComboData';
interface Props { packSlugs: string[]; city?: string; variant?: 'light' | 'dark'; }
export default function ServicePackBanner({ packSlugs, city, variant = 'light' }: Props) {
  const local = packCities.find(c => c.slug === city);
  const relevant = packs.filter(p => packSlugs.includes(p.slug));
  return <section className={`py-14 px-5 ${variant === 'dark' ? 'bg-[#071a12] text-white' : 'bg-[#FDFDF9] text-[#111111]'}`}><div className="max-w-7xl mx-auto"><p className="text-[#AD9139] uppercase tracking-widest text-xs mb-3">O pack à sua medida</p><h2 className="font-playfair text-3xl mb-4">Aproveite a mesma visita</h2><p className="mb-7 max-w-2xl">Escolha os artigos e os tratamentos que precisa. Consulte a estimativa, as condições do desconto e a deslocação antes de pedir a confirmação.</p><div className="grid sm:grid-cols-2 gap-4">{relevant.map(pack => <Link className="border border-[#AD9139]/40 rounded-xl p-5 flex items-center justify-between gap-4" to={local ? `/${pack.slug}-${local.slug}` : '/packs'} key={pack.id}><span><strong className="block text-lg mb-2">{pack.name}</strong><span className="text-sm opacity-70">Personalize esta combinação{local ? ` em ${local.name}` : ''}</span></span><ArrowRight className="shrink-0 w-5 h-5" /></Link>)}</div><Link to="/packs" className="inline-block underline mt-6">Montar o meu pack de raiz</Link></div></section>;
}
