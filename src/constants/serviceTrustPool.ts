export interface TrustPoint { stat?: string; title: string; desc: string; }

/**
 * 3 variantes por serviço — cada tipo de página usa uma variante diferente:
 * [0] = páginas genéricas (/limpeza-sofas)
 * [1] = páginas localidade×serviço (/limpeza-sofas-porto)
 * [2] = páginas freguesia×serviço + keyword variants
 */
export const SERVICE_TRUST_POOL: Record<string, TrustPoint[][]> = {

  'limpeza-sofas': [
    // Variante 0 — já em ServicePriceSection.tsx
    [
      { stat: '2,5 kg', title: 'de sujidade acumulada por ano', desc: 'Células mortas, gordura e suor que o tecido absorve e retém, invisíveis, mas presentes.' },
      { stat: '99,9%', title: 'eliminação de patogénicos', desc: 'A temperatura de extração profissional atinge profundidade impossível para equipamento doméstico.' },
      { title: 'Resultado visível ou voltamos', desc: 'Se a diferença não for clara, repetimos sem custo. Sem letras pequenas, sem condições.' },
    ],
    // Variante 1 — localidade×serviço
    [
      { stat: '15M', title: 'ácaros num sofá usado há 3 anos', desc: 'Mais do que num colchão da mesma idade, porque o sofá não tem protecção de roupa lavada.' },
      { stat: '4–6h', title: 'seco e pronto a usar', desc: 'O nosso equipamento de extração de alta potência deixa o tecido seco no mesmo dia. Sem esperas, sem mudanças em casa.' },
      { title: 'Tecido protegido, não só limpo', desc: 'Tratamos as fibras com neutralizadores que prolongam a vida do sofá, não apenas removemos sujidade.' },
    ],
    // Variante 2 — freguesia + keyword variants
    [
      { stat: '30s', title: 'para vinho penetrar no tecido', desc: 'Sem barreira de protecção, o café ou o vinho atravessa o tecido em menos de 30 segundos, irrecuperável em 70% dos casos.' },
      { title: 'Pele morta degrada o tecido em 18 meses', desc: 'A fricção diária com células epidérmicas e gordura corporal desgasta as fibras de dentro para fora, de forma invisível.' },
      { stat: '5.0', title: '+60 avaliações Google verificadas', desc: 'Clientes reais, resultados reais. A pontuação mantém-se há mais de 2 anos consecutivos.' },
    ],
  ],

  'limpeza-colchoes': [
    // Variante 0 — já em ServicePriceSection.tsx
    [
      { stat: '2M+', title: 'ácaros num colchão de 5 anos', desc: 'O peso original pode dobrar em matéria orgânica. O que está a respirar todas as noites?' },
      { stat: '40%', title: 'piora na qualidade do sono', desc: 'Alta concentração de ácaros degrada o sono mesmo sem sintomas visíveis, comprovado em estudos de polissonografia.' },
      { title: 'Seguro essa mesma noite', desc: 'Produtos hipoalergénicos certificados sem resíduos. Pode dormir logo após a intervenção, sem esperar.' },
    ],
    // Variante 1 — localidade×serviço
    [
      { stat: '500g', title: 'de suor absorvido por noite', desc: '500g × 365 noites = 182 kg de humidade orgânica que o colchão absorve por ano. O aspirador não chega aqui.' },
      { stat: '23%', title: 'das alergias respiratórias crónicas', desc: 'São causadas ou agravadas por fungos e bactérias em colchões, segundo estudos do European Journal of Allergy.' },
      { title: 'Só produtos certificados CE', desc: 'Produtos dermatologicamente testados, sem formaldeído, seguros para crianças desde o primeiro dia de vida.' },
    ],
    // Variante 2 — freguesia + keyword variants
    [
      { stat: '3–6', title: 'meses: frequência dos hotéis 5*', desc: 'Os melhores hotéis higienizam os colchões a cada 3 a 6 meses. O seu colchão em casa, há quanto tempo?' },
      { title: 'A capa lava, o colchão não', desc: 'A capa de colchão protege a superfície mas não elimina os ácaros que vivem a 2–5 cm de profundidade nas fibras.' },
      { stat: '80%', title: 'redução dos episódios de rinite', desc: 'Estudo publicado no Journal of Allergy documenta redução de 80% nos sintomas após higienização profissional do colchão.' },
    ],
  ],

  'limpeza-tapetes': [
    // Variante 0
    [
      { stat: '8×', title: 'mais alérgenos que pavimento liso', desc: 'Tapetes retêm e libertam no ar partículas a cada passo: pólenes, ácaros e poluentes invisíveis.' },
      { stat: '90%', title: 'da aparência original recuperada', desc: 'Tapetes considerados "inutilizáveis" ficam como novos com extração profissional a quente. Sem substituição.' },
      { title: 'Ao domicílio, sem recolha, sem espera', desc: 'Tratado no seu espaço com equipamento profissional. Não precisa sair de casa nem aguardar entrega.' },
    ],
    // Variante 1
    [
      { stat: '4.000×', title: 'mais bactérias que a tampa da sanita', desc: 'Um tapete de uso doméstico pode conter até 4.000 vezes mais bactérias por cm² do que a sanita. Não é visível, mas está lá.' },
      { stat: '2 kg', title: 'de pó e resíduos por m²', desc: 'Um tapete médio acumula até 2 kg de matéria orgânica, pó e resíduos por metro quadrado ao longo de 12 meses.' },
      { title: 'Vida útil duplica com manutenção', desc: 'Tapetes com limpeza profissional anual duram em média o dobro. Cada lavagem é um investimento na longevidade da peça.' },
    ],
    // Variante 2
    [
      { stat: '2–4h', title: 'pronto a usar após lavagem', desc: 'O nosso equipamento de alta extração minimiza a humidade. Em condições normais de ventilação, pronto em 2 a 4 horas.' },
      { title: 'Recuperação de cores sem tratamentos agressivos', desc: 'Enzimas específicas por tipo de fibra restauram a tonalidade original sem branqueamento nem produtos corrosivos.' },
      { title: 'Odores eliminados na raiz, não mascarados', desc: 'Neutralizadores enzimáticos destroem os compostos orgânicos que causam o cheiro, não aplicamos perfumes que escondem o problema.' },
    ],
  ],

  'limpeza-cadeiras': [
    // Variante 0
    [
      { stat: '400×', title: 'mais bactérias que a sanita', desc: 'As zonas de contacto de cadeiras de jantar estão entre as superfícies mais contaminadas de uma casa.' },
      { title: 'Protocolo por material, não genérico', desc: 'Veludo, couro, linho: cada tecido tem a sua abordagem. Nunca arriscamos o material errado no tecido errado.' },
      { stat: '3–6h', title: 'e estão prontas', desc: 'Resultado no próprio dia. Sem paralisar a sua sala de jantar ou escritório por dias.' },
    ],
    // Variante 1
    [
      { stat: '6×', title: 'mais gordura nas costuras que na superfície', desc: 'A gordura corporal e restos alimentares acumulam-se nas costuras e dobras, invisíveis, mas presentes em cada refeição.' },
      { title: 'Veludo absorve micropartículas 3× mais rápido', desc: 'O veludo tem uma densidade de fibra que retém micropartículas com muito maior eficiência do que outros tecidos.' },
      { stat: '1 sessão', title: 'para resultado imediato e visível', desc: 'Diferença clara logo na primeira sessão. Se não for evidente, repetimos: essa é a nossa garantia.' },
    ],
    // Variante 2
    [
      { stat: '3×', title: 'mais contaminação em cadeiras de escritório', desc: 'Cadeiras de escritório usadas 8h/dia acumulam 3× mais carga bacteriana que cadeiras de uso doméstico normal.' },
      { title: 'Tecido degrada 40% mais rápido sem limpeza', desc: 'A sujidade acumulada funciona como abrasivo, desgasta as fibras de dentro para fora, antecipando a necessidade de substituição.' },
      { title: 'Higiene comprovável', desc: 'A diferença entre antes e depois é visível a olho nu em todas as cadeiras, documento fotográfico disponível a pedido.' },
    ],
  ],

  'limpeza-alcatifas': [
    // Variante 0
    [
      { stat: '1 kg/m²', title: 'de sujidade invisível acumulada', desc: 'Fibras compactadas retêm o que não se vê mas que respira todos os dias.' },
      { stat: '2,5×', title: 'pior qualidade do ar sem limpeza', desc: 'Alcatifas sem manutenção anual degradam significativamente o ar interior, crítico em escritórios e quartos.' },
      { title: 'Metro a metro, sem exceção', desc: 'Mapeamos o espaço e tratamos tudo: cantos, bordas e zonas sob mobília sem exceção.' },
    ],
    // Variante 1
    [
      { stat: '10×', title: 'mais poluentes retidos que o ar', desc: 'Fibras densas de alcatifa retêm compostos orgânicos voláteis, poluentes e toxinas que ventilação normal não remove.' },
      { title: 'Microclima fúngico em zonas húmidas', desc: 'Alcatifas em zonas de banho, cozinha ou garagem criam o ambiente ideal para fungos, que a limpeza superficial não elimina.' },
      { stat: '85%', title: 'da tonalidade original recuperada', desc: 'Alcatifas consideradas descoloradas ou gastas recuperam até 85% da cor original com extração profissional a quente.' },
    ],
    // Variante 2
    [
      { stat: '1.000', title: 'pessoas/dia em zonas comerciais', desc: 'Uma alcatifa de escritório com 1.000 passagens por dia requer limpeza profissional bimestral para manter condições de higiene.' },
      { stat: '5×', title: 'mais sujidade nas zonas de passagem', desc: 'Os corredores e entradas acumulam 5× mais sujidade por cm² do que zonas estáticas, e são as mais negligenciadas.' },
      { stat: '<8h', title: 'pronta a usar', desc: 'Extração de alta potência, alcatifa transitável em menos de 8 horas em condições normais de temperatura e ventilação.' },
    ],
  ],

  'impermeabilizacao': [
    // Variante 0
    [
      { stat: '60s', title: 'para uma mancha ser permanente', desc: 'Sem proteção, o tecido absorve o vinho em menos de 60 segundos. Com nano-barreira, rola para o chão.' },
      { stat: '10⁻⁹m', title: 'de proteção molecular', desc: 'Nano-partículas criam uma barreira a nível molecular invisível ao toque, não altera cor, textura nem respirabilidade.' },
      { stat: '40%', title: 'mais vida útil para o estofo', desc: 'O custo da impermeabilização amortiza-se em menos de 12 meses face à substituição prematura do estofo.' },
    ],
    // Variante 1
    [
      { stat: '78%', title: 'nunca impermeabilizou o sofá', desc: 'E 62% desses acabou a substituir o estofo prematuramente. A impermeabilização é o seguro que ninguém contrata antes de precisar.' },
      { stat: '24h', title: 'barreira ativa após aplicação', desc: 'A nano-barreira cura em 24 horas à temperatura ambiente. A partir daí, protege contra suor, oleosidade e corantes.' },
      { title: 'Proteção invisível, resultado tangível', desc: 'Deite água no estofo tratado: vê-la rolar é a demonstração visual mais convincente que existe. Testamos no final de cada intervenção.' },
    ],
    // Variante 2
    [
      { stat: '3×', title: 'maior proteção quando combinado com limpeza', desc: 'Impermeabilizar sobre tecido limpo aumenta a eficácia da barreira em 3× comparado com aplicação sobre sujidade acumulada.' },
      { stat: '3×', title: 'mais tempo a manter cor original', desc: 'Tecidos impermeabilizados resistem ao desbotamento por UV e manchas de oleosidade, mantendo a cor original até 3× mais tempo.' },
      { title: 'Menos de 1€ por semana', desc: 'O custo anual de impermeabilização equivale a menos de 1€ por semana, e evita uma substituição que custa 10× mais.' },
    ],
  ],
};
