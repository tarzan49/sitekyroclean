-- Avaliações do Google, uma linha por avaliação das duas fichas (dono,
-- 2026-10-14: "no CRM quero uma aba se o serviço teve ou não avaliação" e
-- "mensalmente, se as avaliações estão a crescer"). Aplica-se com
-- `supabase db query --linked -f` ou no SQL Editor, nunca `db push`.
--
-- review_id: o id da avaliação no Perfil da Empresa (estável).
-- profile: 'porto' (Kyro Clean Solutions) ou 'lisboa' (Kyro Clean Solutions Lisboa).
-- reviewed_at: a data exata que o Google guarda (não a relativa, "há 2 semanas").
-- service_request_id: o serviço do CRM a que a avaliação pertence, quando se
--   sabe; um serviço "teve avaliação" quando há uma linha a apontar para ele.
-- excluded: avaliações que não contam (da equipa ou da família), com o motivo.
--
-- Não há API: as linhas entram pela leitura da página de avaliações do Perfil
-- da Empresa (upsert por review_id) ou à mão, no CRM.

begin;

create table if not exists public.google_reviews (
  review_id text primary key,
  profile text not null check (profile in ('porto','lisboa')),
  author text not null,
  stars smallint not null check (stars between 1 and 5),
  reviewed_at timestamptz not null,
  service_request_id uuid references public.service_requests(id) on delete set null,
  excluded text,
  created_at timestamptz not null default now()
);

create index if not exists google_reviews_reviewed_at_idx on public.google_reviews (reviewed_at);
create index if not exists google_reviews_service_idx on public.google_reviews (service_request_id);

revoke all on public.google_reviews from public, anon, authenticated;
grant select, insert, update, delete on public.google_reviews to authenticated;
alter table public.google_reviews enable row level security;
drop policy if exists "Admin google_reviews" on public.google_reviews;
create policy "Admin google_reviews" on public.google_reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

commit;
