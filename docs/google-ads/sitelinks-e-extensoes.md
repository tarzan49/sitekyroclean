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
| Limpeza de Colchões | Colchões desde 59€ | Anti ácaros opcional | `/limpeza-colchoes-porto` | `/limpeza-colchoes-lisboa` |
| Limpeza de Cadeiras | Desde 20€ por cadeira estofada | Preço menor por várias cadeiras | `/limpeza-cadeiras-porto` | `/limpeza-cadeiras-lisboa` |
| Limpeza de Tapetes | Recolha e entrega ao domicílio | Orçamento à medida do seu tapete | `/limpeza-tapetes-porto` | `/limpeza-tapetes-lisboa` |

Todos os URLs com `https://cleansolutions.com.pt` à frente; o sufixo de
rastreio vem do nível da conta, não foi preciso pô-lo aqui.

**26/09/2026:** a linha 2 de colchões era "Com tratamento anti ácaros", ao lado
de "desde 59€". Lido junto, prometia o tratamento incluído nos 59€, quando o
anti-ácaros é um extra orçamentado à parte (`TREATMENT_EXTRAS` em
`commercialPolicy.ts`). Passou a "Anti ácaros opcional" nas duas campanhas.

Os 6 sitelinks de 18/09 que continuam na lista de recursos são da
`Campaign #1`, removida a 26/09: não servem, não é preciso apagá-los.

## Callouts, partilhados pelas duas campanhas (≤25)

**Aplicados a 24/09/2026 ao nível da conta** (valem para todas as campanhas), os seis abaixo, como estão. Garantia 48h, "menos de 10 minutos", 4,9★ e +1100 confirmados em `commercialPolicy.ts` e `business.ts` no próprio dia.

- Orçamento grátis `(16)`
- Resposta em 10 minutos `(22)`
- Deslocação desde 10€ `(20)`
- Garantia de repetição 48h `(25)`
- 4,9 estrelas no Google `(22)`
- +1100 clientes servidos `(23)`

**Por decidir (26/09/2026):** os anúncios deixaram de dizer "no Google" nas
avaliações, porque as fichas do Google mostram números por estabelecimento que
não coincidem com o total. Este callout ficou com "4,9 estrelas no Google". A
alternativa coerente com os anúncios é "Avaliação média de 4,9" `(22)`.

## Structured snippet, cabeçalho "Serviços"

**Aplicado a 24/09/2026 ao nível da conta**, com seis valores: Higienização de sofás · Impermeabilização · Tratamento anti ácaros · Remoção de manchas · Limpeza de colchões · Limpeza de tapetes. (O plano abaixo tinha quatro.)

Higienização · Impermeabilização · Tratamento anti ácaros · Remoção de manchas


## Extensão de chamada

Número 925 530 647, ao nível da conta. **Sem restrição de horário, 24/7**
(confirmado pelo dono a 24/09/2026: atende a qualquer hora). Não criar programação.


## Nome da empresa e logótipo

**Aplicados a 24/09/2026 ao nível da conta.** Nome: "Kyro Clean Solutions" (o
Google exige que corresponda ao domínio ou ao anunciante validado; ficou com o
"Clean Solutions" do domínio, pode não ser aprovado). Logótipo: a versão com
fundo transparente que já estava na biblioteca de recursos da conta.

## Imagens

**Aplicadas a 24/09/2026, em revisão pela Google.** As fotos são reais, de
trabalhos da Kyro (pasta `before_after/` da KYRO_AD_FACTORY), já cortadas nos
formatos exatos do Google (quadrado 1200×1200, horizontal 1200×628), sem texto
por cima. Seleção e critérios em
`~/Documents/KYRO_AD_FACTORY/google_ads_fotos_candidatas/05_selecao_final/BALANCO.md`.

- **Nível de campanha, Porto e Lisboa (20 cada, o máximo):** 6 sofás em antes e
  depois (A1–A6, 60%) e 4 em resultado final (F1–F4, 40%). Nenhum sofá aparece
  nos dois grupos. As mesmas nas duas cidades: as fotos não dizem a cidade, e
  dividir só dava ao Google menos por onde escolher em cada campanha.
- **Nível de grupo, os dois "Impermeabilização de Sofás" (11 cada):** 3 imagens
  do teste real de água a escorrer num assento tratado (vídeo
  `assets/99_rever/rever_cadeira_agua_em_gotas_01.mov`) + os 4 resultados
  finais. Imagens de grupo substituem as de campanha nesse grupo, por isso quem
  pesquisa impermeabilização não vê manchas a sair, vê o líquido a escorrer.
  Antes e depois de manchas ficam de fora deste grupo de propósito.
