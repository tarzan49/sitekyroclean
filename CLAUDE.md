# Kyro Clean Solutions — Instruções para Claude Code

Este ficheiro carrega automaticamente no início de qualquer sessão do Claude Code aberta nesta pasta, em qualquer máquina. É a única forma real de manter as duas instâncias (PC Windows + MacBook do dono) alinhadas — não têm memória partilhada, só isto (e o `CONTEXT.md`) viaja entre elas via Git.

**Antes de mexer em código:** lê `CONTEXT.md` (arquitetura completa: rotas, fluxo do quiz, design tokens, tabelas de preços) e `AUDIT.md` (problemas de qualidade de código já conhecidos). Este ficheiro é só as regras e factos que não podes adivinhar a partir do código.

---

## Duas máquinas, um repositório

O dono trabalha a partir de um PC Windows e de um MacBook, cada um com a sua instância própria do Claude Code. Sem sincronização automática de memória.

1. No início de qualquer trabalho: `git status` + `git log -5 --oneline`; se não estiveres alinhado com `origin/master`, faz `git pull`.
2. Antes de trocar de máquina ou terminar sessão: commit + push do que ficou feito.
3. `.env` é local por máquina (chaves Supabase), nunca vai para o Git — normal aparecer como modificado, ignora.
4. Produção (cleansolutions.com.pt) só atualiza com push para o GitHub.
5. O repositório é **público** (`tarzan49/sitekyroclean`) — o autor de cada commit fica visível publicamente. Cuidado com nomes/dados pessoais em mensagens de commit.

---

## Verificar tipos: `npm run typecheck`, nunca `npx tsc --noEmit`

**`npx tsc --noEmit` na raiz não verifica um único ficheiro e sai com 0.** Não é
lentidão nem cache: o `tsconfig.json` da raiz é um ficheiro-solução, tem
`"files": []` e só `references` para `tsconfig.app.json` e `tsconfig.node.json`.
Sem `-b`, o `tsc` verifica a lista de ficheiros da raiz, que está vazia. Quem o
corresse como passo de validação recebia verde a provar nada — e era o comando
habitual do projeto, incluindo dentro do portão de release do
`docs/tracking-plano-de-publicacao.md` e num "`npx tsc --noEmit -p .` limpo"
registado no `CONTEXT.md` como verificação de uma sessão inteira. Corrigido em
2026-09-23: existe `npm run typecheck` (`tsc -b --noEmit`), que percorre os dois
projetos. Medido: 0 ficheiros antes, 431 depois.

**`npm run build` também não verifica tipos** — é `vite build`, e o esbuild/SWC
deita fora os tipos sem os validar. Um build verde não substitui o `typecheck`;
são coisas diferentes e é preciso correr as duas.

**O `tsconfig.node.json` cobre o `vite.config.ts` e, por ele, os `scripts/*.ts`**
(que entram no grafo pelos `import()` dinâmicos dos três plugins do
`closeBundle`) e os módulos de `src/data`/`src/constants` que os scripts leem.
Ou seja, o prerender, o sitemap e o `llms.txt` passaram a ser verificados — a
nota do `CONTEXT.md` de que "`scripts/*.ts` não é coberto por `tsc --noEmit`"
deixou de valer. Para isso, esse projeto precisou do mesmo `paths` do
`tsconfig.app.json`: sem ele, um ficheiro de dados alcançado por caminho
relativo mas que importa por `@/` não resolvia (era o caso de
`locationPriceTestimonialsData.ts`, com dois `TS2307` de raiz). **Se acrescentares
um `paths` novo ao `tsconfig.app.json`, acrescenta-o também ao
`tsconfig.node.json`** — é mais uma instância da armadilha das constantes
duplicadas, desta vez em configuração.

---

## Factos de negócio atuais (não hardcodar — importar sempre)

- **Avaliações:** **4.9★**, **110** avaliações, **+1100** clientes servidos. Fonte única: `src/constants/business.ts` (`REVIEW_RATING`, `REVIEW_COUNT`, `CLIENTS_SERVED_LABEL`) — `src/lib/seoSchema.ts` importa isto diretamente e é usado tanto client-side como pelo `scripts/prerender.ts`. **Armadilha resolvida em 2026-09-14:** as cópias de texto solto deixaram de existir. `TestimonialsV1.tsx`, `problemSeoData.ts`, `problemTipsData.ts`, `enTouristSeoData.ts`, `TrustRatingBadge.tsx` e `src/hooks/use-quiz-ui-effects.ts` importam agora `REVIEW_RATING` e `REVIEW_COUNT` (o número de avaliações já importava; o rating 4.9 estava solto em 36 sítios e foi centralizado). **A única cópia à mão que resta é o `index.html`** (schema estático da homepage, linha do `aggregateRating`), que é HTML puro e não consegue importar — sempre que o rating ou o número mudar, mudar `business.ts` e essa linha, mais nada. **Não voltar a acrescentar uma frase separada tipo "Já somos N a recomendar" nas heroes** — foi tentado em 2026-09-06 e removido no mesmo dia por ser redundante com o badge `TrustRatingBadge` (que já mostra "4.9 · N+ avaliações Google" duas linhas acima) e ficar com aspeto forçado/colado.
- **Aveiro e Coimbra são cidades reais, não expansão.** O rodapé manteve durante uma semana os rótulos "Aveiro: consultar disponibilidade" e "Coimbra: consultar disponibilidade" depois de as duas terem passado a cidades servidas a 15€ (2026-09-10), a contradizer `/sobre`, as páginas de localidade e o `travel.ts`. Corrigido em 2026-09-17. O rodapé aparece em todas as páginas: uma frase desatualizada ali contradiz o site inteiro de uma só vez.
- **Livro de Reclamações:** o rodapé passou a ligar para `livroreclamacoes.pt` (2026-09-17). **Falta o NIF/NIPC**, que não existe em lado nenhum do site: sem ele não há forma de um motor confirmar a entidade legal.
- **Taxa de deslocação:** mínimo **10€ em todo o site**, sem exceções (nenhuma cidade a 5€). Fonte única: `src/constants/travel.ts` (`locationPrices`) — `QuizTypes.ts` e `locationSeoData.ts` só reexportam/importam, já não há cópias paralelas (armadilha resolvida). **Aveiro e Coimbra: 15€** (adicionadas como cidades reais em 2026-09-10, servidas pela equipa Porto por não haver equipa própria no Centro).
- **Impermeabilização de tapetes: descontinuada (removida em 2026-08-20).** Só sofás e cadeiras têm impermeabilização. Tapetes continuam a ter higienização (limpeza normal) — não é o mesmo serviço, não reintroduzir sem pedido explícito.
- **Tapetes nunca mostram preço, em lado nenhum (desde 2026-09-06).** O quiz interativo deixou de estimar preço por m² — é sempre "Sob Orçamento". O passo "Detalhes do(s) Tapete(s)" (`QuizStepConfigCarpet.tsx`) virou um simulador: a pessoa mede cada tapete (largura × comprimento, `CarpetItem[]` em `QuizTypes.ts`) e pode adicionar quantos quiser via "+ Adicionar outro tapete", sem limite. O antigo motor de preço por escalão (`calcCarpetPrice`/`CARPET_TIERS`/`carpetActiveTier`) foi removido de `quizHelpers.ts` — já não existe em lado nenhum do quiz. O widget de preços de marketing (`PriceWidget.tsx`, ver nota abaixo) usa um motor **separado** (`calcCarpetWidget` em `src/lib/priceWidgetCalc.ts`), também já ajustado para nunca mostrar preço de tapete (exceto alcatifa, que continua a 3€/m² e é um serviço diferente).
- **Cadeiras: decisão de addon movida para depois do "Continuar" (desde 2026-09-06).** Quando a limpeza é o serviço principal, o passo "Detalhes das Cadeiras" só pergunta quantidade — a decisão de impermeabilização/anti-ácaros passou para um ecrã novo, estilo "upsell de companhia aérea" (`QuizChairsAddonUpsell.tsx`), que aparece uma única vez logo a seguir ao "Continuar" dessa etapa, antes do gate do mínimo de pedido. Nesse ecrã: Impermeabilização continua Premium/Essencial (Premium com selo "TOP", Essencial sempre disponível, nunca remover uma das duas sem pedido explícito — já aconteceu por engano); Anti Ácaros para cadeiras é uma opção nova, mutuamente exclusiva com a impermeabilização, preço sempre **5€ por cadeira, fixo, mostrado só como taxa unitária "5€/un." nunca como total calculado** (pedido explícito, repetido duas vezes) — não confundir com o Anti Ácaros de colchão/sofá do widget de marketing, que usa a fórmula escalonada antiga (`calcChairAntiAcarosTotal`, 10€ + 7,50€/cadeira) e continua inalterada aí.
- **Upsell final "Aproveite e poupe 10%" (desde 2026-09-06).** O antigo `QuizUpsellOverlay.tsx` (escolher um item de cada vez) foi completamente removido e substituído por `QuizComboUpsellScreen.tsx`: um único ecrã com as 3 categorias (Colchão, Sofá, Cadeiras) lado a lado, cada uma abre a sua própria página de quantidades com tamanhos/preços reais (não uma quantidade genérica). Continua a escrever no mesmo array `upsellItems`/`setUpsellItems` que já existia, por isso o desconto de 10% (`packDiscountActive`), o recibo e o payload de submissão não precisaram de alterações.
- **Testemunhos das páginas comerciais B2B** (`/limpeza-comercial-*`): o dono prometeu uma lista real de restaurantes/hotéis clientes para usar como testemunhos. Ainda não foi entregue — nunca inventar nomes ou citações até essa lista chegar.

