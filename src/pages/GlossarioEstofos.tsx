import ResourcePriceSection from '@/components/ResourcePriceSection';
import { RESOURCE_GLOSSARY_TITLE, resourceGlossaryIntro } from '@/data/resourceContent';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Plus } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { useSnapSections } from '@/hooks/useSnapSections';
import heroVideo from '@/assets/tapete-processo/maquina.mp4';
import heroPoster from '@/assets/quiz-videos-capas/tapete.jpg';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ResourceHubHero from '@/components/ResourceHubHero';
import ResourceNav from '@/components/ResourceNav';
import { SITE_URL } from '@/constants/business';
import { glossaryTerms } from '@/data/glossaryTerms';

const PAGE_URL = `${SITE_URL}/glossario-limpeza-estofos`;
const title = RESOURCE_GLOSSARY_TITLE;
const description = resourceGlossaryIntro(glossaryTerms.length);
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
// Termos por letra: uma letra de cada vez cabe num ecrã (dono, 25 Nov); ao pesquisar aparecem todos os que correspondem.
const initial = (term: string) => normalize(term)[0].toUpperCase();
const LETTERS = [...new Set(glossaryTerms.map(t => initial(t.term)))].sort();
export default function GlossarioEstofos() {
  useSnapSections(true);
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState(LETTERS[0]);
  const searching = query.trim() !== '';
  const visible = searching ? glossaryTerms.filter(t=>normalize(`${t.term} ${t.definition}`).includes(normalize(query))) : glossaryTerms.filter(t => initial(t.term) === letter);
  useEffect(()=>{
    document.title = `${title} | Kyro Clean`;
    document.querySelector('meta[name="description"]')?.setAttribute('content',description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',`${title} | Kyro Clean`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content',description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',PAGE_URL);
    // Replace only the prerendered glossary node, retaining business metadata.
    document.querySelectorAll('script[data-ssr-schema]').forEach(el=>{try{if(JSON.parse(el.textContent || '{}')['@type']==='DefinedTermSet') el.remove();}catch{/* Unrelated metadata */}});
    const reveal = ()=>{setQuery(''); const hit = glossaryTerms.find(t => t.id === decodeURIComponent(window.location.hash.slice(1))); if (hit) setLetter(initial(hit.term)); requestAnimationFrame(()=>document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView());};
    reveal(); window.addEventListener('hashchange',reveal); return ()=>window.removeEventListener('hashchange',reveal);
  },[]);
  const schema = {'@context':'https://schema.org','@type':'DefinedTermSet',name:title,description,url:PAGE_URL,hasDefinedTerm:glossaryTerms.map(t=>({'@type':'DefinedTerm',name:t.term,description:t.definition,url:`${PAGE_URL}#${t.id}`,inDefinedTermSet:PAGE_URL}))};
  const search = <label className="relative block max-w-2xl text-[#111111]"><span className="sr-only">Que termo procura?</span><Search className="absolute left-3 top-3.5 h-5 w-5 text-[#505650]" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Ex.: extração, veludo, secagem" className="min-h-12 w-full rounded-xl border border-[#b7c5b7] bg-white pl-10 pr-3 text-base" /></label>;
  return <><Header /><main className="bg-[#FDFDF9] min-h-screen">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}} />
    <ResourceHubHero title={title} description={description} video={heroVideo} poster={heroPoster}>
      {search}
    </ResourceHubHero>
    <div className="hidden md:block"><ResourceNav afterHero /><div className="mx-auto max-w-6xl px-5 pt-8">{search}</div></div>
    <section id="termos" aria-label="Termos do glossário" className="scroll-mt-20 bg-[#FDFDF9] py-8">
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">
        <SectionHeader heading="Os termos" goldWord="explicados" light />
        {!searching && <div className="mb-3 grid grid-cols-7 gap-1.5 sm:flex sm:flex-wrap sm:gap-2" role="group" aria-label="Primeira letra">{LETTERS.map(l => <button key={l} type="button" aria-pressed={letter === l} onClick={() => setLetter(l)} className={`grid h-11 min-h-0 min-w-0 place-items-center rounded-lg border-2 text-base font-bold sm:w-11 ${letter === l ? 'border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#E8C964] text-[#0B2F2A]' : 'border-[#E5E0D3] bg-white text-[#1A1A1A]'}`}>{l}</button>)}</div>}
        <p role="status" className="mb-3 text-sm text-[#505650]">{visible.length} de {glossaryTerms.length} termos</p>
        <div className="grid items-start gap-2 md:grid-cols-2 md:gap-3">{visible.map(term => <details key={term.id} id={term.id} className="group/termo scroll-mt-24 rounded-xl border border-[#E5E0D3] bg-white">
          <summary className="flex min-h-[54px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-base font-semibold text-[#1A1A1A] [&::-webkit-details-marker]:hidden"><h2 className="text-base font-semibold">{term.term}</h2><Plus className="h-5 w-5 shrink-0 text-[#D4AF37] transition-transform group-open/termo:rotate-45" aria-hidden="true" /></summary>
          <div className="px-4 pb-4">
            <p className="text-[15px] leading-relaxed text-[#505650]">{term.definition}</p>
            {term.example && <p className="mt-3 text-[15px] text-[#505650]">Exemplo ilustrativo: {term.example}</p>}
            {term.source && <p className="mt-3 text-sm text-[#505650]"><a href={term.source.url} target="_blank" rel="noopener noreferrer" className="underline">{term.source.label}</a></p>}
            {term.serviceLink && <Link to={term.serviceLink.to} className="mt-1 inline-flex min-h-11 items-center gap-2 py-3 text-base font-semibold text-[#111111]">{term.serviceLink.label}<ArrowRight className="h-4 w-4 shrink-0" /></Link>}
          </div>
        </details>)}</div>
        {!visible.length && <div className="py-8"><p>Não encontrámos esse termo. Experimente outra palavra.</p><button onClick={() => setQuery('')} className="min-h-11 py-3 underline">Ver os {glossaryTerms.length} termos</button></div>}
      </div>
    </section>
    <ResourcePriceSection source="resource_price_glossario" />
  </main><Footer /></>;
}
