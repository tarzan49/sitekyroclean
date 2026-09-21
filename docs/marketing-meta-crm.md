# CRM Google Ads e Meta Ads

Atualização de 22/09/2026. O painel administrativo tem separadores independentes Google Ads e Meta Ads, ambos com `MarketingPanel`, filtrados por `marketingPlatforms.ts`.

## O que mede

- Pedidos do formulário com atribuição consentida, separados por plataforma. Um `fbclid` sozinho não prova anúncio pago.
- Pedidos reais de mensagens/chamadas podem ser registados manualmente, com indicação obrigatória de como se confirmou a origem. Não se criam visitas nem conversões nas plataformas com esse registo.
- Estados, histórico, orçamento, marcação, faturação e dinheiro recebido são distintos. Atualizar o estado grava o histórico atomicamente.
- Gasto diário total por plataforma é manual. Dias em falta não são zero: impedem calcular custos e retorno. Estes indicadores relacionam gasto com a coorte de pedidos do período, não reconciliam automaticamente as janelas de atribuição das plataformas.
- O administrador deve distinguir testes de pedidos reais na operação. Os dados históricos não foram reclassificados ou preenchidos por inferência. Ausência de origem impede atribuir um pedido a publicidade.

## Pixel Meta

Pixel definido em `src/constants/tracking.ts`. Só em ambiente autorizado e com consentimento publicitário:

- `PageView`: visita a rota pública.
- `WhatsAppClick` e `PhoneClick`: eventos personalizados de intenção, nunca conversas confirmadas.
- `Lead`: depois da confirmação do CRM. `eventID` estável pelo identificador opaco do pedido e guarda contra repetição. Não envia nome, telefone, email ou valor de orçamento como venda.

Não existe Conversions API, importação automática de formulários instantâneos/mensagens, nem envio de `Purchase` pelo administrador. O CRM não confirma que a Meta recebeu o evento; validar no Gestor de Eventos e reconciliar pedidos reais. Bloqueadores e recusa de consentimento produzem subcontagem.

Parâmetros de URL para anúncios que levam ao site (configuração na conta não é automática):

```
utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&meta_campaign_id={{campaign.id}}&meta_adset_id={{adset.id}}&meta_ad_id={{ad.id}}&meta_placement={{placement}}
```

## Google Ads

A exportação CSV legada usa GCLID. GBRAID/WBRAID ficam preservados, mas não são colocados na coluna GCLID. Conversões offline exigem data real no histórico (ou conclusão explicitamente registada), nunca a data de criação como substituto. O CSV declara UTC por defeito e converte para o fuso declarado quando indicado. Qualificação não recebe valor de orçamento como receita.

Ações de conversão, objetivos primários/secundários e importação/aceitação continuam a ser configurações da conta Google. O painel não altera campanhas nem orçamento publicitário.

## Publicação e verificação

1. Aplicar apenas `supabase/migrations/20260922000000_meta_marketing.sql`, após as migrações de marketing e autorização de 18/09. Não usar `supabase db push`: o histórico remoto não está alinhado.
2. Publicar `submit-lead` preservando a sua configuração pública existente. A função aceita os novos campos e impõe `attribution_method=website`.
3. Publicar frontend por GitHub. Nunca acrescentar credenciais ao repositório.
4. Testes SQL: `supabase/tests/20_meta_marketing.sql`, em base local descartável. Verifica admin, recusa anon/não-admin, idempotência, histórico e valores negativos.
5. Testes frontend cobrem separação entre plataformas, consentimento, deduplicação, datas, gasto incompleto, erro de leitura e abertura do registo manual.

As novas tabelas e funções só permitem escrita administrativa. Registos de teste locais não são enviados para produção ou plataformas.