## Armadilha recorrente: constantes duplicadas

`scripts/prerender.ts` e `scripts/generate-sitemap.ts` correm em Node puro (sem Vite), por isso não conseguem importar via alias `@/`. Vários dados de negócio existem em **duas cópias**: uma importável (`src/constants/business.ts`, `src/components/quiz/QuizTypes.ts`) e uma cópia paralela consumida só pelos scripts (`src/data/locationSeoData.ts`, constantes locais dentro do próprio `prerender.ts`). **Qualquer correção de preço, taxa ou estatística tem de ser feita nas duas cópias**, senão o site prerenderizado (o que o Google vê) fica dessincronizado do site interativo.

Instância resolvida (2026-09-17): `scripts/generate-sitemap.ts` mantinha um array `blogSlugs` com os 26 slugs do blog copiados à mão de `src/data/blogData.ts` — um post novo era prerenderizado e navegável mas nunca chegava ao sitemap. Passou a importar `getAllPosts()`, que além de resolver a duplicação dá a cada post o seu `updatedDate` editorial real como `<lastmod>`.

Segunda instância do mesmo problema: `src/pages/AdminPanel.tsx` mantém o seu próprio array `SITEMAPS` e switch `getSitemapUrls()`, escritos à mão — novos sub-sitemaps adicionados a `scripts/generate-sitemap.ts` **não aparecem automaticamente** ali, é preciso atualizar os dois.

**Terceira armadilha (RESOLVIDA em 2026-09-08): o widget de preços já foi um componente único partilhado, depois passou a 3 cópias inline, agora voltou a ser 1.** `src/components/ServicePriceSection.tsx`, `src/pages/LocationServicePage.tsx` e `src/pages/FreguesiaServicePage.tsx` tinham cada uma a sua própria cópia inline do JSX do widget (steppers, toggles, badge de desconto), com o JSX já a divergir visivelmente entre as 3 (estilos de cartão diferentes) apesar de a lógica ser idêntica. Extraído para `src/components/PriceWidget.tsx` (apresentação, visual escuro/dourado igual ao quiz) + `src/hooks/use-price-widget.ts` (estado e handlers) — as 3 páginas agora só fazem `<PriceWidget serviceSlug={...} initialLocation={...} />`. **Qualquer alteração visual/UI ao widget faz-se só em `PriceWidget.tsx`** — se no futuro voltar a aparecer uma cópia inline do widget numa página nova, é um erro, não um padrão a seguir. Os toggles Impermeabilizar/Anti Ácaros que existiam inline no widget foram removidos nesta mesma limpeza (pedido explícito): essa decisão faz-se agora só no ecrã de upsell dedicado que o quiz já mostra a seguir às quantidades, nunca duas vezes. A lógica de preços em si (`src/lib/priceWidgetCalc.ts`) já estava centralizada antes disto e continua a ser importada só por `PriceWidget.tsx`. Os pontos de confiança à esquerda do widget (`src/constants/serviceTrustPool.ts` via `getTrustPointsForSeed`) continuam centralizados como antes, sem alteração.

**Instância resolvida (2026-09-17): os preços citados nos 26 artigos do blog.** `src/data/blogData.ts` escrevia os preços em prosa à mão (49€/69€/79€ para sofás, 59€/69€/79€ para colchões, as duas colunas da impermeabilização, o acréscimo da chaise longue). Passou a importar `sofaPrices`, `mattressPrices` e `sofaChaisePrice` de `QuizTypes.ts` e a interpolá-los em template literals, com helpers que rebentam no build se um `id` deixar de existir. `QuizTypes.ts` não tem imports com alias `@/`, por isso o `prerender.ts` consegue lê-lo. **Um preço novo num artigo escreve-se com a constante, nunca com o número.** Os números que sobram em prosa são ilustrativos e não nossos (o valor de um sofá, um preço de mercado a evitar), esses ficam à mão de propósito.

**Instância resolvida (2026-09-17): o corpo dos artigos era renderizado por duas funções diferentes.** O React convertia `**negrito**` em `<strong>` dentro do `BlogPost.tsx`; o `prerender.ts` escapava o texto cru, por isso o HTML estático (o único que os crawlers leem) mostrava os asteriscos literais e as listas `- item` / `1. passo` saíam como parágrafos corridos. Existe agora `src/lib/blogMarkdown.ts` (`renderBlogBody`), usado pelos dois lados, que produz `<p>`, `<ul>`, `<ol>` e `<strong>` a partir do mesmo texto. As listas recuperam os marcadores pela classe `.blog-body` em `src/index.css`, porque o HTML é injetado e o Tailwind não lhe chega. **Markdown novo nos artigos (tabelas, links) tem de ser acrescentado a essa função, não a um dos lados.**

**Instância resolvida (2026-09-17): `src/data/problemRouteData.ts` é uma segunda lista dos problemas, escrita à mão.** Existe para manter o texto de `problemSeoData.ts` fora do bundle inicial, e só guarda `slug` + `relatedCities`. O efeito de a esquecer é silencioso: um problema novo ganha a sua página `/problemas/{slug}` mas **nenhuma página problema × cidade**, que é onde está o volume. Aconteceu com os oito problemas acrescentados nesta data. `src/data/problemRouteData.test.ts` passou a comparar as duas listas e rebenta se divergirem, incluindo nas cidades.

**Quarta armadilha (2026-09-10): `expansionCities` em `treatmentSeoData.ts` colide com cidades reais novas.** Este ficheiro mantém um array próprio `expansionCities` (hoje vazio) para cidades "cobertura por confirmar" — `getExpansionRoutes()` gera páginas placeholder nas mesmas rotas `/{serviço}-{cidade}` que `LocationServicePage.tsx` usa para cidades reais. Se uma cidade estiver nos dois sítios ao mesmo tempo (aconteceu com Aveiro/Coimbra), o `scripts/prerender.ts` sobrescreve o HTML real com o placeholder "Disponibilidade sob consulta" — o React Router no cliente mostra a página certa (route real registada primeiro em `App.tsx`), mas o que o Google indexa é sempre o placeholder. **Sempre que uma cidade sair de "expansão" para "confirmada"** (ou for adicionada de novo a `locationSeoData.ts`), remover essa entrada de `expansionCities` no mesmo commit.

