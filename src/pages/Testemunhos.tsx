import { useEffect, useState, useRef } from "react";
import { Star, Quote, Trophy, Users, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import GlobalPromoBanner from "@/components/GlobalPromoBanner";
import Footer from "@/components/Footer";

interface TestimonialItem {
  name: string;
  city: string;
  text: string;
  initial: string;
  rating?: number;
}

const TESTIMONIALS: TestimonialItem[] = [
  { name: "Maria S.", city: "Porto", text: "Parece novo outra vez. O meu sofá tinha 8 anos e achei que ia ter de comprar um novo. A Clean Solutions devolveu-lhe a vida!", initial: "M" },
  { name: "João P.", city: "Vila Nova de Gaia", text: "Cheiro fresco e sensação incrível. A equipa é profissional, rápida e super cuidadosa. Recomendo!", initial: "J" },
  { name: "Ana C.", city: "Matosinhos", text: "O sofá da minha avó voltou a brilhar. Serviço impecável, produtos que não fazem mal ao ambiente. Adorei!", initial: "A" },
  { name: "Pedro R.", city: "Maia", text: "Rapidez e qualidade ao mesmo nível. Em 3 horas o sofá estava limpo e seco. Impressionante!", initial: "P" },
  { name: "Luís L.", city: "Gondomar", text: "Excelente serviço e profissionais! Deixaram tudo impecável e fizeram o trabalho com cuidado e simpatia.", initial: "L" },
  { name: "Maria I.", city: "Valongo", text: "O meu sofá ficou muito limpinho, como novo. São muito cuidadosos, simpáticos e prestáveis. Agendar o serviço foi rápido e simples.", initial: "M" },
  { name: "Carlos M.", city: "Braga", text: "Serviço de excelência! A alcatifa do escritório ficou impecável. Profissionais muito competentes e pontuais.", initial: "C" },
  { name: "Sofia P.", city: "Guimarães", text: "Fantástico! O colchão estava com manchas difíceis e conseguiram remover tudo. Muito satisfeita com o resultado.", initial: "S" },
  { name: "Ricardo A.", city: "Póvoa de Varzim", text: "A impermeabilização do sofá foi perfeita. Agora sinto-me muito mais tranquilo com crianças em casa. Recomendo vivamente!", initial: "R" },
  { name: "Teresa F.", city: "Lisboa", text: "Adorei o serviço de limpeza das cadeiras da sala de jantar. Ficaram como novas e o atendimento foi excelente.", initial: "T" },
  { name: "Miguel S.", city: "Cascais", text: "Profissionais de confiança! Limparam os tapetes persas antigos com todo o cuidado. Resultado impecável!", initial: "M" },
  { name: "Beatriz C.", city: "Oeiras", text: "Serviço rápido e eficiente. O meu sofá de pele ficou perfeito. Voltarei a contratar com certeza!", initial: "B" },
  { name: "Fernando G.", city: "Rio Tinto", text: "Excelente trabalho no meu colchão. Tinha alergia constante e depois da limpeza melhorou imenso. Super recomendo!", initial: "F" },
  { name: "Helena M.", city: "Ermesinde", text: "As cadeiras do escritório ficaram impecáveis. Equipa pontual e muito profissional. Já agendei para o próximo semestre.", initial: "H" },
  { name: "Rui T.", city: "Espinho", text: "Tinham-me dito que a nódoa de vinho não saía. A Clean Solutions provou o contrário! Sofá como novo.", initial: "R" },
  { name: "Sandra V.", city: "Paredes", text: "Fiquei impressionada com a diferença. O tapete da sala recuperou cores que já nem me lembrava que tinha.", initial: "S" },
  { name: "António F.", city: "Vila do Conde", text: "Trabalho cinco estrelas! Limparam todo o recheio do AL e os hóspedes notaram logo a diferença. Obrigado!", initial: "A" },
  { name: "Catarina L.", city: "Viana do Castelo", text: "A alcatifa da escada estava muito suja e ficou impecável. Equipa super simpática e profissional.", initial: "C" },
  { name: "Bruno N.", city: "Vila Real", text: "Vieram de propósito ao Norte e valeu cada cêntimo. O sofá cheirava mal há meses e agora está perfeito.", initial: "B" },
  { name: "Daniela R.", city: "Famalicão", text: "Contratei para limpar os colchões das crianças. Ficaram super higiénicos e sem aquele cheiro a humidade. Adorei!", initial: "D" },
  { name: "Nuno C.", city: "Amadora", text: "Serviço impecável do início ao fim. O sofá de 3 lugares ficou pronto em menos de 2 horas. Muito profissionais.", initial: "N" },
  { name: "Inês A.", city: "Loures", text: "A minha mãe ficou encantada com o resultado. Limparam o sofá dela com muito cuidado e atenção ao detalhe.", initial: "I" },
  { name: "Tiago M.", city: "Sintra", text: "Tinham uma mancha no sofá há anos que já nem tentávamos tirar. A Clean Solutions resolveu em minutos!", initial: "T" },
  { name: "Patrícia D.", city: "Almada", text: "Excelente relação qualidade-preço. O colchão do quarto de hóspedes ficou completamente renovado.", initial: "P" },
];

const Testemunhos = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const testimonials = TESTIMONIALS;

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const stats = [
    {
      icon: Star,
      value: "5.0",
      label: "Avaliação média",
      delay: "0s"
    },
    {
      icon: Users,
      value: "+1000",
      label: "nos últimos 365 dias",
      delay: "0.1s"
    },
    {
      icon: CheckCircle,
      value: "100%",
      label: "Clientes satisfeitos*",
      footnote: "*com base em feedback recolhido",
      delay: "0.2s"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <GlobalPromoBanner />
      <main>
        {/* Hero Section - Aligned with Packs page */}
        <section className="pt-24 md:pt-28 pb-6 md:pb-8 bg-background">
          <div className="container mx-auto px-4 text-center">
            {/* Title with animation */}
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-[#111111] animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              O que dizem os nossos clientes
            </h1>
            
            {/* Subtitle */}
            <p 
              className="text-base md:text-lg text-[#111111]/55 max-w-xl mx-auto mb-4 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Histórias reais de clientes satisfeitos com os nossos serviços de limpeza.
            </p>
            
            {/* Golden line - thinner and elegant */}
            <div 
              className="w-16 h-0.5 bg-gold mx-auto animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            ></div>
          </div>
        </section>

        {/* Stats Bar */}
        <section ref={statsRef} className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`bg-[#FFFFFF] rounded-3xl p-6 shadow-md text-center transform transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: stat.delay }}
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <stat.icon className="h-8 w-8 text-gold fill-gold/20" />
                    <span className="text-4xl font-bold text-[#111111]">{stat.value}</span>
                  </div>
                  <p className="text-[#111111]/55 font-medium">{stat.label}</p>
                  {stat.footnote && (
                    <p className="text-xs text-[#111111]/40 mt-1">{stat.footnote}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => {
                const isExpanded = expandedCards.has(index);
                const shouldTruncate = testimonial.text.length > 180;
                
                return (
                  <div
                    key={index}
                    className="group bg-[#FFFFFF] rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Golden top line */}
                    <div className="h-1 bg-gradient-to-r from-gold/60 via-gold to-gold/60"></div>
                    
                    <div className="p-6">
                      {/* Header with avatar and stars */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy to-turquoise flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                          {testimonial.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Stars */}
                          <div className="flex gap-0.5 mb-2">
                            {[...Array(testimonial.rating || 5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Quote icon */}
                      <Quote className="h-6 w-6 text-gold/30 mb-2" />
                      
                      {/* Testimonial text */}
                      <p className="text-[#111111]/55 leading-relaxed mb-4">
                        {shouldTruncate && !isExpanded 
                          ? `${testimonial.text.substring(0, 180)}...` 
                          : testimonial.text
                        }
                      </p>
                      
                      {/* Read more button */}
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpand(index)}
                          className="text-turquoise hover:text-turquoise/80 text-sm font-medium mb-3 transition-colors"
                        >
                          {isExpanded ? "Ver menos" : "Ver mais"}
                        </button>
                      )}
                      
                      {/* Client name and city - BELOW text */}
                      <div className="pt-3 border-t border-gray-100">
                        <p className="font-semibold text-[#111111] text-sm">
                          {testimonial.name} <span className="text-[#111111]/55 font-normal">·</span> <span className="text-[#111111]/55 font-normal">{testimonial.city}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-navy via-navy/95 to-turquoise/20 relative overflow-hidden">
          {/* Subtle pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            {/* Trophy icon */}
            <div className="flex justify-center mb-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-gold" />
              </div>
            </div>
            
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Quer fazer parte das nossas histórias de sucesso?
            </h2>
            
            <p 
              className="text-lg text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Solicite já o seu orçamento gratuito e junte-se aos nossos clientes satisfeitos.
            </p>
            
            <div className="relative group w-full md:w-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
              <a
                href="/#orcamento"
                className={[
                  'relative inline-flex items-center justify-center gap-2 w-full md:w-auto',
                  'rounded-full font-bold text-[#12121e] touch-manipulation',
                  'px-8 md:px-10 py-4 md:py-5 text-lg',
                  'bg-gradient-to-r from-[#C9A84C] via-[#EDD96A] to-[#C9A84C]',
                  'shadow-[0_6px_22px_rgba(201,168,76,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                  'hover:shadow-[0_10px_32px_rgba(201,168,76,0.60),0_4px_10px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.36)]',
                  'hover:scale-[1.025] active:scale-[0.95]',
                  'active:shadow-[0_2px_8px_rgba(201,168,76,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
                  'transition-all duration-150 animate-cta-glow',
                ].join(' ')}
              >
                <span className="tracking-wide">Pedir Orçamento Grátis</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Testemunhos;
