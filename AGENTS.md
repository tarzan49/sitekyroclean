## Fecho dos oito alertas comerciais (10/09/2026)

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


## Tipografia Avenir e legibilidade (2026-09-13)

O responsável aprovou Avenir Next e confirmou licença web, fornecendo os WOFF2. A implementação usa `src/styles/typography.css`, importado depois de `index.css`; `public/fonts/avenir-next` contém apenas os pesos usados pelo website. Não depender da fonte instalada no dispositivo. `font-playfair` permanece como alias de compatibilidade para a família Kyro, sem serifas.

Usar os papéis `type-page-title`, `type-section-title`, `type-article-title`, `type-quote-title` e `type-card-title`, com Demi 600. Não aplicar a mesma dimensão a todos os h2. Texto de leitura longa 18 px, opções e campos 16 px, notas secundárias pelo menos 14 px. Preservar adaptação a 320 px e espaçamento de leitura aumentado.

Na revisão aprovada, títulos/destaques de texto em superfícies claras usam verde escuro #1A4E30; descrições secundárias #505650. Dourado #D4AF37 conserva-se nos fundos escuros e em detalhes gráficos. Esta decisão substitui a exigência histórica de texto dourado sobre fundo claro nos guias. Não extrapolar a aprovação para mudanças de preços, promessas ou fluxos comerciais.
