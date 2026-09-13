# Kyro: auditoria de tipografia e legibilidade

13 de setembro de 2026 · Site público, versão local e proposta Avenir Next

## Parecer

**Avenir Next é uma direção adequada para a Kyro. A troca isolada de fonte não torna o site acessível a pessoas mais idosas ou com baixa visão. Recomendo a adoção acompanhada por correções de contraste, escala e comportamento do texto, antes da publicação global.**

A proposta tem melhor continuidade entre apresentação e orçamento e os títulos em Demi/600 ganharam presença sem a densidade da Lora rejeitada. Esta é uma avaliação de design baseada no resultado observado. Não foi feito um estudo com utilizadores que demonstre maior velocidade de leitura. Em particular, não há evidência nesta auditoria de que Avenir Next seja mais legível que a Inter que já serve o texto corrente.

O maior problema transversal é a associação de texto pequeno, pouca diferença de luminosidade entre letra e fundo e informação importante tratada como legenda.

## Cobertura e método

- Inspeção transversal dos estilos e componentes públicos: varrimento de 125 ficheiros TSX, excluindo nomes de admin/CRM, testes e pré-visualizações; leitura adicional de CSS, configuração tipográfica e comparador. Não é uma contagem de páginas publicadas nem um conjunto de falhas automaticamente confirmadas.
- A varredura encontrou 693 ocorrências literais de classes de texto entre 8 e 15 px, incluindo `text-xs` e `text-sm`, em 97 ficheiros. Algumas servem conteúdo secundário ou versões responsivas; não são 693 violações WCAG.
- Medição no navegador de oito percursos: homepage; limpeza de sofás; colchões em Paranhos; artigo de preços de sofá; packs; orçamento (tratamento, sugestões, contacto e saída); página inglesa de Albufeira; comercial do Porto. Política de privacidade foi verificada adicionalmente.
- Comparação efetiva Cormorant/Inter versus Avenir na página de Paranhos. Nos restantes modelos foi auditada a versão existente, não uma implementação global Avenir que ainda não existe.
- Larguras observadas: 1210, 390 e 320 CSS px, conforme a amostra. Homepage, sofás, artigo, packs e Paranhos não apresentaram largura documental superior ao viewport nos testes estreitos realizados. Isto não prova que todos os componentes ou estados estejam livres de recortes.
- Teste separado de espaçamento aumentado numa cópia temporária de Paranhos: entrelinha 1,5; espaço entre letras 0,12 em; entre palavras 0,16 em; margem inferior dos parágrafos 2 em. Títulos e linhas de artigos adaptaram-se verticalmente na amostra visual a 320 px. Não é uma aprovação de todos os estados do orçamento.
- Contrastes calculados pela fórmula de luminância WCAG, compondo a transparência sobre o fundo indicado. Fundos fotográficos, gradientes e elementos sobrepostos exigem avaliação local; os rácios apresentados como exatos referem-se aos pares sólidos especificados.
- Foram consideradas as alterações locais existentes durante a auditoria. O repositório estava a receber trabalho noutras tarefas. Não foi alterado código de produto nesta auditoria.

**Limites:** não foram abertas individualmente as milhares de URLs geradas; a cobertura transversal vem dos modelos e componentes partilhados. Não foram testados leitores de ecrã, utilizadores reais, aparelhos iOS/Android nem Windows. A tentativa de zoom por atalho no navegador integrado não confirmou uma ampliação real, pelo que 200% de zoom nativo fica por validar. O ensaio a 320 px não substitui esse teste nem uma certificação completa WCAG.

## 1. A hierarquia precisa de uma escala coerente

Medições da página de Paranhos a 390 px:

