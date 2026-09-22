## Página de obrigado no PC (23/09/2026)

Pedido explícito do responsável: adaptar também a PC. A partir de 1024px, composição em duas colunas centrada na altura disponível, título/WhatsApp/avaliações à esquerda e resumo à direita, com tipografia e espaçamento próprios. Preservar o mobile compacto. A revisão de PC autoriza pré-visualização desktop desta página, substituindo aqui a restrição histórica de previews apenas mobile.

## Página de obrigado compacta (23/09/2026)

Pedido do responsável: apenas resumo premium do pedido, um CTA WhatsApp e avaliações Google. Pedidos curtos devem mostrar estes três elementos num único ecrã mobile. Não repor introduções longas, secção de próximos passos, CTAs duplicados ou barra flutuante nesta página. Preservar todos os artigos, quantidades e valores; pedidos extensos podem exigir scroll em vez de esconder detalhes.

## Mesmo pack nos dois percursos de sofá (23/09/2026)

A redução de 10€ por sofá no pack aplica-se também quando a impermeabilização é o serviço principal e a limpeza é adicionada. O total limpeza + proteção deve ser idêntico nos dois percursos, para o mesmo tamanho, tier e quantidade tratada. Preços autónomos mantêm-se. O extra de limpeza mostra o preço autónomo da limpeza riscado (sem +) e compara os dois totais. Esta regra substitui a preservação anterior do preço do upsell inverso.

## Comparação do pack de sofá (23/09/2026)

O upsell de proteção mostra o preço autónomo da mesma proteção riscado, sem sinal +, à direita do acréscimo em pack; texto de 16px e contraste branco a 80% para legibilidade. Abaixo compara o total limpeza + proteção em pack com a soma dos dois serviços autónomos. Usa as tabelas reais e apenas os sofás selecionados para proteção; sem preço fixo não inventa comparação. Não comparar um acréscimo com o preço total dos dois serviços. `WaterproofingTierPicker` recebe os valores opcionais de `QuizSofaAddonUpsell`.

## Impermeabilização de cadeiras por unidade (23/09/2026)

Preço fixo em todas as quantidades: Essencial 18€/cadeira; Premium 25€/cadeira, tanto serviço principal como extra. Substitui escalões, exceção de quatro cadeiras e limite de dez para proteção. Limpeza conserva os escalões e orçamento a partir de dez. Fonte partilhada `src/constants/chairPricing.ts`, usada pelo motor e tabelas/conteúdo inicial.

## Redução do upsell de proteção de sofás (23/09/2026)

Quando a base é limpeza de sofá, o extra de impermeabilização Essencial ou Premium custa menos 10€ por sofá protegido. Preços autónomos de impermeabilização e limpeza adicionada a uma impermeabilização mantêm-se. `waterproofingUpsellDiscount` nas opções de sofá é aplicado por `calcPackPricing`, partilhado com os totais e recibos; colchões e cadeiras não mudam. Sofás de 4+ lugares permanecem sob orçamento, sem inventar preço fixo. A deslocação gratuita usa o valor efetivo já com esta redução.

## Deslocação gratuita por valor do orçamento (23/09/2026)

Pedido do responsável: taxa base de 10€ fica gratuita acima de 120€ de serviços; taxa de 15€ acima de 135€; taxa de 20€ a partir de 150€ (inclusive). Taxas de 25€ mantêm-se. O limiar usa a soma dos serviços e extras aos preços efetivos, excluindo a própria deslocação. Artigos sob orçamento não recebem um valor fictício; só os montantes conhecidos contam. Sem atingir o limiar mantém-se a taxa da localidade. Esta regra substitui notas antigas de deslocação nunca gratuita/mínimo sempre cobrado, sem alterar as tabelas base.

`calculateTravelFee` em `src/constants/travel.ts` centraliza a regra no quiz, widget e configurador de packs. Alterar quantidades, extras ou localidade recalcula a oferta; totais e payload do quiz usam `finalTravelCost`.

## Escovagem depois do tratamento (13/09/2026)

Na limpeza, a sequência é tratar, escovar, extrair e conferir/secagem, após avaliação. A escova e a pressão respeitam o revestimento. Juta, sisal, seda e materiais incompatíveis não seguem automaticamente limpeza com água nem escovagem forte; avaliar composição e método. Não confundir aplicação de impermeabilizante ou avaliação de bolor com esta sequência de limpeza. Preservar a etapa explícita nos guias dos problemas.

## Imagens das promessas dos seis serviços (13/09/2026)

Nas secções «A nossa promessa» dos seis serviços, preservar pelo menos uma fotografia antiga adequada por serviço; as fotografias existentes de técnicos Kyro com a identidade real não devem ser descartadas sem motivo. Uma imagem nova só pode mostrar um trabalhador quando reproduzir fielmente um técnico Kyro e a identidade visual verdadeira. Se isso não puder ser garantido, criar a cena sem pessoas e sem logótipos, uniformes ou equipamentos inventados. Cada imagem tem de representar diretamente o título e a informação do respetivo cartão.

## Exemplos e tratamentos dos problemas (13/09/2026)

