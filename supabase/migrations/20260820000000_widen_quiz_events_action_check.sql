-- BUG FIX: quiz_events.action had a CHECK constraint from the original migration
-- (20240101_admin_tables.sql) that only allowed 'start' | 'complete' | 'abandon'.
-- trackWhatsAppClick() and trackSessionTime() (src/lib/quizTracking.ts) insert
-- 'whatsapp_click' and 'session_time' respectively, added later without updating
-- this constraint. Every insert of those two event types was silently rejected
-- by Postgres, so "Clicks WhatsApp" and "Tempo médio no site" always read 0 in
-- the admin panel. The client swallows insert errors (fire-and-forget tracking),
-- so this failure was invisible until now.
alter table public.quiz_events drop constraint if exists quiz_events_action_check;
alter table public.quiz_events add constraint quiz_events_action_check
  check (action in ('start', 'complete', 'abandon', 'whatsapp_click', 'session_time'));
