# Otimização de desempenho mobile

Pedido: corrigir os bloqueios encontrados na auditoria e superar 90/100 em desempenho Lighthouse mobile. A pontuação é uma simulação por URL, não uma percentagem fixa de velocidade nem uma medição de todos os visitantes.

## Alterações

- WebP para os guias e imagens do orçamento. Originais preservados. Guia de sofá: 2.163.172 → 174.580 bytes; tamanhos de sofá: 1.105.232 → 33.836 bytes; colchões: 1.278.566 → 25.152 bytes; mobiliário: 1.238.258 → 42.768 bytes.
- Miniaturas próprias para a galeria; fotografias completas continuam na comparação. Derivados de 600 px para os 240 exemplos ilustrativos, selecionados por `srcset`; ampliação conserva o original.
- Pré-carregamento do primeiro par de comparação e do código específico da página, com os endereços reais do build. Homepage pré-carrega as suas fotografias atuais. Fotografias desktop escondidas deixam de ser descarregadas no mobile.
- `GeneratedRoutePage` lê o tipo de página emitido pelo prerender. `generatedRouteIndex.ts` conserva o inventário e precedência originais para navegação interna e endereços sem HTML. Não são montados milhares de elementos Route.
- As quatro famílias carregam as secções inferiores com uma fronteira Suspense própria, permitindo mostrar o hero antes.
- `QuizFormLazy` importa o formulário apenas na primeira abertura e conserva-o após fechar. A configuração e preços permanecem no mesmo motor.
- Fontes Avenir com subconjunto latino de 11–12 KB por peso e ficheiros originais para caracteres adicionais. Retiradas as camadas de desfoque/releituras de layout durante scroll mobile e a animação de entrada da página.
- Google Analytics/Ads e medição própria só são ativados depois de aceitar. A política permite reabrir preferências. A campanha autorizada acompanha o pedido no campo existente `notes` do CRM e no Formspree, sem novas colunas nem alteração da origem Website. O formulário simples emite `generate_lead` apenas após entrega, sem valor de receita.
- Removidas datas de alteração inventadas a cada build dos sitemaps. Corrigidos textos principais de metadados com promessas antigas de uma hora/cobertura nacional e tratamentos incluídos.

## Reproduzir

`node scripts/optimize-performance-assets.mjs` reconstrói os derivados de imagens. `scripts/subset-performance-fonts.py` requer `fonttools[woff]`. Ambos preservam os originais.

`npm test`, `npx tsc -p tsconfig.app.json --noEmit`, `npm run build`, `node scripts/audit-performance-build.mjs`, `node scripts/audit-landing-layout.mjs`, `node scripts/audit-landing-seo.mjs` e `node scripts/audit-landing-faqs.mjs`.

Lighthouse: configuração mobile predefinida, sessão limpa, sem aceitar cookies. Para comparação local foi usado HTTPS/HTTP2 com compressão; o preview HTTP/1 não reproduz a entrega da Cloudflare. Não foram usados parâmetros que relaxassem rede ou CPU. Resultados públicos serão documentados no relatório final depois da publicação.

## Validação antes de publicar

1.983 testes aprovados. Auditorias de estrutura/SEO/FAQ nas 12.912 landing pages sem falhas. Auditoria de pré-carregamentos e metadados de despacho: 15.949 HTMLs sem falhas. Build de 16.045 rotas. Navegação mobile sem erros JavaScript nem overflow na amostra; confirmação de que o formulário não é descarregado fechado e abre com 79€ + 10€ em Lisboa. Sem contactos externos enviados.

Medições locais mais recentes: homepage 95/100, LCP 2,73 s, TBT 0 ms, CLS 0, cerca de 397 KB; Lisboa 91/100, LCP 3,39 s, TBT 0 ms, CLS 0,005, cerca de 706 KB. Ainda falta confirmação pública e amostra das restantes famílias.

## Verificação pública após 1123783: objetivo ainda não atingido

A publicação 1123783 foi concluída no Cloudflare Pages. Na amostra pública mobile, Lisboa obteve 66/100 (LCP 6,87 s, TBT 282 ms), a entrada Ads 85/100 (4,11 s, 73 ms), veludo 68/100 e urina no colchão 63/100. A primeira medição da homepage encontrou ficheiros temporariamente indisponíveis durante a propagação e precisa de repetição. Estes resultados públicos substituem qualquer interpretação de que os valores locais já comprovavam a meta de 90.

O trace público identifica custo significativo no script Cloudflare `/cdn-cgi/challenge-platform/scripts/jsd/main.js`. Não é a única causa: o endereço do deployment sem esse script obteve 73/100. Um controlo com HTTP/2, mantendo a simulação mobile de rede e CPU, obteve 78/100; não substitui a medição predefinida. O acesso ao painel autenticado no Safari depende da permissão de controlo do computador, que a ferramenta recusou.

Segunda correção: ícones reunidos num módulo para reduzir pedidos, animação de comparação sem atualização React em cada frame e cache de um ano apenas para ficheiros com hash em `/assets/`. Na validação local HTTP/2 de Lisboa: 91/100, LCP 3,32 s, TBT 5 ms e 56 pedidos JavaScript. Build, TypeScript e auditoria dos 15.949 HTMLs passaram. A meta pública continua pendente; a cache beneficia visitas seguintes e não é apresentada como prova de melhoria numa visita sem cache.

Referências: [headers Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/headers/) e [JavaScript Detections](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/).

## Contas e serviços por verificar

Configuração/importação de conversões Google Ads, identificação/configuração Meta, Search Console, quotas do Formspree, DNS de www e verificação de permissões da base de dados não são demonstradas por estes testes de código. Não se inventou acesso às contas nem foram enviados pedidos comerciais. Confirmação rápida após apenas um canal e entrega durável do segundo exigem rever a entrega no servidor; mantida a espera pelos dois canais para não perder fotografias/email.
