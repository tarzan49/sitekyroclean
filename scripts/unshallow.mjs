// Aprofunda o clone antes do build, para os sitemaps levarem <lastmod>.
//
// O `scripts/content-dates.ts` tira a data de cada família de páginas do
// histórico do git e, se o repositório for shallow, devolve `undefined` e os
// sitemaps saem sem `lastmod` — degrada em vez de mentir, que é o desenho
// certo. Só que o Cloudflare Pages clona shallow, e por isso o benefício nunca
// chegou a produção: medido a 2026-09-23, o build local escrevia `lastmod` nos
// 16.257 URLs e produção tinha 26 (os do blog, que vêm de data editorial e não
// do git).
//
// Corre como `prebuild`, por isso o `npm run build` do Cloudflare apanha-o sem
// ninguém ter de mudar o comando no dashboard.
//
// NUNCA falha o build. Um clone completo já responde "does not make sense" a
// este comando, e no Cloudflare pode não haver credenciais de git para buscar o
// resto do histórico. Nos dois casos o resultado é o de hoje: sitemaps sem
// `lastmod`. Um sitemap sem datas é muito menos mau do que um deploy falhado.
import { execFileSync } from 'node:child_process';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

try {
  if (git(['rev-parse', '--is-shallow-repository']) !== 'true') {
    console.log('  Clone completo: <lastmod> sai do histórico real.');
  } else {
    console.log('  Clone shallow: a buscar o histórico para o <lastmod>...');
    git(['fetch', '--unshallow']);
    const agora = git(['rev-parse', '--is-shallow-repository']) === 'true' ? 'continua shallow' : 'resolvido';
    console.log(`  ${agora}.`);
  }
} catch (erro) {
  // Sem histórico, os sitemaps saem sem <lastmod>, exatamente como antes.
  console.warn(`  Não foi possível aprofundar o clone (${erro?.message?.split('\n')[0] ?? erro}). Sitemaps sem <lastmod>.`);
}
