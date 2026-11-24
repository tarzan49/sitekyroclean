# Prompt: uniformizar o site com as secções de ecrã inteiro

Cola isto numa sessão nova do Claude Code, na pasta do site. Trabalha um modelo de página de cada vez e pára no fim de cada um para o dono ver.

---

## Objetivo

Levar o padrão aprovado pelo dono a 24 Nov (páginas `pack-sofa-impermeabilizacao-*` e `pack-cadeiras-impermeabilizacao-*`, commit `fb9eae2f`) a todas as páginas do site, com calma, sem estragar nada. O site tem de ficar premium: cada secção ocupa um ecrã inteiro, sem faixas das secções vizinhas, com encaixe suave no scroll, em telemóvel e computador.

## O padrão aprovado (ler primeiro)

- `src/pages/PackComboPage.tsx` (ramo `simpleKind`), `src/components/WaterproofPackPicker.tsx`, `src/components/WaterproofPackSections.tsx`.
- CSS `html.snap-sections` no fim de `src/index.css`: `scroll-snap-type: y mandatory`, secções com `min-height` do ecrã menos o menu (`--header-h`, medido em `Header.tsx`), conteúdo centrado e com largura total, `scroll-margin-top: 0`, barra fixa do WhatsApp escondida, compactações do hero por `data-hero-part`.
- Ligação por página: a página põe a classe `snap-sections` no `<html>` num `useEffect` (ver `PackComboPage.tsx`). Só se liga num modelo depois de ele estar compactado.

Regras de desenho que o dono deu:
1. Mobile-first sempre. Cada secção cabe num ecrã: telemóvel 375×667 (610 px úteis com o menu) e computador baixo 1280×620 (559 px úteis).
2. Só dourado `#D4AF37` (nunca o castanho `#8B6914`), nunca em dash, nunca o ícone Sparkles.
3. Hook em pergunta no topo ("O seu sofá já não é novo, mas gostava que voltasse a parecer?") e depois o complemento.
4. As 3 informações do hero (duração, resposta, secagem) ficam sempre, com os números a dourado.
5. Preços só do motor; nas escolhas de preço, os totais do `botQuote` (iguais ao WhatsApp), com a deslocação incluída. Um "desde" é sempre o total mais baixo que o bot dá.
6. Escolhas simples: uma pergunta, opções com o total final, um botão. Nada de configuradores com regras escritas.
7. Nada genérico nem com ar de IA: material real nosso (`BEFORE_AFTER_POOL`, vídeos `imper-agua-*`, `public/images/service-examples`). Imagens geradas só onde não haja real e com sentido.
8. Perguntas frequentes: no máximo 5, as que os clientes fazem, compactas, fechadas por defeito.
9. Faixas de cartões no telemóvel deslizam sozinhas (3,5 s, suave) e param quando a pessoa toca (`useAutoSlide`).
10. Vídeos verticais nunca esticam a secção: moldura fixa (`fixedFrame` em `ServiceResultsGallery.tsx`).

## Âmbito e ritmo

O site TODO (dono, 24 Nov), com calma: uma fase de cada vez, um modelo de cada vez, e o dono vê cada modelo antes de avançar.

## Fase 0: peças base (antes de mexer em qualquer página)

Transformar o que foi feito nos packs em peças partilhadas, com testes:
1. Secções de ecrã inteiro com encaixe: um hook (ex. `useSnapSections()`) que cada modelo liga quando estiver compactado; o CSS de `html.snap-sections` sai das regras só de packs e passa a genérico.
2. Topo compacto: opção do `CommercialHero` (prop), em vez de CSS por `data-hero-part` só para packs. Números das 3 informações a dourado (já em todo o site, `ServiceSnapshotStats.tsx`).
3. Widget de preço universal (a partir de `WaterproofPackPicker.tsx`): uma pergunta + opções com o total do `botQuote`, configurado por serviço. Sofá: lugares 1-6 + canto/U/7+ (pela fotografia); limpeza, Premium, Essencial, anti-ácaros. Colchão: tamanho; limpeza, anti-ácaros. Cadeiras: quantidade; limpeza, Premium, Essencial ("desde" sem a deslocação). Tapete e alcatifa: sem preço, pede medidas no WhatsApp.
4. Blocos de explicação simples (a partir de `WaterproofPackSections.tsx`): "o que resolve" (cartões reais a deslizar), "na mesma visita" (antes/depois/vídeo real; história no telemóvel com `StoryPlayer`), perguntas (máx. 5, compactas). Vídeos de impermeabilização sempre do próprio artigo (cadeiras = vídeos de cadeiras).
5. Script de medição (`scripts/`): abre cada modelo em 375×667 e 1280×620 e falha se uma secção não couber, se houver scroll para o lado ou se o HTML do prerender disser coisa diferente da página.

A barra fixa do WhatsApp já segue a regra do site todo (`MobileStickyBar.tsx`): acompanha sempre, esconde-se só quando a secção no ecrã tem botão de WhatsApp.

## Ordem (um modelo de cada vez)

1. Páginas de serviço (`/limpeza-sofas`, `/limpeza-colchoes`, `/limpeza-cadeiras`, `/limpeza-tapetes`, `/limpeza-alcatifas`, `/impermeabilizacao` e afins): são o molde das páginas por cidade e por freguesia, onde está quase todo o tráfego.
2. Página inicial.
3. Páginas de preço.
4. Problemas e materiais.
5. Marcas e variantes de sofá.
6. Os outros packs.
7. Blog no fim: os artigos são texto corrido; adaptar o topo, os blocos de explicação e o widget de preço ao fim do artigo, sem encaixe por secções no texto.

## Como trabalhar cada modelo

1. Lista as secções do modelo e mede a altura de cada uma (sem `min-height`) em 375×667 e 1280×620. Usa a moldura `public/telemovel-preview.html` (só local, está em `.git/info/exclude`) e o browser interno.
2. Para cada secção que não cabe, propõe ao dono o que encurtar ou reorganizar (cartões a deslizar, texto mais curto, menos elementos), em texto e com captura, antes de mudar conteúdo. Mudanças só de espaçamento não precisam de OK.
3. Compacta, liga a classe `snap-sections` nesse modelo e volta a medir. Confirma: nada a sair para o lado (`scrollWidth` = largura do ecrã), o encaixe pára exatamente no topo de cada secção, os botões ficam à vista.
4. Anti-cloaking: o HTML do `scripts/prerender.ts` diz o mesmo que a página (textos, perguntas, preços). Mudou texto na página, muda no prerender pela mesma fonte de dados em `src/data/*`.
5. Verifica com `npm run typecheck` (nunca `npx tsc --noEmit`) e `npm run build`, e mede 3 cidades diferentes do mesmo modelo (nomes curtos e longos).
6. Mostra ao dono na moldura de telemóvel e no computador. Só depois do OK: commit só dos ficheiros desse modelo (há outras sessões no mesmo repositório) e publicação com build limpo (`git archive HEAD`, `.env`, `npx wrangler deploy`, confirmar que o JS não tem `placeholder.supabase`).

## Travões

- Nunca mudar preços, regras do bot ou factos de negócio por causa do design; se um número parecer errado, mostra-o ao dono.
- Nunca remover conteúdo que o Google lê (FAQ, texto local) sem dizer ao dono quanto texto sai.
- Se uma secção não couber de forma nenhuma sem perder informação importante, pergunta ao dono em vez de cortar.
- Uma página de cada modelo à vez; não ligar o encaixe em todo o site de uma só vez.
