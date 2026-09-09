# Pré-visualização do orçamento

Branch: `codex/quote-visual-preview`. Proposta local para avaliação; não aplicada à produção.

Abrir http://127.0.0.1:5188/__preview/orcamento com `npm run dev -- --host 127.0.0.1 --port 5188`.
A página usa o QuizForm e o motor de preços reais. Permite adicionar extras, editar quantidades e continuar no fluxo.

Validação: 19 testes passaram (estimativa, regras de preços e navegação dos extras). Verificação visual e interação no browser em desktop e 390 × 844. O build completo encontra erros de JSX preexistentes nas páginas LocationServicePage.tsx e SofaVariantPage.tsx da base 76922c8; não foram incluídas alterações a essas páginas nesta proposta.

## Imagens

Ferramenta: image_gen integrada. Asset final: `public/images/services/quote-furniture.png`, usado como sprite 2 × 2 sobre o verde existente.

Prompt final:

Generate a production website asset: a square 2x2 sprite sheet with four realistic isolated furniture product photos, on a fully transparent background. NO text, NO lines, NO icons, NO logos. Exactly four equal square quadrants, no borders or visible cell backgrounds. TOP LEFT: ivory quilted double mattress alone, three-quarter view showing top and thickness, no bed frame, no pillows. TOP RIGHT: elegant beige fabric two-seat sofa, three-quarter view, no room or accessories. BOTTOM LEFT: one beige upholstered dining chair with wood legs, entire chair in frame. BOTTOM RIGHT: cream natural textured rectangular rug, lying flat seen in three-quarter overhead perspective, no rolls or tassel clutter. Each object centered precisely inside its own quadrant with generous transparent margins at least 12% of cell on all sides. Object entirely contained inside its quadrant. All four photographed under identical soft studio lighting with subtle grounding shadow, sharp realistic fabric textures, warm neutral upholstery. The objects need to remain recognizable at 80px thumbnail size inside a premium dark forest green cleaning quote interface. Transparent true alpha background across all empty space, no checkerboard pattern baked in. This is an asset sprite sheet, not a UI mockup.
