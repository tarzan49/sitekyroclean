# Kyro Clean Solutions — Instruções para Claude Code

Este ficheiro tem só as regras em vigor. O histórico completo (porquê de cada regra, datas, incidentes, medições) está em `docs/regras-detalhadas.md`: **antes de mexer numa área, procura lá por essa área** (`grep -n "palavra" docs/regras-detalhadas.md`). Arquitetura em `CONTEXT.md`, problemas conhecidos em `AUDIT.md`.

Regra de manutenção: este ficheiro não passa de ~30 KB. Uma regra nova entra aqui numa linha; a explicação e a história vão para `docs/regras-detalhadas.md`. Uma regra que deixou de valer sai daqui (não se escreve "antes era…").

---

## 0. Regras fixas (nunca saltar)

1. **Horas disponíveis só pela `bot-api`.** Nunca dizer ao dono, nem propor a um cliente, horas lidas à mão do calendário. Chamar a ação `availability` da Edge Function `bot-api` (cabeçalho `x-bot-key`, chave em `~/Documents/02 Kyro/Pastas antigas/Kyro-segredos/`), que aplica todas as regras das equipas (`src/lib/botAvailability.ts`: espaçamento de 1h30 na Porto 1 e Porto 2, Lisboa 1 faz dois serviços à mesma hora (nunca três; dono 13 Nov), Porto 2 só de manhã nos dias úteis, Porto 1 fechada ao bot desde 6/11 às 20h (só faz os serviços que o dono lhe der, dono 12 Nov), Porto 3 só limpezas, folgas `TEAM_OFF`, instruções do dia `DAY_RULES`, Algarve e zonas alargadas = dono decide). Se a chamada falhar, dizer que falhou; não improvisar.
2. **Preços só pelo motor.** Para dar um preço, usar a ação `quote` da `bot-api` ou as funções de `src/lib/botQuote.ts` / `src/constants/*`. Nunca de cabeça.
3. **Opinião sobre anúncios só com o critério do dono** (`src/lib/adsVsOrganic.ts`, separador Crescimento): pedidos, fechos e "para ti" acima da média orgânica (semanas de 03/08 a 20/09) menos o gasto do Google = lucro dos anúncios. Mostrar sempre esses números antes de qualquer conclusão. Nunca dizer "gastas demais" sem o lucro calculado; uma semana com faturação alta e lucro positivo não é uma semana de gasto excessivo.
4. **Conteúdo (vídeos, posts, anúncios) só a partir de um guião aprovado pelo dono.** Se não existir guião para esse formato, propor primeiro em texto (ideia, cenas, texto do ecrã) e esperar o OK. Um vídeo tem de ser vídeo real da equipa ou movimento real; nunca fotografias paradas montadas como vídeo. Sem OK, nada se publica.
5. **Nada vai para clientes ou equipas sem o dono ver primeiro** (mensagens, ofertas, horas), salvo o que o bot já faz sozinho por regra escrita.
6. **Não sei = digo que não sei**, e digo como confirmar. Nunca inventar números, horas, preços, nomes ou fontes.
7. **Uma regra por tema.** Regra nova do dono substitui a antiga em todas as camadas no mesmo dia: código (`botAvailability`/motor), ficheiro do bot (linha S certa, nunca no fim), `bot-contract.md`, este ficheiro, `docs/regras-detalhadas.md` (marcar `[RETIRADA dd/mm]`) e memória. Entre duas regras que se contradizem ganha a data do dono mais recente; se não houver data, perguntar. A frase retirada entra em kyro-bot `tests/regras-retiradas.test.ts` (o deploy falha se voltar).

---

## 1. Duas máquinas, um repositório

- Início: `git status` + `git log -5 --oneline`; `git pull` se não estiver alinhado com `origin/master`.
- Fim: commit + push. Repositório **público** (`tarzan49/sitekyroclean`): nada de dados de clientes, NIFs, chaves.
- `.env` é local, nunca vai para o Git. Produção (cleansolutions.com.pt) atualiza com push (Cloudflare Pages).
- Eu corro os comandos e os deploys; não peço ao dono para os correr.

