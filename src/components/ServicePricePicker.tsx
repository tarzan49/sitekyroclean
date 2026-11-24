// Widget de preço de qualquer limpeza (sofá, cadeiras, colchão), com a lógica do orçamento (StepPricePicker).
import StepPricePicker, { type StepKind } from '@/components/StepPricePicker';

export type PickerService = 'limpeza-sofas' | 'limpeza-cadeiras' | 'limpeza-colchoes';
export const PICKER_SERVICES: string[] = ['limpeza-sofas', 'limpeza-cadeiras', 'limpeza-colchoes'];
const KIND: Record<PickerService, StepKind> = { 'limpeza-sofas': 'sofa', 'limpeza-cadeiras': 'chairs', 'limpeza-colchoes': 'mattress' };

export default function ServicePricePicker({ service, city, source, onCity }: { service: PickerService; city: string; source: string; onCity?: (city: string) => void }) {
  return <StepPricePicker key={service} kind={KIND[service]} city={city} source={source} onCity={onCity} />;
}
