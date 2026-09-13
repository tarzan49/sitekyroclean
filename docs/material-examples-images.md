# Exemplos visuais de materiais

Pedido de 13/09/2026: substituir as características escritas por quatro imagens por material, incluindo variantes por localidade.

11 conjuntos e 44 cenas ilustrativas: duas vistas da peça e dois pormenores. Cada imagem quadrada contém uma grelha 2×2 sem margens. O componente apresenta as quatro células separadas por recorte CSS, como os guias de processo existentes. As imagens são exemplos gerados, nunca fotografias de clientes, resultados reais ou comprovação da composição de uma peça concreta.

Geração: ferramenta integrada ImageGen. Originais conservados em `$CODEX_HOME/generated_images/01a09b5e-acd2-70f3-93fc-f1dfa5a6bab5/`. Ficheiros WebP de produção em `public/images/materials/*-examples.webp`.

Apresentação: `MaterialExamplesGallery`; catálogo e descrições acessíveis em `src/data/materialExamples.ts`. A mesma fonte serve o HTML inicial em `scripts/prerender.ts`.

## Prompt comum

Use case: photorealistic-natural. Asset type: one photographic contact sheet for a material examples website section. Create a single square 2-by-2 contact sheet, exactly four equally sized square photographs filling the four quadrants edge-to-edge. No gaps, no borders, no text, no labels, no watermarks, no graphic overlays. Each quadrant is an independent scene with clear framing.

Premium but believable Portuguese home interiors, soft natural daylight, accurate tactile texture, understated editorial furniture photography. These are illustrative material examples, not before/after cleaning results. No humans, no cleaning tools. Keep all important features within each quadrant.

## Materiais e cenas (ordem: superior esquerda, superior direita, inferior esquerda, inferior direita)

### sofa-tecido

Material: woven fabric sofas, clearly visible woven upholstery, no velvet or leather.

Quadrants in reading order: oatmeal woven two-seat sofa with softly rounded arms in a daylight living room; charcoal woven modular sofa in a different living room; close-up of a warm grey woven sofa cushion seam; close-up of cream basketweave upholstery on a sofa arm.

### sofa-veludo

Material: velvet sofas, soft directional short pile and subtle light sheen, no coarse weave or leather.

Quadrants in reading order: forest green velvet two-seat sofa in a daylight living room; deep blue velvet curved sofa in a different interior; close-up of rust velvet cushion with natural directional pile shading; close-up of sage velvet upholstery on a curved sofa arm.

### sofa-pele

Material: genuine leather sofas, natural grain, supple creases, no fabric.

Quadrants in reading order: cognac leather sofa in a daylight living room; dark chocolate leather sofa in a different interior; close-up of tan leather sofa cushion showing fine natural grain and seam; close-up of dark brown leather arm with natural folds.

### sofa-microfibra

Material: microfiber upholstered sofas, very fine dense matte short fibers, almost suede-like synthetic upholstery, no obvious coarse weave, no velvet sheen.

Quadrants in reading order: warm grey microfiber two-seat sofa in a daylight living room; sand microfiber chaise sofa in a different interior; close-up of taupe microfiber cushion with fine uniform matte nap; close-up of slate microfiber upholstery on rounded sofa arm.

### sofa-linho

Material: linen upholstered sofas, distinct irregular slub weave with natural fibers and soft creases, not velvet.

Quadrants in reading order: natural flax beige linen sofa in a daylight living room; off-white linen sofa with soft cushions in a different interior; close-up of flax linen cushion seam with irregular slub weave; close-up of pale grey linen sofa arm with loose natural creases.

### sofa-camurca

Material: genuine suede sofas, fine matte velvety leather nap, no woven fabric, no smooth shiny leather.

Quadrants in reading order: camel suede sofa in a daylight living room; warm taupe suede sofa in a different interior; close-up of cinnamon suede cushion with soft nap shading and stitch; close-up of sand suede rounded sofa arm with velvety matte nap.

### sofa-sintetico

Material: synthetic upholstery examples including faux leather and woven polyester, distinguish the appearances.

Quadrants in reading order: cream faux-leather sofa in a daylight living room; grey woven polyester sofa in a different interior; close-up of black faux-leather sofa arm with uniform embossed grain; close-up of blue polyester woven sofa cushion with regular yarns.

### tapete-la

Material: wool rugs, thick natural wool fibers with slightly fuzzy texture, no synthetic sheen.

Quadrants in reading order: cream thick wool rug under a simple coffee table; grey wool rug with subtle geometric tufted pattern in a different living room; macro of ivory wool rug pile and bound edge; close-up of taupe wool loop pile rug with soft natural fibers.

### tapete-persa

Material: Persian-style hand-knotted rugs, intricate floral medallion designs and natural variations, no claimed actual antique provenance.

Quadrants in reading order: burgundy and navy Persian-style rug fully visible in a living room; ivory and muted blue Persian-style floral rug in a different interior; close-up of red navy floral wool pile details; close-up of rug corner gently turned to reveal small uneven knots and ivory fringe.

### tapete-sintetico

Material: synthetic rugs including polypropylene nylon polyester, regular manufactured pile.

Quadrants in reading order: grey polypropylene rug in a daylight living room; cream geometric polyester rug in a different interior; close-up of dense regular slate nylon pile with bound edge; close-up of pale beige polyester rug showing soft uniform synthetic fibers.

### tapete-sisal

Material: sisal and jute natural plant-fiber rugs, coarse dry woven texture, no wool pile.

Quadrants in reading order: rectangular natural sisal rug with brown fabric border in a daylight living room; round braided jute rug in a different interior; macro of tightly woven honey-colored sisal fibers and border; macro of chunky natural jute braided fibers.


## Validação

- Build completo: 16 045 rotas pré-renderizadas.
- Verificados os 682 URLs do sitemap de materiais: quatro imagens por página, alternativas textuais preenchidas e ficheiro correto para o material.
- TypeScript e lint dos ficheiros novos sem erros.
- Os 11 materiais apresentam quatro controlos de ampliação no navegador mobile; abrir/fechar imagem verificado e foco devolvido ao botão de origem.
- 11 ficheiros WebP, cerca de 3,5 MB no total, carregados apenas conforme o material visitado.
