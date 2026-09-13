import { AVAILABILITY_PROMISE, DRYING_PROMISE, PRICE_PROMISE, RESPONSE_PROMISE, SATISFACTION_PROMISE, TREATMENT_EXTRAS } from '../constants/commercialPolicy';
import { locationPrices } from '../constants/travel';
import { LANDING_FAQ_EXPANSION } from './landingFaqExpansion';

/** Shared by React and prerender. Do not import assets, React or locationSeoData here. */
export const LANDING_FAQ_COUNT = 4;
export type LandingService = 'limpeza-sofas' | 'limpeza-colchoes' | 'limpeza-tapetes' | 'limpeza-cadeiras' | 'limpeza-alcatifas' | 'impermeabilizacao';
export type FaqTopic = 'orcamento' | 'preparacao' | 'tratamento' | 'cuidados';
export interface LandingFaqContext {
  serviceSlug: LandingService;
  /** Stable page identity, including family, municipality and parish where applicable. */
  pageKey: string;
  municipality: string;
  family: 'localidade' | 'freguesia' | 'preco' | 'variante';
}
export interface LandingFaq { question: string; answer: string }
export interface FaqEntry {
  id: string;
  topic: FaqTopic;
  question: string;
  answer: string | ((context: LandingFaqContext) => string);
  /** Limits piece-specific questions on sofa/chair waterproofing variant pages. */
  article?: 'sofa' | 'cadeiras';
}

const topics: readonly FaqTopic[] = ['orcamento', 'preparacao', 'tratamento', 'cuidados'];
const common: readonly FaqEntry[] = [
  { id: 'estimativa', topic: 'orcamento', question: 'O valor do simulador é o preço final?', answer: PRICE_PROMISE },
  { id: 'deslocacao', topic: 'orcamento', question: 'A deslocação está incluída no preço do serviço?', answer: ({ municipality }) => {
    const fee = locationPrices[municipality];
    return fee === undefined
      ? 'A deslocação é cobrada separadamente. Indique a localidade e a morada para confirmarmos o valor antes da marcação.'
      : `A deslocação é cobrada separadamente dos serviços. A taxa da tabela para ${municipality} é ${fee}€. Confirmamos a morada e o total do pedido antes da marcação.`;
  } },
  { id: 'orcamento-gratuito', topic: 'orcamento', question: 'Pedir orçamento tem algum custo ou compromisso?', answer: `O orçamento é gratuito e sem compromisso. Envie fotografias, quantidades e localidade para avaliarmos o pedido. ${RESPONSE_PROMISE}.` },
  { id: 'marcacao', topic: 'preparacao', question: 'É possível marcar para hoje ou amanhã?', answer: AVAILABILITY_PROMISE },
  { id: 'acesso', topic: 'preparacao', question: 'Que informações sobre o acesso devo indicar?', answer: 'Indique o piso, a existência de elevador e eventuais restrições de acesso ou estacionamento. Estes detalhes ajudam a equipa a organizar a visita e a confirmar as condições antes da marcação.' },
  { id: 'fotografias', topic: 'preparacao', question: 'Que fotografias ajudam a preparar o orçamento?', answer: 'Envie uma fotografia da peça ou área completa e pormenores das manchas, do desgaste e da etiqueta do material, se existir. Avise também se já aplicou algum produto.' },
  { id: 'avaliacao', topic: 'tratamento', question: 'O material é avaliado antes de começar?', answer: 'Sim. A avaliação do tecido, do estado e das intervenções anteriores orienta a escolha do procedimento. As limitações identificadas são explicadas antes de executar o serviço.' },
  { id: 'danos', topic: 'tratamento', question: 'O serviço também repara rasgões e tecido desgastado?', answer: 'Não. Rasgões, costuras abertas, perda de cor e desgaste do tecido são danos materiais. Devem ser identificados antes da intervenção e não são corrigidos por limpeza ou aplicação de proteção.' },
  { id: 'produtos-anteriores', topic: 'tratamento', question: 'Devo avisar se já usei um tira-nódoas?', answer: 'Sim. Diga qual foi o produto, onde o aplicou e quando, mesmo que a mancha não tenha saído. Se possível, mostre a embalagem. Essa informação é relevante para avaliar resíduos e possíveis alterações do tecido.' },
  { id: 'garantia', topic: 'cuidados', question: 'O que faço se não ficar satisfeito com o resultado?', answer: SATISFACTION_PROMISE },
  { id: 'manchas-preexistentes', topic: 'cuidados', question: 'Uma mancha antiga retira a garantia de repetição?', answer: `Não. A existência de manchas preexistentes não exclui a repetição gratuita comunicada até 48 horas. Explicamos as limitações antes do serviço; repetir a intervenção não significa garantir a remoção de todas as manchas. ${SATISFACTION_PROMISE}` },
  { id: 'manutencao', topic: 'cuidados', question: 'Como devo escolher os produtos de manutenção?', answer: 'Siga a etiqueta do artigo e as orientações dadas pela equipa para o material e tratamento realizados. Evite misturar produtos ou aplicar um produto novo numa zona visível sem verificar a compatibilidade.' },
];