Usar a grelha de quatro exemplos com ampliação também em localidades, freguesias, preços e variantes, partilhando `VisualExamplesGallery`. Tratamentos das páginas de problemas têm avaliação, ação e limites próprios por problema em `problemTreatmentGuides.ts`, partilhados com o HTML inicial. Não inventar métodos diferentes por cidade ou por sinónimo. A secção «Como tratamos este problema» usa o fundo verde canónico e a mesma navegação por separadores dos materiais, com imagem, explicação e botões anterior/próxima dentro do painel claro de `IllustratedProcessGuide`. Não voltar ao acordeão. Etapas com imagens guardadas uma vez no site, ficheiros antigos preservados e opção discreta de guardar. Materiais conservam exemplos específicos do revestimento.

## Estrutura obrigatória dos heroes (13/09/2026, revisão mais recente)

Pedido do responsável: breadcrumb na fonte Avenir Next, título, subtítulo curto de apoio, WhatsApp principal, «Ver preços» por baixo, antes/depois imediatamente a seguir e faixa com avaliações, resposta e secagem (ou informação adequada à proteção). Usar `CommercialHero` nas famílias comerciais, incluindo materiais e problemas, sem duplicar a estrutura. A revisão da imagem de fundo foi adiada explicitamente; reutilizar os fundos existentes por agora. Esta decisão substitui as composições anteriores dos problemas. A homepage está excluída: mantém HeroV1 e a composição própria aprovada. Manter previews exclusivamente mobile.

## Uniformização e diversidade SEO (13/09/2026)

Pedido aprovado: localidade × serviço, freguesia × serviço, preços e variantes keyword seguem, depois do hero/indicadores, a ordem orçamento/widget, avaliações, quatro problemas, FAQ, processo específico, mesma visita, serviços/zonas. Problemas e materiais como famílias de páginas ficam para trabalho separado.

Exatamente **quatro perguntas por página**, nunca seis ou oito. A biblioteca pode crescer, mas a página mostra quatro respostas relevantes e estáveis por endereço, iguais no React, HTML inicial e FAQPage. Não inventar diferenças técnicas entre limpeza, lavagem e higienização, nem dados locais, testemunhos ou resultados. Diversidade de combinação não prova qualidade ou unicidade SEO.

Plano de imagens aprovado: quatro problemas por serviço, dez imagens alternativas por problema, 40 por serviço e 240 no conjunto. Seleção estável, coerente com o problema, sem apresentar ilustrações geradas como trabalhos reais numa localidade. Produção da biblioteca visual ainda pendente. Estado da execução e validações: `docs/seo-landing-diversity.md`.

Etapa 2 implementada: `LandingServiceSections` compõe as sete secções nas quatro famílias, com dados de `landingPageModel.ts` também usados pelo prerender. Não voltar a duplicar a composição nas páginas. Os quatro problemas por serviço estão em `landingServiceCopy.ts`, associados aos quatro slots de imagem existentes; as dez alternativas por problema ainda não foram produzidas. Preços mantém os fatores dentro da secção de orçamento. Preservar a navegação reduzida Ads de sofás (diretório omitido), as quatro FAQ e o município real no widget/quiz das freguesias. `audit-landing-layout.mjs` valida estrutura, conteúdo e destinos nas 12.912 rotas após o build.

Etapa 3: biblioteca com 180 perguntas distintas, 40 candidatas por serviço (12 comuns + 28 específicas), mantendo quatro por página. `landingFaqExpansion.ts` contém a expansão; perguntas exclusivas de sofá/cadeiras são filtradas nas respetivas variantes de impermeabilização. `landingEditorial.ts` fornece introdução e descrição SEO às quatro famílias, também no HTML inicial. Não repor as antigas promessas sanitárias dos geradores nem inventar características locais. Regras, fontes e limites em `docs/landing-editorial-review.md`. A biblioteca visual permanece pendente.

Biblioteca visual de sofás integrada: 40 WebP em `public/images/landing-problems/sofas/`, dez por problema. `landingProblemImages.ts` seleciona por identidade estável da rota e ID do problema; `landingPageModel.ts` partilha a escolha entre React e HTML inicial nas 2.152 páginas de sofás das quatro famílias. O painel e os prompts permanecem em `docs/sofa-image-pilot/`. Não inserir nos comparadores antes/depois. Faltam as 200 imagens dos outros serviços. Esta atualização substitui as notas de imagens pendentes para sofás acima.

Legenda das imagens ilustrativas (13/09/2026): por pedido do responsável, apresentar apenas «Imagem ilustrativa» nos cartões e «Imagens ilustrativas» no aviso geral, sem disclaimer de IA ou texto adicional sobre clientes/resultados. Preservar a proveniência nos registos internos e não atribuir estas imagens a trabalhos reais.

## Fecho dos oito alertas comerciais (10/09/2026)

Contenção das imagens dos guias (13/09/2026): em `SofaProcessGuide` e `ServiceProcessGuide`, o contentor da imagem usa `min-w-0 w-full self-start overflow-hidden` e a coluna de texto `min-w-0`. A largura definida e o alinhamento independente impedem que a proporção da imagem/altura mínima a façam invadir o texto em desktop. Preservar esta contenção em todas as etapas e serviços.

O exemplo fixo `teste=imagens-sofas` foi removido na integração: esse parâmetro já não muda a seleção. Nunca usar aleatoriedade por visita, parâmetros Ads ou localidade sem município para selecionar as imagens.

