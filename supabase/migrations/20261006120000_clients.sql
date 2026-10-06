-- Fichas de clientes (dono, 2026-10-06). Aditiva; aplica-se colando no SQL
-- Editor (sétima armadilha do CLAUDE.md: nunca `supabase db push`).
--
-- Uma linha por contacto do WhatsApp Business com etiqueta (os que fecharam,
-- os por marcar e os não interessados), para o dono mandar mensagens
-- diferentes a cada tipo de pessoa no Natal, na Black Friday, etc. Fica à
-- parte do CRM de vendas (service_requests): os serviços de cada cliente leem-se
-- de lá pelo telefone, no painel, e não se copiam para aqui.
--
-- status: estado da etiqueta do WhatsApp, por ordem de força: cliente
--   (Concluído / Deu Avaliação), marcado, por_marcar, nao_interessado,
--   sem_estado (só etiquetas de artigo ou região, ou nenhuma).
-- labels: os nomes das etiquetas tal como vieram, para segmentos que o status
--   não cobre.
-- name: o nome escolhido pelo dono no painel; whatsapp_name é o que o contacto
--   tem no WhatsApp e volta a ser escrito em cada importação.

begin;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  whatsapp_name text,
  status text not null default 'sem_estado'
    check (status in ('cliente','marcado','por_marcar','nao_interessado','sem_estado')),
  services text[] not null default '{}',
  region text,
  from_google_ads boolean not null default false,
  reviewed_google boolean not null default false,
  labels text[] not null default '{}',
  first_contact_at timestamptz,
  last_contact_at timestamptz,
  last_client_message_at timestamptz,
  notes text,
  source text not null default 'WhatsApp',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_status_idx on public.clients (status);
create index if not exists clients_region_idx on public.clients (region);

revoke all on public.clients from public, anon, authenticated;
grant select, insert, update, delete on public.clients to authenticated;
alter table public.clients enable row level security;
drop policy if exists "Admin clients" on public.clients;
create policy "Admin clients" on public.clients for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.clients_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists clients_touch_updated_at on public.clients;
create trigger clients_touch_updated_at before update on public.clients
  for each row execute function public.clients_touch_updated_at();

commit;
