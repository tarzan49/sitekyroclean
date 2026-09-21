import { RESOURCE_GLOSSARY_TITLE, resourceGlossaryIntro } from '@/data/resourceContent';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ResourceHubHero from '@/components/ResourceHubHero';
import ResourceNav from '@/components/ResourceNav';
import ResourceLeadCard from '@/components/ResourceLeadCard';
import { SITE_URL } from '@/constants/business';
import { glossaryTerms } from '@/data/glossaryTerms';

const PAGE_URL = `${SITE_URL}/glossario-limpeza-estofos`;
const title = RESOURCE_GLOSSARY_TITLE;
const description = resourceGlossaryIntro(glossaryTerms.length);
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export default function GlossarioEstofos() {
  const [query, setQuery] = useState('');
  const visible = glossaryTerms.filter(t=>normalize(`${t.term} ${t.definition}`).includes(normalize(query)));
  useEffect(()=>{
    document.title = `${title} | Kyro Clean`;
    document.querySelector('meta[name="description"]')?.setAttribute('content',description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',`${title} | Kyro Clean`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content',description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',PAGE_URL);
    // Replace only the prerendered glossary node, retaining business metadata.
    document.querySelectorAll('script[data-ssr-schema]').forEach(el=>{try{if(JSON.parse(el.textContent || '{}')['@type']==='DefinedTermSet') el.remove();}catch{/* Unrelated metadata */}});
    const reveal = ()=>{setQuery(''); requestAnimationFrame(()=>document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView());};
    reveal(); window.addEventListener('hashchange',reveal); return ()=>window.removeEventListener('hashchange',reveal);
  },[]);
  const schema = {'@context':'https://schema.org','@type':'DefinedTermSet',name:title,description,url:PAGE_URL,hasDefinedTerm:glossaryTerms.map(t=>({'@type':'DefinedTerm',name:t.term,description:t.definition,url:`${PAGE_URL}#${t.id}`,inDefinedTermSet:PAGE_URL}))};
  return <><Header /><main className="bg-[#FDFDF9] min-h-screen">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}} />
    <ResourceHubHero title={title} description={description} />
    <ResourceNav afterHero />
    <div className="max-w-6xl mx-auto px-5 pt-8">
      <label className="block max-w-2xl text-sm text-[#505650]">Que termo procura?<div className="relative mt-2"><Search className="absolute left-3 top-3.5 w-5 h-5" /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ex.: extração, veludo, secagem" className="w-full min-h-12 border border-[#b7c5b7] rounded-sm bg-white pl-10 pr-3 text-base" /></div></label>
    </div>
    <div className="max-w-6xl mx-auto px-5 py-8 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
      <section aria-label="Termos do glossário" className="min-w-0"><p role="status" className="text-sm text-[#505650] mb-5">{visible.length} de {glossaryTerms.length} termos</p>
        <div className="divide-y divide-[#dfe5df]">{visible.map(term=><article key={term.id} id={term.id} className="py-6 first:pt-0 scroll-mt-24">
          <h2 className="type-card-title text-[#111111] mb-3"><a href={`#${term.id}`} className="hover:underline">{term.term}</a></h2>
          <p className="type-reading text-[#505650]">{term.definition}</p>
          {term.example && <p className="mt-3 text-base text-[#505650]">Exemplo ilustrativo: {term.example}</p>}
          {term.source && <p className="mt-3 text-sm text-[#505650]"><a href={term.source.url} target="_blank" rel="noopener noreferrer" className="underline">{term.source.label}</a></p>}
          {term.serviceLink && <Link to={term.serviceLink.to} className="inline-flex items-center gap-2 text-[#111111] font-semibold text-base py-3 mt-1 min-h-11">{term.serviceLink.label}<ArrowRight className="w-4 h-4 shrink-0" /></Link>}
        </article>)}</div>
        {!visible.length && <div className="py-8"><p>Não encontrámos esse termo. Experimente outra palavra.</p><button onClick={()=>setQuery('')} className="underline py-3 min-h-11">Ver os {glossaryTerms.length} termos</button></div>}
      </section>
      <div className="lg:sticky lg:top-20"><ResourceLeadCard compact /></div>
    </div>
  </main><Footer /></>;
}
