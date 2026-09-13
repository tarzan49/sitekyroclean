# Uniformização e diversidade das landing pages

## Âmbito aprovado em 13/09/2026

Quatro famílias, seis serviços. Os números abaixo são calculados dos geradores deste ramo, não de comentários históricos nem de um relatório de indexação:

| Família | Rotas |
| --- | ---: |
| Localidade × serviço | 366 |
| Freguesia × serviço | 3.816 |
| Preços | 366 |
| Variantes keyword | 8.364 |
| Total | 12.912 |

O agrupamento pelo serviço efetivamente prestado resulta em 2.152 rotas por serviço, incluindo as variantes de impermeabilização de sofás e cadeiras no serviço impermeabilização. O site completo contém outras famílias fora deste trabalho. Não se deduz indexação ou tráfego a partir destas contagens.

## Estrutura final aprovada

Depois do hero e dos indicadores: orçamento/widget; avaliações reais; quatro problemas do serviço; exatamente quatro FAQ; guia do processo específico do serviço; mesma visita; serviços e zonas. Avenir e identidade visual existentes preservados. Pré-visualizações exclusivamente mobile.

Esta ordem está implementada na etapa 2. Preços inclui agora processo e mesma visita, integrando fatores de preço no orçamento. Variantes recebeu o reposicionamento das avaliações e FAQs, o guia específico do serviço e quatro problemas. As páginas de problemas, materiais, marcas e homepage não usam a nova composição.

## Etapa 1: biblioteca e limite de FAQ implementados

- Fonte única: `src/data/landingFaqPool.ts`, importável pelo navegador e pelo prerender sem React ou imagens.
- 84 perguntas editoriais distintas: 12 comuns e 12 específicas por serviço. Cada serviço tem 24 candidatas. Esta é uma biblioteca inicial; a meta anterior de 40–60 por serviço continua por desenvolver onde existirem assuntos úteis.
- Quatro perguntas por página, uma em cada assunto: orçamento, preparação, tratamento, cuidados posteriores.
- Pelo menos duas perguntas específicas do serviço em cada seleção. As páginas de preços começam com orçamento específico do serviço.
- Seleção estável por identidade da página; o município faz parte da chave das freguesias. Parâmetros de anúncios não alteram conteúdo.
- As respostas de deslocação usam a tabela existente por município, também nas variantes de freguesia. Nenhuma taxa foi alterada nesta etapa.
- Preços e compromissos comerciais são explicados com as fontes partilhadas. Não existem promessas de remoção total de manchas, anti-ácaros automaticamente incluído na limpeza, recolha gratuita de tapetes ou benefício clínico nesta nova biblioteca.
- Removidas as listas FAQ antigas dos quatro geradores. Os campos de introdução, benefícios, problemas e processo não foram reescritos nesta etapa e ainda exigem revisão editorial própria.
- React, HTML inicial e FAQPage recebem os mesmos quatro pares pergunta/resposta.
- Preços e variantes substituem o FAQPage pré-renderizado sem remover os metadados da empresa. A duplicação foi detetada durante a validação mobile.

Não existe promessa de que cada conjunto de quatro perguntas seja exclusivo. Há reutilização intencional de respostas úteis. A contagem de conjuntos distintos exclui a ordem das perguntas e não é uma métrica de qualidade, de ranking ou uma simulação de unicidade baseada no nome da localidade.

## Etapa 2: sete secções uniformizadas

- Composição única em `LandingServiceSections`, com dados puros de `landingPageModel.ts` e ordem declarada em `landingServiceCopy.ts`.
- Heroes, indicadores, URLs e metadados preservados. Widget real reutilizado, sem alterações ao motor de cálculo ou às taxas. Freguesias e variantes passam o município ao orçamento.
- Quatro problemas por serviço associados às quatro imagens existentes. Corrigida a utilização de problemas de tapetes nos preços de alcatifas. Textos dos novos cartões explicam limitações sem promessas clínicas ou de remoção total; a revisão dos restantes textos dos geradores não está concluída.
- Cinco passos por guia, reutilizando as apresentações existentes. Dados de sofás extraídos para partilha com o HTML inicial; dourado do guia alinhado com a regra canónica existente.
- Avaliações regionais e transcrições preservadas. Packs e diretórios têm destinos existentes no build e nos sitemaps.
- Fatores de preço conservados num painel expansível dentro do orçamento, sem acrescentar uma oitava secção principal.
- Navegação reduzida Ads preservada: nas entradas pagas de sofás continua a não aparecer o diretório. As páginas orgânicas mostram as sete secções.
- HTML inicial sem JavaScript gerado a partir do mesmo modelo, com texto dos quatro problemas, quatro FAQ, cinco passos e avaliações reais. Não é uma renderização visual do widget interativo; mantém uma tabela de preços como alternativa sem JavaScript.

