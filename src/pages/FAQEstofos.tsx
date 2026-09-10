import ServiceFAQ from "@/components/ServiceFAQ";
import { SATISFACTION_PROMISE, COVERAGE_PROMISE, AVAILABILITY_PROMISE, DRYING_PROMISE } from '../constants/commercialPolicy';
﻿import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import { SITE_URL, WHATSAPP_BASE, PHONE_E164, PHONE_DISPLAY, REVIEW_COUNT } from "@/constants/business";

const PAGE_URL = `${SITE_URL}/perguntas-frequentes-limpeza-estofos`;

interface FAQ {
  id: string;
  question: string;
  answer: React.ReactNode;
  plainAnswer: string;
}

const allFaqs: FAQ[] = [
  {
    id: "quanto-custa-limpar-sofa-porto",
    question: "Quanto custa limpar um sofá no Porto?",
    answer: <>A <Link to="/limpeza-sofas" className="text-gold hover:underline font-medium">limpeza de sofá no Porto</Link> custa <strong>49€ para sofás de 1 lugar</strong>, 69€ para 2 lugares e 79€ para 3 lugares. Sofás com chaise longue têm um acréscimo de 10€. A deslocação custa a partir de 10€ e aumenta com a distância ao centro. Não há custos escondidos: o preço do orçamento é o preço final.</>,
    plainAnswer: "Limpeza de sofá: 49€ (1 lugar), 69€ (2 lugares), 79€ (3 lugares). Chaise longue: +10€. Deslocação a partir de 10€, consoante a distância. Sem custos escondidos.",
  },
  {
    id: "preco-sofa-3-lugares",
    question: "Qual o preço para limpar um sofá de 3 lugares?",
    answer: <>{'A limpeza de um sofá de 3 lugares custa 79€, mais deslocação. Inclui avaliação, pré-tratamento de manchas e extração da sujidade. Anti-ácaros e desbacterização são extras opcionais.'}</>,
    plainAnswer: 'A limpeza de um sofá de 3 lugares custa 79€, mais deslocação. Inclui avaliação, pré-tratamento de manchas e extração da sujidade. Anti-ácaros e desbacterização são extras opcionais.',
  },
  {
    id: "sofa-fica-molhado-tempo-seca",
    question: "O sofá fica molhado após a limpeza? Quanto tempo seca?",
    answer: <>{DRYING_PROMISE}</>,
    plainAnswer: DRYING_PROMISE,
  },
  {
    id: "manchas-vinho-sangue-gordura",
    question: "Conseguem tirar manchas de vinho, sangue e gordura?",
    answer: <>{'Tratamos manchas de vinho, sangue, café, gordura e urina. O resultado depende do tecido, da substância e do tempo decorrido. Envie uma fotografia para avaliarmos as possibilidades antes de marcar; não garantimos a remoção de todas as manchas.'}</>,
    plainAnswer: 'Tratamos manchas de vinho, sangue, café, gordura e urina. O resultado depende do tecido, da substância e do tempo decorrido. Envie uma fotografia para avaliarmos as possibilidades antes de marcar; não garantimos a remoção de todas as manchas.',
  },
  {
    id: "limpeza-em-casa-domicilio",
    question: "A limpeza é feita em casa ou tenho de levar o sofá?",
    answer: <>A <Link to="/limpeza-sofas" className="text-gold hover:underline font-medium">limpeza de sofás Kyro Clean</Link> é <strong>sempre realizada ao domicílio</strong>: não é necessário deslocar o sofá. Um técnico desloca-se com equipamento profissional completo incluído no preço. O serviço demora 45 a 90 minutos para sofás standard. Não é necessária qualquer preparação da sua parte: não precisa de tirar almofadas, coberturas ou mover móveis adjacentes. A água suja é totalmente aspirada pelo equipamento, o seu pavimento fica seco e protegido. A deslocação custa a partir de <strong>10€</strong> e aumenta com a distância ao centro: o valor exato aparece no calculador de orçamento antes de confirmar.</>,
    plainAnswer: "Limpeza sempre ao domicílio, sem deslocar o sofá. Técnico chega com equipamento completo. Serviço: 45 a 90 minutos. Deslocação a partir de 10€, consoante a distância, valor exato no calculador de orçamento.",
  },
  {
    id: "diferenca-higienizacao-limpeza",
    question: "Qual a diferença entre higienização e limpeza de sofá?",
    answer: <>{'A limpeza remove sujidade, resíduos e partículas. O tratamento anti-ácaros e a desbacterização são extras opcionais, orçamentados separadamente. A limpeza normal não promete eliminação de microrganismos.'}</>,
    plainAnswer: 'A limpeza remove sujidade, resíduos e partículas. O tratamento anti-ácaros e a desbacterização são extras opcionais, orçamentados separadamente. A limpeza normal não promete eliminação de microrganismos.',
  },
  {
    id: "frequencia-limpeza-sofa",
    question: "Com que frequência devo limpar o meu sofá?",
    answer: <>A recomendação profissional baseada em estudos de microbiologia doméstica: <strong>1 vez por ano</strong> em casas sem animais e sem crianças; <strong>2 vezes por ano</strong> com animais de estimação ou crianças até 6 anos; <strong>a cada 6 meses</strong> para pessoas com alergias, rinite ou asma (os ácaros atingem concentração problemática em 3 meses de uso normal). Sofás de uso comercial intensivo devem ser tratados a cada 3 meses. A <Link to="/impermeabilizacao" className="text-gold hover:underline font-medium">impermeabilização</Link> após cada limpeza alonga o intervalo seguro entre serviços ao criar uma barreira invisível que impede a penetração de líquidos e sujidade nas fibras, reduzindo a frequência necessária de limpeza profunda.</>,
    plainAnswer: "1 vez/ano: casas sem animais/crianças. 2 vezes/ano: com animais ou crianças. A cada 6 meses: alergias/asma. Cada 3 meses: uso comercial. A impermeabilização após limpeza alonga o intervalo entre serviços.",
  },
  {
    id: "sofa-couro-alcantara-veludo",
    question: "Limpam sofás de couro, alcântara e veludo?",
    answer: <>Sim, com produtos e técnicas específicos para cada material. <strong>Couro e pele genuína</strong>: limpeza com produto desengordurante neutro seguido de hidratante de couro, que preserva a flexibilidade e evita rachas. <strong>Alcântara</strong>: produto de pH neutro aplicado a seco com técnica de pressão controlada para não danificar a microfibra. <strong>Veludo</strong>: extração na direção do pelo com cabeçote especializado que restaura a textura. <strong>Couro sintético (PU) e microfibra</strong>: processo adaptado ao nível de sujidade. O preço é o mesmo independentemente do material: <strong>49€ (1 lugar), 69€ (2 lugares), 79€ (3 lugares)</strong>. Se não tiver a certeza do material do seu sofá, envie uma foto: identificamos e confirmamos o processo adequado. Veja todos os materiais tratados na nossa página de <Link to="/limpeza-sofas" className="text-gold hover:underline font-medium">limpeza de sofás</Link>.</>,
    plainAnswer: "Limpamos sofás de couro, pele, alcântara, veludo e microfibra com técnicas específicas por material. O preço é o mesmo independentemente do material: 49€ (1 lugar), 69€ (2 lugares), 79€ (3 lugares).",
  },
  {
    id: "garantia-satisfacao",
    question: "Têm garantia de satisfação?",
    answer: <>{SATISFACTION_PROMISE}</>,
    plainAnswer: SATISFACTION_PROMISE,
  },
  {
    id: "como-pedir-orcamento-rapido",
    question: "Como faço um orçamento rápido?",
    answer: <>O método mais rápido é o <strong>calculador online</strong>: responda a 4 perguntas (serviço, tamanho, localização, disponibilidade) e recebe o preço estimado em menos de 30 segundos, sem precisar de falar com ninguém e sem compromisso. Em alternativa: <strong>WhatsApp para {PHONE_DISPLAY}</strong> com uma foto do sofá, resposta em menos de 10 minutos durante o horário de serviço (8h às 24h, segunda a sábado). Para empresas ou volumes, contacte diretamente para orçamento personalizado com desconto de volume. <strong>Não existem custos escondidos</strong>: o preço do orçamento é o preço final pago. O técnico não adiciona extras no local sem aprovação prévia. O serviço de <Link to="/limpeza-sofas" className="text-gold hover:underline font-medium">limpeza de sofás</Link> inclui todo o produto necessário; a deslocação é cobrada à parte, consoante a localização.</>,
    plainAnswer: `Calculador online em 30 segundos (4 perguntas). Ou WhatsApp para ${PHONE_DISPLAY} com foto, resposta em menos de 10 minutos (8h às 24h, seg. a sáb.). Preço final sem extras. Inclui produto; deslocação cobrada à parte consoante a localização.`,
  },
  {
    id: "preco-colchao-solteiro",
    question: "Quanto custa limpar um colchão de solteiro?",
    answer: <>{'Limpeza de colchão: solteiro 59€, casal 69€, king/queen 79€, mais deslocação. Inclui aspiração, tratamento de manchas e extração de sujidade. Anti-ácaros e desbacterização são extras opcionais.'}</>,
    plainAnswer: 'Limpeza de colchão: solteiro 59€, casal 69€, king/queen 79€, mais deslocação. Inclui aspiração, tratamento de manchas e extração de sujidade. Anti-ácaros e desbacterização são extras opcionais.',
  },
  {
    id: "servico-fora-porto",
    question: "Fazem limpeza de sofás fora do Porto?",
    answer: <>{COVERAGE_PROMISE + ' ' + AVAILABILITY_PROMISE + ' Deslocação a partir de 10€, confirmada para a localidade.'}</>,
    plainAnswer: COVERAGE_PROMISE + ' ' + AVAILABILITY_PROMISE + ' Deslocação a partir de 10€, confirmada para a localidade.',
  },
  {
    id: "quanto-custa-limpar-tapete",
    question: "Quanto custa limpar um tapete profissionalmente?",
    answer: <>A <Link to="/limpeza-tapetes" className="text-gold hover:underline font-medium">limpeza profissional de tapetes</Link> é sempre orçamentada à medida: cada tapete é medido individualmente (largura x comprimento) e o preço depende do tipo de fibra, dimensão e estado de sujidade, sem tabela fixa por m². A deslocação custa a partir de 10€ no Porto e aumenta com a distância, seguindo a mesma tabela dos restantes serviços. O tapete fica pronto a usar em 3 a 6 horas. Tapetes persas, de seda ou lã natural têm processo adaptado ao material sem acréscimo de preço.</>,
    plainAnswer: "Limpeza de tapetes: orçamento à medida de cada tapete (mede-se largura x comprimento), sem tabela fixa por m². Depende do tipo de fibra e estado do tapete. Deslocação a partir de 10€.",
  },
  {
    id: "quanto-custa-limpar-alcatifa",
    question: "Fazem limpeza de alcatifas? Qual é o preço?",
    answer: <>Sim. A <Link to="/limpeza-alcatifas" className="text-gold hover:underline font-medium">limpeza de alcatifas</Link> é feita no local por extração a vapor, sem necessidade de remover o revestimento. O preço é sempre orçamentado à medida da área e do estado da alcatifa, sem tabela fixa por m². Para saber o preço exato da sua alcatifa, envie uma foto e a metragem via <a href={WHATSAPP_BASE} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline font-medium">WhatsApp ({PHONE_DISPLAY})</a> e respondemos em menos de 10 minutos. O serviço inclui pré-tratamento de manchas, extração a vapor e extração da sujidade.</>,
    plainAnswer: `Limpeza de alcatifas feita no local por extração a vapor. Orçamento sempre à medida da área total, sem preço fixo por m². Envie foto e metragem via WhatsApp ${PHONE_DISPLAY} para orçamento em menos de 10 minutos. Inclui pré-tratamento, extração de sujidade.`,
  },
  {
    id: "quanto-custa-impermeabilizacao",
    question: "Quanto custa impermeabilizar um sofá?",
    answer: <>A <Link to="/impermeabilizacao" className="text-gold hover:underline font-medium">impermeabilização profissional</Link> para sofás existe em duas versões. A <strong>Essencial</strong> (à base de água) custa <strong>59€ (1 lugar), 79€ (2 lugares) e 99€ (3 lugares)</strong>, aguenta até 2 lavagens e dura 1 a 2 anos. A <strong>Premium</strong> (à base de diluente, mais resistente ao desgaste) custa <strong>89€ (1 lugar), 109€ (2 lugares) e 139€ (3 lugares)</strong>, aguenta até 5 lavagens e dura até 10 anos. Quando a Essencial é contratada em pack com a limpeza, o total é mais baixo do que os dois serviços separados. Para casas com crianças ou animais, a Premium costuma compensar mais.</>,
    plainAnswer: "Impermeabilização sofá: Essencial 59€/79€/99€ (até 2 lavagens, 1 a 2 anos). Premium 89€/109€/139€ (até 5 lavagens, até 10 anos). Pack limpeza+Essencial tem desconto.",
  },
  {
    id: "diferenca-tapete-alcatifa",
    question: "Qual é a diferença entre tapete e alcatifa para efeitos de limpeza?",
    answer: <><strong>Tapete</strong> é uma peça solta com dimensões definidas que pode ser movida e transportada. <strong>Alcatifa</strong> é um revestimento de piso fixo ou semi-fixo que cobre toda uma divisão. Do ponto de vista de limpeza: tapetes avulsos são tratados ao domicílio ou com recolha e entrega; alcatifas são sempre limpas no local por extração a vapor sem remoção. Em ambos os casos o orçamento é sempre feito à medida, sem tabela fixa por m². Para mais detalhes: <Link to="/limpeza-tapetes" className="text-gold hover:underline font-medium">limpeza de tapetes</Link> ou <Link to="/limpeza-alcatifas" className="text-gold hover:underline font-medium">limpeza de alcatifas</Link>.</>,
    plainAnswer: "Tapete: peça solta, tratada ao domicílio ou com recolha. Alcatifa: revestimento fixo, sempre limpa no local por extração. Orçamento sempre à medida em ambos os casos, sem preço fixo por m².",
  },
];

const combinedSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      "url": PAGE_URL,
      "name": "Perguntas Frequentes: Limpeza de Estofos, Tapetes e Alcatifas | Kyro Clean Solutions",
      "inLanguage": "pt-PT",
      "isPartOf": { "@id": `${SITE_URL}/#website` },
      "publisher": { "@id": `${SITE_URL}/#business` },
      "breadcrumb": { "@id": `${PAGE_URL}#breadcrumb` },
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faqpage`,
      "mainEntity": allFaqs.map((f) => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": { "@type": "Answer", "text": f.plainAnswer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "Recursos", "item": `${SITE_URL}/blog` },
        { "@type": "ListItem", "position": 3, "name": "Perguntas Frequentes", "item": PAGE_URL },
      ],
    },
  ],
};

const relatedServices = [
  { to: "/limpeza-sofas",    label: "Limpeza de Sofás" },
  { to: "/limpeza-colchoes", label: "Limpeza de Colchões" },
  { to: "/limpeza-tapetes",  label: "Limpeza de Tapetes" },
  { to: "/limpeza-cadeiras", label: "Limpeza de Cadeiras" },
  { to: "/impermeabilizacao",label: "Impermeabilização" },
  { to: "/limpeza-alcatifas",label: "Limpeza de Alcatifas" },
];

const FAQEstofos = () => {


  useEffect(() => {
    document.title = "Perguntas Frequentes: Limpeza de Estofos, Tapetes e Alcatifas | Kyro Clean Solutions";
    document.querySelector('meta[name="description"]')?.setAttribute("content",
      "16 respostas sobre limpeza de sofás, colchões, tapetes e alcatifas em Portugal: preços reais, impermeabilização, tempos de secagem, garantia e áreas servidas. Kyro Clean Solutions.");
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", PAGE_URL);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content",
      "Perguntas Frequentes: Limpeza de Estofos, Tapetes e Alcatifas | Kyro Clean Solutions");
    document.querySelector('meta[property="og:description"]')?.setAttribute("content",
      "16 respostas sobre limpeza de sofás, colchões, tapetes e alcatifas: preços reais, impermeabilização, manchas difíceis, garantia e áreas servidas.");
  }, []);



  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }} />

      <div className="min-h-screen bg-[#FDFDF9]">
        <Header />

        {/* Hero */}
        <div className="bg-kyro-green pt-24 pb-10 md:pb-14">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white/60 transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/60">Perguntas Frequentes</span>
            </nav>
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-3" style={{ color: '#D4AF37' }}>
              Kyro Clean Solutions
            </p>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              Perguntas Frequentes
            </h1>
            <p className="text-white/55 text-base leading-relaxed max-w-xl">
              16 respostas com dados reais: preços, tempos de secagem, garantias, materiais e áreas de serviço. Com condições do serviço explicadas.
            </p>
          </div>
        </div>

        {/* Main: FAQ list + Sidebar */}
        <main className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex gap-10 items-start">

            {/* FAQ accordion */}
            <div className="flex-1 min-w-0">
              <ServiceFAQ faqs={allFaqs} includeSchema={false} />
            </div>

            {/* Sticky sidebar, desktop only */}
            <aside className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0 sticky top-24">

              {/* CTA card */}
              <div className="bg-kyro-green rounded-2xl p-5">
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-1" style={{ color: '#D4AF37' }}>
                  Orçamento grátis
                </p>
                <p className="font-playfair text-white font-bold text-base leading-snug mb-1">
                  Preço em 30 segundos
                </p>
                <p className="text-white/45 text-xs mb-4 leading-relaxed">
                  Sem compromisso · Técnico contacta em menos de 10 min
                </p>
                <QuizButton ctaLabel="Calcular preço" />
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href={WHATSAPP_BASE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-white/20 rounded-full text-white/70 font-medium text-xs hover:bg-white/[0.07] hover:text-white transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" strokeWidth={2} />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${PHONE_E164}`}
                    className="inline-flex items-center justify-center gap-1.5 text-white/55 hover:text-gold text-xs font-medium transition-colors"
                  >
                    <Phone className="w-3 h-3 text-gold flex-shrink-0" strokeWidth={2.5} />
                    {PHONE_DISPLAY}
                  </a>
                </div>
                {/* Rating */}
                <TrustRatingBadge variant="pillSmall" />
              </div>

              {/* Related services */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E4DE]">
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#111111]/40 mb-3">
                  Serviços
                </p>
                <div className="space-y-1">
                  {relatedServices.map(s => (
                    <Link
                      key={s.to}
                      to={s.to}
                      className="flex items-center gap-2 text-[13px] text-[#111111]/65 hover:text-[#D4AF37] transition-colors py-1.5 border-b border-[#E8E4DE] last:border-0"
                    >
                      <ChevronRight className="w-3 h-3 text-[#D4AF37]/50 flex-shrink-0" />
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>

            </aside>
          </div>

          {/* Mobile CTA, below FAQ list */}
          <div className="lg:hidden mt-8 bg-kyro-green rounded-2xl p-6 text-center">
            <p className="font-playfair text-white font-bold text-lg mb-1">Orçamento gratuito</p>
            <p className="text-white/50 text-sm mb-5">30 segundos · Sem compromisso</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <QuizButton ctaLabel="Calcular preço grátis" />
              <a
                href={WHATSAPP_BASE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 rounded-full text-white/75 font-medium text-sm hover:bg-white/[0.07] hover:text-white transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" strokeWidth={2} />
                WhatsApp
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FAQEstofos;
