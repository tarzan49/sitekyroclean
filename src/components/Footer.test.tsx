import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Footer from './Footer';

describe('rodapé', () => {
  afterEach(() => vi.useRealTimers());

  // Dizia "© 2025" escrito à mão até 2026-09-30; o rodapé inglês já lia o ano.
  it('mostra o ano corrente, não um ano escrito à mão', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2031-05-01T12:00:00Z'));
    const { container } = render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(container.textContent).toContain('© 2031 Kyro Clean Solutions');
  });
});
