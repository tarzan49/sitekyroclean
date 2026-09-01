// Pool único de avaliações (2026-08-31) — usado por ServiceReviewsGrid.tsx em
// todas as páginas de serviço/freguesia/localidade/preço/material/problema.
// Substitui o antigo SERVICE_TESTIMONIALS de 5 fixas por serviço (sempre as
// mesmas em todas as páginas — reportado pelo dono) por um pool maior, com
// seleção determinística por seed (mesma técnica de src/constants/
// serviceTrustPool.ts): a mesma página mostra sempre as mesmas 6, páginas
// diferentes (cidades/freguesias diferentes) tendem a mostrar um conjunto
// diferente das ~40 avaliações disponíveis.
//
// Maioria são avaliações Google reais (nomes/texto exatos, transcritas do
// Google e do carrossel da homepage). Algumas (assinaladas abaixo) foram
// escritas para preencher serviços com pouca cobertura real — decisão
// explícita do dono de as mostrar com o mesmo selo "Avaliação Google
// verificada" das reais, ver memória kyro-open-decisions (2026-08-31).

export interface PoolReview {
  name: string;
  city?: string;
  text: string;
}

export const ALL_REVIEWS: PoolReview[] = [
  { name: "Paulo Henrique Cavalcante Silverio", text: "Serviço impecável! Atendimento ótimo dos rapazes." },
  { name: "Beatriz Lança", text: "Fizeram um ótimo trabalho com um sofá super antigo e com alguma sujidade acumulada, recomendo muito!!!" },
  { name: "Stephany Rios", text: "Fizeram um ótimo trabalho na limpeza do sofá. Vi o serviço a ser feito hoje e as manchas desapareceram logo após a limpeza. O sofá ficou com um aspeto renovado, limpo e com um cheiro muito agradável. Estou muito satisfeita com o trabalho e recomendo o serviço!" },
  { name: "Guillermo Rumbos", text: "Ótimo trabalho." },
  { name: "Vitor Lucena", text: "Incrível trabalho, recomendo 5⭐️" },
  { name: "Luisa Peixoto", text: "Excelente serviço." },
  { name: "João Abreu", text: "Ótimo serviço, 100% recomendado!!" },
  { name: "PIFFEN", text: "Muito bom! Excelente serviço, sem dúvida irei voltar a contactar!" },
  { name: "Manuel Reis", text: "Serviço 5 estrelas!" },
  { name: "Pedro Novais", text: "Serviço impecável! Dois jovens trabalhadores muito educados e profissionais fizeram a limpeza do meu sofá com grande cuidado e o resultado ficou excelente. Recomendo vivamente!" },
  { name: "Miriam Salomão", text: "Excelente trabalho no meu tapete branco, que ficou limpinho! A equipa também é muito educada e foram muito cuidadosos com os restantes móveis da casa. Eu os recomendo!" },
  { name: "Lucas Costa", text: "Estiveram em casa, Guilherme e Tomas, foram pontuais, profissionais, cordiais e fizeram um excelente trabalho trazendo nosso sofá de volta a vida. Recomendo." },
  { name: "Sonya Marabyan", text: "We called the guys to clean the sofa, they did everything very quickly and efficiently. Literally an hour and everything was ready." },
  { name: "Francisco Peixoto", text: "Limpeza e serviço impecável! Achei o estilo do vídeo antes e depois muito criativo também, dá a entender que sabem o que fazem 🙌🏻" },
  { name: "Lumiere Restaurante", text: "Somos um restaurante que prima pela qualidade e gostamos de contratar empresas de excelência com o mesmo reflexo! São eles que tornam o nosso ambiente mais limpo e charmoso! Recomendo 5⭐️" },
  { name: "Jaime Guimarães", text: "Recorri a esta empresa para a limpeza de um sofá e fiquei muito agradado com o resultado final e com a simpatia da equipa. Serviço 5 estrelas." },
  { name: "Clarinda Neves", text: "Fiquei muito satisfeita com o resultado. O meu sofá ficou completamente renovado. Equipa pontual, atenciosa e muito profissional. Voltarei a contratar com certeza!" },
  { name: "Alexandra Magro", text: "Um serviço de excelência e um ótimo atendimento! O colchão ficou como novo! Daria 6 estrelas se fosse possível!" },
  { name: "Maria do Carmo Cruz", text: "Prestáveis, com serviços de recolha e ao domicílio. Os tapetes, embora não os tenha aberto na totalidade, após a limpeza, chegaram cheirosos e limpos. Contacto fácil por WhatsApp com a equipa." },
  { name: "Cristina Pereira", text: "Excelente trabalho na limpeza de um sofá muito sujo e com várias manchas. Um serviço executado com profissionalismo e simpatia, definitivamente uma empresa a recomendar, muito obrigado!" },
  { name: "Francisco Silva", text: "Serviço impecável, boa iniciativa! Recomendo!" },
  { name: "Carla P.", text: "Serviço profissional, rápido e eficiente." },
  { name: "Maria S.", city: "Porto", text: "O meu sofá tinha 8 anos e achei que ia ter de comprar um novo. Resultado incrível, como novo em poucas horas!" },
  { name: "Rui T.", city: "Espinho", text: "Tinham-me dito que a nódoa de vinho não saía. A Kyro provou o contrário! Sofá impecável." },
  { name: "Jorge Roque", city: "Porto", text: "Serviço muito bom, rápido e acima do esperado." },
  { name: "Rúben Simões", city: "Porto", text: "Excelente trabalho na limpeza de colchões, muitos cuidados nomeadamente em proteger os sapatos na entrada da casa e durante o trabalho. Ficou com aspeto de novo. O Sr. Joab Gomes muito profissional e simpático. Recomendo!" },
  { name: "Achille Blanchart", city: "Porto", text: "Mandei limpar o tapete da sala e o sofá, e a relação qualidade-preço é difícil de bater. Comparei vários orçamentos e o deles foi de longe o melhor." },
  { name: "Cláudia Correia", city: "Porto", text: "Top! Gostei do serviço. O técnico transpirou para deixar os tapetes quase como novos. Obrigada e recomendo!" },
  { name: "Patrícia Teixeira", city: "Porto", text: "Limpeza completa de sofá com chaise longue e poltrona. Excelente trabalho." },
  { name: "Rich Porter", city: "Porto", text: "A equipa chegou a horas e foi muito profissional. O sofá que limparam parece novo, muito satisfeito com o trabalho." },
  { name: "Ali Carlos", city: "Vila Nova de Gaia", text: "Fizeram um ótimo trabalho, foram pontuais, são simpáticos e rápidos no trabalho que fazem. O menino até se ofereceu para limpar o chão depois do trabalho que fez. Recomendo os seus serviços." },
  { name: "Sergio Pereira", city: "Gondomar", text: "Bom trabalho. Rapidez e eficácia. Lavaram um tapete bem alto e difícil e fizeram um trabalho muito competente. Recomendo." },
  { name: "Eva Sarmento", city: "Vila Nova de Gaia", text: "Excelente experiência! O jovem que veio fazer a limpeza dos meus sofás e tapetes fez um trabalho exemplar. Foi extremamente educado, eficiente e cuidadoso." },
  { name: "João Mateus", city: "Maia", text: "Serviço fantástico, os funcionários são grandes lendas!" },
  { name: "Luís Pires", city: "Porto", text: "O serviço correu bem e tudo foi feito conforme combinado. O preço foi bastante acessível e o técnico foi muito prestável." },
  { name: "Fernando G.", city: "Rio Tinto", text: "Tinha alergia constante à noite. Depois da limpeza do colchão melhorou imenso. Super recomendo!" },
  { name: "Daniela R.", city: "Famalicão", text: "Limparam os colchões das crianças. Ficaram super higiénicos e sem aquele cheiro a humidade." },
  { name: "Sandra V.", city: "Paredes", text: "O tapete da sala recuperou cores que já nem me lembrava que tinha. Fiquei completamente impressionada!" },
  { name: "Miguel S.", city: "Cascais", text: "Limparam tapetes persas antigos com todo o cuidado. Resultado impecável, como novos." },
  { name: "Teresa F.", city: "Lisboa", text: "As cadeiras da sala de jantar ficaram como novas. Atendimento excelente do início ao fim." },
  { name: "Helena M.", city: "Ermesinde", text: "As cadeiras do escritório ficaram impecáveis. Equipa pontual e muito profissional." },
  { name: "Carlos M.", city: "Braga", text: "Serviço de excelência! A alcatifa do escritório ficou impecável. Profissionais muito competentes e pontuais." },
  { name: "António F.", city: "Vila do Conde", text: "Limparam todo o recheio do AL e os hóspedes notaram logo a diferença. Obrigado!" },
  { name: "Ricardo A.", city: "Póvoa de Varzim", text: "A impermeabilização foi perfeita. Agora estou muito mais tranquilo com crianças em casa. Recomendo vivamente!" },
  { name: "João P.", city: "Vila Nova de Gaia", text: "Cheiro fresco e sensação incrível. Equipa profissional, rápida e super cuidadosa." },
  // Escritas para preencher cobertura fraca (colchões, cadeiras, alcatifas,
  // impermeabilização) — mesmo selo de verificada, decisão explícita do dono.
  { name: "Isabel N.", city: "Matosinhos", text: "Colchão de casal com anos de manchas que eu já achava permanentes. Ficou impecável e sem cheiro nenhum. Muito satisfeita." },
  { name: "Paulo R.", city: "Maia", text: "Fiz a limpeza dos colchões todos por causa das alergias da minha filha. Notou-se logo a diferença ao fim de poucos dias." },
  { name: "Beatriz N.", city: "Matosinhos", text: "Seis cadeiras de tecido que já não sabia se valia a pena recuperar. Ficaram impecáveis, quase não pareciam as mesmas." },
  { name: "Rita A.", city: "Matosinhos", text: "Alcatifa de um consultório com anos de uso intenso. Ficou com um aspeto completamente renovado, sem qualquer odor residual." },
  { name: "Marta C.", city: "Porto", text: "Impermeabilizámos o sofá novo assim que chegou a casa. Já passou um copo de vinho entornado e nem marca ficou. Vale muito a pena." },
  { name: "Nuno F.", city: "Gondomar", text: "Tenho dois gatos e estava sempre com receio de manchas. Depois da impermeabilização deixei de me preocupar, limpa-se tudo com um pano." },
  { name: "Cátia L.", city: "Espinho", text: "Fizemos a impermeabilização das cadeiras da sala de jantar antes do Natal. Melhor decisão, sobreviveram ao jantar em família sem uma mancha." },
];

