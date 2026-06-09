import { Link } from "react-router-dom";
import { getAllPosts } from "@/data/blogData";
import { ArrowRight, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const HomepageBlogSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const posts = getAllPosts().slice(0, 3);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const [featured, ...rest] = posts;

  return (
    <section ref={sectionRef} className="py-20 md:py-24 bg-[#FDFDF9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header row */}
        <div className={`flex items-end justify-between mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
                DICAS & CONSELHOS
              </p>
            </div>
            <h2 className="font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] text-[#1A1A2E]">
              Últimos{" "}
              <em className="not-italic" style={{ color: '#D4AF37' }}>artigos</em>
            </h2>
          </div>
          <Link
            to="/blog"
            className="hidden md:flex items-center gap-1.5 text-[12px] font-medium text-[#1A1A2E]/40 hover:text-[#D4AF37] transition-colors duration-200 pb-0.5 border-b border-transparent hover:border-[#D4AF37]/30 flex-shrink-0"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Asymmetric grid */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '100ms' }}
        >
          {/* Featured article */}
          <Link
            to={`/blog/${featured.slug}`}
            className="group relative bg-white rounded-2xl overflow-hidden border border-[#1A1A2E]/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.11)] transition-shadow duration-300 flex flex-col p-7 md:p-9"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-[9px] font-bold tracking-[0.24em] uppercase" style={{ color: '#D4AF37', opacity: 0.90 }}>
                {featured.category}
              </span>
              <span className="font-mono text-[10px] font-bold" style={{ color: 'rgba(26,26,46,0.14)' }}>
                01
              </span>
            </div>

            <div className="h-px mb-6" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.38), transparent)' }} />

            <h3 className="font-playfair font-bold text-[#1A1A2E] text-[1.25rem] md:text-[1.45rem] leading-[1.2] mb-4 flex-1">
              {featured.title}
            </h3>

            <p className="text-[13.5px] text-[#1A1A2E]/55 leading-relaxed line-clamp-3 mb-6">
              {featured.intro}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <span className="flex items-center gap-1.5 text-[11px] text-[#1A1A2E]/35">
                <Clock className="w-3 h-3" />
                {featured.readingTime} min de leitura
              </span>
              <span
                className="flex items-center gap-1 text-[12px] font-semibold group-hover:gap-2 transition-all duration-200"
                style={{ color: '#D4AF37' }}
              >
                Ler artigo <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(90deg, transparent, #D4AF37 40%, #D4AF37 60%, transparent)' }}
            />
          </Link>

          {/* Smaller articles */}
          <div className="flex flex-col gap-4">
            {rest.map((post, i) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group relative bg-white rounded-2xl overflow-hidden border border-[#1A1A2E]/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] transition-shadow duration-300 flex flex-col flex-1 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-bold tracking-[0.24em] uppercase" style={{ color: '#D4AF37', opacity: 0.90 }}>
                    {post.category}
                  </span>
                  <span className="font-mono text-[10px] font-bold" style={{ color: 'rgba(26,26,46,0.14)' }}>
                    0{i + 2}
                  </span>
                </div>

                <div className="h-px mb-4" style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.30), transparent)' }} />

                <h3 className="font-playfair font-bold text-[#1A1A2E] text-[1rem] md:text-[1.05rem] leading-snug mb-3 flex-1">
                  {post.title}
                </h3>

                <div className="flex items-center justify-between mt-auto pt-1">
                  <span className="flex items-center gap-1.5 text-[11px] text-[#1A1A2E]/35">
                    <Clock className="w-3 h-3" />
                    {post.readingTime} min
                  </span>
                  <span
                    className="flex items-center gap-1 text-[11px] font-semibold group-hover:gap-2 transition-all duration-200"
                    style={{ color: '#D4AF37' }}
                  >
                    Ler <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, transparent, #D4AF37 40%, #D4AF37 60%, transparent)' }}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile "Ver todos" */}
        <div
          className={`mt-7 md:hidden text-center transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '250ms' }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1A1A2E]/45 hover:text-[#D4AF37] transition-colors"
          >
            Ver todos os artigos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default HomepageBlogSection;
