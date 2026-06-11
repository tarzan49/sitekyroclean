import { Link } from "react-router-dom";
import { Clock, ArrowRight, ChevronRight, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { getAllPosts } from "@/data/blogData";
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

const posts = getAllPosts();

const Blog = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/blog#webpage`,
        "url": `${SITE_URL}/blog`,
        "name": "Blog | Kyro Clean Solutions",
        "inLanguage": "pt-PT",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "publisher": { "@id": `${SITE_URL}/#business` },
        "breadcrumb": { "@id": `${SITE_URL}/blog#breadcrumb` },
      },
      {
        "@type": "Blog",
        "@id": `${SITE_URL}/blog#blog`,
        "name": "Blog Kyro Clean Solutions",
        "description": "Dicas, guias e informação sobre limpeza profissional de sofás, colchões, tapetes e estofos.",
        "url": `${SITE_URL}/blog`,
        "inLanguage": "pt-PT",
        "publisher": { "@id": `${SITE_URL}/#business` },
        "blogPost": posts.map(p => ({
          "@type": "BlogPosting",
          "headline": p.title,
          "url": `${SITE_URL}/blog/${p.slug}`,
          "datePublished": p.publishDate,
          "dateModified": p.updatedDate,
          "author": { "@id": `${SITE_URL}/#business` },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Início", "item": `${SITE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${SITE_URL}/blog` },
        ],
      },
    ],
  };

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Header />

      <main className="bg-[#FDFDF9] min-h-screen">

        {/* ── Hero ── */}
        <section className="bg-kyro-green text-white py-14 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-6">
              <Link to="/" className="hover:text-gold transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/60">Blog</span>
            </nav>
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-3" style={{ color: '#D4AF37' }}>
              Kyro Clean Solutions
            </p>
            <h1 className="font-playfair text-3xl md:text-5xl font-bold text-white mb-4">
              Blog Kyro Clean
            </h1>
            <p className="text-white/65 text-lg max-w-2xl">
              Guias práticos, dicas de manutenção e tudo o que precisa saber sobre limpeza profissional de estofos.
            </p>
          </div>
        </section>

        {/* ── Posts ── */}
        <section className="container mx-auto px-4 max-w-4xl py-12">

          {/* Artigo em destaque */}
          <Link
            to={`/blog/${featured.slug}`}
            className="block bg-white border border-[#E8E4DE] rounded-2xl shadow-sm hover:shadow-md hover:border-gold/25 transition-all group mb-8 overflow-hidden"
          >
            <div className="relative h-52 md:h-64 overflow-hidden">
              <img
                src={HERO_MAP[featured.slug] ?? imgSofaTecido}
                alt={featured.heroAlt}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <span className="absolute top-4 left-4 text-xs font-bold text-gold bg-black/50 backdrop-blur-sm border border-gold/30 px-3 py-1 rounded-full">
                {featured.category}
              </span>
            </div>
            <div className="p-6 md:p-8">
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111] mb-3 group-hover:text-gold transition-colors leading-tight">
                {featured.title}
              </h2>
              <p className="text-[#111111]/60 leading-relaxed mb-5 line-clamp-2">{featured.intro}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-[#111111]/40">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />{featured.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />{featured.readingTime} min
                  </span>
                  <span>{new Date(featured.publishDate).toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}</span>
                </div>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gold group-hover:gap-2.5 transition-all">
                  Ler artigo <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>

          {/* Grid de artigos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rest.map(post => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="bg-white border border-[#E8E4DE] rounded-2xl shadow-sm hover:shadow-md hover:border-gold/25 transition-all group overflow-hidden flex flex-col"
              >
                <div className="relative h-40 overflow-hidden flex-shrink-0">
                  <img
                    src={HERO_MAP[post.slug] ?? imgSofaTecido}
                    alt={post.heroAlt}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] font-bold text-gold bg-black/50 backdrop-blur-sm border border-gold/30 px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-playfair text-base font-bold text-[#111111] mb-2 group-hover:text-gold transition-colors leading-snug flex-1">
                    {post.title}
                  </h2>
                  <p className="text-[#111111]/55 text-sm leading-relaxed mb-4 line-clamp-2">{post.intro}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="flex items-center gap-1 text-xs text-[#111111]/40">
                      <Clock className="w-3.5 h-3.5" /> {post.readingTime} min
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-gold group-hover:gap-2 transition-all">
                      Ler <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-kyro-green py-14">
          <div className="container mx-auto px-4 text-center max-w-xl">
            <p className="text-gold text-sm font-bold uppercase tracking-widest mb-3">Pronto para começar?</p>
            <h2 className="font-playfair text-3xl text-white font-bold mb-4">Orçamento gratuito em 2 minutos</h2>
            <p className="text-white/60 mb-8">Deslocação incluída. Resultado garantido ou devolvemos o dinheiro.</p>
            <QuizButton />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Blog;