## 2. Verificar

- Tipos: `npm run typecheck` (nunca `npx tsc --noEmit`, que verifica 0 ficheiros). `npm run build` não verifica tipos: correr os dois.
- Edge Functions: `npm run test:functions`, `deno check`, publicar com `node_modules/.bin/supabase functions deploy <nome>` (a `bot-api` e as que recebem chamadas externas com `--no-verify-jwt`). Um push não publica funções.
- Depois de mudar preços/motor/regras do bot: `npm run build:bot-engine` (e `build:follow-up-engine` se mexer no seguimento), commit, publicar `bot-api`.
- **Nunca `supabase db push`.** SQL aplica-se com `node_modules/.bin/supabase db query --linked -f <ficheiro>` ou no SQL Editor.
- Medir sobre o `dist` só a partir de um build limpo (`git archive HEAD` para pasta à parte se houver trabalho de outra sessão).

## 3. Factos de negócio (importar sempre, nunca escrever à mão)

- Avaliações, clientes, serviços: `src/constants/business.ts` (4.9★, 200+ avaliações, +1350 clientes, +1350 serviços). NIPC 519720318 (falta pôr no site).
- Deslocação: `src/constants/travel.ts` (`locationPrices`, mínimo 10€; isenção acima de 120/135/150€). Uma cidade nova entra em `locationPrices` **e** `cities` ao mesmo tempo. `EXTENDED_TRIP_CITIES` = Aveiro + Alentejo Litoral (sob consulta).
- Coimbra 10€ com equipa própria; Figueira da Foz 20€; Aveiro 15€ (equipa Porto).
- Preços em texto: `src/data/enginePrices.ts`; regras comerciais: `src/constants/commercialPolicy.ts`; packs: `src/constants/packPerks.ts` (`priceWithPackPerks`, regalias só a partir de 100€); anti-ácaros: `src/constants/antiAcarosPricing.ts`; cadeiras: `src/constants/chairPricing.ts`.
- Sofás: 4 lugares 99€, 5 lugares 119€, 6 ou 7 lugares (U, modular ou direito) julgados pela fotografia 129/139/149€ com imper +170/+110€ (`SEAT6_LOOK_PRICES`, dono 9 Nov), 8+ ao dono, canto/L 109€ (impermeabilizar L = 3L + 2L), U/modular sob orçamento no site. Essencial sozinha 39/69/89/109€, Premium 79/119/149/179€. Pack limpeza + impermeabilização = limpeza + impermeabilização sozinha − 10€ nas duas versões (2/3/4 lugares: Essencial 128/158/198€, Premium 178/218/268€).
- Cadeiras: no site "Desde 12,50€" (escalões 20/15/12,50€, também nos pedidos que vêm do questionário, `site: true`); no WhatsApp 25€ de 1 a 3, 20€ de 4 a 7, 18€ a partir de 8, qualquer quantidade, deslocação à parte (`whatsappChairCleanUnit`, dono 12 Nov). Impermeabilização de cadeiras 30/23€ (1–4) e 25/18€ (5+).
- **Tapetes e alcatifas nunca mostram preço no site.** Lavagem em casa por defeito; recolha +20€, só entre 3 e 12 m² somados, fora da zona de Braga, entrega até 5 dias úteis. Alcatifa nunca tem recolha. Impermeabilização de tapetes não se vende no site; no WhatsApp o bot dá o preço, também sozinha (Premium 15€/m², Essencial 10€/m²). Anti-odor em tapete: 15€ ou 5€/m², o que der mais (`odor: true`; dono, 12 Nov).
- Sem preço próprio no site: puffs, cabeceira, 5+ impermeabilização. Chaise longue não é opção. Manchas, tecido e sujidade não mudam o preço (pele pode).
- Secagem 2 a 5 h em tudo. Resposta em menos de 5 minutos. Preços sem IVA; com fatura, a empresa paga mais 23% e no particular o IVA fica dentro do preço; o valor sem IVA divide-se sempre a meias com a equipa (dono, 5 Nov).
- Serviço com fatura/IVA (empresa ou particular): o cliente paga SEMPRE por transferência à conta da empresa (IBAN no ficheiro do bot, S43), nunca à equipa; quem recebe é o dono; o IVA é todo do dono; só o valor sem IVA se divide com a equipa. Aviso às equipas antes do serviço, a quem o faz (grupo se houver grupo) (dono, 4 Nov).
- O desconto de 10% acima de 149€ não existe. Nunca mecânicas de urgência não pedidas.
- Avaliações nas páginas: só as reais de `src/data/reviewsPool.ts`. Testemunhos B2B: nunca inventar.

