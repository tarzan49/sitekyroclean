import { DEFAULT_AUTHOR } from './authors';
import { STUDY_ROUTE } from './studyData';

/**
 * A navegação do rodapé, escrita uma só vez para as duas renderizações.
 *
 * O rodapé aparece em todas as páginas do site e tem cerca de vinte ligações,
 * mas o HTML estático só levava as três da entidade (`ENTITY_FOOTER_HTML`,
 * fase 8). O efeito mediu-se: `/glossario-limpeza-estofos` está no rodapé de
 * todas as páginas e recebia **uma** ligação interna no HTML que os crawlers
 * leem; `/antes-depois-limpeza` está na navegação do cabeçalho e recebia
 * **zero**. As páginas legais, as FAQ e os dois tratamentos estavam no mesmo
 * caso. É o mesmo padrão do glossário na fase 2, do índice do blog e da lista
 * "Disponível em": o conteúdo existia para quem vê a página e não para quem a
 * lê sem JavaScript.
 *
 * Como isto é a mesma informação nas duas renderizações, não há questão de
 * cloaking: muda a renderização, não o que é dito. Por isso tem de sair daqui
 * dos dois lados — uma ligação acrescentada só ao `prerender.ts` seria
 * exatamente o que a regra proíbe.
 *
 * `/packs` (o configurador de raiz, sem localidade) foi removido: os únicos
 * packs que existem são os 244 `/{pack}-{cidade}`. O rodapé já não tem um
 * bloco "Packs" à parte — a entrada de "Recursos" abaixo aponta para
 * `/guia-de-packs`, que lista todas as combinações por cidade.
 */
export interface FooterLink { href: string; label: string }
export interface FooterNavGroup { title: string; links: FooterLink[] }

export const FOOTER_NAV: FooterNavGroup[] = [
  {
    title: 'Serviços Kyro Clean Solutions',
    links: [
      { href: '/limpeza-sofas', label: 'Higienização de Sofás' },
      { href: '/impermeabilizacao', label: 'Impermeabilização de Sofás' },
      { href: '/limpeza-tapetes', label: 'Higienização de Tapetes' },
      { href: '/limpeza-colchoes', label: 'Higienização de Colchões' },
      { href: '/limpeza-cadeiras', label: 'Higienização de Cadeiras' },
      { href: '/limpeza-alcatifas', label: 'Higienização de Alcatifas' },
      // Estava só na navegação do cabeçalho, que não existe no HTML estático.
      { href: '/antes-depois-limpeza', label: 'Antes e Depois' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { href: '/blog', label: 'Blog' },
      { href: '/perguntas-frequentes-limpeza-estofos', label: 'Perguntas Frequentes' },
      { href: '/glossario-limpeza-estofos', label: 'Glossário' },
      { href: '/sobre', label: 'Sobre nós' },
      { href: STUDY_ROUTE, label: 'Estudo: o que as pessoas pedem' },
      { href: `/autor/${DEFAULT_AUTHOR.slug}`, label: 'Quem assina o que escrevemos' },
      { href: '/guia-de-packs', label: 'Packs por Cidade' },
    ],
  },
  {
    title: 'Problemas Comuns',
    links: [
      { href: '/problemas/manchas-sofa', label: 'Manchas no Sofá' },
      { href: '/problemas/cheiro-sofa', label: 'Cheiro no Sofá' },
      { href: '/problemas/acaros-colchao', label: 'Ácaros no Colchão' },
      { href: '/problemas/urina-colchao', label: 'Urina no Colchão' },
      { href: '/problemas/pelos-animais-sofa', label: 'Pelos de Animais' },
      { href: '/problemas/impermeabilizar-sofa', label: 'Impermeabilizar Sofá' },
    ],
  },
  {
    // As 20 páginas B2B não tinham uma única ligação interna em lado nenhum do
    // site, nem no React nem no estático: nunca chegou a existir um hub para
    // elas. Ficam aqui as quatro cabeças de região; as restantes dezasseis são
    // alcançadas a partir destas, pelo bloco de cidades das próprias páginas.
    title: 'Empresas',
    links: [
      { href: '/limpeza-comercial-porto', label: 'Limpeza comercial no Porto' },
      { href: '/limpeza-comercial-lisboa', label: 'Limpeza comercial em Lisboa' },
      { href: '/limpeza-comercial-braga', label: 'Limpeza comercial em Braga' },
      { href: '/limpeza-comercial-faro', label: 'Limpeza comercial em Faro' },
    ],
  },
];

/**
 * A faixa final do rodapé: tratamentos e as duas cidades do Centro.
 *
 * Aveiro e Coimbra apontavam para `/limpeza-estofos-aveiro` e
 * `/limpeza-estofos-coimbra`, que não existem: não há rota em `App.tsx`, não
 * há HTML pré-renderizado e não estão em nenhum sitemap. Eram duas ligações
 * mortas no rodapé de todas as páginas do site, a servir um soft-404 — o
 * mesmo problema que os packs órfãos já tinham causado. Passaram a apontar
 * para a página de serviço real de cada cidade, que existe desde que Aveiro e
 * Coimbra passaram a cidades servidas (10/09/2026).
 */
export const FOOTER_STRIP_LINKS: FooterLink[] = [
  { href: '/tratamento-anti-acaros', label: 'Tratamento anti-ácaros' },
  { href: '/desbacterizacao', label: 'Desbacterização' },
  { href: '/limpeza-sofas-aveiro', label: 'Limpeza de estofos em Aveiro' },
  { href: '/limpeza-sofas-coimbra', label: 'Limpeza de estofos em Coimbra' },
];

/** Páginas legais. O Livro de Reclamações é externo e fica fora desta lista. */
export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { href: '/politica-de-privacidade', label: 'Política de Privacidade' },
  { href: '/termos-e-condicoes', label: 'Termos e Condições' },
  { href: '/politica-de-devolucoes', label: 'Política de Devoluções' },
];
