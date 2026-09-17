# Recolha e interpretação das métricas

## Contrato v2 (10/09/2026)

- `quizTracking.ts` regista todos os links públicos tel:, wa.me, api.whatsapp.com, web.whatsapp.com e whatsapp: através de um listener de captura. Os handlers antigos não duplicam o evento. Sem abrir chamadas ou enviar mensagens durante testes.
- `page_path` indica a página do clique. `service` indica a origem do botão, por defeito cabeçalho, rodapé ou página; `data-tracking-source` permite um rótulo mais específico. Nunca guardar a mensagem WhatsApp nem o número de telefone no evento.
- Visitas têm ID `v2:<uuid>`, persistente na sessão do separador, com expiração por 30 minutos de inatividade. Atribuição de entrada preservada na navegação.
- Cada abertura do quiz tem ID separado `v2:q:<uuid>`. `start/-1` significa abertura. `start/0..4` significa etapa vista, uma vez por tentativa. Etapas pré-preenchidas podem não ser vistas, sem que isso signifique abandono.
- `complete/4` significa entrega confirmada a pelo menos um canal do negócio. É emitido pelo callback de sucesso de `useQuizSubmission`, nunca por navegação. Contacto e submissão são conceitos distintos.
- `abandon` regista o passo onde a pessoa estava quando saiu sem concluir. Até 17/09/2026 só disparava no fecho explícito (botão X) e em `pagehide`, o que deixava de fora o caso mais comum no telemóvel: mandar o separador para segundo plano e nunca voltar. Dispara agora também em `visibilitychange` para `hidden` e em `popstate` (o "voltar", que numa SPA troca de rota sem descarregar a página). Como a pessoa pode voltar e continuar, a tentativa não fica trancada: o mesmo passo não é reportado duas vezes, mas avançar e voltar a sair reporta o passo novo, por isso **uma tentativa pode ter mais do que uma linha `abandon`**.
- **Desistência não se mede por linhas `abandon`.** Desistiu = tentativa (`session_id` `v2:q:<uuid>`) sem `complete`; `abandon` só diz *onde*. Pela mesma razão, nunca comparar contagens de linhas `start` com linhas `complete`: `start` escreve-se uma vez por passo visto e outra na abertura, por isso são unidades diferentes. Foi essa comparação que produziu a leitura de 17/09/2026 (751 `start`, 224 `complete`, 53 `abandon`) e a conclusão de que faltavam 90% das desistências. O funil correto conta tentativas distintas, arrumadas pelo maior `step` com `start` — ver a CTE `tentativas` em `supabase/queries/estudo-dados-proprios.sql`.
- Os ecrãs de upsell (combo, cadeiras, sofá, colchão) não têm número de passo próprio: sobrepõem-se ao passo 3, e um abandono aí fica registado como passo 3. Distingui-los exigia uma coluna nova em `quiz_events`.
- `session_time` v2 transporta incrementos de tempo em primeiro plano. Admin excluído. O painel soma por visita; para o histórico anterior considera o maior snapshot por ID, sem conseguir remover tempo de fundo já incorporado.

## Entrega e diagnóstico

`eventDelivery.ts` guarda cada evento sem contactos pessoais em localStorage antes do envio, sob chave própria com UUID. POST keepalive permite a troca para a aplicação WhatsApp. Falhas de rede/HTTP mantêm o evento para nova tentativa a cada 30 segundos, no regresso da rede e em novas visitas. O mesmo ID é reenviado, e apenas a duplicação da chave primária confirma uma entrega anterior. Retenção máxima de sete dias e limite de 200 eventos por instância. Armazenamento indisponível conserva apenas a fila em memória. Nenhum mecanismo no browser garante recolha perante bloqueadores, limpeza do armazenamento ou ausência definitiva de rede.