A regra dos 10 minutos aplica-se também ao inglês e aos testes locais. Em inglês, usar EN_RESPONSE_PROMISE, EN_AVAILABILITY_PROMISE e EN_COVERAGE_PROMISE; não voltar a apresentar “Same-day” como prazo de resposta. A disponibilidade é próprio dia ou seguinte sob confirmação, nunca uma regra geral de 48h para Lisboa. Secagem média 3–6h também em marcas (IKEA/Pikolin), variantes e glossário. A existência de manchas preexistentes não exclui a repetição gratuita comunicada até48h; explicar limitações antes de executar. Limpeza/higienização não inclui automaticamente anti-ácaros ou desbacterização. Não reintroduzir promessas de eliminação de germes, benefícios clínicos ou bactericida incluído. Homepage usa PUBLISHED_REVIEWS, só transcrições; localidades apenas quando confirmadas. Retirados os blocos independentes de reviews sem origem dos schemas. Preservar estas regras em merges de ramos de teste.


# Kyro Clean Solutions — Instruções para Codex

## Atualização comercial prioritária: 10/09/2026

As instruções comerciais atuais estão em `CORRECOES-COMERCIAIS-2026-09-10.md` e prevalecem sobre notas históricas abaixo: avaliação 4.9, resposta <10 minutos, secagem média 3–6 horas com ventilação, garantia de repetição gratuita acionada até 48 horas. Deslocações têm fonte única em `src/constants/travel.ts`: Braga 10€, Barcelos 20€, Minho por escalões 10/15/20. Tapetes E alcatifas sempre sob orçamento. Não reintroduzir reservas fictícias, contadores de atividade simulada nem ameaças de perda de vaga/desconto ao sair. O volume habitual informado é 50–60 pedidos/semana. Packs agora configuráveis pelo cliente, com cálculo em `src/lib/customPack.ts` e tabelas do quiz. Anti-ácaros e desbacterização são extras opcionais; limpeza normal não promete eliminação de 99%. Equipas independentes em Braga, Porto, Lisboa e Algarve; Aveiro/Coimbra sob consulta. Sitemaps do admin agora estão em `src/pages/admin/SitemapMonitor.tsx`.


Este ficheiro carrega automaticamente no início de qualquer sessão do Codex aberta nesta pasta, em qualquer máquina. É a única forma real de manter as duas instâncias (PC Windows + MacBook do dono) alinhadas — não têm memória partilhada, só isto (e o `CONTEXT.md`) viaja entre elas via Git.

**Antes de mexer em código:** lê `CONTEXT.md` (arquitetura completa: rotas, fluxo do quiz, design tokens, tabelas de preços) e `AUDIT.md` (problemas de qualidade de código já conhecidos). Este ficheiro é só as regras e factos que não podes adivinhar a partir do código.

---

## Duas máquinas, um repositório

O dono trabalha a partir de um PC Windows e de um MacBook, cada um com a sua instância própria do Codex. Sem sincronização automática de memória.

1. No início de qualquer trabalho: `git status` + `git log -5 --oneline`; se não estiveres alinhado com `origin/master`, faz `git pull`.
2. Sempre que concluíres uma alteração neste projeto (código, conteúdo, configuração ou documentação), faz commit no Git e push para o remoto, sem esperar pelo fim da sessão nem pedir nova confirmação. Inclui apenas as alterações da tarefa atual, preservando trabalho alheio ou pré-existente. Se o commit ou push falhar, comunica o impedimento e não declares a sincronização concluída.
3. `.env` é local por máquina (chaves Supabase), nunca vai para o Git — normal aparecer como modificado, ignora.
4. Produção (cleansolutions.com.pt) só atualiza com push para o GitHub.
5. O repositório é **público** (`tarzan49/sitekyroclean`) — o autor de cada commit fica visível publicamente. Cuidado com nomes/dados pessoais em mensagens de commit.

---

## Factos de negócio atuais (não hardcodar — importar sempre)

