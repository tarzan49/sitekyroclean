import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { initialFormData, type MattressItem } from '../QuizTypes';
import QuizMattressAddonUpsell from './QuizMattressAddonUpsell';
import QuizChairsAddonUpsell from './QuizChairsAddonUpsell';
import QuizStepConfigCarpet from './QuizStepConfigCarpet';

afterEach(cleanup);

function MattressHarness() {
  const [items, setItems] = useState<MattressItem[]>([{ sizeId: 'casal', qty: 1, packEnabled: false }]);
  return <QuizMattressAddonUpsell formData={initialFormData} updateFormData={() => {}}
    mattressItems={items} setMattressItems={setItems} onContinue={() => {}} onBack={() => {}} />;
}

describe('care upsells', () => {
  it('shows the real treatment surcharge before selection and allows removing it', () => {
    render(<MattressHarness />);
    const treatment = screen.getByRole('button', { name: /Desbacterização e Anti Ácaros/ });
    expect(treatment.textContent).toContain('+20€/un.');
    expect(treatment.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: 'Continuar sem extras' })).toBeTruthy();
    fireEvent.click(treatment);
    expect(treatment.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Continuar com tratamento' })).toBeTruthy();
    fireEvent.click(treatment);
    expect(treatment.getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps both chair protection tiers and the 5 euro unit treatment', () => {
    const update = vi.fn();
    render(<QuizChairsAddonUpsell formData={{ ...initialFormData, serviceType: 'cleaning', chairQuantity: '4' }} updateFormData={update} onBack={() => {}} onContinue={() => {}} />);
    expect(screen.getByRole('button', { name: /Premium/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Essencial/ })).toBeTruthy();
    const treatment = screen.getByRole('button', { name: /Desbacterização e Anti Ácaros/ });
    expect(treatment.textContent).toContain('+5€/un.');
    fireEvent.click(treatment);
    expect(update).toHaveBeenCalledWith({ chairAntiAcaros: true });
  });

  it('explains carpet dimensions and shows area without introducing a price', () => {
    const { container } = render(<QuizStepConfigCarpet carpetItems={[{ id: 'rug', largura: '1.5', comprimento: '2' }]} setCarpetItems={() => {}} />);
    expect(screen.getByLabelText('Largura do tapete 1, em metros')).toBeTruthy();
    expect(screen.getByLabelText('Comprimento do tapete 1, em metros')).toBeTruthy();
    expect(screen.getByText('3 m²')).toBeTruthy();
    expect(container.textContent).not.toContain('€');
  });
});
