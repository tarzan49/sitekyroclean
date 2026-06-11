import { useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Clock, ArrowRight, ChevronRight, Calendar, User, Lightbulb } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/data/blogData";
import { SITE_URL } from "@/constants/business";

import imgSofaTecido    from "@/assets/hero-p-limpeza-sofa-tecido.webp";
import imgManchasVinho  from "@/assets/hero-p-manchas-vinho-sofa.webp";
import imgSofaDesgast   from "@/assets/hero-p-sofa-desgastado.webp";
import imgAcarosColchao from "@/assets/hero-p-acaros-colchao.webp";
import imgAcarosSofa    from "@/assets/hero-p-acaros-sofa.webp";
import imgColchaoStd    from "@/assets/hero-p-limpeza-colchao-std.webp";
import imgTapetes       from "@/assets/hero-p-limpeza-tapetes.webp";
import imgCadeiras      from "@/assets/hero-p-limpeza-cadeiras.webp";
import imgAlergias      from "@/assets/hero-p-alergias-sofa.webp";
import imgSofaResultado from "@/assets/galeria-sofa-resultado.webp";

const HERO_MAP: Record<string, string> = {
  "quanto-custa-limpar-sofa-profissional":      imgSofaTecido,
  "como-tirar-manchas-sofa-tecido":             imgManchasVinho,
  "impermeabilizacao-sofa-vale-pena":           imgSofaDesgast,
  "acaros-sofas-colchoes-riscos-saude":         imgAcarosColchao,
  "quanto-custa-limpar-colchao-profissional":   imgColchaoStd,
  "limpeza-tapetes-profissional-guia-completo": imgTapetes,
  "limpeza-cadeiras-estofadas-precos-guia":     imgCadeiras,
  "doencas-causadas-estofos-sujos":             imgAlergias,
  "como-preparar-casa-visita-tecnico":          imgSofaResultado,
  "como-limpar-sofa-veludo":                    imgSofaTecido,
  "como-tirar-cheiro-sofa":                     imgSofaDesgast,
  "limpeza-alcatifa-escritorio":                imgTapetes,
  "guia-acaros-em-casa":                        imgAcarosSofa,
  "limpeza-sofa-animais-domesticos":            imgAcarosSofa,
  "como-manter-sofa-limpo-entre-limpezas":      imgSofaTecido,
  "impermeabilizacao-tapete-guia":              imgTapetes,
  "higienizacao-vs-impermeabilizacao-sofa":     imgSofaDesgast,
  "com-que-frequencia-limpar-sofa":             imgSofaTecido,
  "sinais-sofa-precisa-limpeza-profissional":   imgManchasVinho,
  "como-limpar-sofa-microfibra":                imgSofaTecido,
  "limpeza-sofa-bebe-crianca":                  imgAlergias,
  "limpeza-colchao-bebe-crianca":               imgAcarosColchao,
  "o-que-e-extracao-a-vapor-estofos":           imgSofaResultado,
  "mitos-limpeza-estofos":                      imgSofaDesgast,
  "limpeza-sofa-couro":                         imgSofaDesgast,
  "como-tirar-manchas-urina-colchao":           imgAcarosColchao,
  "quanto-custa-limpar-alcatifa":               imgTapetes,
};