- **Avaliações:** 5.0★, **+100** avaliações (subiu de +90 em 2026-09-06), **+1100** clientes servidos. Fonte única: `src/constants/business.ts` (`REVIEW_RATING`, `REVIEW_COUNT`, `CLIENTS_SERVED_LABEL`) — `src/lib/seoSchema.ts` importa isto diretamente e é usado tanto client-side como pelo `scripts/prerender.ts` (já não há cópia `BIZ_RATING`/`BIZ_REVIEWS` separada). **Continuam a existir cópias de texto solto fora do JSON-LD que têm de ser atualizadas à mão** sempre que este número mudar: `index.html` (schema estático da homepage), `TestimonialsV1.tsx`, `problemSeoData.ts`, `problemTipsData.ts`, `enTouristSeoData.ts` (várias dezenas de ocorrências de "N+ verified reviews"), e `src/hooks/use-quiz-ui-effects.ts` (toast de social proof, corrigido em 2026-09-06 para importar `REVIEW_COUNT` em vez de valor solto). **Não voltar a acrescentar uma frase separada tipo "Já somos N a recomendar" nas heroes** — foi tentado em 2026-09-06 e removido no mesmo dia por ser redundante com o badge `TrustRatingBadge` (que já mostra "5.0 · N+ avaliações Google" duas linhas acima) e ficar com aspeto forçado/colado.
- **Taxa de deslocação:** mínimo **10€ em todo o site**, sem exceções (nenhuma cidade a 5€). Tabelas em `src/components/quiz/QuizTypes.ts` e na cópia paralela `src/data/locationSeoData.ts` (`locationPrices`).
- **Impermeabilização de tapetes: descontinuada (removida em 2026-08-20).** Só sofás e cadeiras têm impermeabilização. Tapetes continuam a ter higienização (limpeza normal) — não é o mesmo serviço, não reintroduzir sem pedido explícito.
- **Tapetes nunca mostram preço, em lado nenhum (desde 2026-09-06).** O quiz interativo deixou de estimar preço por m² — é sempre "Sob Orçamento". O passo "Detalhes do(s) Tapete(s)" (`QuizStepConfigCarpet.tsx`) virou um simulador: a pessoa mede cada tapete (largura × comprimento, `CarpetItem[]` em `QuizTypes.ts`) e pode adicionar quantos quiser via "+ Adicionar outro tapete", sem limite. O antigo motor de preço por escalão (`calcCarpetPrice`/`CARPET_TIERS`/`carpetActiveTier`) foi removido de `quizHelpers.ts` — já não existe em lado nenhum do quiz. O widget de preços de marketing (`PriceWidget.tsx`, ver nota abaixo) usa um motor **separado** (`calcCarpetWidget` em `src/lib/priceWidgetCalc.ts`), também já ajustado para nunca mostrar preço de tapete (exceto alcatifa, que continua a 3€/m² e é um serviço diferente).
- **Cadeiras: decisão de addon movida para depois do "Continuar" (desde 2026-09-06).** Quando a limpeza é o serviço principal, o passo "Detalhes das Cadeiras" só pergunta quantidade — a decisão de impermeabilização/anti-ácaros passou para um ecrã novo, estilo "upsell de companhia aérea" (`QuizChairsAddonUpsell.tsx`), que aparece uma única vez logo a seguir ao "Continuar" dessa etapa, antes do gate do mínimo de pedido. Nesse ecrã: Impermeabilização continua Premium/Essencial (Premium com selo "TOP", Essencial sempre disponível, nunca remover uma das duas sem pedido explícito — já aconteceu por engano); Anti Ácaros para cadeiras é uma opção nova, mutuamente exclusiva com a impermeabilização, preço sempre **5€ por cadeira, fixo, mostrado só como taxa unitária "5€/un." nunca como total calculado** (pedido explícito, repetido duas vezes) — não confundir com o Anti Ácaros de colchão/sofá do widget de marketing, que usa a fórmula escalonada antiga (`calcChairAntiAcarosTotal`, 10€ + 7,50€/cadeira) e continua inalterada aí.
- **Upsell final "Aproveite e poupe 10%" (desde 2026-09-06).** O antigo `QuizUpsellOverlay.tsx` (escolher um item de cada vez) foi completamente removido e substituído por `QuizComboUpsellScreen.tsx`: um único ecrã com as 3 categorias (Colchão, Sofá, Cadeiras) lado a lado, cada uma abre a sua própria página de quantidades com tamanhos/preços reais (não uma quantidade genérica). Continua a escrever no mesmo array `upsellItems`/`setUpsellItems` que já existia, por isso o desconto de 10% (`packDiscountActive`), o recibo e o payload de submissão não precisaram de alterações.
- **Upsell contextual (2026-09-10):** quando `packDiscountActive` já é verdadeiro, usar "APROVEITE A MESMA VISITA" / "Quer limpar mais alguma coisa?" e explicar que os 10% já estão aplicados e abrangem os extras. Só apresentar a promessa de desbloquear 10% quando o desconto ainda não está ativo. Excluir a categoria principal (`primaryService`) das sugestões; extras previamente selecionados continuam editáveis. Finalizar sem extras continua disponível.
- **Layout das sugestões (2026-09-10):** até três categorias usam cartões compactos de largura inteira, um por linha, com o ícone à direita e centrado verticalmente. Quatro categorias mantêm a grelha 2x2. Evitar três cartões em grelha de duas colunas com o último isolado à esquerda.
- **Testemunhos das páginas comerciais B2B** (`/limpeza-comercial-*`): o dono prometeu uma lista real de restaurantes/hotéis clientes para usar como testemunhos. Ainda não foi entregue — nunca inventar nomes ou citações até essa lista chegar.

## Armadilha recorrente: constantes duplicadas

`scripts/prerender.ts` e `scripts/generate-sitemap.ts` correm em Node puro (sem Vite), por isso não conseguem importar via alias `@/`. Vários dados de negócio existem em **duas cópias**: uma importável (`src/constants/business.ts`, `src/components/quiz/QuizTypes.ts`) e uma cópia paralela consumida só pelos scripts (`src/data/locationSeoData.ts`, constantes locais dentro do próprio `prerender.ts`). **Qualquer correção de preço, taxa ou estatística tem de ser feita nas duas cópias**, senão o site prerenderizado (o que o Google vê) fica dessincronizado do site interativo.

Segunda instância do mesmo problema: `src/pages/AdminPanel.tsx` mantém o seu próprio array `SITEMAPS` e switch `getSitemapUrls()`, escritos à mão — novos sub-sitemaps adicionados a `scripts/generate-sitemap.ts` **não aparecem automaticamente** ali, é preciso atualizar os dois.

