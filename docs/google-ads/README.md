# Campanhas Porto e Lisboa: concorrência, posicionamento e como publicar

Estado a 23/09/2026. Duas campanhas de Pesquisa, Porto e Lisboa, sofás
(limpeza e impermeabilização). Conta **920-786-3494**, ocid `8544808301`.

O ficheiro `campanhas-porto-lisboa.csv` cria as duas de uma vez.
`gerar-csv.py` regenera-o a partir das constantes do site e **rebenta** se um
título passar dos 30 carateres ou uma descrição dos 90.

**Atualização 9/10/2026 (dono).** Há uma terceira campanha, **Braga** (id
`24342635218`, 15 €/dia, limite de 2 € por clique, segunda a sexta, só
"Presença"), criada com `campanha-braga.csv`, que `gerar-csv-braga.py` gera:
oito grupos, limpeza e impermeabilização para Braga, Guimarães, Famalicão e
Barcelos, cada anúncio a abrir a página da sua cidade. Localizações: Braga,
Guimarães, Famalicão (o Google só tem a cidade, mais um raio de 6 mi), Barcelos,
Fafe, Póvoa de Lanhoso, Esposende e Felgueiras. O Porto deixou de as cobrir:
ficou com a Área Metropolitana, mais Ovar, Penafiel, Lousada, Paços de Ferreira,
Vale de Cambra e os raios que já tinha. Regra do dono: uma localidade fora da
AMP e da zona de Braga vai para a campanha que lhe fica mais perto. Orçamentos
nesta data: Lisboa 45 €, Porto 35 €, Braga 15 € por dia. Nos anúncios de sofás
do Porto e de Lisboa, os textos passaram a 160 avaliações, resposta em 5
minutos e secagem de 2 a 5 horas; nos sitelinks, "Orçamento grátis em 5
minutos", cadeiras "Desde 12,50€ por cadeira" e tapetes "Lavagem em casa ou
recolha". O nome da empresa continua reprovado e o dono preferiu esperar pelo
recurso a mudá-lo. Braga foi ativada nesse dia, com os mesmos recursos das
outras duas: 6 sitelinks para as páginas de Braga, tabela de preços (sofá 1/2/3
lugares desde 49/69/79 €, impermeabilização desde 59 €), mensagem de WhatsApp,
10 fotografias de sofás, a lista de negativas partilhada e as negativas de
campanha "porto" e "lisboa". As chamadas não contam a dobrar: "Clicks to call"
não está incluída nos objetivos da conta.

---

## 1. A concorrência, preços reais lidos nos sites deles

| Empresa | Limpeza de sofá | Impermeabilização | Secagem | Prova social | Zona |
|---|---|---|---|---|---|
| **Kyro** | 49€ (1L) · 69€ (2L) · 79€ (3L) | **Essencial 59€ · Premium 89€** (1L) | 3 a 6 h | 4,9 · 125 avaliações · +1100 clientes | Porto, Braga, Lisboa, Algarve |
| EcoLimpeza | **49€ um sofá de 3 lugares** (+10€/módulo) | não anuncia | 2 a 4 h | 5,0 · 36 avaliações | Porto, Gaia, Matosinhos, Maia, Braga, Aveiro |
| O Janota | 65€ (2L) · 70€ (3L) · 75€ (4L) | 100€ (2L) · 110€ (3L) · 125€ (4L) | não diz | 5,0 · 115 avaliações | Grande Porto, Grande Lisboa, Margem Sul, Algarve |
| DeepClean | desde 60€ | sim, 10% de desconto com limpeza, preço não publicado | 4 a 6 h | 5,0 · **400 avaliações** | Grande Lisboa, Grande Porto, Setúbal |
| Senhor dos Sofás | **desde 35€** | não visto | **1 h** | não visto | Lisboa e Ribatejo |
| Santefa | 70€ (1,60m) · 100€ (2,20m) · 130€ (2,70m) | sim, preço não publicado | "algumas horas" | não mostra | nacional |
| Biomex | até 155€ (2 lugares) · até 300€ (grande) | **desde 45€** | mesmo dia | não mostra | nacional |
| Doutor Sofá | sob orçamento | sim, garantia de 365 dias | **24 h** | não mostra | Porto |
| ML Clean | não publica | sim, preço não publicado | não diz | não mostra | Grande Porto |

### O que isto obriga a mudar

**A Kyro não pode liderar a limpeza pelo preço.** A EcoLimpeza lava um sofá de
**3 lugares por 49€**, que é exatamente o preço do sofá de **1 lugar** da Kyro.
Em Lisboa, o Senhor dos Sofás anuncia desde 35€. Um anúncio da Kyro com "desde
49€" põe a pessoa a comparar dois 49€ que não são a mesma coisa, e perde a
comparação. Foi por isso que o preço saiu dos títulos do grupo de limpeza.

**A impermeabilização é onde a Kyro ganha, e com folga.** A Essencial a 59€
contra os 100€ do O Janota para 2 lugares (a Kyro pede 79€ nesse tamanho). E,
mais importante, **a Kyro é a única que diz quanto tempo dura**: Essencial 1 a 2
anos e até 2 lavagens, Premium até 10 anos e até 5 lavagens. Os outros ou não
anunciam o serviço, ou anunciam sem duração nenhuma. Quem compra proteção quer
saber exatamente isto.

