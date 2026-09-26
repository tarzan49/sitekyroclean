# Medição: Google Analytics 4, Google Ads e atribuição de leads

Referência da infraestrutura de medição do site. Descreve o que o código faz, e
separa isso do que ainda depende de configuração externa.

**Como ler os estados.** Nada neste documento mistura estas quatro coisas:

| Estado | O que significa |
|---|---|
| **IMPLEMENTADO** | Está no código, no repositório. |
| **TESTADO LOCALMENTE** | Verificado por testes automáticos e/ou browser local, com identificadores de teste. |
| **CONFIG. EXTERNA PENDENTE** | Depende de alguém mexer no Google Ads, no GA4, no Cloudflare ou no Supabase. |
| **VALIDADO EM PRODUÇÃO** | Confirmado no site real, com dados reais. Até 2026-09-23 nada estava neste estado; a instalação das tags e a entrega ao painel passaram a estar (secção 13). |

---

## 1. Identificadores

| Identificador | O que é | Onde se usa |
|---|---|---|
| `G-T45T5FBNC3` | Measurement ID da propriedade GA4 | É o ID com que a `gtag.js` é carregada |
| `AW-18457115875` | ID de conversão do Google Ads | `gtag('config', …)` e o `send_to` das conversões de website |
| `920-786-3494` | **Número de cliente** do Google Ads | Integrações: Data Manager API, Google Ads API, importações, ligação ao GA4. **Nunca** num `send_to` |
| `GT-M6XTKMC7` | "Google Tag" da propriedade | Identificador do contentor na interface da Google. Não é carregado pelo site |

O `AW-` e o número de cliente **não são a mesma coisa** e não são
intermutáveis. O `AW-` identifica o conjunto de conversões no site; o número de
cliente identifica a conta. Ambos estão em `src/constants/tracking.ts`, o
segundo apenas como documentação (o código nunca o usa).

### Sobre o `GT-M6XTKMC7`

**O que foi confirmado:** o bundle de produção
(`dist/assets/index-CxE6pAry.js`, descarregado do site a 2026-09-18) contém
`G-T45T5FBNC3` e `AW-17779872363`, e carrega `gtag/js?id=G-T45T5FBNC3`. A
string `GT-M6XTKMC7` não aparece no bundle.

**O que isso não prova:** que "a Google tag estava em falta". Um `GT-` e um `G-`
da mesma propriedade GA4 são o **mesmo contentor** com dois nomes — a Google
cria um `GT-` automaticamente para cada propriedade, e carregar
`gtag/js?id=G-…` é carregar esse contentor. A ausência do literal `GT-` no
código diz que não foi carregado *por esse nome*, e mais nada.

Por isso o site continua a carregar uma só biblioteca, pelo `G-`, e o Google Ads
entra como destino adicional por `config`. Carregar também o `GT-` punha duas
cópias da biblioteca na página e duplicava cada `page_view`.

É na interface da Google, no ecrã "Google tag" do `GT-M6XTKMC7`, que se veem e
se ligam os destinos deste contentor. Se o `AW-18457115875` for lá ligado como
destino, o `config` do código torna-se redundante mas continua correto — a
Google deduplica destinos repetidos.

### Sobre a conta de Ads antiga

**Confirmado no código:** `src/lib/consent.ts` fazia `gtag('config', 'AW-17779872363')`,
que é a conta anterior. Presente no bundle em produção.

**Não confirmado, e não afirmável a partir daqui:** que a conta nova teve zero
conversões. Isso depende de coisas que só se veem dentro das contas: se o
`AW-18457115875` está ou não ligado como destino do `GT-M6XTKMC7`, se existem
ações de conversão criadas, se houve importações. Fica como verificação a
fazer na conta, não como conclusão.

**Estado:** ID novo IMPLEMENTADO e TESTADO LOCALMENTE (o bundle compilado contém
`AW-18457115875` e não contém `AW-17779872363`). Destinos e ações na conta:
CONFIG. EXTERNA PENDENTE.

---

## 2. `page_view`: um só mecanismo

### O problema que existia

Numa SPA, o `config` da `gtag.js` envia um `page_view` do URL de entrada e mais
nenhum, porque mudar de rota não recarrega a página.

### O que o código faz agora — IMPLEMENTADO

`gtag('config', GA4, { send_page_view: false })` desliga o automático, e
`src/hooks/use-page-tracking.ts` envia um `page_view` por mudança de rota.

### O que `send_page_view: false` **não** resolve — CONFIG. EXTERNA PENDENTE

O GA4 tem, na Medição otimizada (*Enhanced measurement*), a opção
**"Alterações de página baseadas em eventos do histórico do navegador"**. Essa
opção é configurada **na interface do GA4**, vive no lado do servidor da tag, e
`send_page_view: false` **não lhe toca**. Com ela ligada, cada `pushState` do
React Router produz um `page_view` da medição otimizada **além** do nosso — dois
por navegação.

**Ação necessária, e não pode ser verificada a partir do código:**

> GA4 → Administrador → Fluxos de dados → o fluxo do site → Medição otimizada →
> engrenagem → desligar **"Alterações de página baseadas em eventos do histórico
> do navegador"**. Deixar as outras opções como estão.

Enquanto isso não for feito, é preciso assumir `page_view` duplicado em
navegação SPA. Não é detetável a partir da página: a medição otimizada não passa
pelo `dataLayer`, é interna à tag. Verifica-se no DebugView do GA4, contando
`page_view` por navegação.