Validação: 1.924 testes aprovados em 30 ficheiros, TypeScript e lint dos componentes/dados alterados sem erros. Build com 16.045 rotas; auditorias de estrutura, conteúdo, quatro FAQ e FAQPage nas 12.912 rotas abrangidas sem divergências. Links dos diretórios/packs presentes nos HTMLs e sitemaps. Amostra mobile a 390 × 844: 28 entradas, cobrindo os seis serviços nas quatro famílias, variantes de freguesia e Ads, sem overflow, com quatro perguntas e cinco etapas funcionais. Inspeção visual de preços, avaliações, problemas, FAQ e processo. Orçamento aberto pelo widget em higienização de sofá Paranhos e preços de cadeiras Lisboa, e pelos problemas em alcatifas Paranhos e impermeabilização de cadeiras Lisboa. Nenhum contacto enviado.

Esta entrega não produz a biblioteca de 240 imagens nem prova unicidade, indexação ou melhoria de ranking. Os quatro problemas comuns de cada serviço são a base para a próxima correspondência editorial e visual.

## Etapa 3: expansão editorial

Biblioteca ampliada de 84 para 180 perguntas distintas, com 40 candidatas por serviço, mantendo exatamente quatro por página. Introduções e descrições SEO passam por uma fonte partilhada, removendo promessas sanitárias sem comprovação nesses campos. Diferenciação por assunto, serviço e intenção, sem inventar métodos para sinónimos ou factos locais. Relatório, fontes e limites: [revisão editorial](landing-editorial-review.md).

Validação: 1.928 testes aprovados, TypeScript e lint dos ficheiros novos/componentes alterados, build de 16.045 rotas e auditorias das 12.912 páginas sem divergências. Amostra dos seis serviços em mobile 390 × 844, quatro FAQ funcionais, sete secções, sem overflow horizontal e introdução integral igual ao HTML inicial. Esta etapa não gera imagens nem demonstra unicidade SEO de cada página.

## Próximas entregas

1. Concluir a revisão dos restantes campos legados e mensagens partilhadas fora das FAQ/introduções/descrições agora revistas, sem alargar automaticamente o trabalho às famílias de problemas e materiais. Limpeza, lavagem e higienização podem descrever a mesma intervenção: não inventar métodos distintos para justificar keywords.
2. Validar a correspondência texto/imagem dos quatro problemas por serviço e produzir um piloto de sofás antes da expansão visual.
3. Criar a biblioteca de imagens: dez alternativas por problema, quatro problemas por serviço, 240 imagens no total. Reutilizar imagens adequadas existentes quando validadas. Uma imagem por cartão, com seleção independente e estável; não gerar milhares de ficheiros por URL. Ilustrações identificadas como tal, nunca atribuídas a clientes/localidades.
4. Auditar todas as rotas e a semelhança de conteúdo; verificar links, sitemaps, metadados, fontes comerciais, cobertura das secções, desempenho e imagens. Inspeção visual em mobile por família e serviço. Possíveis alterações de URLs, redirecionamentos ou indexação são decisões separadas, suportadas por análise e, quando disponíveis, dados do Search Console.

## Verificação repetível

```sh
npm test
npx tsc --noEmit -p tsconfig.app.json
npm run build
node scripts/audit-landing-faqs.mjs
node scripts/audit-landing-layout.mjs
```

O teste percorre as 12.912 rotas e verifica quantidade, respostas não vazias, perguntas distintas, assuntos, adequação ao serviço, identidade da seleção e igualdade das listas de rotas de variantes do navegador/gerador. O verificador pós-build compara texto e FAQPage com os dados de cada rota. Isto não demonstra indexação nem valida o conteúdo fora das FAQs.

Validação desta entrega: 14 testes aprovados, TypeScript e lint dos dados/utilitários alterados sem erros, build completo com 16.045 rotas pré-renderizadas. Comparação das 12.912 rotas abrangidas com zero divergências nas quatro FAQ, respostas e FAQPage. Navegador a 390 × 844 nas páginas de sofás Lisboa, sofás Paranhos, preços de alcatifas Lisboa, higienização de colchão Lisboa e impermeabilização de cadeiras Porto: quatro perguntas, abertura funcional, um único FAQPage com quatro entradas e sem overflow horizontal. Nenhum pedido de contacto enviado. Os números não representam uma auditoria de todas as secções do site.

## Princípios SEO de referência

A variedade visual não substitui utilidade local ou resposta à intenção de pesquisa. Repetição legítima de processos e regras não precisa de sinónimos artificiais. Não usar um limiar inventado de percentagem de texto único.

- [Google: guia de SEO e conteúdo duplicado](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
- [Google: políticas de spam, doorway e conteúdo em escala](https://developers.google.com/search/docs/essentials/spam-policies).
- [Google: imagens](https://developers.google.com/search/docs/appearance/google-images).
- [Google: limites dos resultados enriquecidos FAQ](https://developers.google.com/search/blog/2023/08/howto-faq-changes).

As fontes foram consultadas na fase de estratégia. As FAQ são para ajudar o cliente; não se promete apresentação enriquecida em pesquisas para um site de limpeza.
