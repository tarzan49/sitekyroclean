// Bundles the client follow-up engine (src/lib/followUpBundle.ts: rules,
// messages, digest e-mail) into one self-contained file for the
// `follow-up-digest` and `bot-api` Edge Functions, the same way as the bot's
// pricing engine (build-bot-engine.mjs). The bundle is committed, and
// src/lib/followUpEngineBundle.test.ts fails if it no longer matches the
// source, so a rule changed in the panel cannot miss the e-mail or the bot.
//
// Run: npm run build:follow-up-engine
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const FOLLOW_UP_ENGINE_OUT = fileURLToPath(new URL('../supabase/functions/_shared/followUpEngine.generated.js', import.meta.url));
const HEADER = '// GERADO por `npm run build:follow-up-engine` a partir de src/lib/followUpBundle.ts. Não editar à mão.\n';

export async function bundleFollowUpEngine() {
  const result = await build({
    entryPoints: [fileURLToPath(new URL('../src/lib/followUpBundle.ts', import.meta.url))],
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
  writeFileSync(FOLLOW_UP_ENGINE_OUT, await bundleFollowUpEngine());
  console.log(`follow-up engine → ${FOLLOW_UP_ENGINE_OUT}`);
}