**Quinta armadilha (crítica, já aconteceu): `.env` e o Cloudflare Pages.** O Cloudflare Pages construiu sempre o site a partir do `.env` que esteve committado no Git desde o commit inicial — nunca teve `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`/`VITE_ADMIN_PASSWORD` configuradas como env vars próprias no dashboard do Cloudflare Pages. Quando o `.env` foi corretamente removido do Git em 2026-08-24 (estava exposto num repo público), o build seguinte em produção compilou com essas variáveis `undefined` — `createClient(undefined, undefined)` do supabase-js rebenta de forma síncrona, o que crashava as abas CRM/Métricas do admin panel e fazia todo insert em `quiz_events`/`leads`/`error_logs` falhar em silêncio durante 2-4 dias sem nenhum erro visível (Formspree não depende do Supabase, por isso os pedidos de orçamento reais continuaram a chegar normalmente — só o painel interno ficou cego). Corrigido no código em 2026-08-26 (`src/integrations/supabase/client.ts`/`src/lib/supabase.ts` já não rebentam com env var em falta, mostram banner vermelho no admin panel via `isSupabaseConfigured`). **Sempre que se mexer em `.gitignore`/tracking de `.env`, confirmar explicitamente que o Cloudflare Pages já tem essas env vars configuradas do lado dele** antes de dar a limpeza por concluída.

**Sexta armadilha (2026-09-14): `public/_routes.json` e a Pages Function.** `functions/_middleware.ts` existe só para redirecionar `admin.cleansolutions.com.pt/` para `/admin/panel`. Sem `_routes.json`, o Cloudflare Pages faz a Function correr em **todos** os pedidos, incluindo cada ficheiro JS, cada imagem e cada fonte: são 80 invocações por visita a uma página, contra um limite de 100.000 por dia no plano gratuito, ou seja um teto de cerca de 1.250 visitas diárias. `public/_routes.json` limita a Function ao caminho `/`, que é o único que ela trata. **Se algum dia acrescentares outra Pages Function noutro caminho, tens de acrescentar esse caminho ao `include` do `_routes.json`**, senão ela nunca corre e falha em silêncio. Confirmar o número real de invocações em Workers & Pages → projeto → Functions.

**Sétima armadilha (2026-09-14, já causou um incidente): nunca correr `supabase db push` neste projeto.** A base de dados remota foi sempre gerida à mão pelo SQL Editor do dashboard, por isso não tem tabela de histórico de migrações. `db push` interpreta isso como base vazia e tenta **reaplicar o histórico todo desde `20240101_admin_tables.sql`**, que recria as políticas permissivas de 2024. Aconteceu: `quiz_events` e `error_logs` voltaram a ficar legíveis pela chave anónima, e a corrida parou a meio num `check constraint` de `quiz_events` que dados reais já violavam. Reparado por `20260914000100_repair_rls_after_history_replay.sql`, que é seguro de repetir. **Alterações à base de dados fazem-se colando o SQL da migração no SQL Editor**, e o ficheiro em `supabase/migrations/` fica só como registo. Verificar sempre depois, com a chave anónima, que `leads`, `quiz_events` e `error_logs` não são legíveis e que o insert anónimo continua a funcionar em `quiz_events`/`error_logs` (o erro esperado é `23502`, campos em falta, não `42501`, que seria bloqueio de RLS).

**Oitava armadilha (2026-09-14/15): o Formspree foi substituído pelo Resend — o canal de email deixou de ser independente do Supabase, e o domínio remetente correto é `cleansolutions.com.pt`, não `kyroclean.pt`.** `postToFormspree` em `src/services/submissionService.ts` e o fetch direto em `src/services/contactService.ts` foram trocados por uma função Edge nova, `supabase/functions/send-lead-email/index.ts`, chamada via `supabase.functions.invoke('send-lead-email', ...)` — a mesma forma que já era usada para o canal do CRM (`submit-lead`). Isto **invalida uma frase da quinta armadilha**: "Formspree não depende do Supabase" já não é verdade — agora os dois canais (CRM e email) dependem do Supabase Edge Functions, por isso um incidente como o das env vars do Cloudflare Pages (quinta armadilha) passaria a afetar os pedidos de orçamento a sério, não só o painel interno. A independência que resta é só entre as duas *funções* Edge (`submit-lead` e `send-lead-email`), de propósito separadas para que uma falha numa não arraste a outra — ver o comentário no topo de `submit-lead/index.ts`.

**Armadilha do domínio remetente (descoberta a testar a migração):** a conta Resend não tinha nenhum domínio adicionado — nem `kyroclean.pt` (o que `newsletter-welcome/index.ts` usa como remetente, e que por isso muito provavelmente também nunca entregou nenhum email em produção, apesar de a função em si nunca ter sido deployed) nem `cleansolutions.com.pt`. `send-lead-email` usa `pedidos@cleansolutions.com.pt` como remetente (decisão do dono em 2026-09-15: o domínio de produção, não `kyroclean.pt`). O SDK do Resend **não lança exceção** quando a API recusa um envio (domínio por verificar, etc.) — devolve `{data: null, error: {...}}` normalmente; o código já verifica esse campo, mas qualquer novo código que chame `resend.emails.send()` tem de fazer o mesmo, senão fica a reportar sucesso em falsas entregas, como aconteceu aqui na primeira versão. Precisa de duas secrets no dashboard do Supabase (Project Settings → Edge Functions → Secrets): `RESEND_API_KEY` (configurada em 2026-09-15) e `LEAD_NOTIFICATION_EMAIL` (`cleansolutions.pt25@gmail.com`, idem). **Migração concluída: o `cleansolutions.com.pt` está verificado no Resend e o canal de email está a entregar em produção (confirmado pelo dono em 2026-09-17).** Os 4 registos DNS (DKIM TXT, MX, SPF TXT, CNAME) já estão apontados — não voltar a dizer ao dono que isto está pendente, como aconteceu nesta data por esta nota estar desatualizada. Se um dia for preciso reconfirmar os valores, pedir ao Resend com `GET /domains` (mudam por conta).

## GEO (otimização para motores generativos) — Fase 1 feita em 2026-09-17

Contexto: o site já tinha a parte difícil resolvida (16.045 páginas em HTML estático via `prerender.ts`, JSON-LD rico). Os crawlers de IA não executam JavaScript, por isso **o que eles leem nunca é o `PriceWidget.tsx`** — é o HTML que o `prerender.ts` escreve. Confirmado: o widget aparece 0 vezes no HTML estático. Qualquer trabalho de GEO sobre preços faz-se no prerender, não no widget.

