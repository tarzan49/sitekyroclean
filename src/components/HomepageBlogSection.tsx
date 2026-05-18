import { Link } from "react-router-dom";
import { getAllPosts } from "@/data/blogData";
import { ArrowRight, Clock } from "lucide-react";

const HomepageBlogSection = () => {
  const posts = getAllPosts().slice(0, 3);

  return (
    <section className="py-10 md:py-14 bg-[#FDFDF9]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-2" style={{ color: '#D4AF37' }}>
            Dicas & Conselhos
          </p>
          <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#1A1A2E]">
            Últimos Artigos
          </h2>
          <div className="w-12 h-px mx-auto mt-3" style={{ backgroundColor: '#D4AF37', opacity: 0.4 }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className="p-5 flex flex-col flex-1">
                <span className="text-[11px] font-semibold tracking-widest uppercase text-[#D4AF37] mb-2">
                  {post.category}
                </span>
                <h3 className="font-semibold text-[#1A1A2E] text-[15px] leading-snug mb-3 group-hover:text-[#0d3c47] transition-colors flex-1">
                  {post.title}
                </h3>
                <p className="text-[13px] text-[#1A1A2E]/60 leading-relaxed line-clamp-2 mb-4">
                  {post.intro}
                </p>
                <div className="flex items-center justify-between text-[12px] text-[#1A1A2E]/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readingTime} min
                  </span>
                  <span className="flex items-center gap-1 text-[#0d3c47] font-medium group-hover:gap-2 transition-all">
                    Ler artigo <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-7">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d3c47] hover:text-[#D4AF37] transition-colors"
          >
            Ver todos os artigos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomepageBlogSection;
