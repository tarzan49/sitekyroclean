import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

// A chave é lida quando o módulo carrega, por isso define-se antes do import.
Deno.env.set('RECAPTCHA_SECRET_KEY', 'test-secret');
const { verifyRecaptcha } = await import('./recaptcha.ts');

const realFetch = globalThis.fetch;

async function withGoogle(reply: Response | Error, run: () => Promise<void>) {
  globalThis.fetch = (() => reply instanceof Error ? Promise.reject(reply) : Promise.resolve(reply)) as typeof fetch;
  try {
    await run();
  } finally {
    globalThis.fetch = realFetch;
  }
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

// A regra: um problema nosso (chave errada, Google em baixo) nunca recusa um
// pedido; só um token que a Google validou como robô, ou de outra ação.
Deno.test('sem token: deixa passar', async () => {
  assertEquals((await verifyRecaptcha(undefined, 'submit_quote')).valid, true);
});

Deno.test('chave secreta que não corresponde: deixa passar', async () => {
  await withGoogle(json({ success: false, 'error-codes': ['invalid-input-secret'] }), async () => {
    assertEquals((await verifyRecaptcha('token', 'submit_quote')).valid, true);
  });
});

Deno.test('API da Google com erro HTTP: deixa passar', async () => {
  await withGoogle(json({}, 500), async () => {
    assertEquals((await verifyRecaptcha('token', 'submit_quote')).valid, true);
  });
});

Deno.test('rede em falha: deixa passar', async () => {
  await withGoogle(new Error('network down'), async () => {
    assertEquals((await verifyRecaptcha('token', 'submit_quote')).valid, true);
  });
});

Deno.test('pessoa real com pontuação modesta (0.4): deixa passar', async () => {
  await withGoogle(json({ success: true, score: 0.4, action: 'submit_quote' }), async () => {
    assertEquals((await verifyRecaptcha('token', 'submit_quote')).valid, true);
  });
});

Deno.test('token validado com pontuação de robô: recusa', async () => {
  await withGoogle(json({ success: true, score: 0.1, action: 'submit_quote' }), async () => {
    assertEquals((await verifyRecaptcha('token', 'submit_quote')).valid, false);
  });
});

Deno.test('token validado de outra ação: recusa', async () => {
  await withGoogle(json({ success: true, score: 0.9, action: 'login' }), async () => {
    assertEquals((await verifyRecaptcha('token', 'submit_quote')).valid, false);
  });
});
