# Sitelinks, callouts e snippets

Ainda **não estão criados na conta**: dependem da mesma confirmação de identidade
que bloqueia os anúncios. Textos prontos, com contagem de carateres, e todos os
destinos verificados no `dist` (as páginas existem).

## Sitelinks, 4 por campanha, ao nível da campanha

### Porto

| Título (≤25) | Linha 1 (≤35) | Linha 2 (≤35) | Destino |
|---|---|---|---|
| Preço de Limpeza de Sofá `(24)` | Tabela de preços por tamanho `(28)` | Orçamento grátis em 10 minutos `(30)` | `/preco-limpeza-sofa-porto` |
| Antes e Depois `(14)` | Fotografias de trabalhos reais `(30)` | Sofás, colchões e tapetes `(25)` | `/antes-depois-limpeza` |
| Impermeabilização `(17)` | Essencial 59€ ou Premium 89€ `(28)` | Até 10 anos e 5 lavagens `(24)` | `/impermeabilizacao-porto` |
| Limpeza de Colchões `(19)` | Colchões desde 59€ `(18)` | Com tratamento anti ácaros `(26)` | `/limpeza-colchoes-porto` |

### Lisboa

| Título (≤25) | Linha 1 (≤35) | Linha 2 (≤35) | Destino |
|---|---|---|---|
| Preço de Limpeza de Sofá `(24)` | Tabela de preços por tamanho `(28)` | Orçamento grátis em 10 minutos `(30)` | `/preco-limpeza-sofa-lisboa` |
| Antes e Depois `(14)` | Fotografias de trabalhos reais `(30)` | Sofás, colchões e tapetes `(25)` | `/antes-depois-limpeza` |
| Impermeabilização `(17)` | Essencial 59€ ou Premium 89€ `(28)` | Até 10 anos e 5 lavagens `(24)` | `/impermeabilizacao-lisboa` |
| Limpeza de Colchões `(19)` | Colchões desde 59€ `(18)` | Com tratamento anti ácaros `(26)` | `/limpeza-colchoes-lisboa` |

## Callouts, partilhados pelas duas campanhas (≤25)

- Orçamento grátis `(16)`
- Resposta em 10 minutos `(22)`
- Deslocação desde 10€ `(20)`
- Garantia de repetição 48h `(25)`
- 4,9 estrelas no Google `(22)`
- +1100 clientes servidos `(23)`

## Structured snippet, cabeçalho "Serviços"

Higienização · Impermeabilização · Tratamento anti ácaros · Remoção de manchas


## Extensão de chamada

Número 925 530 647, com o mesmo horário da campanha (segunda a sábado, 08:00 às 00:00).


## Porque não há extensão de WhatsApp

O Google não tem recurso nativo de WhatsApp, e a extensão de mensagem envia **SMS**,
que é um canal que a Kyro não acompanha. Um sitelink para `wa.me` também não serve:
o domínio de destino tem de ser o do anúncio. O caminho certo é o que o site já faz,
ou seja o botão de WhatsApp na própria página de destino, com a mensagem pré-escrita
a depender da página. Ver `src/lib/whatsappMessages.ts`.
