import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, MessageCircle, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import { SITE_URL, WHATSAPP_BASE, PHONE_E164, PHONE_DISPLAY } from "@/constants/business";

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
    answer: <>A <Link to="/limpeza-sofas" className="text-gold hover:underline font-medium">limpeza de sofá no Porto</Link> custa <strong>49€ para sofás de 1 lugar</strong>, 69€ para 2 lugares e 79€ para 3 lugares. Sofás com chaise longue têm um acréscimo de 10€. A deslocação está incluída para o Porto. Para concelhos limítrofes como Matosinhos, Gaia ou Maia aplica-se uma taxa de 5€. Não há custos escondidos: o preço do orçamento é o preço final.</>,
    plainAnswer: "Limpeza de sofá: 49€ (1 lugar), 69€ (2 lugares), 79€ (3 lugares). Chaise longue: +10€. Deslocação incluída no Porto. Concelhos limítrofes: +5€. Sem custos escondidos.",
  },
  {
    id: "preco-sofa-3-lugares",
    question: "Qual o preço para limpar um sofá de 3 lugares?",
    answer: <>Um <Link to="/limpeza-sofas" className="text-gold hover:underline font-medium">sofá de 3 lugares</Link> custa <strong>79€</strong>, incluindo pré-tratamento de manchas, extração a vapor com equipamento profissional, bactericida certificado e secagem acelerada. Almofadas soltas são tratadas sem custo adicional. Para obter o preço exato, use o nosso calculador de orçamento, que responde em 30 segundos com base no tamanho e código postal.</>,
    plainAnswer: "Sofá de 3 lugares: 79€. Inclui pré-tratamento de manchas, extração a vapor profissional, bactericida e secagem acelerada. Almofadas soltas sem custo extra.",
  },
  {
    id: "sofa-fica-molhado-tempo-seca",
    question: "O sofá fica molhado após a limpeza? Quanto tempo seca?",
    answer: <>O sofá fica <strong>levemente húmido, não encharcado</strong>. O equipamento de extração a vapor remove a humidade em simultâneo com a sujidade, deixando o tecido com cerca de 20% de humidade residual (semelhante a roupa depois de centrifugada). O tempo de secagem normal é <strong>1 a 3 horas</strong> com ventilação adequada. Em dias de chuva ou divisões sem janelas pode demorar 4 horas. Recomendamos abrir janelas e, se possível, ligar ventoinha apontada ao sofá. Pode sentar-se após 2 horas na maioria dos tecidos; tecidos espessos como veludo ou boucle pedem 3 a 4 horas. A <Link to="/limpeza-sofas" className="text-gold hover:underline font-medium">limpeza de sofás</Link> nunca deixa cheiro a humidade quando o processo de extração é feito corretamente.</>,
    plainAnswer: "O sofá fica levemente húmido, não encharcado. Secagem: 1 a 3 horas com ventilação normal. Em dias de chuva até 4 horas. Pode usar após 2 horas. Veludo e boucle precisam de 3 a 4 horas.",
  },
  {
    id: "manchas-vinho-sangue-gordura",
    question: "Conseguem tirar manchas de vinho, sangue e gordura?",
    answer: <>Sim. A taxa de remoção da Kyro Clean é <strong>superior a 95% para manchas de vinho tinto, sangue, café, gordura e urina</strong> quando o tratamento é feito dentro de 6 meses após a mancha. Usamos pré-tratamento enzimático específico por tipo: enzimas proteolíticas para sangue, enzimas lipolíticas para gordura, oxidantes controlados para vinho. Manchas antigas com mais de 1 ano oxidam nas fibras e a taxa de remoção desce para 60% a 80%, ainda assim, o resultado é sempre significativamente melhor que o estado inicial. Para casos duvidosos, envie uma foto via <a href={WHATSAPP_BASE} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline font-medium">WhatsApp ({PHONE_DISPLAY})</a> e damos uma estimativa honesta antes de agendar.</>,
    plainAnswer: "Taxa de remoção superior a 95% para manchas de vinho, sangue, café, gordura e urina tratadas até 6 meses. Pré-tratamento enzimático específico por tipo de mancha. Manchas com mais de 1 ano: 60% a 80% de remoção.",
  },
  {
    id: "limpeza-em-casa-domicilio",
    question: "A limpeza é feita em casa ou tenho de levar o sofá?",
    answer: <>A <Link to="/limpeza-sofas" className="text-gold hover:underline font-medium">limpeza de sofás Kyro Clean</Link> é <strong>sempre realizada ao domicílio</strong>: não é necessário deslocar o sofá. Um técnico desloca-se com equipamento profissional completo incluído no preço. O serviço demora 45 a 90 minutos para sofás standard. Não é necessária qualquer preparação da sua parte: não precisa de tirar almofadas, coberturas ou mover móveis adjacentes. A água suja é totalmente aspirada pelo equipamento, o seu pavimento fica seco e protegido. Deslocação incluída no <strong>Porto</strong>. Para Matosinhos, Gaia, Maia, Gondomar e Valongo a taxa é <strong>5€</strong>. Para Póvoa de Varzim, Vila do Conde, Braga e Guimarães a taxa é <strong>10€</strong>. Para Lisboa e área metropolitana a taxa é <strong>15€</strong>.</>,
    plainAnswer: "Limpeza sempre ao domicílio, sem deslocar o sofá. Técnico chega com equipamento completo. Serviço: 45 a 90 minutos. Porto: deslocação incluída. Matosinhos/Gaia/Maia/Gondomar/Valongo: +5€. Póvoa/Vila do Conde/Braga/Guimarães: +10€. Lisboa e área: +15€.",
  },
  {
    id: "diferenca-higienizacao-limpeza",
    question: "Qual a diferença entre higienização e limpeza de sofá?",
    answer: <><strong>Limpeza</strong> remove sujidade visível: manchas, gordura, pó acumulado e resíduos de pele. <strong>Higienização</strong> ataca o invisível: ácaros, bactérias, fungos e alérgenos que se acumulam nas fibras. A temperatura letal para ácaros é 55ºC. O equipamento profissional atinge 160ºC, eliminando 99,9% dos microrganismos. Na Kyro Clean, o serviço padrão de <Link to="/limpeza-sofas" className="text-gold hover:underline font-medium">limpeza de sofás</Link> inclui <em>sempre</em> ambos os processos: primeiro limpamos com produto específico para o tipo de tecido, depois higienizamos com vapor de alta pressão e aplicamos bactericida de longa duração. Não oferecemos limpeza sem higienização, pois é a única forma responsável de tratar estofos, especialmente em casas com crianças, idosos ou pessoas com alergias.</>,
    plainAnswer: "Limpeza remove sujidade visível. Higienização elimina ácaros, bactérias e fungos com vapor a 160ºC (letal acima de 55ºC). Na Kyro Clean o serviço padrão inclui sempre ambos: limpeza + higienização + bactericida.",
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
    answer: <>Sim. A Kyro Clean oferece <strong>garantia de satisfação total</strong>: se o resultado não corresponder ao que foi acordado antes do serviço, voltamos ao domicílio sem custo adicional para corrigir o trabalho. A garantia cobre manchas identificadas e estimadas antes de começar. Para a acionar, basta contactar-nos nas <strong>48 horas</strong> após o serviço via <a href={WHATSAPP_BASE} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline font-medium">WhatsApp ({PHONE_DISPLAY})</a>. A nossa taxa de reclamações é inferior a 1%: mais de 99% dos clientes ficam satisfeitos na primeira visita, reflectido nas nossas <strong>mais de 60 avaliações 5 estrelas no Google</strong>. Somos honestos sobre o que conseguimos e não conseguimos remover antes de aceitar o trabalho: nunca prometer e não cumprir.</>,
    plainAnswer: "Garantia de satisfação total: voltamos sem custo se o resultado não corresponder ao acordado. Acionar em 48h via WhatsApp. Taxa de reclamações inferior a 1%. Mais de 60 avaliações 5 estrelas no Google.",
  },
  {
    id: "como-pedir-orcamento-rapido",
    question: "Como faço um orçamento rápido?",
    answer: <>O método mais rápido é o <strong>calculador online</strong>: responda a 4 perguntas (serviço, tamanho, localização, disponibilidade) e recebe o preço estimado em menos de 30 segundos, sem precisar de falar com ninguém e sem compromisso. Em alternativa: <strong>WhatsApp para {PHONE_DISPLAY}</strong> com uma foto do sofá, resposta em menos de 30 minutos durante o horário de serviço (8h às 24h, segunda a sábado). Para empresas ou volumes, contacte diretamente para orçamento personalizado com desconto de volume. <strong>Não existem custos escondidos</strong>: o preço do orçamento é o preço final pago. O técnico não adiciona extras no local sem aprovação prévia. O serviço de <Link to="/limpeza-sofas" className="text-gold hover:underline font-medium">limpeza de sofás</Link> inclui deslocação e produto.</>,
    plainAnswer: `Calculador online em 30 segundos (4 perguntas). Ou WhatsApp para ${PHONE_DISPLAY} com foto, resposta em menos de 30 minutos (8h às 24h, seg. a sáb.). Preço final sem extras. Inclui deslocação e produto.`,
  },
  {
    id: "preco-colchao-solteiro",
    question: "Quanto custa limpar um colchão de solteiro?",
    answer: <>A <Link to="/limpeza-colchoes" className="text-gold hover:underline font-medium">limpeza de colchão solteiro</Link> custa <strong>49€</strong>. Colchão de casal: 69€. King-size ou queen-size: 79€. O serviço inclui aspiração profunda, extração a vapor (temperatura superior a 55ºC, letal para ácaros), tratamento de manchas, bactericida e antifúngico. A limpeza de colchão é particularmente importante porque passamos 7 a 8 horas diárias em contacto direto com ele. Um colchão com 5 anos sem tratamento pode conter 2 milhões de ácaros por metro quadrado. Recomendamos 1 vez por ano, 2 vezes para pessoas com alergias ou asma.</>,
    plainAnswer: "Colchão solteiro: 49€. Casal: 69€. King/queen-size: 79€. Inclui aspiração profissional, extração a vapor (acima de 55ºC), tratamento de manchas, bactericida e antifúngico. Recomendado 1 a 2 vezes por ano.",
  },
  {
    id: "servico-fora-porto",
    question: "Fazem limpeza de sofás fora do Porto?",
    answer: <>Sim. A Kyro Clean serve o <strong>Porto sem custo de deslocação</strong>. Para Matosinhos, Vila Nova de Gaia, Maia, Gondomar e Valongo a taxa de deslocação é de <strong>5€</strong>. Para Póvoa de Varzim, Vila do Conde, Braga e Guimarães a taxa é de <strong>10€</strong>. Para Lisboa, Cascais, Sintra e Oeiras a taxa é de <strong>15€</strong>, com agendamento com pelo menos 48 horas de antecedência. Para zonas fora destas áreas avaliamos caso a caso. O horário de serviço é segunda a sábado, das 8h às 24h.</>,
    plainAnswer: "Porto: sem custo de deslocação. Matosinhos/Gaia/Maia/Gondomar/Valongo: +5€. Póvoa de Varzim/Vila do Conde/Braga/Guimarães: +10€. Lisboa e área metropolitana: +15€ (agendamento 48h antecedência).",
  },
  {
    id: "quanto-custa-limpar-tapete",
    question: "Quanto custa limpar um tapete profissionalmente?",
    answer: <>A <Link to="/limpeza-tapetes" className="text-gold hover:underline font-medium">limpeza profissional de tapetes</Link> é calculada por metro quadrado: <strong>12€/m² até 5 m²</strong>, 10€/m² até 10 m² e 9€/m² até 15 m². Exemplo: um tapete de sala de 8 m² custa 90€. Para mais de 15 m², orçamento personalizado. A deslocação está incluída na área do Porto, aplicando-se a mesma tabela de taxas dos restantes serviços fora do Porto. O tapete fica pronto a usar em 2 a 4 horas. Tapetes persas, de seda ou lã natural têm processo adaptado ao material sem acréscimo de preço.</>,
    plainAnswer: "Limpeza de tapetes: 12€/m² até 5m², 10€/m² até 10m², 9€/m² até 15m². Exemplo: tapete 8m² = 90€. Mais de 15m²: orçamento personalizado. Deslocação incluída no Porto.",
  },
  {
    id: "quanto-custa-limpar-alcatifa",
    question: "Fazem limpeza de alcatifas? Qual é o preço?",
    answer: <>Sim. A <Link to="/limpeza-alcatifas" className="text-gold hover:underline font-medium">limpeza de alcatifas</Link> é feita no local por extração a vapor, sem necessidade de remover o revestimento. O preço é calculado por metro quadrado conforme a área total a tratar. Para saber o preço exato da sua alcatifa, envie uma foto e a metragem via <a href={WHATSAPP_BASE} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline font-medium">WhatsApp ({PHONE_DISPLAY})</a> e respondemos em menos de 30 minutos. O serviço inclui pré-tratamento de manchas, extração a vapor e bactericida.</>,
    plainAnswer: `Limpeza de alcatifas feita no local por extração a vapor. Preço por m² conforme área total. Envie foto e metragem via WhatsApp ${PHONE_DISPLAY} para orçamento em menos de 30 minutos. Inclui pré-tratamento, extração e bactericida.`,
  },
  {
    id: "quanto-custa-impermeabilizacao",
    question: "Quanto custa impermeabilizar um sofá?",
    answer: <>A <Link to="/impermeabilizacao" className="text-gold hover:underline font-medium">impermeabilização profissional</Link> para sofás custa <strong>49€ (1 lugar), 69€ (2 lugares) e 89€ (3 lugares)</strong>. Quando contratada em pack com a limpeza, o total é mais baixo do que os dois serviços separados. A impermeabilização cria uma barreira invisível nas fibras que impede a absorção de líquidos durante 12 a 18 meses, especialmente recomendada em casas com crianças ou animais.</>,
    plainAnswer: "Impermeabilização sofá: 49€ (1 lugar), 69€ (2 lugares), 89€ (3 lugares). Pack limpeza+impermeabilização tem desconto. Efeito dura 12 a 18 meses.",
  },
  {
    id: "diferenca-tapete-alcatifa",
    question: "Qual é a diferença entre tapete e alcatifa para efeitos de limpeza?",
    answer: <><strong>Tapete</strong> é uma peça solta com dimensões definidas que pode ser movida e transportada. <strong>Alcatifa</strong> é um revestimento de piso fixo ou semi-fixo que cobre toda uma divisão. Do ponto de vista de limpeza: tapetes avulsos são tratados ao domicílio ou com recolha e entrega; alcatifas são sempre limpas no local por extração a vapor sem remoção. Os preços são calculados por metro quadrado em ambos os casos. Para mais detalhes: <Link to="/limpeza-tapetes" className="text-gold hover:underline font-medium">limpeza de tapetes</Link> ou <Link to="/limpeza-alcatifas" className="text-gold hover:underline font-medium">limpeza de alcatifas</Link>.</>,
    plainAnswer: "Tapete: peça solta, tratada ao domicílio ou com recolha. Alcatifa: revestimento fixo, sempre limpa no local por extração. Preço calculado por m² em ambos os casos.",
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

const FAQItem = ({ faq, index, isOpen, onToggle }: {
  faq: FAQ; index: number; isOpen: boolean; onToggle: () => void;
}) => (
  <div id={faq.id} className={`rounded-2xl border transition-all overflow-hidden scroll-mt-24 ${isOpen ? "border-gold/30 shadow-sm bg-white" : "border-gray-200 bg-white hover:border-gray-300"}`}>
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-start gap-4 px-5 py-4 text-left"
      aria-expanded={isOpen}
    >
      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-[11px] font-bold text-gold mt-0.5">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="flex-1 font-semibold text-[#111111] text-[15px] leading-snug pr-2">{faq.question}</span>
      <ChevronDown className={`flex-shrink-0 w-5 h-5 transition-transform duration-200 mt-0.5 ${isOpen ? "rotate-180 text-gold" : "text-[#111111]/40"}`} />
    </button>
    {isOpen && (
      <div className="px-5 pb-5">
        <div className="pl-11">
          <div className="h-px bg-gray-100 mb-4" />
          <div className="text-[#111111]/70 text-[15px] leading-relaxed">{faq.answer}</div>
          <a
            href={`${PAGE_URL}#${faq.id}`}
            className="inline-flex items-center gap-1 text-[10px] text-[#111111]/25 hover:text-gold transition-colors mt-3 font-mono"
            title="Link direto para esta resposta"
          >
            # permalink
          </a>
        </div>
      </div>
    )}
  </div>
);

const relatedServices = [
  { to: "/limpeza-sofas",    label: "Limpeza de Sofás" },
  { to: "/limpeza-colchoes", label: "Limpeza de Colchões" },
  { to: "/limpeza-tapetes",  label: "Limpeza de Tapetes" },
  { to: "/limpeza-cadeiras", label: "Limpeza de Cadeiras" },
  { to: "/impermeabilizacao",label: "Impermeabilização" },
  { to: "/limpeza-alcatifas",label: "Limpeza de Alcatifas" },
];

const FAQEstofos = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    document.title = "Perguntas Frequentes: Limpeza de Estofos, Tapetes e Alcatifas | Kyro Clean Solutions";
    document.querySelector('meta[name="description"]')?.setAttribute("content",
      "16 respostas sobre limpeza de sofás, colchões, tapetes e alcatifas no Porto: preços reais, impermeabilização, tempos de secagem, garantia e áreas servidas. Kyro Clean Solutions.");
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", PAGE_URL);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content",
      "Perguntas Frequentes: Limpeza de Estofos, Tapetes e Alcatifas | Kyro Clean Solutions");
    document.querySelector('meta[property="og:description"]')?.setAttribute("content",
      "16 respostas sobre limpeza de sofás, colchões, tapetes e alcatifas: preços reais, impermeabilização, manchas difíceis, garantia e áreas servidas.");
  }, []);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

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
              16 respostas com dados reais: preços, tempos de secagem, garantias, materiais e áreas de serviço. Sem marketing.
            </p>
          </div>
        </div>

        {/* Main: FAQ list + Sidebar */}
        <main className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex gap-10 items-start">

            {/* FAQ accordion */}
            <div className="flex-1 min-w-0 space-y-2.5">
              {allFaqs.map((faq, i) => (
                <FAQItem key={faq.id} faq={faq} index={i} isOpen={openIndex === i} onToggle={() => toggle(i)} />
              ))}
            </div>

            {/* Sticky sidebar, desktop only */}
            <aside className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0 sticky top-24">

              {/* CTA card */}
              <div className="bg-kyro-green rounded-2xl p-5">
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: '#D4AF37' }}>
                  Orçamento grátis
                </p>
                <p className="font-playfair text-white font-bold text-base leading-snug mb-1">
                  Preço em 30 segundos
                </p>
                <p className="text-white/45 text-xs mb-4 leading-relaxed">
                  Sem compromisso · Técnico contacta em menos de 30 min
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
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#111111]/40 mb-3">
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
