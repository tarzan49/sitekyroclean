# Biblioteca visual dos problemas de sofás

13/09/2026. Biblioteca completa de sofás: 40 imagens, dez por problema, produzidas com a ferramenta integrada de geração de imagens (não foi usada a API/CLI). Inclui as quatro do piloto e 36 novas alternativas. Não estão ligadas ao site público, ao prerender, aos sitemaps ou às galerias de trabalhos reais.

Abrir `index.html` em viewport mobile de 390 × 844. O painel usa Avenir local e recortes de 185px de altura. Cada cartão permite selecionar as dez alternativas e avançar/recuar com botões de 44px; os cartões são independentes. As ilustrações mostram uma situação ou a sua avaliação, não um resultado de limpeza.

| Problema | Ficheiro final em `assets/` | Correspondência |
| --- | --- | --- |
| `limpeza-sofas-1` | `sofa-manchas-01.webp` a `sofa-manchas-10.webp` | Café, vinho, gordura e outras marcas localizadas em diferentes tecidos; sem comparação antes/depois. |
| `limpeza-sofas-2` | `sofa-residuos-01.webp` a `sofa-residuos-10.webp` | Resíduos em costuras, junções e superfícies; sem microrganismos ou suposta microscopia. |
| `limpeza-sofas-3` | `sofa-odores-01.webp` a `sofa-odores-10.webp` | Pessoas ilustrativas a verificar o odor de almofadas; sem fumo ou representação de doença. |
| `limpeza-sofas-4` | `sofa-desgaste-01.webp` a `sofa-desgaste-10.webp` | Borboto, abrasão e textura achatada; não sugere reparação pela limpeza. |

## Produção e verificação

Prompts integrais, textos alternativos e associação por ID em `manifest.json`. `library-data.js` contém apenas os campos necessários ao painel, cuja igualdade com o manifesto é verificada pela auditoria. `viewer.js` controla a seleção autónoma, sem dependências ou pedidos de contacto. Estilo comum: fotografia ilustrativa natural, enquadramento próximo, luz de janela, sem marcas, texto incorporado, promessas de resultado ou referências a localidades. As pessoas são geradas, não são clientes ou testemunhos.

Ficheiros WebP a 1200 × 675, qualidade 82: 4.561.820 bytes no conjunto (4,56 MB), média de 114 KB por imagem. O painel carrega apenas a alternativa selecionada em cada cartão, não as 40 ao abrir. Os originais da geração permanecem na pasta de imagens geradas da aplicação; só os derivados finais foram incluídos no projeto.

As 40 imagens foram inspecionadas em pranchas de revisão. Teste em mobile 390 × 844 percorreu as 40 opções, confirmou carregamento e texto alternativo, independência dos quatro cartões, transição da última para a primeira e vice-versa, alvos de 44px e ausência de overflow. A imagem de resíduos ilustra acumulação visível, não demonstra sujidade invisível em profundidade. A de odores ilustra avaliação, não permite diagnosticar a origem pela fotografia.

Verificação repetível: `node scripts/audit-sofa-image-library.mjs`. Confirma dez imagens por problema, IDs e nomes coerentes, 40 ficheiros distintos por hash, dimensões/formato/peso, texto alternativo e igualdade entre os dados do painel e o manifesto. Os hashes não medem originalidade visual ou valor SEO.

Como apenas foram acrescentados documentos/ativos fora do build, não se voltou a executar a suite do site nem se reivindica uma validação de produção nesta etapa.

Atualização de apresentação: por pedido do responsável, o aviso visível foi simplificado para «Imagens ilustrativas» e as quatro legendas para «Imagem ilustrativa». A proveniência permanece neste documento e no manifesto.

## Continuação

A biblioteca de sofás está completa; faltam as 200 imagens dos outros cinco serviços para chegar às 240 previstas e a integração nas páginas. Na integração, selecionar por ID do problema e identidade estável da página, manter alternativa fixa entre React e HTML inicial, legenda «Imagem ilustrativa» e textos alternativos sem localidades inventadas. Não integrar estas imagens nos comparadores antes/depois ou nas galerias de trabalhos reais. A navegação manual deste painel é apenas para revisão, não é a seleção estável das páginas públicas.
