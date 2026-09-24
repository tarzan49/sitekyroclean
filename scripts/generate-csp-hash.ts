/**
 * Replaces 'unsafe-inline' in the built _headers CSP's script-src with a
 * sha256 hash of the actual inline script in dist/index.html.
 *
 * public/_headers keeps 'unsafe-inline' as its checked-in source value
 * because the real hash depends on the built output and changes whenever
 * that script's bytes change — hardcoding it here would go stale the next
 * time the gtag consent snippet in index.html is edited. So this runs on
 * every build, after the static copy of public/_headers has landed in dist
 * and after prerender has produced the final dist/index.html.
 *
 * All 16.000+ prerendered pages carry that same inline script byte-for-byte
 * (verified across a sample; it's copied wholesale from index.html, never
 * regenerated per route), so one hash covers the whole site. Everything
 * else that reaches script-src is either same-origin (`type="module"`,
 * covered by 'self') or JSON-LD (`type="application/ld+json"`, not an
 * executable script type and therefore outside script-src's concern).
 *
 * Runs as a Vite closeBundle step (see vite.config.ts), after the prerender
 * plugin. Can also run standalone: npx tsx scripts/generate-csp-hash.ts dist
 */

import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

export function injectCspScriptHash(outDir: string): string {
  const indexPath = path.join(outDir, 'index.html');
  const headersPath = path.join(outDir, '_headers');

  const html = fs.readFileSync(indexPath, 'utf-8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!match) {
    throw new Error(`injectCspScriptHash: no bare <script> tag found in ${indexPath}`);
  }
  const hash = createHash('sha256').update(match[1], 'utf-8').digest('base64');
  const cspHash = `'sha256-${hash}'`;

  const headers = fs.readFileSync(headersPath, 'utf-8');
  let replaced = false;
  const updated = headers
    .split('\n')
    .map((line) => {
      if (!line.includes('Content-Security-Policy:')) return line;
      return line.replace(/script-src ([^;]*)/, (full, directive: string) => {
        if (!directive.includes("'unsafe-inline'")) {
          throw new Error(`injectCspScriptHash: 'unsafe-inline' not found in script-src (${headersPath})`);
        }
        replaced = true;
        return `script-src ${directive.replace("'unsafe-inline'", cspHash)}`;
      });
    })
    .join('\n');

  if (!replaced) {
    throw new Error(`injectCspScriptHash: no Content-Security-Policy line matched in ${headersPath}`);
  }

  fs.writeFileSync(headersPath, updated);
  return cspHash;
}

// ─── CLI Entry Point ─────────────────────────────────────────────
// npx tsx scripts/generate-csp-hash.ts [outDir]
const isMainModule = process.argv[1]?.includes('generate-csp-hash');
if (isMainModule) {
  const outDir = path.resolve(process.argv[2] ?? 'dist');
  const cspHash = injectCspScriptHash(outDir);
  console.log(`CSP script hash written: ${cspHash}`);
}
