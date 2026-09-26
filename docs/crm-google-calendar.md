# CRM ligado ao Google Calendar

Desde 26/09/2026 o separador **CRM** do painel admin cria sozinho as linhas dos
serviços que o dono marca no Google Calendar, e tem uma aba **Fechos** com os
serviços fechados por dia da semana.

## Como funciona

1. O dono marca cada serviço fechado como evento no calendário, sempre no mesmo
   formato:

   ```
   Serviço 70€ (140€) Limpeza de sofá de 3 lugares - +351 9xx xxx xxx - Nome - Rua …, 2835-683 Localidade
   ```

   O primeiro valor é a parte dele e o valor entre parênteses é o faturado. Sem
   parênteses, os dois são iguais. `Limpeza 50€ (99€) …` também conta.
   Lembretes ("Ligar …", "Follow up …") e eventos pessoais são ignorados.
2. Ao abrir o separador CRM (e no botão **Sincronizar calendário**), o painel
   chama a função Edge `calendar-events`, que lê o feed iCal secreto do
   calendário e devolve os eventos criados desde `CALENDAR_SYNC_SINCE`.
3. `src/lib/calendarServices.ts` transforma cada evento de serviço numa linha
   do CRM (descrição, cliente, telefone, cidade, região, valores) e
   `src/lib/calendarSync.ts` decide o que inserir, atualizar ou marcar.

Não há nenhuma tarefa agendada no servidor: o `pg_net` não está ativo e a
região precisa dos dados das freguesias do site. As linhas aparecem quando
alguém abre o CRM. A data de fecho vem da criação do evento, por isso sincronizar
mais tarde não muda nenhuma estatística.

## Regras

- **Data de fecho (`booked_at`) = criação do evento no calendário.** Linhas
  metidas à mão: o momento em que entram no CRM, editável no formulário.
  `request_date` continua a ser o dia do serviço.
- **Eventos criados antes de 26/09/2026 às 15:00 UTC não são importados**: já
  estavam no CRM, passados à mão.
- **Sem duplicados**: cada linha guarda o id do evento (`calendar_event_id`,
  único na base de dados).
- **Ganha a edição mais recente.** Editar a linha no CRM mantém-se até o evento
  voltar a ser editado no calendário. O "pago" e a origem nunca são tocados
  pela sincronização.
- **Nunca se apaga nada sozinho.** Um evento apagado ou cancelado (ou que deixou
  de começar por "Serviço") marca a linha como *Apagado no calendário*. O dono
  apaga-a no CRM ou carrega em **Manter**, que a desliga do calendário. Se o
  evento voltar, a marca sai sozinha. Um feed vazio é recusado pela função, para
  um erro da Google não marcar tudo como apagado.
- **Região**, por esta ordem: código postal; cidades que o dono já escreveu no
  CRM (é assim que "Antas" dá Porto, apesar de haver uma freguesia Antas no
  Minho); concelhos do catálogo (`area` em `serviceCatalog.ts`); freguesias de
  `freguesiaSeoData.ts`. Uma região deduzida só pela freguesia, ou uma região
  por identificar, fica marcada **Rever**. Guardar a linha no formulário dá-a
  como revista, e a correção passa a valer para os eventos seguintes.
- **Parte maior que o faturado** também fica marcada Rever: é quase sempre os
  valores trocados.

## Configuração

- Secret **`GOOGLE_CALENDAR_ICS_URL`** no Supabase (Project Settings → Edge
  Functions → Secrets): o "Endereço secreto no formato iCal" do calendário
  principal (Google Calendar → Definições → o calendário → Integrar calendário).
  Quem tem este endereço lê o calendário inteiro. Se for reposto na Google, a
  secret tem de ser atualizada, senão o CRM mostra "Google Calendar por ligar".
- A função publica-se à parte do site:
  `npx supabase functions deploy calendar-events`. Só responde a contas de
  `admin_users` (mesma verificação do `list-resend-leads`, agora em
  `supabase/functions/_shared/admin-request.ts`).
- Migração `supabase/migrations/20260926000000_calendar_sync.sql`: aplica-se
  pelo SQL Editor (ou `supabase db query --linked -f`), nunca `db push`.
  O default `now()` do `booked_at` é posto depois de a coluna existir, para as
  linhas antigas não ficarem todas com a data da migração.

## Histórico das datas de fecho (26/09/2026)

As 158 linhas que já existiam receberam a data de fecho a partir do calendário,
emparelhadas por dia do serviço, valores, telefone, nome e cidade: 125 com a
criação do evento, 4 (metidas à mão sem evento) com a data de entrada no CRM.
Ficaram sem data 29: as 26 das notas manuscritas de agosto e setembro, e 3
linhas da importação de 11/09 sem evento correspondente. A aba Fechos diz
quantas ficam de fora. O SQL do emparelhamento não está no repositório porque
tem dados de clientes.

## Testes

`calendarServices.test.ts`, `calendarSync.test.ts`, `crmClosings.test.ts` (Vitest)
e `supabase/functions/_shared/ics.test.ts` (Deno). **Só dados inventados:** o
repositório é público. O parser foi afinado contra os 165 eventos reais de julho
a outubro, numa pasta temporária fora do repositório.
