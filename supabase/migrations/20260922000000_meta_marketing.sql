-- Additive; apply this migration only, after 20260918010000_admin_authorization.
-- No historical attribution is inferred or overwritten.
begin;
alter table public.lead_attribution
  add column if not exists fbclid text,
  add column if not exists meta_campaign_id text,
  add column if not exists meta_adset_id text,
  add column if not exists meta_ad_id text,
  add column if not exists meta_placement text,
  add column if not exists attribution_method text;
alter table public.quiz_events
  add column if not exists meta_campaign_id text,
  add column if not exists meta_adset_id text,
  add column if not exists meta_ad_id text,
  add column if not exists meta_placement text;

create table if not exists public.ad_spend_daily (
  platform text not null check (platform in ('google','meta')),
  spend_date date not null,
  amount numeric(12,2) not null check (amount >= 0 and amount <> 'NaN'::numeric),
  updated_at timestamptz not null default now(),
  primary key (platform, spend_date)
);
alter table public.ad_spend_daily enable row level security;
revoke all on public.ad_spend_daily from public, anon, authenticated;
grant select, insert, update on public.ad_spend_daily to authenticated;
drop policy if exists "Admin spend" on public.ad_spend_daily;
create policy "Admin spend" on public.ad_spend_daily for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- A confirmed conversation outside the website is entered explicitly, never
-- generated from a click. The request UUID makes retries idempotent.
create or replace function public.register_marketing_lead(
  request_id uuid, platform text, customer_name text, customer_phone text,
  service_name text, locality text, campaign text, contact_channel text, evidence text
) returns uuid language plpgsql security definer set search_path = public as $$
declare row_id uuid; opaque_id text := 'L-manual-' || request_id::text;
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  if request_id is null or platform is null or contact_channel is null or platform not in ('google','meta') or contact_channel not in ('whatsapp','phone','email','other')
    or nullif(trim(customer_name),'') is null or nullif(trim(service_name),'') is null
    or nullif(trim(evidence),'') is null then raise exception 'Invalid fields'; end if;
  if length(customer_name)>150 or length(customer_phone)>40 or length(service_name)>150
    or length(locality)>150 or length(campaign)>250 or length(evidence)>2000 then raise exception 'Fields too long'; end if;
  insert into public.leads (lead_id,name,phone,service,location,source,funnel_status,notes)
    values (opaque_id,trim(customer_name),trim(customer_phone),trim(service_name),trim(locality),platform || '_manual','NEW',evidence)
    on conflict (lead_id) where lead_id is not null do nothing returning id into row_id;
  if row_id is null then select id into row_id from public.leads where lead_id=opaque_id; return row_id; end if;
  insert into public.lead_attribution (lead_id,lead_row_id,channel,last_source,last_medium,last_campaign,is_paid,attribution_method)
    values (opaque_id,row_id,contact_channel,case when platform='meta' then 'meta' else 'google' end,
      case when platform='meta' then 'paid_social' else 'cpc' end,nullif(trim(campaign),''),true,'manual');
  insert into public.contact_log (lead_row_id,channel,direction,note) values (row_id,contact_channel,'inbound',evidence);
  return row_id;
end $$;
revoke all on function public.register_marketing_lead(uuid,text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.register_marketing_lead(uuid,text,text,text,text,text,text,text,text) to authenticated;

-- Keep the status and its dated history in one transaction, including retries.
create or replace function public.set_marketing_lead_status(row_id uuid, next_status text)
returns void language plpgsql security definer set search_path = public as $$
declare previous text; opaque_id text;
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  if next_status is null or next_status not in ('NEW','VALID','QUALIFIED','QUOTED','BOOKED','COMPLETED','INVALID','LOST','CANCELLED') then raise exception 'Invalid status'; end if;
  select funnel_status,lead_id into previous,opaque_id from public.leads where id=row_id for update;
  if not found then raise exception 'Lead not found'; end if;
  if previous is not distinct from next_status then return; end if;
  update public.leads set funnel_status=next_status,
    completed_at=case when next_status='COMPLETED' then coalesce(completed_at,now()) else completed_at end where id=row_id;
  insert into public.lead_status_history(lead_row_id,lead_id,previous_status,new_status)
    values(row_id,opaque_id,previous,next_status);
end $$;
revoke all on function public.set_marketing_lead_status(uuid,text) from public, anon;
grant execute on function public.set_marketing_lead_status(uuid,text) to authenticated;
commit;