- **`public/robots.txt` tem um grupo explícito para bots de IA** (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, etc.). Não lhes abre nada que a regra `*` já não abrisse; existe porque os grupos de robots.txt não herdam regras uns dos outros, e assim um `Disallow` futuro no `*` não os exclui em silêncio. Retirar um user-agent de lá remove o site das respostas desse assistente.
- **`llms.txt` é gerado, nunca escrito à mão.** `scripts/generate-llms-txt.ts` corre no `closeBundle` do Vite e lê tudo das fontes reais (`serviceCatalog.ts`, `constants/travel.ts`, `constants/business.ts`, `blogData.ts`). É o único ficheiro que resume o negócio todo numa página, logo o candidato natural a ficar desatualizado — por isso não guarda factos próprios. **Não acrescentar lá números à mão.**
- **`<lastmod>` nos sitemaps vem do histórico do git** (`scripts/content-dates.ts`), por família de páginas, a partir da data do módulo de dados que gera essa família. A nota antiga "omit lastmod until a reliable date is available" estava certa: `lastmod` = data do build é pior que nenhum, porque diz que 16.000 páginas mudaram todas hoje. **Se o clone do Cloudflare Pages for shallow, `getContentDate()` devolve `undefined` e os sitemaps saem sem `lastmod`** — degrada para o comportamento antigo em vez de mentir. Confirmar no sitemap em produção depois do deploy; se não houver `lastmod`, a correção é o clone completo do lado do Cloudflare, não hardcodar datas.
- Os `public/sitemap*.xml` **não são versionados**: são artefactos de build que vão para `dist/`. Correr `npx tsx scripts/generate-sitemap.ts` standalone escreve-os em `public/` — apagar depois, não commitar.
- **Os factos do hero são partilhados entre o React e o prerender (2026-09-17).** `commercialHeroPriceLine()` e `commercialHeroStats()` vivem em `src/data/commercialHeroCopy.ts` e são chamadas pelo `CommercialHero.tsx` (para as pessoas) e pelo `scripts/landing-page-html.ts` (para os crawlers). Antes disto, o preço de partida, a deslocação da cidade e a avaliação estavam no hero e **não apareciam uma única vez no HTML estático**: duas audiências, informação diferente. **Não voltar a escrever estes valores à mão em nenhum dos lados.**
- **Preços das páginas de SEO saem em `<table>` com cabeçalhos**, não em `<ul>`. O cabeçalho é "Preço" e não "Preço desde", porque nem todas as linhas do `PRICE_TABLE` são preços de partida (`+10€` é um acréscimo, `Sob orçamento` não é preço). O `<caption>` repete o `<h2>` de propósito: uma tabela extraída da página leva a legenda e perde o título.
- **Os artigos do blog assinam e datam no HTML estático (2026-09-17).** A interface `PageContent` do `prerender.ts` ganhou `byline` (autor, data de publicação, data de atualização, tempo de leitura) e `articleSections`. Antes disto o `<main>` de um post saltava do `<h1>` para o texto: a pessoa via o autor e a data, o crawler não via nenhum dos dois, que são exatamente os sinais de autoria que o E-E-A-T pede. As dicas de cada secção também passaram a sair no HTML estático.
- **O `BlogPosting` credita a entidade por `@id`.** O `prerender.ts` emitia `author: { "@type": "Organization", name: "Kyro Clean Solutions" }`, um nó solto que não se liga a nada, enquanto a página React já apontava para `#business`. Ficaram os dois com `{ "@id": ".../#business" }`, mais `publisher`. **Qualquer schema novo que credite a empresa usa o `@id`, nunca um nó novo com o mesmo nome.**
- **Autoria por pessoa: feita em 2026-09-17.** Os 26 artigos passaram de `author: "Equipa Kyro Clean"` para o nome do responsável, vindo de `src/data/authors.ts`. Há página de autor em `/autor/antonio-peixoto` (`src/pages/Autor.tsx`), prerenderizada e no sitemap, com nó `Person` ligado ao `#business` por `worksFor`, e o `BlogPosting` credita agora a pessoa (`author`) e a empresa (`publisher`), separadamente, como deve ser. **A biografia só tem factos confirmados: não acrescentar anos de experiência, formações ou certificações sem o responsável os confirmar** — uma bio inventada estraga exatamente o sinal que a página existe para dar. A política editorial publicada em `src/constants/editorialPolicy.ts` descreve regras que o código impõe mesmo; se uma regra deixar de ser verdade, tira-se de lá.
- **A regra anti-cloaking.** Como o HTML estático é invisível para as pessoas, é tecnicamente possível escrever lá o que o site não diz. Não fazer. Tudo o que for para o prerender tem de ser informação que o utilizador também recebe nessa página: mesmos factos, renderização diferente.
- **Fase 2 concluída em 2026-09-17:** `HowTo` JSON-LD em todas as páginas landing (emitido no `emit()` do prerender, a partir de `landing.processSteps`), `Offer` com `priceSpecification.minPrice` (o `price` sozinho afirmava preço exato quando é preço de partida), e `DefinedTermSet` no glossário. **Os 16 termos do glossário saíram de dentro de `GlossarioEstofos.tsx` para `src/data/glossaryTerms.ts`**: estavam dentro da página React, por isso o HTML estático do glossário tinha 1.200 caracteres de cabeçalho e zero definições. Passou a 11.398. Qualquer termo novo acrescenta-se só ao ficheiro de dados.
- **Fase 3 (entidade) feita em 2026-09-17:** página `/sobre` (`src/pages/Sobre.tsx`), com `AboutPage` a apontar por `@id` para o nó `#business` já existente em vez de redefinir a empresa. **Todos os números e compromissos são importados** de `commercialPolicy.ts`, `business.ts`, `serviceCatalog.ts` e `travel.ts` — nada escrito à mão, para não poder contradizer uma página de serviço. Ligada no rodapé para não ficar órfã.
- **`sameAs` deixou de se auto-referenciar.** Tinha `[SITE_URL, GOOGLE_MAPS_URL]`; o site a apontar para si mesmo não corrobora nada. Ficou só a ficha do Google. **Falta o que interessa: perfis próprios noutras plataformas** (Instagram, Facebook, LinkedIn). Confirmado pelo dono em 2026-09-17: não existe nenhum, por isso a fase 8 começa por criá-los. É o sinal que permite a um motor confirmar que a empresa existe fora do seu próprio domínio, e hoje a reputação está toda concentrada na Google, onde os motores que não são da Google não chegam.
- **Fase 4 (fugas mecânicas) feita em 2026-09-17:** rodapé a deixar de contradizer o site em Aveiro/Coimbra, autor do `BlogPosting` por `@id`, assinatura e data no HTML estático, markdown renderizado em vez de escapado, preços dos artigos vindos de `QuizTypes.ts`, Livro de Reclamações.
- **Fase 5 (fontes) feita em 2026-09-17:** ver a regra das afirmações de saúde na secção de conteúdo e estilo. `src/data/blogSources.ts`, `citation` no `BlogPosting`, teste que rebenta se um artigo mencionar uma autoridade sem citar fonte.
- **Fase 6 (autoria) feita em 2026-09-17:** `/autor/antonio-peixoto`, nó `Person`, política editorial publicada. Ver a nota da autoria por pessoa acima.
- **Fase 7 (conteúdo original) feita em 2026-09-17:** `/estudo-limpeza-estofos-portugal` (`src/pages/Estudo.tsx`), com os 224 pedidos concluídos entre 2026-06-05 e 2026-09-17. A consulta está em `supabase/queries/estudo-dados-proprios.sql`, é uma só instrução de propósito (o SQL Editor mostra apenas o resultado da última instrução de um script) e devolve só agregados, com corte nos grupos de menos de 20 registos. **A chave anónima não lê `quiz_events` nem `leads`**, de propósito: corre-se no SQL Editor do dashboard, com sessão iniciada, nunca com `supabase db push`. Três coisas que ficaram decididas e não se voltam a discutir:
  - **As contagens vivem em `src/data/studyData.ts`, as percentagens não.** A consulta calcula as percentagens sobre os grupos que sobrevivem ao corte, não sobre o total, o que produz afirmações falsas (o Porto saía a "100,0%" por ser a única cidade acima de 20 pedidos, quando são 65 dos 224). O módulo guarda contagens e deriva tudo o resto. **Um número novo entra como contagem.**
  - **Os valores de tapete não são publicados, e a página diz porquê.** 52 pedidos de tapete têm valor registado, todos produzidos pelo motor de preço por m² removido em 2026-09-06. Publicar a mediana deles seria dar preço de tapete por uma porta lateral. Isto é o mesmo tipo de decisão da fase 5 (citar a Cochrane): o que não se sustenta não vai, mesmo quando ajudava.
  - **O método diz que os dados dependem do consentimento de cookies.** `quizTracking.ts` não regista nada de quem recusa as cookies de análise, por isso o total real de pedidos é maior que os 224. Omitir isso seria inflacionar a cobertura da amostra.
  - Todos os `null` da consulta levam `::numeric`. Sem o cast, um NULL sem tipo é resolvido como `text` na fronteira de uma CTE e o `union all` final rebenta com o erro 42804. Aconteceu na primeira execução real do ficheiro.
