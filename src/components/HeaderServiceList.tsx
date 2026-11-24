// Serviços do menu (computador e telemóvel): fotografia real da equipa, nome e "desde" do motor. Vem à parte
// (lazy) para o menu não pesar na abertura das páginas (dono, 25 Nov: "a barra de cima podia ser bem melhor").
import { Link, useLocation } from 'react-router-dom';
import { CHAIR_PRICE_SHORT, formatEuro, MATTRESS_CLEANING_FROM, SOFA_CLEANING_FROM, SOFA_WATERPROOF_ESSENCIAL_FROM } from '@/data/enginePrices';
import { RUG_PRICE_FROM, CARPET_PRICE_FROM } from '@/constants/rugSitePrice';
import sofa from '@/assets/menu/sofa.webp';
import mattress from '@/assets/menu/colchao.webp';
import chairs from '@/assets/menu/cadeiras.webp';
import rug from '@/assets/menu/tapete.webp';
import carpet from '@/assets/menu/alcatifa.webp';
import waterproof from '@/assets/menu/imper.webp';

const from = (v: string) => `Desde ${v.replace(/^(desde|a partir de)\s*/i, '')}`;
const ITEMS = [
  { to: '/limpeza-sofas', label: 'Sofás', price: from(formatEuro(SOFA_CLEANING_FROM)), img: sofa },
  { to: '/limpeza-colchoes', label: 'Colchões', price: from(formatEuro(MATTRESS_CLEANING_FROM)), img: mattress },
  { to: '/limpeza-cadeiras', label: 'Cadeiras', price: from(CHAIR_PRICE_SHORT), img: chairs },
  { to: '/limpeza-tapetes', label: 'Tapetes', price: from(RUG_PRICE_FROM), img: rug },
  { to: '/limpeza-alcatifas', label: 'Alcatifas', price: from(CARPET_PRICE_FROM), img: carpet },
  { to: '/impermeabilizacao', label: 'Impermeabilização', price: from(formatEuro(SOFA_WATERPROOF_ESSENCIAL_FROM)), img: waterproof },
];

export default function HeaderServiceList({ dark = false, onNavigate }: { dark?: boolean; onNavigate: () => void }) {
  const { pathname } = useLocation();
  return (
    <ul className={`grid grid-cols-2 ${dark ? 'gap-2' : 'gap-1'}`}>
      {ITEMS.map(s => {
        const active = pathname === s.to;
        return (
          <li key={s.to}>
            {dark ? (
              <Link to={s.to} onClick={onNavigate} aria-current={active ? 'page' : undefined}
                className={`relative flex h-[74px] items-end overflow-hidden rounded-xl border active:opacity-90 ${active ? 'border-[#D4AF37]' : 'border-white/15'}`}>
                <img src={s.img} alt="" width={150} height={74} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#061a16] via-[#061a16]/65 to-[#061a16]/10" />
                <span className="relative min-w-0 px-2.5 pb-2">
                  <span className={`block whitespace-nowrap font-semibold leading-tight text-white ${s.label.length > 12 ? 'text-[13.5px]' : 'text-[15px]'}`}>{s.label}</span>
                  <span className="block whitespace-nowrap text-xs font-semibold text-[#E8C964]">{s.price}</span>
                </span>
              </Link>
            ) : (
              <Link to={s.to} onClick={onNavigate} aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl p-2 transition-colors ${active ? 'bg-[#D4AF37]/12' : 'hover:bg-[#F5F2E8]'}`}>
                <img src={s.img} alt="" width={56} height={56} decoding="async" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold leading-tight text-[#111111]">{s.label}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-[#D4AF37]">{s.price}</span>
                </span>
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
