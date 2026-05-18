# Contexto: Kyro Clean Solutions — Retomar trabalho

## Projeto
Site React/TypeScript de landing + quiz de orçamento para empresa de 
limpeza de estofos ao domicílio em Portugal (Norte e Centro).
- WhatsApp: 351925530647
- Email: cleansolutions.pt25@gmail.com
- Domínio: cleansolutions.com.pt / www.cleansolutions.pt

## Stack
React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + 
react-i18next + Supabase (PostgreSQL CRM) + Formspree + React Router
Raiz: C:\Users\im a god bruh\Downloads\Pasta dos projetos\spotless-pro-flow-main\

## Design Tokens
- Gold: #D4AF37 / Tailwind: text-gold, bg-gold, border-gold
- Dark bg: #12121e / Modal: #13132B
- Heading: font-playfair (Playfair Display)
- Container: max-w-7xl mx-auto px-5 sm:px-6 lg:px-8
- Botão primário: bg-gradient-to-r from-gold to-[#d4c57b], texto #12121e

## SEO Pages já criadas (total ~3.427 URLs indexados)
- 150 Location×Service pages: /limpeza-sofas-porto, etc.
  (6 serviços × 25 cidades) → template: LocationServicePage.tsx
- 792 Freguesia×Service pages: /limpeza-sofas-porto-paranhos, etc.
  (6 serviços × 132 freguesias de 17 municípios) → FreguesiaServicePage.tsx
- 1.570 Keyword Variant pages: /higienizacao-sofa-porto, /lavagem-colchao-porto-paranhos, etc.
  (2 variantes × 5 serviços × 157 localizações) → SofaVariantPage.tsx
  Engine: src/data/keywordVariantData.ts
  Canonical aponta para /limpeza-[service]-[cidade] equivalente
- 465 Problem pages: /problemas/manchas-sofa, /manchas-sofa-porto, etc.
- 286 Material pages: /limpeza-sofa-veludo, /limpeza-sofa-veludo-porto, etc.
- 150 Price pages: /preco-limpeza-sofas-porto, etc.

## Serviços e Preços (SAGRADOS — não alterar sem aprovação)
Sofás: 49/69/79€ (1/2/3 lug cleaning), Pack+imper: 79/89/99€
Colchões: 49/59/69€ (solteiro/casal/king), Pack: 79/89/99€
Tapetes: 10/8/7€/m² (≤5/≤10/≤15m²)
Cadeiras: 17.5/15/12.5€ (≤3/≤6/≤10), +7.5€ impermeabilização
Alcatifas: 3€/m²+
Deslocação: Porto 0€, metro Porto 5€, Braga/Aveiro 10€, Lisboa 15€
Grátis quando serviço ≥150€

## Quiz (fluxo principal de conversão)
Step 0 Localização → Step 1 Serviço → Step 2 Tipo (Higienização/Imper) →
Step 3 Quantidades (upsell inline +30€ pack por item) →
UPSELL Pack Família (≥200€ = 10% desconto) →
Step 4 Contacto → Step 5 Calendário → /obrigado
Submissão: Formspree (primário) + Supabase leads table (backup CRM)

## Supabase CRM — tabela leads
Campos: id, name, phone, email, service, service_type, details,
location, value (€), slot, booking_id, message, status, source,
priority, notes, created_at
Status flow: pending → contacted → scheduled → completed → lost

## Admin Panel atual (básico)
- /admin-seo-pages — lista de SEO pages
- /admin-manager — gestão básica
- /admin/dashboard — dashboard
- /admin/import — import de dados
Problema: não tem acesso ao CRM, não monitoriza erros, não tem métricas

## O que preciso construir agora

### 1. Admin Panel completo (PRIORIDADE ALTA)
Quero um painel de controlo que inclua:

a) CRM Pipeline — Kanban visual com colunas:
   Novo | Contactado | Agendado | Concluído | Perdido
   - Cards com: nome, serviço, valor €, localização, data, telefone
   - Alertas visuais: leads >24h sem contacto (amarelo), >48h (vermelho)
   - Click num card → modal com detalhes + botão WhatsApp direto
   - Filtros: por serviço, por cidade, por estado, por data
   - Totais: leads hoje, esta semana, taxa de conversão, receita pipeline

b) Sitemap Monitor — lista de todos os sitemaps com:
   - URL count por sitemap
   - Botão "Regenerar sitemap" (trigger manual do generate-sitemap)
   - Links diretos para abrir cada .xml
   - Data da última geração

