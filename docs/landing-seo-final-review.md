# Revisão SEO das landing pages

Data: 13/09/2026. Âmbito: localidades, freguesias, preços e variantes dos seis serviços, 12.912 páginas. Integração no ramo `codex/home-process-preview`; não constitui confirmação de publicação em produção.

## Cinco correções

1. Município separado do nome apresentado nas variantes. Hero e orçamento passam a usar a mesma localidade comercial. As 540 variantes de Aveiro/Coimbra mantêm disponibilidade sob consulta. Santa Clara, Coimbra, apresenta 15€ nos dois locais.
2. Blocos de confiança revistos: removidas percentagens sem fundamento, promessas absolutas e desconto universal. A deslocação fica explicitamente fora do desconto; condições dependem do orçamento. A seleção dos três blocos é partilhada entre React e HTML inicial, incluindo as descrições completas.
3. Introdução editorial reposta junto da tabela de preços, preservando o hero aprovado. Usa contexto do serviço, município e informação útil para pedir orçamento, sem inventar características locais. Mantêm-se exatamente quatro FAQ por página.
4. Seleção visual equilibrada sem gerar ficheiros. As 240 imagens são utilizadas entre 173 e 253 vezes cada. A mistura final do hash redistribui uma vez as escolhas anteriores; a seleção continua estável por URL, independente de parâmetros, e igual no HTML inicial e interativo.
5. Município acrescentado ao H1 apenas quando necessário para distinguir freguesias homónimas. As 12.912 páginas têm agora H1 distintos; títulos SEO e descrições também são distintos. URLs e regras de canonical/indexação não foram alteradas.

## Distribuição visual

Cada serviço tem 2.152 páginas e quatro cartões por página.

| Serviço | Combinações distintas |
| --- | ---: |
| Sofás | 1.933 |
| Colchões | 1.937 |
| Tapetes | 1.907 |
| Cadeiras | 1.939 |
| Alcatifas | 1.935 |
| Impermeabilização | 1.928 |

Antes desta correção existiam aproximadamente 378–400 combinações por serviço. A variedade de imagens não é apresentada como prova de conteúdo editorial exclusivo nem como fator suficiente para melhor posicionamento.

## Validação

- 1.973 testes em 46 ficheiros aprovados; TypeScript e lint dos ficheiros alterados sem erros.
- Build completo: 16.045 rotas pré-renderizadas.
- Auditorias de SEO, estrutura e FAQ: 12.912 páginas, zero falhas.
- Auditoria comercial do resultado gerado: zero contradições detetadas pelas regras existentes.
- Mobile 390 × 844: Santa Clara/Coimbra, Glória/Aveiro, Vermoim/Maia, Vermoim/Vila Nova de Famalicão, preços de alcatifas/Lisboa e cadeiras/Lisboa. Sem overflow horizontal; contexto, introduções e confiança verificados. Nenhum pedido de contacto enviado.

Repetir após o build:

```sh
npm test
npx tsc --noEmit -p tsconfig.app.json
npm run build
node scripts/audit-landing-seo.mjs
node scripts/audit-landing-layout.mjs
node scripts/audit-landing-faqs.mjs
node scripts/audit-commercial-output.mjs
```

Os testes de regressão verificam a transmissão do município para o hero e percorrem o inventário para impedir títulos ambíguos, desaparecimento das introduções, regressões comerciais e distribuição visual excessivamente desigual. A auditoria de confiança passa a inspecionar conteúdo que não estava no HTML inicial anterior.

## Limites e acompanhamento

Esta entrega corrige os cinco problemas identificados; não demonstra indexação nem garante posições. Introduções contextuais e variação de perguntas/imagens não substituem utilidade real para o visitante. O processo pode continuar comum por serviço, sem fingir que limpeza, lavagem e higienização são métodos diferentes.

O Google recomenda [conteúdo útil e fiável](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) e alerta contra [páginas em escala sem valor acrescentado](https://developers.google.com/search/docs/essentials/spam-policies). A decisão de consolidar variantes ou alterar indexação deve ser suportada por dados de produção e Search Console, não apenas pela contagem de combinações. Nenhuma dessas alterações foi feita nesta tarefa.
