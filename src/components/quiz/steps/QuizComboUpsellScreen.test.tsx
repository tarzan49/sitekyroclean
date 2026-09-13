import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import QuizComboUpsellScreen from './QuizComboUpsellScreen';
import type { UpsellItemConfig } from '../QuizTypes';

afterEach(cleanup);

function Harness({ primaryService = 'other', offerPreview = false } = {}) {
  const [items, setItems] = useState<UpsellItemConfig[]>([]);
  const [contact, setContact] = useState(false);
  return <>
    <output data-testid="items">{JSON.stringify(items)}</output>
    {contact ? <button onClick={() => setContact(false)}>Voltar aos extras</button> :
      <QuizComboUpsellScreen offerPreview={offerPreview} primaryService={primaryService} upsellItems={items} setUpsellItems={setItems}
        onContinue={() => setContact(true)} onBack={() => {}} />}
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

  // 2026-09-10 (pedido explícito do dono): sem desconto de 10% sobre o
  // pedido todo — cada artigo extra já vem com o seu preço reduzido, sem
  // nenhuma condição de elegibilidade a cumprir.
  it('never mentions a 10%-off-the-order discount, in offerPreview mode or not', () => {
    const { rerender } = render(<Harness primaryService="sofa" offerPreview />);
    expect(screen.getByText('APROVEITE A MESMA VISITA')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Mais limpeza. Menos a pagar.' })).toBeTruthy();
    expect(screen.queryByText(/10%/)).toBeNull();
    rerender(<Harness primaryService="sofa" offerPreview={false} />);
    expect(screen.getByRole('heading', { name: 'Adicione mais um serviço' })).toBeTruthy();
    expect(screen.queryByText(/10%/)).toBeNull();
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

  it('keeps category selection free of prices while preserving quote-only extras', () => {
    render(<Harness />);
    for (const label of [/^Colchão/, /^Sofá/, /^Cadeiras/, /^Tapete/]) {
      expect(screen.getByRole('button', { name: label }).textContent).not.toContain('€');
    }
    addCarpet();
    expect(screen.getByRole('button', { name: /Tapete.*sob orçamento/ })).toBeTruthy();
    expect(savedItems().find(item => item.id === 'carpet')?.price).toBe(0);
    click(/^Colchão/); increment(1); confirm();
    expect(savedItems().find(item => item.mattressSize === 'casal')?.price).toBe(69);
    expect(screen.queryByText('Subtotal do extra')).toBeNull();
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
  render(<QuizComboUpsellScreen primaryService="sofa" upsellItems={[treatment]} setUpsellItems={items => { latest = items; }} onContinue={() => {}} onBack={() => {}} />);
  expect(latest).toContainEqual(treatment);
});

it('preserves Premium waterproofing chairs imported from the widget', () => {
  let latest: UpsellItemConfig[] = [];
  render(<QuizComboUpsellScreen primaryService="sofa" upsellItems={[{ id: 'chairs', chairQty: '5', qty: 5, price: 95, label: '5 cadeiras (Impermeabilização Premium)', waterproof: true, waterproofingTier: 'premium' }]} setUpsellItems={items => { latest = items; }} onContinue={() => {}} onBack={() => {}} />);
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


it('applies the published mattress, chair and carpet offers to the saved request', () => {
  render(<Harness primaryService="sofa" offerPreview />);
  click(/^Colchão/); increment(0); increment(2); confirm();
  expect(savedItems().filter(i => i.mattressSize).map(i => i.price)).toEqual([45, 55, 65]);
  click(/^Cadeiras/); increment(); confirm();
  expect(savedItems().find(i => i.id === 'chairs')?.price).toBe(60);
  click(/^Tapete/);
  const fields = screen.getAllByRole('spinbutton');
  fireEvent.change(fields[0], { target: { value: '2' } });
  fireEvent.change(fields[1], { target: { value: '2.5' } });
  confirm();
  expect(savedItems().find(i => i.id === 'carpet')?.label).toContain('5 m², paga 4 m²');
  expect(savedItems().find(i => i.id === 'carpet')?.price).toBe(0);
  roundTrip();
  expect(savedItems().filter(i => i.mattressSize).map(i => i.price)).toEqual([45, 55, 65]);
});
