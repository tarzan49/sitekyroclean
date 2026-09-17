/**
 * Real modification dates for sitemap <lastmod>, derived from git history.
 *
 * generate-sitemap.ts deliberately emitted no <lastmod> for a long time, with
 * the note "omit until a reliable per-page editorial modification date is
 * available". That was the right call: a <lastmod> set to the build date says
 * "all 15.000 pages changed today" after every deploy, and a crawler that
 * learns a sitemap always claims that stops trusting the field at all. A wrong
 * lastmod is worse than none.
 *
 * This module supplies a date that is actually true. A generated page's content
 * comes entirely from its data module, so the page really did last change when
 * that module last changed, which git knows exactly. Granularity is per page
 * FAMILY, not per page: every location page shares locationSeoData.ts's date.
 * That is honest (they genuinely all regenerate together) and is the finest
 * granularity the data supports. Blog posts are the exception and carry their
 * own editorial `updatedDate`, which generate-sitemap.ts uses directly.
 *
 * If git history isn't available, a shallow clone or a build outside a repo,
 * every lookup returns undefined and the sitemaps fall back to emitting no
 * <lastmod> at all, exactly as before. The feature degrades to the old
 * behaviour instead of degrading to a lie.
 */

import { execFileSync } from 'child_process';

function git(args: string[]): string | undefined {
  try {
    return execFileSync('git', args, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return undefined;
  }
}

let usable: boolean | undefined;

/**
 * Cloudflare Pages and other CI builders may clone shallowly, in which case
 * every file appears to have been last changed at the single commit that was
 * fetched, i.e. the build date, the exact lie this module exists to avoid.
 */
function isGitUsable(): boolean {
  if (usable !== undefined) return usable;
  usable = git(['rev-parse', '--is-shallow-repository']) === 'false';
  if (!usable) {
    console.warn('  Historico git indisponivel ou shallow: sitemaps sem <lastmod>.');
  }
  return usable;
}

const cache = new Map<string, string | undefined>();

/**
 * Newest commit date across the given repo-relative paths, as YYYY-MM-DD.
 * Returns undefined when git can't answer, so callers omit <lastmod>.
 */
export function getContentDate(files: string[]): string | undefined {
  if (!isGitUsable()) return undefined;

  const key = files.join('|');
  if (cache.has(key)) return cache.get(key);

  let newest = 0;
  for (const file of files) {
    // %ct is a unix timestamp: comparable as a number, unlike %cI, whose
    // timezone offsets make lexicographic comparison silently wrong.
    const out = git(['log', '-1', '--format=%ct', '--', file]);
    const ts = out ? Number(out) : NaN;
    if (Number.isFinite(ts) && ts > newest) newest = ts;
  }

  const date = newest > 0 ? new Date(newest * 1000).toISOString().slice(0, 10) : undefined;
  cache.set(key, date);
  return date;
}
