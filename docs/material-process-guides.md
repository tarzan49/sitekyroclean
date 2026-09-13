# Guias de limpeza por material de sofá

Pedido de 13/09/2026: retirar a secção intermédia de antes/depois e reunir demonstração e explicação do processo num guia específico para cada tipo de sofá. As avaliações ficam entre a tabela de preços e a galeria dos exemplos.

Sete guias: tecido, veludo, pele, microfibra, linho, camurça e sintético. Seis passos nos materiais exceto pele/couro (cinco), 41 passos no total. Os novos ficheiros `-six.webp` contêm as seis etapas em grelha 3×2: avaliação, aspiração, aplicação, escovação, extração e secagem. Couro preserva a folha anterior de cinco etapas e um detalhe. Fotografias ilustrativas geradas, não resultados reais nem intervenções em clientes.

Geração com ImageGen integrado. Originais em `$CODEX_HOME/generated_images/01a09b5e-acd2-70f3-93fc-f1dfa5a6bab5/`; ficheiros finais em `public/images/materials/process-sofa-*.webp`.

O método depende da avaliação, acabamento e indicações do fabricante. A demonstração atual de sintético usa tecido de poliéster; a legenda explica a adaptação para outros revestimentos. Não existe promessa de restauro de fissuras, remoção total de manchas ou tratamentos anti-ácaros incluídos. Secagem húmida dos tecidos usa a constante comercial.

## Prompts da primeira versão (substituída, exceto couro)

Use case: photorealistic-natural. Asset type: single educational photo contact sheet for an upholstery-cleaning step guide. Generate one LANDSCAPE 3:2 image made of exactly SIX equally sized square photographs, precisely THREE columns and TWO rows, edge to edge, no gaps or borders. Same sofa, same Portuguese home and natural lighting in all six cells. Only cropped forearms of a technician wearing dark green plain workwear and black nitrile gloves in cells 1-4, anatomically correct hands; no faces. The sofa upholstery must be exactly consistent. No text, labels, numbers, brand logos, watermark, graphic overlays. Believable editorial photography, technically restrained gentle material care, no exaggerated grime, no before-after comparisons, no health claims. Keep each key action centered within its square cell.

## Material e seis células por ficheiro

### tecido

Subject: beige woven fabric sofa.

Six cells in reading order: inspect a hidden cushion seam with a small white cloth for color test; vacuum the cushion using a dry upholstery nozzle; lightly apply compatible cleaning solution with a small trigger bottle to a cushion; extract a cushion using transparent upholstery extraction nozzle with modest moisture and NO clouds of steam; same sofa resting untouched next to an open window in bright airy room; close-up detail of beige woven upholstery.

### veludo

Subject: deep forest green velvet sofa with fine directional pile.

Six cells in reading order: inspect hidden seam with a small white cloth; gently vacuum the velvet with soft brush upholstery nozzle; lightly wipe a small hidden velvet area using a white cloth to demonstrate compatibility check with minimal moisture; groom pile gently in a consistent direction using a soft upholstery brush, no extraction nozzle; same sofa resting untouched by an open window in soft daylight; macro detail of green velvet pile.

### pele

Subject: cognac natural leather sofa with subtle grain.

Six cells in reading order: inspect leather stitching and grain by gloved hand gently lifting cushion edge; gently remove loose dust with dry soft microfiber cloth; clean small area with lightly foamed white soft sponge, very little foam and no water spray; apply a very thin compatible leather conditioning cream to finished leather with a soft cloth, no thick visible residue; same sofa resting untouched in indirect daylight away from radiator and direct sunlight; macro detail of natural cognac leather grain.

### microfibra

Subject: warm grey microfiber sofa with short fine matte fibers.

Six cells in reading order: inspect the upholstery care tag attached under a sofa cushion, tiny illegible tag no fabricated readable code; vacuum cushion seam with dry upholstery nozzle; test a small concealed area with a white cloth and minimal moisture; clean cushion carefully with a white microfiber cloth, no saturation or steam; same sofa resting untouched next to open window; macro detail of matte grey microfiber.

### linho

Subject: natural beige linen sofa with clearly irregular slub weave.

Six cells in reading order: test a hidden linen seam with a white cloth; gently vacuum a linen cushion with upholstery brush nozzle; apply a small amount of compatible cleaning solution to white cloth next to cushion, no soaking; clean cushion using transparent extraction hand nozzle with minimal moisture, no visible steam; linen sofa and cushions resting in ventilated room by open window with no heat sources; macro detail of natural irregular linen weave.

### camurca

Subject: camel suede sofa with fine matte leather nap, no smooth shiny leather.

Six cells in reading order: inspect hidden suede seam using small soft white cloth; gently dry vacuum with soft brush attachment; use a suede-specific dry cleaning sponge on a small cushion area with no water, no bottles; gently groom suede nap with soft suede brush in one direction; same suede sofa resting untouched in airy room with indirect daylight; macro detail of matte camel suede nap.

### sintetico

Subject: cream faux leather sofa with uniform subtle embossed grain, consistent synthetic leather NOT real leather and no peeling repair.

Six cells in reading order: inspect concealed seam and condition of faux-leather surface; remove loose dust with soft dry white cloth; clean a cushion using a slightly damp white cloth with very little neutral cleaning foam; remove remaining residue using a fresh white cloth, no oil or conditioner; same sofa resting untouched away from direct sun and heat in ventilated room; macro detail of cream synthetic leather grain.


## Validação