| Elemento | Atual | Proposta Avenir | Leitura do resultado |
|---|---:|---:|---|
| Título principal | 28 px / 600, pelo modelo | 30 px / 600 | Melhora discreta; ainda muito próximo dos H2 |
| Título da tabela de preços | 29,6 px / 700 | 28 px / 600 | A forma mais cheia da Avenir sustenta uma dimensão menor |
| Entrelinha do título de preços | 32,56 px | 33,6 px | Mais espaço relativo, apesar do tamanho menor |
| Descrição da tabela | 15 px / 400 | 16 px / 400 | Melhoria concreta de tamanho e contraste |
| Entrelinha da descrição | 24,375 px | 27,2 px | Boa margem para leitura |
| Título do widget | 24 px / 700 | 21 px / 600 | Mais funcional e menos dominante |
| Artigo no widget | 13 px | 13 px | Continua pequeno; a nova fonte não o corrige |
| Preço unitário no widget | 14 px | 14 px | Deve ganhar destaque face à descrição |

A 1210 px, a proposta tinha H1 de 41,14 px e H2 de 32,67 px; os limites máximos definidos são 48 e 38 px. Não se deve dizer que todos os desktops já apresentam esses máximos.

Na homepage móvel atual, o H1 mede 28 px e os H2 29,6 px: a hierarquia é parcialmente invertida. No blog, os H2 do artigo medem 20 px mas o H2 das FAQs mede 29,6 px. Nos packs, o H1 tem 36 px e peso 400. Há padrões diferentes para funções semelhantes.

**Recomendação:** estabelecer estilos por função, não aplicar uma dimensão única a todos os `h2`. Um título de secção comercial, um título de artigo e um passo de formulário têm necessidades diferentes.

## 2. Contraste: falhas objetivas, presentes também na proposta

WCAG AA exige 4,5:1 para texto normal e 3:1 para texto grande. Texto grande é aproximadamente 24 CSS px regular ou 18,67 px em negrito. O tamanho de 16 ou 18 px, isoladamente, não é uma exigência universal WCAG.

| Par de cores / uso | Rácio aproximado | Resultado |
|---|---:|---|
| Dourado `#D4AF37` sobre creme `#FDFDF9` | 2,06:1 | Falha mesmo em títulos grandes |
| Texto `#111111` a 45% sobre branco (menu) | 3,04:1 | Falha para os 11 px do menu |
| Texto `#111111` a 50% sobre creme (argumentos) | 3,53:1 | Falha para os 13–14 px usados |
| Texto `#111111` a 55% sobre creme (descrição padrão) | 4,15:1 | Fica abaixo de 4,5:1 |
| Texto `#505650` sobre creme (descrição da proposta) | 7,39:1 | Boa melhoria; supera 7:1 |
| Dourado `#B8912A` sobre creme (argumentos) | 2,89:1 | Também falha como texto normal |
| Branco a 40% sobre `#1a2a1a` (exemplos dos campos) | 3,65:1 | Falha para texto normal |
| Branco sobre `#25D366` (parte clara de certos botões WhatsApp) | 1,98:1 | Falha para os rótulos pequenos |
| Dourado canónico sobre verde `#071a12` | 8,57:1 | Excelente neste par sólido |
| Texto `#111111` sobre dourado canónico | 8,98:1 | Boa solução para botões |

**A cor da marca pode ser preservada.** Recomendo o dourado canónico em fundos escuros, bordas, ícones decorativos e fundos de botões com texto escuro. Em fundo claro, usar texto verde/preto e reservar o dourado para o detalhe gráfico. Não proponho regressar aos castanhos/ocres rejeitados nos guias. Esta revisão da aplicação da cor precisa de ser aprovada antes da implementação.

Fontes: `SectionHeader.tsx:17–26`, `Header.tsx:65–66`, `ServiceTrustBlock.tsx:48–53`, `ServiceExpertTips.tsx:31–38`, `HeroV1.tsx:137–155`, `EnServicePage.tsx:169–172`, `QuizStepContact.tsx:52–66`.

## 3. Prioridade alta: ações e condições pouco legíveis

### Sair do orçamento

No ecrã de saída, “Sair por agora” foi medido a 12 px, branco com 20% de opacidade. Visualmente quase desaparece. É uma ação disponível e relevante, pelo que não beneficia da exceção de contraste para controlos desativados. Deve receber pelo menos 14–16 px e contraste de texto normal. Fonte: `src/components/QuizForm.tsx:955`.

