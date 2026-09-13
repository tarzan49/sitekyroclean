-- Nova aba "CRM" do admin panel (2026-09-11): livro de registo dos pedidos
-- de serviço já realizados, organizado por mês, para o Francisco cruzar com
-- os relatórios mensais (faturado vs. o que fica de cut após split com
-- parceiro fora do Porto, e o que ainda está por cobrar). Substitui a antiga
-- aba "CRM" (gestão de leads em AdminDashboard.tsx, que fica arquivada sem
-- uso, não apagada).
--
-- Dados internos, não públicos como `leads` — sem policy de `anon`, mesmo
-- padrão de `wa_conversations` (ver 20260910000000_add_whatsapp_conversations.sql).

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  request_date date not null,
  description text not null default '',
  billed_value numeric not null default 0,
  my_cut numeric not null default 0,
  paid boolean not null default false,
  locality text not null check (locality in ('Porto','Lisboa','Algarve')),
  phone text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_service_requests_date on public.service_requests(request_date);

alter table public.service_requests enable row level security;
drop policy if exists "Authenticated can select service_requests" on public.service_requests;
drop policy if exists "Authenticated can insert service_requests" on public.service_requests;
drop policy if exists "Authenticated can update service_requests" on public.service_requests;
drop policy if exists "Authenticated can delete service_requests" on public.service_requests;
create policy "Authenticated can select service_requests" on public.service_requests for select to authenticated using (true);
create policy "Authenticated can insert service_requests" on public.service_requests for insert to authenticated with check (true);
create policy "Authenticated can update service_requests" on public.service_requests for update to authenticated using (true);
create policy "Authenticated can delete service_requests" on public.service_requests for delete to authenticated using (true);
