// 100 termos revistos em 21/09/2026; identificadores preservados para ligações existentes.
// Fonte partilhada entre React, HTML inicial e DefinedTermSet.
export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  example?: string;
  source?: { label: string; url: string };
  serviceLink?: { label: string; to: string };
}
export const glossaryTerms: GlossaryTerm[] = [
  {
    "id": "higienizacao-vs-limpeza-vs-lavagem",
    "term": "Higienização vs Limpeza vs Lavagem",
    "definition": "Na Kyro, limpeza, lavagem e higienização referem-se à remoção de sujidade pelo método adequado à peça. Os nomes não incluem automaticamente anti-ácaros ou desbacterização. Os tratamentos opcionais são identificados no orçamento.",
    "serviceLink": {
      "label": "Limpeza e Higienização de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "impermeabilizacao-sofa",
    "term": "Impermeabilização de Sofá",
    "definition": "Proteção que ajuda a reduzir a absorção de líquidos em tecidos compatíveis. É aplicada em sofás e cadeiras nas condições de limpeza e secagem exigidas pelo produto. Essencial e Premium têm condições de duração diferentes. Nenhuma dispensa absorver derrames rapidamente nem impede todas as manchas.",
    "serviceLink": {
      "label": "Impermeabilização de Estofos",
      "to": "/impermeabilizacao"
    }
  },
  {
    "id": "extracao-vapor-estofos",
    "term": "Injeção e Extração de Estofos",
    "definition": "A injeção e extração aplica solução e aspira líquido com resíduos. Não é sinónimo de aplicar vapor: um vaporizador pode não recolher o líquido. O método depende do material e não inclui automaticamente desinfeção. A peça precisa de secar antes de voltar a ser utilizada.",
    "serviceLink": {
      "label": "Limpeza de Sofás por Extração",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "shampoo-estofos",
    "term": "Shampoo de Estofos",
    "definition": "Detergente formulado para determinados revestimentos e tipos de sujidade. A escolha, diluição, aplicação e remoção seguem o produto e a compatibilidade da peça. Não é intercambiável com detergente da roupa ou da loiça."
  },
  {
    "id": "limpeza-seco-sofa",
    "term": "Limpeza a Seco de Sofá",
    "definition": "Designação de métodos que evitam ou limitam o uso de água, consoante o sistema. Não significa que qualquer tecido delicado aceite solventes ou pós. A disponibilidade do método adequado à peça tem de ser confirmada, antes de contratar.",
    "serviceLink": {
      "label": "Limpeza Especializada por Material",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "tratamento-anti-acaros",
    "term": "Tratamento Anti-ácaros",
    "definition": "Tratamento opcional dirigido a ácaros, sujeito à compatibilidade do artigo e às instruções do produto. É escolhido e orçamentado separadamente da limpeza. Não prometemos eliminação total nem tratamento de alergias ou asma.",
    "serviceLink": {
      "label": "Avaliar tratamento anti-ácaros",
      "to": "/tratamento-anti-acaros"
    },
    "source": {
      "label": "SPAIC: ácaros e cuidados",
      "url": "https://www.spaic.pt/perguntas-frequentes?id=13"
    }
  },
  {
    "id": "ph-neutro-tecidos",
    "term": "pH Neutro em Limpeza de Tecidos",
    "definition": "O pH ajuda a caracterizar a acidez ou basicidade de uma solução. Um produto próximo do neutro não é automaticamente adequado a todos os tecidos: composição, corantes e acabamento também condicionam a escolha."
  },
  {
    "id": "tecido-microsuede",
    "term": "Tecido Microsuede (Microfibra de Camurça)",
    "definition": "Revestimento de microfibras com aspeto semelhante à camurça. O nome comercial não determina sozinho a composição ou a resistência à limpeza. É necessário consultar a etiqueta e verificar a resposta da cor e textura."
  },
  {
    "id": "alcantara-sintetica-natural",
    "term": "Alcantara® e materiais de aspeto semelhante",
    "definition": "Alcantara® é um material sintético de poliéster e poliuretano, não couro nem uma fibra natural. Outros materiais de toque semelhante podem ter composição diferente. Siga as instruções do fabricante da peça e não deduza o método apenas pelo aspeto.",
    "serviceLink": {
      "label": "Limpeza de Sofás por Material",
      "to": "/limpeza-sofas"
    },
    "source": {
      "label": "Alcantara: material e manutenção",
      "url": "https://www.alcantara.com/the-material/"
    }
  },
  {
    "id": "veludo-terciopelo-cuidados",
    "term": "Veludo e Terciopelo: Cuidados Especiais",
    "definition": "Veludo descreve uma estrutura de pelo que pode usar fibras diferentes. Terciopelo é a palavra espanhola para veludo, não uma classificação de comprimento do pelo. A orientação do pelo afeta o brilho; a composição e o acabamento determinam os cuidados.",
    "serviceLink": {
      "label": "Limpeza Especializada de Veludo",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "couro-pu-ecologico",
    "term": "Revestimento de Poliuretano (PU)",
    "definition": "Revestimento com poliuretano que pode imitar o aspeto do couro. A designação não comprova, por si só, uma vantagem ambiental. Descascamento ou degradação da camada não são resolvidos pela limpeza e devem ser identificados antes da intervenção."
  },
  {
    "id": "manchas-proteicas-oleosas",
    "term": "Manchas Proteicas vs Manchas Oleosas",
    "definition": "A composição da sujidade ajuda a escolher o tratamento. Sangue ou leite podem conter proteínas; óleos e gorduras pedem outra avaliação. Não existe uma receita única por mancha: o material, o tempo e os produtos já usados também contam."
  },
  {
    "id": "fungos-bolor-estofos",
    "term": "Fungos e Bolor em Estofos",
    "definition": "Bolor visível ou odor a humidade exige avaliação da peça e da origem da humidade. Não tratamos bolor como uma nódoa comum nem prometemos recuperação com fungicida ou vapor. A intervenção pode ser insuficiente se o problema atingir zonas internas ou continuar a haver humidade.",
    "source": {
      "label": "OMS: humidade e bolor",
      "url": "https://www.who.int/publications/i/item/9789289041683"
    }
  },
  {
    "id": "desodorizacao-estofos",
    "term": "Desodorização de Estofos",
    "definition": "Intervenção dirigida à origem de um odor, em vez de apenas o perfumar. O resultado depende de os resíduos estarem acessíveis no tecido ou terem atingido espuma, base ou estrutura. A eliminação total do cheiro não é garantida.",
    "serviceLink": {
      "label": "Limpeza e Desodorização",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "tapete-vs-alcatifa",
    "term": "Tapete vs Alcatifa: Diferença e Limpeza",
    "definition": "Tapete é uma peça solta; alcatifa é um revestimento de piso instalado numa área. Ambos são sempre sob orçamento, com largura e comprimento e avaliação do material, base e estado. Recolha e entrega não são anunciadas como serviço geral.",
    "serviceLink": {
      "label": "Limpeza de Tapetes e Alcatifas",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "limpeza-estofos-exterior",
    "term": "Limpeza de Estofos de Exterior",
    "definition": "Avaliação de almofadas e revestimentos usados no exterior. A exposição à chuva ou ao sol não significa que possam receber qualquer produto ou pressão de água. Identifique a composição e confirme o serviço adequado à peça.",
    "serviceLink": {
      "label": "Consultar serviços",
      "to": "/#servicos"
    }
  },
  {
    "id": "codigos-limpeza-tecido",
    "term": "Códigos de Limpeza do Tecido (W, S, WS, X)",
    "definition": "Algumas etiquetas usam W para produtos à base de água, S para solventes, WS para ambas as categorias compatíveis e X para aspiração ou cuidados secos indicados. Estes códigos não substituem as instruções completas do fabricante nem autorizam lavar capas na máquina.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "browning-celulosico",
    "term": "Browning Celulósico (Manchas Castanhas Depois da Limpeza)",
    "definition": "Alteração acastanhada que pode surgir em materiais com componentes celulósicos durante a secagem. Deve ser distinguida de sujidade, corantes ou outras alterações. A prevenção e a correção dependem da composição e do método, sem promessa universal de reversão.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "wicking-sujidade-que-volta",
    "term": "Wicking (a Sujidade que Volta a Aparecer ao Secar)",
    "definition": "Migração de resíduos de camadas inferiores para a superfície durante a secagem, podendo fazer reaparecer uma marca. Repetir produtos à superfície pode não resolver a origem. É necessário avaliar a profundidade e o acesso aos resíduos.",
    "serviceLink": {
      "label": "Limpeza de Alcatifas",
      "to": "/limpeza-alcatifas"
    }
  },
  {
    "id": "sobremolhagem",
    "term": "Sobremolhagem (Over-wetting)",
    "definition": "Humidade excessiva aplicada ou retida numa peça durante a limpeza. Pode dificultar a secagem e afetar o revestimento, base ou enchimento. A quantidade de solução e a extração devem ser ajustadas à compatibilidade do artigo.",
    "serviceLink": {
      "label": "Limpeza de Colchões",
      "to": "/limpeza-colchoes"
    }
  },
  {
    "id": "encolhimento-la",
    "term": "Encolhimento de Lã",
    "definition": "Alteração dimensional que pode ocorrer em peças de lã, influenciada pela construção, humidade, temperatura e ação mecânica. A limpeza não garante recuperar a dimensão original. Evite escolher um método apenas por a peça parecer resistente.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "teste-solidez-cor",
    "term": "Teste de Solidez da Cor",
    "definition": "Verificação discreta da resposta do corante ao método previsto. Ajuda a identificar transferência ou alteração de cor, mas não elimina todos os riscos. Se a cor não for estável, é necessário rever o método ou não avançar.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "pre-tratamento",
    "term": "Pré-tratamento",
    "definition": "Aplicação de produto adequado antes da extração, dirigida à sujidade identificada. Nas limpezas compatíveis, segue-se escovagem ajustada à fibra e extração. O pré-tratamento não garante a remoção de todas as manchas.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "tempo-de-atuacao",
    "term": "Tempo de Atuação (Dwell Time)",
    "definition": "Período em que o produto atua antes da etapa seguinte. É definido pelas instruções de utilização e pela compatibilidade do revestimento. Mais tempo não significa sempre melhor resultado, e não se deve improvisar a concentração ou deixar o produto secar sem indicação.",
    "serviceLink": {
      "label": "Limpeza de Colchões",
      "to": "/limpeza-colchoes"
    }
  },
  {
    "id": "tratamento-enzimatico",
    "term": "Tratamento Enzimático",
    "definition": "Utilização de produtos com enzimas que atuam sobre componentes específicos da sujidade. O desempenho depende da formulação, das condições de aplicação e do acesso aos resíduos. Não é solução garantida para todo o odor nem está automaticamente incluído em qualquer serviço.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "acido-urico",
    "term": "Ácido Úrico e Resíduos de Urina",
    "definition": "Composto que pode integrar os resíduos de urina. Um odor persistente não permite identificar um único composto nem o método necessário. O tratamento depende do conjunto de resíduos, dos produtos já aplicados e de até onde o líquido chegou.",
    "serviceLink": {
      "label": "Limpeza de Colchões",
      "to": "/limpeza-colchoes"
    }
  },
  {
    "id": "agente-oxidante",
    "term": "Agente Oxidante",
    "definition": "Substância que pode alterar componentes de uma mancha por oxidação. Também pode afetar os corantes e o revestimento. A utilização requer compatibilidade e controlo; não é uma recomendação para aplicar produtos domésticos diretamente no estofo.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "ph-enxaguamento-acido",
    "term": "pH e Enxaguamento Ácido",
    "definition": "Alguns processos utilizam produtos de enxaguamento para gerir resíduos e condições químicas após a limpeza. A escolha depende da formulação e do material. Não significa que todos os detergentes sejam alcalinos ou que qualquer limpeza deva terminar com ácido.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "iicrc-normas",
    "term": "IICRC (Normas S100 e S300)",
    "definition": "A IICRC publica referências técnicas de limpeza. A S100 aborda revestimentos têxteis de piso, incluindo tapetes e alcatifas; a S300 aborda estofos. Mencionar estas referências não significa que a Kyro tenha certificação IICRC.",
    "source": {
      "label": "IICRC: catálogo de normas",
      "url": "https://iicrc.org/iicrcstandards/"
    }
  },
  {
    "id": "alergenio-der-p1",
    "term": "Der p 1 (o Alergénio do Ácaro)",
    "definition": "Designação de um alergénio associado a uma espécie de ácaro do pó. Ácaros e alergénios não são a mesma coisa. A escolha de medidas perante alergias exige orientação clínica e não pode ser substituída por uma promessa de limpeza.",
    "serviceLink": {
      "label": "Tratamento Anti-Ácaros",
      "to": "/tratamento-anti-acaros"
    },
    "source": {
      "label": "SPAIC: ácaros e cuidados",
      "url": "https://www.spaic.pt/perguntas-frequentes?id=13"
    }
  },
  {
    "id": "filtro-hepa",
    "term": "Filtro HEPA",
    "definition": "Tipo de filtro destinado a reter partículas finas. O desempenho depende da classe do filtro, do equipamento e da sua manutenção. A presença de um filtro não permite prometer melhoria clínica nem diagnosticar a causa de sintomas.",
    "serviceLink": {
      "label": "Tratamento Anti-Ácaros",
      "to": "/tratamento-anti-acaros"
    },
    "source": {
      "label": "SPAIC: ácaros e cuidados",
      "url": "https://www.spaic.pt/perguntas-frequentes?id=13"
    }
  },
  {
    "id": "tempo-secagem-humidade",
    "term": "Tempo de Secagem e Humidade Relativa",
    "definition": "A secagem depende da humidade retida, da ventilação, do revestimento e das condições do espaço. Na limpeza Kyro, a média comunicada é de 3 a 6 horas. A utilização deve esperar pela secagem completa, mesmo que demore mais.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "reaplicacao-protetor",
    "term": "Reaplicação do Protetor de Tecido",
    "definition": "Nova aplicação de proteção após avaliação do estado do revestimento e do produto existente. O desgaste e os cuidados podem afetar a duração. Confirme as condições Essencial ou Premium antes de decidir reaplicar; uma lavagem não é uma medição exata da proteção restante.",
    "serviceLink": {
      "label": "Impermeabilização",
      "to": "/impermeabilizacao"
    }
  },
  {
    "id": "efeito-lotus",
    "term": "Efeito Lotus",
    "definition": "Formação de gotas à superfície de um material com comportamento repelente à água. Não demonstra resistência a todas as substâncias nem proteção ilimitada. Não teste uma peça com líquidos sem respeitar o período de cura e as instruções recebidas.",
    "serviceLink": {
      "label": "Impermeabilização",
      "to": "/impermeabilizacao"
    }
  },
  {
    "id": "fibra-natural-vs-sintetica",
    "term": "Fibra Natural vs Fibra Sintética",
    "definition": "Fibras naturais incluem lã, algodão e seda; fibras sintéticas incluem poliéster e poliamida. A origem ajuda a caracterizar o tecido, mas não decide tudo: misturas, corantes, acabamentos, bases e enchimentos também condicionam a limpeza.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "algodao-estofos",
    "term": "Algodão em Estofos",
    "definition": "Fibra natural utilizada em tecidos e capas de estofos. Pode ser misturada com outras fibras. Verifique instruções de lavagem, estabilidade da cor e risco de alteração dimensional, sem assumir que uma capa removível admite máquina.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "linho-estofos",
    "term": "Linho em Estofos",
    "definition": "Fibra natural utilizada em revestimentos com diferentes construções e acabamentos. Humidade, produtos e atrito podem alterar o aspeto. A escolha do método exige etiqueta e avaliação, não uma regra automática de água ou solvente.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "viscose-rayon",
    "term": "Viscose (Rayon)",
    "definition": "Fibra de celulose regenerada, presente em tecidos e tapetes. A humidade pode afetar resistência e aspeto. Peças delicadas exigem avaliação própria e podem não admitir a limpeza húmida proposta.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "poliester-estofos",
    "term": "Poliéster",
    "definition": "Fibra sintética comum em estofos, também usada em misturas. A composição não garante que a peça completa resista a calor ou a qualquer produto. Acabamento, corantes e base continuam a ser avaliados antes de limpar.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "nylon-poliamida",
    "term": "Nylon (Poliamida)",
    "definition": "Família de fibras sintéticas usada, entre outros artigos, em alcatifas. A resistência ao uso varia com a construção e o acabamento. A limpeza deve considerar manchas, estabilidade da cor e instruções do revestimento.",
    "serviceLink": {
      "label": "Limpeza de Alcatifas",
      "to": "/limpeza-alcatifas"
    }
  },
  {
    "id": "acrilico-estofos",
    "term": "Acrílico",
    "definition": "Fibra sintética presente em têxteis de interior e exterior. A resposta à luz, ao atrito e à limpeza depende da formulação e construção da peça. Consulte a etiqueta em vez de extrapolar a partir de outro tecido acrílico.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "olefina-polipropileno",
    "term": "Olefina (Polipropileno)",
    "definition": "Fibra sintética utilizada em tapetes, alcatifas e alguns revestimentos. A compatibilidade com água não autoriza calor ou atrito excessivos. A base e a instalação também precisam de avaliação.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "chenille-tecido",
    "term": "Chenille",
    "definition": "Tecido com fios de aspeto felpudo. A orientação do pelo pode criar diferenças de brilho que parecem manchas. A composição e o estado dos fios determinam os cuidados, incluindo a possibilidade e intensidade de escovagem.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "boucle-tecido",
    "term": "Bouclé",
    "definition": "Tecido com laçadas em relevo, onde podem ficar presos pó e resíduos. Escovas agressivas podem puxar fios. A limpeza não reconstitui laçadas danificadas e deve respeitar a construção e composição.",
    "serviceLink": {
      "label": "Limpeza de Cadeiras",
      "to": "/limpeza-cadeiras"
    }
  },
  {
    "id": "couro-anilina-pigmentado",
    "term": "Couro Anilina, Semianilina e Pigmentado",
    "definition": "Acabamentos de couro com diferentes níveis de cobertura e proteção superficial. O aspeto não basta para escolher um produto. O estado do acabamento deve ser avaliado, e a limpeza não inclui reparação de fissuras ou repigmentação.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "sisal-fibras-vegetais",
    "term": "Sisal, Coco e Fibras Vegetais",
    "definition": "Revestimentos de fibras vegetais como sisal e coco podem ser sensíveis à água e sofrer alterações de aspeto ou dimensão. Não seguem automaticamente limpeza húmida ou escovagem forte. É necessário confirmar composição e método.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "juta-base-tapete",
    "term": "Juta (Base do Tapete)",
    "definition": "A juta pode integrar a superfície ou a base de um tapete. A sua presença importa mesmo quando o pelo parece sintético. Humidade e método inadequados podem afetar a peça; a limpeza com água não deve ser assumida.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "seda-tapetes",
    "term": "Seda em Tapetes",
    "definition": "Fibra delicada presente em alguns tapetes, isolada ou em mistura. Corantes, construção e estado condicionam a intervenção. Seda não segue automaticamente limpeza com água nem escovagem forte; confirme o método antes de contratar.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "la-tapetes",
    "term": "Lã em Tapetes",
    "definition": "Fibra natural utilizada em tapetes com construções muito diferentes. A resposta à humidade, temperatura e ação mecânica deve ser avaliada. O nome lã, por si só, não garante compatibilidade com um método de extração.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "trama-urdidura",
    "term": "Trama e Urdidura",
    "definition": "Conjuntos de fios que se cruzam na construção de um tecido. A sua estabilidade influencia a forma e dimensão da peça. Numa avaliação de tapetes, a estrutura deve ser considerada em conjunto com o pelo e a base.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "franjas-tapete",
    "term": "Franjas do Tapete",
    "definition": "Acabamento que, nalguns tapetes, faz parte da própria estrutura de fios. Pode exigir tratamento separado e delicado. Evite puxar, escovar com força ou assumir que uma franja danificada pode ser reparada pela limpeza.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "tufting-tapete",
    "term": "Tufting",
    "definition": "Construção em que tufos de fio são inseridos numa base. A fixação e as camadas de suporte variam. A avaliação deve considerar a estabilidade do conjunto, não apenas a resistência do pelo visível.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "kilim",
    "term": "Kilim",
    "definition": "Tapete de tecelagem plana, geralmente sem pelo. A composição e a estabilidade das cores condicionam o método de limpeza. Padrões contrastantes exigem atenção à eventual transferência de cor; não se deve presumir que a peça aceita lavagem doméstica.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "delaminacao",
    "term": "Delaminação",
    "definition": "Separação entre camadas de um revestimento. Pode estar relacionada com degradação, humidade ou outras condições da peça. É um problema estrutural, não sujidade, e não se resolve simplesmente com mais limpeza.",
    "serviceLink": {
      "label": "Limpeza de Alcatifas",
      "to": "/limpeza-alcatifas"
    }
  },
  {
    "id": "filtration-soiling",
    "term": "Linhas Pretas junto ao Rodapé (Filtration Soiling)",
    "definition": "Acumulação de partículas finas em zonas onde o ar atravessa ou contorna a alcatifa, por exemplo junto a frestas. Pode originar linhas escuras difíceis de tratar. O resultado e a recorrência dependem da origem e do estado das fibras.",
    "serviceLink": {
      "label": "Limpeza de Alcatifas",
      "to": "/limpeza-alcatifas"
    }
  },
  {
    "id": "corredor-de-passagem",
    "term": "Corredor de Passagem (Traffic Lane)",
    "definition": "Zona que recebe circulação frequente num tapete ou alcatifa. Pode apresentar simultaneamente sujidade e desgaste. A limpeza pode remover resíduos sem eliminar a diferença de aspeto causada por fibras gastas.",
    "serviceLink": {
      "label": "Limpeza de Alcatifas",
      "to": "/limpeza-alcatifas"
    }
  },
  {
    "id": "capa-removivel-maquina",
    "term": "Capa Removível: Lavar na Máquina?",
    "definition": "Uma capa removível só deve ser lavada na máquina se a etiqueta o permitir. Respeite temperatura, secagem e montagem indicadas pelo fabricante. Não vista uma almofada com capa húmida sem instrução expressa adequada à peça.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "encapsulacao",
    "term": "Encapsulação",
    "definition": "Método em que um produto ajuda a aglomerar resíduos para posterior remoção, geralmente por aspiração após secagem. A adequação depende do sistema e do revestimento. A definição não implica que este método esteja disponível em qualquer pedido Kyro.",
    "serviceLink": {
      "label": "Limpeza de Alcatifas",
      "to": "/limpeza-alcatifas"
    }
  },
  {
    "id": "bonnet-cleaning",
    "term": "Bonnet Cleaning",
    "definition": "Método que utiliza um disco absorvente para recolher sujidade da superfície de um revestimento compatível. Tem limites de profundidade e de ação mecânica. A sua utilização deve ser confirmada para a peça e não é anunciada como método geral da Kyro.",
    "serviceLink": {
      "label": "Limpeza de Alcatifas",
      "to": "/limpeza-alcatifas"
    }
  },
  {
    "id": "agitacao-mecanica",
    "term": "Agitação Mecânica",
    "definition": "Ação física que ajuda a desprender sujidade, incluindo escovagem. Nas limpezas adequadas, ocorre após o tratamento e antes da extração. A escova e a pressão respeitam a fibra; uma peça delicada não deve receber mais força para compensar uma mancha difícil.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "circulo-de-sinner",
    "term": "Círculo de Sinner",
    "definition": "Modelo que relaciona química, tempo, temperatura e ação mecânica na limpeza. Ajuda a compreender o processo, mas não é uma equação que garanta resultados. A compatibilidade do material limita o que pode ser alterado.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "aspiracao-previa",
    "term": "Aspiração Prévia",
    "definition": "Remoção de resíduos soltos antes de aplicar solução de limpeza, quando adequada à peça. Deve usar ferramentas e intensidade compatíveis com o revestimento. Não substitui a avaliação de manchas nem autoriza molhar o material em seguida.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "ferramenta-estofos",
    "term": "Ferramenta de Estofos",
    "definition": "Acessório de equipamento destinado ao trabalho em estofos. As funções dependem do modelo, podendo incluir aplicação e aspiração. A ferramenta, as passagens e a quantidade de solução são escolhidas para o material e a construção.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "pressao-de-trabalho",
    "term": "Pressão de Trabalho",
    "definition": "Pressão utilizada na aplicação de solução ou no funcionamento do equipamento. Um valor maior não significa melhor limpeza. A regulação depende do revestimento e da capacidade de controlar a humidade, sem uma pressão universal para todos os artigos.",
    "serviceLink": {
      "label": "Limpeza de Alcatifas",
      "to": "/limpeza-alcatifas"
    }
  },
  {
    "id": "vaporizador-domestico",
    "term": "Vaporizador Doméstico (Limitações)",
    "definition": "Equipamento que aplica vapor e pode não ter recolha de líquido. Não é equivalente a uma extratora. Antes de o utilizar, confirme se o revestimento e o fabricante permitem o método; o vapor não é adequado a todos os estofos.",
    "serviceLink": {
      "label": "Limpeza de Colchões",
      "to": "/limpeza-colchoes"
    }
  },
  {
    "id": "secagem-forcada",
    "term": "Secagem Forçada",
    "definition": "Utilização de meios de circulação de ar ou outros equipamentos adequados para apoiar a secagem. A disponibilidade e necessidade são confirmadas pela equipa. Não significa que todo o serviço inclua ar quente ou garanta um tempo exato.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "tensioativo",
    "term": "Tensioativo",
    "definition": "Componente que altera a tensão superficial e ajuda a solução a interagir com a sujidade. A formulação completa, a diluição e a remoção importam tanto como a presença deste ingrediente. Mais detergente não significa melhor resultado.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "solvente-limpeza-seco",
    "term": "Solvente",
    "definition": "Substância capaz de dissolver outras substâncias. Em limpeza a seco, o termo costuma referir-se a solventes não aquosos. A utilização exige compatibilidade, condições de aplicação e ventilação definidas pelo produto; não autoriza o uso doméstico improvisado.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "alcalinidade",
    "term": "Alcalinidade",
    "definition": "Capacidade de uma solução neutralizar ácidos, relacionada com a sua composição. Não é sinónimo exato de valor de pH. Na escolha de um detergente, avaliam-se ambos e a compatibilidade do material, sem assumir que maior alcalinidade melhora qualquer limpeza.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "quelante",
    "term": "Quelante (Agente Sequestrante)",
    "definition": "Ingrediente que se liga a determinados iões metálicos, podendo ajudar uma formulação a lidar com componentes da água ou resíduos. Não é um tratamento universal para manchas e não deve ser adicionado por iniciativa própria a uma solução.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "corante-vs-pigmento",
    "term": "Nódoa de Corante vs Nódoa de Pigmento",
    "definition": "Corantes e pigmentos têm comportamentos diferentes, mas a origem da mancha pode envolver vários componentes. O tratamento depende também da fibra e dos produtos já aplicados. Não se escolhe um oxidante apenas pela cor da nódoa.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "enzimas-tipos",
    "term": "Protease, Lipase e Amilase",
    "definition": "Proteases, lipases e amilases atuam sobre classes diferentes de substâncias, como proteínas, gorduras e amido. A eficácia depende da formulação e condições de utilização. Não existe uma enzima que resolva qualquer mancha ou odor.",
    "serviceLink": {
      "label": "Limpeza de Colchões",
      "to": "/limpeza-colchoes"
    }
  },
  {
    "id": "residuo-de-produto",
    "term": "Resíduo de Produto",
    "definition": "Material que permanece na peça após a aplicação de um produto. Pode afetar toque ou aspeto e dificultar intervenções posteriores. A remoção necessária deve seguir o sistema utilizado; informe sempre a equipa dos detergentes já aplicados.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "aureola-anel-agua",
    "term": "Auréola (Anel de Água)",
    "definition": "Marca com contorno visível em torno de uma zona molhada ou tratada. Pode envolver migração de resíduos ou alterações do revestimento. Molhar uma área maior sem avaliação pode agravar o problema.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "migracao-corante",
    "term": "Migração de Corante (Dye Bleed)",
    "definition": "Transferência de cor de uma zona para outra ou para um pano durante o tratamento. A estabilidade do corante é avaliada antes de intervir. Uma transferência pode ser difícil ou impossível de corrigir e não deve ser confundida com sujidade.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "pilling",
    "term": "Pilling (Bolinhas no Tecido)",
    "definition": "Bolinhas formadas por fibras à superfície devido ao uso e atrito. Não são sujidade e a limpeza não garante a sua remoção. Qualquer tratamento mecânico de remoção deve ser compatível com o tecido.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "desbotamento-uv",
    "term": "Desbotamento por Sol (UV)",
    "definition": "Perda ou alteração de cor por exposição à luz. Pode tornar-se evidente ao comparar áreas expostas e protegidas. Limpar não repõe cor perdida, embora a remoção de sujidade possa alterar a perceção do conjunto.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "amarelecimento",
    "term": "Amarelecimento",
    "definition": "Alteração de tom com várias causas possíveis, incluindo envelhecimento, produtos ou resíduos. A resposta à limpeza depende da origem. Não se deve prometer recuperar o branco original antes de avaliar.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "acaro-do-po",
    "term": "Ácaro do Pó Doméstico",
    "definition": "Animal microscópico que pode existir no pó e em têxteis domésticos. A sua presença não é confirmada pelo aspeto de uma mancha. Questões de alergia devem ser avaliadas clinicamente; limpeza e tratamentos de estofos não são cuidados médicos.",
    "serviceLink": {
      "label": "Tratamento Anti-Ácaros",
      "to": "/tratamento-anti-acaros"
    },
    "source": {
      "label": "SPAIC: ácaros e cuidados",
      "url": "https://www.spaic.pt/perguntas-frequentes?id=13"
    }
  },
  {
    "id": "humidade-relativa-interior",
    "term": "Humidade Relativa Interior",
    "definition": "Relação entre o vapor de água presente no ar e a saturação à mesma temperatura. Influencia a secagem dos estofos. Humidade persistente exige atenção à sua origem, sobretudo quando há bolor; uma limpeza de superfície não resolve infiltrações.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    },
    "source": {
      "label": "OMS: humidade e bolor",
      "url": "https://www.who.int/publications/i/item/9789289041683"
    }
  },
  {
    "id": "capa-anti-acaros",
    "term": "Capa Anti-Ácaros",
    "definition": "Cobertura concebida para funcionar como barreira física, conforme as características do produto. Não é equivalente a um tratamento de limpeza. A escolha perante alergias deve seguir orientação adequada, e a lavagem respeita as instruções do fabricante.",
    "serviceLink": {
      "label": "Limpeza de Colchões",
      "to": "/limpeza-colchoes"
    },
    "source": {
      "label": "SPAIC: ácaros e cuidados",
      "url": "https://www.spaic.pt/perguntas-frequentes?id=13"
    }
  },
  {
    "id": "desbacterizacao",
    "term": "Desbacterização",
    "definition": "Tratamento opcional com objetivo próprio, distinto da remoção normal de sujidade. Produto, compatibilidade, condições de aplicação e preço são confirmados no orçamento. Não representa garantia de esterilidade nem tratamento clínico.",
    "serviceLink": {
      "label": "Desbacterização",
      "to": "/desbacterizacao"
    }
  },
  {
    "id": "colchao-face-rotacao",
    "term": "Rotação e Faces do Colchão",
    "definition": "Rotação e utilização das faces dependem do modelo do colchão. Alguns não podem ser virados. Na limpeza, indique as faces pretendidas e confirme o âmbito do orçamento, sem assumir que todas as faces admitem o mesmo método.",
    "serviceLink": {
      "label": "Limpeza de Colchões",
      "to": "/limpeza-colchoes"
    }
  },
  {
    "id": "espuma-viscoelastica",
    "term": "Espuma Viscoelástica (Memory Foam)",
    "definition": "Espuma utilizada em camadas de conforto de colchões e outros artigos. A capa e o núcleo podem exigir cuidados diferentes. Humidade e resíduos no interior podem ser difíceis de remover; a compatibilidade deve ser confirmada antes da intervenção.",
    "serviceLink": {
      "label": "Limpeza de Colchões",
      "to": "/limpeza-colchoes"
    }
  },
  {
    "id": "cadeira-mesh",
    "term": "Cadeira de Rede (Mesh)",
    "definition": "Cadeira com uma ou mais zonas de malha tensionada. Encosto, assento e estrutura podem exigir cuidados distintos. Evite atrito que deforme a rede e confirme o âmbito do serviço para cada superfície.",
    "serviceLink": {
      "label": "Limpeza de Cadeiras",
      "to": "/limpeza-cadeiras"
    }
  },
  {
    "id": "hot-desking-higiene",
    "term": "Hot-desking e Higiene de Cadeiras",
    "definition": "Uso partilhado de postos de trabalho e cadeiras. A manutenção deve acompanhar o uso e o estado observados, com atenção aos assentos e apoios. Não define, por si só, um calendário obrigatório de limpeza ou desbacterização.",
    "serviceLink": {
      "label": "Limpeza de Cadeiras",
      "to": "/limpeza-cadeiras"
    }
  },
  {
    "id": "frequencia-limpeza-estofos",
    "term": "Frequência de Limpeza de Estofos",
    "definition": "Intervalo entre intervenções, ajustado ao uso, sujidade e instruções de manutenção da peça. Não existe um prazo universal. Derrames ou odores persistentes podem justificar avaliação antes da próxima visita planeada.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "manutencao-preventiva",
    "term": "Manutenção Preventiva",
    "definition": "Cuidados regulares compatíveis com a peça, como aspiração adequada e resposta a derrames. A rotação de almofadas ou lavagem de capas só se faz quando permitida. O objetivo é evitar acumulação de resíduos e preservar o revestimento.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "derrame-primeiros-minutos",
    "term": "Derrame: os Primeiros Minutos",
    "definition": "Absorva o excesso com pano branco limpo, sem esfregar nem espalhar. Consulte a etiqueta antes de aplicar líquidos ou detergentes. Uma resposta rápida ajuda, mas não garante remover totalmente a mancha.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "teste-zona-escondida",
    "term": "Teste em Zona Escondida",
    "definition": "Verificação do método numa zona discreta para observar resposta da cor, textura e acabamento. É uma medida de avaliação, não garantia de ausência de risco em toda a peça. Uma reação desfavorável exige rever ou interromper o procedimento.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "inspecao-previa",
    "term": "Inspeção Prévia",
    "definition": "Avaliação de composição, instruções, manchas, desgaste e acessos antes do trabalho. Serve para definir o método e explicar limites. Fotografias ajudam a preparar a visita, mas podem não mostrar o interior ou todos os danos.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "limite-do-servico",
    "term": "Limite do Serviço",
    "definition": "Condições que a limpeza não consegue corrigir, como desgaste, perda de cor ou dano estrutural. Devem ser explicadas antes de executar. Manchas preexistentes não excluem a garantia de repetição gratuita comunicada até 48 horas.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "orcamento-sob-medicao",
    "term": "Orçamento sob Medição",
    "definition": "Proposta que usa largura e comprimento, material, estado e condições de acesso para definir o serviço. Aplica-se sempre a tapetes e alcatifas, sem preço fixo por metro quadrado. Fotografias e medidas podem ajudar a preparar a confirmação.",
    "serviceLink": {
      "label": "Limpeza de Tapetes",
      "to": "/limpeza-tapetes"
    }
  },
  {
    "id": "servico-ao-domicilio",
    "term": "Serviço ao Domicílio",
    "definition": "Intervenção no local do cliente, com equipamento levado pela equipa. Acesso, água, eletricidade e espaço de trabalho são combinados previamente. A utilização posterior depende da secagem e das instruções dos produtos aplicados.",
    "serviceLink": {
      "label": "Limpeza de Sofás",
      "to": "/limpeza-sofas"
    }
  },
  {
    "id": "taxa-de-deslocacao",
    "term": "Taxa de Deslocação",
    "definition": "Valor apresentado à parte dos serviços, definido pela localidade e confirmado com a morada. Na Kyro começa em 10€. Não é uma promessa de deslocação incluída nem um cálculo automático por quilómetros.",
    "serviceLink": {
      "label": "Áreas de Serviço",
      "to": "/areas-de-servico"
    }
  },
  {
    "id": "antes-e-depois",
    "term": "Antes e Depois",
    "definition": "Comparação fotográfica de uma peça antes e depois de uma intervenção. Deve identificar corretamente o trabalho e permitir uma comparação honesta. Imagens ilustrativas não devem ser apresentadas como resultados reais.",
    "serviceLink": {
      "label": "Antes e Depois",
      "to": "/antes-depois-limpeza"
    }
  },
  {
    "id": "estofo-comercial-vs-domestico",
    "term": "Estofo Comercial vs Doméstico",
    "definition": "Designações ligadas ao uso previsto e às características da peça. Um revestimento comercial pode ter requisitos específicos de resistência e manutenção, mas não aceita automaticamente produtos mais fortes. Consulte as instruções de cada modelo.",
    "serviceLink": {
      "label": "Limpeza de Cadeiras",
      "to": "/limpeza-cadeiras"
    }
  },
  {
    "id": "ciclos-martindale",
    "term": "Ciclos Martindale",
    "definition": "Resultado de ensaio de resistência à abrasão de um tecido. Ajuda a comparar características dentro das condições do ensaio, mas não indica um número exato de anos de vida nem a compatibilidade com produtos de limpeza.",
    "serviceLink": {
      "label": "Limpeza de Cadeiras",
      "to": "/limpeza-cadeiras"
    }
  },
  {
    "id": "alcatifa-losetas",
    "term": "Alcatifa em Losetas",
    "definition": "Alcatifa composta por módulos, que podem permitir intervenção ou substituição localizada conforme a instalação. A limpeza é avaliada pelo material, base e estado. Substituir módulos não está incluído automaticamente no serviço.",
    "serviceLink": {
      "label": "Limpeza de Alcatifas",
      "to": "/limpeza-alcatifas"
    }
  },
  {
    "id": "compostos-organicos-volateis",
    "term": "Compostos Orgânicos Voláteis (COV)",
    "definition": "Substâncias que podem passar para o ar por evaporação nas condições do ambiente. As instruções dos produtos determinam ventilação e cuidados de utilização. Pouco cheiro não comprova, por si só, adequação ou ausência de risco.",
    "serviceLink": {
      "label": "Limpeza de Colchões",
      "to": "/limpeza-colchoes"
    }
  }
];
