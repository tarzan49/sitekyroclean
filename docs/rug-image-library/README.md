# Biblioteca de imagens ilustrativas de tapetes

40 imagens, dez por tema: sujidade nas fibras, manchas de bebidas/alimentos, pelos/resíduos de animais e cores alteradas/fibras gastas. Tapetes soltos, não alcatifas. Sem impermeabilização, comparações antes/depois ou promessas de restauro.

## Ficheiros e origem

WebP de 1200 × 675 em `public/images/landing-problems/tapetes/`. Catálogo partilhado em `src/data/rugProblemImages.ts`. Prompts completos e origem em `prompts.json`; imagens produzidas pela ferramenta integrada, sem CLI/API. Identificação pública: «Imagem ilustrativa».

## Integração

`selectLandingProblemImage` escolhe a biblioteca do serviço e uma alternativa do problema, de forma estável pelo URL. Ignora parâmetros e âncoras. Não modifica as escolhas dos sofás/colchões. O modelo partilhado entrega as mesmas imagens ao React e ao HTML inicial das quatro famílias: localidade, freguesia, preço e variante keyword. As páginas autónomas de materiais/problemas não consomem esta biblioteca.

Mantém as quatro perguntas por página e todas as condições comerciais: tapetes sempre sob orçamento. A diversidade visual não garante indexação nem conteúdo único.

## Verificação

`node scripts/audit-rug-image-library.mjs` valida ficheiros, dimensões, peso, grupos e duplicados binários. `rugProblemImages.test.ts` percorre as 2.152 rotas de tapetes e verifica estabilidade, correspondência com o HTML inicial e uso das 40 imagens. `LandingServiceSections.test.tsx` compara React com o modelo nas quatro famílias. Após o build, as auditorias de layout e FAQ cobrem as 12.912 landing pages.

Verificado em 13/09/2026: 40 imagens revistas, dez por grupo, 5.057.474 bytes no total e nenhum duplicado binário. Testes, TypeScript, lint dos ficheiros alterados e build concluídos. Auditorias das 12.912 páginas sem divergências nem ligações em falta. Amostra mobile 390 × 844 em Lisboa, Porto/Paranhos, preço Lisboa e higienização de tapetes Lisboa: quatro imagens carregadas, quatro perguntas e sem transbordo horizontal. Alteração no ramo de pré-visualização, sem confirmação de publicação em produção.
