/**
 * Os 16 termos do glossario de limpeza de estofos.
 *
 * Viviam dentro de src/pages/GlossarioEstofos.tsx, o que os tornava invisiveis
 * para o prerender: a pagina estatica de /glossario-limpeza-estofos tinha 1.200
 * caracteres de cabecalho e rodape e nenhuma definicao. Um crawler sem
 * JavaScript, motores generativos incluidos, nunca leu nenhum destes termos,
 * apesar de serem exatamente o tipo de conteudo que um assistente cita quando
 * lhe perguntam o que e extracao a vapor ou impermeabilizacao.
 *
 * Aqui, sao importaveis pela pagina React e por scripts/prerender.ts.
 */
export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  example: string;
  serviceLink?: { label: string; to: string };
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: "higienizacao-vs-limpeza-vs-lavagem",
    term: "Higienização vs Limpeza vs Lavagem",
    definition: "No site Kyro Clean, limpeza e higienização referem-se à remoção de sujidade e resíduos das fibras. Lavagem descreve um processo de limpeza adequado ao material. Nenhum destes nomes inclui automaticamente tratamento anti-ácaros ou desbacterização: são extras opcionais, com objetivos e preços distintos, confirmados no orçamento.",
    example: "Pode pedir limpeza do sofá e acrescentar anti-ácaros ou desbacterização; a equipa explica e confirma cada extra antes de marcar.",
    serviceLink: { label: "Limpeza e Higienização de Sofás", to: "/limpeza-sofas" },
  },
  {
    id: "impermeabilizacao-sofa",
    term: "Impermeabilização de Sofá",
    definition: "Tratamento aplicado após a limpeza que cria uma barreira protetora invisível nas fibras do tecido. Quando um líquido é derramado sobre um sofá impermeabilizado, fica na superfície em forma de gotas (efeito lotus) em vez de ser absorvido pelas fibras. Protege contra vinho, café, sumos, gordura e urina de animais. Existem duas versões: a Essencial (à base de água), com efeito de 1 a 2 anos, e a Premium (à base de diluente, mais resistente ao desgaste), com efeito até 10 anos.",
    example: "Família com crianças pequenas impermeabiliza o sofá de microfibra após a limpeza. Quando o filho derrama sumo de laranja, basta limpar com um pano, sem mancha.",
    serviceLink: { label: "Impermeabilização de Estofos", to: "/impermeabilizacao" },
  },
  {
    id: "extracao-vapor-estofos",
    term: "Extração a Vapor de Estofos",
    definition: "Técnica profissional que combina injeção de vapor de água a alta pressão (até 8 bar) com aspiração simultânea. O vapor penetra nas fibras, solta a sujidade orgânica e mata microrganismos a temperaturas acima de 60ºC, letal para ácaros, bactérias e fungos. A aspiração remove imediatamente os resíduos e 80 a 90% da humidade, deixando o tecido levemente húmido e com tempo de secagem de 3 a 6 horas. É o método de referência para estofos de tecido porque limpa e higieniza em simultâneo sem produtos químicos agressivos.",
    example: "Sofá de microfibra com 3 anos de uso intensivo em casa com cão. Após extração a vapor, fibras recuperam cor original, odor a animal eliminado e o dono nota redução imediata de espirros.",
    serviceLink: { label: "Limpeza de Sofás por Extração", to: "/limpeza-sofas" },
  },
  {
    id: "shampoo-estofos",
    term: "Shampoo de Estofos",
    definition: "Produto detergente específico para tecidos estofados, formulado para penetrar nas fibras e emulsionar sujidade orgânica (gordura, suor, manchas proteicas). É aplicado em espuma para minimizar a quantidade de água utilizada, fundamental para evitar a deformação das almofadas. Diferente do shampoo de tapetes, que é mais agressivo. Requer aspiração para remoção completa após aplicação.",
    example: "Sofá de microfibra com manchas de suor no encosto e assento. Aplicação de shampoo de estofos em espuma, seguida de extração a vapor, remove a sujidade acumulada sem ensopar.",
  },
  {
    id: "limpeza-seco-sofa",
    term: "Limpeza a Seco de Sofá",
    definition: "Método de limpeza que utiliza solventes ou compostos em pó (sem água ou com humidade mínima inferior a 5%) para dissolver e remover sujidade das fibras. Indicado para tecidos que não toleram humidade: alcântara, veludo de seda, alguns tipos de linho e estofos com enchimentos que deformam com água. O processo aplica o produto, deixa agir 10 a 15 minutos e aspira ou escova. O anti-ácaros não está incluído na limpeza a seco e pode ser avaliado como tratamento complementar opcional.",
    example: "Sofá de alcântara creme com manchas de café. Limpeza a seco com solvente neutro: manchas removidas sem qualquer risco de marcas de humidade ou deformação do tecido.",
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
    example: "Sofá de microsuede cinza com manchas de café. Limpeza a vapor a temperatura moderada com produto neutro: resultado excelente, cor uniforme restaurada.",
  },
  {
    id: "alcantara-sintetica-natural",
    term: "Alcântara Sintética vs Natural",
    definition: "Alcântara natural (também chamada Alcantara®) é uma marca registada italiana feita de poliéster e poliuretano, com textura ultra-macia. Alcântara sintética genérica é uma imitação de menor qualidade. Ambas exigem limpeza especializada: nunca vapor a alta pressão, nunca produtos com álcool. A limpeza a seco com escova profissional é a técnica preferida. O couro Alcantara® tem tratamento anti-mancha de fábrica que é parcialmente restaurável.",
    example: "Sofá de alcântara sintética cinza-escuro com manchas de gordura. Limpeza a seco com produto específico e escova suave: manchas removidas sem alteração da textura.",
    serviceLink: { label: "Limpeza de Sofás por Material", to: "/limpeza-sofas" },
  },
  {
    id: "veludo-terciopelo-cuidados",
    term: "Veludo e Terciopelo: Cuidados Especiais",
    definition: "Veludo tem pelo curto e denso que cria reflexo luminoso característico. Terciopelo é um tipo de veludo com pelo mais longo. Ambos são extremamente sensíveis ao atrito: esfregar contra o pelo cria marcas permanentes e brilho irregular. A limpeza profissional usa escova de pelos macios na direção correta do pelo, seguida de extração controlada. Nunca usar vapor direto a alta pressão.",
    example: "Sofá de veludo azul petróleo com marcas de uso no assento. Limpeza com escova especializada: as fibras ficam alinhadas e o aspeto premium é restaurado.",
    serviceLink: { label: "Limpeza Especializada de Veludo", to: "/limpeza-sofas" },
  },
  {
    id: "couro-pu-ecologico",
    term: "Couro PU (Ecológico / Sintético)",
    definition: "Couro PU (polyuretano) é um revestimento sintético que imita o couro genuíno a menor custo. É composto por uma base têxtil revestida de poliuretano. Principal fraqueza: o revestimento descasca com o tempo, especialmente em zonas de maior atrito. Não existe tratamento que reverta o descascamento avançado, mas a limpeza correta retarda o processo. Nunca usar vapor de alta pressão ou produtos com solventes.",
    example: "Sofá de couro PU Conforama com início de descascamento nas costuras. Limpeza suave com produto específico e condicionador de PU: processo estabilizado e aspeto melhorado.",
  },
  {
    id: "manchas-proteicas-oleosas",
    term: "Manchas Proteicas vs Manchas Oleosas",
    definition: "Dois tipos com tratamento completamente diferente. Manchas proteicas (sangue, leite, ovo, urina, vómito) são de origem orgânica e requerem tratamento enzimático: as enzimas quebram as proteínas para fácil remoção. Usar calor (vapor) antes do tratamento enzimático 'coze' a proteína e fixa a mancha permanentemente. Manchas oleosas (gordura, manteiga, maquilhagem) requerem desengordurante de base aquosa antes do vapor.",
    example: "Mancha de sangue fresco: primeiro tratar com produto enzimático frio, depois vapor. Mancha de sangue seco tratada com vapor logo de início: impossível de remover completamente.",
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
    definition: "Processo de eliminação de odores persistentes (cigarro, animais, humidade, suor) dos estofos. Existem dois níveis: desodorização de superfície (produtos que mascaram o odor, temporário) e desodorização profunda (ozono ou enzimas que destroem as moléculas responsáveis pelo odor, permanente). A Kyro Clean usa técnica enzimática de desodorização profunda, eficaz em mais de 90% dos casos.",
    example: "Casa de fumador com sofás impregnados de odor a tabaco. Após desodorização enzimática profissional, odor eliminado em 24-48 horas, não apenas mascarado.",
    serviceLink: { label: "Limpeza e Desodorização", to: "/limpeza-sofas" },
  },
  {
    id: "tapete-vs-alcatifa",
    term: "Tapete vs Alcatifa: Diferença e Limpeza",
    definition: "Tapete é uma peça solta com dimensões definidas que pode ser movida e transportada. Inclui tapetes de sala, quarto, persas, kilim e sisal. Alcatifa é um revestimento de piso fixo ou semi-fixo que cobre toda a área de uma divisão e não é removível sem intervenção. Do ponto de vista de limpeza, a distinção é técnica: tapetes avulsos podem ser limpos ao domicílio por extração a vapor ou recolhidos para lavagem nas instalações, acedendo ao anverso e reverso. Alcatifas são sempre tratadas no local por extração a vapor sem remoção. Tapetes e alcatifas são sempre sob orçamento, mediante a largura e o comprimento de cada peça ou área e a avaliação do seu estado.",
    example: "Tapete persa de 6 m² na sala de jantar: tratado ao domicílio por extração. Alcatifa de quarto de 15 m²: limpa no local sem qualquer remoção, com equipamento profissional transportado pelo técnico.",
    serviceLink: { label: "Limpeza de Tapetes e Alcatifas", to: "/limpeza-tapetes" },
  },
  {
    id: "limpeza-estofos-exterior",
    term: "Limpeza de Estofos de Exterior",
    definition: "Sofás, cadeiras e espreguiçadeiras de exterior (terraço, jardim, piscina) têm tecidos específicos resistentes à humidade e UV (olefin, acrílico, textilene, sling). Estes materiais são mais resistentes à água mas acumulam algas, fungos, terra e gordura solar. A limpeza usa produtos adequados a tecidos outdoor e tem secagem média de 3 a 6 horas, dependendo da ventilação, do tecido e das condições do espaço. Em Portugal, a limpeza sazonal (primavera/outono) é recomendada.",
    example: "Conjunto de garden lounge com cushions de olefin no Porto. Após inverno: manchas verdes de algas e terra. Limpeza com produto específico outdoor: resultado impecável para o verão.",
    serviceLink: { label: "Limpeza de Tapetes e Exterior", to: "/limpeza-tapetes" },
  },
];