Build de produção concluído (16045 rotas), TypeScript e ESLint dos componentes/dados partilhados sem erros. Confirmadas as cinco imagens do processo nas 434 rotas de sofá prerenderizadas. Verificadas em preview mobile de 390 px as 35 etapas dos sete materiais, as imagens próprias e a ordem preços → avaliações → exemplos → processo.

## Correção para seis etapas

### tecido

Create a photorealistic professional upholstery cleaning demonstration contact sheet, landscape 1536x1024, EXACTLY 3 columns by 2 rows of six equally sized square photographs, no gutters, no borders, no text. Same beige woven fabric sofa throughout in bright Portuguese living room. Six distinct scenes in reading order: 1 gloved hand inspecting a concealed seam with white cloth; 2 vacuum upholstery nozzle removing dry dust; 3 trigger spray bottle applying a small controlled amount of cleaning solution; 4 gloved hand using a soft upholstery brush to agitate cleaning solution across cushion, brush clearly visible; 5 professional transparent extraction nozzle drawing moisture from cushion; 6 whole sofa drying untouched beside open window in ventilated room. Realistic tools and anatomy, natural daylight, no logos, no before-after, no extra panels. Each action centered in its cell, photo documentary style.

### veludo

Create a photorealistic professional upholstery cleaning demonstration contact sheet, landscape 1536x1024, EXACTLY 3 columns by 2 rows of six equally sized square photographs, no gutters, no borders, no text. Same green velvet sofa throughout in bright Portuguese living room. Six distinct scenes in reading order: 1 gloved hand inspecting a concealed seam with white cloth; 2 vacuum upholstery nozzle removing dry dust; 3 trigger spray bottle applying a small controlled amount of cleaning solution; 4 gloved hand using a soft upholstery brush to agitate cleaning solution across cushion, brush clearly visible; 5 professional transparent extraction nozzle drawing moisture from cushion; 6 whole sofa drying untouched beside open window in ventilated room. Realistic tools and anatomy, natural daylight, no logos, no before-after, no extra panels. Each action centered in its cell, photo documentary style.

### microfibra

Create a photorealistic professional upholstery cleaning demonstration contact sheet, landscape 1536x1024, EXACTLY 3 columns by 2 rows of six equally sized square photographs, no gutters, no borders, no text. Same grey microfiber sofa throughout in bright Portuguese living room. Six distinct scenes in reading order: 1 gloved hand inspecting a concealed seam with white cloth; 2 vacuum upholstery nozzle removing dry dust; 3 trigger spray bottle applying a small controlled amount of cleaning solution; 4 gloved hand using a soft upholstery brush to agitate cleaning solution across cushion, brush clearly visible; 5 professional transparent extraction nozzle drawing moisture from cushion; 6 whole sofa drying untouched beside open window in ventilated room. Realistic tools and anatomy, natural daylight, no logos, no before-after, no extra panels. Each action centered in its cell, photo documentary style.

### linho

Create a photorealistic professional upholstery cleaning demonstration contact sheet, landscape 1536x1024, EXACTLY 3 columns by 2 rows of six equally sized square photographs, no gutters, no borders, no text. Same natural cream linen sofa throughout in bright Portuguese living room. Six distinct scenes in reading order: 1 gloved hand inspecting a concealed seam with white cloth; 2 vacuum upholstery nozzle removing dry dust; 3 trigger spray bottle applying a small controlled amount of cleaning solution; 4 gloved hand using a soft upholstery brush to agitate cleaning solution across cushion, brush clearly visible; 5 professional transparent extraction nozzle drawing moisture from cushion; 6 whole sofa drying untouched beside open window in ventilated room. Realistic tools and anatomy, natural daylight, no logos, no before-after, no extra panels. Each action centered in its cell, photo documentary style.

### camurca

Create a photorealistic professional upholstery cleaning demonstration contact sheet, landscape 1536x1024, EXACTLY 3 columns by 2 rows of six equally sized square photographs, no gutters, no borders, no text. Same camel suede-effect upholstery sofa throughout in bright Portuguese living room. Six distinct scenes in reading order: 1 gloved hand inspecting a concealed seam with white cloth; 2 vacuum upholstery nozzle removing dry dust; 3 trigger spray bottle applying a small controlled amount of cleaning solution; 4 gloved hand using a soft upholstery brush to agitate cleaning solution across cushion, brush clearly visible; 5 professional transparent extraction nozzle drawing moisture from cushion; 6 whole sofa drying untouched beside open window in ventilated room. Realistic tools and anatomy, natural daylight, no logos, no before-after, no extra panels. Each action centered in its cell, photo documentary style.

### sintetico

Create a photorealistic professional upholstery cleaning demonstration contact sheet, landscape 1536x1024, EXACTLY 3 columns by 2 rows of six equally sized square photographs, no gutters, no borders, no text. Same blue woven synthetic polyester sofa throughout in bright Portuguese living room. Six distinct scenes in reading order: 1 gloved hand inspecting a concealed seam with white cloth; 2 vacuum upholstery nozzle removing dry dust; 3 trigger spray bottle applying a small controlled amount of cleaning solution; 4 gloved hand using a soft upholstery brush to agitate cleaning solution across cushion, brush clearly visible; 5 professional transparent extraction nozzle drawing moisture from cushion; 6 whole sofa drying untouched beside open window in ventilated room. Realistic tools and anatomy, natural daylight, no logos, no before-after, no extra panels. Each action centered in its cell, photo documentary style.

Validação: TypeScript, ESLint e build concluídos. Sete guias verificados em mobile: seis com seis etapas, couro com cinco. Fundos de exemplos/processo/FAQ/pack confirmados como branco/verde/branco/verde.
