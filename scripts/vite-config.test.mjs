// @vitest-environment node
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { resolveConfig } from 'vite';

// Os plugins que escrevem no dist/ só podem correr num `vite build`: o dev
// server também chama o closeBundle ao fechar e ao reiniciar, e deixava as
// páginas todas com o corpo da homepage (ver o comentário no vite.config.ts).
async function closeBundlePlugins(command) {
  const configFile = fileURLToPath(new URL('../vite.config.ts', import.meta.url));
  const config = await resolveConfig({ configFile, logLevel: 'silent' }, command);
  return config.plugins.filter((plugin) => plugin.closeBundle && !plugin.name.startsWith('vite:')).map((plugin) => plugin.name);
}

test('o dev server não corre nenhum closeBundle do projeto', async () => {
  assert.deepEqual(await closeBundlePlugins('serve'), []);
});

test('o vite build corre os quatro, por esta ordem', async () => {
  assert.deepEqual(await closeBundlePlugins('build'), ['generate-sitemap', 'generate-llms-txt', 'prerender-routes', 'inject-csp-script-hash']);
});
