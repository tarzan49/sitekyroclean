import { NavLink } from 'react-router-dom';
export default function ResourceNav({ afterHero = false }: { afterHero?: boolean }) {
  return <nav aria-label="Recursos de limpeza" className={`${afterHero ? "" : "pt-14 md:pt-[60px]"} border-b border-[#dfe5df] bg-white`}>
    <div className="max-w-6xl mx-auto px-5 flex flex-wrap gap-x-6">
      {[['/blog', 'Guias'], ['/perguntas-frequentes-limpeza-estofos', 'Perguntas frequentes'], ['/glossario-limpeza-estofos', 'Glossário']].map(([to,label]) => <NavLink key={to} to={to} end className={({isActive}) => `py-4 min-h-11 text-sm border-b-2 ${isActive ? 'border-[#D4AF37] text-[#173e2b] font-semibold' : 'border-transparent text-[#505650]'}`}>{label}</NavLink>)}
    </div>
  </nav>;
}
