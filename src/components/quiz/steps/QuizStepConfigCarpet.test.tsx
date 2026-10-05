import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { CarpetItem } from '../QuizTypes';
import QuizStepConfigCarpet from './QuizStepConfigCarpet';

afterEach(cleanup);

// Recolha dos tapetes no questionário (dono, 2026-10-05): escolha entre a
// lavagem em casa e a recolha, com o acréscimo pela área somada.
function Harness({ items, kind = 'tapete' }: { items: CarpetItem[]; kind?: 'tapete' | 'alcatifa' }) {
  const [carpetItems, setCarpetItems] = useState(items);
  const [rugPickup, setRugPickup] = useState(false);
  return <QuizStepConfigCarpet carpetKind={kind} carpetItems={carpetItems} setCarpetItems={setCarpetItems} rugPickup={rugPickup} onRugPickupChange={setRugPickup} />;
}

describe('recolha no passo dos tapetes', () => {
  it('mostra o acréscimo da área total e deixa escolher a recolha', () => {
    render(<Harness items={[{ id: 'a', largura: '2', comprimento: '3' }, { id: 'b', largura: '1', comprimento: '2' }]} />);
    const pickup = screen.getByRole('radio', { name: /Recolha e entrega.*\+15€/ });
    expect(screen.getByRole('radio', { name: /Em sua casa/ }).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(pickup);
    expect(pickup.getAttribute('aria-checked')).toBe('true');
  });

  it('abaixo de 3 m² não oferece recolha', () => {
    render(<Harness items={[{ id: 'a', largura: '1', comprimento: '2' }]} />);
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.getByText(/a lavagem é feita em sua casa/)).toBeTruthy();
  });

  it('a alcatifa nunca oferece recolha', () => {
    render(<Harness kind="alcatifa" items={[{ id: 'a', largura: '4', comprimento: '5' }]} />);
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.queryByText(/Recolha/)).toBeNull();
  });
});
