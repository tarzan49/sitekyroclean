# Pré-visualização do widget de orçamento

Com `npm run dev` a correr: http://localhost:8080/widget-preview.html

`widget-preview.html` carrega `src/widget-preview.tsx`, que monta o
`PriceWidget` real, sozinho, numa coluna de 390px, com um seletor de serviço
(sofás, colchões, cadeiras, tapetes, impermeabilização) e Lisboa como
localidade inicial. É independente do `App.tsx`, só renderiza em
desenvolvimento (`import.meta.env.DEV`) e não entra no build de produção: o
`vite.config.ts` só constrói o `index.html`.

O que se vê é o componente que as páginas usam, sem cópias: `PriceWidget.tsx`
(apresentação, com o `QuizEstimate` do quiz no topo e o
`WaterproofingTierPicker`) e `use-price-widget.ts` (estado). Os preços vêm de
`src/lib/priceWidgetCalc.ts` sobre as tabelas do quiz; artigos sem preço
(tapetes, alcatifas, sofás de 4+ lugares) aparecem como sob orçamento. Não há
desconto percentual. «Continuar» abre o quiz com a seleção.

A versão anterior desta nota falava da porta 5188 e de uma branch de
pré-visualização que já não existem, e de uma poupança calculada por desconto
que saiu do código a 2026-09-10.
