-- Disposable local database only. Transaction rolls back all fixture data.
begin;
insert into public.admin_users(user_id) values ('00000000-0000-0000-0000-000000000022') on conflict do nothing;
set role anon;
do $$ begin
  begin perform public.register_marketing_lead('00000000-0000-0000-0000-000000000123','meta','Test','','Sofas','','Campaign','whatsapp','confirmed'); raise exception 'anon allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set role authenticated;
set request.jwt.claims='{"sub":"00000000-0000-0000-0000-000000000023"}';
do $$ begin
  begin perform public.register_marketing_lead('00000000-0000-0000-0000-000000000123','meta','Test','','Sofas','','Campaign','whatsapp','confirmed'); raise exception 'nonadmin allowed'; exception when insufficient_privilege then null; end;
  begin insert into public.ad_spend_daily values('meta','2026-09-22',5,now()); raise exception 'nonadmin spend allowed'; exception when insufficient_privilege then null; end;
end $$;
set request.jwt.claims='{"sub":"00000000-0000-0000-0000-000000000022"}';
do $$ declare a uuid; b uuid; n integer; begin
  a := public.register_marketing_lead('00000000-0000-0000-0000-000000000123','meta','Test','','Sofas','','Campaign','whatsapp','confirmed');
  b := public.register_marketing_lead('00000000-0000-0000-0000-000000000123','meta','Test','','Sofas','','Campaign','whatsapp','confirmed');
  if a is distinct from b then raise exception 'duplicate created'; end if;
  select count(*) into n from public.contact_log where lead_row_id=a; if n<>1 then raise exception 'duplicate contact'; end if;
  if not exists(select 1 from public.lead_attribution where lead_row_id=a and attribution_method='manual' and last_source='meta' and gclid is null) then raise exception 'wrong attribution'; end if;
  perform public.set_marketing_lead_status(a,'QUALIFIED');
  perform public.set_marketing_lead_status(a,'QUALIFIED');
  perform public.set_marketing_lead_status(a,'COMPLETED');
  select count(*) into n from public.lead_status_history where lead_row_id=a; if n<>2 then raise exception 'wrong history count'; end if;
  if not exists(select 1 from public.leads where id=a and completed_at is not null and funnel_status='COMPLETED') then raise exception 'status not saved'; end if;
  begin perform public.set_marketing_lead_status(a,'FAKE'); raise exception 'invalid status allowed'; exception when raise_exception then if sqlerrm='invalid status allowed' then raise; end if; end;
end $$;
insert into public.ad_spend_daily(platform,spend_date,amount) values('meta','2026-09-22',5) on conflict(platform,spend_date) do update set amount=excluded.amount;
do $$ begin
 begin insert into public.ad_spend_daily(platform,spend_date,amount) values('google','2026-09-22',-1); raise exception 'negative spend allowed'; exception when check_violation then null; end;
end $$;
rollback;
select 'META MARKETING PERMISSIONS AND IDEMPOTENCY PASSED' as result;
