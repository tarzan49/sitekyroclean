-- Certificados de impermeabilização (dono, 2026-10-27). Aplica-se com
-- `supabase db query --linked -f` ou no SQL Editor, nunca `db push`.
--
-- Um certificado por serviço do CRM, com um número que não muda
-- (KYRO-IMP-AAAAMMDD-NN, por dia do serviço): se o cliente o pedir outra vez,
-- sai o mesmo. Escrito pela bot-api `certificate` (chave de serviço) ou à mão;
-- o painel só lê. O PDF é feito no servidor do bot e não fica aqui.

begin;

create table if not exists public.waterproofing_certificates (
  number text primary key check (number ~ '^KYRO-IMP-[0-9]{8}-[0-9]{2,}$'),
  service_request_id uuid unique references public.service_requests(id) on delete set null,
  service_date date not null,
  tier text not null check (tier in ('premium', 'essencial')),
  client_name text not null,
  items text not null,
  place text,
  team text,
  issued_by text not null default 'bot',
  issued_at timestamptz not null default now()
);

revoke all on public.waterproofing_certificates from public, anon, authenticated;
grant select on public.waterproofing_certificates to authenticated;
alter table public.waterproofing_certificates enable row level security;
drop policy if exists "Admin read waterproofing_certificates" on public.waterproofing_certificates;
create policy "Admin read waterproofing_certificates" on public.waterproofing_certificates for select to authenticated
  using (public.is_admin());

commit;
