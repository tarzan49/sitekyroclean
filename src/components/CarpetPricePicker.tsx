// Widget de preço das alcatifas, com a lógica do orçamento (StepPricePicker): espaço ou medida, anti-odor.
import StepPricePicker from '@/components/StepPricePicker';

export default function CarpetPricePicker({ city, source, onCity }: { city: string; source: string; onCity?: (city: string) => void }) {
  return <StepPricePicker kind="carpet" city={city} source={source} onCity={onCity} />;
}
