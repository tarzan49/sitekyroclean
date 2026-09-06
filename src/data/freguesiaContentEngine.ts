// ─── Dynamic Content Engine ───────────────────────────────────────
// Generates unique, deterministic content for each freguesia × service page.
// All pools are SERVICE-SPECIFIC and all templates reference the parish (f) and city (c).

// ─── Hash / Seed ─────────────────────────────────────────────────

function getSeed(slug: string): number {
  return slug.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

/** Tapetes não têm preço fixo (2026-09-06, sempre "Sob orçamento") — os templates
 * partilhados por todos os serviços dizem sempre "desde {price}", o que fica
 * quebrado para tapetes ("desde Sob orçamento"). Esta função devolve a cláusula
 * "desde X" pronta a inserir, já adaptada quando não há preço numérico. */
function priceClause(price: string, capitalized = false): string {
  const clause = /^\d/.test(price) ? `desde ${price}` : 'com orçamento sempre à medida';
  return capitalized ? clause.charAt(0).toUpperCase() + clause.slice(1) : clause;
}

function pickN<T>(arr: readonly T[], seed: number, n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  let s = seed;
  const count = Math.min(n, arr.length); // fixed: use original length, not shrinking copy
  for (let i = 0; i < count; i++) {
    const idx = s % copy.length;
    result.push(copy.splice(idx, 1)[0]);
    s = s * 31 + 7;
  }
  return result;
}

// ─── Landmark Data ───────────────────────────────────────────────

export interface FreguesiaLocalData {
  landmarks: string[];
  localTip: string;
}

const freguesiaLocalData: Record<string, FreguesiaLocalData> = {
  "paranhos": { landmarks: ["Hospital de São João", "Universidade do Porto (Polo II)", "Parque da Cidade (zona norte)"], localTip: "Zona universitária com alta rotatividade de inquilinos: os estofos precisam de limpeza regular entre mudanças." },
  "ramalde": { landmarks: ["NorteShopping", "Pavilhão Rosa Mota", "Parque da Pasteleira"], localTip: "Bairro residencial com muitas famílias: sofás e colchões acumulam ácaros rapidamente." },
  "bonfim": { landmarks: ["Praça da Alegria", "Rua de Santa Catarina (zona alta)", "Jardim de São Lázaro"], localTip: "Uma das zonas mais antigas do Porto: edifícios com humidade exigem cuidados extra com mofo nos estofos." },
  "campanha": { landmarks: ["Estação de Campanhã", "Matadouro Municipal", "Parque Oriental"], localTip: "Zona em renovação urbana: muitos apartamentos renovados com estofos novos que beneficiam de impermeabilização preventiva." },
  "cedofeita": { landmarks: ["Rua de Cedofeita", "Jardim do Marquês", "Mercado do Bom Sucesso"], localTip: "Centro urbano denso com muitos apartamentos pequenos onde a limpeza ao domicílio é especialmente conveniente." },
  "lordelo-do-ouro": { landmarks: ["Parque da Cidade", "Museu de Serralves", "Avenida da Boavista"], localTip: "Zona premium com residências de alto padrão que exigem cuidados especializados com tecidos delicados." },
  "aldoar": { landmarks: ["Estádio do Bessa", "Parque da Cidade (zona sul)", "Aldoar (centro)"], localTip: "Área residencial tranquila, ideal para agendar limpezas ao domicílio com calma e sem pressa." },
  "foz-do-douro": { landmarks: ["Farol da Foz", "Praia do Molhe", "Jardim do Passeio Alegre"], localTip: "A brisa marítima traz sal e humidade: os estofos perto da costa acumulam mais salitre e necessitam de limpeza mais frequente." },
  "nevogilde": { landmarks: ["Praia de Nevogilde", "Avenida Marechal Gomes da Costa"], localTip: "Zona residencial exclusiva: os nossos técnicos estão habituados a trabalhar com tecidos premium e peles naturais." },
  "massarelos": { landmarks: ["Museu do Carro Eléctrico", "Cais das Pedras", "Jardim do Palácio de Cristal"], localTip: "Proximidade ao rio Douro aumenta a humidade interior: impermeabilização é especialmente recomendada." },
  "miragaia": { landmarks: ["Ponte da Arrábida", "Centro Histórico", "Alfândega do Porto"], localTip: "Edifícios históricos com pouca ventilação: a limpeza profunda ajuda a prevenir mofo e alergénios." },
  "santo-ildefonso": { landmarks: ["Rua de Santa Catarina", "Mercado do Bolhão", "Igreja de Santo Ildefonso"], localTip: "Zona comercial e residencial vibrante: limpamos estofos em apartamentos turísticos e residenciais." },
  "se": { landmarks: ["Sé Catedral do Porto", "Ponte D. Luís I", "Ribeira"], localTip: "Coração histórico do Porto: muitos alojamentos locais que precisam de limpeza profissional entre hóspedes." },
  "sao-nicolau": { landmarks: ["Ribeira do Porto", "Palácio da Bolsa", "Igreja de São Francisco"], localTip: "Zona turística com alto fluxo: os estofos de alojamento local beneficiam de higienização regular." },
  "vitoria": { landmarks: ["Torre dos Clérigos", "Livraria Lello", "Praça de Lisboa"], localTip: "No coração do Porto: acesso rápido e fácil para a nossa equipa chegar à sua porta." },
  "matosinhos-centro": { landmarks: ["Porto de Leixões", "Praia de Matosinhos", "Mercado de Matosinhos"], localTip: "Ambiente costeiro com maresia: os estofos absorvem humidade e sal, tornando a limpeza periódica essencial." },
  "leca-da-palmeira": { landmarks: ["Piscina das Marés (Siza Vieira)", "Praia de Leça", "Farol de Leça"], localTip: "Zona costeira de referência: a maresia exige atenção extra à preservação dos tecidos." },
  "sao-mamede-de-infesta": { landmarks: ["Hospital Pedro Hispano", "Parque de Real"], localTip: "Bairro residencial com acesso fácil pelo Metro: agendamento flexível para a sua conveniência." },
  "senhora-da-hora": { landmarks: ["NorteShopping (proximidade)", "Parque de Quires"], localTip: "Zona central de Matosinhos com muitas famílias jovens: proteja os estofos dos mais pequenos." },
  "custoias": { landmarks: ["Igreja de Custóias", "zona residencial norte"], localTip: "Área tranquila e familiar: ideal para agendar a limpeza com tranquilidade." },
  "leca-do-balio": { landmarks: ["Mosteiro de Leça do Balio", "Ponte românica"], localTip: "Zona histórica com edifícios antigos: a humidade pode afetar os estofos, sendo a limpeza preventiva crucial." },
  "guifoes": { landmarks: ["Parque da Cidade de Matosinhos (zona norte)"], localTip: "Área residencial em crescimento: proteja os seus estofos novos com impermeabilização desde o primeiro dia." },
  "perafita": { landmarks: ["Zona Industrial de Perafita", "Praia de Angeiras"], localTip: "Entre a praia e a cidade: a brisa oceânica requer manutenção extra dos tecidos." },
  "lavra": { landmarks: ["Praia de Lavra", "Memória de Lavra"], localTip: "Zona costeira norte: os estofos perto do mar precisam de atenção especial contra a humidade." },
  "santa-cruz-do-bispo": { landmarks: ["Mosteiro de Santa Cruz do Bispo"], localTip: "Comunidade tranquila: agende a sua limpeza ao domicílio com toda a calma." },
  "cidade-da-maia": { landmarks: ["Câmara Municipal da Maia", "Fórum da Maia", "Zoo da Maia"], localTip: "Centro urbano com muitas famílias: a limpeza regular protege a saúde de crianças e animais." },
  "aguas-santas": { landmarks: ["Estação de Metro de Águas Santas", "Parque da Quinta do Engenho Novo"], localTip: "Excelente acessibilidade via Metro: fácil coordenar a limpeza com a sua rotina." },
  "castelo-da-maia": { landmarks: ["Castêlo da Maia (centro)", "zona residencial moderna"], localTip: "Zona residencial moderna com condomínios novos: impermeabilize para proteger o investimento." },
  "moreira-maia": { landmarks: ["Aeroporto do Porto (proximidade)", "Centro de Moreira"], localTip: "Perto do aeroporto: limpamos também estofos de espaços de alojamento local e Airbnb." },
  "nogueira-maia": { landmarks: ["Zona rural da Maia", "Igreja de Nogueira"], localTip: "Área mais rural e verde: o pólen e humidade naturais tornam a limpeza periódica importante." },
  "silva-escura": { landmarks: ["Parque de Avioso", "zona semi-rural"], localTip: "Zona tranquila e acolhedora: sem pressa, trabalhamos com atenção ao detalhe." },
  "folgosa-maia": { landmarks: ["Igreja de Folgosa", "zona florestal"], localTip: "Rodeada de natureza: o ambiente húmido requer cuidados especiais com estofos." },
  "vila-nova-da-telha": { landmarks: ["Zona industrial e residencial"], localTip: "Área em expansão: novos lares merecem estofos protegidos desde o início." },
  "milheiros": { landmarks: ["Centro de Milheirós", "Parque Local"], localTip: "Bairro familiar e acessível: facilitamos o agendamento ao fim-de-semana." },
  "vermoim": { landmarks: ["Vermoim centro", "zona residencial consolidada"], localTip: "Zona residencial estável: mantenha os seus estofos em perfeitas condições com limpeza anual." },
  "mafamude": { landmarks: ["Câmara Municipal de Gaia", "Auditório de Gaia", "El Corte Inglés"], localTip: "Centro de Gaia com grande densidade populacional: serviço rápido ao domicílio sem complicações." },
  "santa-marinha": { landmarks: ["Caves do Vinho do Porto", "Cais de Gaia", "Teleférico de Gaia"], localTip: "Zona turística e residencial junto ao rio: a humidade do Douro exige atenção especial aos estofos." },
  "afurada": { landmarks: ["Aldeia Piscatória da Afurada", "Restaurantes à beira-rio"], localTip: "Aldeia costeira com carácter próprio: cuidamos dos estofos de residências e restaurantes." },
  "canidelo": { landmarks: ["Praia de Canidelo", "Reserva Natural do Estuário do Douro"], localTip: "Entre o rio e o mar: os tecidos sofrem mais com a humidade e sal nesta localização." },
  "madalena": { landmarks: ["Praia da Madalena", "Marginal de Gaia"], localTip: "Zona costeira procurada por famílias: proteja os estofos da humidade marítima." },
  "valadares": { landmarks: ["Praia de Valadares", "zona residencial sul"], localTip: "Área residencial junto à praia: a maresia exige manutenção regular dos tecidos." },
  "gulpilhares": { landmarks: ["Praia de Gulpilhares", "zona sul de Gaia"], localTip: "Zona costeira tranquila: ideal para agendar uma limpeza profunda sem pressas." },
  "arcozelo": { landmarks: ["Praia de Arcozelo", "zona rural-costeira"], localTip: "Entre campo e mar: os estofos precisam de cuidados contra humidade e pólen." },
  "sao-felix-da-marinha": { landmarks: ["Praia de São Félix", "zona sul de Gaia"], localTip: "Limite sul de Gaia: garantimos cobertura total mesmo nas zonas mais afastadas." },
  "oliveira-do-douro": { landmarks: ["Ponte do Freixo (proximidade)", "zona interior de Gaia"], localTip: "Zona residencial consolidada: a maioria dos clientes opta pelo pack limpeza + impermeabilização." },
  "vilar-do-paraiso": { landmarks: ["Centro de Vilar do Paraíso", "Conservatório de Música"], localTip: "Zona residencial familiar: limpamos sofás, colchões e tapetes num único agendamento." },
  "vilar-de-andorinho": { landmarks: ["Barragem do Crestuma-Lever (proximidade)"], localTip: "Área verde e residencial: o ambiente húmido torna a impermeabilização especialmente recomendada." },
  "avintes": { landmarks: ["Castelo de Avintes", "zona ribeirinha"], localTip: "Junto ao rio: proteja os seus estofos da humidade constante com impermeabilização profissional." },
  "canelas": { landmarks: ["Centro de Canelas", "zona residencial"], localTip: "Zona em crescimento: aproveite para proteger estofos novos com os nossos packs." },
  "pedroso": { landmarks: ["Centro de Pedroso", "Floresta de Pedroso"], localTip: "Rodeada de verde: o pólen e a humidade acumulam-se nos estofos sem que se note." },
  "serzedo": { landmarks: ["Centro de Serzedo"], localTip: "Zona interior tranquila: dedicamos tempo e atenção a cada peça." },
  "perosinho": { landmarks: ["Centro de Perosinho"], localTip: "Comunidade acolhedora: os nossos técnicos tratam cada casa como se fosse a sua." },
  "grijo": { landmarks: ["Mosteiro de Grijó", "zona semi-rural"], localTip: "Zona histórica e verde: edifícios antigos beneficiam de limpeza e higienização profunda." },
  "sermonde": { landmarks: ["Centro de Sermonde"], localTip: "Zona rural de Gaia: atendemos toda a área com deslocação calculada pela distância ao centro." },
  "rio-tinto": { landmarks: ["Estação de Metro de Rio Tinto", "Centro de Rio Tinto"], localTip: "Um dos pontos mais acessíveis de Gondomar via Metro: facilitamos o agendamento." },
  "baguim-do-monte": { landmarks: ["Centro de Baguim do Monte", "zona residencial"], localTip: "Zona residencial próxima do Porto: beneficie dos mesmos preços sem custos extra." },
  "fanzeres": { landmarks: ["Centro de Fânzeres", "zona leste de Gondomar"], localTip: "Área familiar: os nossos produtos são 100% seguros para crianças e animais." },
  "sao-pedro-da-cova": { landmarks: ["Minas de São Pedro da Cova", "Museu Mineiro"], localTip: "Zona histórica mineira: a poeira mineral exige uma limpeza mais profunda dos estofos." },
  "valbom": { landmarks: ["Marina de Valbom", "Jardins de Valbom"], localTip: "Junto ao rio Douro: a humidade fluvial exige manutenção regular dos tecidos." },
  "gondomar-centro": { landmarks: ["Câmara Municipal de Gondomar", "Ourivesaria de Gondomar"], localTip: "Centro do concelho: fácil acesso para a nossa equipa." },
  "jovim": { landmarks: ["Zona ribeirinha de Jovim", "Área verde"], localTip: "Zona verde junto ao Douro: ambiente húmido que pede cuidados extra." },
  "foz-do-sousa": { landmarks: ["Rio Sousa", "zona florestal"], localTip: "Rodeada de natureza: ideal para quem valoriza um lar fresco e higienizado." },
  "lomba": { landmarks: ["Serra de Santa Justa (proximidade)"], localTip: "Zona mais elevada e ventilada: mesmo assim, os ácaros estão por toda a parte." },
  "covelo": { landmarks: ["Zona rural de Gondomar"], localTip: "Zona tranquila e verde: garantimos pontualidade e profissionalismo." },
  "melres": { landmarks: ["Margem do Douro", "zona rural leste"], localTip: "Junto ao Douro: a humidade constante torna a impermeabilização essencial." },
  "medas": { landmarks: ["Centro de Medas", "zona interior"], localTip: "Uma das zonas mais interiores do concelho: a nossa equipa chega a toda a parte." },
  "valongo-centro": { landmarks: ["Câmara Municipal de Valongo", "Serra de Santa Justa"], localTip: "Centro de Valongo: acesso fácil e rápido para a nossa equipa." },
  "ermesinde": { landmarks: ["Estação de Ermesinde", "Centro Comercial de Ermesinde"], localTip: "Zona urbana densamente povoada: muitas famílias a precisar de limpeza regular de estofos." },
  "alfena": { landmarks: ["Centro de Alfena", "Parques locais"], localTip: "Zona residencial em crescimento: novos moradores, novos estofos para proteger." },
  "campo-valongo": { landmarks: ["Estação de Campo", "Serras de Valongo"], localTip: "Zona semi-rural entre serras: a natureza traz pólen que se acumula nos estofos." },
  "sobrado-valongo": { landmarks: ["Centro de Sobrado", "zona leste de Valongo"], localTip: "Zona tranquila e familiar: ao mesmo preço de deslocação de todo o concelho." },

  // ─── Lisboa ───
  "santa-maria-maior": { landmarks: ["Castelo de São Jorge", "Sé de Lisboa", "Alfama"], localTip: "Prédios históricos com pouca ventilação no centro de Lisboa: a limpeza profunda ajuda a prevenir humidade e alergénios nos estofos." },
  "misericordia": { landmarks: ["Chiado", "Bairro Alto", "Príncipe Real"], localTip: "Apartamentos turísticos e alojamento local em grande número: higienização rápida entre hóspedes é essencial nesta zona." },
  "santo-antonio": { landmarks: ["Avenida da Liberdade", "Rato", "Jardim do Príncipe Real"], localTip: "Residências de padrão elevado: a nossa equipa está habituada a tecidos premium e peles naturais." },
  "sao-vicente": { landmarks: ["Graça", "Panteão Nacional", "Feira da Ladra"], localTip: "Zona histórica com miradouros: edifícios antigos exigem atenção redobrada à humidade nos estofos." },
  "arroios": { landmarks: ["Anjos", "Alameda", "Praça do Chile"], localTip: "Bairro multicultural e denso: agendamos com flexibilidade para residências e pequenos negócios locais." },
  "avenidas-novas": { landmarks: ["Gulbenkian", "El Corte Inglés", "Campo Pequeno"], localTip: "Zona residencial e empresarial de referência em Lisboa: atendemos apartamentos, escritórios e clínicas." },
  "belem": { landmarks: ["Mosteiro dos Jerónimos", "Torre de Belém", "MAAT"], localTip: "Junto ao rio Tejo: a humidade constante torna a impermeabilização de sofás especialmente recomendada." },
  "parque-das-nacoes": { landmarks: ["Oceanário de Lisboa", "Vasco da Gama", "Altice Arena"], localTip: "Apartamentos modernos junto ao rio: a nossa equipa protege estofos novos com impermeabilização preventiva." },
  "alvalade": { landmarks: ["Estádio de Alvalade", "Avenida da Igreja"], localTip: "Bairro residencial planeado, muito procurado por famílias: higienização regular para crianças e alérgicos." },
  "benfica": { landmarks: ["Estádio da Luz", "Palácio Fronteira"], localTip: "Uma das zonas mais populosas de Lisboa: atendemos residências e escritórios com rapidez e sem complicações." },
  "campo-de-ourique": { landmarks: ["Mercado de Campo de Ourique", "Jardim da Parada"], localTip: "Bairro residencial tranquilo muito procurado por famílias: cuidamos de sofás, colchões e tapetes com o mesmo rigor." },
  "estrela": { landmarks: ["Basílica da Estrela", "Jardim da Estrela"], localTip: "Zona nobre e histórica de Lisboa: trabalhamos com tecidos delicados e mobiliário de valor." },

  // ─── Algarve: Loulé (Quarteira, Vilamoura, Almancil) ───
  "quarteira": { landmarks: ["Praia de Quarteira", "Marina de Vilamoura (proximidade)"], localTip: "Muitos apartamentos de férias e alojamento local: higienização rápida entre check-ins é o nosso forte." },
  "vilamoura": { landmarks: ["Marina de Vilamoura", "Casino de Vilamoura", "Campos de Golfe de Vilamoura"], localTip: "Vivendas e apartamentos de alto padrão junto à marina: tratamos estofos de luxo, incluindo pele e tecidos premium, com produtos certificados." },
  "almancil": { landmarks: ["Igreja Matriz de Almancil (azulejos)", "Zona de restaurantes de Vale do Lobo/Quinta do Lago"], localTip: "Concentra algumas das moradias mais valorizadas do Algarve: serviço discreto e cuidadoso para estofos de gama alta." },
  "quinta-do-lago": { landmarks: ["Ria Formosa (Quinta do Lago)", "Campos de Golfe da Quinta do Lago"], localTip: "Uma das zonas residenciais mais exclusivas de Portugal: atendemos moradias de luxo com total confidencialidade e produtos de gama profissional para tecidos e peles nobres." },
  "vale-do-lobo": { landmarks: ["Falésia de Vale do Lobo", "Campos de Golfe de Vale do Lobo"], localTip: "Vivendas de luxo junto ao mar: a maresia exige impermeabilização e limpeza periódica para preservar estofos e tapetes de valor." },
  "loule-centro": { landmarks: ["Mercado Municipal de Loulé", "Castelo de Loulé"], localTip: "Centro histórico do concelho: atendemos residências tradicionais e apartamentos renovados em toda a zona." },
  "boliqueime": { landmarks: ["Zona rural entre Loulé e Albufeira"], localTip: "Muitas moradias com jardim e piscina: aplicamos impermeabilização para proteger estofos exteriores e interiores do calor algarvio." },

  // ─── Algarve: Faro, Albufeira, Olhão ───
  "faro-centro": { landmarks: ["Sé de Faro", "Marina de Faro", "Ria Formosa"], localTip: "Capital do Algarve, com apartamentos junto à marina e ao centro histórico: agendamos com facilidade em toda a cidade." },
  "montenegro": { landmarks: ["Aeroporto de Faro (proximidade)", "Praia de Faro"], localTip: "Perto do aeroporto: limpamos também estofos de alojamento local e apartamentos de curta duração." },
  "albufeira-centro": { landmarks: ["Praia dos Pescadores", "Marina de Albufeira", "Praia da Oura"], localTip: "Cidade turística com elevada rotatividade de hóspedes: higienização rápida e eficaz entre reservas de alojamento local." },
  "guia": { landmarks: ["Zoomarine (proximidade)", "Zona hoteleira de Albufeira"], localTip: "Perto da zona hoteleira: atendemos moradias e apartamentos de férias com disponibilidade flexível." },
  "olhao-centro": { landmarks: ["Mercado de Olhão", "Porto de Pesca de Olhão"], localTip: "Cidade piscatória junto à Ria Formosa: a humidade e o sal marítimo exigem limpeza e impermeabilização mais frequentes." },

  // ─── Algarve: Portimão, Lagos, Tavira ───
  "portimao-centro": { landmarks: ["Praia da Rocha", "Marina de Portimão"], localTip: "Maior cidade do Algarve ocidental: atendemos residências permanentes e apartamentos de veraneio junto à praia." },
  "lagos-centro": { landmarks: ["Marina de Lagos", "Centro Histórico de Lagos"], localTip: "Cidade histórica muito procurada por turistas: higienização profissional entre estadias de alojamento local." },
  "tavira-centro": { landmarks: ["Ponte Romana de Tavira", "Ilha de Tavira"], localTip: "Centro histórico junto ao rio Gilão: cuidamos de mobiliário tradicional e estofos em casas antigas restauradas." },

  // ─── Sintra ───
  "sintra-vila": { landmarks: ["Palácio Nacional de Sintra", "Palácio da Pena", "Quinta da Regaleira"], localTip: "Serra com nevoeiro e humidade constante: os estofos em casas históricas de Sintra pedem impermeabilização mais frequente do que na maioria do país." },
  "agualva-e-mira-sintra": { landmarks: ["Estação de Agualva-Cacém", "Parque Urbano de Mira-Sintra"], localTip: "Zona residencial bem servida por comboio: fácil agendar a visita em torno da sua rotina de deslocação a Lisboa." },
  "algueirao-mem-martins": { landmarks: ["Mercado de Algueirão", "Parque da Amizade"], localTip: "Uma das freguesias mais populosas do concelho: atendemos apartamentos e moradias com a mesma rapidez de agendamento." },
  "casal-de-cambra": { landmarks: ["Parque Urbano do Casal de Cambra"], localTip: "Bairro residencial compacto e arborizado: ideal para agendar a limpeza num fim de manhã tranquilo." },
  "cacem-e-sao-marcos": { landmarks: ["Estação Ferroviária do Cacém", "Igreja de São Marcos"], localTip: "Nó ferroviário da linha de Sintra: muitos apartamentos arrendados a curto prazo que beneficiam de higienização entre inquilinos." },
  "massama-e-monte-abraao": { landmarks: ["Centro Comercial de Massamá", "Parque Urbano de Monte Abraão"], localTip: "Zona residencial em expansão: protegemos estofos e sofás novos com impermeabilização preventiva desde o primeiro dia." },
  "queluz-e-belas": { landmarks: ["Palácio de Queluz", "Autódromo do Estoril (proximidade)"], localTip: "Junto ao Palácio de Queluz, a humidade dos jardins históricos exige atenção redobrada aos tecidos em casas próximas." },
  "rio-de-mouro": { landmarks: ["Parque Basílio", "Zona industrial e residencial"], localTip: "Concelho em crescimento com muitas famílias jovens: higienização regular protege crianças e animais de estimação." },
  "sao-joao-das-lampas-e-terrugem": { landmarks: ["Praia do Magoito (proximidade)", "Zona rural do concelho"], localTip: "Perto da costa: a maresia atlântica alcança mesmo as zonas mais interiores, tornando a impermeabilização especialmente útil." },
  "colares": { landmarks: ["Praia da Adraga", "Vinhas de Colares", "Quinta do Penedo"], localTip: "Vinhedos históricos e clima marítimo húmido: os estofos em casas de campo desta zona pedem cuidados extra contra a humidade." },
  "almargem-do-bispo": { landmarks: ["Pedreiras de mármore de Pêro Pinheiro", "Zona rural de Montelavar"], localTip: "Zona semi-rural do concelho de Sintra: deslocamo-nos com o mesmo equipamento profissional até às moradias mais afastadas." },

  // ─── Cascais ───
  "cascais-estoril": { landmarks: ["Casino Estoril", "Boca do Inferno", "Marina de Cascais"], localTip: "A maresia da linha de Cascais é intensa: recomendamos impermeabilização de sofás e cadeiras para quem vive perto da costa." },
  "alcabideche": { landmarks: ["Aeródromo de Cascais", "Quinta da Marinha"], localTip: "Muitas moradias de golfe e campos de golfe na zona: tratamos estofos de gama alta com produtos certificados para tecidos e peles nobres." },
  "carcavelos-e-parede": { landmarks: ["Praia de Carcavelos", "Nova School of Business and Economics"], localTip: "Zona de praia com grande vida estudantil: higienização rápida entre inquilinos é o nosso forte em apartamentos arrendados." },
  "sao-domingos-de-rana": { landmarks: ["Parque Urbano de Talaíde"], localTip: "Zona residencial no interior do concelho de Cascais: cobrimos toda a área com a mesma rapidez de resposta." },

  // ─── Oeiras ───
  "oeiras-e-sao-juliao-da-barra": { landmarks: ["Forte de São Julião da Barra", "Marina de Oeiras", "Praia de Oeiras"], localTip: "Junto à foz do Tejo: a humidade marítima constante torna a impermeabilização de sofás especialmente recomendada." },
  "alges-linda-a-velha": { landmarks: ["Jardim Municipal de Algés", "Doca de Algés"], localTip: "Zona residencial densa junto ao rio: atendemos apartamentos e escritórios com agendamento flexível." },
  "carnaxide-e-queijas": { landmarks: ["Centro Colombo (proximidade)", "Zona empresarial de Carnaxide"], localTip: "Muitos escritórios e sedes de empresas: limpamos cadeiras e sofás de receção fora do horário de expediente." },
  "barcarena": { landmarks: ["Parque dos Poetas"], localTip: "Zona residencial arborizada: ideal para agendar a limpeza com tranquilidade, sem pressa." },
  "porto-salvo": { landmarks: ["Tagus Park (polo tecnológico)"], localTip: "Polo de escritórios e empresas de tecnologia: atendemos espaços comerciais com rapidez para não interromper a atividade." },

  // ─── Amadora ───
  "aguas-livres": { landmarks: ["Aqueduto das Águas Livres (proximidade)"], localTip: "Zona residencial próxima do aqueduto histórico: atendemos apartamentos com a mesma pontualidade em toda a Amadora." },
  "alfragide": { landmarks: ["IKEA Alfragide", "Dolce Vita Tejo"], localTip: "Grande zona comercial: muitos clientes aproveitam para mobilar a casa e pedem impermeabilização preventiva em estofos novos." },
  "encosta-do-sol": { landmarks: ["Zona residencial da Amadora"], localTip: "Bairro residencial consolidado: higienização regular é a escolha mais comum das famílias desta zona." },
  "falagueira-venda-nova": { landmarks: ["Estádio José Gomes"], localTip: "Zona urbana densa e bem servida por transportes: fácil coordenar a visita com a sua rotina diária." },
  "mina-de-agua": { landmarks: ["Zona residencial da Mina de Água"], localTip: "Bairro residencial tranquilo: atendemos com a mesma rapidez e ao mesmo preço de deslocação de todo o concelho." },
  "venteira": { landmarks: ["Câmara Municipal da Amadora"], localTip: "Centro administrativo do concelho: atendemos residências e pequenos escritórios na mesma visita, se necessário." },

  // ─── Almada ───
  "almada-cova-da-piedade": { landmarks: ["Cristo Rei", "Elevador Panorâmico de Almada"], localTip: "Vista sobre o Tejo e Lisboa: a humidade do rio torna a impermeabilização de sofás especialmente útil nesta zona." },
  "caparica-e-trafaria": { landmarks: ["Forte da Trafaria", "Ferry para Belém"], localTip: "Zona costeira com ligação fluvial a Lisboa: atendemos residências permanentes e de férias com a mesma atenção." },
  "costa-da-caparica": { landmarks: ["Praia da Costa da Caparica", "Passadiços da Fonte da Telha"], localTip: "Uma das praias mais procuradas do país: a maresia intensa exige limpeza e impermeabilização mais frequentes em estofos perto da costa." },
  "charneca-de-caparica": { landmarks: ["Pinhal do Rei"], localTip: "Zona residencial junto ao pinhal: o pólen e a areia da proximidade da praia acumulam-se em tapetes e estofos, pedindo limpeza regular." },
  "laranjeiro-e-feijo": { landmarks: ["Zona residencial consolidada de Almada"], localTip: "Bairro familiar bem servido por transportes para Lisboa: agendamos com flexibilidade ao fim do dia." },

  // ─── Loures ───
  "loures-centro": { landmarks: ["Jardim do Rossio de Loures", "Convento da Graça"], localTip: "Centro histórico do concelho: atendemos moradias tradicionais e apartamentos novos com o mesmo rigor." },
  "sacavem-e-prior-velho": { landmarks: ["Parque Urbano de Sacavém", "Antiga Fábrica de Faianças"], localTip: "Zona em forte renovação urbana: muitos apartamentos novos que beneficiam de impermeabilização preventiva desde o início." },
  "santa-iria-de-azoia": { landmarks: ["Zona industrial e ribeirinha do Tejo"], localTip: "Concelho com forte presença industrial e residencial: atendemos escritórios e residências na mesma zona ao mesmo preço de deslocação." },
  "camarate-unhos-apelacao": { landmarks: ["Proximidade do Aeroporto de Lisboa"], localTip: "Perto do aeroporto: limpamos também estofos de alojamento local e apartamentos de curta duração." },
  "santo-antonio-dos-cavaleiros": { landmarks: ["Zona residencial planeada"], localTip: "Bairro residencial bem planeado: ideal para agendar a limpeza com antecedência e sem imprevistos." },
  "bucelas": { landmarks: ["Vinhas e adegas de Bucelas"], localTip: "Vila vinhateira histórica: cuidamos de mobiliário tradicional em casas de campo e quintas da região." },
  "fanhoes": { landmarks: ["Zona rural do concelho de Loures"], localTip: "Freguesia rural e tranquila: garantimos cobertura total mesmo nas zonas mais afastadas do centro de Loures." },
  "lousa-loures": { landmarks: ["Zona rural a norte de Loures"], localTip: "Uma das freguesias mais interiores do concelho: a nossa equipa desloca-se ao mesmo preço de deslocação dentro de toda a zona." },
  "moscavide-e-portela": { landmarks: ["Parque das Nações (proximidade)", "Estação de Moscavide"], localTip: "Mesmo junto ao Parque das Nações: atendemos apartamentos modernos com a mesma atenção a tecidos e estofos de gama alta." },

  // ─── Algarve: Loulé, Albufeira, Portimão, Lagos (top cities) ───
  "alte-e-salir": { landmarks: ["Aldeia de Alte (uma das mais bonitas de Portugal)", "Serra do Caldeirão"], localTip: "Zona serrana no interior de Loulé: deslocamo-nos com o mesmo equipamento profissional até às aldeias mais afastadas do litoral." },
  "ferreiras": { landmarks: ["Zona residencial e comercial de Albufeira"], localTip: "Bairro em crescimento no interior de Albufeira: muitas moradias novas que beneficiam de impermeabilização preventiva." },
  "paderne": { landmarks: ["Castelo de Paderne"], localTip: "Zona rural com património histórico: atendemos moradias tradicionais e quintas na mesma área de Albufeira." },
  "alvor": { landmarks: ["Praia de Alvor", "Ria de Alvor"], localTip: "Vila piscatória muito procurada por turistas: higienização rápida entre estadias de alojamento local junto à ria." },
  "mexilhoeira-grande": { landmarks: ["Zona rural entre Portimão e Lagos"], localTip: "Freguesia mais interior do concelho de Portimão: cobrimos toda a área ao mesmo preço de deslocação." },
  "luz-lagos": { landmarks: ["Praia da Luz"], localTip: "Vila costeira muito procurada por residentes estrangeiros: tratamos estofos e tapetes de moradias de férias com o mesmo rigor profissional." },
  "odiaxere": { landmarks: ["Barragem de Odiáxere"], localTip: "Zona mais interior do concelho de Lagos, junto à barragem: atendemos moradias rurais com a mesma pontualidade." },
  "bensafrim": { landmarks: ["Zona rural serrana de Lagos"], localTip: "Freguesia rural no interior de Lagos: a nossa equipa chega com o mesmo equipamento profissional até às casas mais isoladas." },
};

function getDefaultLocalData(freguesia: string, municipio: string): FreguesiaLocalData {
  return {
    landmarks: [`Centro de ${freguesia}`, `Zona residencial de ${freguesia}`],
    localTip: `Em ${freguesia}, ${municipio}, garantimos o mesmo serviço profissional com equipamento de extração certificado.`,
  };
}

export function getLocalData(slug: string, freguesia: string, municipio: string): FreguesiaLocalData {
  return freguesiaLocalData[slug] || getDefaultLocalData(freguesia, municipio);
}

// ─── Intro Templates ─────────────────────────────────────────────

type ContentTemplate = (f: string, c: string, svc: string, price: string) => string;

const introTemplates: ContentTemplate[] = [
  (f, c, svc, price) => `Procura ${svc.toLowerCase()} profissional em ${f}, ${c}? A Kyro Clean Solutions presta serviços ao domicílio com equipamento de extração profissional. Resultados visíveis no momento, ${priceClause(price)}.`,
  (f, c, svc, price) => `A Kyro Clean Solutions é a escolha de referência em ${f} para ${svc.toLowerCase()}. Utilizamos tecnologia de extração profissional com água quente em toda a zona de ${c}. Serviço ${priceClause(price)}.`,
  (f, c, svc, price) => `Em ${f}, a proximidade urbana e o ritmo do dia-a-dia fazem com que os estofos acumulem sujidade invisível. A Kyro Clean Solutions oferece ${svc.toLowerCase()} profissional em ${c} com resultados no próprio dia, ${priceClause(price)}.`,
  (f, c, svc, price) => `Diga adeus às manchas e odores em ${f}. A Kyro Clean Solutions disponibiliza o serviço mais completo de ${svc.toLowerCase()} em ${c}, com equipamento profissional e produtos certificados. ${priceClause(price, true)}.`,
  (f, c, svc, price) => `Residentes de ${f} já confiam na Kyro Clean Solutions para ${svc.toLowerCase()} ao domicílio. Deslocamo-nos a qualquer zona de ${c} com equipamento de extração profissional. Preços ${priceClause(price)}.`,
  (f, c, svc, price) => `Precisa de ${svc.toLowerCase()} em ${f}? A nossa equipa especializada cobre toda a zona de ${c} com um serviço rápido, eficaz e sem complicações. Higienização profissional ${priceClause(price)}.`,
  (f, c, svc, price) => `Em ${f}, ${c}, os estofos merecem cuidados profissionais. A Kyro Clean Solutions utiliza extração profissional a quente para remover manchas, ácaros e odores. ${priceClause(price, true)} ao domicílio.`,
  (f, c, svc, price) => `A limpeza caseira não é suficiente para eliminar ácaros e bactérias dos seus estofos em ${f}. A Kyro Clean Solutions garante uma higienização profunda em ${c}, ${priceClause(price)}.`,
];

// ─── How It Works Templates ──────────────────────────────────────

const howItWorksTemplates: ContentTemplate[] = [
  (f, c, svc) => `O nosso serviço em ${f} segue um processo profissional: inspeção do tecido, pré-tratamento de manchas, extração profunda com água quente e secagem rápida. Trabalhamos ao domicílio para maior comodidade.`,
  (f, c, svc) => `Em ${f}, o processo é simples: inspecionamos o estado dos estofos, aplicamos pré-tratamento específico nas manchas, realizamos a extração profissional profunda e garantimos secagem rápida. Tudo na sua casa em ${c}.`,
  (f, c, svc) => `Na sua casa em ${f}, começamos por avaliar o tipo de tecido e o grau de sujidade. Depois, aplicamos o tratamento mais adequado com extração profissional a quente. O resultado é imediato e os estofos ficam prontos em poucas horas.`,
  (f, c, svc) => `O nosso processo de ${svc.toLowerCase()} em ${f} é pensado para minimizar a interrupção da sua rotina. Chegamos, inspecionamos, tratamos e entregamos: tudo num único agendamento, sem necessidade de transportar os seus estofos.`,
  (f, c, svc) => `Quando visitamos a sua casa em ${f}, ${c}, trazemos todo o equipamento necessário. Não precisa de preparar nada. O processo dura entre 1 a 3 horas e os estofos ficam prontos a usar no mesmo dia.`,
];

// ─── Meta Description Templates ──────────────────────────────────

const metaDescTemplates: Array<(svc: string, f: string, c: string, price: string) => string> = [
  (svc, f, c, price) => `${svc} profissional em ${f}, ${c}. Ao domicílio com resultados visíveis. ${priceClause(price, true)}. Orçamento grátis.`,
  (svc, f, c, price) => `${svc} em ${f}, ${c}. Remoção de manchas, ácaros e odores ao domicílio. ${priceClause(price, true)}. Peça orçamento gratuito.`,
  (svc, f, c, price) => `Serviço profissional de ${svc.toLowerCase()} em ${f}. Equipamento de extração profissional. ${priceClause(price, true)} em ${c}.`,
  (svc, f, c, price) => `${svc} ao domicílio em ${f}, ${c}. Técnicos certificados, produtos seguros. ${priceClause(price, true)}. Orçamento grátis.`,
];

// ─── Problem Pools (service-specific, location-aware) ─────────────

interface ProblemSet {
  title: string;
  description: (f: string) => string;
}

const problemsByService: Record<string, ProblemSet[]> = {
  "limpeza-sofas": [
    { title: "Manchas de café e vinho no tecido", description: f => `Manchas de café, vinho e gordura são o problema mais frequente nos sofás de ${f}. A extração profissional remove-as sem danificar o tecido.` },
    { title: "Ácaros invisíveis nas fibras do sofá", description: f => `Os sofás de ${f} acumulam milhões de ácaros que causam alergias respiratórias. A nossa extração profissional elimina 99% destes agentes.` },
    { title: "Odores de animais domésticos no sofá", description: f => `O cheiro a cão ou gato impregnado no sofá é um dos pedidos mais frequentes em ${f}. Eliminamos os odores na origem, não apenas os mascaramos.` },
    { title: "Sujidade profunda acumulada ao longo dos anos", description: f => `Anos de uso deixam os sofás de ${f} com uma aparência envelhecida. A limpeza profissional devolve a cor e textura originais.` },
    { title: "Pêlos de animais entranhados no estofo", description: f => `Os pêlos de animais prendem-se profundamente nas fibras do sofá. Em ${f}, muitas famílias com pets beneficiam da nossa limpeza especializada.` },
    { title: "Humidade e manchas de água no tecido", description: f => `Em ${f}, especialmente em apartamentos menos ventilados, a humidade cria manchas de água e início de mofo no tecido do sofá.` },
    { title: "Marcas de crianças e derrames no estofo", description: f => `Sumos, chocolate e marcas de brinquedos nos sofás são o dia-a-dia de famílias em ${f}. Os nossos produtos são 100% seguros para crianças.` },
    { title: "Tecido envelhecido e cores desbotadas", description: f => `A sujidade profunda tira o brilho e a cor ao tecido. Em ${f}, a limpeza profissional rejuvenesce sofás com vários anos de uso.` },
  ],
  "limpeza-colchoes": [
    { title: "Ácaros que causam alergias ao dormir", description: f => `Os colchões de ${f} acumulam até 2 milhões de ácaros. Se acorda com nariz entupido ou olhos irritados, a sua cama precisa de limpeza profissional.` },
    { title: "Manchas de suor e líquidos no colchão", description: f => `O suor noturno penetra profundamente nas camadas do colchão. Em ${f}, a nossa extração profissional remove estas manchas e os odores associados.` },
    { title: "Odores acumulados ao longo dos anos", description: f => `Os colchões absorvem odores corporais que a ventilação normal não elimina. Em ${f}, a nossa higienização profunda resolve este problema definitivamente.` },
    { title: "Fungos e humidade em quartos pouco ventilados", description: f => `Em ${f}, os quartos com menos ventilação criam condições para o crescimento de fungos no colchão. Detetamos e tratamos o problema na origem.` },
    { title: "Pêlos de animais acumulados na cama", description: f => `Em ${f}, muitos tutores dormem com os seus animais. Os pêlos e alergénios acumulam-se no colchão e precisam de extração profissional.` },
    { title: "Alergias e problemas respiratórios noturnos", description: f => `Se tem alergias que pioram à noite em ${f}, o colchão é provavelmente a causa. A nossa higienização elimina os alergénios na origem.` },
    { title: "Manchas difíceis de acidentes e derrames", description: f => `Manchas de bebidas, alimentos ou acidentes de crianças no colchão em ${f} parecem impossíveis de remover. A extração profissional resolve mesmo os casos mais difíceis.` },
    { title: "Colchão desgastado a precisar de higienização profunda", description: f => `Um colchão usado há vários anos em ${f} acumula células mortas, pó e bactérias nas camadas internas. A limpeza profissional devolve as condições higiénicas originais.` },
  ],
  "limpeza-tapetes": [
    { title: "Sujidade profunda acumulada nas fibras", description: f => `O tráfego diário deposita sujidade profunda nas fibras do tapete em ${f}. A extração profissional remove o que a aspiração doméstica não alcança.` },
    { title: "Manchas resistentes de bebidas e alimentos", description: f => `Manchas de vinho, café ou comida no tapete de ${f} tornam-se permanentes se não tratadas a tempo. Removemos mesmo as mais antigas e resistentes.` },
    { title: "Ácaros e alergénios escondidos nas fibras", description: f => `Os tapetes de ${f} são o segundo maior reservatório de ácaros da casa. A limpeza profissional é essencial para quem sofre de alergias.` },
    { title: "Pêlos de animais encrustados nas fibras", description: f => `Os pêlos de cão e gato prendem-se nas fibras do tapete e são impossíveis de remover com aspiração normal. Em ${f}, a nossa extração resolve o problema.` },
    { title: "Cores desbotadas e aspeto envelhecido", description: f => `Os tapetes de ${f} perdem cor com o uso e a luz solar. A limpeza profissional revitaliza os pigmentos e devolve a vivacidade original.` },
    { title: "Odores de animais e humidade no tapete", description: f => `O cheiro a animal ou a humidade num tapete de ${f} impregna toda a divisão. A nossa higienização profunda elimina os odores na raiz.` },
    { title: "Sujidade de calçado e tráfego diário intenso", description: f => `Em ${f}, o tráfego diário com calçado deposita terra, poluição e bactérias nas fibras. Uma limpeza anual prolonga significativamente a vida do tapete.` },
    { title: "Tapetes delicados a precisar de cuidado especializado", description: f => `Tapetes de lã, seda ou artesanais em ${f} exigem tratamento especializado. Os nossos técnicos estão preparados para trabalhar com todos os tipos de fibra.` },
  ],
  "limpeza-cadeiras": [
    { title: "Sujidade de uso diário nas cadeiras de refeição", description: f => `As cadeiras de refeição em ${f} acumulam gordura, restos de comida e sujidade diária. A limpeza profissional devolve-lhes o aspeto original.` },
    { title: "Manchas de comida e bebidas no estofo", description: f => `Manchas de molhos, sumos e bebidas nas cadeiras estofadas de ${f} ficam impregnadas no tecido. A extração profissional remove-as sem deixar rasto.` },
    { title: "Odores de cozinha e uso diário retidos no tecido", description: f => `As cadeiras de ${f} absorvem odores de cozinha, animais e uso intenso. A nossa higienização profissional elimina os cheiros na origem.` },
    { title: "Pêlos de animais nas cadeiras estofadas", description: f => `Em ${f}, os animais adoram as cadeiras estofadas. Os pêlos e alergénios acumulam-se nas fibras e exigem extração profissional.` },
    { title: "Descoloração e desgaste nas zonas de contacto", description: f => `As zonas de maior contacto das cadeiras em ${f} ficam mais escuras e desgastadas com o uso. A limpeza profissional uniformiza a cor e o aspeto.` },
    { title: "Cadeiras de escritório com anos de uso intenso", description: f => `As cadeiras de escritório em ${f} acumulam suor e sujidade corporal. Uma limpeza profissional melhora a higiene e prolonga a vida útil.` },
    { title: "Bactérias em superfícies de contacto frequente", description: f => `As cadeiras são uma das superfícies com mais bactérias na casa. Em ${f}, a nossa higienização profissional elimina 99% dos agentes patogénicos.` },
    { title: "Cadeiras de qualidade a perder o aspeto original", description: f => `Cadeiras de designer ou de qualidade superior em ${f} merecem cuidados especializados. Os nossos técnicos trabalham com todos os tipos de tecido e pele.` },
  ],
  "limpeza-alcatifas": [
    { title: "Sujidade profunda em toda a extensão da alcatifa", description: f => `As alcatifas de ${f} acumulam sujidade profunda em toda a sua área. A extração profissional trata a superfície completa de forma eficaz e uniforme.` },
    { title: "Manchas difíceis nas zonas de maior passagem", description: f => `As zonas de maior tráfego nas alcatifas de ${f} acumulam manchas que a limpeza doméstica não resolve. A extração profissional recupera o aspeto original.` },
    { title: "Ácaros e alergénios em alcatifas de uso intenso", description: f => `As alcatifas de ${f} com uso intenso são reservatórios de ácaros e alergénios. A limpeza profissional anual é recomendada por especialistas de saúde.` },
    { title: "Odores persistentes difíceis de eliminar em casa", description: f => `Os odores acumulados nas alcatifas de ${f} são difíceis de eliminar com produtos domésticos. A nossa extração profissional resolve o problema na origem.` },
    { title: "Humidade e risco de mofo em zonas expostas", description: f => `Em ${f}, as alcatifas em zonas próximas de entradas ou casas de banho sofrem mais com humidade e risco de mofo. Tratamos o problema antes que se agrave.` },
    { title: "Pêlos de animais entranhados nas fibras densas", description: f => `As fibras densas das alcatifas retêm pêlos de animais de forma muito mais resistente do que os tapetes. Em ${f}, a extração profissional é a solução eficaz.` },
    { title: "Alcatifa de escritório com tráfego comercial intenso", description: f => `As alcatifas de escritório em ${f} sofrem desgaste acelerado. A limpeza profissional regular prolonga a vida útil e melhora a imagem do espaço.` },
    { title: "Fibras compactadas e cores desbotadas", description: f => `Com o uso, as fibras das alcatifas compactam e perdem cor. Em ${f}, a limpeza com extração a quente revitaliza as fibras e repõe a textura original.` },
  ],
  "impermeabilizacao": [
    { title: "Sofá desprotegido contra derrames futuros", description: f => `Um sofá sem impermeabilização em ${f} absorve qualquer líquido em segundos, tornando as manchas permanentes. A proteção prévia evita este problema.` },
    { title: "Manchas frequentes em famílias com crianças", description: f => `Em ${f}, famílias com crianças enfrentam derrames diários. A impermeabilização cria uma barreira invisível que facilita a limpeza imediata.` },
    { title: "Acidentes de animais domésticos nos estofos", description: f => `Em ${f}, os tutores de animais sabem o que é um acidente no sofá. A impermeabilização protege o tecido e facilita a limpeza sem deixar manchas.` },
    { title: "Tecidos premium sem proteção adequada", description: f => `Sofás de linho, veludo ou microfibra em ${f} são especialmente vulneráveis a manchas. A impermeabilização protege o investimento desde o primeiro dia.` },
    { title: "Custos repetidos com limpezas evitáveis", description: f => `Em ${f}, muitos clientes só pensam em impermeabilizar após várias limpezas custosas. Um único tratamento preventivo poupa dinheiro a longo prazo.` },
    { title: "Estofos novos sem proteção preventiva", description: f => `Um sofá novo em ${f} merece começar protegido. A impermeabilização aplicada logo após a limpeza inaugural garante proteção duradoura contra manchas.` },
    { title: "Humidade e líquidos que penetram rapidamente", description: f => `Em ${f}, especialmente em pisos rés-do-chão, os estofos são mais suscetíveis à humidade. A impermeabilização cria uma barreira eficaz contra a penetração de líquidos.` },
    { title: "Desgaste acelerado por falta de tratamento preventivo", description: f => `Os estofos sem impermeabilização em ${f} desgastam-se mais rapidamente. O tratamento preventivo preserva o aspeto e prolonga a longevidade do tecido.` },
  ],
};

// ─── Benefit Pools (service-specific, location-aware) ─────────────

type BenefitTemplate = (f: string, c: string) => string;

const benefitsByService: Record<string, BenefitTemplate[]> = {
  "limpeza-sofas": [
    (f, c) => `Serviço ao domicílio em ${f}: limpamos o sofá na sua própria sala, sem transporte nem complicações em ${c}`,
    (f, c) => `Cobertura total em ${f} e toda a área de ${c}, com deslocação calculada pela distância`,
    (f)    => `O seu sofá em ${f} fica pronto a usar no mesmo dia, com secagem completa em 4 a 6 horas`,
    (f)    => `Produtos certificados e hipoalergénicos: 100% seguros para as crianças e animais da sua família em ${f}`,
    (f)    => `Eliminação de 99% dos ácaros, bactérias e alergénios acumulados no sofá em ${f}`,
    (f, c) => `Orçamento gratuito e transparente antes de qualquer trabalho no seu sofá em ${f}, ${c}`,
    (f)    => `Técnicos experientes em todos os tipos de tecido: microfibra, veludo, linho e pele sintética em ${f}`,
    (f)    => `Resultados visíveis imediatamente após a limpeza, com garantia de satisfação para clientes de ${f}`,
  ],
  "limpeza-colchoes": [
    (f, c) => `Higienização ao domicílio em ${f}: o colchão não sai do seu quarto em ${c}`,
    (f)    => `Eliminação de até 2 milhões de ácaros que se acumulam nos colchões de ${f}`,
    (f)    => `Melhoria imediata da qualidade do sono para residentes de ${f} com alergias noturnas`,
    (f, c) => `Cobertura completa em ${f} e toda a área de ${c}, com deslocação calculada pela distância`,
    (f)    => `Produtos hipoalergénicos e seguros para bebés, crianças e animais de estimação em ${f}`,
    (f)    => `Colchão pronto a usar no mesmo dia, com secagem completa em 3 a 5 horas em ${f}`,
    (f)    => `Tratamento eficaz contra fungos e humidade, frequentes em quartos pouco ventilados de ${f}`,
    (f, c) => `Orçamento gratuito e personalizado para o colchão da sua casa em ${f}, ${c}`,
  ],
  "limpeza-tapetes": [
    (f, c) => `Limpeza ao domicílio em ${f}: tratamos o tapete no local, sem transporte para ${c}`,
    (f)    => `Recuperação de cores e textura em tapetes envelhecidos de ${f}, com resultados visíveis`,
    (f)    => `Eliminação de ácaros, alergénios e pêlos de animais que se acumulam nos tapetes de ${f}`,
    (f, c) => `Cobertura total em ${f} e toda a área de ${c}, com deslocação calculada pela distância`,
    (f)    => `Secagem rápida: o tapete de ${f} fica pronto a usar em 2 a 4 horas após a limpeza`,
    (f)    => `Técnicos especializados em tapetes de lã, seda e fibras delicadas, frequentes em ${f}`,
    (f)    => `Remoção de manchas resistentes que os produtos domésticos de ${f} não conseguem eliminar`,
    (f, c) => `Orçamento gratuito e personalizado para o seu tapete em ${f}, ${c}`,
  ],
  "limpeza-cadeiras": [
    (f, c) => `Limpeza ao domicílio em ${f}: as cadeiras ficam na sua casa em ${c} durante todo o processo`,
    (f)    => `Eliminação de gordura, restos de comida e bactérias acumulados nas cadeiras de ${f}`,
    (f)    => `Produtos seguros para crianças e animais, ideais para as cadeiras de famílias de ${f}`,
    (f, c) => `Cobertura total em ${f} e toda a área de ${c}, com deslocação calculada pela distância`,
    (f)    => `Cadeiras prontas a usar no mesmo dia, com secagem em 3 a 4 horas em ${f}`,
    (f)    => `Remoção de manchas de comida e bebidas que desvalorizam o espaço de refeições em ${f}`,
    (f)    => `Técnicos treinados para todos os tipos de estofo de cadeira presentes nos lares de ${f}`,
    (f, c) => `Orçamento gratuito antes de qualquer trabalho nas suas cadeiras em ${f}, ${c}`,
  ],
  "limpeza-alcatifas": [
    (f, c) => `Limpeza ao domicílio em ${f}: tratamos a alcatifa no local, sem corte ou remoção em ${c}`,
    (f)    => `Recuperação de cor e textura em alcatifas desgastadas de ${f}, com resultados visíveis`,
    (f)    => `Eliminação de sujidade profunda que a aspiração doméstica de ${f} não consegue remover`,
    (f, c) => `Cobertura total em ${f} e toda a área de ${c}, com deslocação calculada pela distância`,
    (f)    => `Secagem eficiente: a alcatifa de ${f} fica pronta em poucas horas com o nosso equipamento`,
    (f)    => `Técnicos especializados em alcatifas de todos os tamanhos e materiais presentes em ${f}`,
    (f)    => `Remoção de manchas difíceis e odores persistentes que afetam o ambiente em ${f}`,
    (f, c) => `Orçamento gratuito e adaptado à sua alcatifa em ${f}, ${c}`,
  ],
  "impermeabilizacao": [
    (f, c) => `Aplicação ao domicílio em ${f}: o estofo é impermeabilizado na sua casa em ${c}`,
    (f)    => `Proteção invisível e duradoura para os seus estofos em ${f}, sem alterar o aspeto ou toque do tecido`,
    (f)    => `Barreira eficaz contra derrames: ideal para famílias com crianças e animais em ${f}`,
    (f, c) => `Cobertura total em ${f} e toda a área de ${c}, com deslocação calculada pela distância`,
    (f)    => `Tratamento que prolonga a vida útil dos estofos de ${f} e reduz custos futuros com limpezas`,
    (f)    => `Produtos certificados e seguros para crianças, bebés e animais de estimação em ${f}`,
    (f)    => `Eficaz em todos os tipos de tecido presentes nos lares de ${f}: linho, veludo, microfibra e mais`,
    (f, c) => `Orçamento gratuito e personalizado para impermeabilizar os seus estofos em ${f}, ${c}`,
  ],
};

// ─── FAQ Pools (service-specific, ALL answers reference f and c) ──

interface FAQTemplate {
  question: (svc: string, f: string) => string;
  answer: (svc: string, f: string, price: string, c: string) => string;
}

const faqsByService: Record<string, FAQTemplate[]> = {
  "limpeza-sofas": [
    {
      question: (svc, f) => `Quanto custa a limpeza de sofá em ${f}?`,
      answer: (svc, f, price, c) => `A limpeza de sofá em ${f}, ${c} começa a partir de ${price}. O preço final depende do tamanho e estado do sofá. Pedimos sempre um orçamento gratuito antes de qualquer trabalho.`,
    },
    {
      question: (svc, f) => `Fazem limpeza de sofá ao domicílio em ${f}?`,
      answer: (svc, f, price, c) => `Sim, deslocamo-nos diretamente a ${f}, ${c} com todo o equipamento. Não precisa de transportar nada: limpamos o sofá na sua própria sala.`,
    },
    {
      question: (svc, f) => `Quanto tempo demora a limpeza de sofá em ${f}?`,
      answer: (svc, f, price, c) => `Em ${f}, a limpeza de um sofá de 2 a 3 lugares demora entre 1 a 2 horas. O sofá fica pronto a usar em 4 a 6 horas após a secagem completa.`,
    },
    {
      question: (svc, f) => `Conseguem remover manchas antigas do sofá em ${f}?`,
      answer: (svc, f, price, c) => `Na maioria dos casos sim. Em ${f}, a nossa extração com água quente remove manchas de café, vinho e gordura. Manchas com mais de um ano podem ser mais difíceis, mas avaliamos sempre antes de começar.`,
    },
    {
      question: (svc, f) => `Os produtos usados na limpeza de sofá em ${f} são seguros para crianças?`,
      answer: (svc, f, price, c) => `Sim. Em ${f} utilizamos exclusivamente produtos certificados e hipoalergénicos, completamente seguros para crianças, bebés e todos os animais de estimação.`,
    },
    {
      question: (svc, f) => `Trabalham ao fim-de-semana em ${f}?`,
      answer: (svc, f, price, c) => `Sim, temos agendamento disponível de segunda a sábado em ${f}, ${c}. Consulte a disponibilidade quando pedir o seu orçamento gratuito.`,
    },
    {
      question: (svc, f) => `A limpeza de sofá em ${f} danifica o tecido?`,
      answer: (svc, f, price, c) => `Não. Em ${f}, os nossos técnicos inspecionam o tecido antes de iniciar. O processo de extração profissional é seguro para todos os tecidos domésticos comuns, incluindo microfibra, veludo e linho.`,
    },
    {
      question: (svc, f) => `Que tipos de sofá limpam em ${f}?`,
      answer: (svc, f, price, c) => `Em ${f} limpamos todos os tipos de sofá: tecido, microfibra, veludo, linho e pele sintética. Cada material recebe o tratamento mais adequado ao seu tipo de fibra.`,
    },
  ],
  "limpeza-colchoes": [
    {
      question: (svc, f) => `Quanto custa a limpeza de colchão em ${f}?`,
      answer: (svc, f, price, c) => `A limpeza de colchão em ${f}, ${c} começa a partir de ${price}. O preço varia com o tamanho do colchão. Peça o seu orçamento gratuito sem compromisso.`,
    },
    {
      question: (svc, f) => `Fazem limpeza de colchão ao domicílio em ${f}?`,
      answer: (svc, f, price, c) => `Sim, deslocamo-nos a ${f}, ${c} com todo o equipamento. O colchão não precisa de sair do quarto: limpamos e higienizamos no local.`,
    },
    {
      question: (svc, f) => `Quanto tempo demora a limpeza do colchão em ${f}?`,
      answer: (svc, f, price, c) => `Em ${f}, a limpeza de um colchão de casal demora entre 45 minutos a 1 hora. O colchão fica pronto a usar em 3 a 5 horas, com secagem completa.`,
    },
    {
      question: (svc, f) => `A limpeza de colchão em ${f} elimina os ácaros?`,
      answer: (svc, f, price, c) => `Sim. Em ${f}, o nosso processo de extração com água quente elimina 99% dos ácaros e bactérias presentes no colchão, com melhoria imediata para quem sofre de alergias.`,
    },
    {
      question: (svc, f) => `A limpeza de colchão em ${f} é indicada para bebés e crianças?`,
      answer: (svc, f, price, c) => `Sim, é especialmente recomendada para famílias de ${f} com bebés. Utilizamos produtos hipoalergénicos certificados, completamente seguros para colchões de cama de criança.`,
    },
    {
      question: (svc, f) => `Com que frequência devo limpar o colchão em ${f}?`,
      answer: (svc, f, price, c) => `Em ${f}, recomendamos limpeza profissional do colchão a cada 12 meses. Para colchões de crianças ou pessoas com alergias em ${c}, cada 6 meses é o ideal.`,
    },
    {
      question: (svc, f) => `A limpeza remove manchas de urina do colchão em ${f}?`,
      answer: (svc, f, price, c) => `Na maioria dos casos sim. Em ${f}, o nosso tratamento específico remove manchas de urina e elimina o odor associado, mesmo em situações mais antigas.`,
    },
    {
      question: (svc, f) => `Trabalham ao fim-de-semana para limpeza de colchão em ${f}?`,
      answer: (svc, f, price, c) => `Sim, temos disponibilidade de segunda a sábado em ${f}, ${c}. Contacte-nos para confirmar o horário mais conveniente para a sua família.`,
    },
  ],
  "limpeza-tapetes": [
    {
      question: (svc, f) => `Quanto custa a limpeza de tapete em ${f}?`,
      answer: (svc, f, price, c) => `A limpeza de tapete em ${f}, ${c} é sempre orçamentada à medida de cada tapete. O preço varia com o tamanho e tipo de fibra. Peça o seu orçamento gratuito.`,
    },
    {
      question: (svc, f) => `Fazem limpeza de tapete ao domicílio em ${f}?`,
      answer: (svc, f, price, c) => `Sim, deslocamo-nos a ${f}, ${c} com todo o equipamento profissional. Tratamos o tapete no local, sem necessidade de o transportar.`,
    },
    {
      question: (svc, f) => `Quanto tempo demora a limpeza de tapete em ${f}?`,
      answer: (svc, f, price, c) => `Em ${f}, a limpeza de um tapete de sala demora entre 30 a 60 minutos. O tapete fica pronto a usar em 2 a 4 horas, consoante o tipo de fibra.`,
    },
    {
      question: (svc, f) => `Conseguem limpar tapetes de lã e peças artesanais em ${f}?`,
      answer: (svc, f, price, c) => `Sim. Em ${f}, os nossos técnicos são treinados para trabalhar com tapetes de lã, seda e fibras naturais, adaptando o processo a cada tipo de material.`,
    },
    {
      question: (svc, f) => `A limpeza devolve a cor original ao tapete em ${f}?`,
      answer: (svc, f, price, c) => `Na grande maioria dos casos sim. Em ${f}, a nossa extração profissional remove a sujidade que opacifica os pigmentos, devolvendo a vivacidade e cor originais ao tapete.`,
    },
    {
      question: (svc, f) => `A limpeza de tapete em ${f} elimina os ácaros?`,
      answer: (svc, f, price, c) => `Sim. Em ${f}, a extração com água quente elimina os ácaros e alergénios presentes nas fibras do tapete, algo que a aspiração doméstica normal não consegue fazer.`,
    },
    {
      question: (svc, f) => `Os produtos são seguros para tapetes delicados em ${f}?`,
      answer: (svc, f, price, c) => `Sim. Em ${f}, escolhemos os produtos em função do tipo de fibra. Para tapetes delicados, usamos tratamentos suaves certificados que não danificam nem descolorem o material.`,
    },
    {
      question: (svc, f) => `Trabalham ao fim-de-semana para limpeza de tapetes em ${f}?`,
      answer: (svc, f, price, c) => `Sim, temos disponibilidade de segunda a sábado em ${f}, ${c}. Contacte-nos para confirmar o horário disponível e agendar a sua limpeza.`,
    },
  ],
  "limpeza-cadeiras": [
    {
      question: (svc, f) => `Quanto custa a limpeza de cadeiras estofadas em ${f}?`,
      answer: (svc, f, price, c) => `A limpeza de cadeiras em ${f}, ${c} começa a partir de ${price} por cadeira. O preço por unidade diminui quando limpamos várias cadeiras no mesmo serviço. Peça o seu orçamento.`,
    },
    {
      question: (svc, f) => `Fazem limpeza de cadeiras ao domicílio em ${f}?`,
      answer: (svc, f, price, c) => `Sim, deslocamo-nos a ${f}, ${c}. As cadeiras ficam na sua casa durante todo o processo: limpamos no local sem qualquer necessidade de transporte.`,
    },
    {
      question: (svc, f) => `Quanto tempo demora a limpeza de cadeiras em ${f}?`,
      answer: (svc, f, price, c) => `Em ${f}, a limpeza de um conjunto de 6 cadeiras demora entre 1 a 2 horas. As cadeiras ficam prontas a usar em 3 a 4 horas após a secagem completa.`,
    },
    {
      question: (svc, f) => `Conseguem remover manchas de comida antigas nas cadeiras em ${f}?`,
      answer: (svc, f, price, c) => `Sim. Em ${f}, a nossa extração profissional remove manchas de molhos, sumos e alimentos mesmo quando já estão antigas e secas no tecido.`,
    },
    {
      question: (svc, f) => `Os produtos são seguros para cadeiras de couro em ${f}?`,
      answer: (svc, f, price, c) => `Sim. Em ${f}, utilizamos produtos específicos para cada material. Para cadeiras de couro, aplicamos também um tratamento hidratante que protege e nutre o material.`,
    },
    {
      question: (svc, f) => `Vale a pena limpar profissionalmente cadeiras velhas em ${f}?`,
      answer: (svc, f, price, c) => `Na maioria dos casos sim. Em ${f}, a limpeza profissional pode renovar completamente o aspeto de cadeiras com vários anos de uso, poupando o custo de substituição.`,
    },
    {
      question: (svc, f) => `Trabalham ao fim-de-semana para limpeza de cadeiras em ${f}?`,
      answer: (svc, f, price, c) => `Sim, temos disponibilidade de segunda a sábado em ${f}, ${c}. Contacte-nos para agendar o horário mais conveniente para si.`,
    },
    {
      question: (svc, f) => `Fazem limpeza de cadeiras de escritório em ${f}?`,
      answer: (svc, f, price, c) => `Sim. Em ${f}, limpamos cadeiras de escritório, cadeiras de sala de jantar, poltronas e qualquer tipo de cadeira estofada, independentemente do material.`,
    },
  ],
  "limpeza-alcatifas": [
    {
      question: (svc, f) => `Quanto custa a limpeza de alcatifa em ${f}?`,
      answer: (svc, f, price, c) => `A limpeza de alcatifa em ${f}, ${c} começa a partir de ${price}. O preço depende da área a tratar. Peça o seu orçamento gratuito para saber o valor exato.`,
    },
    {
      question: (svc, f) => `Fazem limpeza de alcatifa ao domicílio em ${f}?`,
      answer: (svc, f, price, c) => `Sim, deslocamo-nos a ${f}, ${c} com equipamento de extração profissional. Limpamos a alcatifa no local, sem necessidade de a retirar ou cortar.`,
    },
    {
      question: (svc, f) => `Quanto tempo demora a limpeza de alcatifa em ${f}?`,
      answer: (svc, f, price, c) => `Em ${f}, uma alcatifa de sala (25-30m²) demora entre 1 a 2 horas. A secagem completa leva entre 4 a 8 horas, consoante a espessura das fibras.`,
    },
    {
      question: (svc, f) => `A limpeza de alcatifa danifica o pavimento em ${f}?`,
      answer: (svc, f, price, c) => `Não. Em ${f}, o nosso processo de extração controla a quantidade de humidade utilizada. O pavimento subjacente não é afetado pelo processo de limpeza.`,
    },
    {
      question: (svc, f) => `Conseguem limpar alcatifas de escritório em ${f}?`,
      answer: (svc, f, price, c) => `Sim. Em ${f} temos equipamento adequado para alcatifas de grandes dimensões em escritórios e espaços comerciais. Realizamos o serviço fora do horário de trabalho se necessário.`,
    },
    {
      question: (svc, f) => `Com que frequência devo limpar a alcatifa em ${f}?`,
      answer: (svc, f, price, c) => `Em ${f}, recomendamos limpeza profissional a cada 12 meses para uso doméstico, e a cada 6 meses para zonas de tráfego intenso ou casas com animais em ${c}.`,
    },
    {
      question: (svc, f) => `A limpeza de alcatifa em ${f} elimina odores persistentes?`,
      answer: (svc, f, price, c) => `Sim. Em ${f}, a extração profissional com água quente elimina os odores na raiz, incluindo cheiros de animais, humidade e uso prolongado.`,
    },
    {
      question: (svc, f) => `Trabalham ao fim-de-semana para limpeza de alcatifas em ${f}?`,
      answer: (svc, f, price, c) => `Sim, temos disponibilidade de segunda a sábado em ${f}, ${c}. Para espaços comerciais, podemos acordar horários fora do período normal de funcionamento.`,
    },
  ],
  "impermeabilizacao": [
    {
      question: (svc, f) => `Quanto custa a impermeabilização de sofá em ${f}?`,
      answer: (svc, f, price, c) => `Em ${f}, ${c}, a versão Essencial começa a partir de ${price} e a versão Premium, mais resistente e duradoura, tem um valor um pouco superior. É frequentemente mais económico combinar a Essencial com a limpeza num único serviço. Peça o seu orçamento.`,
    },
    {
      question: (svc, f) => `Fazem impermeabilização ao domicílio em ${f}?`,
      answer: (svc, f, price, c) => `Sim, deslocamo-nos a ${f}, ${c} com os produtos e equipamento necessários. O tratamento é aplicado diretamente na sua casa, no local onde está o estofo.`,
    },
    {
      question: (svc, f) => `Quanto tempo dura o efeito da impermeabilização em ${f}?`,
      answer: (svc, f, price, c) => `Depende da versão escolhida. Em ${f}, a versão Essencial (à base de água) dura entre 1 a 2 anos consoante o uso. A versão Premium (à base de diluente), mais resistente ao desgaste, dura até 10 anos e aguenta mais lavagens.`,
    },
    {
      question: (svc, f) => `Qual a diferença entre a Essencial e a Premium em ${f}?`,
      answer: (svc, f, price, c) => `A Essencial é à base de água e aguenta até 2 lavagens. A Premium é à base de diluente, mais resistente ao desgaste, e aguenta até 5 lavagens, com proteção real até 10 anos. Para casas com crianças ou animais em ${f}, costumamos recomendar a Premium.`,
    },
    {
      question: (svc, f) => `A impermeabilização altera o aspeto do sofá em ${f}?`,
      answer: (svc, f, price, c) => `Não. Em ${f}, o tratamento que aplicamos é completamente invisível e não altera a cor, textura ou toque do tecido. O sofá fica exatamente igual, mas protegido.`,
    },
    {
      question: (svc, f) => `Os produtos de impermeabilização em ${f} são seguros para crianças?`,
      answer: (svc, f, price, c) => `Sim. Em ${f}, utilizamos produtos certificados e hipoalergénicos, completamente seguros para crianças, bebés e animais de estimação após a secagem do tratamento.`,
    },
    {
      question: (svc, f) => `Quando é o melhor momento para impermeabilizar o sofá em ${f}?`,
      answer: (svc, f, price, c) => `O melhor momento em ${f} é imediatamente após uma limpeza profissional. Com o estofo limpo, o produto penetra melhor nas fibras e a proteção resultante é mais eficaz e duradoura.`,
    },
    {
      question: (svc, f) => `A impermeabilização funciona em todos os tipos de tecido em ${f}?`,
      answer: (svc, f, price, c) => `Sim, em ${f} aplicamos impermeabilização em tecido, microfibra, veludo e linho. Para pele natural, usamos um tratamento específico de hidratação e proteção.`,
    },
    {
      question: (svc, f) => `Trabalham ao fim-de-semana para impermeabilização em ${f}?`,
      answer: (svc, f, price, c) => `Sim, temos disponibilidade de segunda a sábado em ${f}, ${c}. Contacte-nos para agendar o horário mais conveniente para si.`,
    },
  ],
};

// ─── Main Generator ──────────────────────────────────────────────

export interface DynamicFreguesiaContent {
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  localSection: string;
  problems: { title: string; description: string }[];
  howItWorks: string;
  benefits: string[];
  faqs: { question: string; answer: string }[];
}

export function getDynamicContent(
  serviceName: string,
  serviceSlug: string,
  priceFrom: string,
  freguesiaName: string,
  freguesiaSlug: string,
  municipio: string,
): DynamicFreguesiaContent {
  const seed = getSeed(`${serviceSlug}-${freguesiaSlug}`);
  const localData = getLocalData(freguesiaSlug, freguesiaName, municipio);

  const intro = pick(introTemplates, seed)(freguesiaName, municipio, serviceName, priceFrom);
  const metaDescription = pick(metaDescTemplates, seed + 3)(serviceName, freguesiaName, municipio, priceFrom);
  const howItWorks = pick(howItWorksTemplates, seed + 7)(freguesiaName, municipio, serviceName, priceFrom);

  // Problems: service-specific pool, pick 4
  const serviceProblems = problemsByService[serviceSlug] ?? problemsByService["limpeza-sofas"];
  const selectedProblems = pickN(serviceProblems, seed + 11, 4).map(p => ({
    title: p.title,
    description: p.description(freguesiaName),
  }));

  // Benefits: service-specific location-aware templates, pick 6
  const serviceBenefits = benefitsByService[serviceSlug] ?? benefitsByService["limpeza-sofas"];
  const benefits = pickN(serviceBenefits, seed + 13, 6).map(fn => fn(freguesiaName, municipio));

  // FAQs: service-specific pool, pick 4 — all answers reference f and c
  const serviceFaqs = faqsByService[serviceSlug] ?? faqsByService["limpeza-sofas"];
  const selectedFaqs = pickN(serviceFaqs, seed + 17, 4).map(faq => ({
    question: faq.question(serviceName, freguesiaName),
    answer: faq.answer(serviceName, freguesiaName, priceFrom, municipio),
  }));

  const landmarkList = localData.landmarks.join(', ');
  const localSection = `Prestamos serviço em ${freguesiaName}, perto de ${landmarkList}. ${localData.localTip}`;

  return {
    title: `${serviceName} em ${freguesiaName}, ${municipio} | ${/^\d/.test(priceFrom) ? `Desde ${priceFrom}` : 'Orçamento Grátis'} | Kyro Clean Solutions`,
    metaDescription,
    h1: `${serviceName} em ${freguesiaName}`,
    intro: `${intro} ${localSection}`,
    localSection,
    problems: selectedProblems,
    howItWorks,
    benefits,
    faqs: selectedFaqs,
  };
}
