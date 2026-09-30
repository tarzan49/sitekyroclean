# Calendários das equipas

Desde 28/09/2026 cada equipa (Porto 1, Porto 2, Braga, Lisboa 1, Lisboa 2 e Algarve) tem o seu
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
- **O dono escolhe sempre a equipa, em todas as regiões** (dono, 29/09/2026:
  "eu quero agora escolher sempre a equipa"). Escolhe pela **cor do evento**
  no calendário dele: Mirtilo = Porto 1, Pavão = Porto 2, Basílico = Braga,
  Tangerina = Lisboa 1, Uva = Lisboa 2, Banana = Algarve. Ou escrevendo
  "equipa porto 1" (porto 2, braga, lisboa 1, lisboa 2, algarve) no evento, que
  ganha à cor ("equipa porto" sozinho é a Porto 1, "equipa lisboa" a Lisboa 1).
  A morada não escolhe: sem cor de equipa nem "equipa X", o serviço não é
  copiado e o dono recebe um email "Escolhe a equipa deste serviço", com as
  cores de todas as equipas e, como pista, a zona onde a morada parece ser (um
  aviso por evento, e outro se o evento mudar). Uma cópia que já exista fica
  onde está enquanto o serviço estiver por escolher. O CRM recebe o serviço
  na mesma: a região do CRM sai da morada e não depende da equipa.
  Histórico: a 28/09 a equipa saía da morada (código postal, concelhos,
  freguesias e, sem nada disso, a melhor resposta do Google Maps), só o Porto
  era escolhido à mão (Porto 1 e Porto 2), e a Lisboa 2 recebia sozinha os
  serviços de Lisboa em que a parte do dono era 60% a 80% do valor. Tudo isso
  saiu a 29/09; não voltar a pôr regras automáticas sem ele pedir.
- **A zona da pista** sai das mesmas regras e listas que o CRM usa para a
  região (`src/lib/calendarServices.ts`, código postal, concelhos,
  freguesias; Aveiro e Coimbra são Porto e o Alentejo Lisboa) e, sem nada
  disso, da morada no **Google Maps** (serviço Maps do próprio Apps Script,
  sem chave), que recebe só a morada: o título sem o primeiro bocado, sem
  telefones e sem o nome ao lado do telefone. Primeiro a morada como está,
  depois sem andar e lado, depois só o último bocado. Fora de todas as regiões
  a zona é a da equipa com a base mais perto; ilhas e estrangeiro ficam sem
  zona. Cada morada procura-se uma vez e fica guardada (o Maps tem limite
  diário).
- **O Maps também dá a morada à equipa:** quando o evento não tem local, a
  morada que o Maps encontrou vai para o "Onde" da cópia, para a equipa poder
  navegar até lá. Se o Maps não responder, a cópia segue sem morada.
- **A hora é o mesmo instante, mostrado em Portugal.** O calendário do dono
  está no fuso de Copenhaga desde 23/08/2026 e a hora que lá está é a de
  Copenhaga (dono, 28/09/2026: "estou com uma hora de avanço"; o serviço que
  ele vê às 15:00 é às 14:00 em Portugal). A cópia leva o mesmo instante no
  fuso de Lisboa, por isso a equipa vê uma hora a menos. A primeira versão
  copiava os números do relógio (15:00) e punha a equipa uma hora atrasada;
  foi corrigida antes de os calendários serem partilhados.
- **Cores no calendário do dono** (dono, 28/09/2026: "quero o meu com cores
  em vez de ser tudo azul", "pinta só os serviços para a frente"): cada
  serviço que ainda não acabou fica com a cor da equipa (Porto 1
  azul Mirtilo, Porto 2 azul-claro Pavão, Braga verde Basílico, Lisboa 1 laranja Tangerina, Lisboa 2
  roxo Uva, Algarve amarelo Banana). A cor é a escolha do dono; o script só a
  põe quando a equipa foi escolhida por escrito ("equipa X"). **Cuidado com o
  CRM:** mudar a cor mexe na data de alteração do evento, e o CRM
  (`calendarSync.ts`) relê um evento alterado depois da linha e escreve por
  cima das correções feitas no CRM. Só acompanha eventos criados depois de
  26/09/2026 às 15:00 UTC, e esses são pintados segundos depois de criados,
  antes de haver correções. Na pintura dos serviços que já existiam (28/09)
  só dois estavam nessa situação. Os serviços que já passaram ficam como
  estavam.
- **A equipa escrita no serviço do dono** (dono, 28/09/2026: "eu assim não
  vejo que equipa vai"): a primeira linha da descrição de cada serviço que
  ainda não acabou passa a ser "Equipa: Porto 1" (ou Porto 2, Braga, Lisboa 1,
  Lisboa 2, Algarve), escrita pelo script ao mesmo tempo que a cor. É só informação: é
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
  cor da equipa. Escondidos, a app do telemóvel continua a oferecê-los ao
  criar um evento, e propõe o último usado ("ele sugere sempre a equipa que eu
  coloquei no serviço anterior"). A 29/09/2026 tentou-se tirá-los da lista do
  dono e a Google recusa: "The data owner of a calendar cannot remove such a
  calendar from their calendar list". Por isso um serviço que caia num
  calendário de equipa passa para o do dono com a cor dessa equipa, que é a
  escolha dele. **Escolher um calendário de equipa na app volta a pô-lo à
  vista**, e o dono passa a ver cada serviço a dobrar no telemóvel (30/09/2026,
  Lisboa 2 e Algarve): o script confirma a cada volta que estão escondidos, em
  vez de uma vez só. **Uma cópia mudada no telemóvel chega ao evento do dono
  em segundos**: desde 30/09 há um gatilho de alteração em cada calendário de
  equipa, além do dele (antes só a volta de 15 minutos o apanhava, e o PC
  ficava até lá com a hora antiga). **Não tirar os
  serviços do calendário do dono** (ele chegou a pedir): o CRM lê-os de lá e
  a cópia parte deles; sem o original, o CRM marcava-os como apagados e as
  equipas recebiam "cancelado".
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
- **Uma cópia mudada à mão passa a mudança para o evento do dono**
  (`edicoesNasCopias`): se o título ou as horas da cópia forem diferentes dos
  do evento do dono e a cópia tiver sido mudada depois dele, o evento do dono
  fica com o título e as horas da cópia, e a equipa recebe o aviso de
  alteração. Se o dono mudar o evento dele depois, ganha o dele. Aconteceu a
  29/09/2026: o dono mudou no telemóvel a cópia da Lisboa 1 de 1 para 16/10.
- O CRM continua a ler só o calendário do dono (`calendar-events`). Os
  calendários das equipas não entram nas contas.
- **Um serviço criado à mão no calendário de uma equipa passa sozinho para o
  calendário do dono** (`paraMover`, na volta seguinte, até 15 minutos), com
  a cor dessa equipa: escolher o calendário da equipa na app é uma forma de o
  dono escolher a equipa. Entra no CRM e a cópia volta a ser feita nessa
  equipa. Uma versão de 29/09 passava-os sem cor e desfazia-lhe a escolha;
  não repetir. Dono,
  29/09/2026: "todos os serviços que eu coloco no calendário têm de aparecer no
  CRM, ponto", depois de a app do telemóvel ter gravado quatro serviços nos
  calendários da Porto 1, Porto 2 e Lisboa 1. Não passa o que não é serviço nem
  o que já existe no calendário do dono com o mesmo título e hora; esses (e uma
  mudança que falhe) continuam a dar o email "Serviço criado fora do teu
  calendário".

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
