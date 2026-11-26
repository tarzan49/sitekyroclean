// Bundles src/lib/crmSyncCore.ts (regras da sincronização Google Calendar → CRM)
// para a Edge Function `crm-calendar-sync`, como o motor do bot. O bundle vai
// no repositório; corre de novo depois de mudar calendarSync/calendarServices.
//
// Run: npm run build:crm-sync
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../supabase/functions/_shared/crmSync.generated.js', import.meta.url));
const HEADER = '// GERADO por `npm run build:crm-sync` a partir de src/lib/crmSyncCore.ts. Não editar à mão.\n';

const result = await build({
  entryPoints: [fileURLToPath(new URL('../src/lib/crmSyncCore.ts', import.meta.url))],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  write: false,
  legalComments: 'none',
  charset: 'utf8',
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
});
writeFileSync(OUT, HEADER + result.outputFiles[0].text);
console.log(`crm sync → ${OUT}`);