**Uma propriedade de teste não serve para validar isto**, porque a definição é
por fluxo de dados e a propriedade de teste tem o seu próprio. Fica pendente até
ser executada na propriedade real.

### Deduplicação — TESTADO LOCALMENTE

`src/lib/pageViewDedup.test.ts`, seis casos:

| Caso | Esperado | Resultado |
|---|---|---|
| A → B → A | três `page_view` | ✅ o regresso a A conta |
| mesmo caminho repetido (re-render, StrictMode) | um só | ✅ |
| refresh | volta a enviar | ✅ |
| consentimento a meio da visita | reenvia a página atual | ✅ |
| query string no `page_location` | ausente | ✅ |
| sem consentimento de análise | nada | ✅ |

Confirmado também em browser com navegação real da SPA, incluindo
`history.back()`: `/limpeza-sofas` → `/packs` → `/limpeza-sofas` produziu
exatamente três `page_view`.

A guarda é o **último caminho enviado**, não uma lista de caminhos já vistos: é
o que distingue "o React correu o efeito duas vezes" de "a pessoa voltou a esta
página", e só suprime o primeiro.

---

## 3. Consentimento

### Duas coisas separadas, e só a segunda depende de cookies

**A. Registo operacional — não depende de consentimento.**
Quem recusa análise e publicidade submete o orçamento na mesma. O pedido vai
para os dois canais (função `submit-lead` → tabela `leads`, e `send-lead-email`
→ email), a página `/obrigado` funciona, e o negócio recebe tudo. O que não
acontece é medição.

**B. Medição de marketing — depende inteiramente do consentimento.**
`page_view`, `generate_lead`, conversões, atribuição, `quiz_events`.

**TESTADO LOCALMENTE.** `src/services/leadDelivery.test.ts` (12 casos) e
verificação em browser:

| Cenário | Resultado verificado |
|---|---|
| Recusar cookies e submeter | Pedido enviado aos dois canais; `leadId` e recibo gerados; **zero** scripts da Google; **zero** eventos; **zero** pedidos de rede para domínios da Google; atribuição `null`; `gclid` do URL **não** guardado nem enviado |
| Recusar e submeter o formulário simples | Mesmo caminho (`contactService` → `send-lead-email`), `trackLeadEvent` não envia nada |
| Retirar consentimento a meio | Zero eventos a seguir, incluindo `page_view` e conversões |
| Aceitar | Uma biblioteca, `page_view` único, atribuição guardada, conversão enviada |

A verificação da rede foi feita com `performance.getEntriesByType('resource')`,
que é o registo do próprio browser, e não apenas contando chamadas aos nossos
helpers.

### Aceitar análise não é autorizar publicidade

A decisão é guardada como um par `{analytics, ads}`
(`src/lib/consentStorage.ts`) e os quatro sinais do Consent Mode v2 derivam
dele: `analytics_storage` da análise; `ad_storage`, `ad_user_data` e
`ad_personalization` da publicidade. Cada evento declara a sua finalidade e é
verificado contra a parte certa da decisão.

**O banner de hoje faz uma pergunta só**, cujo texto cobre "cookies de análise e
publicidade". Por isso aceitar liga as duas e recusar desliga as duas — as
respostas coincidem sempre, hoje. A separação existe no código para que uma
divisão futura do banner seja uma alteração ao banner e mais nada, e para que
nenhum caminho de código transforme um consentimento no outro por omissão.

**Uma consequência honesta, verificada:** com análise concedida e publicidade
negada (estado hoje só alcançável por API, não pelo banner), a nossa conversão
do Ads não é enviada — mas a `gtag.js`, já carregada, continua a emitir pings
**sem cookies** para o destino de Ads. Isso é o Consent Mode a funcionar como
está desenhado, não um evento nosso. Com o banner atual, quem recusa não chega a
ter a biblioteca carregada e não há pedido nenhum.

### Modo em vigor

**`advanced`, desde 26/09/2026 (decisão do dono).** A `gtag.js` carrega em
todas as visitas com os quatro sinais a `denied` (script inline do
`index.html`); até a pessoa aceitar, a Google não lê nem grava cookies e recebe
só pings sem cookies (data e hora, browser, página de origem, se a visita veio
de um anúncio, estado do consentimento), que usa para modelar conversões. O
Pixel da Meta, a medição própria em `quiz_events` e o `user_data` das conversões
melhoradas continuam a exigir a aceitação. O modo passou a ser o valor por
omissão de `CONSENT_MODE` em `src/constants/tracking.ts`;
`VITE_CONSENT_MODE=basic` no Cloudflare Pages volta ao comportamento antigo, e
**obriga a corrigir a política de privacidade**, que descreve o modo avançado.

Consequência para o parágrafo anterior: com o banner atual, quem recusa **passa
a ter** a biblioteca carregada e gera pings sem cookies. Os nossos eventos
(`page_view`, `whatsapp_click`, a conversão do lead) saem como pings sem
cookies; é isso que permite à Google modelar as conversões perdidas.

### O que os números do painel são

A frase "quem recusa cookies não existe em nenhum relatório" estava errada e foi
corrigida. O correto:

> Quem recusa cookies **conta como lead operacional**, com nome, telefone e
> serviço, e aparece em todas as contagens de leads, marcações, clientes e
> receita. O que não existe para essa pessoa é **sessão observada e atribuição**:
> não conta em nada por campanha nem por landing page.

