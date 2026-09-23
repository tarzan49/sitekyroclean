# Auditoria de medição e WhatsApp, 20/09/2026

Estado: revisão local preparada, sem publicação, push, alterações em campanhas, migrações remotas ou submissões em produção. O clique WhatsApp mantém-se como objetivo comercial pretendido. Não foi convertido em pedido confirmado nem em venda.

## Versão e separação de trabalho

- HEAD e origin/master, após fetch: `da0bfa03d5d5499a46dade50f9f3ba6c511b813a`.
- Produção, HTML obtido diretamente: `/assets/index-CoSWYJRj.js`. SHA-256 do bundle: `61f8ab64f41c2801b2ab62af69255a033f48c3555abe0c7ae9313b21ae11f602`. Contém os IDs G-T45T5FBNC3, AW-18457115875, label ewA0CLXn_fscEOP5hOFE, send_page_view e WeakSet. Isto identifica o artefacto observado, não prova por si só o commit de origem ou a receção de eventos pela Google.
- À entrada existiam alterações em 11 ficheiros: cabeçalhos PT/EN, homepage, sticky bar, problemHero, quizTracking e respetivo teste, whatsappMessages e três páginas de marcas. Preservadas em `preexisting.patch`; a correção do page_view após consentimento já estava neste trabalho anterior.
- `proposed-only.patch`: apenas o trabalho desta auditoria, aplicado sobre aquele estado inicial. SHA-256 `ba44772ea1b2ddbbef8ea62ed27d45596cbfe8dc42dc0a451b69be8973f38fd1`.
- `tested-worktree.patch`: todas as diferenças de código face a HEAD, incluindo as anteriores, para reproduzir a versão testada. SHA-256 `9799010dc7b31f1b80f64b35a6d361779928d5251c3e7104e3125f52dd644acf`.
- `source-sha256.json`: hashes por ficheiro. Não há um novo commit que represente esta proposta: foi mantida local, sem integrar alterações anteriores num commit desta auditoria. Não está sincronizada com a outra máquina.

## Três prioridades e correções preparadas

### 1. Autorização do endpoint de emails (P1)

**Observado no código:** `supabase/functions/list-resend-leads/index.ts`, `isAuthenticatedAdmin`, aceitava qualquer `auth.getUser(token)` válido. Não consultava `admin_users`, apesar de usar credenciais de servidor para ler emails do Resend. A restrição RLS das tabelas não protege essa leitura externa.

**Impacto:** uma conta autenticada sem autorização administrativa poderia obter informação dos pedidos através desse endpoint, caso a versão remota corresponda ao código auditado. Não foi explorado em produção e não se afirma ter havido acesso indevido.

**Reprodução/teste local:** cliente simulado autenticado sem entrada administrativa; deve devolver false. Administrador reconhecido devolve true; ausência de sessão e erro de base devolvem false. Quatro testes Deno passaram.

**Correção mínima:** helper `_shared/admin-authorization.ts`, que valida o token e consulta exclusivamente o ID autenticado em `admin_users`; falha fechada. Nenhuma conta é promovida. O endpoint foi verificado com `deno check`.

**Publicação futura:** exige publicar a Edge Function, independentemente do frontend, e confirmar que o administrador real consta de `admin_users`. Nenhuma função foi publicada nesta sessão. Se o administrador não estiver registado, o acesso será recusado por segurança.

### 2. Mensagens e dados pessoais em URLs WhatsApp (P1)

**Observado no código:** `src/services/submissionService.ts`, `buildWaUrl`, incluía nome, telefone e `payload.message` no parâmetro `text`; este pode incluir observações livres. `Obrigado.tsx` reutilizava o URL guardado em sessão.

