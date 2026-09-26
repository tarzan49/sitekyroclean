# Textos dos anúncios, Porto e Lisboa

Gerado a partir de `campanhas-porto-lisboa.csv` (`python3 docs/google-ads/gerar-csv.py`).
**Os 4 anúncios existem no Google Ads desde 24/09/2026; estes são os textos
em vigor desde 26/09/2026**, lidos de volta da conta e iguais aos do CSV. Os 4
com eficácia "Excelente". Vêem-se em Campanhas → Anúncios, onde a interface
em português os chama "Anúncio dinâmico de pesquisa".

Limites do Google: título ≤30 carateres, descrição ≤90. O número entre
parênteses é a contagem que a Google faz.

**`{LOCATION(City):Porto}` é inserção automática da cidade:** quem pesquisa em
Gaia vê "Limpeza de Sofás Vila Nova de Gaia" se couber nos 30 carateres; se não
couber, ou se a Google não souber a cidade, sai o texto a seguir aos dois pontos.
A contagem é feita por esse texto.

**O que mudou a 26/09/2026, e porquê:**

- Avaliações sem "no Google" ("+125 Avaliações de Clientes", "Avaliação Média
  de 4,9"): as fichas do Google mostram números por estabelecimento que não
  coincidem com o total do site, e o anúncio aparece ao lado delas.
- Cidade automática nos títulos e descrições sem cidade: com a segmentação a
  cobrir a Margem Sul e o Norte até Braga, "em Lisboa" lido em Almada ou "no
  Porto" lido em Braga soava a outra empresa.
- "Seca em 3 a 6 Horas" passou a "Secagem Média de 3 a 6 Horas", que é o que
  o site promete (média, dependente do tecido e da ventilação).
- Porto: "Equipa Própria no Norte", porque a mesma equipa serve Braga e Guimarães.
- Impermeabilização: saíram "Limpa com um Pano, Sem Nódoa" e "saem com um pano
  seco" (resultado garantido que a proteção não dá); os preços passaram a
  "Desde", porque 59€ e o pack são os preços de 1 lugar.
- 26/09/2026: o pack passou de "desde 99€" para "desde 89€" nos dois anúncios de
  impermeabilização (título 11 e descrição 4), a pedido do dono. 89€ é o que o
  quiz e o site cobram (`bothPrice` menos o desconto de pack); o 99€ era o
  `bothPrice` cru. Editado na conta a 26/09 e verificado depois de recarregar.

---

## Porto · Limpeza de Sofás

**Página de destino:** `https://cleansolutions.com.pt/limpeza-sofas-porto?ads=1`  
**Caminho apresentado:** `cleansolutions.com.pt/limpeza-sofas/porto`

**Títulos (15):**

1. Limpeza de Sofás {LOCATION(City):Porto}  `(22)`
2. Higienização de Sofás {LOCATION(City):Porto}  `(27)`
3. +125 Avaliações de Clientes  `(27)`
4. Avaliação Média de 4,9  `(22)`
5. +1100 Clientes Servidos  `(23)`
6. Resposta em 10 Minutos  `(22)`
7. Orçamento Grátis no WhatsApp  `(28)`
8. Preço Fechado Antes de Marcar  `(29)`
9. Garantia de Repetição  `(21)`
10. Limpeza de Sofás ao Domicílio  `(29)`
11. Secagem Média de 3 a 6 Horas  `(28)`
12. Manchas, Pelos e Odores  `(23)`
13. Limpeza de Estofos {LOCATION(City):Porto}  `(24)`
14. Equipa Própria no Norte  `(23)`
15. Limpe e Proteja no Mesmo Dia  `(28)`

**Descrições (4):**

1. Higienização profissional de sofás ao domicílio. Secagem média de 3 a 6 horas.  `(78)`
2. Avaliação média de 4,9 em mais de 125 avaliações e mais de 1100 clientes servidos.  `(82)`
3. Preço fechado antes da marcação, sem surpresas. Orçamento grátis pelo WhatsApp.  `(79)`
4. Se não ficar satisfeito, avise em 48 horas e repetimos a limpeza sem custos.  `(76)`

---

## Porto · Impermeabilização de Sofás

**Página de destino:** `https://cleansolutions.com.pt/impermeabilizacao-porto?ads=1`  
**Caminho apresentado:** `cleansolutions.com.pt/protecao-sofas/porto`

**Títulos (15):**

1. Impermeabilização de Sofás  `(26)`
2. Impermeabilizar Sofá {LOCATION(City):Porto}  `(26)`
3. Vinho, Café e Sumo no Sofá  `(26)`
4. Derrames Ficam à Superfície  `(27)`
5. Impermeabilização de Estofos  `(28)`
6. Proteja Antes da Próxima Nódoa  `(30)`
7. Crianças e Animais em Casa?  `(27)`
8. Premium: Até 10 Anos  `(20)`
9. Resiste a Até 5 Lavagens  `(24)`
10. Impermeabilização Desde 59€  `(27)`
11. Limpeza + Proteção Desde 89€  `(28)`
12. Avaliação Média de 4,9  `(22)`
13. +125 Avaliações de Clientes  `(27)`
14. Aplicação ao Domicílio  `(22)`
15. Orçamento Grátis no WhatsApp  `(28)`

**Descrições (4):**

1. Com a proteção, vinho, café ou sumo ficam à superfície e limpam-se com mais facilidade.  `(87)`
2. Impermeabilização de sofás ao domicílio. Essencial desde 59€, Premium desde 89€.  `(80)`
3. A Premium protege até 10 anos e resiste a até 5 lavagens. A Essencial, 1 a 2 anos.  `(82)`
4. Limpeza e proteção na mesma visita, em pack desde 89€. Avaliação média de 4,9.  `(78)`

---

## Lisboa · Limpeza de Sofás

**Página de destino:** `https://cleansolutions.com.pt/limpeza-sofas-lisboa?ads=1`  
**Caminho apresentado:** `cleansolutions.com.pt/limpeza-sofas/lisboa`

**Títulos (15):**

1. Limpeza de Sofás {LOCATION(City):Lisboa}  `(23)`
2. Higienização de Sofás {LOCATION(City):Lisboa}  `(28)`
3. +125 Avaliações de Clientes  `(27)`
4. Avaliação Média de 4,9  `(22)`
5. +1100 Clientes Servidos  `(23)`
6. Resposta em 10 Minutos  `(22)`
7. Orçamento Grátis no WhatsApp  `(28)`
8. Preço Fechado Antes de Marcar  `(29)`
9. Garantia de Repetição  `(21)`
10. Limpeza de Sofás ao Domicílio  `(29)`
11. Secagem Média de 3 a 6 Horas  `(28)`
12. Manchas, Pelos e Odores  `(23)`
13. Limpeza de Estofos {LOCATION(City):Lisboa}  `(25)`
14. Equipa Própria em Lisboa  `(24)`
15. Limpe e Proteja no Mesmo Dia  `(28)`

**Descrições (4):**

1. Higienização profissional de sofás ao domicílio. Secagem média de 3 a 6 horas.  `(78)`
2. Avaliação média de 4,9 em mais de 125 avaliações e mais de 1100 clientes servidos.  `(82)`
3. Preço fechado antes da marcação, sem surpresas. Orçamento grátis pelo WhatsApp.  `(79)`
4. Se não ficar satisfeito, avise em 48 horas e repetimos a limpeza sem custos.  `(76)`

---

## Lisboa · Impermeabilização de Sofás

**Página de destino:** `https://cleansolutions.com.pt/impermeabilizacao-lisboa?ads=1`  
**Caminho apresentado:** `cleansolutions.com.pt/protecao-sofas/lisboa`

**Títulos (15):**

1. Impermeabilização de Sofás  `(26)`
2. Impermeabilizar Sofá {LOCATION(City):Lisboa}  `(27)`
3. Vinho, Café e Sumo no Sofá  `(26)`
4. Derrames Ficam à Superfície  `(27)`
5. Impermeabilização de Estofos  `(28)`
6. Proteja Antes da Próxima Nódoa  `(30)`
7. Crianças e Animais em Casa?  `(27)`
8. Premium: Até 10 Anos  `(20)`
9. Resiste a Até 5 Lavagens  `(24)`
10. Impermeabilização Desde 59€  `(27)`
11. Limpeza + Proteção Desde 89€  `(28)`
12. Avaliação Média de 4,9  `(22)`
13. +125 Avaliações de Clientes  `(27)`
14. Aplicação ao Domicílio  `(22)`
15. Orçamento Grátis no WhatsApp  `(28)`

**Descrições (4):**

1. Com a proteção, vinho, café ou sumo ficam à superfície e limpam-se com mais facilidade.  `(87)`
2. Impermeabilização de sofás ao domicílio. Essencial desde 59€, Premium desde 89€.  `(80)`
3. A Premium protege até 10 anos e resiste a até 5 lavagens. A Essencial, 1 a 2 anos.  `(82)`
4. Limpeza e proteção na mesma visita, em pack desde 89€. Avaliação média de 4,9.  `(78)`