O painel mede e mostra essa diferença: cada cartão diz se é "Operacional · todos
os pedidos" ou "Observado · só com consentimento", e há um cartão de
**Cobertura** (leads observados / leads operacionais) com um aviso quando é
inferior a 100%.

### Sanitização — IMPLEMENTADO

- Só parâmetros de campanha de uma lista fechada são lidos do URL; tudo o resto
  é ignorado. Testado com `?email=…&phone=…` no URL.
- `page_location` vai sem query string.
- A atribuição enviada ao servidor passa por uma segunda lista fechada na Edge
  Function e não aceita nenhum campo pessoal.
- `safeLog` nas Edge Functions não regista corpos de pedido.
- Enhanced conversions: hash SHA-256 no browser, pelo canal `user_data`, nunca
  em parâmetros de evento ou URLs. Desligado por omissão.

---

## 4. Idempotência e entrega do lead

### O identificador da submissão — IMPLEMENTADO

`src/lib/submissionId.ts` gera o `lead_id` **uma vez por submissão** e guarda-o
em `sessionStorage`. Sobrevive a duplos cliques, retries e refresh; é limpo
**só depois de o pedido ter sido entregue**, para que a pessoa que volta na
semana seguinte crie um lead novo e não seja bloqueada como repetição.

Na versão anterior o `lead_id` era gerado dentro de `submitQuizLead`, ou seja
uma vez por *tentativa* — o que tornava a deduplicação do servidor inútil.

### Três camadas, de cima para baixo

| Camada | Onde | O que apanha |
|---|---|---|
| Estado do React | `useQuizSubmission` (`inFlight`) | Duplo clique na mesma renderização |
| Identificador de submissão | `sessionStorage` | Retry, refresh, reenvio |
| **Base de dados** | índice único `idx_leads_lead_id` | Tudo o resto, incluindo dois pedidos em paralelo |

A terceira é a única que não depende do browser. A Edge Function faz um `select`
por `lead_id` antes de inserir e devolve `duplicate: true` se já existir; se dois
pedidos passarem o `select` ao mesmo tempo, o índice único rejeita o segundo com
`23505` e a função trata isso como sucesso, não como erro.

**O canal de email tem o seu próprio trinco:** `lead_notifications`, com chave
primária `(lead_id, channel)`. Quem conseguir inserir é quem envia. Se o envio
falhar, o trinco é **largado** — sem isso, a proteção contra emails duplicados
transformava-se em perda do pedido quando o Resend recusava a primeira tentativa.

### TESTADO LOCALMENTE

| Caso | Onde | Resultado |
|---|---|---|
| Duplo clique | `submissionId` + browser | Mesmo `lead_id` nas duas |
| Retry após timeout | `leadDelivery.test.ts` | Mesmo `lead_id` reutilizado |
| Refresh depois do sucesso | `submissionId` | Identificador novo (é um pedido novo) |
| Mesmo identificador repetido (corrida real, servidor) | `supabase/functions/submit-lead/index.test.ts` | Devolve o `booking_id` **persistido**, não o do pedido que perdeu a corrida |
| Conflito de unicidade sem linha correspondente por `lead_id` | idem | Nunca devolve sucesso — `resolveDuplicateLeadConflict` só confirma o que existe mesmo |
| Mesmo identificador repetido (índice, base de dados) | `supabase/tests/10_permissions.sql` | Índice único rejeita o segundo lead |
| Mesma **submissão** notificada 2× | idem | Trinco `(lead_id, channel)` rejeita o segundo envio — é por `lead_id`, não por email/telefone do cliente. Um pedido novo do mesmo cliente tem `lead_id` novo e nunca é bloqueado |
| Mesma conversão exportada 2× | idem | Restrição única rejeita |
| CRM falha, email tem sucesso | `leadDelivery.test.ts` | Pedido entregue (email), mas **sem** `generate_lead` — sem confirmação do CRM não há conversão |
| CRM confirma (inserção nova ou duplicado reconhecido), email falha | idem | `generate_lead` dispara na mesma — a confirmação vem só do CRM |

### O que o "sucesso" mostrado ao cliente significa

O pedido resolve com sucesso se **pelo menos um** dos dois canais confirmar. Isso
é deliberado e vem de uma regra antiga do projeto: um pedido real nunca se perde.

Mas os dois casos não são equivalentes, e o painel deixou de os tratar como se
fossem: se o canal do CRM falhar, o pedido chegou por email e **não existe na
tabela `leads`** — não aparece em contagem nenhuma. O painel mostra um aviso
vermelho com o número de falhas de entrega ao CRM nas últimas 24 horas,
precisamente para esses números não serem lidos como completos.

**`generate_lead` segue a mesma regra, agora imposta no código, não só no
comentário — IMPLEMENTADO 2026-09-18:** `submitQuizLead` só chama
`reportLead` quando `crmOk` é verdadeiro (inserção nova ou duplicado
reconhecido pelo servidor). Antes disso, o código disparava sempre que "não
falharam os dois canais" — incluía o caso de só o email ter tido sucesso, sem
nenhum registo confirmado em `leads` para a conversão apontar.

**Limite real que fica, documentado e não escondido:** se a resposta do canal
CRM se perder na rede do browser mas o servidor tiver gravado a linha na
mesma, essa tentativa em concreto não dispara `generate_lead` — o browser não
tem confirmação, só o servidor tem. Só dispara se a pessoa tentar de novo
(mesmo `lead_id`, reconhecido como duplicado). Se nunca tentar de novo, essa
conversão real não é medida. É a mesma escolha que já existe no resto do
projeto: preferir sub-contar a inventar uma conversão sem confirmação.

