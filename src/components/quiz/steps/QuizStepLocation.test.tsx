import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import QuizStepLocation from './QuizStepLocation';
import { detectServiceCity } from '@/lib/locationDetection';
vi.mock('@/lib/locationDetection', async importOriginal => ({ ...await importOriginal<typeof import('@/lib/locationDetection')>(), detectServiceCity: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const props = { location: '', locationQuery: '', setLocationQuery: vi.fn(), scrollContainerRef: { current: null }, onCitySelect: vi.fn() };
describe('location step', () => {
  it('selects the detected locality but only advances after confirmation', async () => {
    vi.mocked(detectServiceCity).mockResolvedValue('Maia');
    render(<QuizStepLocation {...props} />);
    await screen.findByText('Localidade detetada');
    expect(screen.getByText('Deslocação para Maia')).toBeTruthy();
    expect(props.onCitySelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(props.onCitySelect).toHaveBeenCalledWith('Maia');
  });
  it('keeps manual search available when permission is denied', async () => {
    vi.mocked(detectServiceCity).mockRejectedValue(new Error('Localização recusada'));
    render(<QuizStepLocation {...props} locationQuery="Lisboa" />);
    await screen.findByText('Localização recusada');
    fireEvent.click(screen.getByRole('button', { name: 'Lisboa' }));
    expect(screen.getByText('Deslocação para Lisboa')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(props.onCitySelect).toHaveBeenCalledWith('Lisboa');
  });
  it('never overwrites a manual choice with a delayed location response', async () => {
    let resolve!: (city: string) => void;
    vi.mocked(detectServiceCity).mockImplementation(() => new Promise(r => { resolve = r; }));
    render(<QuizStepLocation {...props} locationQuery="Lisboa" />);
    fireEvent.click(screen.getByRole('button', { name: 'Lisboa' }));
    resolve('Maia');
    await waitFor(() => expect(screen.getByText('Deslocação para Lisboa')).toBeTruthy());
    expect(screen.queryByText('Localidade detetada')).toBeNull();
  });
  it('offers regional choices only after detection, and preserves existing location on back', async () => {
    render(<QuizStepLocation {...props} location="Cascais" />);
    expect(detectServiceCity).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Alterar localidade' }));
    expect(screen.getByText('Outras localidades na sua região')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Matosinhos' })).toBeNull();
  });
});
