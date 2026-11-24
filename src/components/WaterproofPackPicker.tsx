// Widget de preço de sofás e cadeiras. Desde 25 Nov segue a lógica do orçamento (StepPricePicker).
import StepPricePicker from '@/components/StepPricePicker';
import { type PackExtra } from '@/lib/customPack';

type Kind = 'sofa' | 'chairs';
/** A escolha como o cesto a recebe (basketChoice). */
export interface PackChoice { kind: Kind; size: string; qty: number; extra: PackExtra; sofas?: { size: string; qty: number }[] }
interface Props { kind: Kind; city: string; source: string; onCity?: (city: string) => void; material?: 'tecido' }

export default function WaterproofPackPicker(props: Props) {
  return <StepPricePicker key={props.kind} {...props} />;
}