## 4. Bot de WhatsApp (resumo; detalhe em `docs/regras-detalhadas.md`, secção "API do bot")

- O bot (servidor kyro-bot) fala com o site só pela `bot-api`. Ações principais: `quote`, `availability`, `hold`, `book`, `update-booking`, `booked-services`, `find-order`, `team-accounts`, `procedure-*`, `certificate`.
- Fecha sozinho quando há hora aceite, preço do motor e morada completa; Algarve, zonas alargadas, mesma hora de outro serviço da zona, Viana abaixo de 100€, Leiria/Batalha abaixo de 110€ → dono. Acima de 300€ fecha sozinho (dono, 12 Nov). Coimbra e Funchal: fecha o serviço sem hora e pergunta a semana e o dia, o dono confirma no calendário (`askWeek`, dono 12 Nov). Sob orçamento: dá o preço de tabela mais próximo e avisa o dono em silêncio (dono, 12 Nov).
- Descer o preço (dono, 12 Nov): nunca por iniciativa própria; quando o preço é a objeção, primeiro a opção mais barata e as perguntas, depois uma condição especial UMA vez pelo `askedDiscount` do motor (limpeza 10%; com impermeabilização 5%, 10% acima de 500€), a qualquer valor, nunca por cima de outra condição já dada.
- Equipas: Porto 1 (fechada ao bot desde 6/11; só os serviços que o dono lhe der; o pedido de fotos vai só para o Manel, `PROCEDURE_ONLY_TO`, dono 12 Nov), Porto 2 (reserva: só recebe serviços se Porto 3 não puder; dias úteis 9h–13h, último serviço às 12h, máx. 2 por dia), Porto 3 (Denise, prioritária; limpezas abaixo de 200€ são dela; só limpezas; a única do Porto que recolhe tapetes, `RUG_PICKUP_TEAMS`, dono 8 Nov), Braga (só limpezas), Lisboa 1, Algarve, Coimbra. Referir sempre pelo nome da equipa, nunca da pessoa.
- Impermeabilização no calendário leva sempre "(solvente)" (Premium) ou "(à base de água)" (Essencial) ao lado do nível: o bot escreve-o e o sweep de 5 min da `bot-api` acrescenta-o aos serviços futuros escritos à mão que tenham o número (`tagWaterproofBase`, dono 13 Nov).
- Cliente desmarca → o bot apaga o evento (sai dos fechos e das contas); artigos acrescentados contam como fecho no dia em que foram aceites (`service_extras`), o serviço fica no mesmo dia.
- Cliente com serviço marcado pede para remarcar → o bot serve-o sozinho, mesmo com a conversa em pausa; se a equipa já não faz esse serviço no dia novo, passa para outra equipa livre da zona; a equipa que já tinha sido avisada sabe sempre da mudança.
- Pagamento às equipas (dono, 6 Nov; Lisboa 1, Algarve, Braga, Porto 2, Porto 3; serviços desde 6/11): fotografias e vídeo = 50%, sem eles = 45%; avaliação de 4 ou 5 estrelas = mais 5€ pagos pelo dono (`procedureAdjustment`).
- Pedido de avaliação só depois de o cliente dizer que correu bem; vai sem Instagram e diz que demora 10 segundos e ajuda a mostrar o nosso valor; o Instagram só depois de o cliente dizer que avaliou; 24 h depois do pedido, uma pergunta a quem não disse nada (dono, 4 Nov).
- Fotografias e vídeos só com um orçamento novo (preço ainda não dado) ou quando o cliente os pede; nunca a responder a fatura, pagamento, marcação, serviço feito ou reclamação (dono, 12 Nov, Raimundo; kyro-bot `proofsAllowed`).
- Recolha de tapete não é fim de serviço: nem "Como correu?" nem certificado na visita de recolha, só depois da entrega (dono, 9 Nov; `isRugPickupVisit`).
- A mensagem de "Serviço terminado" pede o processo todo em vídeo, conforme o serviço (`procedureShots`: limpeza, impermeabilização ou as duas), e sempre em HD. Conteúdo só com o guião aprovado.
- O que o bot não sabe pergunta ao dono; nunca nega um serviço.
- Email: o bot responde a conversas novas que peçam um serviço (kyro-bot `src/email.ts`, `email_bot`=on, dono 4 Nov); o resto e as conversas já a decorrer ficam em "Por responder". O texto automático está calado (`botEmail`=on no script).
- Resposta parada à espera do dono: nunca só "Obrigado pela mensagem!", nem só o cumprimento ou o upsell (a ponte leva as respostas às perguntas, dono 9 Nov); sem preço novo nem horas, sai inteira e o dono recebe o aviso do preço (dono, 8 Nov).

