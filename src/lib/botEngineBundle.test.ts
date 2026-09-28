// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bundleBotEngine, BOT_ENGINE_OUT } from '../../scripts/build-bot-engine.mjs';

describe('bot-api pricing bundle', () => {
  it('matches the site engine it was built from (run `npm run build:bot-engine` if this fails)', async () => {
    expect(readFileSync(BOT_ENGINE_OUT, 'utf8')).toBe(await bundleBotEngine());
  }, 30_000);
});
