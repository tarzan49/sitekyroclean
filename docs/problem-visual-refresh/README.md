# Galerias e tratamentos dos problemas

Pedido de 13/09/2026: grelha de quatro exemplos com ampliação, também nas localidades, freguesias, preços e variantes; tratamentos contextualizados por problema, com uma apresentação clara e imagens preservadas no site.

`VisualExamplesGallery` partilha grelha 2×2, legendas e diálogo acessível com materiais e problemas. `LandingServiceSections` usa as imagens estáveis do modelo, sem duplicar as sete secções; o pedido de avaliação passa para o detalhe ampliado e conserva a localidade/serviço do orçamento. As quatro FAQ e a navegação Ads são preservadas. O CSS da galeria impede que o tema dos antigos cartões escureça as legendas.

Oito imagens novas geradas pela ferramenta integrada `image_gen`: quatro exemplos em `public/images/problem-examples/`, quatro etapas em `public/images/problem-treatments/`. Prompts completos em `prompts.json`. Conversão para WebP sem cortes, um ficheiro por imagem, reutilizado entre páginas. Os originais anteriores não foram removidos. A galeria de manchas de sofá usa as quatro novas fotografias; os restantes problemas recebem a biblioteca estável do respetivo serviço, quando disponível, em vez de repetir as antigas ilustrações genéricas. Os 44 exemplos dos materiais continuam específicos do seu revestimento.

`problemTreatmentGuides.ts` define explicitamente avaliação, ação e limitações para cada endereço de problema. Não inventa um método por cidade nem diferenças técnicas entre variantes de pesquisa. Mantém diferenças reais: origem da mancha, tecido, enchimento, áreas de contacto, humidade, organização da visita e proteção escolhida. As etapas comuns não são apresentadas como técnicas exclusivas. `ProblemTreatmentGuide` mostra uma etapa de cada vez, fotografias separadas nos sofás e imagens existentes dos outros serviços com proporção correta. A opção de guardar aparece num detalhe discreto e reúne cada ficheiro uma vez.

Conteúdo partilhado entre as páginas nacionais, variantes locais e prerender. O verificador `scripts/audit-problem-treatments.ts` compara textos e exemplos com o HTML gerado.

## Referências e limites editoriais

Fontes internas: tabelas comerciais, `commercialPolicy.ts`, processos de materiais/serviços já aprovados. Referência externa para compatibilidade de fibras, teste de cores e limites de manchas: [WoolSafe: Cleaning and Maintenance of Fine Fibres](https://www.woolsafe.org/cleaning-maintenance-fine-fibres/) e [WoolSafe: Carpet & Rug Care Guide](https://www.woolsafe.org/carpet-rug-care-guide/). Não implica certificação WoolSafe da empresa. Não são acrescentadas receitas químicas, promessas clínicas ou remoção garantida. Bolor exige avaliação da origem da humidade; limpeza comum não é apresentada como remediação especializada.
