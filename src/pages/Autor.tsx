import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Mail, Phone, PenLine } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, PHONE_DISPLAY, PHONE_TEL, BUSINESS_EMAIL, BUSINESS_EMAIL_HREF } from "@/constants/business";
import { EDITORIAL_RULES } from "@/constants/editorialPolicy";
import { AUTHORS, DEFAULT_AUTHOR } from "@/data/authors";
import { getAllPosts } from "@/data/blogData";
import { buildProfilePageSchema } from "@/lib/seoSchema";

/**
 * Página de autor.
 *
 * Existe porque os artigos eram assinados por "uma equipa", que não responde
 * por nada. A política editorial está publicada aqui de propósito: cada ponto
 * corresponde a uma regra que o código impõe, por isso é verificável por quem
 * a lê em vez de ser uma declaração de intenções.
 */
const Autor = () => {
  const location = useLocation();
  const slug = location.pathname.replace("/autor/", "");
  const author = AUTHORS[slug] ?? DEFAULT_AUTHOR;
  const pageUrl = `${SITE_URL}/autor/${author.slug}`;
  const posts = getAllPosts().filter(post => post.author === author.name);

  useEffect(() => {
    document.title = `${author.name} | Kyro Clean Solutions`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", author.summary);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", pageUrl);
  }, [author, pageUrl]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProfilePageSchema(author)) }} />

      <div className="min-h-screen bg-[#f4f5f7]">
        <Header />

        <div data-mobile-hero="text" className="pt-24 pb-10 bg-checker-dark">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-1.5 text-sm text-white/80 mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-gold transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/blog" className="hover:text-gold transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/80">{author.name}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <PenLine className="w-4 h-4 text-gold" />
              </div>
              <p className="text-gold text-sm font-bold tracking-[0.08em] uppercase">Autor</p>
            </div>

            <h1 className="type-page-title font-playfair text-white mb-3">{author.name}</h1>
            <p className="text-gold text-base mb-4">{author.jobTitle}</p>
            <p className="text-white/80 text-base leading-relaxed max-w-2xl">{author.summary}</p>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <section className="mb-12">
            {author.bio.map((paragraph, i) => (
              <p key={i} className="text-neutral-700 leading-relaxed mb-4">{paragraph}</p>
            ))}
          </section>

          <section className="mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl mb-2">Como escrevemos o que está aqui</h2>
            <p className="text-neutral-700 leading-relaxed mb-5">
              Estas regras não são uma declaração de intenções: cada uma corresponde a uma
              verificação que corre automaticamente sempre que o site é construído.
            </p>
            <dl className="grid gap-3">
              {EDITORIAL_RULES.map(rule => (
                <div key={rule.title} className="bg-white border border-neutral-200 rounded-xl p-4">
                  <dt className="font-semibold mb-1">{rule.title}</dt>
                  <dd className="text-sm text-neutral-600 leading-relaxed">{rule.detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl mb-4">Artigos assinados ({posts.length})</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {posts.map(post => (
                <li key={post.slug}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="block bg-white border border-neutral-200 rounded-xl p-4 hover:border-gold transition-colors"
                  >
                    <span className="font-semibold text-sm">{post.title}</span>
                    <span className="block text-xs text-neutral-500 mt-1">{post.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-2xl sm:text-3xl mb-4">Contacto</h2>
            <div className="flex flex-wrap gap-4">
              <a href={PHONE_TEL} className="inline-flex items-center gap-2 text-neutral-700 hover:text-gold transition-colors">
                <Phone className="w-4 h-4" />{PHONE_DISPLAY}
              </a>
              <a href={BUSINESS_EMAIL_HREF} className="inline-flex items-center gap-2 text-neutral-700 hover:text-gold transition-colors">
                <Mail className="w-4 h-4" />{BUSINESS_EMAIL}
              </a>
            </div>
            <p className="text-sm text-neutral-600 mt-4">
              Encontrou um erro ou um número desatualizado num artigo?{" "}
              <a href={BUSINESS_EMAIL_HREF} className="underline underline-offset-4 hover:text-gold">Diga-nos</a>{" "}
              e corrigimos. <Link to="/sobre" className="underline underline-offset-4 hover:text-gold">Sobre a empresa</Link>.
            </p>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Autor;
