// Bundles src/lib/botEngine.ts (the pricing engine and the availability) into one
// self-contained file for the `bot-api` Edge Function. Deno cannot import the
// site's TypeScript directly: it wants file extensions and the Supabase CLI
// only ships `supabase/functions/`. The bundle is committed, and
// src/lib/botEngineBundle.test.ts fails if it no longer matches the source,
// so a price change cannot reach the site and miss the bot.
//
// Run: npm run build:bot-engine
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const BOT_ENGINE_OUT = fileURLToPath(new URL('../supabase/functions/_shared/botEngine.generated.js', import.meta.url));
const HEADER = '// GERADO por `npm run build:bot-engine` a partir de src/lib/botEngine.ts. Não editar à mão.\n';

export async function bundleBotEngine() {
  const result = await build({
    entryPoints: [fileURLToPath(new URL('../src/lib/botEngine.ts', import.meta.url))],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    write: false,
    legalComments: 'none',
    charset: 'utf8',
  });
  return HEADER + result.outputFiles[0].text;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(BOT_ENGINE_OUT, await bundleBotEngine());
  console.log(`bot engine → ${BOT_ENGINE_OUT}`);
}