const BlogPost = () => {
  const location = useLocation();
  const slug = location.pathname.replace("/blog/", "");
  const post = useMemo(() => getPostBySlug(slug), [slug]);
  const allPosts = useMemo(() => getAllPosts(), []);

  useEffect(() => {
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
            <h1 className="text-2xl font-bold text-[#111111] mb-4">Artigo não encontrado</h1>
            <Link to="/blog" className="text-gold hover:underline">← Ver todos os artigos</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const related = getRelatedPosts(post.relatedPosts);
  const heroImg = HERO_MAP[post.slug] ?? imgSofaTecido;
  const formattedDate = new Date(post.publishDate).toLocaleDateString("pt-PT", {
    day: "numeric", month: "long", year: "numeric",
  });

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Header />

      <main className="min-h-screen bg-[#FDFDF9]">

        {/* ── Hero com imagem ── */}
        <section className="relative pt-24 pb-14 md:pb-20 overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src={heroImg}
              alt={post.heroAlt}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.45) 0%, rgba(7,26,18,0.72) 45%, rgba(7,26,18,0.96) 100%)" }}
          />

          <div className="relative z-10 container mx-auto px-4 max-w-3xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-6">
              <Link to="/" className="hover:text-gold transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/blog" className="hover:text-gold transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/60 truncate max-w-[200px]">{post.title}</span>
            </nav>

            <span className="inline-block text-xs font-bold text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="font-playfair text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6">{post.intro}</p>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/45">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {post.author}
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime} min de leitura
              </span>
            </div>
          </div>
        </section>

        {/* ── Conteúdo ── */}
        <article className="container mx-auto px-4 max-w-3xl py-12">
          <div className="space-y-10">
            {post.sections.map((section, i) => (
              <div key={i}>
                <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#111111] mb-4">
                  {section.heading}
                </h2>
                <div className="text-[#111111]/70 leading-relaxed space-y-3">
                  {section.body.split("\n\n").map((para, j) => (
                    <p key={j} dangerouslySetInnerHTML={{
                      __html: para
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br/>"),
                    }} />
                  ))}
                </div>
                {section.tip && (
                  <div className="mt-4 bg-gold/8 border-l-4 border-gold rounded-r-xl px-4 py-3">
                    <p className="text-sm text-[#111111]/80 leading-relaxed">
                      <span className="inline-flex items-center gap-1 font-bold text-[#111111]"><Lightbulb className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} /> Dica: </span>
                      {section.tip}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA no meio */}
          <div className="my-12 bg-kyro-green rounded-2xl p-8 text-center">
            <p className="text-gold text-sm font-bold uppercase tracking-widest mb-2">Kyro Clean Solutions</p>
            <h3 className="font-playfair text-2xl text-white font-bold mb-3">
              Precisa de ajuda profissional?
            </h3>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              Orçamento gratuito em 2 minutos. Deslocação ao domicílio incluída na área do Porto.
            </p>
            <QuizButton />
          </div>

          {/* FAQ */}
          {post.faq.length > 0 && (
            <div className="mt-12">
              <h2 className="font-playfair text-2xl font-bold text-[#111111] mb-6">Perguntas frequentes</h2>
              <div className="space-y-3">
                {post.faq.map((item, i) => (
                  <details key={i} className="group bg-white border border-[#E8E4DE] rounded-xl shadow-sm overflow-hidden">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-semibold text-[#111111] text-sm hover:bg-[#FDFDF9] transition-colors">
                      {item.q}
                      <ChevronRight className="w-4 h-4 text-[#111111]/40 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                    </summary>
                    <div className="px-5 pb-4 pt-1 text-sm text-[#111111]/60 leading-relaxed border-t border-[#E8E4DE]/60">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
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

        {/* ── Artigos relacionados ── */}
        {related.length > 0 && (
          <section className="bg-[#F5F4F0] border-t border-[#E8E4DE] py-12">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="font-playfair text-xl font-bold text-[#111111] mb-6">Artigos relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map(p => (
                  <Link
                    key={p.slug}
                    to={`/blog/${p.slug}`}
                    className="bg-white border border-[#E8E4DE] rounded-xl p-5 hover:border-gold/30 hover:shadow-md transition-all group"
                  >
                    <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full">{p.category}</span>
                    <h3 className="font-semibold text-[#111111] text-sm mt-2 mb-1 leading-snug group-hover:text-gold transition-colors">
                      {p.title}
                    </h3>
                    <span className="flex items-center gap-1 text-xs text-[#111111]/40">
                      <Clock className="w-3 h-3" /> {p.readingTime} min
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="py-8 text-center border-t border-[#E8E4DE]">
          <Link to="/blog" className="text-sm text-gold hover:underline font-medium">
            ← Ver todos os artigos do blog
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BlogPost;