**Terceira armadilha (RESOLVIDA em 2026-09-08): o widget de preços já foi um componente único partilhado, depois passou a 3 cópias inline, agora voltou a ser 1.** `src/components/ServicePriceSection.tsx`, `src/pages/LocationServicePage.tsx` e `src/pages/FreguesiaServicePage.tsx` tinham cada uma a sua própria cópia inline do JSX do widget (steppers, toggles, badge de desconto), com o JSX já a divergir visivelmente entre as 3 (estilos de cartão diferentes) apesar de a lógica ser idêntica. Extraído para `src/components/PriceWidget.tsx` (apresentação, visual escuro/dourado igual ao quiz) + `src/hooks/use-price-widget.ts` (estado e handlers) — as 3 páginas agora só fazem `<PriceWidget serviceSlug={...} initialLocation={...} />`. **Qualquer alteração visual/UI ao widget faz-se só em `PriceWidget.tsx`** — se no futuro voltar a aparecer uma cópia inline do widget numa página nova, é um erro, não um padrão a seguir. Os toggles Impermeabilizar/Anti Ácaros que existiam inline no widget foram removidos nesta mesma limpeza (pedido explícito): essa decisão faz-se agora só no ecrã de upsell dedicado que o quiz já mostra a seguir às quantidades, nunca duas vezes. A lógica de preços em si (`src/lib/priceWidgetCalc.ts`) já estava centralizada antes disto e continua a ser importada só por `PriceWidget.tsx`. Os pontos de confiança à esquerda do widget (`src/constants/serviceTrustPool.ts` via `getTrustPointsForSeed`) continuam centralizados como antes, sem alteração.

**Quarta armadilha (crítica, já aconteceu): `.env` e o Cloudflare Pages.** O Cloudflare Pages construiu sempre o site a partir do `.env` que esteve committado no Git desde o commit inicial — nunca teve `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`/`VITE_ADMIN_PASSWORD` configuradas como env vars próprias no dashboard do Cloudflare Pages. Quando o `.env` foi corretamente removido do Git em 2026-08-24 (estava exposto num repo público), o build seguinte em produção compilou com essas variáveis `undefined` — `createClient(undefined, undefined)` do supabase-js rebenta de forma síncrona, o que crashava as abas CRM/Métricas do admin panel e fazia todo insert em `quiz_events`/`leads`/`error_logs` falhar em silêncio durante 2-4 dias sem nenhum erro visível (Formspree não depende do Supabase, por isso os pedidos de orçamento reais continuaram a chegar normalmente — só o painel interno ficou cego). Corrigido no código em 2026-08-26 (`src/integrations/supabase/client.ts`/`src/lib/supabase.ts` já não rebentam com env var em falta, mostram banner vermelho no admin panel via `isSupabaseConfigured`). **Sempre que se mexer em `.gitignore`/tracking de `.env`, confirmar explicitamente que o Cloudflare Pages já tem essas env vars configuradas do lado dele** antes de dar a limpeza por concluída.

## Regras de conteúdo e estilo (fixas, já corrigidas várias vezes)

- **Nunca usar em dash (—)** em conteúdo visível do site (títulos, descrições, FAQs, blog). Não confundir com `---` usado como divisor Markdown nas minhas próprias respostas de chat.
- **Nunca usar o ícone Sparkles** (lucide-react) como decoração. `Star` continua permitido em contexto de rating/avaliação.
- **Mobile-first sempre** — qualquer alteração de UI/layout, mobile é prioridade absoluta, não um afterthought.
- **Previews obrigatoriamente em mobile (13/09/2026):** qualquer preview aberto pelo Codex tem de usar uma viewport mobile. Não abrir, apresentar nem validar previews em viewport desktop, sem exceções.
- **Regra revogada em 2026-09-06:** já não é verdade que o Step 3 das cadeiras deva replicar o ecrã de upsell pixel a pixel — foi decisão explícita separar os dois (ver "Cadeiras: decisão de addon movida" acima). Se esta frase aparecer num commit antigo ou numa memória vinda de outra sessão, ignorá-la.
- Ao corrigir uma regra de preço (ex. um mínimo errado), mudar só o valor que viola a regra. Não extrapolar a outros valores sem perguntar primeiro.
- Não adicionar mecânicas de urgência (timers, badges) que não foram pedidas explicitamente.

## Antes de terminar qualquer sessão neste projeto

Atualiza este ficheiro se alguma regra ou facto de negócio mudou; atualiza `CONTEXT.md` se a arquitetura mudou. Faz commit + push após cada alteração concluída, incluindo alterações a estes ficheiros, e confirma que o trabalho da sessão ficou sincronizado antes de trocar de máquina.

## Avaliações regionais (2026-09-10)

As páginas que usam `ServiceReviewsGrid`, incluindo variantes de higienização/lavagem, selecionam por região e serviço. `LISBON_REVIEWS` em `src/data/reviewsPool.ts` contém 13 transcrições de cinco estrelas com texto fornecidas pelo responsável, que confirmou Lisboa. A avaliação de Sara Rochete tem quatro estrelas e nenhum texto, pelo que não integra os cartões. Não inventar testemunhos, alterar estrelas nem atribuir freguesias/cidades sem confirmação. `CONFIRMED_REVIEW_LOCATIONS` regista a fonte das localidades; os antigos rótulos do catálogo histórico não são prova. Quando existe pool regional, só usa essa pool; sem pool confirmada, usa transcrições sem localidade. O catálogo histórico da homepage é separado desta seleção e não foi auditado integralmente.

## Páginas de sofás e entrada Ads (2026-09-10)

