# Prompt para a Fase 7 (correr noutra sessão)

Copia tudo o que está abaixo da linha para uma sessão nova do Claude Code
aberta na pasta do projeto.

---

Estamos na Fase 7 do trabalho de GEO da Kyro Clean Solutions. Lê primeiro o
`CLAUDE.md` e o `CONTEXT.md`: a lista de fases está na secção de GEO e as
fases 1 a 6 estão feitas.

## Objetivo

Construir uma página de estudo com dados próprios da operação. As 16.000
páginas do site são combinatórias e qualquer concorrente as imita; os pedidos
reais que passaram pelo site são a única coisa que ninguém pode copiar. É o
tipo de facto que um motor generativo cita e atribui à fonte.

## Os dados

A consulta está em `supabase/queries/estudo-dados-proprios.sql`. É uma só
instrução de propósito (o SQL Editor do Supabase mostra apenas o resultado da
última instrução de um script). Devolve formato longo, com as colunas
`metrica, chave, pedidos, percentagem, q1, mediana, q3`, e as métricas são
`servico`, `cidade`, `mes`, `tipo_servico`, `valor_por_servico` e
`funil_passo`.

**Não consegues ler os dados sozinho:** a chave anónima não passa o RLS de
`quiz_events` nem de `leads`, de propósito. Pede ao dono para correr a
consulta no SQL Editor do dashboard e colar o resultado. Nunca sugiras
`supabase db push` neste projeto (ver a sétima armadilha no `CLAUDE.md`).

## O que fazer com o resultado

Uma página nova, `/estudo-limpeza-estofos-portugal` ou nome equivalente, com:

1. **Método à vista.** Que dados, que período, quantos registos, como foram
   agregados e o que foi excluído. Um estudo sem método não é citável. O
   corte nos grupos com menos de 20 registos já está na consulta e deve ser
   explicado na página.
2. **Os números, com a incerteza dita.** Se uma cidade tem 23 pedidos, isso
   não é uma tendência nacional e a página tem de o dizer.
3. **`Dataset` em JSON-LD**, além do `Article`, com `creator` a apontar por
   `@id` para o nó `#business`, como o resto do grafo faz.
4. **Prerender.** O que os motores leem é o HTML de `scripts/prerender.ts`,
   não o React. A página tem de sair inteira lá, com os números em `<table>`
   com cabeçalhos, como as tabelas de preços já fazem.
5. **Sitemap**, em `scripts/generate-sitemap.ts`, com `lastmod` de
   `scripts/content-dates.ts`.

## Regras que não podes quebrar

- **Anti-cloaking:** tudo o que for para o HTML estático tem de ser informação
  que a pessoa também recebe na página. Mesmos factos, renderização diferente.
- **Nada de números escritos à mão.** Os valores do estudo entram num módulo
  de dados próprio e a página importa-os, como `blogSources.ts` e
  `authors.ts` fazem.
- **Nada de em dash (—) em conteúdo visível.**
- **Zero dados pessoais.** Só agregados. Nenhum nome, telefone, email ou
  morada, e nenhum grupo com menos de 20 registos.
- **Se um número não se sustentar, não vai.** A regra das afirmações de saúde
  no `CLAUDE.md` aplica-se a qualquer afirmação factual.
- Mobile-first. Hero de páginas de SEO leva só o botão de WhatsApp.

## Uma coisa que a consulta já revelou

No funil, `start` é disparado à abertura do quiz e `abandon` só em condições
específicas: de 751 aberturas para 224 conclusões, só 53 abandonos ficaram
registados. Cerca de 90% das desistências não são medidas. **Isto não é
trabalho da Fase 7** e não deve entrar na página pública, mas convém ficar
registado como problema de instrumentação a corrigir à parte.

## No fim

Atualiza o `CLAUDE.md` (fase 7 feita, o que ficou por fazer) e o `CONTEXT.md`
se a arquitetura mudou. Commit e push, seguindo a numeração de fases única que
já lá está: não abras uma segunda contagem.
