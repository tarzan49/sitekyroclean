# Plano: o site todo no modelo novo (dono, 24 Nov 2026)

"Vamos ter que revolucionar o site" — tudo o que é limpeza de sofás primeiro, depois os outros serviços, um de cada vez.
Modelo: secções de ecrã inteiro com encaixe (`useSnapSections`), widget de preço com os totais do `botQuote`,
passo a passo com material real, perguntas compactas, só um título por secção. Medir 375×667 e 1280×620.
Cada família só passa a "feito" depois de o dono a ver na moldura. Atualizar esta tabela a cada passo.

Inventário (dist, 24 Nov: 21 797 páginas):

| Molde (`src/pages/`) | Páginas | Sofás | Estado sofás | Outros serviços |
|---|---|---|---|---|
| LocationServicePage (cidade) | 612 | 102 | FEITO | cadeiras, colchões, tapetes, alcatifas, impermeabilização FEITO (24 Nov) |
| FreguesiaServicePage | 4656 | 776 | FEITO (24 Nov) | todos os serviços FEITO (24 Nov) |
| PricePage (`/preco-limpeza-*`) | 612 | 102 | FEITO (OK 24 Nov) | todos os serviços FEITO (24 Nov) |
| SofaVariantPage (`/higienizacao-sofa-*`, `/lavagem-sofa-*`…) | 10541 | 2634 | FEITO nas variantes de limpeza de sofás (OK 24 Nov); `impermeabilizacao-sofa-*` é do serviço impermeabilização | cadeiras, colchões, tapetes, alcatifas e `impermeabilizacao-sofa/cadeiras-*` FEITO (24 Nov) |
| PackComboPage | 510+ | — | FEITO (todos os packs) | — |
| ProblemCityPage (`/manchas-cafe-sofa-*`, `/preco-limpeza-sofa-*`, `/acaros-sofa-*`) | 2434 | 1218 | FEITO (OK 24 Nov) | colchões, tapetes e alcatifas FEITO (24 Nov); outros (pelos-animais, cheiro-urina genéricos, imper 45) por fazer |
| MaterialPage (`/limpeza-sofa-veludo-*`) | 1133 | 721 | tecido FEITO (OK); pele: widget Renovado/Renovado + Pele FEITO, encaixe desligado (falta passo a passo sem vídeos de tecido) | tapetes 412 FEITO (24 Nov) |
| MarcaSofaPage | 416 | 416 | FEITO em tecido, falta OK; marcas de pele ficam no molde antigo | MarcaColchao 312 e MarcaCadeiras 312 FEITO (24 Nov) |
| TreatmentPage (`/tratamento-anti-acaros-*`, `/desbacterizacao-*`) | 206 | — | — | FEITO (24 Nov): texto encurtado com o OK do dono |
| CommercialPage | 32 | — | — | FEITO (24 Nov, 169072e2); alargar a todas as cidades e por setor: sessão "Páginas comerciais por setor e em todo o país" |
| Hubs: `/limpeza-sofas`, colchões, cadeiras, tapetes, alcatifas, `/impermeabilizacao` | 6 | 1 | /limpeza-sofas FEITO | /limpeza-tapetes, /limpeza-alcatifas, /impermeabilizacao FEITO (24 Nov); /limpeza-colchoes e /limpeza-cadeiras FEITO (24 Nov, packs-tratamento) |
| Página inicial | — | — | — | encaixe em curso (outra sessão, 328f1dad) |
| /guia-de-packs | 1 | — | — | FEITO (24 Nov, af14e74a) |
| Recursos de texto: /perguntas-frequentes-limpeza-estofos, /glossario, /estudo, blog | — | — | — | tratar como o blog (texto corrido, sem encaixe): só topo + widget no fim; por fazer |
| /sobre, /areas-de-servico, /problemas, /en | — | — | — | por fazer (sobre: 'O que fazemos' 820 px; áreas: 659 px) |

A verificar: 11 páginas saem do prerender com o molde `NotFound` (ex.: `blog.html`, `perguntas-frequentes-limpeza-estofos.html`).

Divisão (24 Nov): packs-tratamento = colchões e cadeiras em tudo; novo-modelo-seccoes = tapetes, alcatifas e impermeabilização.
Coordenação: sessão packs-tratamento (cadeiras por cidade, packs de tratamento), sessão do questionário (cesto da visita).
Regra única: `isNewModel(model)` em src/lib/newModel.ts (listas de serviços); mudar só aí.
Alcatifas: preço do motor (7€/m², 96775466); o dono disse a 24 Nov à noite "diria desde 5€ o metro quadrado": por decidir com ele (pedido à sessão dos tapetes).