/** Original entries retain their IDs so expanding the pool does not reshuffle everything. */
const initialByService: Record<LandingService, readonly FaqEntry[]> = {
  'limpeza-sofas': [
    { id: 'sofa-quantidade', topic: 'orcamento', question: 'Como indico o tamanho do sofá para receber orçamento?', answer: 'Indique o número de lugares e se tem chaise longue, canto ou módulos separados. Uma fotografia completa ajuda a confirmar a configuração. Use a tabela do simulador para os tamanhos disponíveis; peças fora dessa tabela são avaliadas por orçamento.' },
    { id: 'sofa-chaise', topic: 'orcamento', question: 'A chaise longue deve ser indicada no simulador?', answer: 'Sim. A chaise faz parte da configuração a limpar e deve ser selecionada além do número de lugares. Confirme também se existem outros módulos para que o orçamento corresponda ao sofá completo.' },
    { id: 'sofa-protecao', topic: 'orcamento', question: 'Limpar e impermeabilizar o sofá são o mesmo serviço?', answer: 'Não. A limpeza trata a sujidade e os resíduos; a impermeabilização acrescenta proteção ao tecido compatível. Pode pedir ambos, mas a proteção deve ser escolhida e discriminada no orçamento.' },
    { id: 'sofa-espaco', topic: 'preparacao', question: 'O que devo retirar do sofá antes da visita?', answer: 'Retire mantas, objetos pessoais e artigos que estejam sobre o sofá. Deixe espaço de acesso à volta e avise a equipa se a peça for difícil de deslocar. Não é necessário desmontar o sofá por iniciativa própria.' },
    { id: 'sofa-almofadas', topic: 'preparacao', question: 'Devo retirar as capas das almofadas antes da limpeza?', answer: 'Não retire as capas sem combinar com a equipa. A etiqueta e a construção do sofá determinam como devem ser tratadas. Uma capa removível não significa que possa ir à máquina de lavar.' },
    { id: 'sofa-sofa-cama', topic: 'preparacao', question: 'Como preparo um sofá-cama?', answer: 'Avise que se trata de um sofá-cama e indique se o pedido inclui apenas os estofos ou também o colchão interior. Retire a roupa de cama e confirme com a equipa como deixar o mecanismo acessível.' },
    { id: 'sofa-lavagem', topic: 'tratamento', question: 'Lavagem e higienização de sofás são tratamentos diferentes?', answer: `Estas expressões podem descrever o mesmo pedido de limpeza profissional. O procedimento é definido pelo material e pelo estado do sofá, não apenas pelo nome usado na pesquisa. ${TREATMENT_EXTRAS}` },
    { id: 'sofa-odores', topic: 'tratamento', question: 'A limpeza resolve sempre o cheiro a urina no sofá?', answer: 'O resultado depende de onde a urina penetrou e do estado do enchimento. A limpeza do tecido pode não resolver uma origem de odor no interior. Indique há quanto tempo aconteceu e o que já aplicou para avaliarmos as possibilidades e limitações.' },
    { id: 'sofa-manchas', topic: 'tratamento', question: 'Conseguem retirar manchas de café ou vinho?', answer: 'Avaliamos o tipo de tecido, a antiguidade da mancha e os produtos já usados antes de escolher o tratamento. Há manchas que deixam alterações permanentes de cor, pelo que não prometemos remoção total.' },
    { id: 'sofa-secagem', topic: 'cuidados', question: 'Quanto tempo devo esperar para usar o sofá?', answer: `${DRYING_PROMISE} Volte a utilizar o sofá quando estiver completamente seco e siga as indicações da equipa.` },
    { id: 'sofa-cobrir', topic: 'cuidados', question: 'Posso colocar uma manta no sofá logo após a limpeza?', answer: 'Espere pela secagem completa. Cobrir tecido ainda húmido dificulta a circulação do ar. Durante a secagem, mantenha o espaço ventilado de acordo com as orientações da equipa.' },
    { id: 'sofa-frequencia', topic: 'cuidados', question: 'Com que frequência devo limpar o sofá?', answer: 'A frequência depende do uso, da presença de animais, dos derrames e das indicações do fabricante. Observe o estado do tecido e peça avaliação quando houver sujidade acumulada ou odores persistentes, em vez de seguir um intervalo igual para todos os sofás.' },
  ],
  'limpeza-colchoes': [
    { id: 'colchao-medidas', topic: 'orcamento', question: 'Que tamanho de colchão devo selecionar no orçamento?', answer: 'Meça a largura e o comprimento e compare com as opções do simulador. Se tiver dúvidas entre casal e King/Queen, envie as medidas. Indique separadamente os colchões com tamanhos diferentes.' },
    { id: 'colchao-tratamento', topic: 'orcamento', question: 'O preço da limpeza inclui tratamento anti-ácaros?', answer: TREATMENT_EXTRAS },
    { id: 'colchao-cabeceira', topic: 'orcamento', question: 'A cabeceira e a base da cama estão incluídas?', answer: 'O pedido de limpeza do colchão não inclui automaticamente a cabeceira ou a base estofada. Envie fotografias e indique essas peças para serem avaliadas e discriminadas no orçamento.' },
    { id: 'colchao-roupa', topic: 'preparacao', question: 'Devo retirar os lençóis e o protetor do colchão?', answer: 'Sim. Retire lençóis, cobertores e protetores para deixar o colchão acessível. A lavagem desses artigos é uma tarefa separada e deve seguir as respetivas etiquetas.' },
    { id: 'colchao-faces', topic: 'preparacao', question: 'Preciso de virar ou levantar o colchão antes da visita?', answer: 'Combine com a equipa quais as faces a tratar e informe sobre limitações de acesso ou peso. Não tente levantar sozinho um colchão pesado. A construção e a etiqueta também devem ser consideradas.' },
    { id: 'colchao-horario', topic: 'preparacao', question: 'Como organizar a limpeza se preciso de dormir nessa cama?', answer: `${DRYING_PROMISE} Reserve tempo para secar completamente antes de voltar a fazer a cama. Avise a equipa de que precisa de a utilizar nessa noite para avaliar o horário e as condições, sem garantia de um prazo exato.` },
    { id: 'colchao-amarelo', topic: 'tratamento', question: 'As manchas amareladas desaparecem sempre?', answer: 'Não necessariamente. Suor, tempo de uso e oxidação podem alterar a cor do revestimento. A limpeza pode melhorar o estado do tecido sem o devolver à cor original. As limitações são explicadas antes do serviço.' },
    { id: 'colchao-espuma', topic: 'tratamento', question: 'Um colchão de espuma exige cuidados diferentes?', answer: 'A composição, a etiqueta e o estado do colchão orientam a avaliação. Informe se é de espuma, látex, molas ou outra construção e envie a etiqueta, quando disponível. O procedimento deve respeitar as limitações do fabricante.' },
    { id: 'colchao-alergia', topic: 'tratamento', question: 'Higienizar o colchão é o mesmo que fazer tratamento anti-ácaros?', answer: `${TREATMENT_EXTRAS} Higienização não deve ser interpretada como esterilização ou garantia de benefícios clínicos.` },
    { id: 'colchao-lencois', topic: 'cuidados', question: 'Quando posso voltar a colocar os lençóis?', answer: 'Só quando o colchão estiver completamente seco. Lençóis ou protetores colocados demasiado cedo podem reter humidade. Verifique também as zonas de contacto e siga a orientação da equipa.' },
    { id: 'colchao-ventilacao', topic: 'cuidados', question: 'A falta de ventilação pode atrasar a secagem?', answer: `Sim. ${DRYING_PROMISE} Se o quarto ventila pouco, avise antes da marcação para planearmos as condições de secagem.` },
    { id: 'colchao-protetor', topic: 'cuidados', question: 'Como manter o colchão depois da limpeza?', answer: 'Use roupa de cama limpa, mantenha a ventilação e siga as instruções do fabricante sobre rotação e manutenção. Se usar um protetor, coloque-o apenas depois de o colchão secar completamente.' },
  ],
  'limpeza-tapetes': [
    { id: 'tapete-preco', topic: 'orcamento', question: 'Existe um preço fixo por metro quadrado de tapete?', answer: 'Não. Os tapetes são sempre sob orçamento. Indique largura, comprimento, quantidade e tipo de fibra, se o conhecer, e envie fotografias para avaliarmos cada peça.' },
    { id: 'tapete-varios', topic: 'orcamento', question: 'Como peço orçamento para vários tapetes?', answer: 'Meça cada tapete separadamente e adicione as respetivas dimensões no simulador. Identifique nas fotografias qual corresponde a cada medida, sobretudo se tiverem fibras ou estados diferentes.' },
    { id: 'tapete-redondo', topic: 'orcamento', question: 'Como indico as medidas de um tapete redondo ou irregular?', answer: 'Indique que a forma é redonda ou irregular e envie uma fotografia com as maiores medidas. Num tapete redondo, informe o diâmetro. Confirmamos a forma e as dimensões para preparar o orçamento.' },
    { id: 'tapete-moveis', topic: 'preparacao', question: 'Devo retirar os móveis que estão sobre o tapete?', answer: 'Informe quais os móveis sobre o tapete e combine o acesso com a equipa. Retire objetos pequenos e frágeis. Não mova sozinho peças pesadas nem arraste móveis que possam danificar o tapete ou o chão.' },
    { id: 'tapete-etiqueta', topic: 'preparacao', question: 'A etiqueta do tapete é importante para o orçamento?', answer: 'Sim. Uma fotografia da etiqueta pode ajudar a identificar a fibra e as restrições de manutenção. Envie também imagens da frente, do verso e das franjas, quando existirem.' },
    { id: 'tapete-local', topic: 'preparacao', question: 'A limpeza é feita em casa ou o tapete é recolhido?', answer: 'Confirme com a equipa a modalidade adequada à peça e ao local antes da marcação. Não assuma recolha, entrega ou custos incluídos sem estarem expressamente confirmados no orçamento.' },
    { id: 'tapete-cores', topic: 'tratamento', question: 'Há cuidados especiais com tapetes de cores fortes?', answer: 'Sim. A composição e a estabilidade das cores precisam de avaliação, especialmente em peças artesanais ou sem etiqueta. A equipa explica as limitações antes de decidir o procedimento.' },
    { id: 'tapete-franjas', topic: 'tratamento', question: 'As franjas e o verso precisam de avaliação própria?', answer: 'Sim. Podem ter materiais e um estado de conservação diferentes da superfície. Mostre franjas soltas, cola, zonas frágeis ou alterações no verso antes de começar.' },
    { id: 'tapete-protecao', topic: 'tratamento', question: 'Posso pedir impermeabilização para o tapete?', answer: 'Não disponibilizamos impermeabilização de tapetes. Pode pedir a avaliação da limpeza da peça; a impermeabilização disponível é para sofás e cadeiras compatíveis.' },
    { id: 'tapete-secagem', topic: 'cuidados', question: 'Quanto tempo demora o tapete a secar?', answer: `${DRYING_PROMISE} A espessura e o suporte do tapete também devem ser considerados. Confirme a secagem completa antes de o voltar a usar normalmente.` },
    { id: 'tapete-enrolar', topic: 'cuidados', question: 'Posso enrolar o tapete depois da limpeza?', answer: 'Não o enrole nem guarde enquanto houver humidade. Confirme a secagem da superfície e do verso e siga as indicações recebidas para o material da peça.' },
    { id: 'tapete-derrame', topic: 'cuidados', question: 'O que faço se voltar a entornar um líquido no tapete?', answer: 'Absorva suavemente o excesso com um pano limpo, sem esfregar nem encharcar. Siga a etiqueta e peça orientação antes de aplicar produtos, sobretudo em fibras delicadas ou cores que possam transferir.' },
  ],
  'limpeza-cadeiras': [
    { id: 'cadeira-quantidade', topic: 'orcamento', question: 'O preço por cadeira depende da quantidade?', answer: 'Sim. O simulador apresenta os escalões da tabela para a quantidade selecionada. Indique o total de cadeiras a limpar e envie fotografias se forem modelos diferentes. O valor é confirmado antes da marcação.' },
    { id: 'cadeira-modelos', topic: 'orcamento', question: 'Posso incluir cadeiras de modelos diferentes no mesmo pedido?', answer: 'Sim, indique a quantidade de cada modelo e mostre o assento e o encosto nas fotografias. Confirmamos as peças e o âmbito do serviço antes de fechar o orçamento.' },
    { id: 'cadeira-protecao', topic: 'orcamento', question: 'A impermeabilização das cadeiras está incluída na limpeza?', answer: 'Não é incluída automaticamente na limpeza. Pode escolher proteção para cadeiras compatíveis e comparar as opções Essencial e Premium no orçamento, com os valores discriminados.' },
    { id: 'cadeira-acesso', topic: 'preparacao', question: 'Como deixo as cadeiras preparadas para a visita?', answer: 'Retire objetos e capas avulsas e deixe acesso aos assentos e encostos. Informe se há cadeiras frágeis, instáveis ou difíceis de deslocar para combinar o manuseamento adequado.' },
    { id: 'cadeira-escritorio', topic: 'preparacao', question: 'Que detalhes devo mostrar numa cadeira de escritório?', answer: 'Mostre o assento, o encosto e a etiqueta, se existir. Indique se o revestimento é tecido, rede ou outro material e avise sobre mecanismos ou peças danificadas.' },
    { id: 'cadeira-capas', topic: 'preparacao', question: 'Devo lavar as capas das cadeiras antes da visita?', answer: 'Confirme primeiro com a equipa se são capas removíveis e o que a etiqueta permite. Lavar uma capa por um método incompatível pode alterar a forma ou a cor antes da avaliação.' },
    { id: 'cadeira-assento', topic: 'tratamento', question: 'Limpam apenas o assento ou também o encosto?', answer: 'Indique todas as partes estofadas que pretende limpar. O âmbito depende do modelo e é confirmado no orçamento; não se deve assumir que peças não mostradas nas fotografias estão incluídas.' },
    { id: 'cadeira-gordura', topic: 'tratamento', question: 'As manchas de comida nas cadeiras de jantar têm solução?', answer: 'Avaliamos o tipo de mancha, o tecido e o tempo decorrido. Gordura e resíduos alimentares podem exigir atenção específica, mas manchas antigas ou alterações de cor podem não desaparecer totalmente.' },
    { id: 'cadeira-rede', topic: 'tratamento', question: 'Uma cadeira de rede é tratada como uma cadeira de tecido?', answer: 'A rede e os estofos podem ter construções e limitações diferentes. Envie uma fotografia e a etiqueta para avaliação. Não aplicamos uma regra única apenas por ambas serem cadeiras.' },
    { id: 'cadeira-secagem', topic: 'cuidados', question: 'Quando posso voltar a sentar-me nas cadeiras?', answer: `${DRYING_PROMISE} Aguarde até os assentos e encostos estarem completamente secos antes de os usar.` },
    { id: 'cadeira-empilhar', topic: 'cuidados', question: 'Posso empilhar ou cobrir as cadeiras enquanto secam?', answer: 'Evite encostar superfícies húmidas, empilhar ou cobrir os estofos durante a secagem. Deixe circular o ar e siga as orientações da equipa para o modelo tratado.' },
    { id: 'cadeira-manutencao', topic: 'cuidados', question: 'Como evito acumulação de sujidade nos assentos?', answer: 'Remova regularmente resíduos soltos pelo método permitido na etiqueta e trate derrames sem esfregar. Não use sempre o mesmo produto em cadeiras com revestimentos diferentes sem verificar a compatibilidade.' },
  ],
  'limpeza-alcatifas': [
    { id: 'alcatifa-preco', topic: 'orcamento', question: 'A limpeza de alcatifa tem preço fixo por metro quadrado?', answer: 'Não. A limpeza de alcatifas é sempre sob orçamento, conforme a área, o estado e as condições do espaço. Envie as medidas e fotografias para receber a proposta.' },
    { id: 'alcatifa-divisoes', topic: 'orcamento', question: 'Como meço alcatifa em várias divisões?', answer: 'Indique largura e comprimento de cada área separadamente. Assinale corredores, recantos e zonas que não entram no pedido, para evitar contar áreas a mais ou omitir partes a limpar.' },
    { id: 'alcatifa-escadas', topic: 'orcamento', question: 'Como peço orçamento para escadas alcatifadas?', answer: 'Indique o número de degraus, as dimensões aproximadas e os patamares. Envie fotografias de conjunto e pormenor; escadas não devem ser descritas apenas como uma divisão plana.' },
    { id: 'alcatifa-mobiliario', topic: 'preparacao', question: 'A divisão precisa de ficar completamente vazia?', answer: 'Combine quais as áreas a limpar e os móveis que podem ser deslocados em segurança. Identifique mobiliário fixo ou pesado para definirmos previamente o acesso e o âmbito da intervenção.' },
    { id: 'alcatifa-circulacao', topic: 'preparacao', question: 'Como organizo a passagem das pessoas durante o serviço?', answer: 'Informe se a área é uma passagem obrigatória. Combine com a equipa o acesso durante a limpeza e a secagem, sobretudo em corredores e escadas, antes de escolher o horário.' },
    { id: 'alcatifa-levantada', topic: 'preparacao', question: 'Devo avisar se a alcatifa estiver descolada ou com ondulações?', answer: 'Sim. Mostre zonas levantadas, juntas abertas ou desgaste antes da visita. A limpeza não substitui a reparação da fixação, e esses pontos podem limitar o procedimento.' },
    { id: 'alcatifa-passagem', topic: 'tratamento', question: 'As marcas escuras nas zonas de passagem desaparecem?', answer: 'Podem resultar de sujidade, mas também de desgaste ou compactação das fibras. A avaliação distingue essas situações; limpar não reconstrói fibras gastas nem garante uma aparência uniforme.' },
    { id: 'alcatifa-rodapes', topic: 'tratamento', question: 'É possível limpar a sujidade junto dos rodapés?', answer: 'Mostre essas zonas nas fotografias e confirme o acesso junto das paredes. O resultado depende do material, da origem e da antiguidade das marcas; as limitações são avaliadas antes da intervenção.' },
    { id: 'alcatifa-humidade', topic: 'tratamento', question: 'A limpeza resolve a causa de humidade na alcatifa?', answer: 'Não. Uma infiltração ou outra fonte de humidade precisa de ser identificada e resolvida. Avise a equipa antes de marcar: limpar a superfície não substitui a reparação da causa.' },
    { id: 'alcatifa-secagem', topic: 'cuidados', question: 'Quanto tempo devo reservar para a secagem da alcatifa?', answer: `${DRYING_PROMISE} Confirme com a equipa quando pode retomar a circulação normal na área tratada.` },
    { id: 'alcatifa-moveis-voltar', topic: 'cuidados', question: 'Quando posso voltar a colocar os móveis sobre a alcatifa?', answer: 'Aguarde a secagem completa e siga as indicações sobre recolocação do mobiliário. Peças pesadas ou bases em contacto com zonas húmidas podem dificultar a secagem.' },
    { id: 'alcatifa-rotina', topic: 'cuidados', question: 'Como cuidar das zonas de maior passagem depois da limpeza?', answer: 'Adapte a manutenção à intensidade de uso e à etiqueta da alcatifa. Remova resíduos soltos regularmente e comunique manchas persistentes; não tente compensar desgaste com aplicações repetidas de produtos.' },
  ],
  'impermeabilizacao': [
    { id: 'protecao-opcoes', topic: 'orcamento', question: 'Posso comparar Essencial e Premium antes de escolher?', answer: 'Sim. O simulador permite comparar as opções disponíveis e os respetivos acréscimos para as peças escolhidas. Confirme o material e o âmbito da proteção com a equipa antes da marcação.' },
    { id: 'protecao-pecas', topic: 'orcamento', question: 'Que peças devo indicar no orçamento de impermeabilização?', answer: 'Indique se pretende proteger sofás, cadeiras ou ambos, com as quantidades e configurações. Envie fotografias e etiquetas, se existirem. Tapetes não fazem parte deste serviço.' },
    { id: 'protecao-limpeza', topic: 'orcamento', question: 'A limpeza está incluída no preço da impermeabilização?', answer: 'Não deve assumir que está incluída. Indique se a peça precisa também de limpeza para receber uma proposta com os dois serviços discriminados. O estado do tecido é avaliado antes da aplicação.' },
    { id: 'protecao-novo', topic: 'preparacao', question: 'Posso impermeabilizar um sofá ou cadeiras novos?', answer: 'Peça avaliação do material e informe se já trazem algum acabamento de fábrica. Uma peça nova não é automaticamente compatível com qualquer produto de proteção.' },
    { id: 'protecao-anterior', topic: 'preparacao', question: 'Devo avisar se já existe proteção no tecido?', answer: 'Sim. Diga quando foi aplicada e qual o produto ou tratamento, se souber. A equipa precisa dessa informação para avaliar compatibilidade e condições de reaplicação.' },
    { id: 'protecao-seco', topic: 'preparacao', question: 'O tecido pode estar húmido quando a proteção é aplicada?', answer: 'Avise se a peça foi limpa recentemente ou ainda está húmida. As condições necessárias para aplicar o produto dependem do material e do tratamento; a equipa confirma quando é adequado avançar.' },
    { id: 'protecao-limites', topic: 'tratamento', question: 'A proteção impede todas as manchas?', answer: 'Não. A impermeabilização pode ajudar a reduzir a absorção de líquidos em tecidos compatíveis, mas não torna a peça imune a manchas. O tipo de líquido, o desgaste e a rapidez de atuação continuam a importar.' },
    { id: 'protecao-remover', topic: 'tratamento', question: 'A impermeabilização elimina manchas que já existem?', answer: 'Não. A proteção não é um método de remoção de manchas. O estado inicial e a eventual necessidade de limpeza devem ser avaliados antes, sem prometer recuperar alterações permanentes do tecido.' },
    { id: 'protecao-compativel', topic: 'tratamento', question: 'Todos os tecidos de sofás e cadeiras podem ser protegidos?', answer: 'A compatibilidade deve ser avaliada a partir do material, da etiqueta e do estado da peça. Informe sobre acabamentos anteriores e zonas danificadas; não existe uma indicação automática para todos os tecidos.' },
    { id: 'protecao-cura', topic: 'cuidados', question: 'Quando posso usar a peça depois da impermeabilização?', answer: 'A cura do produto pode exigir até 24 horas e é diferente da secagem de uma limpeza. Siga o prazo e as instruções indicados pela equipa para o tratamento aplicado antes de voltar a usar a peça.' },
    { id: 'protecao-derrame', topic: 'cuidados', question: 'O que faço se cair líquido sobre o tecido protegido?', answer: 'Absorva o líquido rapidamente com um pano limpo, sem esfregar. Não deixe o derrame permanecer no tecido para testar a proteção. Siga as instruções de manutenção do tratamento aplicado.' },
    { id: 'protecao-reaplicar', topic: 'cuidados', question: 'Como sei se a proteção precisa de ser reaplicada?', answer: 'Informe a equipa sobre o tempo desde a aplicação, o uso e as limpezas posteriores. A avaliação do estado e do tratamento existente orienta a necessidade de reaplicação; não provoque derrames para testar.' },
  ],
};

