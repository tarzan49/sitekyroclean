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

Localidade e freguesia já têm esta ordem no ramo analisado. Preços precisa de processo e mesma visita, integrando fatores de preço no orçamento. Variantes precisa de reposicionamento das avaliações e FAQs, substituição da apresentação antiga do processo e integração dos blocos adicionais. Os componentes partilhados não devem alterar acidentalmente as páginas de problemas, materiais, marcas ou homepage.

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

## Próximas entregas

1. Uniformizar as sete secções das quatro famílias com componentes partilhados. Começar por exemplos representativos dos seis serviços, conservando o widget real, orçamento e navegação Ads. Alinhar também a estrutura do HTML inicial, que atualmente usa um gerador separado.
2. Expandir as FAQ por assunto e rever o restante conteúdo de cada família. Reutilizar factos técnicos verdadeiros; diferenciar preços, condições de visita e perguntas relevantes. Limpeza, lavagem e higienização podem descrever a mesma intervenção: não inventar métodos distintos para justificar keywords.
3. Definir os quatro problemas e a correspondência texto/imagem de cada serviço; produzir e validar um piloto de sofás antes da expansão visual.
4. Criar a biblioteca de imagens: dez alternativas por problema, quatro problemas por serviço, 240 imagens no total. Reutilizar imagens adequadas existentes quando validadas. Uma imagem por cartão, com seleção independente e estável; não gerar milhares de ficheiros por URL. Ilustrações identificadas como tal, nunca atribuídas a clientes/localidades.
5. Auditar todas as rotas e a semelhança de conteúdo; verificar links, sitemaps, metadados, fontes comerciais, cobertura das secções, desempenho e imagens. Inspeção visual em mobile por família e serviço. Possíveis alterações de URLs, redirecionamentos ou indexação são decisões separadas, suportadas por análise e, quando disponíveis, dados do Search Console.

## Verificação repetível

```sh
npx vitest run src/data/landingFaqPool.test.ts src/data/commercialCompletion.test.ts src/data/travelPrices.test.ts src/components/AdsLandingNavigation.test.tsx src/lib/seoFaqSchema.test.ts
npx tsc --noEmit -p tsconfig.app.json
npm run build
node scripts/audit-landing-faqs.mjs
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
