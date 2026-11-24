import ResourcePriceSection from '@/components/ResourcePriceSection';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ResourceNav from '@/components/ResourceNav';
import ResourceHubHero from '@/components/ResourceHubHero';
import SectionHeader from '@/components/SectionHeader';
import { getAllPosts, getPostBySlug, type BlogPost } from '@/data/blogData';
import { BLOG_THEMES } from '@/data/blogThemes';
import { RESOURCE_BLOG_TITLE, RESOURCE_BLOG_INTRO } from '@/data/resourceContent';
import { SITE_URL } from '@/constants/business';
import { BLOG_IMAGES, BLOG_IMAGE_ALTS, DEFAULT_BLOG_IMAGE } from '@/constants/blogImages';

const posts = getAllPosts();
const themes = BLOG_THEMES.map(theme => ({ ...theme, posts: theme.slugs.map(getPostBySlug).filter((post): post is BlogPost => Boolean(post)) }));
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Largura de cada cartão no computador: 6 em duas filas de três, 5 em duas + três, 4 numa fila. */
const span = (total: number, index: number) => total === 4 ? 'lg:col-span-3' : total === 5 && index < 2 ? 'lg:col-span-6' : 'lg:col-span-4';

function GuideCard({ post, dark }: { post: BlogPost; dark: boolean }) {
  return <Link to={`/blog/${post.slug}`} className={`group flex h-full flex-col overflow-hidden rounded-xl border ${dark ? 'border-white/15 bg-white/[0.06]' : 'border-[#dfe5df] bg-white'}`}>
    <div className="h-44 overflow-hidden lg:h-52"><img src={BLOG_IMAGES[post.slug] ?? DEFAULT_BLOG_IMAGE} alt={BLOG_IMAGE_ALTS[post.slug] ?? post.heroAlt} width={800} height={600} loading="lazy" decoding="async" className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" /></div>
    <div className="flex flex-1 flex-col p-4">
      <h3 className={`text-lg font-semibold leading-snug ${dark ? 'text-white' : 'text-[#111111]'}`}>{post.title}</h3>
      <p className={`mt-auto flex items-center justify-between gap-3 pt-3 text-sm ${dark ? 'text-white/75' : 'text-[#505650]'}`}>{post.readingTime} min de leitura<ArrowRight className="h-4 w-4 shrink-0 text-[#D4AF37]" /></p>
    </div>
  </Link>;
}

export default function Blog() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(BLOG_THEMES[0].id);
  const chips = useRef<HTMLUListElement>(null);
  const found = query.trim() ? posts.filter(post => normalize(`${post.title} ${post.intro} ${post.category}`).includes(normalize(query.trim()))) : null;
  const searching = found !== null;
  useEffect(() => {
    document.title = `${RESOURCE_BLOG_TITLE} | Kyro Clean`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', RESOURCE_BLOG_INTRO);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${RESOURCE_BLOG_TITLE} | Kyro Clean`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', RESOURCE_BLOG_INTRO);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${SITE_URL}/blog`);
  }, []);
  // O tema que está no ecrã fica marcado na barra, e a barra desliza até ele.
  useEffect(() => {
    if (searching || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id.replace('tema-', '')); }, { rootMargin: '-30% 0px -60% 0px' });
    themes.forEach(theme => { const element = document.getElementById(`tema-${theme.id}`); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, [searching]);
  useEffect(() => {
    const rail = chips.current;
    const chip = rail?.querySelector<HTMLElement>('[aria-current]');
    if (rail && chip) rail.scrollTo({ left: chip.offsetLeft - 20, behavior: 'smooth' });
  }, [active]);
  const schema = { '@context': 'https://schema.org', '@type': 'Blog', name: RESOURCE_BLOG_TITLE, url: `${SITE_URL}/blog`, blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.publishDate, dateModified: p.updatedDate })) };
  return <><Header /><main className="bg-[#FDFDF9] min-h-screen">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}} />
    <ResourceHubHero title={RESOURCE_BLOG_TITLE} description={RESOURCE_BLOG_INTRO} image={DEFAULT_BLOG_IMAGE} />
    <ResourceNav afterHero />

    <div className="border-b border-[#dfe5df] bg-white">
      <div className="mx-auto max-w-6xl px-5 pb-1 pt-4 sm:px-6 lg:px-8">
        <label className="relative block max-w-2xl"><span className="sr-only">Procurar um assunto</span><Search className="absolute left-3 top-3.5 h-5 w-5 text-[#505650]" /><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ex.: manchas, colchão, alcatifa" className="min-h-12 w-full rounded-lg border border-[#b7c5b7] bg-white pl-10 pr-3 text-base" /></label>
      </div>
    </div>

    {searching ? <section aria-label="Resultados" className="mx-auto min-h-[60svh] max-w-3xl px-5 py-8">
      <p role="status" className="mb-3 text-sm text-[#505650]">{found.length} de {posts.length} guias</p>
      <ul className="border-t border-[#dfe5df]">{found.map(post => <li key={post.slug}><Link to={`/blog/${post.slug}`} className="flex items-center gap-4 border-b border-[#dfe5df] py-3">
        <img src={BLOG_IMAGES[post.slug] ?? DEFAULT_BLOG_IMAGE} alt="" width={96} height={72} loading="lazy" className="h-[72px] w-24 shrink-0 rounded-lg object-cover" />
        <span className="min-w-0"><span className="block font-semibold leading-snug text-[#111111]">{post.title}</span><span className="text-sm text-[#505650]">{post.readingTime} min de leitura</span></span>
      </Link></li>)}</ul>
      {!found.length && <p className="py-6">Nenhum guia encontrado. Experimente outro assunto.</p>}
      <button type="button" onClick={()=>setQuery('')} className="min-h-11 py-3 underline">Ver todos os guias</button>
    </section> : <>
      <nav aria-label="Temas" className="sticky z-20 border-b border-[#dfe5df] bg-white" style={{ top: 'var(--header-h, 57px)' }}>
        <ul ref={chips} className="relative mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-2.5 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
          {themes.map(theme => <li key={theme.id} className="shrink-0"><a href={`#tema-${theme.id}`} aria-current={active === theme.id ? 'true' : undefined} className={`flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-sm ${active === theme.id ? 'border-[#173e2b] bg-[#173e2b] font-semibold text-white' : 'border-[#dfe5df] text-[#505650]'}`}>{theme.heading} {theme.goldWord}</a></li>)}
        </ul>
      </nav>
      {themes.map((theme, index) => {
        const dark = index % 2 === 1;
        return <section key={theme.id} id={`tema-${theme.id}`} className={`scroll-mt-[calc(var(--header-h,57px)+60px)] py-9 md:py-14 ${dark ? 'bg-kyro-green' : 'bg-[#FDFDF9]'}`}>
          <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
            <SectionHeader heading={theme.heading} goldWord={theme.goldWord} light={!dark} className="!mb-5 px-5 sm:px-0" />
            {/* Telemóvel: desliza para o lado, com o cartão seguinte à vista. Computador: grelha. */}
            <ul className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-12 [&::-webkit-scrollbar]:hidden">
              {theme.posts.map((post, i) => <li key={post.slug} className={`w-[74vw] max-w-[320px] shrink-0 snap-start sm:w-auto sm:max-w-none ${span(theme.posts.length, i)}`}><GuideCard post={post} dark={dark} /></li>)}
            </ul>
          </div>
        </section>;
      })}
    </>}
    <ResourcePriceSection source="resource_price_blog" />
  </main><Footer /></>;
}
