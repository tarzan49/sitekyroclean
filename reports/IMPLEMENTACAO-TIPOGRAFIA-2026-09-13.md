# Avenir Next: implementação e verificação

Implementação na branch `codex/avenir-accessibility`, com pré-visualização local na porta 8086. A fonte vem dos WOFF2 fornecidos pelo responsável, que confirmou licença web. Regular 400, Medium 500, Demi 600, Bold 700 e Italic 400; sem dependência da instalação de Avenir no Mac.

## Alterações

- Família comum nos títulos, descrições, navegação e orçamento. Removido o carregamento normal de Cormorant/Inter do Google Fonts.
- Escalas separadas: página 32–48 px; secção 28–38 px; artigo 24–30 px; orçamento 24–28 px; cartões 20–24 px. Títulos Demi 600.
- Texto corrido longo e introduções partilhadas 18 px. Opções e descrições antes de 13–15 px passam a 16 px; notas antes de 8–12 px passam a 14 px. Rótulos de contacto 16 px.
- Descrições claras e placeholders com mais contraste; saída do orçamento legível. Destaques dos cabeçalhos partilhados, guias claros, pontos de confiança e artigos da homepage passam a verde escuro sobre fundo claro.
- Texto escuro nos botões WhatsApp da homepage, cabeçalho e barra fixa. Dourado gráfico preservado.
- Menus legíveis com navegação recolhida antes de faltar espaço. Widget adapta controlos a caixas estreitas; botões principais podem crescer em altura.
- Corrigido o alargamento da grelha da homepage quando o texto aumentou. Mantidos os preços, cálculos e a ordem do contacto.

## Verificação realizada

- TypeScript: sem erros.
- Testes existentes: 26 ficheiros, 1 911 testes aprovados.
- ESLint dos ficheiros alterados: sem erros; seis avisos preexistentes de hooks/exportações.
- Build de produção e prerenderização concluídos (16 045 rotas).
- Navegador: homepage, página de Paranhos, artigo e packs; 320 e 390 px, mais janela de computador. Percurso colchão → tratamento sem extra → sugestões sem extra → contacto → saída, sem enviar pedido.
- Medidas observadas a 320 px: h1 32 px, secção 28 px, orçamento 24 px, artigo h2 24 px. Texto de artigo 18 px / entrelinha 30,6 px.
- Página de preços a 320 px com entrelinha 1,5, espaço entre letras 0,12 em, palavras 0,16 em e parágrafos 2 em: controlos utilizáveis e documento sem alargamento horizontal.
- Simulação de raiz tipográfica a 200% em janela de 1280 px: página de Paranhos sem alargamento horizontal. Não equivale a certificação de zoom nativo.

## Limites

Não é uma certificação WCAG nem um teste com participantes idosos ou com baixa visão. A combinação extrema de raiz a 200%, espaçamento aumentado e janela de 320 px revelou alargamento; foi reforçada a compacidade do cabeçalho, mas não se declara esse cenário integralmente resolvido. O teste de zoom nativo, Windows/Android reais, fundos fotográficos e todas as variantes de componentes continuam a exigir validação específica. As rotas geradas partilham componentes; não foram inspecionadas individualmente 16 mil páginas.
