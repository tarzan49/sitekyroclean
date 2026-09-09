# Widget de orçamento

Pré-visualização local: http://127.0.0.1:5188/widget-preview.html

O componente partilhado PriceWidget usa as imagens do quiz, controlos à direita, contraste mais alto, seleção dourada e resumo de serviços, deslocação e poupança em euros. Os preços e a elegibilidade do desconto continuam no motor existente. Artigos sem preço são identificados como sob orçamento. Promoções de extras continuam no quiz.

A entrada widget-preview.html é independente de App.tsx e só renderiza em desenvolvimento. Não é incluída no build de produção padrão. As alterações do widget estão na branch de pré-visualização, não na produção.

Verificado: 20 testes existentes de cálculo; lint dos ficheiros alterados; visual e ausência de overflow horizontal a 390 e 320 px; 79 + 10 = 89; dois sofás de 79 mostram poupança de 16 e total 152 conforme arredondamento existente; Continuar transporta a seleção para o quiz com estimativa 89.
