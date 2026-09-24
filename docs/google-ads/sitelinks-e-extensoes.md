# Sitelinks, callouts e snippets

**Sitelinks aplicados a 24/09/2026**, 6 por campanha, ao nível da campanha,
nas duas campanhas `Kyro | Porto | …` e `Kyro | Lisboa | …`. Confirmado depois
de recarregar a página: Recursos → Sitelink mostra 18 (os 6 antigos da
`Campaign #1`, criados a 18/09, mais estes 12). Até esta data as duas campanhas
estavam ativas **sem nenhum sitelink**: a campanha foi montada por
carregamento em massa sem recursos e ninguém voltou a este ficheiro.

Preços confirmados em `QuizTypes.ts` e `serviceCatalog.ts` no próprio dia:
Premium desde 89€ (1 lugar), colchões desde 59€, cadeiras desde 20€.

## Sitelinks aplicados (iguais nas duas cidades, só muda o destino)

| Título (≤25) | Linha 1 (≤35) | Linha 2 (≤35) | Destino Porto | Destino Lisboa |
|---|---|---|---|---|
| Preço de Limpeza de Sofá | Tabela de preços por tamanho | Orçamento grátis em 10 minutos | `/preco-limpeza-sofa-porto` | `/preco-limpeza-sofa-lisboa` |
| Antes e Depois | Fotografias de trabalhos reais | Sofás, colchões e tapetes | `/antes-depois-limpeza` | `/antes-depois-limpeza` |
| Impermeabilização | Escolha Essencial ou Premium | Premium: até 10 anos sob condições | `/impermeabilizacao-porto` | `/impermeabilizacao-lisboa` |
| Limpeza de Colchões | Colchões desde 59€ | Com tratamento anti ácaros | `/limpeza-colchoes-porto` | `/limpeza-colchoes-lisboa` |
| Limpeza de Cadeiras | Desde 20€ por cadeira estofada | Preço menor por várias cadeiras | `/limpeza-cadeiras-porto` | `/limpeza-cadeiras-lisboa` |
| Limpeza de Tapetes | Recolha e entrega ao domicílio | Orçamento à medida do seu tapete | `/limpeza-tapetes-porto` | `/limpeza-tapetes-lisboa` |

Todos os URLs com `https://cleansolutions.com.pt` à frente; o sufixo de
rastreio vem do nível da conta, não foi preciso pô-lo aqui.

## Callouts, partilhados pelas duas campanhas (≤25)

**Aplicados a 24/09/2026 ao nível da conta** (valem para todas as campanhas), os seis abaixo, como estão. Garantia 48h, "menos de 10 minutos", 4,9★ e +1100 confirmados em `commercialPolicy.ts` e `business.ts` no próprio dia.

- Orçamento grátis `(16)`
- Resposta em 10 minutos `(22)`
- Deslocação desde 10€ `(20)`
- Garantia de repetição 48h `(25)`
- 4,9 estrelas no Google `(22)`
- +1100 clientes servidos `(23)`

## Structured snippet, cabeçalho "Serviços"

**Aplicado a 24/09/2026 ao nível da conta**, com seis valores: Higienização de sofás · Impermeabilização · Tratamento anti ácaros · Remoção de manchas · Limpeza de colchões · Limpeza de tapetes. (O plano abaixo tinha quatro.)

Higienização · Impermeabilização · Tratamento anti ácaros · Remoção de manchas


## Extensão de chamada

Número 925 530 647, com o mesmo horário da campanha (segunda a sábado, 08:00 às 00:00).


## Nome da empresa e logótipo

**Aplicados a 24/09/2026 ao nível da conta.** Nome: "Kyro Clean Solutions" (o
Google exige que corresponda ao domínio ou ao anunciante validado; ficou com o
"Clean Solutions" do domínio, pode não ser aprovado). Logótipo: a versão com
fundo transparente que já estava na biblioteca de recursos da conta.

## Imagens

**Nenhuma aplicada.** Foram carregadas e retiradas antes de guardar, a pedido
do dono: fotos de "antes" sozinhas e a da mancha de vinho não fazem sentido num
anúncio. As candidatas estão em `~/Documents/KYRO_AD_FACTORY/google_ads_fotos_candidatas/`
(fora do repositório), para escolher com o dono.

## Porque não há extensão de WhatsApp

O Google não tem recurso nativo de WhatsApp, e a extensão de mensagem envia **SMS**,
que é um canal que a Kyro não acompanha. Um sitelink para `wa.me` também não serve:
o domínio de destino tem de ser o do anúncio. O caminho certo é o que o site já faz,
ou seja o botão de WhatsApp na própria página de destino, com a mensagem pré-escrita
a depender da página. Ver `src/lib/whatsappMessages.ts`.
