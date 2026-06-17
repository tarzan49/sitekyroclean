import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { SITE_URL } from "@/constants/business";

const PAGE_URL = `${SITE_URL}/glossario-limpeza-estofos`;

interface Term {
  id: string;
  term: string;
  definition: string;
  example: string;
  serviceLink?: { label: string; to: string };
}

const terms: Term[] = [
  {
    id: "higienizacao-vs-limpeza-vs-lavagem",
    term: "Higienização vs Limpeza vs Lavagem",
    definition: "Três termos frequentemente confundidos mas com significados distintos. Limpeza remove sujidade visível (manchas, pó, gordura) da superfície do tecido. Higienização vai além: elimina agentes biológicos invisíveis como ácaros, bactérias, fungos e alergénios:que representam risco para a saúde. Lavagem implica utilização de água em grande quantidade e é menos comum em estofos (risco de deformação). O serviço Kyro Clean combina limpeza profunda com higienização por vapor a 160°C.",
    example: "Quando diz que quer 'higienizar' o sofá, está a pedir eliminação de ácaros e bactérias. Quando diz 'limpar', pode estar a referir-se apenas à remoção de manchas visíveis.",
    serviceLink: { label: "Limpeza e Higienização de Sofás", to: "/limpeza-sofas" },
  },
  {
    id: "impermeabilizacao-sofa",
    term: "Impermeabilização de Sofá",
    definition: "Tratamento aplicado após a limpeza que cria uma barreira protetora invisível nas fibras do tecido. Quando um líquido é derramado sobre um sofá impermeabilizado, fica na superfície em forma de gotas (efeito lotus) em vez de ser absorvido pelas fibras. Protege contra vinho, café, sumos, gordura e urina de animais. O efeito dura tipicamente 12 a 18 meses.",
    example: "Família com crianças pequenas impermeabiliza o sofá de microfibra após a limpeza. Quando o filho derrama sumo de laranja, basta limpar com um pano:sem mancha.",
    serviceLink: { label: "Impermeabilização de Estofos", to: "/impermeabilizacao" },
  },
  {
    id: "extracao-vapor-estofos",
    term: "Extração a Vapor de Estofos",
    definition: "Técnica profissional que combina injeção de vapor de água a alta pressão (até 8 bar) com aspiração simultânea. O vapor penetra nas fibras, solta a sujidade orgânica e mata microrganismos a temperaturas acima de 60ºC, letal para ácaros, bactérias e fungos. A aspiração remove imediatamente os resíduos e 80 a 90% da humidade, deixando o tecido levemente húmido e com tempo de secagem de 1 a 3 horas. É o método de referência para estofos de tecido porque limpa e higieniza em simultâneo sem produtos químicos agressivos.",
    example: "Sofá de microfibra com 3 anos de uso intensivo em casa com cão. Após extração a vapor, fibras recuperam cor original, odor a animal eliminado e o dono nota redução imediata de espirros.",
    serviceLink: { label: "Limpeza de Sofás por Extração", to: "/limpeza-sofas" },
  },
  {
    id: "shampoo-estofos",
    term: "Shampoo de Estofos",
    definition: "Produto detergente específico para tecidos estofados, formulado para penetrar nas fibras e emulsionar sujidade orgânica (gordura, suor, manchas proteicas). É aplicado em espuma para minimizar a quantidade de água utilizada:fundamental para evitar a deformação das almofadas. Diferente do shampoo de tapetes, que é mais agressivo. Requer aspiração para remoção completa após aplicação.",
    example: "Sofá de microfibra com manchas de suor no encosto e assento. Aplicação de shampoo de estofos em espuma, seguida de extração a vapor, remove a sujidade acumulada sem ensopar.",
  },
  {
    id: "limpeza-seco-sofa",
    term: "Limpeza a Seco de Sofá",
    definition: "Método de limpeza que utiliza solventes ou compostos em pó (sem água ou com humidade mínima inferior a 5%) para dissolver e remover sujidade das fibras. Indicado para tecidos que não toleram humidade: alcântara, veludo de seda, alguns tipos de linho e estofos com enchimentos que deformam com água. O processo aplica o produto, deixa agir 10 a 15 minutos e aspira ou escova. Não elimina ácaros tão eficazmente quanto o vapor, por isso é complementado com tratamento anti-ácaros separado quando necessário.",
    example: "Sofá de alcântara creme com manchas de café. Limpeza a seco com solvente neutro:manchas removidas sem qualquer risco de marcas de humidade ou deformação do tecido.",
    serviceLink: { label: "Limpeza Especializada por Material", to: "/limpeza-sofas" },
  },
  {
    id: "tratamento-anti-acaros",
    term: "Tratamento Anti-ácaros",
    definition: "Aplicação de produto acaricida de segurança certificada após a limpeza, que cria uma barreira protetora nas fibras que impede a reinstalação de ácaros por vários meses. Diferente da simples extração de ácaros, o tratamento tem efeito residual. Especialmente recomendado para crianças com alergias respiratórias e para Portugal, onde o clima húmido favorece a proliferação de ácaros.",
    example: "Criança com asma alérgica a ácaros em Lisboa. Após tratamento anti-ácaros no colchão e sofá, redução de 70% dos episódios de crise em 3 meses (resultado típico reportado por clientes Kyro Clean).",
    serviceLink: { label: "Limpeza de Colchões com Anti-ácaros", to: "/limpeza-colchoes" },
  },
  {
    id: "ph-neutro-tecidos",
    term: "pH Neutro em Limpeza de Tecidos",
    definition: "Os produtos de limpeza têm pH que vai de ácido (pH 0-6) a alcalino (pH 8-14), passando pelo neutro (pH 7). Tecidos delicados como seda, linho, alcântara e couro exigem produtos de pH neutro para não destruir as fibras ou alterar as cores. Produtos domésticos comuns (lixívia, vinagre, bicarbonato) têm pH extremo e são inadequados para estofos de qualidade.",
    example: "Sofá de linho bege tratado com produto de pH alcalino fica com manchas amareladas. Tratado com produto de pH neutro profissional, as cores são preservadas.",
  },
  {
    id: "tecido-microsuede",
    term: "Tecido Microsuede (Microfibra de Camurça)",
    definition: "Tecido sintético de alta densidade que imita a textura suave da camurça natural, mas com maior resistência e facilidade de manutenção. É composto por fibras de poliéster ultra-finas (menos de 1 dtex). Muito popular em sofás modernos (IKEA KIVIK, modelos Conforama). Resiste bem à limpeza a vapor mas é sensível a produtos alcalinos e ao calor excessivo que pode fundir as microfibras.",
    example: "Sofá de microsuede cinza com manchas de café. Limpeza a vapor a temperatura moderada com produto neutro:resultado excelente, cor uniforme restaurada.",
  },
  {
    id: "alcantara-sintetica-natural",
    term: "Alcântara Sintética vs Natural",
    definition: "Alcântara natural (também chamada Alcantara®) é uma marca registada italiana feita de poliéster e poliuretano, com textura ultra-macia. Alcântara sintética genérica é uma imitação de menor qualidade. Ambas exigem limpeza especializada: nunca vapor a alta pressão, nunca produtos com álcool. A limpeza a seco com escova profissional é a técnica preferida. O couro Alcantara® tem tratamento anti-mancha de fábrica que é parcialmente restaurável.",
    example: "Sofá de alcântara sintética cinza-escuro com manchas de gordura. Limpeza a seco com produto específico e escova suave:manchas removidas sem alteração da textura.",
    serviceLink: { label: "Limpeza de Sofás por Material", to: "/limpeza-sofas" },
  },
  {
    id: "veludo-terciopelo-cuidados",
    term: "Veludo e Terciopelo: Cuidados Especiais",
    definition: "Veludo tem pelo curto e denso que cria reflexo luminoso característico. Terciopelo é um tipo de veludo com pelo mais longo. Ambos são extremamente sensíveis ao atrito: esfregar contra o pelo cria marcas permanentes e brilho irregular. A limpeza profissional usa escova de pelos macios na direção correta do pelo, seguida de extração controlada. Nunca usar vapor direto a alta pressão.",
    example: "Sofá de veludo azul petróleo com marcas de uso no assento. Limpeza com escova especializada:as fibras ficam alinhadas e o aspeto premium é restaurado.",
    serviceLink: { label: "Limpeza Especializada de Veludo", to: "/limpeza-sofas" },
  },
  {
    id: "couro-pu-ecologico",
    term: "Couro PU (Ecológico / Sintético)",
    definition: "Couro PU (polyuretano) é um revestimento sintético que imita o couro genuíno a menor custo. É composto por uma base têxtil revestida de poliuretano. Principal fraqueza: o revestimento descasca com o tempo, especialmente em zonas de maior atrito. Não existe tratamento que reverta o descascamento avançado, mas a limpeza correta retarda o processo. Nunca usar vapor de alta pressão ou produtos com solventes.",
    example: "Sofá de couro PU Conforama com início de descascamento nas costuras. Limpeza suave com produto específico e condicionador de PU:processo estabilizado e aspeto melhorado.",
  },
  {
    id: "manchas-proteicas-oleosas",
    term: "Manchas Proteicas vs Manchas Oleosas",
    definition: "Dois tipos com tratamento completamente diferente. Manchas proteicas (sangue, leite, ovo, urina, vómito) são de origem orgânica e requerem tratamento enzimático:as enzimas quebram as proteínas para fácil remoção. Usar calor (vapor) antes do tratamento enzimático 'coze' a proteína e fixa a mancha permanentemente. Manchas oleosas (gordura, manteiga, maquilhagem) requerem desengordurante de base aquosa antes do vapor.",
    example: "Mancha de sangue fresco: primeiro tratar com produto enzimático frio, depois vapor. Mancha de sangue seco tratada com vapor logo de início: fixed:impossível de remover completamente.",
  },
  {
    id: "fungos-bolor-estofos",
    term: "Fungos e Bolor em Estofos",
    definition: "Fungos e bolor desenvolvem-se em estofos quando a humidade é superior a 60-70% e a temperatura favorável. Manifestam-se como manchas escuras ou esverdeadas, geralmente nas partes traseiras ou inferiores do sofá. Além do impacto estético, produzem esporos que causam problemas respiratórios. O tratamento inclui eliminação com produto fungicida específico seguido de vapor. Em Portugal, o clima húmido do Norte torna este problema comum.",
    example: "Sofá encostado a parede exterior em apartamento no Porto com problemas de humidade. Manchas de bolor na parte traseira. Tratamento fungicida + vapor + recomendação de ventilação.",
  },
  {
    id: "desodorizacao-estofos",
    term: "Desodorização de Estofos",
    definition: "Processo de eliminação de odores persistentes (cigarro, animais, humidade, suor) dos estofos. Existem dois níveis: desodorização de superfície (produtos que mascaram o odor:temporário) e desodorização profunda (ozono ou enzimas que destroem as moléculas responsáveis pelo odor:permanente). A Kyro Clean usa técnica enzimática de desodorização profunda, eficaz em mais de 90% dos casos.",
    example: "Casa de fumador com sofás impregnados de odor a tabaco. Após desodorização enzimática profissional, odor eliminado em 24-48 horas:não apenas mascarado.",
    serviceLink: { label: "Limpeza e Desodorização", to: "/limpeza-sofas" },
  },
  {
    id: "tapete-vs-alcatifa",
    term: "Tapete vs Alcatifa: Diferença e Limpeza",
    definition: "Tapete é uma peça solta com dimensões definidas que pode ser movida e transportada. Inclui tapetes de sala, quarto, persas, kilim e sisal. Alcatifa é um revestimento de piso fixo ou semi-fixo que cobre toda a área de uma divisão e não é removível sem intervenção. Do ponto de vista de limpeza, a distinção é técnica: tapetes avulsos podem ser limpos ao domicílio por extração a vapor ou recolhidos para lavagem nas instalações, acedendo ao anverso e reverso. Alcatifas são sempre tratadas no local por extração a vapor sem remoção. Os preços são calculados por metro quadrado em ambos os casos.",
    example: "Tapete persa de 6 m² na sala de jantar: tratado ao domicílio por extração. Alcatifa de quarto de 15 m²: limpa no local sem qualquer remoção, com equipamento profissional transportado pelo técnico.",
    serviceLink: { label: "Limpeza de Tapetes e Alcatifas", to: "/limpeza-tapetes" },
  },
  {
    id: "limpeza-estofos-exterior",
    term: "Limpeza de Estofos de Exterior",
    definition: "Sofás, cadeiras e espreguiçadeiras de exterior (terraço, jardim, piscina) têm tecidos específicos resistentes à humidade e UV (olefin, acrílico, textilene, sling). Estes materiais são mais resistentes à água mas acumulam algas, fungos, terra e gordura solar. A limpeza usa produtos adequados a tecidos outdoor e é mais rápida que a de interior:a secagem é imediata. Em Portugal, a limpeza sazonal (primavera/outono) é recomendada.",
    example: "Conjunto de garden lounge com cushions de olefin no Porto. Após inverno: manchas verdes de algas e terra. Limpeza com produto específico outdoor:resultado impecável para o verão.",
    serviceLink: { label: "Limpeza de Tapetes e Exterior", to: "/limpeza-tapetes" },
  },
];

const combinedSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      "url": PAGE_URL,
      "name": "Glossário de Limpeza de Estofos: 16 Termos Técnicos | Kyro Clean Solutions",
      "inLanguage": "pt-PT",
      "isPartOf": { "@id": `${SITE_URL}/#website` },
      "publisher": { "@id": `${SITE_URL}/#business` },
      "breadcrumb": { "@id": `${PAGE_URL}#breadcrumb` },
    },
    {
      "@type": "DefinedTermSet",
      "@id": `${PAGE_URL}#glossary`,
      "name": "Glossário de Limpeza de Estofos | Kyro Clean Solutions",
      "description": "16 termos técnicos sobre limpeza profissional de sofás, colchões, tapetes, alcatifas e estofos em Portugal, explicados pela Kyro Clean Solutions.",
      "url": PAGE_URL,
      "inLanguage": "pt-PT",
      "definedTerm": terms.map((t) => ({
        "@type": "DefinedTerm",
        "name": t.term,
        "description": t.definition,
        "inDefinedTermSet": PAGE_URL,
        "url": `${PAGE_URL}#${t.id}`,
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "Recursos", "item": `${SITE_URL}/blog` },
        { "@type": "ListItem", "position": 3, "name": "Glossário", "item": PAGE_URL },
      ],
    },
  ],
};

