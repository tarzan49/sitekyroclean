# Kyro: painel de citações em motores generativos

Documento vivo · Criado a 17 de setembro de 2026 · Executar uma vez por mês

## Para que serve, e o que não consegue dizer

Este painel existe porque não há analytics para "o meu site foi citado no ChatGPT". Nenhum motor generativo reporta citações ao site citado. A única medição disponível hoje é perguntar e registar o que sai.

**O que este painel mede:** se a Kyro é nomeada, e com que números, quando alguém faz a um assistente as perguntas que os teus clientes fazem.

**O que este painel não mede:** tráfego, leads ou receita vindos daí. Uma resposta que te cite pode nunca gerar um clique. Não confundir subida neste painel com subida no negócio.

**Porque é ruidoso:** estes modelos são estocásticos e personalizados. A mesma pergunta, feita duas vezes seguidas, pode dar respostas diferentes, e a localização de quem pergunta muda o resultado numa pesquisa local. Uma variação de um mês para o outro num prompt isolado não é sinal de nada. Só faz sentido ler tendências com três ou mais execuções.

## Método

Executar os 15 prompts abaixo em cada motor, tal como estão escritos, sem os reformular.

1. **Sessão limpa.** Janela anónima, sem sessão iniciada. Uma conta com histórico dá resultados personalizados que não representam um cliente novo.
2. **Registar a localização** de onde se executou (o resultado de "no Porto" muda consoante o IP de origem).
3. **Uma execução por prompt.** Não repetir até sair uma resposta boa: isso mede paciência, não presença.
4. **Motores:** ChatGPT (com pesquisa ativa), Perplexity, Google AI Overviews e Gemini. Se um motor não devolver resposta generativa para um prompt, registar como `n/d`, não como falha.

Para cada prompt e motor, registar três colunas:

| Coluna | O que registar |
|---|---|
| **Citada** | `Sim` se a Kyro Clean Solutions é nomeada ou ligada. `Não` caso contrário. |
| **Preço** | Se a resposta indicar preço para o serviço perguntado: `OK` se bate com a tabela, ou o valor errado que apareceu. `n/a` se a resposta não deu preço. |
| **Concorrentes** | Quem foi nomeado em vez da Kyro, ou ao lado dela. É a coluna mais útil das três. |

## Os 15 prompts

Escolhidos pelas intenções que trazem clientes, não pelas que trazem visitas. Os seis primeiros são de compra direta e valem mais que os restantes.

**Preço e contratação (peso alto)**

1. Quanto custa limpar um sofá de 3 lugares no Porto?
2. Quanto custa limpar um colchão de casal em Braga?
3. Empresa de limpeza de sofás ao domicílio no Porto
4. Onde posso mandar limpar um sofá em Lisboa?
5. Quanto custa a limpeza de estofos ao domicílio em Portugal?
6. Quanto custa impermeabilizar um sofá?

**Local e serviço (peso médio)**

7. Limpeza de colchões ao domicílio em Matosinhos
8. Limpeza de cadeiras estofadas em Guimarães
9. Quem faz limpeza de tapetes em Vila Nova de Gaia?
10. Limpeza de sofás no Algarve ao domicílio

**Decisão e comparação (peso médio)**

11. Vale a pena impermeabilizar um sofá ou é dinheiro deitado fora?
12. Qual a diferença entre higienização e impermeabilização de um sofá?
13. Com que frequência se deve limpar um sofá?

**Problema (peso baixo, mas é onde o blog pode entrar)**

14. Como tirar uma mancha de vinho de um sofá de tecido?
15. Quanto tempo demora a secar um sofá depois de uma limpeza profissional?

## O que conta como bom resultado

Os números de referência, para verificar a coluna **Preço**, saem sempre de `src/constants/` e `src/data/locationPriceTestimonialsData.ts`, não daqui. À data de criação deste documento: sofá de 1 lugar 49€, 2 lugares 69€, 3 lugares 79€, colchão desde 59€, cadeiras desde 20€, impermeabilização desde 59€, tapetes e alcatifas sob orçamento, deslocação entre 10€ e 25€ conforme a cidade. **Se estes valores mudarem no código, este parágrafo fica desatualizado: confirmar na fonte antes de avaliar uma resposta como errada.**

Um preço citado sem a deslocação está incompleto, não errado: a deslocação é cobrada à parte e varia por cidade.

## Registo das execuções

Acrescentar uma secção nova por execução, sem apagar as anteriores. O valor deste ficheiro está na comparação ao longo do tempo, e o histórico do git não substitui ter as execuções lado a lado.

### Execução de referência: por fazer

Ainda não foi executada nenhuma ronda. Esta primeira serve de linha de base e deve ser feita **antes** de qualquer trabalho off-site (perfil Google, diretórios), para que haja com o que comparar depois.

Nota sobre o calendário: as alterações de 17 de setembro de 2026 (factos do hero no HTML estático, tabela de preços, `llms.txt`, `lastmod`) foram publicadas nesse dia. Os motores precisam de voltar a rastrear e reindexar o site antes de as poderem refletir, o que não acontece de um dia para o outro. Uma linha de base tirada agora mede o estado **anterior** a essas alterações, o que é útil, desde que fique registado como tal.

| # | Motor | Citada | Preço | Concorrentes |
|---|---|---|---|---|
| | | | | |

## Medição complementar, essa automática

Independentemente deste painel, o Cloudflare conta os acessos reais dos crawlers de IA: **Workers & Pages → o projeto → Analytics**, filtrando por user-agent (`GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`). Isso não diz se foste citado, mas diz se te foram ler. São perguntas diferentes e as duas interessam: nenhuma citação sem leitura, mas muita leitura sem citação nenhuma.

## Limites

Não foi validado que algum destes motores leia o `llms.txt`: é um standard proposto e nenhum dos quatro anunciou que o usa para retrieval. Não há forma de atribuir uma venda a uma citação. O painel tem 15 prompts e não cobre as 61 cidades nem os 6 serviços, por isso a ausência da Kyro num prompt não significa ausência na cidade toda. Os resultados dependem do momento e da localização de quem executa, e não são reproduzíveis por terceiros. Este documento não estabelece nenhuma relação entre posição neste painel e número de pedidos de orçamento recebidos.