**Uma falha de medição nunca trava o pedido:** `trackLeadEvent` corre dentro de
um `try/catch` depois da entrega, e há testes que submetem com o `gtag` a lançar
exceção e com o armazenamento bloqueado.

---

## 5. Segurança e permissões — TESTADO LOCALMENTE

Executável: `supabase/tests/` (ver o README de lá). Corre contra um Postgres
descartável em Docker, com os papéis `anon`/`authenticated`/`service_role` e o
mesmo mecanismo de `set role` + `request.jwt.claims` que o PostgREST usa.

**Uma nota que mudou o próprio teste:** o RLS **não gera erro** num `SELECT` —
filtra as linhas em silêncio e devolve zero. Só a falta de `GRANT` gera
`insufficient_privilege`. A primeira versão do teste esperava exceção e por isso
deu "permitido" a leituras que devolviam zero linhas. Há agora dois helpers
separados.

### Resultados

| Papel | Ação | Resultado |
|---|---|---|
| anónimo | ler `leads`, `lead_attribution`, `lead_status_history`, `contact_log`, `conversion_exports`, `lead_notifications`, `admin_users` | negado |
| anónimo | criar lead, mudar estado, mexer em receitas, fabricar qualificação ou conversão, reescrever atribuição, apagar leads, inserir-se em `admin_users` | negado |
| anónimo | inserir em `quiz_events` e `error_logs` | permitido (o site precisa) |
| anónimo | ler `quiz_events` / `error_logs` de volta | negado |
| **autenticado, sem entrada em `admin_users`** | ler ou escrever qualquer tabela do painel (`leads`, `lead_attribution`, `contact_log`, `conversion_exports`, `error_logs`, `quiz_events`, `admin_users`) | **negado** — mesmo resultado que anónimo |
| autenticado sem `admin_users` | inserir-se a si próprio em `admin_users` | negado |
| **administrador** (autenticado + registo em `admin_users`) | ler leads e atribuição | permitido |
| administrador | **reescrever ou apagar a atribuição** | negado |
| administrador | **reescrever ou apagar o histórico de estados** | negado |
| administrador | ler `lead_notifications` | negado |
| administrador | mudar estado, gravar valores, registar contacto, exportar conversão | permitido |

Além do RLS, há `revoke all … from anon` explícito em todas as tabelas novas: o
Supabase concede por omissão a `anon` em tabelas novas do schema `public`, e sem
a revogação uma política acidentalmente permissiva no futuro abria a tabela
inteira.

### Autoria determinada pelo servidor — IMPLEMENTADO

`changed_by`, `logged_by` e `created_by` são escritos por um trigger
(`set_actor_from_jwt`) a partir do email no JWT da sessão. O que o browser mandar
nesses campos é ignorado. O teste envia deliberadamente `'MENTIRA-DO-BROWSER'` e
verifica que o valor gravado é o da sessão.

*Este teste apanhou um defeito real:* a primeira versão do trigger usava
`coalesce(new.created_by, actor)` em `conversion_exports`, ou seja aceitava o
valor do browser quando ele vinha preenchido. Corrigido para sobrepor sempre.

### Autorização administrativa — IMPLEMENTADO · TESTADO LOCALMENTE (2026-09-18)

Até aqui não existia utilizador autenticado sem função administrativa: as
políticas diziam `to authenticated` e todas as contas do Supabase Auth eram,
por construção, administradoras.

Migração `20260918010000_admin_authorization.sql`: tabela `admin_users
(user_id, email, role, created_at)`, sem nenhuma política para `anon` nem
`authenticated` (só a chave de serviço lê ou escreve, no SQL Editor), e a
função `is_admin()` (`security definer`, lê `request.jwt.claims` diretamente,
mesmo padrão de `set_actor_from_jwt`) usada em todas as políticas do painel
no lugar de `using (true)`. Não é multiempresa: só distingue quem administra
a Kyro de quem não.

`supabase/tests/10_permissions.sql` tem agora três blocos (anónimo,
autenticado sem `admin_users`, administrador), não dois — ver
`supabase/tests/README.md`.

**Configurar o primeiro administrador é um passo manual, documentado, não
automático:** não há promoção automática da primeira conta nem de todas as
contas existentes — ver `docs/tracking-plano-de-publicacao.md`.

**O que fica pendente de "validado em produção":** que a migração foi mesmo
aplicada na base real e que o primeiro `admin_users` foi mesmo inserido — o
harness local prova o mecanismo, não o estado da base remota.

### Segredos

Nenhuma service-role key, OAuth secret ou refresh token está no frontend nem em
`VITE_*`. As únicas coisas em `VITE_*` são identificadores públicos (Measurement
ID, Conversion ID, etiquetas de conversão) e flags de comportamento — todos
visíveis no HTML de qualquer site que os use.

---

## 6. Conversões: website e offline são caminhos diferentes

### A correção

A primeira versão tratava as três conversões como se todas precisassem de uma
**etiqueta de gtag**. É falso. Uma importação offline não usa `send_to` nem
etiqueta nenhuma: usa o **nome da ação de conversão**, escrito exatamente como
está no Google Ads, mais um identificador de clique ou dados do utilizador com
hash. Uma etiqueta posta ali produz um ficheiro que o Google Ads rejeita — ou,
pior, aceita e não atribui a nada.

