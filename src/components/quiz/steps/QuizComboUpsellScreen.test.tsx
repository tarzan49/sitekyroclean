import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import QuizComboUpsellScreen from './QuizComboUpsellScreen';
import type { UpsellItemConfig } from '../QuizTypes';

afterEach(cleanup);

function Harness() {
  const [items, setItems] = useState<UpsellItemConfig[]>([]);
  const [contact, setContact] = useState(false);
  return <>
    <output data-testid="items">{JSON.stringify(items)}</output>
    {contact ? <button onClick={() => setContact(false)}>Voltar aos extras</button> :
      <QuizComboUpsellScreen upsellItems={items} setUpsellItems={setItems}
        onContinue={() => setContact(true)} onBack={() => {}}
        totalPrice={100} packDiscountActive={false} packDiscountedPrice={100} />}
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
