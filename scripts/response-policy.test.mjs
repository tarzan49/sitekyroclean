import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasOldResponsePromise } from './response-policy.mjs';
for (const value of ['Resposta em menos de 30 minutos', '<strong>30min</strong><span>Resposta ao pedido</span>', 'Respondemos em menos de\n<strong>30</strong> minutos', 'Reply within thirty minutes', 'Resposta em menos de 30&nbsp;minutos', 'Resposta em menos de 30min']) {
  test(`rejeita: ${value}`, () => assert.equal(hasOldResponsePromise(value), true));
}
for (const value of ['Resposta em menos de 10 minutos', 'Cada cadeira demora 15 a 30 minutos.', 'Calculador online em 30 segundos.', 'Responderemos no prazo máximo de 30 dias.']) {
  test(`preserva: ${value}`, () => assert.equal(hasOldResponsePromise(value), false));
}