c) Error Log — painel de erros do site:
   - Integração com window.onerror e unhandledrejection
   - Logs guardados no Supabase (tabela error_logs)
   - Alertas para erros críticos (404s nas SEO pages, falhas de submit)
   - Últimos 50 erros com timestamp, URL, mensagem

d) Métricas de Conversão — dados do quiz:
   - Quantos iniciaram o quiz hoje/semana/mês
   - Taxa de conclusão por step (onde abandonam)
   - Serviço mais pedido
   - Cidade com mais leads
   - Valor médio de orçamento
   - Integrar com Supabase (tabela quiz_events)

e) Quick Actions:
   - Botão "Exportar leads CSV"
   - Botão "Enviar WhatsApp" com template pré-preenchido
   - Toggle para activar/desactivar promoções no site

### 2. Follow-up System (PRIORIDADE ALTA)
- Quando lead chega ao Supabase → trigger automático de WA
  Template: "Olá [nome]! Recebi o seu pedido de [serviço] em [cidade].
  O seu orçamento estimado é [valor]€. Posso confirmar para [slot]?
  Kyro Clean Solutions"
- Reminder automático: leads em 'pending' há >24h aparecem destacados
- Notas rápidas no card do lead (campo notes no Supabase)

### 3. Schema Markup (PRIORIDADE MÉDIA)
- LocalBusiness schema na homepage com horário, área de serviço, rating
- Service schema nas páginas de serviço individuais
- Review schema nas testimonials (já existem 9 reviews no código)
- BreadcrumbList schema nas SEO pages (já têm breadcrumb visual)
- FAQPage schema já existe (ServiceFAQSchema.tsx) mas falta nas páginas novas

### 4. Performance de Conversão (PRIORIDADE MÉDIA)
- Tracking de quiz_events no Supabase:
  {step: number, action: 'start'|'complete'|'abandon', service?, city?, value?, timestamp}
- Heatmap simples: em que step do quiz as pessoas abandonam mais
- A/B test simples no CTA do hero (copy alternativo)

### 5. Blog SEO (PRIORIDADE BAIXA — mês 2)
- Template de artigo: /blog/[slug]
- Primeiros 5 artigos alvo:
  "Como limpar sofá em casa sem danificar o tecido"
  "Com que frequência limpar colchão?"
  "Diferença entre higienização e limpeza de tapetes"
  "Vale a pena impermeabilizar o sofá? (guia 2025)"
  "Melhor empresa de limpeza de estofos no Porto"
- Schema Article + FAQ em cada artigo

## Regras para esta sessão
1. Lê este ficheiro completo antes de qualquer tarefa
2. Lê também o CONTEXT.md no projeto para detalhes do quiz e design
3. Não alteres preços nem o fluxo do quiz sem confirmar explicitamente
4. Usa sempre os design tokens definidos acima
5. Commits só quando pedido explicitamente
6. Antes de qualquer alteração: audit do estado atual primeiro

## Ficheiros críticos para referência
- src/App.tsx — router principal com todas as rotas
- src/components/QuizForm.tsx — quiz principal
- src/data/locationSeoData.ts — cidades e serviços (25 cidades, 6 serviços)
- src/data/keywordVariantData.ts — engine das 1.570 páginas variante
- src/data/frequesiaSeoData.ts — 132 freguesias de 17 municípios
- scripts/generate-sitemap.ts — gerador de sitemaps (7 sub-sitemaps)
- CONTEXT.md — contexto completo do projeto (quiz, preços, histórico)

---

## Tarefa prioritária para esta sessão

[SUBSTITUI ESTE TEXTO pelo que queres fazer, exemplos:]

Opção A — CRM:
"Cria o CRM Pipeline no admin com Kanban (Novo/Contactado/Agendado/Concluído/Perdido),
alertas visuais de leads frios (+24h amarelo, +48h vermelho) e botão WhatsApp direto
em cada card. Usa o Supabase existente, tabela leads."

Opção B — Métricas:
"Implementa o tracking de quiz_events no Supabase e o painel de métricas de conversão
no admin: taxa de conclusão por step, serviço mais pedido, valor médio de orçamento."

Opção C — Schema:
"Adiciona LocalBusiness + Service schema markup na homepage e nas páginas de serviço.
Reutiliza o ServiceFAQSchema.tsx existente nas páginas de keyword variant."

Opção D — Error Log:
"Cria a tabela error_logs no Supabase e integra window.onerror no site.
Adiciona um painel no admin que mostra os últimos 50 erros com timestamp e URL."
