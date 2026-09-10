# Auditoria de orçamentos, Formspree e WhatsApp

Data: 10 de setembro de 2026.

## Resultado

Foram encontradas e corrigidas divergências reais entre seleção, cálculo, mensagem enviada e recibo. A validação automatizada passou 1.864 testes. Os envios foram intercetados nos testes: nenhum pedido de auditoria foi enviado ao Formspree, CRM ou WhatsApp real.

## Problemas corrigidos

| Problema observado no código/percurso | Correção |
| --- | --- |
| Sofá 3 lugares com proteção Premium: o detalhe e recibo somavam 40€ de diferença, enquanto a tabela aprova 30€. | Cálculo e recibo usam `calcPackPricing`. Exemplo: serviço 199€, deslocação Lisboa 10€, total 209€, sem desconto de múltiplos artigos para um único sofá. |
| Sofá 4+ com pack podia acrescentar 40€ fictícios ao subtotal. | Preço desconhecido mantém-se desconhecido, sem fallback monetário. |
| WhatsApp perdia observações, identificação e subtotal conhecido em pedidos mistos. | Reutiliza a mensagem enviada ao Formspree e acrescenta nome, telefone e referência comum. |
| Formspree não recebia a referência mostrada no WhatsApp/recibo. | `booking_id` enviado também no formulário e no texto. |
| Medidas eram reduzidas à área, perdendo largura/comprimento; extras de tapete podiam perder todas as medidas na mensagem. | Dimensões individuais preservadas nos detalhes e recibo. |
| Alcatifa era identificada como tapete ao entrar pelo widget. | Categoria preservada no widget, hero e entradas contextuais de alcatifa. |
| Segundo tapete/divisão incompleto podia desaparecer silenciosamente. | Continuação bloqueada até completar ou remover todas as peças. Números inválidos/infinito rejeitados. |
| Desconto podia ativar com um artigo caro ou apenas um extra sem preço. | Quiz e widget alinhados com a regra comercial atual: dois artigos tabelados, soma acima 149€, um artigo a partir 49€, deslocação excluída. |
| Tratamentos importados do widget podiam desaparecer ou virar limpeza ao abrir sugestões. | Anti-ácaros preservado; impermeabilização de cadeiras mantém tipo e tier. |
| Voltar das sugestões apagava os extras. | Voltar conserva a seleção. |
| CRM devolvia erro sem rejeitar a Promise: falha tratada como sucesso. | Verificação explícita de configuração e `error`; falha dos dois canais mostra erro e mantém formulário preenchido. |
| Aviso de erro dizia “Pedido registado”. | Texto de falha correto, com alternativa WhatsApp/email. Recibo novo só persistido após entrega a pelo menos um canal. |
| Resumo de extras mostrava quantidades duplicadas, como “1 × 1 xColchão”. | Quantidade separada do rótulo no detalhe e recibo. |
| Telefone vazio/incompleto ou letras podiam avançar. | Validação de formato e 9–15 dígitos, com indicativo internacional permitido. |

## Verificação funcional

A matriz principal tem 1.756 cenários cruzando:

- Sofás: todos os quatro tamanhos, limpeza/impermeabilização, Essencial/Premium, proteção ligada/desligada, quantidades 1/2/9, sem extras/com colchão/com tapete sob orçamento.
- Colchões: três tamanhos, com/sem anti-ácaros, quantidades 1/2/9, os mesmos grupos de extras.
- Cadeiras: quantidades 1/4/5/6/7/9/10/11, atravessando todos os escalões; limpeza/impermeabilização, Essencial/Premium e tratamentos. Inclui combinações defensivas além das expostas pela interface.
- Deslocações: Lisboa 10€, Lagos 15€, Barcelos 20€, Monchique 25€. A suite das deslocações verifica também coerência da tabela completa.
- Tapetes com dimensões e extra tabelado.

Em cada cenário: soma das linhas igual ao subtotal; desconto e total coerentes; mensagem comum presente no Formspree e URL WhatsApp; dados pessoais fictícios, observações e referência preservados; valor CRM igual ao valor apresentado. Testes adicionais cobrem fotos no multipart, HTTP 422/500, falhas do CRM, recuperação de um canal e repetição após erro de rede; navegação, medidas inválidas e formulário de contacto simples.

Os testes existentes dos packs configuráveis também passaram. `/packs` prepara WhatsApp diretamente e **não submete ao Formspree**: é um percurso distinto do quiz.

## Verificação visual

Navegador local, com submissões locais simuladas:

- 390 × 844: sofá 3 lugares + Premium + colchão casal em Lisboa, percurso completo até ao recibo e inspeção da mensagem WhatsApp:199+69+10=278€, desconto 27€, estimativa 251€.
- 390 × 844: alcatifa com duas divisões 2,5 × 3 m e 1 × 4 m, Barcelos. Segunda divisão incompleta bloqueia; completa mantém as duas medidas e 20€ de deslocação, sem inventar preço de limpeza.
- 320 × 640: recibo de alcatifa legível, sem preço apresentado como orçamento fechado.
- 1440 × 900: recibo e chamada para WhatsApp revistos.

Foi acrescentado resumo expansível antes dos contactos, com artigos, tratamentos, deslocação e total/subtotal, e ajustadas margens e disposição do total. O passo de contacto pode exigir scroll em telemóveis; o botão permanece no rodapé. A atualização visual de tapetes feita em paralelo foi preservada na integração.

## Limites da conclusão

Isto não é prova de ausência absoluta de bugs: quantidades e textos livres não têm um conjunto finito de combinações. Foram cobertos todos os tamanhos/tipos atuais e fronteiras representativas, não cada combinação possível em todos os dispositivos.

Não foi inspecionado o histórico privado de submissões, spam, plano/limites de anexos, configuração de notificações ou entrega final de emails da conta Formspree. O teste de fotos confirma que o ficheiro segue no pedido, não que o plano contratado aceita anexos. A receção real exige um pedido controlado e conferência no destino.

Os percursos genéricos de WhatsApp existentes no cabeçalho/hero não incluem uma simulação que o cliente ainda não submeteu. Os testes inspecionaram a mensagem preparada; não enviaram mensagens pelo WhatsApp.


## Confirmação posterior de receção real (10/09/2026)

Depois de o responsável disponibilizar a sessão do Formspree, foi enviado um único pedido de teste pelo site público, identificado como TESTE AUDITORIA TAPETES - IGNORAR - NAO CONTACTAR. Esta verificação posterior substitui a limitação anterior relativa à receção de um pedido novo; a primeira etapa da auditoria usou apenas simulações.

O pedido de teste F1FJVQS6 foi confirmado na caixa de entrada do formulário xreozzbp, com as mesmas informações do resumo e da mensagem preparada para WhatsApp:

- Tapete 1: 2.5 × 3 m, área 7.5 m².
- Tapete 2: 1.25 × 2.4 m, área 3 m².
- Duas peças distintas, ambas sob orçamento.
- Deslocação Lisboa: 10€, apresentada como subtotal conhecido; sem preço inventado para limpeza.
- Referência idêntica no campo booking_id, corpo recebido e mensagem WhatsApp.

Não foi enviada mensagem pelo WhatsApp. A receção no Formspree foi confirmada; esta verificação não comprova a entrega na caixa de email do destinatário nem o suporte a anexos. Nenhum registo de cliente foi alterado. O teste ficou identificado para ser ignorado.