As variáveis de ambiente foram renomeadas para refletir isso:

| Antes (errado) | Agora | O que é |
|---|---|---|
| `VITE_GOOGLE_ADS_LEAD_CONVERSION_LABEL` | igual | Etiqueta de gtag, para o `send_to` |
| `VITE_GOOGLE_ADS_QUALIFIED_LEAD_LABEL` | `VITE_GOOGLE_ADS_QUALIFIED_LEAD_ACTION` | **Nome** da ação offline |
| `VITE_GOOGLE_ADS_CUSTOMER_CONVERSION_LABEL` | `VITE_GOOGLE_ADS_CUSTOMER_CONVERSION_ACTION` | **Nome** da ação offline |

### Tabela de conversões

| Evento interno | Ação Google Ads | Origem | Identificador necessário | Regra de disparo | Deduplicação | Estado |
|---|---|---|---|---|---|---|
| `generate_lead` | Lead (website), **principal** | Tag no browser | Etiqueta de gtag + `AW-18457115875` | Depois da confirmação do servidor; nunca no clique | `transaction_id` = `lead_id` (Google) + `markFiredOnce` (browser) + índice único (BD) | IMPLEMENTADO · TESTADO LOCALMENTE · **etiqueta PENDENTE** |
| mudança para `QUALIFIED` | Lead qualificado (offline), **secundária** | Importação | `gclid`/`gbraid`/`wbraid` + nome da ação + data/hora + moeda | Mudança de estado no painel | `conversion_exports` único por `(lead_id, ação)` | IMPLEMENTADO (CSV) · **nome da ação PENDENTE** |
| mudança para `COMPLETED` | Cliente (offline), **secundária** | Importação | idem | Mudança de estado no painel | idem | IMPLEMENTADO (CSV) · **nome da ação PENDENTE** |
| `whatsapp_click` | microação, **não principal** | Tag | — | Clique no CTA | — | IMPLEMENTADO · sem ação de conversão criada, de propósito |
| `phone_click` | microação, **não principal** | Tag | — | Clique em `tel:` | — | idem |

**Regras que decorrem disto e que não se quebram:**

- **Uma só conversão principal**: o lead confirmado pela tag nativa. Qualificado
  e cliente ficam secundárias enquanto a importação não estiver validada.
- **Não importar o mesmo lead do GA4 e da tag nativa.** Se um dia houver
  importação de conversões a partir do GA4, o `generate_lead` da tag e o do GA4
  são o **mesmo** acontecimento; ter as duas como principais conta cada lead
  duas vezes e o Smart Bidding otimiza contra o dobro.
- **Cliques em WhatsApp e telefone nunca são conversões principais** e nunca
  entram num objetivo personalizado que os torne relevantes para os lances.
- **As mudanças no painel não enviam conversões pela sessão do administrador.**
  Quem muda o estado é o dono, dias depois, no browser dele: um evento dali
  atribuía a conversão à sessão do dono em `/admin/panel`.

### Os quatro estados de uma conversão offline

Não são a mesma coisa e a tabela `conversion_exports` guarda-os em separado:

| Estado | Significa |
|---|---|
| `queued` | Elegível (chegou ao estado e tem identificador de clique), ainda não saiu |
| `exported` | Saiu num CSV. **Ninguém sabe se foi carregado.** |
| `submitted` | Carregado no Google Ads — marcado à mão por quem o fez |
| `accepted` | O Google Ads confirmou a atribuição |
| `rejected` | Recusado (sem `gclid` válido, fora da janela, etc.) |

O CSV só é gerado **depois** de o registo ser escrito. Se o registo falhar, o
ficheiro não é produzido — para não haver uma exportação sem rasto que depois
seja importada duas vezes.

### Automatizar a importação — SEGUNDA FASE

Para uma integração **nova** de importação de conversões offline por API, o
caminho suportado pela Google é a **Data Manager API**. É o caminho a preparar;
não se deve presumir acesso a endpoints legados de importação.

**Não confundir com a Google Ads API**, que é outra coisa: serve para *ler*
campanhas, cliques, impressões e custo. As duas precisam de credenciais
diferentes e resolvem problemas diferentes:

| | Data Manager API | Google Ads API |
|---|---|---|
| Para quê | **Escrever** conversões offline e audiências | **Ler** campanhas, cliques, custo |
| Precisa neste projeto | Fase 2 (automatizar o que hoje é CSV) | Fase 2 (automatizar o custo) |
| Onde viveriam as credenciais | Secrets das Edge Functions do Supabase | idem |

Em ambos os casos: nunca em `VITE_*`.

**O nome da ação não chega para a API — só chega para o CSV.** O CSV de
importação manual aceita o nome tal como está escrito no Google Ads
(`VITE_GOOGLE_ADS_QUALIFIED_LEAD_ACTION` / `_CUSTOMER_CONVERSION_ACTION`,
hoje pendentes do dono). A Data Manager API identifica a ação por **recurso**,
não por nome: `customers/{id do cliente}/conversionActions/{ID numérico da
ação}` — precisa do `customer_id` (`920-786-3494`, já em `CLAUDE.md`, sem os
hífens no formato da API) e do **ID numérico** de cada ação de conversão
(visível em Google Ads → Objetivos → Conversões → a ação → coluna ID, não o
mesmo campo que o nome). Nenhum dos dois está recolhido; ficam para quando a
Fase 2 for mesmo construída, documentados aqui para não se apresentar "o nome
da ação" como configuração suficiente para a API.