**Impacto:** dados pessoais ficavam num URL copiável. Se a medição automática de cliques externos estiver ativa, `link_url` pode transportar o URL completo. A documentação Google confirma esse parâmetro; não foi observado um envio real desses dados nesta auditoria. Fontes: [parâmetros de eventos](https://support.google.com/analytics/table/13594742?hl=en), [medição otimizada](https://support.google.com/analytics/answer/9216061?hl=en).

**Correção mínima:** `whatsappMessages.ts` centraliza as mensagens gerais, por serviço/localidade e após pedido. O URL de confirmação contém apenas uma referência opaca validada, sem nome, telefone, morada, observações, UTMs ou identificadores publicitários. Na ausência de referência válida usa a frase sem referência. `Obrigado.tsx` reconstrói também os links de sessões antigas, sem reutilizar o URL antigo. Informação detalhada permanece no recibo e nos canais operacionais.

**Referência real:** `insertCrmLead` passa a conservar o `bookingId` devolvido pelo servidor. Antes, uma resposta de duplicado podia deixar o recibo e WhatsApp com a referência aleatória da tentativa seguinte. Teste com resposta persistida `REAL1234` confirma a mesma referência no resultado, recibo e URL.

**Mensagens:** Lisboa usa a redação B do briefing; cabeçalho/home/sticky usam C; variantes de impermeabilização de sofá usam D adaptada à cidade; a página genérica de impermeabilização conserva “estofos” porque abrange sofás e cadeiras. A mensagem E não afirma marcação confirmada. Encoding único por `encodeURIComponent`, domínio `wa.me` e número comercial preservados. Não foi acrescentado qualquer handler de analytics. O rodapé atual tem telefone, não um botão WhatsApp; não foi criado um CTA adicional.

**Testes:** mensagens, acentos, Porto, artigos, referências ausentes/inválidas, dados pessoais ausentes e paridade do recibo/email. Inspeção mobile de Lisboa, Porto, impermeabilização Lisboa e confirmação. Confirmação sem recibo usa mensagem sem placeholder. Não foi enviado WhatsApp.

**Pendente na conta GA4:** conferir `click`/`link_url`, configurações de medição automática, URLs/referrers e navegação do admin após visita pública. A proteção do evento manual não controla todos os eventos emitidos pela biblioteca Google. Recomenda-se rever a medição automática de cliques externos antes de publicar; nenhuma opção da conta foi alterada.

### 3. Etiqueta Google nos ambientes de teste (P2)

**Observado no código:** `sendGtagEvent` verificava o ambiente, mas `loadGoogleTags` não. Aceitar cookies num preview podia carregar/configurar a biblioteca com os IDs reais, permitindo que funcionalidades automáticas não passassem pela proteção dos eventos manuais.

**Correção mínima:** a mesma `shouldSendToGoogle()` passa a bloquear o carregamento da biblioteca. Produção mantém a configuração existente; testes externos exigem autorização explícita e ambos os IDs de teste. Não foi instalado outro banner nem alterado o modo de consentimento.

**Teste:** depuração sem autorização não cria script nem faz config; IDs de teste autorizados carregam uma única biblioteca; aceitação/restauro/revogação continuam cobertos. Testes de consentimento foram ajustados para usar IDs de teste.

## Evidência de medição, pedidos e dados

| Área | Conclusão e limite |
|---|---|
| Cliques | Delegado único de `quizTracking.ts` e WeakSet sobre o evento; nenhum handler de componente encontrado a enviar novamente os mesmos cliques. Testes simulados cobrem origens header desktop/mobile/menu, hero, sticky, footer, SEO e confirmação, substituição do DOM, dois eventos distintos e click com detail=0. Cada clique autorizado produz um evento lógico e um envio interno simulado. Não equivalem a testes num aparelho físico. |
| Consentimento | Eventos próprios recusados sem consentimento e após revogação; orçamento operacional independente. A correção anterior de page_view na primeira aceitação está preservada e passou. Pedidos em trânsito não podem ser desfeitos por revogação posterior. |
| Formulário | `generate_lead` e conversão nativa apenas quando CRM confirma. Falha dos dois canais rejeita. Entrega apenas por email continua aceite operacionalmente e não dispara conversão de lead. A página Obrigado diz “Registado no sistema” mesmo neste caso e quando aberta diretamente: limitação de apresentação já existente, sem prova de persistência por essa página isoladamente. |
| Idempotência | `submissionId.ts` mantém lead_id até entrega, hook partilha pedido em curso, índice único e resolução explícita de 23505 no servidor. Os quatro testes do resolvedor passaram, incluindo conflito sem linha. Após entrega, novo pedido ganha novo ID. Não há prova de todos os cenários de perda de resposta em rede real. |
| Falhas parciais | Se CRM gravar mas a resposta se perder e o email confirmar, não se reporta conversão; não afirmar que há um retry garantido. `send-lead-email` usa claim de notificação e trata 23505 como claim duplicado; isso não é prova independente de email entregue. Sem reescrita nesta fase. |
| RLS | Migrações atuais restringem leads, atribuição, histórico, contactos, exportações e tabelas administrativas a is_admin; admin_users sem acesso direto de anon/authenticated. Harness PostgreSQL descartável passou, incluindo repetição das duas migrações. O baseline local não certifica o schema remoto. |
| Endpoints públicos | submit-lead limita campos/comprimentos e usa limite em memória por IP; reCAPTCHA ausente é permitido por decisão operacional. Limite reinicia em cold start e não é distribuído; não o apresentar como proteção absoluta. Inserts públicos de quiz_events/error_logs continuam possíveis e não autenticam a veracidade dos eventos. |
| Segredos | Não foram encontradas referências SERVICE_ROLE/OAuth client secret no código de src. Segredos de servidor continuam nas funções. Não foi feita exportação de .env ou pesquisa de dados de clientes. |
| Atribuição | Lista de UTMs, GCLID/GBRAID/WBRAID e ValueTrack em leadAttribution.ts; first touch 90 dias, last touch com janela de 30 minutos, sem query no caminho guardado. Captura depende de consentimento e de os parâmetros ainda estarem disponíveis; UTMs não validam por si a autenticidade do tráfego. Keyword é a palavra-chave da conta. |
| Finanças | marketingMetrics.ts separa orçamento, marcação, faturado e recebido. MarketingPanel chama costMetrics(null, funnel): CAC/ROAS indisponíveis. Clientes contam serviços concluídos por lead, não pessoas únicas deduplicadas entre canais; não usar como prova de novos clientes pagos. |
| Testes de produção históricos | Não existe is_test nas seleções do painel auditadas. Não excluir automaticamente ANPNQP3Z, JQEZMOPH ou 009XSWM8 nem chamar-lhes receita. Nenhum desses registos foi consultado/alterado/exportado nesta sessão. |
| Conversões offline | Nenhum ficheiro foi exportado para Google. A função CSV usa toISOString (UTC) mas cabeçalho Europe/Lisbon: a hora exige revisão antes de usar importação offline. Isto não afeta o clique WhatsApp nem foi alargado para um projeto de integração. |
| WhatsApp direto do anúncio | Fora do website; depende das métricas/integrações próprias do recurso Ads. Abrir o link não prova envio, conversa ou pagamento. Sem correspondência inventada com sessões. |

## Validações executadas

- `npm test`: **63 ficheiros, 2.213 testes aprovados**.
- `npm run lint`: **0 erros, 16 avisos** (não corrigidos fora do âmbito).
- `npx tsc --noEmit -p tsconfig.app.json`: passou.
- `npm run build`: passou; **16.256 rotas** prerenderizadas.
- `node scripts/audit-landing-layout.mjs`: **0 falhas e 0 links em falta** nas quatro famílias auditadas.
- `deno test --allow-env=RECAPTCHA_SECRET_KEY,RECAPTCHA_ENABLED ...`: **8 testes aprovados**, sem rede de clientes nem acesso a produção. Primeiras execuções pararam por permissões de leitura de env; repetição com permissões específicas passou.
- `deno check supabase/functions/list-resend-leads/index.ts`: passou.
- Harness de `supabase/tests`: **TODAS AS VERIFICAÇÕES DE PERMISSÕES PASSARAM**, numa base Docker descartável; nenhuma migração remota.
- Mobile: moldura 390px; mensagens e CTA visíveis em Lisboa/Porto/proteção/confirmação. Aviso React de desenvolvimento sobre `fetchPriority` já existente; sem reformulação estética. Não se mediram Core Web Vitals num aparelho físico nem se certificou desempenho de produção.
- Produção: leitura HTTP do HTML e bundle, canonical da homepage correto. A landing pública anuncia resposta em menos de 10 minutos. Sem cliques em anúncios, submissões ou eventos de teste enviados para Google.

## Promessa comercial

`commercialPolicy.ts` mantém “Resposta em menos de 10 minutos” e equivalente inglês. Hero/indicadores e condições usam 10 minutos. Não se encontrou promessa operacional de resposta em 5 minutos na pesquisa de código; ocorrências de 5 minutos são conselhos sobre manchas ou parte de durações de tratamentos. `Obrigado.tsx` aplica um horário local do browser (segunda a sábado, após 08h), que não é uma fonte central do horário de atendimento em Portugal.

Proposta para aprovação comercial, sem implementação: “Respondemos em menos de 10 minutos durante o horário de atendimento. Fora desse horário, respondemos no próximo período de atendimento.” Confirmar primeiro o horário real e fuso Europe/Lisbon; se a decisão for cinco minutos, alterar site e anúncios de forma coerente apenas depois dessa confirmação. Garantia e preços não foram alterados.

## Recurso de mensagens Google Ads, separado do código

Mensagem (127 caracteres):

> Olá! Qual é o preço e a próxima disponibilidade para limpar os meus estofos em Lisboa? Posso enviar fotografias para orçamento.

Apelo: **Receber estimativa do custo**. Descrição (28 caracteres): **Envie fotos e peça orçamento**.

Não aplicado à conta. O cliente ainda tem de enviar a mensagem e escolher as fotografias.

## Pendente de confirmação nas ferramentas Google

Nada foi confirmado por sessão autenticada nesta auditoria. Verificar propriedade 515463572 e stream 13098053101, associação ao Ads 920-786-3494, whatsapp_click como evento principal e importação concluída. Confirmar ação WhatsApp Principal, contagem Uma, sem valor de venda; formulário/telefone secundários e ação antiga fora do objetivo principal. Rever objetivos efetivos da campanha e personalizados, não só a coluna Principal. Não criar conversão nativa paralela para o mesmo clique.

Confirmar medição automática de cliques/URLs, alterações de página por histórico, estado real da campanha, regiões e aplicação do sufixo. Maximizar cliques não passa a otimizar conversões só porque WhatsApp se torna Principal. Nenhum orçamento, lance, campanha ou promoção foi alterado.

## Publicação e rollback

Proposta ainda não publicada. O briefing desta tarefa exige autorização antes de push/publicação, substituindo a regra habitual de sincronização automática para esta entrega. Alterações anteriores continuam separadas e não devem ser atribuídas a esta auditoria.

Após aprovação: rever os três patches, confirmar administrador autorizado, publicar frontend e a função list-resend-leads pelos fluxos próprios, e validar acesso admin/não-admin e eventos numa sessão controlada. Não requer migração de schema, reinstalação de tags ou alteração da conversão nativa do formulário.

Rollback local: `git apply -R --check docs/audit-2026-09-20/proposed-only.patch` verifica reversão apenas desta auditoria; aplicar só sem alterações posteriores sobre os mesmos trechos. Não usar reset/restore global, pois apagaria trabalho anterior. Em produção, preferir corrigir para a frente: reverter a autorização reabre o acesso indevido e reverter mensagens repõe dados pessoais nos URLs. Se a função bloquear administradores legítimos, manter a restrição e corrigir o registo autorizado, nunca promover todas as contas. Schema e dados existentes permanecem compatíveis.
