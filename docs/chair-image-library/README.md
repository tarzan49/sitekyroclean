# Biblioteca de imagens ilustrativas de cadeiras

40 imagens, dez por tema: sujidade diária, manchas, odores e desgaste. Cadeiras estofadas identificáveis, sem confusão com sofás ou colchões. Sem resultados reais, comparações antes/depois ou aplicação de impermeabilização.

WebP de 1200 × 675 em `public/images/landing-problems/cadeiras/`. Catálogo em `src/data/chairProblemImages.ts`. Prompts completos e origem em `prompts.json`; geração pela ferramenta integrada, sem CLI/API. Identificação pública: «Imagem ilustrativa» ou «Imagens ilustrativas», conforme o apresentador partilhado.

`selectLandingProblemImage` escolhe a biblioteca do serviço e uma alternativa por problema de forma estável pelo URL. Ignora parâmetros e âncoras e preserva as escolhas dos restantes serviços. O modelo partilhado entrega as mesmas imagens ao React e ao HTML inicial das quatro famílias. Não altera preços, as quatro perguntas por página nem páginas autónomas de materiais/problemas.

`scripts/audit-chair-image-library.mjs` verifica ficheiros, dimensões, peso, grupos e duplicados binários. `chairProblemImages.test.ts` percorre as 2.152 rotas de cadeiras e verifica temas, estabilidade, HTML inicial e uso das 40 imagens. `LandingChairImages.test.tsx` verifica a apresentação nas quatro famílias. As auditorias de layout e FAQ cobrem as 12.912 landing pages após o build.

Verificado em 13/09/2026: 40 imagens revistas visualmente, dez por tema, 4.058.804 bytes e nenhum duplicado binário. Testes, TypeScript, lint dos ficheiros alterados e build concluídos; auditorias das 12.912 páginas sem divergências nem ligações em falta. Verificação mobile 390 × 844 em Lisboa, Porto/Paranhos, preço Lisboa e higienização de cadeiras Lisboa: quatro imagens carregadas, quatro perguntas e sem transbordo horizontal. Ampliação e fecho da imagem verificados. Integração no ramo de pré-visualização, sem confirmação de publicação em produção.
