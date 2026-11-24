// Impermeabilização sozinha, com a lógica do orçamento (StepPricePicker): peça, tamanho e Premium ou Essencial.
// Só tecido: nunca pele.
import StepPricePicker from '@/components/StepPricePicker';

export default function ImperPricePicker({ city, source, initialKind, onCity }: { city: string; source: string; initialKind?: 'sofa' | 'chairs'; onCity?: (city: string) => void }) {
  return <StepPricePicker kind="imper" piece={initialKind} city={city} source={source} onCity={onCity} />;
}