- **Instrumentação do funil, por corrigir (descoberto na fase 7):** 751 aberturas do quiz para 224 conclusões, mas só 53 abandonos registados. O `start` é disparado à abertura e o `abandon` só em condições específicas, por isso cerca de 90% das desistências não são medidas. Não entra na página pública: é trabalho interno de métricas.
- **Fase 8 (consolidação das páginas-pilar e off-site), começada em 2026-09-18.** As **páginas-pilar** nunca tinham sido definidas em lado nenhum: são os seis serviços (`/limpeza-sofas`, `/limpeza-colchoes`, `/limpeza-tapetes`, `/limpeza-cadeiras`, `/limpeza-alcatifas`, `/impermeabilizacao`), porque as 16.000 páginas geradas são todas combinações de um deles com uma cidade, freguesia, material, preço, marca ou problema. O `references/pyramid-structure.md` **não** descreve este site: é o spec genérico de outro toolkit.
  - **Feito:** migalha visível nas duas renderizações do prerender e as três páginas de entidade no rodapé (estático e React). Antes, os pilares recebiam entre 28 e 785 ligações internas em 16.262 páginas, e `/sobre`, `/autor` e `/estudo` recebiam 2, 27 e 0; depois, os pilares ficaram entre 2.206 e 3.691 e as três de entidade em 16.234. A causa era a mesma da fase 2 com o glossário: a ligação existia para quem vê a página e não no HTML estático. **A migalha das famílias que não são landing é derivada do `BreadcrumbList` que o chamador já passa em `schemas`** — não a montes outra vez por família, senão o que a página mostra e o que declara podem discordar.
  - **Órfãs resolvidas (1.184 → 558):** o índice do blog não ligava a nenhum dos 26 artigos, e a página de cada problema não ligava às suas variantes de cidade. As duas eram hubs sem spokes no HTML estático, com o conteúdo a existir só no React. **A lista "Disponível em" passou a vir de `getProblemCities`**, que usa o mesmo critério de `getAllProblemCityRoutes`: uma lista que sai da mesma fonte que as rotas não pode voltar a ficar incompleta (mostrava 179 cidades quando existiam 1.354 páginas).
  - **Segunda passagem (18/09/2026): as órfãs passaram de 558 para 30, e a causa não era editorial, era um `.slice()`.** As "531 variantes de keyword" da contagem anterior eram na verdade três famílias com causas diferentes: 384 variantes, 122 páginas de tratamento × cidade e 20 páginas B2B. Resolvidas todas. Sobram 30: as 24 páginas EN (à espera da decisão sobre o `/en`), `/guia-de-packs`, e cinco que não devem ser ligadas (`/404`, `/obrigado`, `/obrigado-pelo-servico`, as duas de admin).
  - **A causa das 384 variantes: `landingPageModel.ts` cortava as listas de diretório com `.slice(0, n)`.** Como a ordem é estável, as n primeiras entradas recebiam sempre todas as ligações e as restantes nenhuma: 32 cidades inteiras (12 variantes cada) nunca recebiam uma única ligação, e o mesmo acontecia às freguesias a partir da nona de cada município. Substituído por janelas de cobertura (`coverageWindow`, `coverageCityLinks`, `zoneLinks`), que mostram o mesmo número de ligações por página mas fazem variar o ponto de partida, de modo a cobrir a lista inteira. Dois pormenores que já falharam e não se devem repetir: **a ordem sobre a qual a janela corre tem de ser independente da página** (a primeira tentativa partia da lista ordenada por área, que muda conforme a cidade desenhada, e deixou Faro e Lisboa de fora); e **a cobertura das freguesias tem de valer por par serviço × variante**, porque o bloco de `/lavagem-colchao-porto` só emite URLs `/lavagem-colchao-porto-*` e é a única página do site que pode ligar a essas freguesias. `src/data/landingDirectoryCoverage.test.ts` fixa as duas invariantes e rebenta se voltarem a partir-se.
  - **O Search Console não sustentava consolidar as variantes, e é isso que fica decidido.** Exportação de 3 meses (16/06 a 15/09/2026, `~/Downloads/cleansolutions-5`): as três famílias de variante trazem 309 dos 1.103 cliques do site, 28% do total. As 384 órfãs apareciam na exportação ao **mesmo ritmo** das 8.702 variantes já ligadas (4,4% contra 3,7%; 0,53 contra 0,47 impressões por página), ou seja ser órfã não estava a custar tráfego mensurável. E em **11 dos 320 pares**, a variante órfã era a única das duas com presença na pesquisa: a irmã `limpeza-*` não tinha nenhuma. Consolidar teria redirecionado páginas que aparecem para páginas que não aparecem. **Cuidado com a exportação do GSC: são exatamente 1.000 linhas, ou seja está truncada.** A cauda de zero cliques corta nas 9 impressões, por isso ausência significa "menos de ~9 impressões em 3 meses", nunca "zero" — a regra antiga ("zero impressões") não é verificável com este ficheiro.
  - **As 122 páginas de tratamento × cidade eram o mesmo padrão do glossário e do índice do blog:** o `<details>` "Consultar localidades" e a lista de serviços do hub existiam só no React. O `prerender.ts` passou a emitir os dois, mais migalha (Início › tratamento › cidade) nos dois lados, com `PageBreadcrumb` acrescentado ao `TreatmentPage.tsx`. A migalha não passa por `/packs`, de propósito.
  - **As 20 páginas B2B (`/limpeza-comercial-*`) nunca tiveram hub nenhum**, nem no React nem no estático. O rodapé passou a ligar as quatro cabeças de região e as próprias páginas ligam-se entre si (bloco novo no `CommercialPage.tsx` e no prerender). Os testemunhos continuam por entregar: não inventar nomes.
  - **O rodapé e o cabeçalho eram React puro, e isso era a maior fuga do site.** O HTML estático levava só as três ligações de entidade; as outras ~25 do rodapé e as do cabeçalho não existiam para um crawler. Medido: `/glossario-limpeza-estofos` está no rodapé de todas as páginas e recebia **1** ligação interna; `/antes-depois-limpeza` está no cabeçalho e recebia **0**. Agora recebem 16.233 cada. A navegação vive em `src/data/siteFooterNav.ts` e é lida pelo `Footer.tsx` e pelo `landing-page-html.ts` — **não voltar a escrever estas ligações à mão em nenhum dos dois lados**. O bloco Packs fica de fora do ficheiro partilhado de propósito, para não mexer no peso de `/packs`, que ficou exatamente igual (12.913 ligações).
  - **Bug encontrado por causa disto: o rodapé tinha duas ligações mortas.** `/limpeza-estofos-aveiro` e `/limpeza-estofos-coimbra` não existem em lado nenhum (sem rota em `App.tsx`, sem HTML, fora dos sitemaps) e estavam no rodapé de todas as páginas a servir um soft-404. Passaram a apontar para `/limpeza-sofas-aveiro` e `/limpeza-sofas-coimbra`. **Antes de propagar navegação para o HTML estático, confirmar que cada destino existe mesmo no `dist`** — foi assim que estas apareceram.
  - **Efeito medido nos pilares:** os seis serviços passaram de 2.206–3.691 ligações internas para 16.233 cada. `/packs` ficou nas mesmas 12.913 (o seu peso relativo desceu de 3,8% para 1,9% só porque o total do site subiu).
  - **Por fazer:** as 24 páginas EN continuam sem hub (não existe `/en`) e o dono ainda não confirmou se o turismo o justifica; `/guia-de-packs` continua órfã e está ligada a `/packs`, que não se toca. **Não mexer em `/packs` sem falar com o dono:** ele está a retrabalhá-la.
  - **As páginas legais estavam a devolver 404 a sério, e isso é a nona armadilha (resolvido em 2026-09-23).** A nota antiga aqui dizia só que eram client-only e que um crawler não lia uma linha delas. Era pior: sem o catch-all `/* /index.html 200` (removido em 2026-09-06), uma rota sem ficheiro estático cai no `dist/404.html` **com HTTP 404**. As três — `/politica-de-privacidade`, `/termos-e-condicoes`, `/politica-de-devolucoes` — tinham rota em `App.tsx` e estavam no rodapé de todas as páginas, mas ficaram de fora da lista `CLIENT_ONLY_ROUTES` do `prerender.ts`, cujo comentário já dizia a regra certa ("cada rota precisa do seu ficheiro estático"). **O React arranca a partir do 404.html e mostra o conteúdo certo, por isso a navegar nunca se via o problema** — o que estava errado era o estado HTTP, e com ele a indexação, ~48.000 ligações internas do rodapé e a política de privacidade que o Google Ads exige. Passaram a ser prerenderizadas a partir de `src/data/legalPages.ts`, com `legalPages.test.ts` a comparar os títulos das secções com os componentes React. **Qualquer rota nova que só exista no React precisa de entrada no `prerender.ts`, senão serve 404.**
  - **Como medir isto outra vez:** `npm run build`, copiar o `dist` para fora do projeto **antes de contar** (há sessões a construir em paralelo e o `outDir` está fixo em `dist` nos três plugins do `vite.config.ts`, por isso `--outDir` não isola nada), confirmar que o instantâneo é coerente (que `/limpeza-sofas-porto` e `/limpeza-colchoes-braga` têm mesmo o seu próprio `<h1>`) e só então contar, em Python, a ler o HTML a partir de `<div id="root">`. `grep -rl --include` no macOS dá números errados. Se o repositório estiver com trabalho de outra sessão a meio, construir a partir de `git archive HEAD` para um diretório à parte, com os ficheiros desta sessão copiados por cima: foi o que permitiu medir enquanto o `MarketingPanel.tsx` de outra sessão não compilava.
  - **Off-site, continua bloqueado e continua a ser o de maior retorno provável:** não existem perfis próprios em nenhuma plataforma, por isso o `sameAs` só tem a ficha do Google.

