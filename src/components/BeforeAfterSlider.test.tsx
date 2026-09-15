import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BeforeAfterSlider from './BeforeAfterSlider';

// requestAnimationFrame é pausado pelo navegador em abas escondidas, por isso
// nos testes trocamos por um setTimeout de 16ms preso aos fake timers — assim
// o varrimento pode ser avançado passo a passo.
function driveFrames() {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number);
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
}

function advance(ms: number) {
  act(() => { vi.advanceTimersByTime(ms); });
}

function clipOf(container: HTMLElement) {
  return (container.querySelector('[style*="clip-path"]') as HTMLElement).style.clipPath;
}

// "inset(0 X% 0 0)" recorta o ANTES a partir da direita: X=0 mostra só o antes,
// X=100 mostra só o depois.
function hiddenPct(container: HTMLElement) {
  const raw = clipOf(container);
  const match = /([\d.e+-]+)%/i.exec(raw);
  if (!match) throw new Error(`clip-path inesperado: ${raw}`);
  return Math.round(Number(match[1]) * 100) / 100;
}

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('BeforeAfterSlider com sweepMs', () => {
  it('começa em Antes e leva o intervalo inteiro a chegar a Depois', () => {
    vi.useFakeTimers();
    driveFrames();
    const { container } = render(<BeforeAfterSlider beforeImage="/a.webp" afterImage="/b.webp" sweepMs={4000} noFrame />);

    expect(hiddenPct(container)).toBe(0);

    // Arranca devagar: passado meio segundo dos 4 s mal saiu de "Antes".
    advance(400);
    const inicio = hiddenPct(container);
    expect(inicio).toBeGreaterThan(0);
    expect(inicio).toBeLessThan(10);

    // A meio do tempo está a meio do percurso — sem pausas nas pontas.
    advance(1600);
    expect(hiddenPct(container)).toBeGreaterThan(40);
    expect(hiddenPct(container)).toBeLessThan(60);

    advance(1900);
    expect(hiddenPct(container)).toBeGreaterThan(95);

    advance(200);
    expect(hiddenPct(container)).toBe(100);
  });

  it('sem sweepMs mantém a dica antiga a partir do meio', () => {
    vi.useFakeTimers();
    driveFrames();
    const { container } = render(<BeforeAfterSlider beforeImage="/a.webp" afterImage="/b.webp" noFrame />);
    expect(hiddenPct(container)).toBe(50);
    advance(3000);
    expect(hiddenPct(container)).toBe(50);
  });
});

describe('HeroBeforeAfterPool', () => {
  it('troca de par a cada 4 segundos sem ninguém tocar', async () => {
    const { default: HeroBeforeAfterPool } = await import('./HeroBeforeAfterPool');
    // jsdom não implementa Element.scrollTo (a galeria centra a miniatura ativa).
    Element.prototype.scrollTo = () => {};
    vi.useFakeTimers();
    driveFrames();
    const { container } = render(<HeroBeforeAfterPool category="sofa" />);

    const contador = () => container.querySelector('.text-gold')!.textContent;
    expect(contador()).toBe('1 / 11');

    advance(4000);
    expect(contador()).toBe('2 / 11');

    advance(4000);
    expect(contador()).toBe('3 / 11');
  });
});