Pedido do responsável: WhatsApp principal e ligação à tabela de preços nas páginas de limpeza de sofás e variantes de limpeza/higienização (`SofaLeadActions`). Mostrar deslocação junto do preço inicial, sem alterar valores. Resposta obrigatória em TODO o site: menos de 10 minutos, incluindo páginas de sofás, variantes, anúncios, quiz e widgets. Não existem exceções por família de páginas. Secagem média de 3 a 6 horas, dependente da ventilação e das condições. Não apresentar garantias totais de remoção de manchas nem percentagens/certificações sem comprovação. `?ads=1`, identificadores de clique Google ou `utm_medium=cpc/ppc/paidsearch` ativam navegação reduzida nas páginas de sofás; entradas orgânicas conservam os diretórios. O evento GA4 `whatsapp_click` mede apenas o clique; a importação/configuração de conversões na conta Google Ads ainda exige verificação.

## Deslocações Braga e Algarve (2026-09-10)

Pedido do responsável: Braga com base local, 10€ em Braga, Guimarães, Vila Nova de Famalicão, Barcelos e Póvoa de Lanhoso; 15€ em Fafe e Esposende; 20€ em Viana do Castelo. Algarve: 25€ nos extremos/interior (Vila Real de Santo António, Castro Marim, Monchique, Aljezur, Vila do Bispo, Alcoutim); Portimão e Lagos mantêm 15€ e restantes zonas 10€. Esta regra substitui o antigo máximo de 15€ no Algarve. Atualizar sempre as duas tabelas (`QuizTypes.ts` e `locationSeoData.ts`). Os escalões são por localidade, não um cálculo GPS por morada.

## Nome do tratamento no orçamento (2026-09-10)

Pedido do responsável: explicitar «Desbacterização e Anti Ácaros» nos upsells de colchões e cadeiras e nos respetivos resumos/recibos. É a apresentação conjunta do tratamento existente, sem alteração de preços. Implementado na branch de pré-visualização `codex/quote-visual-preview`.

Pedido de simplificação (2026-09-10): nos upsells de colchão e sofá, clicar no cartão liga o tratamento para os artigos escolhidos; repetir o clique retira. Não expandir linhas por tamanho nem steppers abaixo do cartão. A seleção e o total no cabeçalho dão o feedback. Esta decisão substitui a apresentação anterior de detalhes após selecionar.

## Selo dos extras (2026-09-10)

Pedido do responsável: usar o selo TOP em todas as opções extra do orçamento, incluindo Essencial e Premium, tratamentos e categorias de serviços adicionais. Na pré-visualização, reutilizar `QuizTopBadge` (coroa e acabamento dourado), sem duplicar markup nem introduzir animações de urgência. O selo não indica que o extra já está selecionado.

Revisão aprovada do selo TOP (2026-09-10): reservar apenas para impermeabilização Premium e desbacterização/antiácaros. Essencial, higienização adicional e categorias de artigos deixam de ter selo. Substitui o pedido anterior de selo em todos os extras. A pré-visualização sem parâmetros abre agora no início, sem seleções; `?exemplo=pack` conserva o exemplo preenchido.

## Escolha parcial e comparação de proteção (2026-09-10)

Nova decisão do responsável: um sofá/colchão mantém o clique simples; vários permitem escolher quantos recebem tratamento, com linhas compactas «1 de 3», sem repetir imagens/preços. `packQty` opcional representa essa quantidade; ausência preserva a seleção antiga de todas as unidades. `splitTreatmentItems` mantém preços, resumo e recibos coerentes. Esta decisão substitui a remoção absoluta dos seletores. A impermeabilização mostra os dois acréscimos (Essencial e Premium), a diferença real e o âmbito/valor antes de descontos. Benefícios em três pontos curtos junto da imagem. Exemplo local `?exemplo=varios`.

Cadeiras: decisão 2026-09-10 substitui o extra separado de antiácaros. Desbacterização e antiácaros passam a benefício incluído na impermeabilização; sem terceiro cartão e sem cobrança extra quando há proteção. Conjunto de quatro cadeiras: Essencial 70€, Premium 90€. Outros escalões preservados até instrução específica.

## Teste local de upsell (2026-09-10)

`?teste=pack` em páginas de limpeza de sofás ativa, apenas com `import.meta.env.DEV`, um percurso demonstrativo ligado ao `PriceWidget`: seleção de sofá, oferta de colchão, resumo e pré-visualização da mensagem. `SofaPackPreview` calcula a proposta de 10% sobre serviços, excluindo deslocação, sem exigir base de 100€. Não envia contactos nem altera as regras reais do quiz. Esta oferta ainda não está autorizada para produção. Valores de colchão e deslocação vêm das tabelas reais.

`?teste=quiz-pack` demonstra a mesma proposta dentro do quiz real (tratamentos → colchão → contacto), apenas em DEV. O botão final é inofensivo e não envia pedidos. Não remover as proteções nem ativar a oferta pública sem pedido do responsável.


## Uniformidade dos guias e conselhos (2026-09-10)

Pedido explícito do responsável: os guias devem usar o dourado canónico `#D4AF37` nos destaques, sem variantes castanhas/ocres. O título da secção mantém a escala das secções adjacentes (`text-[1.85rem] sm:text-4xl md:text-[2.6rem]`, `font-playfair`, `leading-[1.1]`). Melhorias de compacidade não autorizam alterar esta identidade tipográfica ou cromática. O token Tailwind `text-gold` resolve atualmente para outro tom; nesta secção usar `text-[#D4AF37]` para corresponder ao dourado explícito das FAQs.


