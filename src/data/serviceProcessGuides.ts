import { DRYING_PROMISE } from '@/constants/commercialPolicy';

interface ProcessStep { label: string; title: string; description: string; alt: string }
interface ProcessGuide { heading: string; subtitle: string; image: string; steps: ProcessStep[] }
const step = (label: string, title: string, description: string, alt: string): ProcessStep => ({ label, title, description, alt });
const drying = (article: string) => step('Secagem', 'O último cuidado é deixar secar.', `${DRYING_PROMISE} Use ${article} apenas quando estiver completamente seco.`, `${article} a secar num espaço ventilado`);
const subtitle = 'Do primeiro cuidado à secagem. Explore as cinco etapas da nossa visita.';

export const SERVICE_PROCESS_GUIDES = {
  'limpeza-colchoes': {
    heading: 'A limpeza do seu colchão', subtitle, image: '/images/services/process-colchoes.webp',
    steps: [
      step('Avaliação', 'Primeiro, observamos o colchão.', 'Verificamos o tecido, as costuras e as manchas. Explicamos as limitações das marcas preexistentes antes de começar.', 'Inspeção das costuras de um colchão'),
      step('Aplicação', 'Tratamos as zonas que precisam de cuidado.', 'Aplicamos o produto adequado ao material, controlando a quantidade de humidade. Anti-ácaros e desbacterização são extras opcionais, orçamentados separadamente.', 'Aplicação de produto sobre o colchão'),
      step('Escovação', 'Soltamos a sujidade do tecido.', 'Trabalhamos a superfície com uma escova adequada, ajustando a pressão ao tecido e ao estado do colchão.', 'Escovação suave da superfície do colchão'),
      step('Extração', 'Retiramos a água e os resíduos.', 'O bocal de estofos percorre a superfície para extrair a sujidade e reduzir a humidade que fica no colchão.', 'Extração com bocal transparente no colchão'),
      drying('o colchão'),
    ],
  },
  'limpeza-cadeiras': {
    heading: 'A limpeza das suas cadeiras', subtitle, image: '/images/services/process-cadeiras.webp',
    steps: [
      step('Avaliação', 'Cada cadeira merece uma avaliação.', 'Observamos o assento, o encosto e o tecido. Identificamos manchas e explicamos as limitações antes da limpeza.', 'Avaliação do tecido de uma cadeira estofada'),
      step('Aplicação', 'O produto adequado ao estofo.', 'Aplicamos o produto nas zonas estofadas, com cuidado junto à madeira e aos restantes materiais da estrutura.', 'Aplicação de produto no assento estofado'),
      step('Escovação', 'Cuidamos das fibras e dos contornos.', 'Escovamos as zonas de contacto e os recantos com a intensidade adequada ao tecido, ajudando a soltar a sujidade.', 'Escovação do assento da cadeira'),
      step('Extração', 'Extraímos a sujidade do estofo.', 'Usamos um bocal de estofos para retirar água e resíduos do assento e das restantes zonas tratadas.', 'Extração do tecido com bocal pequeno'),
      drying('o estofo'),
    ],
  },
  'limpeza-tapetes': {
    heading: 'A limpeza do seu tapete', subtitle, image: '/images/services/process-tapetes.webp',
    steps: [
      step('Avaliação', 'Conhecemos as fibras e a base.', 'Verificamos o material, as cores, a base e as manchas para definir um método compatível. O orçamento depende das medidas e da avaliação.', 'Inspeção da trama e do canto do tapete'),
      step('Aspiração', 'Começamos pela sujidade solta.', 'Aspiramos a superfície para retirar poeiras e resíduos soltos, com atenção às fibras e às extremidades.', 'Aspiração de um tapete com bordos visíveis'),
      step('Aplicação', 'Preparamos as fibras para a limpeza.', 'Aplicamos o produto adequado nas zonas a tratar, após verificar a compatibilidade. Explicamos antecipadamente as limitações das manchas.', 'Aplicação de produto num tapete'),
      step('Extração', 'Retiramos os resíduos das fibras.', 'Quando o material permite limpeza por extração, retiramos a sujidade e a água com equipamento adequado ao tapete.', 'Extração de um tapete com equipamento de chão'),
      drying('o tapete'),
    ],
  },
  'limpeza-alcatifas': {
    heading: 'A limpeza da sua alcatifa', subtitle, image: '/images/services/process-alcatifas.webp',
    steps: [
      step('Avaliação', 'Planeamos a limpeza do espaço.', 'Avaliamos as fibras, a fixação e as zonas de maior passagem. Confirmamos as medidas e o orçamento antes da intervenção.', 'Avaliação das fibras de uma alcatifa instalada'),
      step('Aspiração', 'Retiramos os resíduos soltos.', 'Aspiramos a área a tratar, incluindo as zonas de passagem, preparando a alcatifa para as etapas seguintes.', 'Aspiração de alcatifa num escritório'),
      step('Aplicação', 'Damos atenção às zonas mais usadas.', 'Aplicamos o produto compatível com a alcatifa e tratamos as zonas de sujidade, explicando previamente as limitações das manchas.', 'Pré-tratamento de alcatifa com pulverizador'),
      step('Extração', 'Limpamos a área de forma organizada.', 'Percorremos a alcatifa com equipamento de extração, retirando água e resíduos e controlando a humidade.', 'Extração de alcatifa com equipamento profissional'),
      step('Secagem', 'Deixamos o espaço a ventilar.', `${DRYING_PROMISE} Evite circular na área até estar completamente seca e siga as indicações da equipa.`, 'Escritório ventilado com alcatifa a secar'),
    ],
  },
  impermeabilizacao: {
    heading: 'A proteção dos seus estofos', subtitle: 'Da avaliação do tecido aos cuidados após a aplicação. Explore as cinco etapas da proteção.', image: '/images/services/process-impermeabilizacao.webp',
    steps: [
      step('Avaliação', 'Confirmamos se o tecido pode ser protegido.', 'Observamos o material e o estado do sofá ou das cadeiras. Explicamos o âmbito da opção Essencial ou Premium escolhida.', 'Inspeção do tecido de um sofá antes da proteção'),
      step('Preparação', 'A superfície precisa de estar limpa e seca.', 'Protegemos a área envolvente e verificamos as condições do estofo. Se for necessária limpeza prévia, combinamos esse serviço e a secagem antes da aplicação.', 'Preparação do sofá e proteção do chão'),
      step('Teste', 'Verificamos a compatibilidade.', 'Testamos uma zona discreta para observar a reação do tecido ao produto antes de avançar para a superfície prevista.', 'Teste de produto numa zona discreta do estofo'),
      step('Aplicação', 'Distribuímos a proteção pelo tecido.', 'Aplicamos o produto de forma uniforme nas zonas acordadas. A proteção ajuda a reduzir a absorção de líquidos, sem tornar o tecido imune a manchas.', 'Pulverização de protetor sobre tecido de sofá'),
      step('Cura', 'Respeitamos o tempo de ativação.', 'A cura do produto pode exigir 24 horas e é diferente da secagem de uma limpeza. Siga as indicações da equipa antes de usar o estofo e remova derrames rapidamente.', 'Sofá em repouso num espaço ventilado após a proteção'),
    ],
  },
} satisfies Record<string, ProcessGuide>;
export type ProcessServiceSlug = keyof typeof SERVICE_PROCESS_GUIDES;
