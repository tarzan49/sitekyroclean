-- Etiquetas do WhatsApp Business (Lead, Porto, Sofá, ...) por conversa —
-- é o sinal usado do lado do kyro-clean-solutions para só sincronizar
-- conversas de negócio (o WhatsApp ligado é o número pessoal do Francisco;
-- contactos sem etiqueta são família/amigos). Mostra as tags no admin panel.
alter table public.wa_conversations add column if not exists labels jsonb not null default '[]'::jsonb;
