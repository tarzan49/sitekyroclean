-- CRM ligado ao Google Calendar (2026-09-26). Aditiva; aplica-se colando no
-- SQL Editor (sétima armadilha do CLAUDE.md: nunca `supabase db push`).
--
-- O dono marca cada serviço fechado como evento no calendário
-- ("Serviço 70€ (140€) descrição - telefone - nome - morada") e depois
-- passava-o à mão para o CRM. O separador CRM passa a ler os eventos novos pela
-- função `calendar-events` e a criar as linhas sozinho.
--
-- booked_at: quando o serviço foi fechado. Para linhas vindas do calendário é a
--   data de criação do evento; para linhas metidas à mão, o momento em que
--   entram no CRM. É a base do separador "Fechos" (fechos por dia da semana).
--   O default é posto DEPOIS da coluna existir: `add column ... default now()`
--   preenchia as 158 linhas antigas com a data de hoje, e o separador Fechos
--   mostraria todo o histórico como fechado num sábado.
-- calendar_event_id: id do evento no Google Calendar. Único, para uma segunda
--   sincronização (ou dois separadores abertos) nunca duplicar um serviço.
-- calendar_updated_at: última alteração do evento já aplicada à linha. Uma
--   edição no CRM mantém-se até o evento voltar a ser editado no calendário.
-- calendar_missing_since: o evento deixou de existir no calendário. A linha
--   não é apagada: pode ter sido um feed incompleto, e um serviço cancelado
--   decide-se no CRM.
-- needs_review: motivo pelo qual uma linha criada a partir do calendário
--   precisa de ser vista (região por identificar, parte maior que o
--   faturado). Limpo quando a linha é guardada no formulário.
-- locality deixa de ser obrigatória: sem código postal nem cidade conhecida,
--   uma região adivinhada entrava nos totais por localidade sem ninguém dar
--   por isso. Fica vazia e marcada para rever.

begin;

alter table public.service_requests
  add column if not exists booked_at timestamptz,
  add column if not exists calendar_event_id text,
  add column if not exists calendar_updated_at timestamptz,
  add column if not exists calendar_missing_since timestamptz,
  add column if not exists needs_review text;

alter table public.service_requests alter column booked_at set default now();
alter table public.service_requests alter column locality drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'service_requests_calendar_event_id_key'
      and conrelid = 'public.service_requests'::regclass
  ) then
    alter table public.service_requests
      add constraint service_requests_calendar_event_id_key unique (calendar_event_id);
  end if;
end $$;

create index if not exists idx_service_requests_booked_at
  on public.service_requests (booked_at);

commit;
