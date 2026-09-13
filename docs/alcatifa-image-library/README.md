# Biblioteca de imagens ilustrativas: alcatifas

Verificado em 13/09/2026: 40 imagens revistas, 4.814.504 bytes, zero duplicados binários. 1.967 testes aprovados, TypeScript/lint e build de 16.045 rotas concluídos. Auditorias das 12.912 landing pages sem divergências ou ligações em falta. Quatro famílias verificadas em mobile 390 × 844, com quatro imagens carregadas, quatro perguntas, ampliação funcional e sem overflow horizontal. Nenhum contacto enviado. Integração no ramo de pré-visualização; publicação em produção não confirmada.

40 imagens, dez por tema: passagem escurecida, café, rodapés e fibras compactadas nas escadas. Alcatifas continuam sempre sob orçamento. Limpeza não promete reparar desgaste permanente.

WebP de 1200 × 675 em `public/images/landing-problems/alcatifas/`. Catálogo em `src/data/alcatifaProblemImages.ts`. Prompts completos e origem em `prompts.json`; geração pela ferramenta integrada, sem CLI/API. Identificação pública: «Imagem ilustrativa» ou «Imagens ilustrativas».

Seleção estável pelo URL, independente por problema, ignorando parâmetros e âncoras. O mesmo modelo fornece as imagens ao React e ao HTML inicial das quatro famílias: localidade, freguesia, preço e variante. Preserva as quatro perguntas, os preços e as bibliotecas dos restantes serviços. Não modifica as galerias de trabalhos reais nem as páginas autónomas de materiais/problemas.

Verificação repetível: `scripts/audit-alcatifa-image-library.mjs` verifica dimensões, peso, origem e duplicados binários; `alcatifaProblemImages.test.ts` percorre as 2.152 rotas, a estabilidade e o uso das 40 opções. `LandingRemainingImages.test.tsx` verifica a apresentação React nas quatro famílias dos dois últimos serviços. As auditorias gerais cobrem as 12.912 landing pages após o build.
