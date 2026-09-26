import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { initialFormData, type QuizFormData, type MattressItem, type SofaItem } from '../QuizTypes';
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
    expect(screen.getByText('+80€')).toBeTruthy();
    expect(screen.getByText('+110€')).toBeTruthy();
    expect(screen.getByLabelText('Preço original da impermeabilização: 139 euros').tagName).toBe('DEL');
    expect(screen.getByLabelText('Preço original da impermeabilização: 99 euros').tagName).toBe('DEL');
    expect(screen.getByText('Pack: 189€ em vez de 218€')).toBeTruthy();
    expect(screen.getByText('Pack: 159€ em vez de 178€')).toBeTruthy();
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
    expect(cleaning.textContent).toContain('+50€');
    expect(screen.getByLabelText('Preço original da limpeza: 79 euros').textContent).toBe('79€');
    expect(screen.getByText('Pack: 189€ em vez de 218€')).toBeTruthy();
    expect(screen.getByText('Ajuda a reduzir odores')).toBeTruthy();
    fireEvent.click(cleaning);
    expect(cleaning.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Continuar com higienização' })).toBeTruthy();
    expect(screen.queryByText('Em quantos pretende aplicar o tratamento?')).toBeNull();
    fireEvent.click(cleaning);
    expect(cleaning.getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps both chair protection tiers and offers anti-acaros as a separate choice', () => {
    const update = vi.fn();
    render(<QuizChairsAddonUpsell formData={{ ...initialFormData, serviceType: 'cleaning', chairQuantity: '4' }} updateFormData={update} onBack={() => {}} onContinue={() => {}} />);
    const premium = screen.getByRole('button', { name: /Premium/ });
    expect(premium.textContent).toContain('+100€');
    expect(screen.getByRole('button', { name: /^Essencial/ }).textContent).toContain('+72€');
    // A impermeabilização deixou de "incluir" anti-ácaros: é um tratamento à parte.
    expect(screen.queryByText(/incluídos/i)).toBeNull();
    fireEvent.click(premium);
    expect(update).toHaveBeenCalledWith({ chairWaterproofing: true, chairWaterproofQty: 4, waterproofingTier: 'premium', chairAntiAcaros: false });
    fireEvent.click(screen.getByRole('button', { name: /Anti-ácaros/ }));
    expect(update).toHaveBeenLastCalledWith({ chairAntiAcaros: true, chairWaterproofing: false, chairWaterproofQty: 0 });
  });

  // Pedido explícito do dono, repetido duas vezes: nas cadeiras o
  // anti-ácaros mostra-se sempre como "5€/un.", nunca como total.
  it.each([1, 4, 9])('shows the chair anti-acaros as a 5€ unit rate, never as a total (%i chairs)', qty => {
    render(<QuizChairsAddonUpsell formData={{ ...initialFormData, serviceType: 'cleaning', chairQuantity: String(qty) }} updateFormData={() => {}} onBack={() => {}} onContinue={() => {}} />);
    const anti = screen.getByRole('button', { name: /Anti-ácaros/ });
    expect(anti.textContent).toContain('+5€/un.');
    if (qty > 1) expect(anti.textContent).not.toContain(`${qty * 5}€`);
  });

  it('makes chair anti-acaros and waterproofing mutually exclusive', () => {
    function ChairsHarness() {
      const [form, setForm] = useState<QuizFormData>({ ...initialFormData, serviceType: 'cleaning', chairQuantity: '4' });
      return <><QuizChairsAddonUpsell formData={form} updateFormData={u => setForm(prev => ({ ...prev, ...u }))} onBack={() => {}} onContinue={() => {}} />
        <output aria-label="state">{JSON.stringify({ anti: form.chairAntiAcaros, wq: form.chairWaterproofQty })}</output></>;
    }
    render(<ChairsHarness />);
    const anti = screen.getByRole('button', { name: /Anti-ácaros/ });
    const essencial = screen.getByRole('button', { name: /^Essencial/ });
    fireEvent.click(anti);
    expect(anti.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText('state').textContent).toBe('{"anti":true,"wq":0}');
    fireEvent.click(essencial);
    expect(anti.getAttribute('aria-pressed')).toBe('false');
    expect(essencial.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText('state').textContent).toBe('{"anti":false,"wq":4}');
    fireEvent.click(anti);
    expect(essencial.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByLabelText('state').textContent).toBe('{"anti":true,"wq":0}');
  });

  describe('sofa anti-acaros', () => {
    function SofaAntiHarness({ items: initial }: { items: SofaItem[] }) {
      const [form, setForm] = useState<QuizFormData>({ ...initialFormData, serviceType: 'cleaning' });
      const [items, setItems] = useState(initial);
      return <><QuizSofaAddonUpsell formData={form} updateFormData={u => setForm(prev => ({ ...prev, ...u }))}
        sofaItems={items} setSofaItems={setItems} onBack={() => {}} onContinue={() => {}} />
        <output aria-label="state">{JSON.stringify({ anti: form.sofaAntiAcaros, treated: items.filter(i => i.packEnabled).reduce((n, i) => n + (i.packQty ?? i.qty), 0) })}</output></>;
    }

    it('shows the price per sofa, per size, from the shared table', () => {
      render(<SofaAntiHarness items={[{ sizeId: '1-lugar', qty: 1, packEnabled: false }, { sizeId: '3-lugares', qty: 2, packEnabled: false }]} />);
      const anti = screen.getByRole('button', { name: /Anti-ácaros/ });
      expect(anti.textContent).toContain('Acréscimo por sofá');
      expect(anti.textContent).toContain('1 Lugar+20€');
      expect(anti.textContent).toContain('3 Lugares+50€');
      expect(anti.textContent).toContain('+120€ para 3 sofás');
    });

    it('keeps 4+ seats under quote', () => {
      render(<SofaAntiHarness items={[{ sizeId: '4+-lugares', qty: 1, packEnabled: false }]} />);
      expect(screen.getByRole('button', { name: /Anti-ácaros/ }).textContent).toContain('Sob orçamento');
    });

    it('is one treatment per sofa: anti-acaros and waterproofing switch each other off', () => {
      render(<SofaAntiHarness items={[{ sizeId: '2-lugares', qty: 1, packEnabled: false }]} />);
      const anti = screen.getByRole('button', { name: /Anti-ácaros/ });
      const premium = screen.getByRole('button', { name: /Premium/ });
      fireEvent.click(anti);
      expect(anti.getAttribute('aria-pressed')).toBe('true');
      expect(premium.getAttribute('aria-pressed')).toBe('false');
      expect(screen.getByLabelText('state').textContent).toBe('{"anti":true,"treated":1}');
      expect(screen.getByRole('button', { name: 'Continuar com tratamento' })).toBeTruthy();
      fireEvent.click(premium);
      expect(anti.getAttribute('aria-pressed')).toBe('false');
      expect(premium.getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByLabelText('state').textContent).toBe('{"anti":false,"treated":1}');
      fireEvent.click(anti);
      fireEvent.click(anti);
      expect(anti.getAttribute('aria-pressed')).toBe('false');
      expect(screen.getByLabelText('state').textContent).toBe('{"anti":false,"treated":0}');
    });

    it('is not offered when waterproofing is the main service', () => {
      render(<QuizSofaAddonUpsell formData={{ ...initialFormData, serviceType: 'waterproofing' }} updateFormData={() => {}}
        sofaItems={[{ sizeId: '2-lugares', qty: 1, packEnabled: false }]} setSofaItems={() => {}} onBack={() => {}} onContinue={() => {}} />);
      expect(screen.queryByRole('button', { name: /Anti-ácaros/ })).toBeNull();
    });
  });

  it('explains carpet dimensions and shows area without introducing a price', () => {
    const { container } = render(<QuizStepConfigCarpet carpetItems={[{ id: 'rug', largura: '1.5', comprimento: '2' }]} setCarpetItems={() => {}} />);
    expect(screen.getByLabelText('Largura do tapete 1, em metros')).toBeTruthy();
    expect(screen.getByLabelText('Comprimento do tapete 1, em metros')).toBeTruthy();
    expect(screen.getByText('3 m²')).toBeTruthy();
    expect(container.textContent).not.toContain('€');
  });
});