**O pack é o melhor argumento comercial que existe.** Limpar e impermeabilizar
um sofá de 2 lugares custa 139€ na Kyro. No O Janota, os mesmos dois serviços
somam 165€ (65€ + 100€). Ou seja, a Kyro é mais cara na limpeza isolada e **26€
mais barata no trabalho completo**. É o único enquadramento em que o preço joga
a favor, e é também o serviço de maior margem.

**Três coisas mais que só a Kyro dá**, e que entraram nos anúncios: preço
fechado antes da marcação (a maioria diz "sob orçamento"), resposta em menos de
5 minutos (a EcoLimpeza promete menos de 2 horas) e a garantia concreta de
repetir sem custos se avisar em 48 horas (os outros escrevem "satisfação
garantida" sem dizer o que isso significa).

**O que não vamos copiar:** a EcoLimpeza e a DeepClean anunciam "99% dos
ácaros". A Kyro não faz afirmações de eficácia com percentagem, por decisão
editorial já tomada e por não ser verificável. Ganha-se a comparação com
especificidade, não com um número maior.

**Prova social, onde a Kyro está:** 125 avaliações passam à frente do O Janota
(115) e da EcoLimpeza (36), e ficam atrás só da DeepClean (400). **Onde está em
desvantagem:** a EcoLimpeza seca em 2 a 4 horas contra as 3 a 6 da Kyro, e o
Senhor dos Sofás anuncia 1 hora. Isso não se resolve com texto de anúncio.

---

## 2. O que está feito na conta (23/09/2026, aplicado)

| Objeto | Estado |
|---|---|
| **Kyro \| Porto \| Limpeza e Proteção de Sofás \| Set 2026** | Criada, **em pausa**. 2 grupos: Limpeza de Sofás (12 palavras-chave), Impermeabilização de Sofás (7). Orçamento **13,00 €/dia** (corrigido em 23/09, estava em 13,15), Maximizar cliques com limite de CPC de **2,00 €** (ver nota na secção 3), só Pesquisa do Google |
| **Kyro \| Lisboa \| Limpeza e Proteção de Sofás \| Set 2026** | Idem, mesma estrutura e definições. Orçamento **27,00 €/dia** |
| `Kyro \| Negativas partilhadas` | 101 negativas, aplicada às duas campanhas (23/09) |
| `Campaign #1` | Intocada. É a campanha antiga de **Lisboa** (o anúncio dela lidera com "desde 49€"), em pausa (ativada mas **"Não elegível": todos os anúncios estão em pausa**, por isso não gasta), 15,20 € gastos, 0 conversões |
| **Localizações (23/09)** | Porto: **Presença**, 16 dos 17 municípios da AMP (todos exceto Arouca — ver armadilha nona abaixo). Lisboa: **Presença**, os 18 municípios da AML + Setúbal. Ver secção 3 |
| **Idioma (23/09)** | Português, nas duas — estava "Todos os idiomas" |
| **Horário (23/09)** | Confirmado sem restrição nas duas (o padrão do Google Ads já é 24/7 quando a secção "Programação de anúncios" está vazia) — corresponde à disponibilidade real, não foi preciso criar nada |
| **Sufixo de URL final (23/09)** | Aplicado em **Definições da conta** (nível de conta, cobre as duas campanhas automaticamente via `{campaignid}`). Testado com "Testar configuração de acompanhamento": resolve para `limpeza-sofas-lisboa?ads=1&utm_source=google&...`, página de destino encontrada |
| **Chamada (Call asset)** | Já existia antes desta sessão, a nível de **conta** (não por campanha): 925 530 647, Portugal, elegível, relatório de chamadas ativado. Aplica-se às duas campanhas automaticamente por estar ao nível da conta — não foi preciso criar nada |
| **Objetivo de conversão específico da campanha** | **Não persiste** — ver décima armadilha abaixo. As duas campanhas continuam em "Predefinição da conta" |

**Os 4 anúncios não entraram.** É a única peça que falta e o motivo está no ponto
3: o Google recusa criar anúncios nesta conta, tanto pelo carregamento em massa
("Ocorreu um erro. Tente mais tarde.") como pela interface, que **nem sequer
oferece** a opção de criar um anúncio de pesquisa adaptável dentro do grupo. Sem
anúncios, as campanhas não podem servir mesmo que sejam ativadas.

**Nota sobre os nomes.** À primeira tentativa, o Porto não foi criado: existia um
rascunho do assistente com o nome exato "Kyro | Porto | Limpeza e Proteção de
Sofás | Set 2026", e o carregamento em massa aplicou-lhe as linhas em vez de
criar a campanha (Lisboa foi criada, o Porto desapareceu lá dentro). Foi criado
com um nome provisório e, depois de o rascunho deixar de existir, renomeado para
o nome definitivo. **Os dois nomes estão agora iguais**, e o `gerar-csv.py` usa
exatamente estes: mudá-los ali passa a criar campanhas duplicadas em vez de
atualizar as que existem.

### Correções de 24/09/2026 (tarde)

- **Porto estava a mirar a região inteira.** A entrada "Porto, Portugal —
  região" (alcance 5 160 000, vai até Amarante e além) estava na lista em vez do
  concelho do Porto; as outras 15 entradas eram redundantes dentro dela e as 20
  impressões da campanha vieram todas daí. Trocada por "Porto, Porto, Portugal —
  cidade". "Gondomar — cidade" (alcance limitado) trocada por "Gondomar —
  município" (253 000). **Nas localizações, "X, Portugal" sem mais nada é uma
  região; o concelho é "X, X, Portugal".** Lisboa já usava o concelho.
- **Negativas: 101 → 109.** Os termos de pesquisa mostraram "como impermeabilizar
  sofá", "produto para impermeabilizar sofás portugal", "biomex limpeza" e
  "limpeza estofos auto". Acrescentadas: `como`, `produto para impermeabilizar`,
  `spray impermeabilizante`, `comprar impermeabilizante`, `biomex`, `auto`,
  `automóvel`, `carro`.
- **As três campanhas em pausa** a pedido do dono (não arrancam hoje).
- **Os 4 anúncios existem.** A lista de campanhas dizia "A campanha não tem
  anúncios" horas depois de eles estarem criados; é um estado desatualizado da
  Google. Confirmar sempre na página Anúncios.
- Recursos novos: sitelinks, anotações, fragmento, nome, logótipo e imagens,
  ver `sitelinks-e-extensoes.md`.
- **Mais tarde no mesmo dia:** recurso de preço nas duas campanhas (sofá 1/2/3
  lugares desde 49/69/79 €, impermeabilização desde 59 €), 6 imagens de
  impermeabilização do site nos dois grupos de impermeabilização (geradas por
  IA; etiqueta de IA desligada a pedido do dono), chamada confirmada 24/7 pelo dono. O
  Perfil da Empresa já estava associado. Campanhas continuam em pausa.

### Auditoria de 25/09/2026 (antes do lançamento)

Feita na conta, campanha a campanha, com as três campanhas em pausa.

**Corrigido e confirmado depois de recarregar:** o Porto estava em **"Presença
ou interesse"**, não em "Presença" como esta página dizia. Passou a
"Presença". Muito provavelmente nunca tinha sido gravado: no histórico de
alterações, Lisboa tem uma "Campanha mudou" a 23/09 às 16:42, junto com as
localizações, e o Porto não tem nenhuma quando as suas localizações entraram,
às 16:48. A campanha nasceu do carregamento em massa com o valor por defeito
da Google. **Confirmar a opção de localização depois de recarregar, nunca pelo
painel que acabou de fechar.**

Visto e certo: só Rede de Pesquisa, português, 24/7, limite de CPC de 2,00 €
nas duas, correspondência ampla desligada, recursos automáticos desligados,
Máxima IA desligada, lista de negativas partilhada aplicada nas duas, os 4
anúncios com 15 títulos e 4 descrições, as 13 páginas de destino e sitelinks a
responder 200, os 18 sitelinks e os 2 recursos de preço elegíveis. As
localizações correspondem ao `travel.ts`: no Porto são os concelhos da equipa
do Porto (incluindo Felgueiras, Lousada, Paços de Ferreira e Penafiel, que
**não** são da AMP; a etiqueta "16 dos 17 da AMP" estava errada, a lista não).

Por resolver:

- **Nome da empresa "Kyro Clean Solutions" reprovado** ("Irrelevância do nome
  da empresa"): não corresponde ao domínio `cleansolutions.com.pt`.
- **Faltam as palavras-chave principais sem cidade** ("limpeza de sofás",
  "higienização de sofás", "impermeabilização de sofás"). Com a segmentação em
  "Presença", o nome da cidade na palavra-chave não é preciso, e sem estas
  quem pesquisa só "limpeza de sofás" no Porto não vê o anúncio. Na
  `Campaign #1`, "higienização de sofás" foi a palavra com mais impressões (78).
  5 das 7 palavras de impermeabilização de cada cidade têm "Baixo volume de
  pesquisa".
- **"Pack desde 99€"** aparecia nos anúncios de impermeabilização e não aparecia
  em `/impermeabilizacao-{cidade}`. (26/09/2026: passou a "desde 89€" nos
  anúncios e no site, que é o preço que o quiz cobra.)
- **Existe um recurso de WhatsApp** (tipo "Mensagem", ação de conversão
  "Conversation started"), mas só na `Campaign #1`, com texto de Lisboa.
- **Cobertura de Lisboa:** Seixal, Vila Franca de Xira, Mafra e Moita só
  existem como "cidade" (Seixal com alcance de 10 000), o que deixa de fora
  Amora, Corroios, Alverca, Póvoa de Santa Iria, Ericeira e Baixa da Banheira.
- **Faturação pré-paga:** crédito de 177,45 € a 25/09, sem pagamento
  automático. Com 40 €/dia de orçamento somado, dura 4 a 5 dias se o gasto for
  total.
- **A promoção existe na conta:** 1200 € de crédito por gastar 2400 € até
  **16/11/2026**, resgatada a 18/09, requisitos por cumprir (22,55 € gastos).
  Com 40 €/dia não se chega lá.
- Imagens: parte ainda "Pendente, em verificação".
- Conversões: as 3 ações principais estão ativas, nenhuma registada ainda.

### Aplicado a 26/09/2026 (decisões do dono)

Tudo confirmado depois de recarregar a página.

- **`Campaign #1` removida.**
- **Palavras-chave: 50 → 70.** Nos dois grupos "Limpeza de Sofás":
  "limpeza de sofás", "limpeza sofá", "higienização de sofás", "higienização
  sofá", "lavagem de sofás", "limpeza de estofos". Nos dois "Impermeabilização
  de Sofás": "impermeabilização de sofás", "impermeabilização sofá",
  "impermeabilizar sofá", "impermeabilização de estofos". Todas de expressão.
- **Negativas partilhadas: 109 → 122** (spray, produto, produtos, máquina,
  impermeabilizante, caseiro, caseira, sozinho, leroy merlin, worten, amazon,
  continente, aki), para as palavras gerais não apanharem pesquisas de produto.
- **Lisboa: 54 localizações, "Presença".** O dono pediu a Margem Sul toda e
  decidiu incluir o distrito de Setúbal inteiro (região "Setúbal, Portugal"),
  **incluindo o Alentejo Litoral** (Sines, Grândola, Comporta, Tróia, Santiago
  do Cacém, Alcácer do Sal), sem exclusões. A norte: localidades de Vila Franca
  de Xira e Mafra por nome, códigos postais onde o Google os tem, e raios à
  volta de Alhandra (4 mi), Malveira (5 mi) e Encarnação (2 mi).
  **Alterado a 28/09: o limite sul é a Comporta** (dono: "o máximo que eu vou é
  até Setúbal, com Comporta"). Saiu a região "Setúbal, Portugal" e entraram
  Alcácer do Sal e Comporta (cidade): 55 localizações. Excluídas: Sines, Porto
  Covo, Santo André, Grândola, Carvalhal, Cercal e Vila Nova de Milfontes.
  Santiago do Cacém, Melides, Odemira e Tróia não existem na base de
  localizações do Google. No site, Grândola, Santiago do Cacém e Sines passaram
  a 20€ de deslocação.
- **Porto: 45 localizações, "Presença", limite de ~45 min** decidido com o
  dono: os 16 concelhos de antes mais Santa Maria da Feira, S. João da
  Madeira, Ovar, Oliveira de Azeméis, Famalicão, Guimarães, Braga e Barcelos.
  **Sem Amarante, Marco de Canaveses nem Baião** ("demasiado longe, poucos
  clientes"). Raio de 19 mi (≈30 km) à volta do Porto e raios de 3 a 6 mi à
  volta de cada concelho mais afastado. **Cuidado: "Braga, Portugal" (1,17 M de
  alcance) é o distrito inteiro, não a cidade**; a cidade é "Braga, Braga".
- **Códigos postais em Portugal:** o Google só tem alguns CP4 (Lisboa: 2700,
  2720, 2840, 2890, 2900, 2910, 2970, 2975; Porto: 4050–4350, 4425, 4700). Os
  outros não existem na base dele, daí os raios.
- **WhatsApp:** 4 recursos de mensagem, um por grupo de anúncios, com o texto
  do site (`buildServiceWaMessage`) encurtado aos 140 carateres do Google,
  apelo "Receber estimativa do custo" e descrição "Resposta em menos de 5 min".
- **Nome da empresa:** recurso enviado a 25/09 ("Contestar decisão", em curso).
  O formulário não tem campo de texto. A alternativa é validar com o número de
  registo da marca no INPI, em nome do anunciante validado.
  `kyrocleansolutions.pt` não serve como URL final: redireciona para outro
  domínio (e o `https://` nem responde), o que dava "destino não corresponde".
- **Pack desde 89 €** aparece na abertura de `/impermeabilizacao-{cidade}`
  (`commercialHeroCopy.ts`, lido do motor `calcPackPricing`: `bothPrice` menos
  o desconto de pack). Até 26/09/2026 lia o `bothPrice` cru e dizia 99 €,
  como os anúncios.
- **Imagens:** sem nenhuma reprovada (Gestor de Políticas sem problemas de
  anúncios). Usam as 10 fotos reais de sofás que existem; não há material
  melhor para trocar sem fotografar trabalhos novos.

**Resolvido no site a 26/09/2026:** as oito localidades que as campanhas
abrangem e o questionário recusava (Santa Maria da Feira, S. João da Madeira,
Ovar e Oliveira de Azeméis no Porto; Sines, Grândola, Santiago do Cacém e
Alcácer do Sal em Lisboa) passaram a cidades servidas, com página própria e
taxa: Feira 10€, as outras sete 15€ (deduzido das zonas do `travel.ts`, não
confirmado pelo dono). A pesquisa do questionário também encontra Comporta,
Tróia, Porto Covo, Esmoriz e outras freguesias. **Regra:** uma localidade nova
na segmentação tem de entrar em `travel.ts` e em `serviceCatalog.ts` no mesmo
dia; `travelPrices.test.ts` exige que as duas listas coincidam.

### Textos revistos e verificação final (26/09/2026, noite)

**Textos:** os 4 anúncios foram reescritos com o dono (avaliações sem "no
Google", cidade automática, descrições sem cidade, "Secagem Média", "Equipa
Própria no Norte", impermeabilização sem "sai com um pano" e com preços
"Desde"). Estão em `textos-dos-anuncios.md`, com o porquê de cada mudança. Os
4 em "Excelente", lidos de volta da conta e iguais ao CSV que o
`gerar-csv.py` gera. Sitelink de colchões: linha 2 passou a "Anti ácaros
opcional" (ver `sitelinks-e-extensoes.md`).

**Verificado na conta, depois de recarregar:**

- Definições iguais nas duas campanhas: só Rede de Pesquisa, português,
  "Presença", Maximizar cliques (13 €/dia Porto, 27 €/dia Lisboa), início a
  23/09 sem fim, correspondência ampla desligada, recursos automáticos
  desligados, personalização de texto e expansão do URL final desligadas.
  Ou seja, só servem os textos acima e só para as páginas acima.
- Política: o único problema da conta é o nome da empresa (contestação "Em
  curso" desde 25/09). Nenhum anúncio nem recurso reprovado.
- Recursos "Elegível": 6 callouts, snippet, chamada, logótipo, 2 de preço,
  sitelinks. "Em verificação": os 2 sitelinks de colchões editados, 4 de
  WhatsApp e 48 das 74 imagens (26 já elegíveis). Com as campanhas em pausa, a
  revisão pode só acontecer depois de ativar.
- Conversões principais: "Pedido confirmado (website)" (etiqueta reconhecida,
  "Nenhuma conversão recente"), "WhatsApp - clique no site" (GA4) e
  "Conversation started" (WhatsApp do anúncio). O objetivo "Solicitar
  estimativas do custo" aparecia como "Configuração incorreta": estava nas
  predefinições da conta sem nenhuma ação principal (a única é antiga, inativa
  e secundária). **Corrigido no mesmo dia, a pedido do dono:** saiu das
  predefinições (0 de 2 campanhas; o aviso continua no cartão, mas nenhuma
  campanha o usa).
- **Objetivo novo, "Chamada telefónica de lead"** (26/09/2026, a pedido do
  dono): ação "Chamada do anúncio (60 s ou mais)", principal, contagem "Uma",
  30 dias, valor 1 €. Conta só chamadas feitas pelo botão de chamada do anúncio
  que durem pelo menos 60 s; os relatórios de chamadas já estavam ligados na
  conta. **As sugestões da Google de importar `call_click` e `phone_click` do
  GA4 ficaram por aceitar de propósito:** são cliques no número do site, e
  cliques em telefone nunca entram num objetivo (regra do `CLAUDE.md`). Os
  objetivos predefinidos passaram a ser quatro: formulário, chamada, contacto
  (WhatsApp no site) e mensagens (WhatsApp do anúncio).
- Faturação: crédito pré-pago de 177,45 €, pagamentos manuais, sem pagamento
  automático. Com 40 €/dia dá para 4 a 5 dias; depois os anúncios param.
- Páginas: os 13 destinos (anúncios e sitelinks) respondem 200 em menos de
  0,3 s. Na impermeabilização, todas as promessas do anúncio estão visíveis
  (59/89/89 €: Essencial, Premium e pack de 1 lugar; 10 anos, 5 lavagens, 1 a 2 anos, 4,9, 125). **Na limpeza
  (`?ads=1`), "+1100 clientes servidos", "preço fechado antes de marcar" e
  "equipa própria" não aparecem na página**, e a garantia de 48 h só existe
  dentro de uma secção fechada. Não é motivo de reprovação, mas é o anúncio a
  prometer mais do que a página mostra.

### Auditoria de 29/09/2026 (três dias no ar)

**Números da conta, 26 a 28/09:** 199,35 € (incluindo 15,20 € da antiga
`Campaign #1`, de 18 a 22/09), 149 cliques, CTR 10,9%, CPC médio 1,34 €, 4
conversões registadas. Porto: 65,12 €, 58 cliques, 3 conversões. Lisboa:
119,03 €, 83 cliques, 1 conversão. Parcela de impressões 55% no Porto e 49% em
Lisboa; perdida por orçamento 40% e 31%, por classificação 5% e 20% (Lisboa
chegou a 43% a 28/09, já com o orçamento novo: aí o teto de 2 € por clique
começa a pesar mais do que o orçamento). As conversões registadas ficam muito
abaixo dos serviços que o dono fechou com os anúncios (consentimento e
WhatsApp, ver 26/09): para medir a sério falta etiquetar "(anúncio)" no
calendário, e a 29/09 ainda não havia nenhuma linha do CRM com origem
"Google Ads".

**Por grupo:** Porto limpeza 49,92 € (45 cliques, 2 conversões), Porto
impermeabilização 15,20 € (13, 1), Lisboa limpeza 95,44 € (66, 1), Lisboa
impermeabilização 23,59 € (17, 0). A palavra-chave que mais gasta é "limpeza
sofá" em Lisboa (30,97 €, 20 cliques, 1 conversão). "limpeza de estofos" está
"Raramente mostrado (Índice de qualidade baixo)" nas duas cidades (20 €, 16
cliques, 0 conversões) e atrai pesquisas de carros.

**Aplicado nesta data:**

- **Imagens.** A Google reprova imagens antes/depois lado a lado ("Reprovado
  (Colagem)"). Saíram 36: 12 por campanha e as 6 da impermeabilização em cada
  cidade (as de vinho, refrigerante e leite). Entraram 12 fotos só com o
  depois (`imagens/sofa-{1..6}-depois-{q,h}.jpg`) nas duas campanhas, que
  ficam com 20 cada, o máximo. A imagem com mais resultado até aqui é o
  sofá-cama bege quadrado (361 impressões, 24 cliques). O aviso sobre
  "recursos criados ou editados com IA" aparece em qualquer carregamento; não
  é uma deteção.
- **Negativas partilhadas: 144 → 185.** limpador, lavadora, aparelho, escova,
  detergente, espuma, mistura, misturinha, liquido, líquido, desinfetante,
  sanytol, vanish, karpex, redex, pluri, cif, mercadona, lidl, action, wap,
  kit, ferro de passar, automovel, automoveis, "limpa estofos", "limpa
  estofados", "limpa estofado", "dr sofá", "dr sofa", "resolve já", "resolve
  ja", "o que usar", "melhor extratora", comprar e, a pensar nos tapetes e
  colchões, "tapete de rato", "tapete de banho", yoga, rolante, insuflável,
  insuflavel. "extratora" sozinha ficou de fora de propósito: "limpeza de
  sofás com extratora" pode ser um cliente.
- **Site:** as páginas de tapetes passaram a dizer, no passo "Avaliação", que
  quando o tapete tem de ser recolhido é entregue em 3 dias no máximo. O
  anúncio promete isso e a pergunta frequente que o dizia não calhava nas
  páginas do Porto nem de Lisboa.

**Por decidir pelo dono:**

- **"lavandaria" e "tinturaria" estão nas negativas partilhadas**, que valem
  para a campanha inteira, por isso a palavra-chave "lavandaria de tapetes"
  dos dois grupos de tapetes nunca vai aparecer. Para a libertar só nos
  tapetes, as duas passam a negativas dos grupos de sofás e colchões. O
  carregamento em massa recusou "Negative Broad" na coluna "Criterion Type"
  (nesta conta os valores vão em português, como o "Expressão" que funcionou
  nas palavras-chave); nada foi aplicado.
- **Tapetes e colchões partilham o orçamento com os sofás.** Com "Maximizar
  cliques", a Google distribui o orçamento pelos cliques mais baratos. Como os
  sofás já perdem 30 a 40% das impressões por orçamento, ligar os grupos novos
  sem subir o orçamento tira dinheiro aos sofás.
- O nome da empresa continua "Reprovado (Irrelevância do nome da empresa)".

### Aplicado a 30/09/2026 (pedido do dono)

- **Limite de CPC 2,00 € → 2,50 € nas duas campanhas**, confirmado depois de
  recarregar. A 29/09 nenhuma perdia impressões por orçamento (0%) e perdiam
  30% (Porto) e 42% (Lisboa) por classificação: o limite era o travão.
- **Negativas por campanha:** `porto` na de Lisboa e `lisboa` na do Porto
  (a de Lisboa pagava cliques de "limpeza de sofás porto"). Custo conhecido:
  `porto` também bloqueia "Porto Salvo" e "Porto Brandão", que ficam na zona
  de Lisboa e quase não têm pesquisas.
- **Negativas partilhadas: 185 → ~448.** Primeiro `lavador`, `shampoo`,
  `kirby`, `vortex` (a negativa `lavadora` não bloqueia `lavador`). Depois 259
  para tapetes e colchões, a pensar em "nada pode passar": pragas que não
  tratamos (percevejos, baratas, piolhos), deitar fora e reciclar, compra de
  colchão (medidas 140x190 e afins, ortopédico, articulado, de ar, campismo,
  lojas e marcas de colchões), roupa de cama, tapetes que não são de sala
  (banho, capacho, higiénico, ginástica, relva, carro), fazer, tingir e
  reparar tapetes, produtos e máquinas (com os plurais e as variantes sem
  acento, que a Google não junta nas negativas), cursos e franchising, e
  outros serviços (cortinas, estores, limpeza de casas). **Ficaram de fora de
  propósito:** "venda", "praia" e "tinta" soltas (Venda Nova, Venda do
  Pinheiro, Praia da Granja; "mancha de tinta" é cliente), "usado" e "segunda
  mão" (quem compra usado quer limpar), "traça", "pulgas" e "sarna" (há quem
  chame a limpeza por isso), "ikea" (há clientes de sofás IKEA), "extratora"
  sozinha e tudo o que tenha "urina", "xixi", "manchas" ou "em casa" (deram
  conversões). A venda entra só como expressão: "à venda", "venda de",
  "para venda". Verificado com um script que nenhuma das novas bloqueia uma
  palavra-chave dos seis grupos; o único conflito continua a ser `lavandaria`.
- **Revisão dos grupos de tapetes e colchões (continuam em pausa):** 23 + 21
  palavras-chave por cidade, todas lá; um anúncio v3 ativo por grupo com
  qualidade "Excelente" (os antigos em pausa); sem problemas de política na
  conta; mensagem de WhatsApp, sitelinks, textos destacados e imagens
  próprias em todos os grupos, e recurso de preço nos colchões, todos
  "Elegível" (uma imagem dos colchões de Lisboa ainda "Pendente"). Páginas de
  destino em 200, com a entrega em 3 dias quando há recolha e o tapete sob
  orçamento.
- **Tapetes e colchões ligados no mesmo dia** (OK do dono), os quatro grupos
  "Elegível". Orçamentos subidos pelo dono para **Porto 40 €/dia e Lisboa
  45 €/dia** (a Google pediu "Confirme a sua identidade" ao gravar o
  orçamento; foi ele que confirmou). "lavandaria" continua bloqueada, por
  escolha dele.

## 3. As campanhas, como estão desenhadas

Duas campanhas iguais na estrutura, uma por cidade, cada uma com dois grupos:

| | Grupo "Limpeza de Sofás" | Grupo "Impermeabilização de Sofás" |
|---|---|---|
| Página | `/limpeza-sofas-{cidade}?ads=1` | `/impermeabilizacao-{cidade}?ads=1` |
| Palavras-chave | 12, correspondência de expressão | 7, correspondência de expressão |
| Ângulo | prova social, preço fechado, resposta em 5 min, garantia 48 h | duração declarada, duas versões com preço, pack desde 89€ |

Definições: só Rede de Pesquisa da Google (sem parceiros, sem Display),
Maximizar cliques com limite de CPC de **2,00 €** ao nível da campanha (as duas),
orçamento 13,15 €/dia,
**campanhas em pausa** e grupos ativos. Quando os anúncios existirem, ativar a
campanha passa a ser o único interruptor que falta.

**Limite de CPC (corrigido a 24/09/2026):** o "1,50 €" estava só no CPC máximo
dos grupos de anúncios, que a estratégia "Maximizar cliques" ignora. Ao nível da
campanha não havia limite nenhum. Passou a 2,00 € nas duas campanhas, porque a
estimativa da Google para o Porto é ~1,56 € e a campanha antiga pagou 1,90 €.
O limite de uma campanha com "Maximizar cliques" define-se em Definições →
Lances → "Definir um limite de lance de custo por clique máximo".

O grupo da impermeabilização leva as palavras-chave do pack
("limpeza e impermeabilização de sofás", "pack limpeza e impermeabilização
sofá") de propósito: com este orçamento, um terceiro grupo só dividia o
dinheiro por mais gente sem dar sinal a nenhum.

---

## 4. O bloqueio, que é o único motivo de isto não estar já publicado

A Google pede **"Confirme a sua identidade"** nesta conta, e avisa que **não
será possível ignorar depois de 7/10/2026**. É autenticação da conta, só o dono
a pode fazer.

Enquanto isso não estiver feito, **o assistente de criação de campanhas aceita
tudo e não guarda nada**. Verificado a 23/09: foi preenchido um grupo inteiro
(11 palavras-chave, 15 títulos, 4 descrições, URL e caminhos), o rodapé disse
"Todas as alterações foram guardadas" o tempo todo, e depois de recarregar o
rascunho estava vazio. Na etapa do orçamento o rodapé passou a "Falha ao guardar
as alterações".

**O resto da conta grava normalmente** (confirmado criando a lista de exclusões
partilhada, que persistiu). Por isso o caminho é o carregamento em massa, não o
assistente.

**Correção (23/09, mais tarde no mesmo dia):** o dono abriu a conta e não viu
pedido de identidade nenhum. Confirmado em **Admin → Política → Conta →
"Validação de anunciantes"**: todas as tarefas concluídas (perguntas a 21/09,
documentos a 22/09, declaração de anúncios políticos da UE a 22/09), e o sino
de notificações diz "Obrigado por ter efetuado a validação!". Ou seja, o
diálogo "Confirme a sua identidade" que apareceu dentro do assistente **não é**
a validação de anunciantes, ou estava desatualizado. O que continua
observavelmente bloqueado: em qualquer página de Anúncios (conta inteira ou
dentro de um grupo), o "+" só oferece "Anúncio dinâmico de pesquisa" e
"Variação do anúncio", e o menu "Criar" (canto superior esquerdo) não tem a
entrada "Anúncio". As duas campanhas têm 2 grupos cada, com palavras-chave e
zero anúncios. **Não voltar a dizer ao dono para confirmar a identidade sem
apontar para um ecrã concreto.** Passo seguinte: carregamento em massa das 4
linhas de anúncio do CSV (secção 5, ponto 2), ou suporte do Google Ads.

---

**Resolvido a 24/09/2026: não havia bloqueio nenhum.** Duas coisas:

1. **A interface em português chama "Anúncio dinâmico de pesquisa" ao anúncio
   de pesquisa adaptável (RSA).** Os 4 anúncios carregados, com 15 títulos e 4
   descrições cada, aparecem na coluna "Tipo de anúncio" exatamente com esse
   nome, e o da `Campaign #1` também é um RSA. A opção do "+" era a certa desde
   o início. Não confundir com os DSA a sério (que não têm títulos escritos).
2. **O carregamento em massa recusava os anúncios por causa do valor da coluna
   `Ad type`:** tem de ser o valor em inglês, `Responsive search ad`, mesmo com
   a interface em português. `gerar-csv.py` já escreve esse valor.
3. **Com duas campanhas com o mesmo nome** (a duplicada do `porto-apenas.csv`,
   removida), o carregamento dá "Valor em falta em ID da campanha". Resolve-se
   acrescentando a coluna `Campaign ID` (Porto: `24286916320`).

Os 4 anúncios foram criados a 24/09/2026 e as duas campanhas foram **ativadas
no mesmo dia** (Lisboa 27 €/dia, Porto 13 €/dia; confirmado com recarregamento
completo). Começam a servir quando a Google aprovar os anúncios. A `Campaign #1`
continua em pausa. Depois de ativar, o ícone do Porto ainda mostrou pausa durante
um bocado. **O ícone do estado demora a atualizar:** confirmar sempre com uma
recarga, e pelo "Total: conta" (que só soma campanhas ativas).

## 5. O que falta fazer

1. ~~Confirmar a identidade no Google Ads.~~ **Já está feita** (ver a correção
   na secção 4). O que falta descobrir é o que esconde a opção "Anúncio de
   pesquisa responsivo" nos menus.
2. **Criar os 4 anúncios.** Os textos estão em `campanhas-porto-lisboa.csv`
   (linhas com `Ad type`), prontos a colar. Ou repetir o carregamento do ficheiro:
   as campanhas, grupos e palavras-chave já existem, por isso só as 4 linhas de
   anúncio é que têm trabalho novo para fazer.
3. **Repetir a tentativa do objetivo de conversão específico** depois de a
   identidade estar confirmada — ver décima armadilha.
4. **Arouca não tem entidade própria no Google Ads** (nem "cidade" nem
   "município" — só devolve "Localizações relacionadas" sem correspondência
   direta). Porto ficou com 16 dos 17 municípios da AMP. Se o Google vier a
   indexar a localização no futuro, adicionar aí.

### Já aplicado na interface (23/09/2026)

| Definição | Porto | Lisboa |
|---|---|---|
| Localizações | 16 dos 17 municípios da AMP, **município** onde existe essa entidade, **cidade** como alternativa (Amadora, Valongo, Espinho, Felgueiras, Lousada, Vila do Conde\*, etc. só têm "cidade"). Falta só Arouca | Lisboa e os 17 concelhos da AML + Setúbal, mesma lógica município/cidade |
| Opção de localização | **Presença**, nunca "presença ou interesse". O Porto só ficou assim a 25/09 (ver a auditoria na secção 2) | Presença, confirmado a 25/09 |
| Idioma | Português | Português |
| Horário | Sem restrição (= 24/7, o padrão do Google Ads) | idem |
| Sufixo de URL final | Aplicado ao nível da conta, cobre as duas | idem |
| Lista de exclusões | `Kyro \| Negativas partilhadas` aplicada | idem |
| Chamada | 925 530 647, ao nível da conta, cobre as duas | idem |
| Objetivo de conversão | **Tentado, não persiste** — ver décima armadilha | idem |

\* Vila do Conde tinha também `município`, foi essa a entidade escolhida.

---

## 6. Duas coisas a resolver antes de aumentar o investimento

1. **Não há conversões registadas.** A campanha antiga (`Campaign #1`) gastou
   15,20 € em 8 cliques com **0 conversões**. Antes de subir o orçamento,
   confirmar que a ação "Kyro | Pedido confirmado" está mesmo a receber dados;
   `docs/tracking-google-ads.md` diz que nada disto foi validado em produção.
2. **13,00 €/dia é um teto, não uma previsão.** A estimativa da própria Google
   para as palavras-chave de limpeza do Porto foi de cerca de **14 € por
   semana**, a 1,56 € de CPC.

---

## 7. Décima armadilha (23/09/2026): "Objetivos de conversão específicos da campanha" aceita a escolha e depois não a guarda

Testado nas duas campanhas, duas vezes cada, com confirmação por recarregamento
completo da página (não só fechar o painel): abrir **Definições da campanha →
Objetivos de conversão → Específico da campanha → selecionar "Kyro | Pedido
confirmado" → Guardar**. O painel fecha, mostra a seleção nova, sem erro
visível. Recarregar a página do zero e reabrir: voltou a "Predefinição da
conta".

**O que não é isto:** não é o mesmo bloqueio documentado na terceira armadilha
para o assistente de criação de campanhas — aquele mostrava "Falha ao guardar
as alterações" no rodapé; este não mostra erro nenhum. E não é um problema
geral de guardar definições desta campanha: no mesmo painel, **Localizações**
(16 e 18 municípios) e **Idiomas** (Português) guardaram e sobreviveram ao
recarregamento sem problema. É especificamente este campo.

**Suspeita, não confirmada:** dado que o resto da conta está bloqueado por
"Confirme a sua identidade" (quarta seção acima) e o prazo é o mesmo
(7/10/2026), é razoável assumir que este campo passa pelo mesmo portão —
gerir objetivos de conversão é uma ação de "conta", tal como criar anúncios.
Mas isto não foi verificado a sério (não há forma de testar sem a identidade
confirmada). **Confirmar depois de 7/10/2026:** se persistir mesmo depois da
identidade confirmada, é um bug à parte, não este bloqueio.

**Impacto enquanto isto não estiver resolvido:** as duas campanhas reportam
conversões pelos objetivos predefinidos da conta ("Contactos", "Leads a partir
de mensagens"), não só por "Kyro | Pedido confirmado". Não impede a campanha
de servir nem de otimizar lances — é só um problema de relatório, o mesmo tipo
de degradação sem mentir que outras armadilhas desta lista já tiveram.

---

*`GOOGLE-ADS-PORTO-CAMPANHA.md` (agosto) tem outra estrutura e textos que já não
correspondem ao site. Não é a fonte destas campanhas.*
