// Autoria editorial do site.
//
// Existia um buraco: os 26 artigos do blog eram assinados por "Equipa Kyro
// Clean", sem pessoa, sem página e sem nada a que um motor pudesse ligar a
// autoria. O E-E-A-T pede que se saiba quem responde pelo que está escrito, e
// "uma equipa" não responde por nada.
//
// Tudo o que estiver aqui tem de ser verdade verificável. Percurso, anos de
// experiência e certificações só entram quando forem confirmados por quem os
// tem: uma biografia inventada estraga exatamente o sinal que esta página
// existe para dar.

export interface Author {
  slug: string;
  name: string;
  jobTitle: string;
  /** Uma frase, no HTML e no schema. */
  summary: string;
  /** Parágrafos da página de autor. Só factos confirmados. */
  bio: string[];
}

export const AUTHORS: Record<string, Author> = {
  "antonio-peixoto": {
    slug: "antonio-peixoto",
    name: "António Peixoto",
    jobTitle: "Responsável pela Kyro Clean Solutions",
    summary:
      "Responsável pela Kyro Clean Solutions. Assina e revê o conteúdo publicado neste site.",
    bio: [
      "António Peixoto é o responsável pela Kyro Clean Solutions, empresa portuguesa de limpeza e higienização de estofos ao domicílio, com três anos de atividade no setor. Responde pelo serviço prestado às pessoas e pelo que está escrito neste site.",
      "Os artigos publicados aqui saem da prática do dia a dia: os materiais que aparecem nas casas dos clientes, as manchas que saem e as que não saem, o tempo real de secagem, o que acontece quando alguém tenta resolver o problema sozinho antes de nos chamar. Quando um artigo afirma alguma coisa sobre saúde, essa afirmação remete para uma fonte identificada, e não para a experiência da empresa.",
    ],
  },
};

export const DEFAULT_AUTHOR = AUTHORS["antonio-peixoto"];

export function getAuthor(slug: string): Author {
  const author = AUTHORS[slug];
  if (!author) throw new Error(`authors: "${slug}" não existe`);
  return author;
}
