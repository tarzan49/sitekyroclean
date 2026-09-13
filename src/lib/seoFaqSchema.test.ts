import { afterEach, expect, it } from 'vitest';
import { clearPrerenderedFaqSchema } from './seoSchema';

afterEach(() => document.body.replaceChildren());

it('replaces server FAQs without deleting business metadata or the current client FAQs', () => {
  document.body.innerHTML = '<script data-ssr-schema="true" id="old-faq">{"@type":"FAQPage"}</script><script data-ssr-schema="true" id="business">{"@type":"LocalBusiness"}</script><script id="new-faq">{"@type":"FAQPage"}</script><script data-ssr-schema="true" id="invalid">invalid</script>';
  clearPrerenderedFaqSchema();
  expect(document.getElementById('old-faq')).toBeNull();
  for (const id of ['business', 'new-faq', 'invalid']) expect(document.getElementById(id)).not.toBeNull();
  expect(() => clearPrerenderedFaqSchema()).not.toThrow();
});
