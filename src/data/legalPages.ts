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
// CLAUDE.md). As secções são só os títulos: o texto legal continua a viver nos
// componentes React, e `legalPages.test.ts` rebenta se os dois divergirem.
export interface LegalPage {
  path: string;
  /** Componente React correspondente, usado pelo teste de paridade. */
  component: string;
  title: string;
  description: string;
  h1: string;
  updated: string;
  intro: string;
  sections: string[];
}

export const LEGAL_PAGES: LegalPage[] = [
  {
    path: '/politica-de-privacidade',
    component: 'PoliticaPrivacidade',
    title: 'Política de Privacidade | Kyro Clean Solutions',
    description: 'Consulte a Política de Privacidade da Kyro Clean Solutions. Saiba como recolhemos, utilizamos e protegemos os seus dados pessoais.',
    h1: 'Política de Privacidade',
    updated: 'setembro de 2026',
    intro: 'Como a Kyro Clean Solutions recolhe, utiliza, partilha e protege os dados pessoais recolhidos através deste website, ao abrigo do RGPD (Regulamento UE 2016/679). Inclui as ferramentas de medição usadas, a base legal de cada tratamento, os prazos de conservação e como exercer os seus direitos.',
    sections: [
      '1. Quem somos',
      '2. Dados recolhidos',
      '3. Finalidade do tratamento',
      '4. Ferramentas de medição e cookies',
      '5. Base legal',
      '6. Partilha de dados',
      '7. Retenção de dados',
      '8. Os seus direitos',
      '9. Segurança',
      '10. Autoridade de controlo',
      'Preferências de medição',
      '11. Contacto',
    ],
  },
  {
    path: '/termos-e-condicoes',
    component: 'TermosCondicoes',
    title: 'Termos e Condições | Kyro Clean Solutions',
    description: 'Termos e condições dos serviços de limpeza de estofos ao domicílio da Kyro Clean Solutions: orçamentos, prestação do serviço, pagamento, cancelamentos e reclamações.',
    h1: 'Termos e Condições',
    updated: 'setembro de 2026',
    intro: 'As condições aplicáveis aos serviços de limpeza e higienização de estofos ao domicílio da Kyro Clean Solutions: como funcionam os orçamentos e as reservas, o que inclui a prestação do serviço, pagamento, cancelamentos, reclamações e resolução alternativa de litígios.',
    sections: [
      '1. Identificação',
      '2. Objeto',
      '3. Orçamentos e reservas',
      '4. Prestação do serviço',
      '5. Direito de livre resolução',
      '6. Pagamento',
      '7. Cancelamentos',
      '8. Reclamações',
      '9. Propriedade intelectual',
      '10. Proteção de dados',
      '11. Resolução alternativa de litígios',
    ],
  },
  {
    path: '/politica-de-devolucoes',
    component: 'PoliticaDevolucoes',
    title: 'Política de Devoluções | Kyro Clean Solutions',
    description: 'Política de devoluções da Kyro Clean Solutions: direito de livre resolução, reclamações, limitações do material e cancelamentos num serviço prestado ao domicílio.',
    h1: 'Política de Devoluções',
    updated: 'setembro de 2026',
    intro: 'O que se aplica a um serviço prestado ao domicílio, onde não há bem a devolver: direito de livre resolução, como apresentar uma reclamação, o resultado acordado e as limitações próprias de cada material, cancelamentos e resolução alternativa de litígios.',
    sections: [
      '1. Natureza do serviço',
      '2. Direito de livre resolução',
      '3. Reclamações',
      '4. Resultado acordado e limitações do material',
      '5. Cancelamentos',
      '6. Resolução alternativa de litígios',
      '7. Contacto',
    ],
  },
];
