# Recolha e interpretação das métricas

## Contrato v2 (10/09/2026)

- `quizTracking.ts` regista todos os links públicos tel:, wa.me, api.whatsapp.com, web.whatsapp.com e whatsapp: através de um listener de captura. Os handlers antigos não duplicam o evento. Sem abrir chamadas ou enviar mensagens durante testes.
- `page_path` indica a página do clique. `service` indica a origem do botão, por defeito cabeçalho, rodapé ou página; `data-tracking-source` permite um rótulo mais específico. Nunca guardar a mensagem WhatsApp nem o número de telefone no evento.
- Visitas têm ID `v2:<uuid>`, persistente na sessão do separador, com expiração por 30 minutos de inatividade. Atribuição de entrada preservada na navegação.
- Cada abertura do quiz tem ID separado `v2:q:<uuid>`. `start/-1` significa abertura. `start/0..4` significa etapa vista, uma vez por tentativa. Etapas pré-preenchidas podem não ser vistas, sem que isso signifique abandono.
- `complete/4` significa entrega confirmada a pelo menos um canal do negócio. É emitido pelo callback de sucesso de `useQuizSubmission`, nunca por navegação. Contacto e submissão são conceitos distintos.
- `abandon` regista fecho sem sucesso ou saída da página. Não inferir abandono só pela ausência de um evento.
- `session_time` v2 transporta incrementos de tempo em primeiro plano. Admin excluído. O painel soma por visita; para o histórico anterior considera o maior snapshot por ID, sem conseguir remover tempo de fundo já incorporado.

## Entrega e diagnóstico

`eventDelivery.ts` guarda cada evento sem contactos pessoais em localStorage antes do envio, sob chave própria com UUID. POST keepalive permite a troca para a aplicação WhatsApp. Falhas de rede/HTTP mantêm o evento para nova tentativa a cada 30 segundos, no regresso da rede e em novas visitas. O mesmo ID é reenviado, e apenas a duplicação da chave primária confirma uma entrega anterior. Retenção máxima de sete dias e limite de 200 eventos por instância. Armazenamento indisponível conserva apenas a fila em memória. Nenhum mecanismo no browser garante recolha perante bloqueadores, limpeza do armazenamento ou ausência definitiva de rede.

Falhas aparecem na consola e a primeira por carregamento tenta escrever `TrackingDelivery` em error_logs. Se a própria base de dados estiver indisponível, esse diagnóstico também pode falhar; a consola e a fila local conservam o sinal. `TrackingHealth` mostra última gravação, falhas reportadas em 24h e pendências neste navegador, atualizando a cada minuto. Nunca interpretar ausência de erros como prova de entrega integral.

Não necessita de novas ações/colunas nem de abrir permissões de leitura anónima: utiliza as ações e colunas já em produção, incluindo ID UUID e created_at. Manter as permissões de leitura do admin protegidas.

## Painel e histórico

- Paginação com contagem exata e ordenação estável por created_at/id. Erro numa página invalida o resultado, em vez de mostrar totais parciais.
- Submissões: exclusivamente complete/4, deduplicadas por tentativa. Dados antigos representam tentativas finais, não garantia de entrega. Cliques nunca entram no funil.
- Taxa: tentativas abertas nessa semana que também apresentam submissão nessa semana / tentativas abertas nessa semana. Submissões de uma abertura anterior podem contar no total, mas não no numerador dessa taxa.
- Funil: só v2 e etapas efetivamente vistas. Não fabricar etapas antigas que nunca foram medidas.
- Pedidos, cidades e serviço mais pedido: linhas do CRM, excluindo importações source=WhatsApp.
- Valor médio: submissões com valor conhecido; novas submissões usam preço final com desconto e omitem estimativas com componentes sob orçamento.
- Cliques não equivalem a mensagens recebidas ou chamadas atendidas. Contactos diretos fora do site exigem reconciliação com os serviços de comunicação.

## Verificação

Testes cobrem deduplicação de cliques com handlers antigos, links novos, navegação e atribuição, persistência/reenvio com o mesmo ID, erros HTTP, mais de mil linhas, avanço direto e etapas omitidas, reabertura, falha de entrega, submissão concorrente e os totais apresentados no painel. A suite de submissão testa também os dois canais a falhar e os pedidos entregues por apenas um canal. Rede dos testes simulada: nenhum lead de teste é enviado.
