# Regras comerciais e correções de 10 de setembro de 2026

## Decisões confirmadas pelo responsável

1. Confiança: manter comunicação comercial persuasiva. Usar o volume habitual comunicado de 50 a 60 pedidos por semana, sem o apresentar como um contador em direto.
2. Saída do orçamento: convidar a terminar o pedido sem compromisso, com resposta em menos de 10 minutos. Retirar a suposta vaga reservada, perda de desconto e contagem decrescente.
3. Deslocação: mínimo de 10€, sempre separado dos serviços. Braga 10€, Barcelos 20€. Escalões de referência adotados para Braga: até 10 km 10€, até 15 km 15€, acima 20€, por sede da localidade; confirmar morada antes de marcar. Póvoa de Lanhoso 15€; Guimarães, Famalicão, Barcelos, Fafe, Esposende e Viana 20€. Restantes regiões mantêm os valores existentes.
4. Satisfação: contacto até 48 horas após a intervenção dá acesso a repetição gratuita. Depois desse prazo termina esta garantia comercial, sem afastar direitos legais.
5. Impermeabilização: Premium até 10 anos em destaque, Essencial de 1 a 2 anos sempre disponível. Preço genérico desde 59€; Premium para sofá desde 89€. Cura do produto pode exigir 24 horas, distinta da secagem da limpeza.
6. Packs: o cliente escolheu montar o seu próprio pack. As combinações anteriores tornam-se pontos de partida editáveis. Mesmos preços de artigos e tratamentos usados pelo orçamento. Não foi criada uma nova promoção: mantém-se o desconto existente de 10% nos serviços tabelados acima de 149€, pelo menos dois artigos e um a partir de 49€, sem desconto na deslocação.
7. Tapetes e alcatifas: sempre sob orçamento. Largura e comprimento obrigatórios por peça/área no configurador.
8. Preços: simulação é estimativa. Confirmar artigos, medidas, tratamento e deslocação antes da marcação; preço confirmado mantém-se para esse pedido.
9. Contacto: menos de 10 minutos. Serviço: procurar próprio dia ou seguinte, sujeito a disponibilidade confirmada.
10. Secagem da limpeza: média de 3 a 6 horas, dependente de ventilação, tecido e condições do espaço.
11. Cobertura: empresa nacional com equipas em Braga, Porto, Lisboa e Algarve. Cobertura regular no litoral Viana–Algarve; outras zonas mediante consulta.
12. Anti-ácaros e desbacterização: extras distintos da limpeza normal. Páginas próprias nacionais e por cidade, sem garantia de eliminação de 99% nem promessa clínica.
13. Avaliações: nota 4.9. Não atribuir cidade a testemunhos cuja origem não esteja confirmada. Preservar as avaliações de Lisboa já confirmadas.
14. Aveiro e Coimbra: iniciar presença orgânica com páginas de serviços e tratamentos, identificando disponibilidade sob consulta, sem anunciar equipa permanente.
15. Publicação: regras coerentes na página interativa, metadados, conteúdo inicial e mapas de páginas.

## Implementação

- Preços de deslocação centralizados; tabelas duplicadas removidas.
- Configurador em `/packs` e nas páginas de combinações por cidade.
- 124 páginas de tratamentos (duas nacionais, duas por cada uma das 59 cidades e por Aveiro/Coimbra).
- 14 páginas adicionais para Aveiro e Coimbra (duas gerais e 12 de serviços).
- Packs disponíveis nas 59 cidades, conservando as ligações antigas.
- Páginas de marcas e problemas passam a entregar conteúdo completo desde o primeiro carregamento.
- Ligações nacionais de packs deixam de encaminhar automaticamente para o Porto.

## Validação

80 testes aprovados após integrar as alterações recentes do site. Verificação de preços, medidas, deslocação, escalões de impermeabilização e distinção entre subtotal e orçamento. Construção completa: 15 176 documentos HTML verificados, sem páginas públicas sem título principal nem URLs de sitemap sem ficheiro. O verificador `scripts/audit-commercial-output.mjs` pode ser repetido após cada build.

No navegador: Barcelos apresenta deslocação de 20€; tapete sem medidas bloqueia o pedido; medidas 2,5 × 3 m seguem na mensagem, com subtotal separado; pack de impermeabilização em Lisboa começa pela Premium (129€ + 10€) e permite trocar para Essencial (99€ + 10€). Nenhum pedido foi enviado.

A indexação das páginas novas depende do rastreio do motor de pesquisa. O configurador prepara uma mensagem para o cliente enviar; não envia pedidos automaticamente.

## Confirmação de publicação

A publicação principal foi confirmada no domínio público em 10 de setembro de 2026, incluindo `/packs`, `/desbacterizacao-lisboa`, `/tratamento-anti-acaros-braga` e `/limpeza-estofos-coimbra`. O glossário foi também alinhado com a regra de orçamento de tapetes e alcatifas mediante medidas.
