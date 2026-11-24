import ResourcePriceSection from '@/components/ResourcePriceSection';
import ServiceFAQ from "@/components/ServiceFAQ";
import ResourceLeadCard from "@/components/ResourceLeadCard";
import ResourceNav from "@/components/ResourceNav";
import ArticleHero from '@/components/ArticleHero';
import ArticleProof from '@/components/ArticleProof';
import ReadingToc, { ReadingProgress } from '@/components/ReadingGuide';
import { commercialHeroPaidPriceLine } from '@/data/commercialHeroCopy';
import ServiceReviewsGrid from '@/components/ServiceReviewsGrid';
import ServicePackBanner from '@/components/ServicePackBanner';
import SectionHeader from '@/components/SectionHeader';
import { QuizServiceProvider } from '@/context/QuizLocationContext';
import { getResourceWhatsapp, resourceQuizService, resourceHeroSubtitle } from '@/data/resourceContent';
import { Fragment, useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowRight, Lightbulb } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { getPostBySlug, getRelatedPosts } from "@/data/blogData";
import { SITE_URL } from "@/constants/business";
import { renderBlogBody } from "@/lib/blogMarkdown";
import { getBlogSources } from "@/data/blogSources";
import { DEFAULT_AUTHOR } from "@/data/authors";
import { clearPrerenderedFaqSchema } from "@/lib/seoSchema";

import { BLOG_IMAGES, BLOG_IMAGE_ALTS, DEFAULT_BLOG_IMAGE } from "@/constants/blogImages";

