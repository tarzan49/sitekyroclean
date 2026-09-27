# Calendários das equipas

Desde 28/09/2026 cada equipa (Porto, Braga, Lisboa 1, Lisboa 2 e Algarve) tem o seu
próprio Google Calendar. O dono continua a marcar os serviços só no calendário dele. Um
script da Google (Apps Script), a correr na conta do dono, copia cada serviço
para o calendário da equipa que o vai fazer e manda um email a essa equipa
quando um serviço entra, muda ou é cancelado.

O código está em `google-apps-script/calendario-equipas/`. Não corre no site,
por isso um push para o GitHub não o atualiza: atualizar é voltar a colar os
ficheiros no projeto do Apps Script (ver "Manutenção").

## Instalação (uma vez, na conta onde estão os serviços)

**Feita a 28/09/2026** na conta do calendário dos serviços: projeto "Calendários
das equipas" no Apps Script, os quatro calendários criados, os dois gatilhos
ligados e a primeira cópia feita (10 serviços em Lisboa, 5 no Porto, 1 no
Algarve). Falta partilhar cada calendário com a sua equipa (passo 7).

1. Abrir [script.google.com](https://script.google.com) com a conta do
   calendário dos serviços e criar um **Novo projeto**, com o nome
   "Calendários das equipas".
2. Apagar o conteúdo do ficheiro `Código.gs` e colar lá o `Codigo.gs` do
   repositório.
3. Carregar em **+** ao lado de "Ficheiros", escolher **Script**, chamar-lhe
   `Lugares` e colar lá o `Lugares.gs`.
4. Carregar em **+** ao lado de "Serviços", escolher **Google Calendar API** e
   **Adicionar**. Se a janela não abrir (não abriu no browser da app do
   Claude): Definições do projeto, "Mostrar ficheiro de manifesto", e no
   `appsscript.json` pôr em `dependencies` o
   `enabledAdvancedServices: [{ userSymbol: "Calendar", version: "v3", serviceId: "calendar" }]`.
5. (Opcional) Escolher a função `verificar` no topo e **Executar**. O registo
   mostra para que equipa iria cada serviço já marcado, sem mudar nada.
6. Escolher a função `configurar` e **Executar**. A Google pede autorização
   (calendário, enviar email, correr em segundo plano). Como o script é do
   próprio dono e não foi publicado, aparece "A Google não validou esta
   aplicação": **Avançadas**, depois **Aceder a Calendários das equipas**.
   O `configurar` cria os calendários que faltarem, liga a cópia automática e faz a
   primeira cópia sem mandar emails às equipas.
7. No Google Calendar, em cada calendário novo (**Definições e partilha**,
   **Partilhar com pessoas específicas**), acrescentar os emails da equipa com
   a permissão **Ver todos os detalhes do evento**. A Google manda-lhes um
   convite para adicionarem o calendário.

Para desligar: função `desligar`. Os calendários ficam como estão.

## Regras

- **Só o calendário do dono é que se edita.** As cópias refazem-se a partir
  dele: um evento mudado ou apagado muda ou desaparece na equipa. As equipas
  só podem ver. Um evento escrito à mão num calendário de equipa não é tocado.
- **O que conta como serviço:** um evento que comece por "Serviço", ou por
  "Limpeza" seguido de um valor em euros. É a regra do CRM, com uma diferença
  de propósito: um "Serviço" sem valor também vai para a equipa, porque um
  serviço sem preço escrito tem de ser feito na mesma.
- **Duas equipas em Lisboa** (dono, 28/09/2026). A equipa sai da parte do
  dono no valor: "o serviço que for 65 ou 70% para mim é a equipa 2". Um
  serviço da região Lisboa em que o primeiro valor é 60% a 80% do valor entre
  parênteses ("Serviço 70€ (100€)") vai para a **Lisboa 2**; os outros, a
  meias como nas outras equipas ("45€ (89€)"), vão para a **Lisboa 1**. A
  margem aguenta arredondamentos e fica longe dos 50%. Sem os dois valores
  escritos fica na Lisboa 1. Noutras regiões a parte não conta. "equipa
  lisboa 1" ou "equipa lisboa 2" escrito no evento ganha a tudo. A Lisboa 2
  não tem região nem base, por isso nunca é escolhida pela morada nem por ser
  a mais perto. Quando um serviço passa de uma para a outra, sai de uma e
  entra na outra, com email às duas.
- **Equipa de cada serviço**, por esta ordem: "equipa porto" (ou lisboa,
  braga, algarve) escrito no evento; o código postal; os concelhos servidos;
  as freguesias desses concelhos; e, se nada disso chegar, **a morada no
  Google Maps** (dono, 28/09/2026: "pela morada deve saber automaticamente").
  As quatro primeiras são as mesmas regras e listas que o CRM usa para a
  região (`src/lib/calendarServices.ts`): uma equipa por região. Aveiro e
  Coimbra vão para o Porto e o Alentejo para Lisboa, como no `travel.ts`.
- **O Maps** (serviço Maps do próprio Apps Script, sem chave) recebe só a
  morada: o título sem o primeiro bocado (serviço e valores), sem telefones e
  sem o nome ao lado do telefone. A equipa sai do código postal do sítio
  encontrado, com a mesma regra do CRM. **Vale sempre a melhor resposta do
  Maps, mesmo parcial** (dono, 28/09/2026: "100% automatizado", sem
  perguntas): primeiro a morada como está, depois sem andar e lado ("cave
  esquerda"), depois só o último bocado; ganha a primeira resposta que
  encontre a morada inteira, e sem nenhuma assim a primeira que encontre
  alguma coisa. O risco conhecido é a localidade com nome parecido: na
  primeira volta "Pucariça" deu "Pocariça" (Cantanhede), quando a certa é a
  de Mafra. Resolve-se acrescentando a localidade aos aliases de
  `calendarServices.ts` (a Pucariça já lá está), que vêm antes do Maps. Um sítio fora de todas as regiões
  (Leiria, Beira Interior) vai para a equipa com a base mais perto; ilhas e
  estrangeiro ficam sem equipa. Quando a equipa veio do Maps e o evento não
  tem local, a morada que o Maps encontrou vai para o "Onde" da cópia: a
  equipa vê o sítio que foi escolhido e pode navegar até lá. Cada morada
  procura-se uma vez e fica guardada (o Maps tem limite diário). Se o Maps
  falhar, o serviço espera pela volta seguinte e a cópia que já tiver não é
  tocada.
- **Serviço enviado sem certeza:** segue para a equipa na mesma, e o dono
  recebe um email a dizer para que equipa foi e porquê (dono, 28/09/2026:
  "quando não tiveres 100% certeza envia-me um alerta no email"). Conta como
  sem certeza a equipa escolhida pelo Maps (com a morada que ele encontrou),
  por uma freguesia (pode ser o apelido do cliente ou ter o mesmo nome
  noutro sítio) e pela equipa mais perto. Código postal, concelho e "equipa
  X" escrito contam como certos. Um aviso por evento, e outro se o evento ou
  a equipa mudarem; se estiver errado, basta escrever "equipa X" ou o código
  postal no evento e o serviço muda sozinho de equipa.
- **Serviço sem equipa:** só um evento sem morada nenhuma (por exemplo
  "Serviço 70€ (130€) imper cadeiras"), ou uma morada que nem o Maps
  reconhece. Não é copiado, e o dono recebe um email a pedir o código postal
  ou "equipa porto" (braga, lisboa 1, lisboa 2, algarve) no evento. Assim que o evento
  for guardado, segue para a equipa.
- **A hora é o mesmo instante, mostrado em Portugal.** O calendário do dono
  está no fuso de Copenhaga desde 23/08/2026 e a hora que lá está é a de
  Copenhaga (dono, 28/09/2026: "estou com uma hora de avanço"; o serviço que
  ele vê às 15:00 é às 14:00 em Portugal). A cópia leva o mesmo instante no
  fuso de Lisboa, por isso a equipa vê uma hora a menos. A primeira versão
  copiava os números do relógio (15:00) e punha a equipa uma hora atrasada;
  foi corrigida antes de os calendários serem partilhados.
- **Cores no calendário do dono** (dono, 28/09/2026: "quero o meu com cores
  em vez de ser tudo azul", "pinta só os serviços para a frente"): cada
  serviço que ainda não acabou fica com a cor da equipa (Porto
  azul Mirtilo, Braga verde Basílico, Lisboa 1 laranja Tangerina, Lisboa 2
  roxo Uva, Algarve amarelo Banana) e muda de cor se mudar de equipa. Uma
  cor posta à mão num serviço é substituída pela da equipa. **Cuidado com o
  CRM:** mudar a cor mexe na data de alteração do evento, e o CRM
  (`calendarSync.ts`) relê um evento alterado depois da linha e escreve por
  cima das correções feitas no CRM. Só acompanha eventos criados depois de
  26/09/2026 às 15:00 UTC, e esses são pintados segundos depois de criados,
  antes de haver correções. Na pintura dos serviços que já existiam (28/09)
  só dois estavam nessa situação. Os serviços que já passaram ficam como
  estavam.
- **A equipa escrita no serviço do dono** (dono, 28/09/2026: "eu assim não
  vejo que equipa vai"): a primeira linha da descrição de cada serviço que
  ainda não acabou passa a ser "Equipa: Porto" (ou Braga, Lisboa 1, Lisboa 2,
  Algarve), escrita pelo script ao mesmo tempo que a cor. É só informação: é
  tirada antes de decidir a equipa (senão, ao mudar a morada, o serviço
  ficava preso à equipa antiga), não vai para a cópia (senão as equipas
  recebiam "Serviço alterado" de todos) e não conta para os avisos. Os dois
  pontos são de propósito: "equipa porto" sem eles é uma ordem do dono.
  **O CRM também lê esta linha** (`calendarServices.ts`, desde 0ac296e): tira-a
  do texto onde procura a cidade e usa-a como última pista para a região.
  Mudar o formato da linha obriga a mudar o CRM no mesmo commit. Cada escrita
  no evento do dono faz o CRM reler o evento inteiro, por isso o script só
  escreve quando a cor ou a linha estão mesmo erradas (serviço novo ou que
  mudou de equipa), nunca por rotina.
- **Os calendários das equipas ficam escondidos na conta do dono**, e o
  calendário dele à vista: vê cada serviço uma vez, no seu calendário, com a
  cor da equipa. Os calendários das equipas são dele (o script corre na
  conta dele), por isso visíveis mostravam cada serviço a dobrar. A 28/09
  estiveram visíveis umas horas, porque o iPhone não mostrava as cores dos
  eventos; depois de o dono reinstalar a app passou a mostrar, e voltaram a
  ser escondidos. **Não tirar os serviços do calendário do dono** (ele
  chegou a pedir): o CRM lê-os de lá e a cópia parte deles; sem o original,
  o CRM marcava-os como apagados e as equipas recebiam "cancelado".
- **As equipas veem o título completo**, incluindo "70€ (140€)" (decisão do
  dono, 28/09/2026).
- **Emails:** vão para quem tem o calendário da equipa partilhado com
  permissão de ver ou editar os detalhes. Não há emails escritos no código
  (o repositório é público). Só se avisa de serviços que ainda não acabaram,
  e nunca na primeira volta do `configurar`. Saem da conta Gmail onde o
  script corre, com o nome "Kyro Clean Solutions". O Gmail pessoal tem um
  limite de 100 destinatários por dia.
- **Nunca se apaga uma cópia por o serviço não ter vindo na lista.** Só se o
  próprio evento, lido um a um, disser que foi apagado ou cancelado. Um erro
  da Google a meio interrompe a volta sem mudar nada.
- **Quando corre:** sempre que um evento do calendário do dono muda, e a cada
  15 minutos para apanhar o que falhar. Olha de 2 dias para trás a um ano para
  a frente.
- O CRM continua a ler só o calendário do dono (`calendar-events`). Os
  calendários das equipas não entram nas contas.

## Manutenção

- **`Lugares.gs` é gerado, nunca editado à mão.** Sai do `placeIndex()` de
  `src/lib/calendarServices.ts`. Quando entra uma cidade ou freguesia nova no
  site, `src/lib/teamCalendarScript.test.ts` falha: correr
  `npx vitest run src/lib/teamCalendarScript.test.ts -u` e pedir ao dono para
  colar o `Lugares.gs` novo no projeto do Apps Script. Até lá, a cidade nova
  cai em "serviço sem equipa", nunca na equipa errada.
- **A regra do código postal está escrita duas vezes** (`localityFromPostalCode`
  no CRM e `regiaoPorCodigoPostal` no script). O teste compara os 9.000
  códigos e rebenta se divergirem.
- **Juntar ou separar equipas** é mudar `regioes` em `EQUIPAS`, no topo do
  `Codigo.gs` (por exemplo, pôr `['Porto', 'Braga']` na do Porto e tirar a de
  Braga). Depois de
  colar, correr `configurar` outra vez: cria o calendário que faltar e move
  os serviços dessa região, com email às duas equipas. Um calendário que deixe
  de ter equipa não é apagado: apaga-se à mão.
- Testes só com dados inventados: o repositório é público.
