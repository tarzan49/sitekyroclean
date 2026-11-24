# Questionário: proposta nova (24 Nov), à espera do OK do dono

## Problemas do atual (capturas atual-1/2/3.jpg)
1. O widget não passa nada: escolhe-se 3 lugares + Blindado e o questionário abre com tudo a 0 (LandingServiceSections.tsx:54).
2. Preços de tabela à mão (QuizTypes.ts:131), não do botQuote: widget diz Blindado 219€ "em vez de 248€", o questionário diz "219€ em vez de 228€".
3. Ecrã "mesma visita" com descontos retirados ("Colchão 55€/un.", "Limpe 4, pague 3", "preço reduzido a partir de 100€") contra a regra de 23 Nov (soma da tabela) e a tabela de cadeiras de 24 Nov.
4. Só um serviço principal; o resto entra por ecrãs de upsell encadeados (4 passos + 2-3 ecrãs extra até ao contacto).
5. Sem anti-odor nem pele; aviso beforeunload irrita.

## Desenho novo: "cesto da visita" num só ecrã
- Ecrã 1 (Cesto): cartões do que já vem do widget (ex.: "Sofá 3 lugares · Blindado · 219€", cidade Lisboa). Por baixo, "Juntar à mesma visita": Sofá, Colchão, Cadeiras, Tapete, Alcatifa, Cadeirão.
- Tocar num artigo abre uma folha de baixo (bottom sheet) curta: tamanho/quantidade + Renovado/Protegido/Blindado (ou anti-ácaros no colchão, tratamento da pele se for pele). Tapete/alcatifa pedem só medidas, sempre "sob orçamento".
- Barra fixa em baixo: "Total: X€, deslocação incluída" calculado pelo botQuote do pedido inteiro (o mesmo que o bot), e botão "Continuar".
- Ecrã 2 (Contacto): nome + telemóvel, resumo final, "Receber o preço e as horas no WhatsApp". quiz_order e submit-lead intactos (a mensagem automática e o funil do bot continuam iguais).
- Sem descontos de "mesma visita", sem urgência, sem beforeunload. Estilo das páginas novas (SectionHeader, dourado #D4AF37).
- Passos: de 4 + extras para 2. Do widget ao envio: ~3 toques + nome e telefone.