- **Auditoria de 2026-09-23 (corrigido e publicado).** Quatro coisas que só se viam no site construído, não no código:
  - **As três páginas legais em HTTP 404.** Ver a nona armadilha acima.
  - **1.524 ligações internas mortas nas páginas problema × cidade**, em 1.274 das 1.354. O `prerender.ts` ligava a `cities.slice(0, 6)` sem confirmar que a rota existia, e Valongo é a sexta cidade do catálogo mas só tem página nos problemas que a listam em `relatedCities`. O `ProblemCityPage.tsx` já filtrava bem, por isso **só o HTML estático as tinha** — mais uma divergência prerender/React. O mesmo `.slice()` limitava a cobertura a 7 das 26 cidades (Lisboa, Braga, Faro, Cascais e Sintra não recebiam nenhuma); passou a `coverageWindow`, como na fase 8. `problemCityCoverage.test.ts` fixa as duas invariantes. **Medido no build: as ligações mortas do site inteiro passaram de 49.983 para 0.**
  - **`${REVIEW_RATING}` a aparecer literalmente aos clientes.** Estava escrito `"${REVIEW_RATING}"` entre aspas em vez de backticks, ou seja uma string normal que nunca interpola. O TypeScript não avisa. As páginas inglesas para anfitriões Airbnb de Lisboa e Porto mostravam mesmo `${REVIEW_RATING}★ on Google` a quem as visitava. **Como os campos afetados não iam para o HTML estático, isto não aparecia em nenhuma verificação feita sobre o `dist`** — só no site a sério. `unrenderedPlaceholders.test.ts` percorre os dados exportados já resolvidos e rebenta com qualquer `${...}` que sobre.
  - **Títulos duplicados** entre `acaros-sofa`/`alergias-sofa` (iguais byte a byte) e `acaros-colchao`/`alergias-colchao` (só diferiam numa maiúscula): 52 páginas a disputar a mesma consulta. Os corpos já tinham ângulos próprios desde 2026-09-17, só os títulos é que não acompanharam.
  - **`lastmod` em falta em produção, por confirmar do lado do Cloudflare.** O build local gera `lastmod` nos 16.257 URLs; **produção só tem 26** (os do blog, que vêm de data editorial e não do git). É o clone shallow que a nota do GEO previu. Degrada sem mentir, como desenhado, mas o benefício não está a chegar: **a correção é o clone completo no Cloudflare, nunca hardcodar datas.**
  - **`CLIENTS_SERVED_LABEL` existia e `+1100` continuava escrito à mão 11 vezes** em 4 ficheiros, incluindo o `TrustRatingBadge.tsx`, que já importava o rating e o número de avaliações do mesmo módulo. Centralizado.

**Numeração das fases:** há uma só, a que está nesta lista, e os commits seguem-na. Houve um momento em 2026-09-17 em que começou a correr uma segunda contagem em paralelo (uma numeração nova criada a partir de uma auditoria, a chamar "fase 1" ao que aqui é a fase 4); as mensagens de commit foram reescritas antes do push para ficar tudo na contagem desta lista. **Não abrir uma segunda numeração:** se for preciso planear por fases, mapeia-se para os números daqui.

## Glossário e longtail (2026-09-17)

- **O glossário tem 100 termos** em `src/data/glossaryTerms.ts`, todos no HTML estático e todos emitidos como `DefinedTerm`. O `<main>` da página passou de 11.398 para 62.316 caracteres. Um termo novo acrescenta-se só a esse ficheiro, mais nada.
- **Oito problemas novos** em `problemSeoData.ts`, escritos a partir de `docs/pesquisa-conteudo.md`, sobre temas com procura real e quase nenhuma cobertura em português: códigos de etiqueta W/S/WS/X, manchas castanhas depois de limpar (browning), mancha que volta ao secar (wicking), tempo de secagem em função da humidade, cheiro a mofo, encolhimento de lã, duração da impermeabilização e couro ressecado. Cada problema novo exige **três** coisas: entrada em `problemSeoData.ts` com exatamente 4 FAQs, perfil único em `PROBLEM_TREATMENTS` e entrada em `problemRouteData.ts` (ver armadilha acima).
- **Conteúdo duplicado corrigido (2026-09-17).** Medição de sobreposição de vocabulário entre as 54 páginas de problema encontrou 8 pares acima de 30%, incluindo `acaros-sofa` e `alergias-sofa` **byte a byte idênticos**, e `alergias-colchao` e `acaros-tapete` a 96% (o mesmo texto com o substantivo trocado). Com as variantes por cidade eram cerca de 100 páginas de conteúdo repetido. As quatro foram reescritas com ângulos próprios (onde os ácaros se alojam num sofá; o lado dos sintomas e o que a evidência diz; as horas de contacto direto no colchão; o pelo e a fibra nos tapetes), mais `limpeza-profunda-sofa` e `limpeza-sofa-profissional`. Restou 1 par acima de 30%, entre manchas de vinho e de café, que é vocabulário partilhado e não texto repetido. **Ao acrescentar uma página de problema nova, correr a mesma medição antes de dar por concluído.**
- **Duplicação no glossário:** a mesma medição sobre os 100 termos apanhou `extracao-agua-quente` a duplicar `extracao-vapor-estofos` e `peroxido-hidrogenio` a duplicar `agente-oxidante`. Substituídos por "Capa Removível: Lavar na Máquina?" e "Nódoa de Corante vs Nódoa de Pigmento", que eram lacunas reais.
- **O ângulo editorial é deliberado:** o que existe escrito em português sobre estes temas são blogues a repetir conselhos caseiros que contradizem as normas do setor. As páginas novas dizem o que não se deve fazer e porquê, e assumem limites ("isto não sai"), que é o que um motor generativo cita como fiável. Não trocar isto por linguagem publicitária.

## Medição, Google Ads e atribuição (2026-09-18)

Referência completa em `docs/tracking-google-ads.md`, que separa o que está
implementado, o que está testado localmente, o que depende de configuração
externa e o que está validado em produção (nada, ainda). Aqui só as regras.

**Identificadores.** GA4 `G-T45T5FBNC3`, conversões `AW-18457115875`, **número de
cliente `920-786-3494`** (não é o mesmo que o `AW-` e nunca vai num `send_to`;
serve para integrações). Todos em `src/constants/tracking.ts`. O
`AW-17779872363` era da conta anterior e estava escrito à mão em `consent.ts`.

**Uma só `gtag.js`, carregada pelo `G-`.** O Ads entra por `config`. O
`GT-M6XTKMC7` **não** é carregado: é o mesmo contentor que o `G-` com outro
nome, e carregar os dois duplicava cada `page_view`. **A ausência do literal
`GT-` no código não prova que a Google tag estava em falta** — prova só que não
foi carregada por esse nome. Destinos ligam-se na interface da Google, não aqui.

