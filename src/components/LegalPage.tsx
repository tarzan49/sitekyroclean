import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionHeader from '@/components/SectionHeader';
import { LEGAL_PAGES } from '@/data/legalPages';
import { CONSENT_BUTTON_LABEL, LEGAL_CONTENT, LEGAL_TOC_TITLE, legalSectionId } from '@/data/legalContent';

/** Última palavra à parte, para ir a dourado (formato único dos títulos do site). */
const splitLastWord = (title: string) => {
  const words = title.split(' ');
  const gold = words.pop() ?? '';
  return { lead: words.join(' '), gold };
};

const proseClass = [
  'space-y-4 text-base leading-[1.75] text-[#3d443e] [overflow-wrap:anywhere]',
  '[&_strong]:font-semibold [&_strong]:text-[#111111]',
  '[&_a]:text-[#173e2b] [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-[#D4AF37] hover:[&_a]:decoration-2',
  '[&_ul]:space-y-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:pl-1 [&_li]:marker:text-[#D4AF37]',
  '[&_address]:not-italic [&_address]:space-y-1 [&_address]:border-l-2 [&_address]:border-[#D4AF37] [&_address]:bg-white [&_address]:px-5 [&_address]:py-4',
].join(' ');

/**
 * Página legal: documento de texto corrido, sem ecrãs artificiais (dono, 25 Nov). O modelo novo está no
 * topo, nos títulos, nas cores e na navegação. O texto vem de `src/data/legalContent.ts`, a mesma fonte
 * do HTML estático.
 */
export default function LegalPage({ path }: { path: string }) {
  const page = LEGAL_PAGES.find(item => item.path === path)!;
  const sections = LEGAL_CONTENT[path];
  const title = splitLastWord(page.h1);
  const toc = sections.map(section => ({ id: legalSectionId(section.title), label: section.title }));

  return <><Header /><main className="min-h-screen bg-[#FDFDF9]">
    <section data-mobile-hero="text" className="bg-kyro-green pb-8 pt-24 text-white sm:pb-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-sm text-white/70"><Link to="/">Início</Link><span>/</span><span>{page.h1}</span></nav>
        <h1 className="font-playfair text-[28px] font-semibold leading-tight text-white md:text-5xl">{title.lead} <em className="not-italic text-[#D4AF37]">{title.gold}</em></h1>
        <p className="mt-3 text-sm text-white/80">Última atualização: {page.updated}</p>
      </div>
    </section>

    <nav aria-label="Documentos legais" className="border-b border-[#dfe5df] bg-white">
      <div className="mx-auto flex max-w-6xl gap-x-6 px-5 sm:px-6 lg:px-8">
        {LEGAL_PAGES.map(item => <NavLink key={item.path} to={item.path} end className={({ isActive }) => `min-h-11 whitespace-nowrap border-b-2 py-4 text-sm ${isActive ? 'border-[#D4AF37] font-semibold text-[#173e2b]' : 'border-transparent text-[#505650]'}`}>{item.label}</NavLink>)}
      </div>
    </nav>

    <div className="mx-auto grid max-w-6xl gap-x-14 px-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
      <aside className="min-w-0">
        <details className="group border-b border-[#dfe5df] lg:hidden">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-base font-semibold text-[#173e2b] [&::-webkit-details-marker]:hidden">{LEGAL_TOC_TITLE}<ChevronDown className="h-5 w-5 shrink-0 text-[#D4AF37] transition-transform group-open:rotate-180" /></summary>
          <ul className="pb-4">{toc.map(item => <li key={item.id}><a href={`#${item.id}`} className="block py-2.5 text-base text-[#505650]">{item.label}</a></li>)}</ul>
        </details>
        <nav aria-label={LEGAL_TOC_TITLE} className="sticky top-24 hidden max-h-[calc(100svh-7rem)] overflow-y-auto py-12 lg:block">
          <p className="mb-3 text-base font-semibold text-[#173e2b]">{LEGAL_TOC_TITLE}</p>
          <ul className="border-l border-[#dfe5df]">{toc.map(item => <li key={item.id}><a href={`#${item.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm leading-snug text-[#505650] transition-colors hover:border-[#D4AF37] hover:text-[#111111]">{item.label}</a></li>)}</ul>
        </nav>
      </aside>

      <div className="min-w-0 max-w-[46rem] pb-12 pt-8 lg:py-12">
        {sections.map(section => {
          const heading = splitLastWord(section.title);
          return <section key={section.title} id={legalSectionId(section.title)} className="scroll-mt-24 border-t border-[#dfe5df] py-8 first:border-t-0 first:pt-0">
            <SectionHeader heading={heading.lead} goldWord={heading.gold} className="!mb-4" />
            <div className={proseClass} dangerouslySetInnerHTML={{ __html: section.body.join('') }} />
            {section.consentButton && <button type="button" className="mt-5 min-h-12 rounded-lg border border-[#173e2b]/30 bg-white px-5 text-base font-semibold text-[#173e2b] transition-colors hover:border-[#D4AF37]" onClick={() => window.dispatchEvent(new Event('kyro:open-consent'))}>{CONSENT_BUTTON_LABEL}</button>}
          </section>;
        })}
        <nav aria-label="Outros documentos legais" className="border-t border-[#dfe5df]">
          {LEGAL_PAGES.filter(item => item.path !== path).map(item => <Link key={item.path} to={item.path} className="flex min-h-14 items-center justify-between gap-4 border-b border-[#dfe5df] text-base font-semibold text-[#173e2b]">{item.h1}<ArrowRight className="h-4 w-4 shrink-0 text-[#D4AF37]" /></Link>)}
        </nav>
      </div>
    </div>
  </main><Footer /></>;
}