- **Colchões e tapetes ficam de fora:** as campanhas só têm palavras-chave de
  sofás e o Google mostra a imagem ao lado dessas pesquisas.
- **Acrescentadas a 24/09/2026, nos mesmos dois grupos (passam a 17 cada):** os
  3 pares antes/depois de impermeabilização que o site já usa no hero
  (`src/assets/before-after-pool/impermeabilizacao-0{1,2,3}-*`: vinho,
  refrigerante, leite), montados lado a lado em quadrado e horizontal (6 imagens,
  `05_selecao_final/impermeabilizacao_site/`). O par 04 ficou de fora porque é
  limpeza (sofá sujo → limpo), não proteção. **Estas imagens são geradas por IA,
  não fotos de clientes**, e a própria Google detetou-o no carregamento. Foram
  carregadas com a etiqueta de IA ativada e, no mesmo dia, **o dono pediu para a
  desligar** (imagens mantidas, sem o selo "AI"). Alterado em Ferramentas →
  Asset Studio → Biblioteca de recursos → vista Tabela → coluna "Etiqueta de IA".
  A Google não a torna obrigatória; o risco que fica é a regra europeia de
  transparência sobre imagens geradas, avisado ao dono antes de desligar. Continua a valer a pena filmar um antes/depois real
  (água numa almofada antes e depois de tratar) para as substituir.

## Preço

**Aplicado a 24/09/2026 ao nível de campanha** (Porto e Lisboa, um recurso cada,
porque os URLs são da cidade). Idioma português (Portugal), tipo Serviços,
qualificador "Desde", EUR. Preços de `src/components/quiz/QuizTypes.ts`
(`sofaPrices`): se mudarem lá, mudar aqui.

| Cabeçalho | Preço | Descrição | Destino |
|---|---|---|---|
| Limpeza Sofá 1 Lugar | desde 49 € | Ao domicílio + deslocação | `/limpeza-sofas-{cidade}` |
| Limpeza Sofá 2 Lugares | desde 69 € | Ao domicílio + deslocação | `/limpeza-sofas-{cidade}` |
| Limpeza Sofá 3 Lugares | desde 79 € | Ao domicílio + deslocação | `/limpeza-sofas-{cidade}` |
| Impermeabilizar Sofá | desde 59 € | Proteção + deslocação | `/impermeabilizacao-{cidade}` |

Porquê: mostrar o preço antes do clique filtra quem procura mais barato e poupa
cliques pagos; o texto dos anúncios deixou de abrir com preço, por isso o preço
vive aqui. "+ deslocação" em todas as linhas para não parecer preço fechado.
Tapetes nunca (regra do site).

## Perfil da Empresa (ficha do Google)

**Já estava associado** (Ferramentas → Gestor de dados → Google Business Profile:
"Associado", 2 estabelecimentos) e em uso num recurso de localização ao nível da
conta com "todas as localizações", que cobre Porto e Lisboa. Nada a fazer.

## WhatsApp

**Correção de 25/09/2026:** a conta já tem um recurso de WhatsApp. É do tipo
"Mensagem" (Beta), com o número +351 925 530 647 e uma mensagem pré-escrita de
Lisboa, e está associado **só à `Campaign #1`** (criado a 18/09). Cada conversa
aberta a partir dele conta na ação de conversão "Conversation started" (alojada
na Google, principal, objetivo "Leads a partir de mensagens"). A nota antiga
abaixo dizia que o Google não tinha recurso nativo de WhatsApp, o que já não é
verdade.

**Aplicado a 26/09/2026:** um recurso de mensagem por grupo de anúncios (4),
número 925 530 647, botão "Receber estimativa do custo", descrição "Resposta em
menos de 10 min". A mensagem pré-escrita segue o texto que o botão de WhatsApp
do site gera (`buildServiceWaMessage` em `src/lib/whatsappMessages.ts`), com o
serviço e a cidade do grupo: "Olá! Gostaria de saber o preço e a próxima
disponibilidade para limpar o meu sofá no Porto. Posso enviar fotografias para
o orçamento." (e as variantes de impermeabilização e de Lisboa). Estavam "Em
verificação" no fim do dia; com as campanhas em pausa, a Google pode só as rever
depois de ativar.

Nota antiga: um sitelink para `wa.me` não serve:
o domínio de destino tem de ser o do anúncio. O caminho certo é o que o site já faz,
ou seja o botão de WhatsApp na própria página de destino, com a mensagem pré-escrita
a depender da página. Ver `src/lib/whatsappMessages.ts`.