**`send_page_view: false` não chega.** A opção "alterações de página baseadas no
histórico do navegador" da Medição otimizada do GA4 é configurada na interface,
não no código, e duplica o `page_view` em cada navegação da SPA. **Tem de ser
desligada no GA4** e não é verificável a partir do código nem numa propriedade
de teste. Até lá, assumir `page_view` duplicado.

**Consentimento não pode travar um pedido.** Registo operacional e medição são
duas coisas: quem recusa cookies submete o orçamento na mesma, é gravado e
notificado, e o painel conta-o. O que não existe para essa pessoa é sessão
observada e atribuição. **Nunca escrever que "quem recusa não existe nos
relatórios"** — existe como lead operacional, e o painel separa as duas coisas
em todos os cartões.

**A decisão é um par `{analytics, ads}`**, e os quatro sinais do Consent Mode v2
derivam dele. Aceitar análise **não** autoriza publicidade. O banner de hoje faz
uma pergunta só que cobre as duas, por isso coincidem sempre — a separação
existe para que uma divisão futura do banner seja só uma alteração ao banner.

**Nenhum componente chama `window.gtag`.** Tudo por `src/lib/analytics.ts` →
`src/lib/gtag.ts`, que verifica consentimento **para aquela finalidade**,
ambiente, e tag carregada. A tag não se desinstala: o consentimento é lido a
cada envio, não só no arranque.

**Nenhum componente mede um clique de contacto (2026-09-18).** O delegado
global em `initContactTracking` (`src/lib/quizTracking.ts`) é o **único**
responsável: todos os CTA de WhatsApp e telefone do site são `<a href>` e os
componentes declaram só a origem em `data-tracking-source`. **Não voltar a pôr
um `onClick={() => trackWhatsAppClick(...)}` numa âncora** — foi isso que fez
cada clique contar duas vezes. A guarda que existia (`delegatedClick` reposta
por `queueMicrotask`) parecia funcionar nos testes e falhava no browser: num
clique a sério a pilha esvazia-se entre listeners, as microtarefas correm, e a
guarda já estava desligada quando o `onClick` do React corria — por isso um
`dispatchEvent` chamado a partir de código nunca reproduzia o defeito. A
deduplicação passou a ser um `WeakSet` sobre o **próprio objeto do evento**, que
não tem janela temporal e não junta dois cliques reais seguidos. Regra de
`cta_location`, por esta ordem: `data-tracking-source`, depois `header`/`footer`
pelo elemento que a contém, depois `page:<caminho>`. O vocabulário de origens
(`header_desktop`, `sticky_bar`, …) fica como está: é o que o histórico de
`quiz_events` tem escrito e o que o `QuizMetricsPanel.tsx` sabe rotular — e é
por isso que a coluna `service` de um clique guarda a **origem**, não o serviço
(convenção de 2026-08, o serviço real vai em `service_type`).

**`?kyro_debug=1` é diagnóstico, não autorização.** Enviar fora de produção
exige `VITE_TRACKING_ALLOW_NON_PRODUCTION=true` **e** identificadores que não
sejam os reais. A segunda condição é a que impede o localhost de escrever na
propriedade a sério.

**O `lead_id` é gerado uma vez por submissão** (`src/lib/submissionId.ts`) e
sobrevive a duplo clique, retry e refresh; é limpo só depois da entrega, para
quem volta na semana seguinte não ficar bloqueado. A autoridade final é o
**índice único em `leads.lead_id`**, não o browser. O canal de email tem o seu
trinco (`lead_notifications`) e **larga-o se o envio falhar** — sem isso, a
proteção contra duplicados perdia o pedido.

**Sucesso resolve com um canal.** Mas se o CRM falhar o pedido só existe no
email e não está em `leads`: o painel mostra o número de falhas das últimas 24h
e avisa que os números estão incompletos. Uma falha de medição nunca trava o
pedido.

**Website e offline são caminhos diferentes.** O lead confirmado usa uma
**etiqueta** de gtag; qualificado e cliente usam o **nome da ação** de conversão
e um identificador de clique. Tratar as três como etiquetas produzia ficheiros
que o Google Ads rejeita. Uma só conversão principal (o lead); qualificado e
cliente ficam secundárias. Cliques em WhatsApp/telefone são microações e nunca
entram num objetivo que os torne relevantes para os lances. **Nunca importar o
mesmo lead do GA4 e da tag nativa como duas conversões principais.**

**Exportar não é importar.** `conversion_exports` guarda `queued`, `exported`,
`submitted`, `accepted`, `rejected` em separado, e o CSV só é gerado depois de o
registo ser escrito. As mudanças no painel **não** enviam conversões pela sessão
do administrador.

**WhatsApp e chamadas: só medimos cliques.** Conversas e chamadas atendidas
acontecem fora do site. Há registo manual em `contact_log`; cliques, contactos
confirmados e leads são três colunas que nunca se somam. **Nunca transformar
`whatsapp_click` em `generate_lead`** nem atribuir uma conversa a uma campanha
por suposição.

**Métricas.** Operacional (tabela `leads`, sem cookies) e observado
(`quiz_events`/`lead_attribution`, com consentimento) nunca partilham um
denominador. `quoted_value`/`booked_value`/`final_revenue`/`amount_received` são
quatro momentos do mesmo dinheiro e **nunca se somam**. Faturado ≠ recebido. O
funil conta o ponto mais alto atingido **por lead** — nove mudanças de estado
continuam a ser um lead. Fórmulas e origem em `METRIC_DEFINITIONS`, publicadas
no próprio painel.

**Atribuição:** first touch 90 dias em `localStorage`, nunca reescrito; last
touch 30 minutos em `sessionStorage`, substituído por campanha nova. Um regresso
direto depois dos 30 minutos **perde** o last touch e mantém o first. Os dois
nunca se somam; o agrupamento por campanha usa last touch.

**Sem gasto importado, CPL/CPA/CAC/ROAS são `null` com o motivo escrito.**
`costMetrics` recusa somar moedas diferentes, avisa quando o período do gasto
não cobre o dos leads, e diz sempre que custo é por data do clique, leads por
data do pedido e receita por data do serviço.

**Segurança.** `revoke all … from anon` explícito nas tabelas novas (o Supabase
concede por omissão). A atribuição e o histórico são **só de leitura** para o
painel — reescrevê-los permitia fabricar um bom resultado. `changed_by`,
`logged_by` e `created_by` vêm de um trigger que lê o JWT; o que o browser
mandar é ignorado.

**`list-resend-leads`: a autorização não é o mesmo que a autenticação (corrigido no código em 2026-09-23, POR PUBLICAR).** A versão publicada de `isAuthenticatedAdmin` fazia só `return !error && !!data.user`: **qualquer conta autenticada passava**, e a função usa depois a `SUPABASE_SERVICE_ROLE_KEY` para ler os emails de pedidos no Resend (nome, telefone, morada). **O RLS não protege este caminho**, porque a service-role key o ignora — é exatamente por isso que uma tabela protegida não chega. E o registo público está aberto no projeto (`disable_signup: false`, email ativo, confirmado por `GET /auth/v1/settings`), por isso bastava criar conta. Passou a usar `hasAdminAccess` (`supabase/functions/_shared/admin-authorization.ts`), que consulta `admin_users` só pelo id autenticado e falha fechada. **A Edge Function publica-se à parte do frontend: enquanto não for publicada, a versão vulnerável continua a correr em produção.** E como falha fechada, o administrador real tem de existir em `admin_users` antes, senão o separador Quiz Leads recusa-lhe o acesso (é o comportamento correto, ver passo B1c em `docs/tracking-plano-de-publicacao.md`).

