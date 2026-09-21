import ServiceFAQ from "@/components/ServiceFAQ";
import ResourceLeadCard from "@/components/ResourceLeadCard";
import ResourceNav from "@/components/ResourceNav";
import CommercialHero from '@/components/CommercialHero';
import ServicePriceSection from '@/components/ServicePriceSection';
import ServiceReviewsGrid from '@/components/ServiceReviewsGrid';
import ServicePackBanner from '@/components/ServicePackBanner';
import SectionHeader from '@/components/SectionHeader';
import { QuizServiceProvider } from '@/context/QuizLocationContext';
import { getResourceWhatsapp, resourceQuizService, resourceHeroSubtitle } from '@/data/resourceContent';
import { useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowRight, Lightbulb } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { getPostBySlug, getRelatedPosts } from "@/data/blogData";
import { SITE_URL } from "@/constants/business";
import { renderBlogBody } from "@/lib/blogMarkdown";
import { getBlogSources } from "@/data/blogSources";
import { DEFAULT_AUTHOR } from "@/data/authors";
import { clearPrerenderedFaqSchema, buildPersonNode } from "@/lib/seoSchema";

import { BLOG_IMAGES, DEFAULT_BLOG_IMAGE } from "@/constants/blogImages";

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
        "author": { "@id": `${SITE_URL}/autor/${DEFAULT_AUTHOR.slug}#person` },
        "publisher": { "@id": `${SITE_URL}/#business` },
        "mainEntityOfPage": { "@id": `${pageUrl}#webpage` },
        ...(heroImg && { "image": heroImg }),
        ...(sources.length > 0 && { "citation": sources.map(source => ({ "@type": "CreativeWork", "name": source.label, "publisher": { "@type": "Organization", "name": source.publisher }, "url": source.url })) }),
      },
      buildPersonNode(DEFAULT_AUTHOR),
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

        <CommercialHero title={post.title} subtitle={resourceHeroSubtitle(post)} serviceSlug={serviceSlug}
          breadcrumbs={[{label:'Início',to:'/'},{label:'Guias',to:'/blog'},{label:post.category}]}
          whatsappHref={getResourceWhatsapp(post)} source={`blog-${post.slug}`} />
        <ServicePriceSection serviceSlug={serviceSlug} />
        <section className="py-12 md:py-16 bg-kyro-green" aria-label="Avaliações de clientes">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações reais" heading="Nas palavras dos nossos" goldWord="clientes" light={false} subtitle="Transcrições de quem já recebeu a nossa equipa." />
            <ServiceReviewsGrid serviceSlug={serviceSlug} seed={`blog-${post.slug}`} heading="" />
          </div>
        </section>

        {/* ── Conteúdo ── */}
        <article id="guia" className="container mx-auto px-5 max-w-4xl py-12 sm:py-16 scroll-mt-20">
          <SectionHeader overline="Guia prático" heading="O que precisa de" goldWord="saber" subtitle={post.intro} />
          <p className="text-sm text-[#505650] mb-7">Revisto a {new Date(post.updatedDate).toLocaleDateString('pt-PT')} · {post.readingTime} min de leitura · <Link to={`/autor/${DEFAULT_AUTHOR.slug}`} className="underline">{post.author}</Link></p>
          <nav aria-label="Neste guia" className="mb-8 border-b border-[#dfe5df] pb-6">
            <h2 className="text-base font-semibold text-[#173e2b] mb-3">Neste guia</h2>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1">{post.sections.map((section,i)=><li key={section.heading}><a href={`#passo-${i+1}`} className="flex gap-3 py-2 min-h-11 text-base text-[#435449] underline underline-offset-4"><span className="text-[#49664d]">{i+1}.</span>{section.heading}</a></li>)}</ol>
          </nav>
          <div className="space-y-9">
            {post.sections.map((section, i) => (
              <section key={i} id={`passo-${i+1}`} className="scroll-mt-24">
                <h2 className="type-article-title font-playfair    text-[#111111] mb-4">
                  {section.heading}
                </h2>
                <div
                  className="blog-body type-reading text-[#505650] space-y-3"
                  dangerouslySetInnerHTML={{ __html: renderBlogBody(section.body) }}
                />
                {section.tip && (
                  <div className="mt-4 bg-gold/8 border-l-4 border-gold rounded-r-xl px-4 py-3">
                    <p className="text-base text-[#111111]/80 leading-relaxed">
                      <span className="inline-flex items-center gap-1 font-bold text-[#111111]"><Lightbulb className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} /> Dica:</span>{" "}
                      {section.tip}
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>

          {sources.length > 0 && (
            <section className="mt-12 border-t border-neutral-200 pt-6">
              <h2 className="font-playfair text-xl text-[#111111] mb-3">Fontes</h2>
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

          <div className="my-10"><ResourceLeadCard post={post} /></div>

          {/* FAQ */}
          {post.faq.length > 0 && (
            <ServiceFAQ faqs={post.faq.map(item => ({ question: item.q, answer: item.a }))} includeSchema={false} variant="light" />
          )}

          {/* Link serviço relacionado */}
          <div className="mt-10">
            <Link
              to={post.relatedService.href}
              className="flex items-center justify-between bg-gold/10 border border-gold/20 rounded-2xl px-6 py-4 hover:bg-gold/15 transition-colors group"
            >
              <span className="font-semibold text-[#111111]">{post.relatedService.label}</span>
              <ArrowRight className="w-5 h-5 text-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>

        <ServicePackBanner packSlugs={[]} variant="dark" />
        <ResourceNav afterHero />

        {/* Related reading follows the same collapsed navigation pattern. */}
        {related.length > 0 && (
          <section className="bg-[#F5F4F0] border-t border-[#E8E4DE] py-12">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="type-card-title mb-4">Continue a ler</h2><div className="grid gap-3">
                {related.map(p => <Link key={p.slug} to={`/blog/${p.slug}`} className="flex items-center justify-between gap-4 py-3 border-b border-[#dfe5df] text-[#173e2b]">{p.title}<ArrowRight className="w-4 h-4" /></Link>)}
              </div>
            </div>
          </section>
        )}

        <div className="py-8 text-center border-t border-[#E8E4DE]">
          <Link to="/blog" className="text-base text-[#1A4E30] hover:underline font-medium">
            ← Ver todos os artigos do blog
          </Link>
        </div>
      </main>

      <Footer />
    </QuizServiceProvider>
  );
};

export default BlogPost;
