// Widget de preço dos tapetes, com a lógica do orçamento (StepPricePicker): material, medida, anti-odor.
import StepPricePicker from '@/components/StepPricePicker';

export default function RugPricePicker({ city, source, onCity }: { city: string; source: string; onCity?: (city: string) => void }) {
  return <StepPricePicker kind="rug" city={city} source={source} onCity={onCity} />;
}