Atualização do teste local (2026-09-10): `?teste=quiz-pack` agora demonstra colchão casal a +55€, sem acumular desconto de 10%. Compara com limpeza individual (69€ da tabela) + deslocação da localidade, explicitamente uma visita separada. Lisboa: 79€ separado vs +55€ na visita existente, poupança24€, sofá79€ + deslocação10€ + extra55€ =144€. Substitui a proposta anterior de143,20€ neste modo; produção inalterada.

## Contacto simples (2026-09-10)

O passo «Os seus dados» começa pelo nome e telemóvel, com preenchimento automático. Resumo do pedido fechado por defeito e abaixo dos campos. Não colocar recibos abertos, avaliações, estimativa fixa no topo nem totais repetidos no rodapé deste passo. A ação principal é «Enviar pedido». Preservar preços, detalhes e validação do envio.

## Hero mobile da homepage (13/09/2026)

No mobile, título e descrição precedem uma fotografia própria no fluxo, sem CTAs ou indicadores sobre o antes/depois. Abaixo, uma única linha sem cartão reúne +1200 serviços realizados e REVIEW_RATING com estrela/Google. WhatsApp é a ação principal; calcular preço mantém o tratamento escuro com contorno dourado do desktop. Marca e controlos do cabeçalho têm o mesmo centro vertical e alvos de 44px. Desktop mantém a composição sobre a imagem.

Revisão visual (13/09/2026): o mobile usa agora uma fotografia vertical prolongada por IA (`hero-sofa-mobile-extended.webp`) como fundo contínuo do texto, zona livre da limpeza e CTAs. Gradientes suaves garantem contraste, sem cortes ou cartões opacos entre as três zonas. Preservar a faixa central sem sobreposição.

## Avaliações e confiança na homepage (13/09/2026)

Responsável confirmou 110+ avaliações Google, nota 4.9. REVIEW_COUNT é 110 e SERVICES_COMPLETED_LABEL é +1200 (serviços, não clientes). HomeHeroTrust reúne serviços e avaliações numa faixa transparente, com símbolo Google e estrelas, legendas abaixo para legibilidade. Substitui a antiga linha simples mobile e os dois indicadores separados desktop. Conteúdo inglês e schemas usam a contagem atual; não alterar transcrições reais.

## Fonte atual (13/09/2026)

Avenir Next é a fonte do site, incluindo toda a homepage. Usar `src/styles/typography.css`, `--font-kyro` e as faces web em `public/fonts/avenir-next/`, integradas do ramo principal. O alias legado `font-playfair` também resolve para Avenir. Não repor Cormorant/Inter na homepage.

Peso dos títulos do site (13/09/2026): manter H1 como aprovado; títulos secundários H2–H6 usam Avenir Demi 600, não Bold 700, em todo o site. Regra global em `typography.css`, por pedido explícito do responsável.

## Avaliações compactas no mobile (13/09/2026)

Os cartões partilhados de avaliações (`CustomerReviewCard`, usados por `CustomerReviews` na homepage e páginas de serviços/localidades) têm altura uniforme de 340px abaixo de 640px, texto de 18px com até seis linhas e abertura da transcrição integral num diálogo acessível quando necessário. O carrossel deixou de ajustar a altura à avaliação selecionada. Preservar as transcrições e a apresentação desktop.

## Faixa de indicadores dos serviços (13/09/2026)

Nas páginas de localidades, freguesias, variantes, marcas e preços, a faixa `ServiceSnapshotStats` apresenta apenas avaliações, resposta e secagem (ou ativação da proteção), nesta ordem e numa única linha também em mobile. Retirar o preço repetido desta faixa, preservando-o no hero e na tabela. Estrela da avaliação sempre dourada `#D4AF37`. Esta decisão substitui a grelha mobile 2×2 proposta anteriormente.


## Base visual de problemas (13/09/2026)

Pedido do responsável: usar o layout das páginas de materiais como ponto de partida para `/problemas/:slug`. Referência atual: commit `6f1c60e` dos materiais. Hero, orçamento, avaliações, quatro exemplos visuais em grelha 2×2, processo ilustrado, quatro FAQ claras, packs em verde e diretório claro. Reutilizar `VisualExamplesGallery` e `IllustratedProcessGuide`, sem repor os cartões escritos. `problemLayout.ts` partilha conteúdo com o prerender. A revisão específica dos conteúdos continua separada; não repor os antigos blocos de indicadores, vantagens e dicas nesta base sem pedido. Variantes por cidade permanecem separadas.

## Galeria de materiais (13/09/2026)

Pedido do responsável: a secção dos materiais usa quatro exemplos visuais próprios por tipo, incluindo páginas por localidade. `MaterialExamplesGallery` e `materialExamples.ts` são a fonte partilhada. São imagens ilustrativas geradas, não trabalhos reais nem antes/depois. Manter identificação discreta, texto alternativo e ampliação acessível. Não voltar aos quatro blocos de características escritos.


## Processo dos materiais e avaliações (13/09/2026)

Pedido do responsável: nas páginas de material, avaliações imediatamente após os preços e antes dos exemplos visuais. Retirada a galeria intermédia «Antes e depois». Os materiais de sofá usam seis passos ilustrados próprios (pele/couro mantém cinco), em `materialProcessGuides.ts` e no apresentador partilhado `IllustratedProcessGuide`. Não repor o processo escrito duplicado nestes sofás nem chamar resultados reais às imagens geradas. Preservar a comparação do hero e as transcrições das avaliações.

## Correção do processo por material (13/09/2026)

