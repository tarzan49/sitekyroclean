# Piloto visual dos problemas de sofás

13/09/2026. Quatro imagens novas, uma por problema, produzidas com a ferramenta integrada de geração de imagens (não foi usada a API/CLI). Não estão ligadas ao site público, ao prerender, aos sitemaps ou às galerias de trabalhos reais.

Abrir `index.html` em viewport mobile de 390 × 844. O painel usa Avenir local e recortes de 185px de altura para avaliar os cartões; não altera a composição ou o carrossel real. As quatro ilustrações mostram uma situação, não um resultado de limpeza.

| Problema | Ficheiro final em `assets/` | Correspondência |
| --- | --- | --- |
| `limpeza-sofas-1` | `sofa-manchas-01.webp` | Mancha localizada de café; sem comparação antes/depois. |
| `limpeza-sofas-2` | `sofa-residuos-01.webp` | Resíduos visíveis na união dos assentos; sem microrganismos ou suposta microscopia. |
| `limpeza-sofas-3` | `sofa-odores-01.webp` | Pessoa ilustrativa a verificar o odor; sem fumo ou representação de doença. |
| `limpeza-sofas-4` | `sofa-desgaste-01.webp` | Borboto e abrasão do tecido; não sugere reparação pela limpeza. |

## Produção e verificação

Prompts integrais e associação por ID em `manifest.json`. Estilo comum: fotografia ilustrativa natural, enquadramento próximo, luz de janela, sem marcas, texto incorporado, promessas de resultado ou referências a localidades. A pessoa da terceira imagem é gerada, não é cliente ou testemunho.

Ficheiros WebP a 1200 × 675, qualidade 82, cerca de 528 KiB no conjunto. Os originais da geração permanecem na pasta de imagens geradas da aplicação; só os derivados finais foram incluídos no projeto. Os quatro PNG copiados temporariamente para esta pasta foram retirados após a conversão, sem apagar os originais.

Inspeção dos quatro originais e dos quatro cartões em mobile 390 × 844: imagens carregadas, quatro legendas explícitas “Ilustração gerada por IA”, texto alternativo descritivo, sem overflow horizontal. A imagem de resíduos ilustra acumulação visível, não demonstra sujidade invisível em profundidade. A de odores ilustra avaliação, não permite diagnosticar a origem pela fotografia.

Como apenas foram acrescentados documentos/ativos fora do build, não se voltou a executar a suite do site nem se reivindica uma validação de produção nesta etapa.

Atualização de apresentação: por pedido do responsável, o aviso visível foi simplificado para «Imagens ilustrativas» e as quatro legendas para «Imagem ilustrativa». A proveniência permanece neste documento e no manifesto.

## Continuação

Este é o piloto, não a biblioteca completa. Faltam nove alternativas por problema de sofás (36 imagens), além dos outros cinco serviços. Validar primeiro a direção visual. Na integração, selecionar por ID do problema e identidade estável da página, manter alternativa fixa entre React e HTML inicial, legenda «Imagem ilustrativa» e textos alternativos sem localidades inventadas. Não integrar estas imagens nos comparadores antes/depois ou nas galerias de trabalhos reais.
