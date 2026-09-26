import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import QuizComboUpsellScreen from './QuizComboUpsellScreen';
import type { UpsellItemConfig } from '../QuizTypes';
import { CHAIR_PRICE_LABEL } from '@/data/enginePrices';

afterEach(cleanup);

function Harness({ primaryService = 'other', primaryTablePrice = 0 } = {}) {
  const [items, setItems] = useState<UpsellItemConfig[]>([]);
  const [contact, setContact] = useState(false);
  return <>
    <output data-testid="items">{JSON.stringify(items)}</output>
    {contact ? <button onClick={() => setContact(false)}>Voltar aos extras</button> :
      <QuizComboUpsellScreen primaryTablePrice={primaryTablePrice} primaryService={primaryService} upsellItems={items} setUpsellItems={setItems}
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
  it('never mentions a 10%-off-the-order discount', () => {
    render(<Harness primaryService="sofa" />);
    expect(screen.getByText('APROVEITE A MESMA VISITA')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Quer limpar mais alguma coisa?' })).toBeTruthy();
    expect(screen.queryByText(/10%/)).toBeNull();
  });

  it('preserves all categories and individual carpet dimensions when returning from contact', () => {
    render(<Harness />);
    // Abrir o colchão já acrescenta um Casal.
    click(/^Colchão/); confirm();
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

  it('keeps quote-only extras at zero and charges table price below the minimum', () => {
    render(<Harness />);
    addCarpet();
    expect(screen.getByRole('button', { name: /Tapete.*sob orçamento/ })).toBeTruthy();
    expect(savedItems().find(item => item.id === 'carpet')?.price).toBe(0);
    click(/^Colchão/); confirm();
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

it('preserves Premium waterproofing chairs imported from the widget', () => {
  let latest: UpsellItemConfig[] = [];
  render(<QuizComboUpsellScreen primaryService="sofa" upsellItems={[{ id: 'chairs', chairQty: '5', qty: 5, price: 95, label: '5 cadeiras (Impermeabilização Premium)', waterproof: true, waterproofingTier: 'premium' }]} setUpsellItems={items => { latest = items; }} onContinue={() => {}} onBack={() => {}} />);
  expect(latest[0].price).toBe(125);
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
  render(<Harness primaryService="sofa" />);
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

// 2026-09-24 (pedido explícito do dono): o preço de pack não se pode praticar
// abaixo do mínimo de subtotal — senão um pedido pequeno neste ecrã ficava
// com vantagem sobre a mesma pessoa a pedir um orçamento normal.
it('charges table price for an extra when the order stays under the pack minimum', () => {
  render(<Harness primaryService="sofa" primaryTablePrice={0} />);
  click(/^Colchão/); confirm();
  expect(savedItems().find(i => i.mattressSize === 'casal')?.price).toBe(69);
});

it('unlocks the pack price once the primary service already reaches the minimum', () => {
  render(<Harness primaryService="sofa" primaryTablePrice={100} />);
  click(/^Colchão/); confirm();
  expect(savedItems().find(i => i.mattressSize === 'casal')?.price).toBe(55);
});

// Bug visto em produção (2026-09-26): com um pedido principal de 69€ (sofá de
// 2 lugares), o cartão do colchão mostrava "69€ 69€/un." debaixo de "Preço
// reduzido em cada artigo". A elegibilidade era calculada sem o próprio
// colchão, que já leva o pedido para cima do mínimo (69 + 69 = 138€).
describe('summary previews price the reference item as if it were added', () => {
  const card = (label: RegExp) => screen.getByRole('button', { name: label });

  it('shows the pack price for a casal mattress added to a 69€ sofa', () => {
    render(<Harness primaryService="sofa" primaryTablePrice={69} />);
    const mattress = card(/^Colchão/);
    expect(mattress.textContent).toContain('55€/un.');
    expect(mattress.querySelector('s')?.textContent).toBe('69€');
  });

  it('shows the pack price for a 2-seat sofa added to a 69€ mattress', () => {
    render(<Harness primaryService="mattress" primaryTablePrice={69} />);
    const sofa = card(/^Sofá/);
    expect(sofa.textContent).toContain('55€/un.');
    expect(sofa.querySelector('s')?.textContent).toBe('69€');
  });

  it('never strikes a price through to repeat the same price', () => {
    render(<Harness primaryService="carpet" primaryTablePrice={0} />);
    const mattress = card(/^Colchão/);
    expect(mattress.textContent).toContain('69€/un.');
    expect(mattress.querySelector('s')).toBeNull();
    const sofa = card(/^Sofá/);
    expect(sofa.textContent).toContain('69€/un.');
    expect(sofa.querySelector('s')).toBeNull();
    // Abaixo do mínimo nem as cadeiras nem o tapete prometem a regalia.
    expect(card(/^Cadeiras/).textContent).not.toContain('pague');
    // Por cadeira, nunca "Desde" (pedido do dono, 26/09/2026).
    expect(card(/^Cadeiras/).textContent).toContain(CHAIR_PRICE_LABEL);
    expect(card(/^Cadeiras/).textContent).not.toContain('Desde');
  });

  it('keeps the rug offer on the card when the pack applies', () => {
    render(<Harness primaryService="sofa" primaryTablePrice={100} />);
    expect(card(/^Tapete/).textContent).toContain('Limpe 5 m², pague 4');
    expect(card(/^Cadeiras/).textContent).toContain('Limpe 4, pague 3');
  });
});