---

## 7. WhatsApp e chamadas: o que medimos mesmo

O painel não sugere medição completa destes canais porque não a temos.

| Situação | O que está implementado | O que falta |
|---|---|---|
| **WhatsApp iniciado no site** | `whatsapp_click` no GA4 e em `quiz_events`, com `cta_location`, página, serviço e cidade | Saber se a conversa aconteceu. Acontece fora do site |
| **Chamada iniciada no site** | `phone_click`, igual | Saber se foi atendida, e por quanto tempo |
| **WhatsApp direto no anúncio** (extensão de mensagem / anúncio de clique-para-WhatsApp) | **Nada.** A pessoa nunca passa pelo site | Métricas de mensagem do Google Ads, dentro da conta. Nunca chegam ao site |
| **Chamada direta no anúncio** (extensão de chamada) | **Nada.** Idem | Conversões de chamada do Google Ads, com número de reencaminhamento, configuradas na conta |

**Disponível agora — IMPLEMENTADO:** registo manual de um contacto real no
painel (tabela `contact_log`): canal, data, nota, e associação opcional a um
lead existente. A associação é uma afirmação de uma pessoa que sabe que são a
mesma, nunca uma dedução a partir de um clique.

O painel mostra três colunas separadas por canal — **cliques no site**,
**contactos confirmados**, **leads** — que nunca se somam e nunca se transformam
umas nas outras, mais uma coluna de texto a dizer o que cada canal consegue
medir.

**Nunca:** atribuir uma conversa a uma campanha por suposição; transformar
`whatsapp_click` ou `phone_click` em `generate_lead`.

### Automatizar, sem contratar nada — SEGUNDA FASE

- **Chamadas:** conversões de chamada do Google Ads com número de
  reencaminhamento, configuradas na conta. Medem duração e atribuem à campanha
  sem software adicional. Limitação: o número apresentado passa a ser o de
  reencaminhamento.
- **WhatsApp:** o projeto interno `kyro-clean-solutions` já lê o WhatsApp via
  Evolution API e sincroniza conversas para `wa_conversations`. O passo que falta
  é ligar uma conversa a um lead por número de telefone e escrever em
  `contact_log` automaticamente. É trabalho no projeto interno, não aqui, e
  continua a não dar atribuição a campanha — só confirma que a conversa existiu.

---

## 8. Métricas: origem e fórmula

Todas as fórmulas estão em `METRIC_DEFINITIONS` (`src/lib/marketingMetrics.ts`)
e o painel publica-as numa tabela por baixo dos números, com a tabela de origem e
se dependem ou não de consentimento.

### Separações que o código impõe

| Não confundir | Porquê |
|---|---|
| Leads **operacionais** vs **observados** | Os primeiros existem sem cookies; os segundos não. Nunca no mesmo denominador |
| Contactos válidos vs cliques | Um clique não é uma conversa |
| Marcações vs serviços concluídos | Uma marcação pode ser cancelada |
| **Faturado** (`final_revenue`) vs **recebido** (`amount_received`) | Um orçamento aceite não é dinheiro em conta |
| `quoted_value` / `booked_value` / `final_revenue` / `amount_received` | Quatro momentos do mesmo dinheiro. Somá-los conta o serviço até quatro vezes |
| Leads vs mudanças de estado | O funil conta o **ponto mais alto atingido** por lead; um lead com nove mudanças continua a ser um lead |

### Denominadores

- `Taxa lead → cliente` = concluídos / leads **operacionais**. Não depende de
  consentimento nas duas pontas.
- `Conversão observada (landing)` = leads **observados** dessa landing / sessões
  dessa landing. As duas pontas vêm da mesma população consentida. O painel
  chama-lhe "conversão observada", nunca "taxa de conversão do site".
- `Cobertura` = leads observados / leads operacionais. É o número que diz quanto
  do negócio a medição está a ver.

O erro que isto evita: dividir *todos* os leads operacionais pelas sessões
*consentidas* dá uma taxa inflacionada, porque o numerador inclui pessoas que o
denominador nunca viu. Há um teste dedicado a esse caso.

### First touch e last touch

| | First touch | Last touch |
|---|---|---|
| Onde | `localStorage`, `kyro_first_touch_v1` | `sessionStorage`, `kyro_lead_attribution_v1` |
| Validade | **90 dias** | **30 minutos** de inatividade |
| É reescrito? | **Não**, enquanto for válido | Sim, sempre que aparece uma campanha nova |

**Regresso direto depois dos 30 minutos — TESTADO LOCALMENTE:** o last touch
**expira**. Passa a `(direct)` / `(none)` e o `gclid` desaparece — não fica a
creditar um anúncio que já não foi o motivo daquela visita. O **first touch
mantém-se** e continua a creditar a campanha original. Navegação interna dentro
dos 30 minutos não afeta nada.

**Os dois nunca são somados.** O agrupamento por campanha usa **last touch**, que
é o que o Google Ads credita por omissão e por isso o único reconciliável com o
relatório de lá. O first touch aparece no detalhe de cada lead, como segunda
leitura do mesmo lead — não como um segundo lead nem como uma segunda receita.

### Custo — CONFIG. EXTERNA PENDENTE

`costMetrics` devolve tudo a `null` com o motivo por escrito enquanto não houver
custos reais ligados. Além disso:

- recusa somar gastos em **moedas diferentes** e diz porquê;
- avisa quando o **período do gasto não cobre** o período dos leads;
- escreve sempre que **custo é por data do clique, leads por data do pedido e
  receita por data do serviço** — uma aproximação anunciada é utilizável, uma
  escondida não.

O ROAS usa **faturado**, não recebido: mede o desempenho da campanha, e o atraso
de um pagamento não é um problema do anúncio.

**Proposta para a fase 2, antes da API:** importar um relatório real do Google
Ads (CSV de campanha × dia), guardado com período, moeda e base temporal. A
prevenção de duplicação faz-se por chave `(campaign_id, dia)`. A estrutura
`AdSpendRow` já tem os campos.

---

## 9. Ambientes

`?kyro_debug=1` **só escreve no console**. Não autoriza envio nenhum.

Enviar fora de produção exige **duas** condições em simultâneo:

1. `VITE_TRACKING_ALLOW_NON_PRODUCTION=true`, escrito por alguém;
2. os identificadores **não** serem os de produção.

A segunda é a que importa: mesmo com a variável ligada por engano, não se envia
enquanto o `VITE_GA4_MEASUREMENT_ID` for `G-T45T5FBNC3`. Para testar a sério,
aponta-se para uma propriedade de teste.

Há uma configuração pronta em `.claude/launch.json` (`vite-dev-tracking-verify`)
que arranca o site com `G-VERIFY0000` / `AW-000000000`.

**"Apareceu no `dataLayer`" não é "foi recebido pelo GA4/Google Ads".** O que foi
verificado localmente é que o pedido HTTP saiu do browser para os domínios da
Google, com o conteúdo certo e sem dados pessoais. Se a Google aceitou, atribuiu
e registou é outra coisa, e só se vê nas contas — fica para a etapa controlada
depois da publicação autorizada.

**A validação com identificadores reais não inclui** criar conversões fictícias
em produção nem clicar nos próprios anúncios.

---

## 10. Final URL suffix — CONFIG. EXTERNA PENDENTE

Google Ads → Definições → Definições da conta → Opções de URL da campanha →
"Sufixo do URL final". 198 caracteres, dentro do limite de 300:

```
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&campaignid={campaignid}&adgroupid={adgroupid}&keyword={keyword}&matchtype={matchtype}&creative={creative}&device={device}&network={network}
```

- `utm_campaign={campaignid}` põe o **número** da campanha. O ValueTrack não tem
  `{campaignname}`.
- O **auto-tagging tem de ficar ligado**: é ele que fornece o `gclid`, que é o
  que liga as conversões offline ao clique. O sufixo não o substitui.
- Verificado em produção: o site aceita estes parâmetros sem redirecionamentos,
  sem perder o `canonical`, e o `gclid` **sobrevive** ao 301 da barra final.
- `keyword` é a palavra-chave **da conta**, não o termo de pesquisa. O termo vive
  só no Search Terms Report e nunca chega ao site.

---

## 11. Modelo de dados

| Tabela | O que guarda |
|---|---|
| `quiz_events` | Sessões, páginas vistas, cliques de contacto, passos do quiz. Ganhou colunas de campanha |
| `leads` | O pedido. Ganhou `lead_id`, `funnel_status`, valores e datas de pagamento |
| `lead_attribution` | Uma linha por lead: first touch, last touch, identificadores de clique, ValueTrack |
| `lead_status_history` | Cada mudança de estado, com autor (do servidor) e data |
| `lead_notifications` | Trinco de idempotência do canal de email. Só a chave de serviço |
| `contact_log` | Contactos reais registados à mão |
| `conversion_exports` | Conversões offline e o seu estado real |

Migração: `supabase/migrations/20260918000000_marketing_attribution.sql`.
**Aplicar colando no SQL Editor. Nunca `supabase db push`.**

### Falhas não ficam escondidas — IMPLEMENTADO

| Falha | O que acontece |
|---|---|
| Coluna em falta em `quiz_events` (`PGRST204`) | O evento é reenviado sem essa coluna; a entrega continua. **Regista um aviso** e conta como atribuição descartada |
| Tabela em falta (`lead_attribution`, `contact_log`, …) | Cada leitura do painel falha **por si**; o resto aparece na mesma, com um aviso vermelho a dizer qual tabela e a sugerir a migração |
| Canal do CRM em baixo | O pedido chega por email; o painel mostra o número de falhas das últimas 24h e avisa que os números estão incompletos |
| Atribuição não gravada | O lead **não** falha. O lead aparece sem origem e conta na Cobertura |
| Sem dados vs zero | Cartões com valor real mostram o número; métricas indisponíveis mostram "Não disponível" com o motivo |

O fallback do `PGRST204` protege a disponibilidade e **não** pode ser lido como
"a atribuição está saudável": é por isso que o cartão de Cobertura existe e que o
aviso é escrito.

---

## 12. O que continua por fazer

- **Gasto publicitário** (fase 2): sem ligação. CPL/CPA/CAC/ROAS indisponíveis.
- **Importação offline por API** (fase 2): hoje é CSV + registo manual de estado.
  O caminho é a Data Manager API.
- **Confirmação automática de conversas e chamadas** (fase 2).
- **Envio server-side dos eventos de funil**: o `ga_client_id` é guardado com
  cada lead precisamente para isso; falta um API secret do GA4 e uma função.
