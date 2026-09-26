import { Link } from 'react-router-dom';
import { SERVICE_CONDITIONS, SERVICE_CONDITIONS_LINKS } from '../constants/commercialPolicy';

// A mesma lista que o HTML estático escreve em todas as páginas
// (scripts/prerender.ts e scripts/landing-page-html.ts). Qualquer condição
// nova entra em SERVICE_CONDITIONS, nunca aqui.
export default function BusinessConditions() {
  return (
    <details className="max-w-7xl mx-auto px-5 py-6 text-base text-white/75">
      <summary className="cursor-pointer font-semibold">Condições do serviço e garantia</summary>
      <div className="space-y-3 mt-4 max-w-3xl">
        {SERVICE_CONDITIONS.map(text => <p key={text}>{text}</p>)}
        <p className="flex flex-wrap gap-x-2 gap-y-1">
          {SERVICE_CONDITIONS_LINKS.map((link, index) => (
            <span key={link.href}>
              {index > 0 && <span aria-hidden="true">· </span>}
              <Link to={link.href} className="underline underline-offset-2 hover:text-white">{link.label}</Link>
            </span>
          ))}
        </p>
      </div>
    </details>
  );
}
