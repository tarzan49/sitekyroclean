# Imagens ilustrativas dos problemas de colchões

Biblioteca de 40 imagens, dez por problema, destinada exclusivamente às landing pages de limpeza de colchões nas quatro famílias: localidade, freguesia, preço e variante keyword.

## Temas

1. Pó e resíduos: detalhes de costuras, fibras, cotão e pequenos resíduos.
2. Manchas de suor e líquidos: marcas visíveis no revestimento, sem comparação de resultados.
3. Odores acumulados: pessoas a verificar o odor, sem efeitos visuais que pretendam representar odores ou microrganismos.
4. Dúvidas sobre cuidados: observação do revestimento, costuras, etiqueta e resguardo. Não representa tratamento médico nem impermeabilização do colchão.

## Ficheiros e seleção

Os WebP de 1200 × 675 estão em `public/images/landing-problems/colchoes/`. O catálogo de produção está em `src/data/mattressProblemImages.ts`; os prompts completos e a origem estão em `prompts.json`. Gerados com a ferramenta integrada de imagens, não com CLI/API. A identificação pública é apenas «Imagem ilustrativa».

`selectLandingProblemImage` em `landingProblemImages.ts` escolhe uma imagem por problema com base no caminho normalizado da página. Query strings, âncoras e novas visitas não alteram a escolha. Não modifica a seleção existente dos sofás. O modelo partilhado fornece a mesma imagem ao React e ao HTML inicial. As outras famílias e os restantes serviços mantêm as imagens anteriores.

A diversidade das imagens é visual; não garante conteúdo único nem resultados de indexação. As quatro perguntas por página e a seleção editorial existente mantêm-se.

## Verificação

`node scripts/audit-mattress-image-library.mjs` verifica quantidade, correspondência dos grupos, dimensões, peso e duplicados binários. Os testes `mattressProblemImages.test.ts` percorrem as 2.152 rotas de colchões, verificam os quatro temas, as quatro FAQ, a estabilidade e o uso das 40 imagens. `LandingServiceSections.test.tsx` compara o conteúdo React nas quatro famílias com o modelo. Depois do build, `scripts/audit-landing-layout.mjs` e `scripts/audit-landing-faqs.mjs` verificam as 12.912 landing pages.

Verificado em 13/09/2026: 40 imagens revistas visualmente, 3.029.514 bytes no total, dez por grupo, sem ficheiros binários duplicados. Suite de testes, TypeScript, lint dos ficheiros alterados e build concluídos. Auditorias das 12.912 landing pages sem divergências nem ligações em falta. Amostra mobile 390 × 844: Lisboa, Porto/Paranhos, preço Lisboa e higienização de colchão Lisboa, todas com quatro imagens, quatro perguntas e sem transbordo horizontal. Alteração no ramo de pré-visualização; não constitui confirmação de publicação em produção.
