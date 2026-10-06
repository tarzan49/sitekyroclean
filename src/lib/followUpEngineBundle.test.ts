// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bundleFollowUpEngine, FOLLOW_UP_ENGINE_OUT } from '../../scripts/build-follow-up-engine.mjs';

describe('follow-up engine bundle (e-mail and bot)', () => {
  it('matches the panel engine it was built from (run `npm run build:follow-up-engine` if this fails)', async () => {
    expect(readFileSync(FOLLOW_UP_ENGINE_OUT, 'utf8')).toBe(await bundleFollowUpEngine());
  }, 30_000);
});