- **Papéis de administração**: não existe autenticado sem privilégios.
- **Instrumentação do abandono do quiz**: problema conhecido de antes,
  ~90% das desistências não são medidas.

---

## 13. Validado em produção (2026-09-23)

Percorrido em `cleansolutions.com.pt` com `?kyro_debug=1`, consola e
`performance.getEntriesByType('resource')` abertos, antes e depois de aceitar
as cookies. O que se viu, e só isso:

**Antes de aceitar:** nenhum pedido para a Google, para a Meta ou para o
Supabase. O `dataLayer` tem só o `consent default` a `denied`. Os eventos
(`page_view`, `web_vitals`) aparecem na consola com `willSend: false` e ficam
por aí.

**Depois de aceitar, por esta ordem:**

| O quê | Evidência |
|---|---|
| Uma só `gtag.js`, pelo `G-` | `googletagmanager.com/gtag/js?id=G-T45T5FBNC3`; o Ads entra a seguir por `config` (`gtag/js?id=AW-18457115875&cx=c`), não como segundo script. `GT-M6XTKMC7` e `AW-17779872363` não aparecem no bundle. |
| `consent update` com os 4 sinais a `granted` | `dataLayer`: `consent:default`, `js`, `config:G-`, `config:AW-`, `consent:update`, `event:page_view`. Um só `page_view`. |
| GA4 a receber | `region1.analytics.google.com/g/collect?tid=G-T45T5FBNC3`; cookies `_ga` e `_ga_T45T5FBNC3` criados. |
| Google Ads a receber | `googleads.g.doubleclick.net/pagead/viewthroughconversion/18457115875/`, `google.com/ccm/collect`, listas de remarketing (`pagead/1p-user-list`, servido também por `google.dk`, que é o caso que o `img-src https:` cobre); cookies `_gcl_au` e `_gcl_aw`. |
| Pixel da Meta a receber | `connect.facebook.net/en_US/fbevents.js`, `signals/config/1083307767504397`, `facebook.com/tr/?id=1083307767504397&ev=PageView`; cookie `_fbp`. `window.fbq` é função e a fila está vazia (tudo entregue). |
| Painel interno a receber | `POST kswapioiaetfccxzfwkg.supabase.co/rest/v1/quiz_events` aceite: zero eventos `kyro_event_v2:*` a sobrar no `localStorage`, nenhum aviso `PGRST204` na consola. Prova que a migração `20260918000000` (CHECK com `page_view`) e a `20260922000000` (colunas `meta_*`) estão aplicadas. |
| CSP | Nenhuma violação na consola, nem do cabeçalho bloqueador nem do de relatório. |

**O que continua por validar em produção:** o formulário até à `/obrigado`
(`generate_lead`, `Lead` da Meta, `submit-lead`), e a **conversão do Google
Ads**, que não pode ser validada porque a etiqueta não existe: o bundle de
produção não contém nenhum `AW-18457115875/<etiqueta>`, logo
`sendAdsConversion` devolve `false` em cada lead. Depende de B4 no
`docs/tracking-plano-de-publicacao.md` (criar a ação de conversão no Google Ads
e pôr `VITE_GOOGLE_ADS_LEAD_CONVERSION_LABEL` no Cloudflare Pages). O painel
avisa em Métricas → Estado da recolha e em Marketing enquanto faltar.

**Atualização 24/09/2026: etiqueta instalada.** A ação "Pedido confirmado
(website)" (ID de tipo 7776203701) já existia desde 18/09; a etiqueta
`ewA0CLXn_fscEOP5hOFE` foi copiada do fragmento do evento e ficou como valor por
omissão em `src/constants/tracking.ts` (é pública, como o `AW-`), por isso já
não depende de configurar nada no Cloudflare. No Google Ads, a ação passou de
secundária a **principal** e o objetivo "Enviar formulários de leads" passou a
**predefinição da conta** (3 de 3 campanhas), confirmado com recarregamento.
Falta a validação em produção com um pedido real.

**Clique no WhatsApp como conversão principal: decisão do dono (24/09/2026).**
"WhatsApp - clique no site" (importação do GA4, objetivo predefinido
"Contactos") fica **principal** de propósito: é onde a maioria das pessoas
clica e onde o lead chega já aquecido, e cerca de 85-90% dos pedidos vêm por
WhatsApp. Isto substitui, só para o WhatsApp, a regra de que os cliques de
contacto são microações fora dos lances. **Não voltar a sugerir passá-la a
secundária.** Consequência a ter presente ao ler os números: a coluna
"Conversões" do Google Ads soma cliques no WhatsApp e pedidos confirmados, que
não são a mesma coisa; o painel interno continua a separá-los. O `phone_click`
não está importado no Google Ads.

**Defeito corrigido na mesma passagem:** cinco âncoras `tel:` (rodapé PT e EN,
hero mobile, CTA final, página 404) ainda tinham `onClick={() =>
trackCallClick(…)}` por cima do delegado global. O helper não passava o evento
original, a guarda de deduplicação não o via, e cada clique nesses cinco saía a
dobrar para o GA4 (`phone_click`), para a Meta (`PhoneClick`) e para
`quiz_events` (`call_click`), com duas origens diferentes (`footer`/`footer`,
`hero_mobile`/`page:/`). Passaram a `data-tracking-source`, `trackCallClick`
foi removido de `analytics.ts`, e `src/lib/contactCtaDelegation.test.ts`
rebenta se um componente voltar a chamar um medidor de contacto.

