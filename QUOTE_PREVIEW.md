# Pré-visualização do orçamento

Branch: `codex/quote-visual-preview`. Proposta local para avaliação; não aplicada à produção.

Abrir http://127.0.0.1:5188/__preview/orcamento com `npm run dev -- --host 127.0.0.1 --port 5188`.
A página usa o QuizForm e o motor de preços reais. Permite adicionar extras, editar quantidades e continuar no fluxo.

Validação: 19 testes passaram (estimativa, regras de preços e navegação dos extras). Verificação visual e interação no browser em desktop e 390 × 844. O build completo encontra erros de JSX preexistentes nas páginas LocationServicePage.tsx e SofaVariantPage.tsx da base 76922c8; não foram incluídas alterações a essas páginas nesta proposta.

## Imagens

Ferramenta: image_gen integrada. Asset final: `public/images/services/quote-furniture.png`, usado como sprite 2 × 2 sobre o verde existente.

Prompt final:

Generate a production website asset: a square 2x2 sprite sheet with four realistic isolated furniture product photos, on a fully transparent background. NO text, NO lines, NO icons, NO logos. Exactly four equal square quadrants, no borders or visible cell backgrounds. TOP LEFT: ivory quilted double mattress alone, three-quarter view showing top and thickness, no bed frame, no pillows. TOP RIGHT: elegant beige fabric two-seat sofa, three-quarter view, no room or accessories. BOTTOM LEFT: one beige upholstered dining chair with wood legs, entire chair in frame. BOTTOM RIGHT: cream natural textured rectangular rug, lying flat seen in three-quarter overhead perspective, no rolls or tassel clutter. Each object centered precisely inside its own quadrant with generous transparent margins at least 12% of cell on all sides. Object entirely contained inside its quadrant. All four photographed under identical soft studio lighting with subtle grounding shadow, sharp realistic fabric textures, warm neutral upholstery. The objects need to remain recognizable at 80px thumbnail size inside a premium dark forest green cleaning quote interface. Transparent true alpha background across all empty space, no checkerboard pattern baked in. This is an asset sprite sheet, not a UI mockup.


## Tamanhos distintos e combinação das propostas

Imagens geradas com image_gen: `public/images/services/quote-sofa-sizes.png` (2×2: poltrona de 1 lugar, sofás de 2, 3 e 4 lugares) e `public/images/services/quote-mattress-sizes.png` (solteiro estreito, casal médio, King largo). Mesma iluminação, tecido bege, fundo transparente, sem texto, com proporções e número de assentos diferentes. `QuizFurnitureImage` seleciona por sizeId e usa recortes individuais no sprite de colchões para evitar fragmentos da imagem vizinha. Verificados os três colchões e quatro sofás em 390×844.

A proposta conjunta mantém o cabeçalho e o picotado e reforça o contraste dos preços. O topo permite abrir a composição dos serviços, desconto e deslocação, calculados pelo motor real. Os 19 testes do orçamento continuam a passar.

## Cuidados adicionais e tapetes (2026-09-10)

Os upsells de colchões e cadeiras apresentam explicitamente «Desbacterização e Anti Ácaros», incluindo no resumo e recibo, sem alterar os preços. As imagens contextualizam cada serviço; os controlos selecionados e o botão de continuação tornam a opção escolhida mais clara. A impermeabilização conserva Essencial e Premium. Os tapetes incluem um guia visual largura × comprimento, medidas acessíveis e continuam sob orçamento.

Exemplos locais: `/__preview/orcamento?exemplo=antiacaros`, `?exemplo=impermeabilizacao`, `?exemplo=cadeiras` e `?exemplo=tapetes`. Validação: 22 testes passaram, incluindo seleção opcional dos tratamentos, preços e medidas dos tapetes. Verificados os ecrãs no navegador, incluindo impermeabilização e cadeiras a 390 × 844. Mantém-se a limitação de build da base descrita acima.

Pedido de simplificação (2026-09-10): nos upsells de colchão e sofá, clicar no cartão liga o tratamento para os artigos escolhidos; repetir o clique retira. Não expandir linhas por tamanho nem steppers abaixo do cartão. A seleção e o total no cabeçalho dão o feedback. Esta decisão substitui a apresentação anterior de detalhes após selecionar.
