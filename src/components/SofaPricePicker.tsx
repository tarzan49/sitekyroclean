// Widget de preço dos sofás para as páginas fora do LandingServiceSections (problemas, materiais, marcas, principal).
// `material` quando a página já o diz (ex.: sofá de veludo): não se pergunta outra vez.
import StepPricePicker from '@/components/StepPricePicker';

export default function SofaPricePicker({ city, source, onCity, material }: { city: string; source: string; onCity?: (city: string) => void; material?: 'tecido' }) {
  return <StepPricePicker kind="sofa" city={city} source={source} onCity={onCity} material={material} />;
}
