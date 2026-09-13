// O build já resolve o modelo da landing page uma vez e escreve-o no HTML.
// Sem isto, o browser volta a montar do zero uma página que já lhe foi
// servida, e para isso descarrega os catálogos SEO das quatro famílias
// (freguesias, variantes, problemas, materiais, preços) — cerca de 100 KB
// comprimidos e 400 KB de JavaScript para interpretar, quase tudo de famílias
// a que a página nem pertence.
//
// Mesmo princípio que `GeneratedRoutePage` já usa para o inventário de rotas:
// o HTML declara o que o build sabe, e os catálogos passam a ser precisos
// apenas para navegação dentro do site.
//
// `import type` é apagado na compilação, por isso este módulo não arrasta
// `landingPageModel` nem nada do que ele importa para o bundle.
import type { LandingPageModel } from './landingPageModel';

export const LANDING_MODEL_ELEMENT_ID = 'kyro-landing-model';

let cachedRaw: string | null = null;
let cachedModel: LandingPageModel | null = null;

/**
 * Lê o modelo escrito pelo build. Em produção o texto nunca muda, por isso o
 * JSON é analisado uma única vez; a cache é por conteúdo e não por primeira
 * chamada, o que mantém o módulo testável sem lhe abrir uma porta só para
 * testes.
 */
function currentModel(): LandingPageModel | null {
  if (typeof document === 'undefined') return null;
  const raw = document.getElementById(LANDING_MODEL_ELEMENT_ID)?.textContent ?? null;
  if (!raw) return null;
  if (raw === cachedRaw) return cachedModel;
  cachedRaw = raw;
  try {
    const parsed = JSON.parse(raw) as LandingPageModel;
    cachedModel = typeof parsed?.path === 'string' ? parsed : null;
  } catch {
    // HTML truncado ou modelo de um build antigo: o caminho de importação
    // dinâmica trata do caso, não vale a pena rebentar a página.
    cachedModel = null;
  }
  return cachedModel;
}

/**
 * Devolve o modelo que veio no HTML, mas só para a página que o build serviu.
 * Em qualquer outra rota devolve null e quem chama importa o catálogo.
 */
export function bootstrapLandingModel(pathname: string): LandingPageModel | null {
  const model = currentModel();
  if (!model) return null;
  return pathname.replace(/\/$/, '') === model.path ? model : null;
}
