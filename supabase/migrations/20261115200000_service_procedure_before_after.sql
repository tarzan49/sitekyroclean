-- O antes e depois que o bot enviou ao cliente com o pedido de avaliação (dono, 15 Nov 2026, Sharles).
-- Os ids são das mensagens da equipa (fotografias) e da mensagem enviada ao cliente; com
-- service_request_id dá a ligação à avaliação Google desse cliente (galerias do site).
alter table public.service_procedure
  add column if not exists before_after_before_msg_id text,
  add column if not exists before_after_after_msg_id text,
  add column if not exists before_after_sent_msg_id text,
  add column if not exists before_after_sent_at timestamptz;