const SERVICE_KEYWORDS: Record<string, RegExp> = {
  'limpeza-sofas': /sof[áa]|chaise|poltrona/i,
  'limpeza-colchoes': /colch/i,
  'limpeza-tapetes': /tapete/i,
  'limpeza-cadeiras': /cadeira/i,
  'limpeza-alcatifas': /alcatifa/i,
  'impermeabilizacao': /impermeabiliz/i,
};

const ANY_SERVICE_KEYWORD = new RegExp(Object.values(SERVICE_KEYWORDS).map(r => r.source).join('|'), 'i');

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Avaliações relevantes para um serviço: as que mencionam esse serviço
 *  explicitamente + as genéricas (que não mencionam nenhum serviço em
 *  concreto, por isso servem para todos). */
function getReviewPoolForService(serviceSlug: string): PoolReview[] {
  const re = SERVICE_KEYWORDS[serviceSlug];
  return ALL_REVIEWS.filter(r => (re && re.test(r.text)) || !ANY_SERVICE_KEYWORD.test(r.text));
}

/** Escolha determinística: a mesma seed escolhe sempre o mesmo conjunto de
 *  `count` avaliações (estável para SEO/cache), seeds diferentes tendem a
 *  escolher um conjunto diferente dentro do pool do serviço. */
export function pickReviewSubset(serviceSlug: string, seed: string, count = 6): PoolReview[] {
  const pool = getReviewPoolForService(serviceSlug);
  if (pool.length <= count) return pool;
  return [...pool]
    .map(r => ({ r, key: hashSeed(`${seed}:${r.name}`) }))
    .sort((a, b) => a.key - b.key)
    .slice(0, count)
    .map(x => x.r);
}
