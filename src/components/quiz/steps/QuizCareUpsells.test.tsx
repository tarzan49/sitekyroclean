import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { initialFormData, type QuizFormData, type MattressItem } from '../QuizTypes';
import QuizMattressAddonUpsell from './QuizMattressAddonUpsell';
import QuizSofaAddonUpsell from './QuizSofaAddonUpsell';
import QuizChairsAddonUpsell from './QuizChairsAddonUpsell';
import QuizStepConfigCarpet from './QuizStepConfigCarpet';

afterEach(cleanup);

function MattressHarness() {
  const [items, setItems] = useState<MattressItem[]>([{ sizeId: 'casal', qty: 1, packEnabled: false }]);
  return <QuizMattressAddonUpsell formData={initialFormData} updateFormData={() => {}}
    mattressItems={items} setMattressItems={setItems} onContinue={() => {}} onBack={() => {}} />;
}

describe('care upsells', () => {
  it('narrows the mattress treatment price to only the sizes actually kept, not the whole order', () => {
    function MultiSizeHarness() {
      const [items, setItems] = useState<MattressItem[]>([
        { sizeId: 'solteiro', qty: 1, packEnabled: false },
        { sizeId: 'king', qty: 1, packEnabled: false },
      ]);
      return <QuizMattressAddonUpsell formData={initialFormData} updateFormData={() => {}}
        mattressItems={items} setMattressItems={setItems} onContinue={() => {}} onBack={() => {}} />;
    }
    render(<MultiSizeHarness />);
    const treatment = screen.getByRole('button', { name: /Desbacterização e Anti Ácaros/ });
    // Antes de escolher: gama de todo o pedido (solteiro +15€, king +25€).
    expect(treatment.textContent).toContain('Desde +15€/un.');
    fireEvent.click(treatment);
    // Ligado: por omissão aplica a ambos os tamanhos, gama mantém-se.
    expect(treatment.textContent).toContain('Desde +15€/un.');
    // Retira o King/Queen do tratamento — só o solteiro fica selecionado.
    fireEvent.click(screen.getByRole('button', { name: 'Retirar tratamento: King / Queen' }));
    expect(treatment.textContent).toContain('+15€/un.');
    expect(treatment.textContent).not.toContain('Desde');
  });

  it('shows the real treatment surcharge before selection and allows removing it', () => {
    render(<MattressHarness />);
    const treatment = screen.getByRole('button', { name: /Desbacterização e Anti Ácaros/ });
    expect(treatment.textContent).toContain('+20€/un.');
    expect(treatment.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: 'Continuar sem extras' })).toBeTruthy();
    fireEvent.click(treatment);
    expect(treatment.getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByText('Casal')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Continuar com tratamento' })).toBeTruthy();
    fireEvent.click(treatment);
    expect(treatment.getAttribute('aria-pressed')).toBe('false');
  });

  it('allows protecting only one of several sofas and preserves that choice across tiers', () => {
    function SofaHarness() {
      const [form, setForm] = useState<QuizFormData>({ ...initialFormData, serviceType: 'cleaning' });
      const [items, setItems] = useState([{ sizeId: '3-lugares', qty: 2, packEnabled: false }]);
      return <><QuizSofaAddonUpsell formData={form} updateFormData={u => setForm(prev => ({ ...prev, ...u }))}
        sofaItems={items} setSofaItems={setItems} onBack={() => {}} onContinue={() => {}} />
        <output aria-label="Protected quantity">{items.filter(i => i.packEnabled).reduce((sum, i) => sum + i.qty, 0)}</output></>;
    }
    render(<SofaHarness />);
    const premium = screen.getByRole('button', { name: /Premium/ });
    fireEvent.click(premium);
    expect(premium.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText('Protected quantity').textContent).toBe('2');
    expect(screen.getByText('2 de 2')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retirar tratamento: 3 Lugares' }));
    expect(screen.getByText('1 de 2')).toBeTruthy();
    expect(screen.getByText('+90€')).toBeTruthy();
    expect(screen.getByText('+120€')).toBeTruthy();
    expect(screen.getByLabelText('Mais 30€ que o Essencial').textContent).toContain('+30€');
    fireEvent.click(screen.getByRole('button', { name: /^Essencial/ }));
    expect(screen.getByText('1 de 2')).toBeTruthy();
    fireEvent.click(premium);
    fireEvent.click(premium);
    expect(premium.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByLabelText('Protected quantity').textContent).toBe('0');
  });

  it('shows the actual cleaning extra before selection for a waterproofing order', () => {
    function CleaningHarness() {
      const [items, setItems] = useState([{ sizeId: '3-lugares', qty: 1, packEnabled: false }]);
      return <QuizSofaAddonUpsell formData={{ ...initialFormData, serviceType: 'waterproofing', waterproofingTier: 'premium' }}
        updateFormData={() => {}} sofaItems={items} setSofaItems={setItems} onBack={() => {}} onContinue={() => {}} />;
    }
    render(<CleaningHarness />);
    const cleaning = screen.getByRole('button', { name: /Higienização Profunda/ });
    expect(cleaning.textContent).toContain('+60€');
    expect(screen.getByText('Ajuda a reduzir odores')).toBeTruthy();
    fireEvent.click(cleaning);
    expect(cleaning.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Continuar com higienização' })).toBeTruthy();
    expect(screen.queryByText('Em quantos pretende aplicar o tratamento?')).toBeNull();
    fireEvent.click(cleaning);
    expect(cleaning.getAttribute('aria-pressed')).toBe('false');
  });

  it('includes antibacterial care in both four-chair protection bundles', () => {
    const update = vi.fn();
    render(<QuizChairsAddonUpsell formData={{ ...initialFormData, serviceType: 'cleaning', chairQuantity: '4' }} updateFormData={update} onBack={() => {}} onContinue={() => {}} />);
    const premium = screen.getByRole('button', { name: /Premium/ });
    expect(premium.textContent).toContain('+90€');
    expect(screen.getByRole('button', { name: /^Essencial/ }).textContent).toContain('+70€');
    expect(screen.queryByRole('button', { name: /Desbacterização/ })).toBeNull();
    fireEvent.click(premium);
    expect(update).toHaveBeenCalledWith({ chairWaterproofing: true, chairWaterproofQty: 4, waterproofingTier: 'premium', chairAntiAcaros: false });
  });

  it('explains carpet dimensions and shows area without introducing a price', () => {
    const { container } = render(<QuizStepConfigCarpet carpetItems={[{ id: 'rug', largura: '1.5', comprimento: '2' }]} setCarpetItems={() => {}} />);
    expect(screen.getByLabelText('Largura do tapete 1, em metros')).toBeTruthy();
    expect(screen.getByLabelText('Comprimento do tapete 1, em metros')).toBeTruthy();
    expect(screen.getByText('3 m²')).toBeTruthy();
    expect(container.textContent).not.toContain('€');
  });
});