Os guias de sofá, exceto pele/couro, têm seis etapas: avaliação, aspiração, aplicação, escovação, extração e secagem. A escovação fica obrigatoriamente entre aplicação e extração. Couro mantém os cinco cuidados próprios. No mobile, seis separadores usam duas linhas de três para manter os rótulos legíveis.

Materiais: sequência de fundos aprovada: exemplos branco, processo verde, perguntas branco, pack «Aproveite a mesma visita» verde. A variante clara das FAQs é explícita, sem alterar as restantes páginas.


## Hero de problemas (13/09/2026)

Pedido do responsável: redesenhar o hero em todas as páginas de problemas, nacionais e por localidade. Usar `ProblemHero`, sem voltar a duplicar markup nas duas páginas. Preservar identificação do problema, galeria antes/depois, WhatsApp principal, link funcional ao orçamento, avaliações reais, resposta inferior a 10 minutos e deslocação explícita. Texto separado da fotografia, sem cortes na introdução; cidade em linha própria e na mensagem. `problemHero.ts` partilha o conteúdo com o HTML inicial. Não voltar às introduções antigas com promessas sanitárias ou remoção garantida.


## Verde suave e heroes mobile (13/09/2026)

Pedido aprovado: a paleta verde suave do piloto passa a ser partilhada pelo site, em `src/styles/surfaces.css`, sem a antiga textura. As áreas claras continuam claras. Em mobile (até 767px), os heroes usam fundo verde com degradé e fotografia/comparação separada do texto; no computador conserva-se a fotografia de fundo. `data-mobile-hero` delimita o tratamento nos heroes comerciais, marcas, materiais, problemas, páginas informativas, packs, blog e inglês. `CommercialHero` mantém a composição única nas famílias comerciais. A homepage usa o seu `HeroV1` independente, com a fotografia contínua e `HomeHeroTrust`, sem a galeria antes/depois acrescentada pela uniformização. O piloto `scripts/preview-hero-mobile.mjs` passou a servir os estilos reais, sem uma segunda cópia da proposta CSS. Não confundir esta aprovação visual com alterações de preços, conteúdo, FAQ ou fluxos comerciais.


## Reposição da homepage (13/09/2026)

O responsável rejeitou expressamente a inclusão da homepage na uniformização dos heroes. Reposto `HeroV1` exatamente da versão anterior a `033d483`, com fotografia contínua, título, descrição, HomeHeroTrust, WhatsApp e botão «Calcular o meu preço». Não aplicar à homepage a estrutura comercial com breadcrumb, galeria antes/depois e três indicadores. Alterações futuras à homepage exigem pedido específico.


## Garantia no cartão de cadeiras da homepage (13/09/2026)

Pedido do responsável: na secção «Os 4 problemas que resolvemos no próprio dia», o cartão de cadeiras apresenta «Impermeabilização com garantia de até 10 anos e 5 lavagens». Substitui o texto antigo de 12 meses neste cartão.


## Exemplos nos seis serviços principais (13/09/2026)

Pedido do responsável: substituir a secção secundária de antes/depois nas seis páginas nacionais por quatro fotos ilustrativas específicas do serviço, em grelha 2×2 também mobile e com ampliação. `ServiceExamplesGallery` reutiliza `VisualExamplesGallery`; preservar a comparação do hero. As imagens dos cartões têm versões WebP de 400/800px, carregamento diferido e original apenas na ampliação. Aplicar esta otimização aos seis serviços.


Fundo dos exemplos nacionais (13/09/2026): a galeria 2×2 nos seis serviços principais usa o verde canónico `bg-kyro-green`, com títulos e legendas claras e destaques dourados. `ServiceExamplesGallery` ativa a variante escura de `VisualExamplesGallery`; restantes famílias preservam a sua variante.


## Promessas dos seis serviços (13/09/2026)

Secção «A nossa promessa» simplificada por pedido do responsável: uma fotografia ilustrativa por serviço e três compromissos com divisórias discretas, sem cartões escuros nem texto sobre imagens. `ServiceEliteGuarantee` mantém o título Avenir/dourado e o fundo claro. Fotografias WebP de 400/800px em `public/images/service-promises/`, carregamento diferido. Textos curtos preservam repetição até 48h, secagem média e condições da proteção.


Revisão das promessas (13/09/2026): o responsável rejeitou a fotografia única com três parágrafos. Nos seis serviços, apresentar três imagens que ilustrem os compromissos, cada uma apenas com uma legenda curta. Sem os parágrafos explicativos; a condição de repetição até 48h fica numa nota discreta no final. Esta decisão substitui a composição anterior. Manter imagens WebP responsivas e lazy loading.


## Recursos e desenho comercial (21/09/2026)

O responsável confirmou que os «100» eram termos do Glossário, todos na mesma página. Preservar os 100 identificadores e os 26 URLs do Blog; não criar páginas artificiais para atingir uma contagem. Os artigos usam o desenho das páginas de serviço, com `CommercialHero`, orçamento partilhado, avaliações reais, guia e quatro FAQ. Não voltar a uma identidade editorial diferente nem a heroes longos sem ação comercial. Blog, FAQ e Glossário partilham `ResourceHubHero`/`ResourceNav`. Manter as correções documentadas em `docs/resources-review-2026-09-21/README.md`, incluindo ausência de recolha/entrega nacional de tapetes prometida, métodos universais ou garantia de devolução de dinheiro. `resourceContent.ts` partilha o conteúdo comercial e as quatro FAQ do hub com o HTML inicial.
