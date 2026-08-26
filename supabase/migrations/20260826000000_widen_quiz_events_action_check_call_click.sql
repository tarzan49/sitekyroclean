-- Same trap as 20260820000000: quiz_events.action has a CHECK constraint. Adding
-- trackCallClick() Supabase logging (src/lib/quizTracking.ts) without widening this
-- constraint would silently reject every 'call_click' insert, exactly like
-- whatsapp_click/session_time did before the previous migration.
alter table public.quiz_events drop constraint if exists quiz_events_action_check;
alter table public.quiz_events add constraint quiz_events_action_check
  check (action in ('start', 'complete', 'abandon', 'whatsapp_click', 'session_time', 'call_click'));