### Dados de contacto

Campos: 16 px e 48 px de altura, uma base positiva. Etiquetas “Nome” e “Telemóvel / WhatsApp”: 11 px, maiúsculas, branco a 65%. A nota inferior usa 11 px e branco a 30%; sobre o verde sólido de referência corresponde a cerca de 2,68:1. Os exemplos dos campos usam branco a 40%.

Recomendo etiquetas de 15–16 px, exemplos com contraste mínimo 4,5:1 e notas de 14–16 px. Manter nome e telefone no início e resumo fechado, respeitando a simplificação já aprovada. Fontes: `src/components/quiz/steps/QuizStepContact.tsx:32–81`, `src/components/QuizForm.tsx:887`.

### Preços e deslocação

O widget tem nomes de artigos a 13 px, preços a 14 px e deslocação a 12 px. São informações necessárias à decisão de compra. Recomendo nomes e condições a 16 px, preços a 18 px/600 e números de quantidade a 18 px. Os botões de quantidade já medem 44 px no mobile; aumentar a letra não deve diminuir esse alvo. Fonte: `src/components/PriceWidget.tsx:208–227`.

### Homepage

Os cartões de serviços chegam a mostrar títulos de 14,08 px em Cormorant e preços a 10 px com branco a 45%. A fonte pode mudar, mas preço de entrada não deve continuar com tratamento de microlegenda. Fonte: `src/components/Services.tsx:329–332`.

## 4. Texto corrente e descrições

O blog tem uma base relativamente boa: 16 px, entrelinha 26 px e texto escuro a 70% sobre fundo claro. Para leitura prolongada pelo público indicado, recomendo 18 px e linhas de aproximadamente 55–70 caracteres no computador; esse intervalo é uma orientação editorial, não um requisito AA.

As FAQs têm perguntas a 15 px/600 e respostas a 14 px, entrelinha 28 px. O problema principal aí é o tamanho, não a falta de espaço entre linhas. Usaria perguntas de 17–18 px e respostas de 16–18 px, com 1,6–1,7 de entrelinha. O controlo inteiro tem pelo menos 72 px de altura, foco visível e estado expandido comunicado: são aspetos positivos. Fonte: `src/components/ServiceFAQ.tsx:87–132`.

Nas versões inglesa e comercial repete-se o padrão H1 de 28 px, introdução de 14 px e notas de 12 px com opacidades baixas. Nas páginas de marcas há descrições de processo a 12 px/55%; em problemas há introduções limitadas a duas linhas. A política de privacidade tem 15 px, entrelinha 24,375 px e `#333`, com contraste confortável, mas beneficiaria de 17–18 px para texto longo.

O título não precisa de crescer sempre que a descrição cresce. A proposta deve equilibrar tamanho, peso e espaço: reduzir a descrição para fazer o título parecer maior seria a correção errada.

## 5. O próprio protótipo ainda tem limitações

- A melhoria de contraste da proposta está concentrada em `#precos`, não em todo o site.
- Os argumentos de confiança mantiveram **13 px e cinzento a 50%**, porque usam cores inline que não são abrangidas pelo seletor do protótipo. A aparência mais legível da introdução não se estende automaticamente a esses argumentos.
- Os H1/H2 usam `clamp()` com mínimos/máximos em px e parte central em `vw`. Para a solução final, usar unidades relativas e verificar ampliação real; não basta substituir px por rem sem ensaio.
- A proposta comprime pesos 600 a 900 para a mesma face Demi local. Isso é aceitável para demonstrar uma direção, mas não representa uma hierarquia final de pesos reais. Carregar apenas os pesos licenciados necessários e mapear cada um corretamente.
- As classes editoriais explícitas e `font-sans` precisam de inventário na migração. Mudar só a configuração de `font-playfair` não resolve as famílias declaradas diretamente em CSS nem as exceções.
- A fonte local está disponível neste Mac; isso não assegura Avenir em Windows/Android. A publicação precisa de webfonts licenciadas, carregamento verificado e fallback com métricas razoavelmente próximas. Não recomendo comprar a família completa sem verificar os pesos e a licença necessários.