const GlossarioEstofos = () => {
  useEffect(() => {
    document.title = "Glossário de Limpeza de Estofos: 16 Termos Técnicos | Kyro Clean Solutions";
    document.querySelector('meta[name="description"]')?.setAttribute("content",
      "16 termos técnicos de limpeza de estofos explicados com rigor: higienização, extração a vapor, impermeabilização, tapete vs alcatifa, veludo, alcântara e mais. Kyro Clean Solutions.");
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", PAGE_URL);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content",
      "Glossário de Limpeza de Estofos: 16 Termos Técnicos | Kyro Clean Solutions");
    document.querySelector('meta[property="og:description"]')?.setAttribute("content",
      "16 termos técnicos de limpeza de estofos explicados com rigor. Higienização, extração a vapor, impermeabilização, tapete vs alcatifa, veludo, alcântara e mais.");
  }, []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }} />

      <div className="min-h-screen bg-[#f4f5f7]">
        <Header />

        {/* ── Hero dark band ── */}
        <div className="pt-24 pb-10 bg-checker-dark">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-gold transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/blog" className="hover:text-gold transition-colors">Recursos</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/60">Glossário</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-gold" />
              </div>
              <p className="text-gold text-[10px] font-bold tracking-[0.25em] uppercase">KYRO CLEAN SOLUTIONS</p>
            </div>

            <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              Glossário de Limpeza de Estofos
            </h1>
            <p className="text-white/55 text-base leading-relaxed max-w-2xl mb-6">
              {terms.length} termos técnicos explicados com rigor e acessibilidade:definições citáveis, com exemplo prático e link para o serviço relevante.
            </p>

            {/* Quick index pills */}
            <div className="flex flex-wrap gap-1.5">
              {terms.map((term, i) => (
                <a
                  key={term.id}
                  href={`#${term.id}`}
                  className="flex-shrink-0 text-[11px] font-medium text-white/40 hover:text-gold border border-white/10 hover:border-gold/30 px-2.5 py-1 rounded-full transition-all"
                >
                  {String(i + 1).padStart(2, "0")} {term.term.split(" ")[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Terms list ── */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          {terms.map((term, idx) => (
            <article
              key={term.id}
              id={term.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-24 hover:border-gold/20 hover:shadow-md transition-all"
            >
              {/* Gold top line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

              <div className="p-6 md:p-7">
                {/* Header row */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-[11px] font-bold text-gold mt-0.5">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <a href={`#${term.id}`} title="Link direto">
                      <h2 className="font-playfair text-lg md:text-xl font-bold text-[#111111] leading-snug hover:text-gold transition-colors">
                        {term.term}
                      </h2>
                    </a>
                  </div>
                </div>

                {/* Definition */}
                <p className="text-[15px] text-[#111111]/70 leading-relaxed mb-4 pl-10">
                  {term.definition}
                </p>

                {/* Example */}
                <div className="pl-10 mb-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold text-[#111111]/50 uppercase tracking-widest mb-1.5">
                      Exemplo prático
                    </p>
                    <p className="text-sm text-[#111111]/60 leading-relaxed italic">{term.example}</p>
                  </div>
                </div>

                {/* Service link */}
                {term.serviceLink && (
                  <div className="pl-10">
                    <Link
                      to={term.serviceLink.to}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-[#A87C2A] transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      {term.serviceLink.label}
                    </Link>
                  </div>
                )}
              </div>
            </article>
          ))}

          {/* ── Final CTA ── */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#071a12" }}>
            <div className="px-6 py-8 flex flex-col items-center text-center">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold/70 mb-2">PRONTO PARA AGENDAR?</p>
              <h2 className="font-playfair text-2xl font-bold text-white mb-2">Orçamento gratuito em 30 segundos</h2>
              <p className="text-white/50 text-sm mb-6">Técnico contacta em menos de 30 minutos · Sem compromisso</p>
              <QuizButton ctaLabel="Calcular preço grátis" />
            </div>
          </div>

          {/* ── Related links ── */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs font-bold text-[#111111]/40 uppercase tracking-widest mb-3">Recursos relacionados</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { to: "/perguntas-frequentes-limpeza-estofos", label: "FAQ Estofos" },
                { to: "/limpeza-sofas", label: "Limpeza de Sofás" },
                { to: "/impermeabilizacao", label: "Impermeabilização" },
                { to: "/limpeza-colchoes", label: "Limpeza de Colchões" },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  className="flex items-center gap-2 text-sm text-[#111111]/70 hover:text-gold transition-colors px-3 py-2 rounded-xl border border-gray-200 hover:border-gold/20 bg-white">
                  <ChevronRight className="w-3.5 h-3.5 text-gold/50 flex-shrink-0" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default GlossarioEstofos;