const BlogPost = () => {
  const location = useLocation();
  const slug = location.pathname.replace("/blog/", "");
  const post = useMemo(() => getPostBySlug(slug), [slug]);

  useEffect(() => {
    clearPrerenderedFaqSchema();
    if (!post) return;
    document.title = post.metaTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", post.metaDescription);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", post.metaTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", post.metaDescription);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", `${SITE_URL}/blog/${post.slug}`);
  }, [post]);

  const toc = useMemo(() => post?.sections.map((section, i) => ({ id: `passo-${i + 1}`, label: section.heading })) ?? [], [post]);

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="type-page-title   text-[#111111] mb-4">Artigo não encontrado</h1>
            <Link to="/blog" className="text-[#1A4E30] hover:underline">← Ver todos os artigos</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const related = getRelatedPosts(post.relatedPosts);
  const serviceSlug = post.relatedService.href.slice(1);
  const heroImg = BLOG_IMAGES[post.slug] ?? DEFAULT_BLOG_IMAGE;
  const sources = getBlogSources(post.sources);


  const pageUrl = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": post.title,
        "description": post.metaDescription,
        "inLanguage": "pt-PT",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "publisher": { "@id": `${SITE_URL}/#business` },
        "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${SITE_URL}/blog` },
          { "@type": "ListItem", "position": 3, "name": post.title, "item": pageUrl },
        ],
      },
      {
        "@type": "BlogPosting",
        "@id": `${pageUrl}#blogpost`,
        "headline": post.title,
        "description": post.metaDescription,
        "datePublished": post.publishDate,
        "dateModified": post.updatedDate,
        "inLanguage": "pt-PT",
        "author": { "@id": `${SITE_URL}/#business` },
        "publisher": { "@id": `${SITE_URL}/#business` },
        "mainEntityOfPage": { "@id": `${pageUrl}#webpage` },
        ...(heroImg && { "image": heroImg }),
        ...(sources.length > 0 && { "citation": sources.map(source => ({ "@type": "CreativeWork", "name": source.label, "publisher": { "@type": "Organization", "name": source.publisher }, "url": source.url })) }),
      },
      {
        "@type": "FAQPage",
        "mainEntity": post.faq.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      },
    ],
  };

  return (
    <QuizServiceProvider value={resourceQuizService[serviceSlug]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Header />

      <main className="min-h-screen bg-[#FDFDF9]">
        <ReadingProgress targetId="guia" />

        <ArticleHero title={post.title} subtitle={resourceHeroSubtitle(post)} category={post.category}
          byline={<>Revisto a {new Date(post.updatedDate).toLocaleDateString('pt-PT')} · {post.readingTime} min de leitura · <Link to={DEFAULT_AUTHOR.href} className="underline">{post.author}</Link></>}
          image={heroImg} imageAlt={BLOG_IMAGE_ALTS[post.slug] ?? post.heroAlt}
          priceLine={commercialHeroPaidPriceLine(serviceSlug)} whatsappHref={getResourceWhatsapp(post)} source={`blog-${post.slug}`} />

        {/* ── Conteúdo: o texto vem logo a seguir ao topo, com o índice ao lado ── */}
        <div className="mx-auto grid max-w-6xl gap-x-14 px-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
          <aside className="min-w-0"><ReadingToc title="Neste guia" items={toc} /></aside>
          <article id="guia" className="min-w-0 max-w-[46rem] scroll-mt-20 py-8 lg:py-12">
            <SectionHeader heading="O que precisa de" goldWord="saber" className="!mb-4" />
            {/* A introdução é texto do artigo, não subtítulo: está no HTML estático e tem de se ler na página. */}
            <p className="text-xl leading-[1.6] text-[#26352c]">{post.intro}</p>
            {post.sections.map((section, i) => {
              const words = section.heading.split(' ');
              return <Fragment key={section.heading}>
                <section id={`passo-${i+1}`} className="scroll-mt-24 pt-10">
                  <SectionHeader heading={words.slice(0, -1).join(' ')} goldWord={words.slice(-1)[0]} className="!mb-4" />
                  <div
                    className="blog-body type-reading text-[#3d443e] space-y-4"
                    dangerouslySetInnerHTML={{ __html: renderBlogBody(section.body) }}
                  />
                  {section.tip && (
                    <p className="mt-6 rounded-xl bg-[#f6f3e9] px-5 py-4 text-base leading-relaxed text-[#26352c]">
                      <span className="mb-1 flex items-center gap-2 font-semibold text-[#111111]"><Lightbulb className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.75} />Dica:</span>{" "}
                      {section.tip}
                    </p>
                  )}
                </section>
                {i === 1 && <ArticleProof serviceSlug={serviceSlug} seed={post.slug} />}
              </Fragment>;
            })}

            {sources.length > 0 && (
              <section className="mt-12 border-t border-[#dfe5df] pt-8">
                <h2 className="type-section-title font-playfair mb-3 text-[#111111]"><em className="not-italic" style={{ color: '#D4AF37' }}>Fontes</em></h2>
                <p className="text-sm text-[#505650] mb-4">
                  Referências para os cuidados descritos neste guia.
                </p>
                <ol className="space-y-2 text-sm text-[#505650] list-decimal pl-5">
                  {sources.map(source => (
                    <li key={source.id}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="underline underline-offset-2 hover:text-gold transition-colors"
                      >
                        {source.label}
                      </a>
                      <span className="text-[#505650]/80">, {source.publisher}. Verificada a {source.checkedOn}.</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className="mt-12"><ResourceLeadCard post={post} /></section>

            {/* Link serviço relacionado */}
            <Link
              to={post.relatedService.href}
              className="group mt-4 flex min-h-14 items-center justify-between gap-4 rounded-xl border border-[#dfe5df] bg-white px-5 py-4"
            >
              <span className="font-semibold text-[#111111]">{post.relatedService.label}</span>
              <ArrowRight className="w-5 h-5 shrink-0 text-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          </article>
        </div>

        {post.faq.length > 0 && (
          <ServiceFAQ faqs={post.faq.map(item => ({ question: item.q, answer: item.a }))} includeSchema={false} variant="light" />
        )}

        <section className="py-12 md:py-16 bg-kyro-green" aria-label="Avaliações de clientes">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="Nas palavras dos nossos" goldWord="clientes" light={false} />
            <ServiceReviewsGrid serviceSlug={serviceSlug} seed={`blog-${post.slug}`} heading="" />
          </div>
        </section>

        {/* Blog no modelo novo (dono, 24 Nov): o texto corrido e, no fim do artigo, o preço do serviço do artigo. */}
        <ResourcePriceSection service={serviceSlug} source={`blog_price_${post.slug}`} />
        <ServicePackBanner packSlugs={[]} variant="dark" />

        {related.length > 0 && (
          <section className="border-t border-[#E8E4DE] bg-[#F5F4F0] py-10 md:py-14">
            <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
              <SectionHeader heading="Continue a" goldWord="ler" className="!mb-5 px-5 sm:px-0" />
              <ul className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                {related.map(p => <li key={p.slug} className="w-[74vw] max-w-[320px] shrink-0 snap-start sm:w-auto sm:max-w-none"><Link to={`/blog/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#dfe5df] bg-white">
                  <img src={BLOG_IMAGES[p.slug] ?? DEFAULT_BLOG_IMAGE} alt={BLOG_IMAGE_ALTS[p.slug] ?? p.heroAlt} width={800} height={600} loading="lazy" decoding="async" className="h-40 w-full object-cover" />
                  <span className="flex flex-1 items-start justify-between gap-3 p-4 text-lg font-semibold leading-snug text-[#111111]">{p.title}<ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#D4AF37]" /></span>
                </Link></li>)}
              </ul>
            </div>
          </section>
        )}

        <ResourceNav afterHero />
        <div className="py-6 text-center">
          <Link to="/blog" className="inline-flex min-h-11 items-center text-base font-medium text-[#173e2b] underline underline-offset-4">
            ← Ver todos os artigos do blog
          </Link>
        </div>
      </main>

      <Footer />
    </QuizServiceProvider>
  );
};

export default BlogPost;