Fonte principal: `src/components/FontComparisonPanel.tsx:96–141`; estilos explícitos em `src/index.css:177–214`.

## 6. Escala recomendada para a Kyro

Valores de partida de design, com raiz normal de 16 px. Devem ser implementados em unidades relativas e testados com conteúdos reais. Não são uma transcrição dos requisitos WCAG.

| Função | Mobile | Computador | Peso / entrelinha |
|---|---:|---:|---|
| H1 de apresentação | 32–34 px | 44–48 px | 600 / 1,2 |
| H2 de secção comercial | 27–30 px | 34–38 px | 600 / 1,25 |
| H2 dentro de artigo | 24–26 px | 28–30 px | 600 / 1,3 |
| Título de passo do orçamento | 23–24 px | 26–28 px | 600 / 1,3 |
| H3 de cartão | 20–22 px | 22–24 px | 600 / 1,3 |
| Introdução de secção | 18 px | 18–20 px | 400 / 1,6 |
| Texto corrente e respostas | 16–18 px; preferir 18 em leitura longa | 18 px | 400 / 1,6–1,7 |
| Etiquetas, opções e botões | 16 px | 16 px | 500–600 / 1,4–1,5 |
| Preços unitários | 18 px | 18–20 px | 600 / 1,4 |
| Notas secundárias | 14–16 px | 14–16 px | 400–500 / 1,5 |

Usar espaço entre letras normal no corpo e apenas ligeiramente apertado nos títulos. A proposta atual usa −0,035 em no H1 e −0,025 em no H2; eu testaria −0,015 a −0,02 em antes de fixar a regra. Não usar maiúsculas muito espaçadas para instruções, condições ou texto longo.

Alvo prático: pelo menos 4,5:1 em todo o texto funcional, procurando 7:1 no texto corrente. Os 7:1 são um objetivo mais exigente, útil para o público indicado; não uma obrigação AA geral.

## 7. Decisão e sequência de implementação

1. Aprovar Avenir Next como direção visual, mantendo Demi/600 nos títulos. A hierarquia passa pela fonte, mas também pelo sistema acima.
2. Corrigir primeiro os contrastes de ações, campos, preços e texto em fundo claro. Preservar o dourado da marca, alterando a sua função ou o fundo quando necessário.
3. Aplicar estilos partilhados por função a homepage, serviços/localidades/variantes, marcas/problemas/materiais, blog/guias, inglês/comercial, packs e orçamento. Manter exceções intencionais, por exemplo o título de artigo não precisa da escala de uma hero.
4. Validar zoom nativo a 200%, adaptação equivalente a 320 CSS px, preferência de texto maior e todos os espaçamentos WCAG nas etapas do formulário. Verificar recortes por alturas fixas e `line-clamp`, sobretudo nos tratamentos e botões.
5. Fazer uma pequena sessão de tarefas com pessoas mais idosas: encontrar preço e deslocação, escolher um artigo, ler as condições, corrigir a quantidade, sair e chegar ao contacto. Observar erros e esforço de leitura; não pedir apenas se “gostam”.
6. Só então publicar com a licença web e confirmar o resultado em Windows/Android/iOS.

**Veredito:** a escolha da fonte é um passo bem dado. O site e a pré-visualização ainda apresentam barreiras de leitura que impedem considerá-los adequados, no conjunto, ao público de baixa visão. A próxima melhoria deve ser tipografia e contraste em conjunto, sem outra ronda de troca de famílias.

## Referências

- [W3C: contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [W3C: redimensionamento do texto](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- [W3C: reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [W3C: espaçamento de texto](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [W3C: acessibilidade para pessoas mais idosas](https://w3c.github.io/wai-website/older-users/developing/)
- [Avenir Next: família e licenciamento](https://www.myfonts.com/collections/avenir-next-pro-font-linotype)