Falhas aparecem na consola e a primeira por carregamento tenta escrever `TrackingDelivery` em error_logs. Se a própria base de dados estiver indisponível, esse diagnóstico também pode falhar; a consola e a fila local conservam o sinal. `TrackingHealth` mostra última gravação, falhas reportadas em 24h e pendências neste navegador, atualizando a cada minuto. Nunca interpretar ausência de erros como prova de entrega integral.

Não necessita de novas ações/colunas nem de abrir permissões de leitura anónima: utiliza as ações e colunas já em produção, incluindo ID UUID e created_at. Manter as permissões de leitura do admin protegidas. Alargar a cobertura do `abandon` manteve-se dentro deste contrato de propósito: reutiliza a ação `abandon`, que a CHECK constraint de `quiz_events` aceita desde a migração inicial, por isso não houve nada a alterar na base de dados. Antes de fazer deploy de código que escreva um valor **novo** em `action`, correr `supabase/queries/verificar-constraint-quiz-events.sql` no SQL Editor: os ficheiros em `supabase/migrations/` não são a fonte de verdade do que está em produção, e uma ação recusada pela constraint lê zero em silêncio (já aconteceu duas vezes).

A entrega da saída é o ponto frágil: o evento é enfileirado no momento em que a página fica escondida e enviado por `fetch` com `keepalive` (o `navigator.sendBeacon` não serviria aqui porque não consegue definir os cabeçalhos `apikey`/`Authorization` que o PostgREST exige). `initContactTracking` força também um flush da outbox nessa transição. O que não sair fica em localStorage e é retentado na visita seguinte, que para quem nunca volta é uma perda residual sem solução do lado do browser.

## Painel e histórico

- Paginação com contagem exata e ordenação estável por created_at/id. Erro numa página invalida o resultado, em vez de mostrar totais parciais.
- Submissões: exclusivamente complete/4, deduplicadas por tentativa. Dados antigos representam tentativas finais, não garantia de entrega. Cliques nunca entram no funil.
- Taxa: tentativas abertas nessa semana que também apresentam submissão nessa semana / tentativas abertas nessa semana. Submissões de uma abertura anterior podem contar no total, mas não no numerador dessa taxa.
- Funil (cartão "Onde as pessoas desistem"): só v2, e conta **tentativas**, não linhas. Cada tentativa é arrumada no passo mais longe a que chegou; desistiu = tentativa sem `complete`. Desistiram + concluíram fecha no total de aberturas, por construção, e há um teste que o verifica.
- `chegaram` quer dizer "o passo mais longe desta tentativa é >= a este", e não "viu este passo". Um quiz aberto já preenchido a partir do widget de preços salta passos, e esses contam como passados, porque a resposta já era conhecida. É uma pergunta diferente da antiga "etapas efetivamente vistas", que este cartão substituiu: essa não dizia onde as pessoas se perdiam. Continua a valer não fabricar etapas antigas que nunca foram medidas, e é por isso que tentativas pré-v2 ficam de fora.
- O mesmo cálculo existe em dois sítios: `src/lib/quizMetrics.ts` (painel) e `supabase/queries/funil-quiz.sql` (dashboard). Mudar um sem o outro põe-nos a dizer coisas diferentes.
- Pedidos, cidades e serviço mais pedido: linhas do CRM, excluindo importações source=WhatsApp.
- Valor médio: submissões com valor conhecido; novas submissões usam preço final com desconto e omitem estimativas com componentes sob orçamento.
- Cliques não equivalem a mensagens recebidas ou chamadas atendidas. Contactos diretos fora do site exigem reconciliação com os serviços de comunicação.

## Verificação

Testes cobrem deduplicação de cliques com handlers antigos, links novos, navegação e atribuição, persistência/reenvio com o mesmo ID, erros HTTP, mais de mil linhas, avanço direto e etapas omitidas, reabertura, falha de entrega, submissão concorrente e os totais apresentados no painel. A suite de submissão testa também os dois canais a falhar e os pedidos entregues por apenas um canal. Rede dos testes simulada: nenhum lead de teste é enviado.
