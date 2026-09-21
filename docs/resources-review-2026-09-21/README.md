# Recursos: revisão de conteúdo e conversão

Revisão de 21/09/2026, a pedido do responsável. A captura fornecida usava o artigo `/blog/quanto-custa-limpar-alcatifa` como exemplo. O responsável confirmou que a referência a «100 páginas» era aos 100 termos do glossário.

## Inventário confirmado

- 26 artigos existentes, conservando todos os URLs.
- 100 termos no glossário, conservando os 100 identificadores/âncoras.
- Uma página de FAQ e uma página de índice do Blog: 29 URLs no sitemap de recursos gerado.
- No início da revisão, o sitemap público de recursos devolveu 26 URLs (artigos). Os três hubs estavam no sitemap principal: a deduplicação global removia-os de Recursos. Foram reclassificados para Recursos, mantendo o total global e alinhando com o painel. Não eram páginas desaparecidas.
- O histórico de `blogData.ts` chegou a 27 artigos. `impermeabilizacao-tapete-guia` saiu quando esse serviço foi descontinuado; não foi reposto.
- O monitor apresentava «a mostrar primeiras 100» mesmo quando tinha menos URLs. Agora distingue lista completa de lista truncada.

## Desenho final

O responsável rejeitou uma linguagem editorial separada das páginas comerciais. Os artigos reutilizam `CommercialHero`, `ServicePriceSection`, `ServiceReviewsGrid`, `SectionHeader`, `ServiceFAQ` e `ServicePackBanner`: verde e dourado canónicos, Avenir, CTA principal WhatsApp, preços/medidas no configurador existente, comparação da biblioteca aprovada, indicadores e avaliações reais. Seguem-se guia com índice, quatro FAQ e ligação para montar o pack. O hero continua com o H1 específico de cada artigo.

Índice do Blog, FAQ e Glossário usam `ResourceHubHero` e `ResourceNav`, com o fundo verde canónico e ligações de serviço. O Blog permite procurar e filtrar os 26 guias. O Glossário permite pesquisar os 100 termos; as âncoras diretas revelam novamente a lista. Não foram criadas 100 páginas artificiais.

## Conteúdo

Os 26 artigos e os 100 termos foram revistos individualmente. Retirados: preços datados de 2025, devolução de dinheiro inventada, recolha nacional e entrega de tapetes em 24–48h, resultados absolutos, descontos/contratos não confirmados, promessa de ambas as faces do colchão incluídas, extração a seco presumida em espuma/látex, temperaturas universais e certificações/benefícios clínicos não comprovados. Limpeza, extras e proteção mantêm âmbitos distintos. Reposição explícita de tratar, escovar, extrair e conferir/secar quando compatível, sem aplicar a sequência húmida automaticamente a couro, seda, sisal ou juta.

Preços de sofá/colchão e proteção nos artigos são derivados de QuizTypes; deslocação do mínimo real da tabela central. A proteção continua a mostrar Essencial e Premium. Tapetes e alcatifas permanecem sob orçamento. Não se alteraram os motores de preço ou envio de pedidos.

Definições técnicas deixaram de apresentar receitas universais. Alcantara foi corrigida: material sintético, não couro natural. Os exemplos antigos de resultados sem origem foram retirados. Fontes consultadas:

- [SPAIC: ácaros e cuidados](https://www.spaic.pt/perguntas-frequentes?id=13)
- [OMS: humidade e bolor](https://www.who.int/publications/i/item/9789289041683)
- [Alcantara: material](https://www.alcantara.com/the-material/)
- [Alcantara: manutenção](https://www.alcantara.com/cleaning-maintenance/)
- [IICRC S100](https://iicrc.org/s100/) e [S300](https://iicrc.org/s300/)

## Fontes partilhadas e verificação

`resourceContent.ts` partilha condições, quatro FAQ, oferta contextual, mensagem WhatsApp, factos do hero, preços e seleção de avaliações com o prerender. O HTML inicial contém os textos revistos; o FAQPage é igual ao conteúdo React. O glossário inicial conserva os 100 IDs e as definições, fontes e ligações de serviço.

- TypeScript e ESLint dos ficheiros alterados.
- 13 testes de conteúdo, inventário, preços e renderização Markdown.
- `node scripts/audit-resources.mjs` verifica os 29 HTMLs e sitemap, canonical, metadados, quatro FAQ e igualdade das avaliações/textos comerciais.
- Testes de navegador apenas mobile: seis páginas a 360 e 390px, sem overflow ou erros; pesquisa, estados vazios, FAQ, âncoras do glossário, destino dos preços e contexto WhatsApp. Evidência em `mobile-checks.json` e capturas mobile.

Não foram enviados contactos de teste. A melhoria de conversão precisa de ser medida em utilização real; a revisão não demonstra por si só um aumento de vendas.
