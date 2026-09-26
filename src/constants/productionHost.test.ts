import { describe, expect, it } from 'vitest';
import { isProductionHost } from './tracking';

// Um host que não conta como produção faz o `submissionService` simular o
// envio: a pessoa vê a página de obrigado e o pedido não chega a lado nenhum.
describe('isProductionHost', () => {
  it('aceita o domínio real e os seus subdomínios', () => {
    expect(isProductionHost('cleansolutions.com.pt')).toBe(true);
    expect(isProductionHost('www.cleansolutions.com.pt')).toBe(true);
    expect(isProductionHost('admin.cleansolutions.com.pt')).toBe(true);
  });

  it('recusa pré-visualizações, desenvolvimento e domínios parecidos', () => {
    expect(isProductionHost('sitekyroclean.pages.dev')).toBe(false);
    expect(isProductionHost('abc123.sitekyroclean.pages.dev')).toBe(false);
    expect(isProductionHost('localhost')).toBe(false);
    expect(isProductionHost('127.0.0.1')).toBe(false);
    expect(isProductionHost('cleansolutions.com.pt.evil.example')).toBe(false);
    expect(isProductionHost('notcleansolutions.com.pt')).toBe(false);
  });
});
