# Plano: o site todo no modelo novo (dono, 24 Nov 2026)

"Vamos ter que revolucionar o site" — tudo o que é limpeza de sofás primeiro, depois os outros serviços, um de cada vez.
Modelo: secções de ecrã inteiro com encaixe (`useSnapSections`), widget de preço com os totais do `botQuote`,
passo a passo com material real, perguntas compactas, só um título por secção. Medir 375×667 e 1280×620.
Cada família só passa a "feito" depois de o dono a ver na moldura. Atualizar esta tabela a cada passo.

Inventário (dist, 24 Nov: 21 797 páginas):

| Molde (`src/pages/`) | Páginas | Sofás | Estado sofás | Outros serviços |
|---|---|---|---|---|
| LocationServicePage (cidade) | 612 | 102 | FEITO | cadeiras na branch packs-tratamento; resto por fazer |
| FreguesiaServicePage | 4656 | 776 | FEITO (24 Nov) | por fazer |
| PricePage (`/preco-limpeza-*`) | 612 | 102 | FEITO (OK 24 Nov) | por fazer |
| SofaVariantPage (`/higienizacao-sofa-*`, `/lavagem-sofa-*`…) | 10541 | 2634 | FEITO nas variantes de limpeza de sofás (OK 24 Nov); `impermeabilizacao-sofa-*` é do serviço impermeabilização | por fazer |
| PackComboPage | 510+ | — | FEITO (todos os packs) | — |
| ProblemCityPage (`/manchas-cafe-sofa-*`, `/preco-limpeza-sofa-*`, `/acaros-sofa-*`) | 2434 | 1218 | FEITO, falta OK do dono | por fazer |
| MaterialPage (`/limpeza-sofa-veludo-*`) | 1133 | 721 | FEITO em tecido, falta OK; PELE por fazer (precisa de widget sem impermeabilização: limpeza + tratamento da pele) | tapetes 412 |
| MarcaSofaPage | 416 | 416 | FEITO em tecido, falta OK; marcas de pele ficam no molde antigo | MarcaColchao 312, MarcaCadeiras 312 |
| TreatmentPage (`/tratamento-anti-acaros-*`) | 206 | — | — | por fazer |
| CommercialPage | 32 | — | — | por fazer |
| Hubs: `/limpeza-sofas`, colchões, cadeiras, tapetes, alcatifas, `/impermeabilizacao` | 6 | 1 | POR FAZER | por fazer |
| Página inicial, preços, guias, blog, /problemas, /en | — | — | — | por fazer (blog no fim) |

A verificar: 11 páginas saem do prerender com o molde `NotFound` (ex.: `blog.html`, `perguntas-frequentes-limpeza-estofos.html`).

Coordenação: sessão packs-tratamento (cadeiras por cidade, packs de tratamento), sessão do questionário (cesto da visita).
Regra das cadeiras combinada: `newModel = serviceSlug === 'limpeza-sofas' || (serviceSlug === 'limpeza-cadeiras' && family === 'localidade')`.
