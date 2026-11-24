// O widget das páginas segue a lógica do orçamento (dono, 25 Nov 2026): localidade, material, tamanho, opção; nada
// vem escolhido e o preço é o do cesto.
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StepPricePicker from './StepPricePicker';
import { optionPrice, newItem } from './quiz/VisitBasket';

const euros = (n: number) => new RegExp(`${n}\\s?€`);

describe('StepPricePicker', () => {
  it('sofá: pede localidade, material, lugares e opção, sem nada escolhido; o preço é o do cesto', async () => {
    const onCity = vi.fn();
    const { rerender } = render(<StepPricePicker kind="sofa" city="" onCity={onCity} source="t" />);
    expect(screen.getByText('Onde é o serviço?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Lisboa' }));
    expect(onCity).toHaveBeenCalledWith('Lisboa');
    rerender(<StepPricePicker kind="sofa" city="Lisboa" onCity={onCity} source="t" />);
    expect(screen.getByText('O seu sofá é de que material?')).toBeTruthy();
    expect(document.querySelector('a[href*="wa.me"]')).toBeNull(); // só há botão quando há preço
    fireEvent.click(screen.getByText('Tecido'));
    expect(screen.getByText('Quantos lugares?')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Juntar um sofá de 3 lugares'));
    for (const name of ['Blindado', 'Protegido', 'Renovado']) expect(screen.getByText(name).closest('button')!.getAttribute('aria-pressed')).toBe('false');
    const want = optionPrice('Lisboa', [], [newItem('sofa', { size: '3-lugares', qty: 1, pack: 'premium' })]);
    expect(await screen.findByText(euros(want.shown!))).toBeTruthy();
    fireEvent.click(screen.getByText('Blindado'));
    const a = await screen.findByText(/Pedir este orçamento/);
    const href = decodeURIComponent(a.closest('a')!.getAttribute('href')!);
    expect(href).toContain('do pack Blindado (limpeza + impermeabilização Premium');
    expect(href).toContain(`em Lisboa, por ${want.shown}`);
  });
  it('pele: um só preço, sem impermeabilização', async () => {
    render(<StepPricePicker kind="sofa" city="Porto" source="t" />);
    fireEvent.click(screen.getByText('Pele / couro'));
    fireEvent.click(screen.getByLabelText('Juntar um sofá de 4 lugares'));
    expect(screen.queryByText('Blindado')).toBeNull();
    const want = optionPrice('Porto', [], [newItem('sofa', { size: '4-lugares', qty: 1, pack: 'none', leather: true })]);
    expect((await screen.findAllByText(euros(want.shown!))).length).toBeGreaterThan(0);
  });
  it('cadeiras: nenhuma quantidade nem opção escolhida à partida', () => {
    render(<StepPricePicker kind="chairs" city="Porto" source="t" />);
    expect(screen.getByText('Quantas cadeiras?')).toBeTruthy();
    expect(screen.queryByText('Blindado')).toBeNull();
  });
});
