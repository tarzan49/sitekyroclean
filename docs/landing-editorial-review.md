# Revisão editorial das landing pages, etapa 3

13/09/2026. Âmbito: localidade × serviço, freguesia × serviço, preços e variantes keyword, total de 12.912 rotas. As famílias de problemas, materiais, marcas e inglês não foram reescritas nesta etapa.

## Biblioteca de perguntas

180 perguntas distintas: 12 comuns e 28 específicas de cada um dos seis serviços. Cada serviço tem 40 candidatas, não 40 perguntas visíveis. A expansão acrescenta 96 entradas (16 por serviço), distribuídas pelos quatro assuntos existentes: orçamento, preparação, tratamento e cuidados.

A página continua a mostrar exatamente quatro, uma por assunto, pelo menos duas específicas do serviço. Preços começa com orçamento específico. A seleção permanece estável por endereço e sem dependência de parâmetros publicitários. Nas variantes de impermeabilização, perguntas exclusivas de sofás não entram em cadeiras e vice-versa. Todas as 180 perguntas são alcançadas em rotas reais, verificado por teste.

As perguntas novas abordam decisões concretas: configuração e acesso aos artigos, etiquetas e revestimentos, danos que a limpeza não repara, limitações de materiais, preparação e utilização posterior. Não são paráfrases criadas apenas para aumentar combinações. Há reutilização legítima entre páginas; quatro respostas diferentes não tornam, por si só, cada URL uma página substancialmente única.

## Introduções e descrições SEO

`landingEditorial.ts` centraliza os dois campos para os quatro geradores. Distingue a preparação do pedido, a intenção de comparação de preços e o município da freguesia. Não inventa clientes locais, humidade típica, equipas residentes ou uma técnica exclusiva de “higienização” versus “limpeza”. Aveiro e Coimbra conservam disponibilidade sob consulta; tapetes e alcatifas são sob orçamento.

As novas introduções substituem, nesses campos públicos, textos antigos com alegações sanitárias ou de certificação sem suporte. Os heroes exibem o texto integral que também é emitido no HTML inicial. A descrição do schema de serviço das localidades usa a mesma descrição editorial, em vez da antiga promessa de resultado.

Não foram alterados URLs, títulos H1, preços, deslocações, avaliações, regras do quiz, indexação ou redirecionamentos. Os textos de outros campos legados continuam presentes nos geradores, embora as novas secções já não consumam os antigos problemas/processos. Não se considera concluída uma auditoria comercial de todo o site nem de todos os textos partilhados.

## Fontes técnicas e limites

- [TEMPUR, cuidados do produto](https://uk.tempur.com/caring-tempur.html): sustenta a cautela específica sobre não molhar/lavar o material TEMPUR, distinguir capa de núcleo e não usar calor como atalho de secagem. Não generalizar as instruções de uma marca a todos os colchões.
- [Carpet and Rug Institute, limpeza e manutenção](https://carpet-rug.org/carpet-for-homes/cleaning-and-maintenance/): seguir instruções do fabricante e avaliar cuidados próprios das peças; recomendações de manutenção não provam que todas as fibras aceitam o mesmo processo.
- Política comercial do projeto: `CORRECOES-COMERCIAIS-2026-09-10.md`, `commercialPolicy.ts`, `travel.ts` e decisões atuais do responsável em `AGENTS.md`. Sem novos preços, certificações, garantias de remoção total ou benefícios clínicos.

Estas referências não representam certificação, parceria ou autorização do fabricante à Kyro Clean. As respostas encaminham a decisão sobre compatibilidade para avaliação da etiqueta e do artigo; não prometem um método universal.

## Verificação

- 1.928 testes em 31 ficheiros aprovados; TypeScript e lint dos ficheiros novos/componentes alterados sem erros.
- Build completo: 16.045 rotas. Auditorias pós-build: 12.912 páginas abrangidas, sem divergências de estrutura, conteúdo, FAQPage, descrição SEO ou destinos dos links auditados.
- Testes editoriais percorrem todas as rotas; verificam quatro perguntas, assuntos, elegibilidade, alcance das entradas, localização, disponibilidade sob consulta e ausência das alegações proibidas cobertas pelos testes.
- Amostra mobile 390 × 844 dos seis serviços nas quatro famílias: quatro perguntas e cinco passos funcionais, sete secções, introdução integral coerente com HTML inicial e sem overflow horizontal. Nenhum contacto enviado.

Os testes não substituem leitura editorial de todas as combinações, não medem indexação e não garantem posições no Google. A biblioteca acrescenta texto ao pacote cliente; não se reivindica melhoria de desempenho.

## Seguinte etapa visual

Ainda não foram geradas imagens. Próximo trabalho: validar os quatro problemas de sofás e produzir um piloto visual coerente antes de expandir para dez alternativas por problema, 240 no total dos seis serviços. Imagens ilustrativas não podem ser apresentadas como trabalhos reais ou provas de resultados locais.
