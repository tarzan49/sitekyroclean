import colchaoAntes from '@/assets/galeria-colchao-antes.webp';
import colchaoProcesso from '@/assets/galeria-colchao-processo.webp';
import colchaoDepois from '@/assets/galeria-colchao-depois.webp';
import tapeteAntes from '@/assets/galeria-tapete-antes.webp';
import tapeteProcesso from '@/assets/galeria-tapete-processo.webp';
import tapeteDepois from '@/assets/galeria-tapete-depois.webp';
import alcatifaAntes from '@/assets/hero-p-mofo-alcatifa.webp';
import alcatifaProcesso from '@/assets/galeria-alcatifa-processo.webp';
import alcatifaDepois from '@/assets/galeria-alcatifa-resultado.webp';
import cadeiraAntes from '@/assets/galeria-cadeira-antes.webp';
import cadeiraProcesso from '@/assets/galeria-cadeira-processo.webp';
import cadeiraDepois from '@/assets/galeria-cadeira-depois.webp';
import protecaoAntes from '@/assets/galeria-impermeabilizacao-antes.webp';
import protecaoProcesso from '@/assets/galeria-impermeabilizacao-processo.webp';
import protecaoDepois from '@/assets/galeria-impermeabilizacao-depois.webp';

type Step = { label: string; title: string; description: string };
type Guide = { heading: string; subject: string; images: string[]; steps: Step[] };

function cleaning(subject: string, heading: string, material: string, preparation: string, images: string[]): Guide {
  return { subject, heading, images: [images[0], images[1], images[1], images[1], images[2]], steps: [
    { label: 'Avaliação', title: 'Primeiro, avaliamos o material.', description: `Observamos ${material}, as manchas e o estado de conservação. Explicamos as limitações antes de começar.` },
    { label: 'Preparação', title: 'Preparamos a superfície.', description: preparation },
    { label: 'Aplicação', title: 'Tratamos cada zona com cuidado.', description: `Aplicamos o produto compatível com ${material} e trabalhamos as fibras com a suavidade adequada para soltar a sujidade.` },
    { label: 'Extração', title: 'Retiramos a sujidade e a água.', description: 'A extração profissional remove a solução de limpeza e os resíduos soltos, controlando a humidade que permanece no material.' },
    { label: 'Secagem', title: 'Terminamos com os cuidados de secagem.', description: 'A secagem demora em média 3 a 6 horas, conforme o material, a ventilação e as condições do espaço. Utilize apenas quando estiver completamente seco.' },
  ] };
}

const guides: Record<string, Guide> = {
  'limpeza-colchoes': cleaning('Colchão', 'A limpeza do seu colchão', 'o revestimento e as costuras do colchão', 'Com o colchão sem roupa de cama, aspiramos a superfície e preparamos as zonas a tratar, controlando a quantidade de água utilizada.', [colchaoAntes, colchaoProcesso, colchaoDepois]),
  'limpeza-tapetes': cleaning('Tapete', 'A limpeza do seu tapete', 'as fibras, as cores e a base do tapete', 'Aspiramos os resíduos soltos e verificamos a estabilidade das cores para definir o método adequado às fibras e aos acabamentos.', [tapeteAntes, tapeteProcesso, tapeteDepois]),
  'limpeza-alcatifas': cleaning('Alcatifa', 'A limpeza da sua alcatifa', 'as fibras e a fixação da alcatifa', 'Preparamos a área acessível, aspiramos a superfície e identificamos as zonas de passagem que exigem maior atenção.', [alcatifaAntes, alcatifaProcesso, alcatifaDepois]),
  'limpeza-cadeiras': cleaning('Cadeiras', 'A limpeza das suas cadeiras', 'o tecido dos assentos e encostos', 'Protegemos as partes rígidas e aspiramos assentos, encostos e costuras acessíveis antes de tratar o tecido.', [cadeiraAntes, cadeiraProcesso, cadeiraDepois]),
  impermeabilizacao: {
    subject: 'Impermeabilização de sofás e cadeiras', heading: 'A impermeabilização, do tecido à proteção',
    images: [protecaoAntes, protecaoAntes, protecaoProcesso, protecaoProcesso, protecaoDepois],
    steps: [
      { label: 'Avaliação', title: 'Confirmamos a compatibilidade do tecido.', description: 'Avaliamos o sofá ou as cadeiras e explicamos as opções Essencial e Premium, adequadas ao material e à utilização.' },
      { label: 'Preparação', title: 'A superfície precisa de estar preparada.', description: 'Verificamos se o tecido está limpo e seco. Quando é necessária limpeza prévia, combinamos esse serviço antes da aplicação.' },
      { label: 'Aplicação', title: 'Distribuímos o protetor uniformemente.', description: 'Aplicamos o impermeabilizante nas zonas acordadas, respeitando as características do tecido e as instruções do produto.' },
      { label: 'Verificação', title: 'Revemos a cobertura da aplicação.', description: 'Verificamos as zonas tratadas e os acabamentos para confirmar uma aplicação uniforme em toda a superfície prevista.' },
      { label: 'Cura', title: 'Deixamos a proteção estabilizar.', description: 'A cura pode exigir 24 horas, conforme o produto e as condições. Indicamos quando voltar a utilizar e como cuidar do tecido; a proteção não impede todas as manchas.' },
    ],
  },
};

export function getServiceProcess(serviceSlug: string): Guide | undefined {
  return guides[serviceSlug];
}
