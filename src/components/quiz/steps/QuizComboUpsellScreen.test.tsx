import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import QuizComboUpsellScreen from './QuizComboUpsellScreen';
import type { UpsellItemConfig } from '../QuizTypes';

afterEach(cleanup);

function Harness({ primaryService = 'other', packDiscountActive = false } = {}) {
  const [items, setItems] = useState<UpsellItemConfig[]>([]);
  const [contact, setContact] = useState(false);
  return <>
    <output data-testid="items">{JSON.stringify(items)}</output>
    {contact ? <button onClick={() => setContact(false)}>Voltar aos extras</button> :
      <QuizComboUpsellScreen primaryService={primaryService} upsellItems={items} setUpsellItems={setItems}
        onContinue={() => setContact(true)} onBack={() => {}}
        totalPrice={207} packDiscountActive={packDiscountActive} packDiscountedPrice={packDiscountActive ? 187 : 207} />}
  </>;
}
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const savedItems = (): UpsellItemConfig[] => JSON.parse(screen.getByTestId('items').textContent!);
const increment = (index = 0) => fireEvent.click(screen.getAllByRole('button', { name: '+' })[index]);
const confirm = () => click('Confirmar');
const roundTrip = () => { click('Finalizar Orçamento'); click('Voltar aos extras'); };

function addCarpet() {
  click(/^Tapete/);
  const fields = screen.getAllByRole('spinbutton');
  fireEvent.change(fields[0], { target: { value: '2' } });
  fireEvent.change(fields[1], { target: { value: '3' } });
  confirm();
}

describe('final upsell navigation', () => {
  it.each([
    ['sofa', /^Sofá/], ['mattress', /^Colchão/], ['chairs', /^Cadeiras/], ['carpet', /^Tapete/],
  ])('excludes the primary %s category from suggestions', (primaryService, label) => {
    render(<Harness primaryService={primaryService} />);
    expect(screen.queryByRole('button', { name: label })).toBeNull();
    expect(screen.getByRole('button', { name: 'Finalizar Orçamento' })).toBeTruthy();
  });

  it('acknowledges an existing discount and follows changes to eligibility', () => {
    const { rerender } = render(<Harness primaryService="sofa" packDiscountActive />);
    expect(screen.getByText('APROVEITE A MESMA VISITA')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Quer limpar mais alguma coisa?' })).toBeTruthy();
    expect(screen.getByText(/Já tem 10% de desconto/)).toBeTruthy();
    expect(screen.queryByText(/Válido com um artigo/)).toBeNull();
    roundTrip();
    expect(savedItems()).toEqual([]);
    expect(screen.getByText(/Já tem 10% de desconto/)).toBeTruthy();
    rerender(<Harness primaryService="sofa" packDiscountActive={false} />);
    expect(screen.getByRole('heading', { name: 'Poupe 10% nos serviços' })).toBeTruthy();
    expect(screen.getByText(/Válido com um artigo/)).toBeTruthy();
  });

  it('preserves all categories and individual carpet dimensions when returning from contact', () => {
    render(<Harness />);
    click(/^Colchão/); increment(1); confirm();
    click(/^Sofá/); increment(0); increment(3); confirm();
    click(/^Cadeiras/); increment(); confirm();
    addCarpet();
    const before = savedItems();
    expect(before).toHaveLength(5);
    roundTrip();
    expect(savedItems()).toEqual(before);
    expect(screen.getByRole('button', { name: /Colchão.*1x Casal/ })).toBeTruthy();
    click(/^Tapete/);
    expect(screen.getAllByRole('spinbutton').map(input => (input as HTMLInputElement).value)).toEqual(['2', '3']);
    confirm();
    click(/^Colchão/);
    fireEvent.click(screen.getAllByRole('button', { name: '−' })[1]);
    confirm();
    expect(savedItems().some(item => item.mattressSize)).toBe(false);
    roundTrip();
    expect(savedItems().some(item => item.mattressSize)).toBe(false);
  });

  it('shows quote-only and mixed subtotals without treating unpriced extras as free', () => {
    render(<Harness />);
    addCarpet();
    expect(screen.getByText('Subtotal do extra')).toBeTruthy();
    expect(screen.getByText('Sob orçamento', { selector: 'span' })).toBeTruthy();
    expect(screen.queryByText('0€', { exact: true })).toBeNull();
    click(/^Sofá/); increment(3); confirm();
    expect(screen.getByText('Sob orçamento', { selector: 'span' })).toBeTruthy();
    click(/^Colchão/); increment(1); confirm();
    expect(screen.getByText('69€ + Sob orçamento')).toBeTruthy();
  });

  it('still allows continuing without extras', () => {
    render(<Harness />);
    roundTrip();
    expect(savedItems()).toEqual([]);
    expect(screen.queryByText('Subtotal do extra')).toBeNull();
  });
});

it('preserves imported anti-mite treatment instead of silently dropping it', () => {
  const treatment = { id: 'sofa-anti-acaros', qty: 1, price: 25, label: 'Anti Ácaros (sofá)' };
  let latest: UpsellItemConfig[] = [];
  render(<QuizComboUpsellScreen primaryService="sofa" upsellItems={[treatment]} setUpsellItems={items => { latest = items; }} onContinue={() => {}} onBack={() => {}} totalPrice={104} packDiscountActive={false} packDiscountedPrice={104} />);
  expect(latest).toContainEqual(treatment);
});

it('preserves Premium waterproofing chairs imported from the widget', () => {
  let latest: UpsellItemConfig[] = [];
  render(<QuizComboUpsellScreen primaryService="sofa" upsellItems={[{ id: 'chairs', chairQty: '5', qty: 5, price: 95, label: '5 cadeiras (Impermeabilização Premium)', waterproof: true, waterproofingTier: 'premium' }]} setUpsellItems={items => { latest = items; }} onContinue={() => {}} onBack={() => {}} totalPrice={244} packDiscountActive packDiscountedPrice={221} />);
  expect(latest[0].price).toBe(95);
  expect(latest[0].label).toContain('Impermeabilização Premium');
});

it('blocks a partially measured second rug instead of silently omitting it', () => {
  render(<Harness />); addCarpet(); click(/^Tapete/); click('Adicionar outro tapete');
  expect((screen.getByRole('button', { name: 'Confirmar' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getAllByRole('spinbutton')[2], { target: { value: '1' } });
  expect((screen.getByRole('button', { name: 'Confirmar' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getAllByRole('spinbutton')[3], { target: { value: '2' } });
  expect((screen.getByRole('button', { name: 'Confirmar' }) as HTMLButtonElement).disabled).toBe(false);
});
