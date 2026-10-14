-- Procedimento de cada serviço (dono, 2026-10-14): a equipa fica com 50% só com
-- fotografia de antes, fotografia de depois, vídeo e avaliação Google de 4 ou 5
-- estrelas; falta uma coisa = 45% (regra em revisão a 14/10 à noite: vive em
-- procedurePay, src/lib/serviceProcedure.ts). O cliente tem 7 dias depois do
-- serviço para avaliar; no fim do 7.º dia o procedimento fecha.
--
-- Uma linha por serviço do calendário do dono. Quando o serviço acaba, o
-- servidor do bot manda a cada pessoa da equipa uma mensagem; a equipa responde
-- a ESSA mensagem com as fotografias e o vídeo (resposta citada), e o bot
-- guarda aqui os ids das mensagens do WhatsApp e a hora. A avaliação vem de
-- google_reviews.service_request_id; não se copia para aqui.
--
-- calendar_event_id é a chave: o serviço acaba antes de o CRM ter a linha (o
-- CRM só cria linhas com o painel aberto). service_request_id liga-se logo que
-- a linha do CRM exista (bot-api, ação procedure-due).
--
-- status é o último estado escrito pelas contas da noite (em_curso, completo,
-- fechado) e closed_at quando fechou; o CRM e as contas voltam a calcular o
-- estado a partir dos dados (uma avaliação ligada tarde corrige a conta).
-- penalty_paid: os 5% de um serviço já pago foram pagos à parte.
--
-- Aplicar com `supabase db query --linked -f` ou no SQL Editor, nunca `db push`.

begin;

create table if not exists public.service_procedure (
  calendar_event_id text primary key,
  service_request_id uuid unique references public.service_requests(id) on delete set null,
  team text not null,
  service_day date not null,
  prompt_msg_ids text[] not null default '{}',
  prompted_at timestamptz,
  before_msg_id text,
  before_at timestamptz,
  after_msg_id text,
  after_at timestamptz,
  video_msg_id text,
  video_at timestamptz,
  reminders_sent smallint not null default 0,
  last_reminder_at timestamptz,
  status text not null default 'em_curso' check (status in ('em_curso','completo','fechado')),
  closed_at timestamptz,
  penalty_paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_procedure_day_idx on public.service_procedure (service_day);
create index if not exists service_procedure_prompts_idx on public.service_procedure using gin (prompt_msg_ids);

revoke all on public.service_procedure from public, anon, authenticated;
grant select, insert, update, delete on public.service_procedure to authenticated;
alter table public.service_procedure enable row level security;
drop policy if exists "Admin service_procedure" on public.service_procedure;
create policy "Admin service_procedure" on public.service_procedure for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

commit;
