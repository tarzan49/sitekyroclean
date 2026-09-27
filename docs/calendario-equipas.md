# Calendários das equipas

Desde 28/09/2026 cada equipa (Porto, Braga, Lisboa e Algarve) tem o seu
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
   O `configurar` cria os quatro calendários, liga a cópia automática e faz a
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
- **Equipa de cada serviço**, por esta ordem: "equipa porto" (ou lisboa,
  braga, algarve) escrito no evento; o código postal; os concelhos servidos;
  as freguesias desses concelhos. São as mesmas regras e as mesmas listas que
  o CRM usa para a região (`src/lib/calendarServices.ts`): uma equipa por
  região (dono, 28/09/2026). Aveiro e Coimbra vão para o Porto e o Alentejo
  para Lisboa, como no `travel.ts`.
- **Serviço sem equipa:** não é copiado, e o dono recebe um email a pedir o
  código postal ou "equipa porto" (braga, lisboa, algarve) no evento. Assim que o
  evento for guardado, segue para a equipa. Não se adivinha: um palpite
  errado mandava o serviço para quem não o vai fazer, sem ninguém dar por
  isso. Com os serviços marcados a 28/09, 15 em 18 tinham equipa (10 Lisboa,
  4 Porto, 1 Algarve); os 3 que
  faltavam não tinham código postal nem uma localidade conhecida ("via
  longa", "Pucariça" e uma rua sem cidade).
- **A hora é a de Portugal.** A hora que o dono escreve no evento é a hora de
  Portugal (dono, 28/09/2026). O calendário dele está no fuso de Copenhaga
  desde 23/08/2026, por isso um serviço marcado às 15:00 fica guardado como
  14:00 em Portugal. A cópia leva os números escritos (15:00) no fuso de
  Lisboa. **Nunca copiar o instante do evento tal como está**, senão a equipa
  chega uma hora antes. Eventos criados antes de 23/08 (com o calendário em
  Lisboa) não mudam.
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
