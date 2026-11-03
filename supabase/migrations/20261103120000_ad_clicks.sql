-- Cliques dos anúncios do Google ligados aos serviços fechados (dono, 2026-11-03:
-- "o google anda a otimizar coisas sem sentido"). Quem vem de um anúncio leva na
-- mensagem do WhatsApp um código curto ("ref. K7F2Q"); o site regista aqui o código
-- com o identificador do clique (gclid/gbraid/wbraid), sem guardar nada no telemóvel
-- da pessoa. O export das conversas do servidor do bot lê o código da primeira
-- mensagem e grava-o em whatsapp_conversations.ad_ref. A função
-- ads-conversions-feed junta telefone → código → clique e entrega ao Google Ads os
-- fechos reais, com o valor "para ti".
-- Aplicar com `supabase db query --linked -f`, nunca `db push`.
begin;
create table if not exists public.ad_clicks (
  ref text primary key check (ref ~ '^[A-HJ-NP-Z2-9]{5}$'),
  gclid text,
  gbraid text,
  wbraid text,
  page text,
  created_at timestamptz not null default now()
);
create index if not exists ad_clicks_created_idx on public.ad_clicks (created_at);
revoke all on public.ad_clicks from public, anon, authenticated;
grant select on public.ad_clicks to authenticated;
alter table public.ad_clicks enable row level security;
drop policy if exists "Admin read ad_clicks" on public.ad_clicks;
create policy "Admin read ad_clicks" on public.ad_clicks for select to authenticated
  using (public.is_admin());

alter table public.whatsapp_conversations add column if not exists ad_ref text;
commit;
