-- Número de WhatsApp de quem mandou o código do pedido ("Acabei de enviar o
-- pedido #XXXX"). Pode não ser o telefone escrito no questionário, e o
-- serviço entra no CRM com o número do WhatsApp: sem isto, o fecho não se liga
-- ao pedido (ver src/lib/crmQuizLeads.ts). Preenchido a partir da leitura do
-- WhatsApp Web, como a tabela clients. Aplicado com `supabase db query
-- --linked -f`, nunca com `db push` (sétima armadilha do CLAUDE.md).
alter table public.leads add column if not exists whatsapp_phone text;