const byService = { ...initialByService };
for (const service of Object.keys(initialByService) as LandingService[]) {
  byService[service] = [...initialByService[service], ...LANDING_FAQ_EXPANSION[service]];
}

export function getLandingFaqPool(serviceSlug: LandingService): readonly FaqEntry[] {
  if (!byService[serviceSlug]) throw new Error(`Unknown landing service: ${serviceSlug}`);
  return [...common, ...byService[serviceSlug]];
}

function hash(value: string): number {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  // Avalanche avoids correlated choices between similarly named entries.
  result = Math.imul(result ^ (result >>> 16), 0x85ebca6b);
  result = Math.imul(result ^ (result >>> 13), 0xc2b2ae35);
  return (result ^ (result >>> 16)) >>> 0;
}

/** One answer per topic; never pad with unrelated services or change per visit. */
export function selectLandingFaqEntries(context: LandingFaqContext): FaqEntry[] {
  const article = context.serviceSlug === 'impermeabilizacao' ? context.pageKey.match(/^\/impermeabilizacao-(sofa|cadeiras)-/)?.[1] : undefined;
  const pool = getLandingFaqPool(context.serviceSlug).filter(entry => !article || !entry.article || entry.article === article);
  const selections = topics.map(topic => {
    const eligible = pool.filter(entry => entry.topic === topic);
    // Price pages keep a service-specific budgeting question as their first answer.
    const candidates = context.family === 'preco' && topic === 'orcamento'
      ? eligible.filter(entry => byService[context.serviceSlug].includes(entry))
      : eligible;
    const ranked = candidates.map(entry => ({ entry, score: hash(`${context.pageKey}|${topic}|${entry.id}`) }));
    ranked.sort((a, b) => b.score - a.score || (a.entry.id < b.entry.id ? -1 : a.entry.id > b.entry.id ? 1 : 0));
    if (!ranked.length) throw new Error(`Missing FAQ topic ${topic} for ${context.serviceSlug}`);
    return ranked;
  });
  const selected = selections.map(ranked => ranked[0].entry);
  const isSpecific = (entry: FaqEntry) => byService[context.serviceSlug].includes(entry);
  // Every page must explain its actual service, even when shared answers rank first.
  for (const topic of ['tratamento', 'preparacao', 'cuidados', 'orcamento'] as const) {
    if (selected.filter(isSpecific).length >= 2) break;
    const index = topics.indexOf(topic);
    if (!isSpecific(selected[index])) {
      const specific = selections[index].find(({ entry }) => isSpecific(entry));
      if (specific) selected[index] = specific.entry;
    }
  }
  return selected;
}

export function getLandingFaqs(context: LandingFaqContext): LandingFaq[] {
  return selectLandingFaqEntries(context).map(entry => ({
    question: entry.question,
    answer: typeof entry.answer === 'function' ? entry.answer(context) : entry.answer,
  }));
}