## 5. Site e SEO

- O HTML estático (`scripts/prerender.ts`) é o que o Google e as IAs leem; tem de dizer o mesmo que a página React (regra anti-cloaking). Dados partilhados vivem em `src/data/*` e são lidos pelos dois lados.
- Constantes duplicadas são a armadilha nº 1: uma mudança de preço/facto faz-se na fonte única e verifica-se no prerender.
- Rota nova só no React precisa de entrada no `prerender.ts`, senão serve 404.
- Hero das páginas de SEO: só botão de WhatsApp. Mensagens de WhatsApp pedem sempre "o preço e a disponibilidade".
- Google Ads otimiza para "Serviço fechado" (fechos reais, valor "para ti", via `ads-conversions-feed` + código "ref." na mensagem); o clique no WhatsApp é secundário (dono, 3 Nov).
- Cliques de contacto medem-se só pelo delegado global (`data-tracking-source`), nunca `onClick` com tracking.
- Plugins do Vite que escrevem no `dist` levam `apply: 'build'`.
- Instagram e Facebook: 5 publicações por dia (dono, 4 Nov), hora de Lisboa: 09:00 Reel de clips, 12:30 antes e depois, 16:00 e 21:00 limpezas do dia, 18:30 carrossel (`kyro-social`, `src/pick.ts`). Reel feito em lote só entra na fila depois de visto imagem a imagem: sem sanita, sem material de outras empresas. Detalhe em `docs/regras-detalhadas.md`.

## 6. Estilo

- Nunca em dash (—) em texto visível do site. Nunca o ícone Sparkles.
- Mobile-first sempre.
- Dourado `#D4AF37` em tudo; `#8B6914` só em texto pequeno sobre fundo claro.
- Afirmações de saúde só com fonte lida (`src/data/blogSources.ts`). Nada de "elimina 100%", "mata", percentagens de eficácia.
- Ao corrigir um valor, mudar só esse valor; não extrapolar sem perguntar.
- Mensagens a clientes/equipas: rascunho ao dono primeiro e sai UMA só mensagem, nunca partida em 4 ou 5 (dono, 6 Nov).

## 7. Poupar contexto (dono, 4 Nov)

- Antes de ler um ficheiro inteiro, procurar com grep e ler só o necessário.
- Para explorar o projeto, usar um subagente e trazer só o resumo.
- Mostrar o diff, nunca o ficheiro completo.
- Não repetir o que já foi decidido nesta sessão.
- Se mudarmos de tarefa, propor /compact ou uma sessão nova.
- Respostas curtas por defeito; mais detalhe só se o dono pedir.

## 8. Antes de terminar

Atualiza este ficheiro só se uma regra em vigor mudou (uma linha), e acrescenta o detalhe em `docs/regras-detalhadas.md`. Commit + push.
