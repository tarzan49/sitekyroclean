import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ResourceNav from '@/components/ResourceNav';
import ResourceHubHero from '@/components/ResourceHubHero';
import { getAllPosts } from '@/data/blogData';
import { RESOURCE_BLOG_TITLE, RESOURCE_BLOG_INTRO } from '@/data/resourceContent';
import { SITE_URL } from '@/constants/business';
import { BLOG_IMAGES, DEFAULT_BLOG_IMAGE } from '@/constants/blogImages';

const posts = getAllPosts();
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export default function Blog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const visible = posts.filter(p => (category === 'Todos' || p.category === category) && normalize(`${p.title} ${p.intro}`).includes(normalize(query)));
  useEffect(() => {
    document.title = `${RESOURCE_BLOG_TITLE} | Kyro Clean`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', RESOURCE_BLOG_INTRO);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${RESOURCE_BLOG_TITLE} | Kyro Clean`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', RESOURCE_BLOG_INTRO);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${SITE_URL}/blog`);
  }, []);
  const schema = { '@context': 'https://schema.org', '@type': 'Blog', name: RESOURCE_BLOG_TITLE, url: `${SITE_URL}/blog`, blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.publishDate, dateModified: p.updatedDate })) };
  return <><Header /><main className="bg-[#FDFDF9] min-h-screen">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}} />
    <ResourceHubHero title={RESOURCE_BLOG_TITLE} description={RESOURCE_BLOG_INTRO} />
    <ResourceNav afterHero />
    <section className="max-w-6xl mx-auto px-5 py-8 sm:py-12" aria-label="Todos os guias">
      <div className="grid sm:grid-cols-[minmax(0,1fr)_240px] gap-4 mb-6">
        <label className="block text-sm text-[#435449]">Procurar um assunto<div className="relative mt-2"><Search className="absolute left-3 top-3.5 w-5 h-5" /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ex.: manchas, colchão, alcatifa" className="min-h-12 w-full border border-[#b7c5b7] bg-white rounded-sm pl-10 pr-3 text-base" /></div></label>
        <label className="block text-sm text-[#435449]">Tema<select value={category} onChange={e=>setCategory(e.target.value)} className="mt-2 w-full min-h-12 px-3 border border-[#b7c5b7] rounded-sm bg-white text-base">{['Todos', ...new Set(posts.map(p=>p.category))].map(c=><option key={c}>{c}</option>)}</select></label>
      </div>
      <p role="status" className="text-sm text-[#505650] mb-5">{visible.length} de {posts.length} guias</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map(post=><Link key={post.slug} to={`/blog/${post.slug}`} className="group rounded-lg overflow-hidden border border-[#dfe5df] bg-white flex flex-col">
          <img src={BLOG_IMAGES[post.slug] ?? DEFAULT_BLOG_IMAGE} alt={post.heroAlt} width={640} height={360} loading="lazy" className="w-full aspect-video object-cover" />
          <div className="p-5 flex flex-col flex-1"><p className="text-sm text-[#505650] mb-2">{post.category} · {post.readingTime} min</p><h2 className="type-card-title text-[#111111] mb-3 group-hover:underline">{post.title}</h2><p className="text-base text-[#505650] leading-relaxed mb-4">{post.intro}</p><span className="text-base font-semibold text-[#111111] flex gap-2 items-center mt-auto">Ler guia<ArrowRight className="w-4 h-4" /></span></div>
        </Link>)}
      </div>
      {!visible.length && <div className="py-10"><p>Nenhum guia encontrado. Experimente outro assunto.</p><button onClick={()=>{setQuery('');setCategory('Todos');}} className="underline py-3 min-h-11">Ver todos os guias</button></div>}
    </section>
  </main><Footer /></>;
}
