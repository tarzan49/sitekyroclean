// Páginas legais: privacidade, termos e devoluções.
//
// Existe porque as três eram client-only e, depois de o catch-all
// `/* /index.html 200` ter sido removido do `public/_redirects` (2026-09-06),
// deixaram de ter ficheiro estático: o Cloudflare Pages passou a servir-lhes o
// `404.html` com HTTP 404 a sério. Confirmado em produção a 2026-09-23, nas
// três. O React recupera a seguir e mostra o conteúdo certo, por isso a navegar
// normalmente nunca se vê o problema — mas o estado é 404, o Google não as
// indexa, um crawler sem JavaScript lê "Página não encontrada", e o rodapé
// aponta-lhes ~48.000 ligações internas a partir das 16.153 páginas do site.
// O Google Ads também exige uma política de privacidade acessível.
//
// A lista `CLIENT_ONLY_ROUTES` do `scripts/prerender.ts` já tinha a regra certa
// escrita no comentário ("cada rota precisa do seu ficheiro estático"); estas
// três é que ficaram de fora dela.
//
// Sem imports com alias `@/`, para o `scripts/prerender.ts` conseguir ler este
// ficheiro em Node puro (ver a armadilha das constantes duplicadas no
// CLAUDE.md). O texto das secções vive em `legalContent.ts`, à parte, porque
// este ficheiro está no pacote inicial de todas as páginas (PageHead).
export interface LegalPage {
  path: string;
  /** Nome curto, no separador entre os três documentos. */
  label: string;
  title: string;
  description: string;
  h1: string;
  updated: string;
}

export const LEGAL_PAGES: LegalPage[] = [
  {
    path: '/politica-de-privacidade',
    label: 'Privacidade',
    title: 'Política de Privacidade | Kyro Clean Solutions',
    description: 'Consulte a Política de Privacidade da Kyro Clean Solutions. Saiba como recolhemos, utilizamos e protegemos os seus dados pessoais.',
    h1: 'Política de Privacidade',
    updated: 'novembro de 2026',
  },
  {
    path: '/termos-e-condicoes',
    label: 'Termos',
    title: 'Termos e Condições | Kyro Clean Solutions',
    description: 'Termos e condições dos serviços de limpeza de estofos ao domicílio da Kyro Clean Solutions: orçamentos, prestação do serviço, pagamento, cancelamentos e reclamações.',
    h1: 'Termos e Condições',
    updated: 'novembro de 2026',
  },
  {
    path: '/politica-de-devolucoes',
    label: 'Devoluções',
    title: 'Política de Devoluções | Kyro Clean Solutions',
    description: 'Política de devoluções da Kyro Clean Solutions: direito de livre resolução, reclamações, limitações do material e cancelamentos num serviço prestado ao domicílio.',
    h1: 'Política de Devoluções',
    updated: 'novembro de 2026',
  },
];