**Autorização administrativa (resolvida em 2026-09-18).** Já não é verdade que
qualquer conta autenticada seja administradora. Tabela `admin_users (user_id,
email, role, created_at)` (migração `20260918010000_admin_authorization.sql`,
depois da `20260918000000`) e função `is_admin()` (lê `request.jwt.claims`
diretamente, mesmo padrão do trigger de autoria) usada em todas as políticas
do painel no lugar de `using (true)`. Sem política nenhuma para `anon` nem
`authenticated` na própria `admin_users` — só a chave de serviço, no SQL
Editor, insere um administrador; não há promoção automática da primeira conta
nem de todas as existentes. **Depois de aplicar a migração, o próprio dono
fica sem acesso ao painel até correr o insert manual** — ver
`docs/tracking-plano-de-publicacao.md`, passo B1c. `use-admin-session.ts`
passou a expor `isAdmin` além de `isAuthed`; `AdminPanel.tsx` mostra um ecrã
"Sem autorização" (não o painel, não um ecrã em branco) para uma sessão
autenticada sem `admin_users`.

**A migração `20260918000000_marketing_attribution.sql` aplica-se colando no SQL
Editor** (sétima armadilha). Foi validada contra um Postgres em Docker:
`supabase/tests/` corre a migração duas vezes (idempotência) e prova as
permissões papel a papel. **O RLS não gera erro num `SELECT`** — filtra em
silêncio e devolve zero; só a falta de `GRANT` gera erro. Um teste que espere
exceção num `SELECT` dá falsos positivos. Mesma validação feita para
`20260918010000_admin_authorization.sql`.

**Idempotência do `submit-lead` reforçada (2026-09-18).** No conflito `23505`
do insert em `leads`, a função já não confia no `booking_id` do corpo do
pedido perdedor — volta a consultar por `lead_id`
(`resolveDuplicateLeadConflict`, testada em
`supabase/functions/submit-lead/index.test.ts` com Deno) e só devolve sucesso
se encontrar mesmo a linha persistida. Um conflito de unicidade sem linha
correspondente por `lead_id` passa a erro 500, nunca "pedido recebido". Do
lado do cliente, `generate_lead` (`submissionService.ts`) só dispara quando o
CRM confirmou (`crmOk`) — um pedido que só chegou por email não tem registo
em `leads` para a conversão apontar. Limite que fica, documentado: se a
resposta do CRM se perder na rede mas o servidor tiver gravado a linha, essa
tentativa não mede o lead — só a próxima, se a pessoa tentar de novo.

**Falhas não ficam escondidas.** O fallback do `PGRST204` mantém a entrega mas
**não** significa atribuição saudável: o cartão de Cobertura e os avisos do
painel existem para isso. Cada leitura do painel falha por si, para uma tabela
em falta não esvaziar tudo.

## Regras de conteúdo e estilo (fixas, já corrigidas várias vezes)

- **Varredura de afirmações absolutas (2026-09-17, segunda passagem).** A revisão do glossário encontrou as mesmas afirmações noutros sítios do site, algumas a contradizer o que a página ao lado dizia. Removidas: "redução de 70% dos episódios de crise" atribuída ao tratamento anti-ácaros (um resultado clínico atribuído ao serviço), "eficaz em mais de 90% dos casos" na desodorização e nas páginas de marca, "mais de 85% dos casos" no couro Natuzzi, "mata microrganismos acima de 60ºC, letal para ácaros, bactérias e fungos" na extração, "eliminação total de odores" em tapetes (no mesmo ficheiro que já dizia "não prometemos eliminação total") e três passagens no blog sobre calor que mata ácaros. **O princípio que ficou: o que provoca a reação alérgica são os excrementos e os restos de exoesqueleto já depositados na fibra, e esses removem-se fisicamente, não por calor.** Antes de escrever uma percentagem de eficácia ou um verbo como eliminar, matar ou garantir, verificar se a mesma página noutro sítio já promete o contrário.
- **Nenhuma afirmação de saúde sem fonte verificada (2026-09-17).** Auditoria ao blog encontrou afirmações atribuídas a autoridades que não as fizeram: a pior era "a Organização Mundial de Saúde estima que a redução da exposição a ácaros em casa pode prevenir 30% dos novos casos de asma pediátrica", que a OMS nunca publicou. Foram também retirados números sem fonte viva (ácaros por m², "100% dos colchões", "mata 100% dos ácaros") e corrigida uma FAQ que respondia "Sim" a "há estudos que provem que a limpeza profissional reduz os sintomas de alergia?" quando a revisão Cochrane de 54 ensaios concluiu o contrário. **O artigo passou a citar a Cochrane, de propósito:** dizer o que a evidência diz, mesmo quando não ajuda a vender, é o sinal de confiança que nenhum concorrente do setor dá. As fontes vivem em `src/data/blogSources.ts`, uma entrada por fonte com editor, URL e data de verificação, e `blogSources.test.ts` rebenta se um artigo mencionar OMS/DGS/SPAIC/Cochrane sem ter `sources`. **Regra: abre-se a página, lê-se, e só então se cita. Se a afirmação não tiver fonte, muda-se a afirmação, não se procura uma fonte parecida.**
- **Nunca usar em dash (—)** em conteúdo visível do site (títulos, descrições, FAQs, blog). Não confundir com `---` usado como divisor Markdown nas minhas próprias respostas de chat.
- **Nunca usar o ícone Sparkles** (lucide-react) como decoração. `Star` continua permitido em contexto de rating/avaliação.
- **Mobile-first sempre** — qualquer alteração de UI/layout, mobile é prioridade absoluta, não um afterthought.
- **Regra sobre Step 3 das cadeiras invertida outra vez em 2026-09-10:** a separação decidida em 2026-09-06 (não replicar o ecrã de upsell pixel a pixel) deixou de valer — pedido explícito do dono para uniformizar `QuizStepConfigChairs.tsx` (impermeabilização como serviço primário) com o estilo do `QuizChairsAddonUpsell.tsx`: `WaterproofingTierPicker` com `compact centered` e preços visíveis em cada cartão, igual nos dois ecrãs. Se voltar a aparecer pedido para os separar, confirmar a data antes de assumir qual das duas versões está em vigor — já inverteu duas vezes.
- **Hero de todas as páginas de SEO = só botão de WhatsApp (2026-09-10, decisão explícita e enfática do dono).** Localidade×Serviço, Freguesia×Serviço, Preço, Material, as 3 páginas de Marca, Problema, Problema×Cidade e Variantes Keyword usam todas `SofaLeadActions.tsx` (nome antigo, já genérico — `{city, price, href, source}`) como CTA principal do hero, para todos os serviços, nunca um segundo botão "Calcular o meu preço" ao lado. Motivo dado: ~85-90% dos leads vêm por WhatsApp, um segundo CTA é distração visual. Já foi corrigido uma vez por estar só a aplicar-se a sofás — qualquer página nova de SEO tem de nascer já assim, não é opcional por serviço.
- **Antes/depois dos heroes anda sozinho (2026-09-15, pedido explícito).** Em todos os heroes de SEO com comparação (os 6 serviços, via `CommercialHero` → `HeroBeforeAfterPool`), a galeria roda a cada **4 segundos** e cada par começa inteiro em "Antes" e desliza até "Depois" ao longo dos 4 segundos inteiros, sem pausa nas pontas e com easing suave mas quase constante (`sweepMs` no `BeforeAfterSlider`). O movimento tem de ocupar o intervalo todo: uma primeira versão parava meio segundo em cada ponta e foi rejeitada por ser rápida demais no meio. Continua a parar enquanto alguém tem o rato em cima, está a arrastar ou usa os controlos. Fora dos heroes (`/antes-depois-limpeza`, `ServiceAutoCarousel`) a galeria mantém-se parada por defeito — não ligar `autoplay` aí sem pedido.
- Ao corrigir uma regra de preço (ex. um mínimo errado), mudar só o valor que viola a regra. Não extrapolar a outros valores sem perguntar primeiro.
- Não adicionar mecânicas de urgência (timers, badges) que não foram pedidas explicitamente.

## Antes de terminar qualquer sessão neste projeto

Atualiza este ficheiro se alguma regra ou facto de negócio mudou; atualiza `CONTEXT.md` se a arquitetura mudou. Commit + push antes de trocar de máquina.
