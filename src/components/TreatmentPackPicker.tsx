// Colchões com anti-ácaros e tapetes com anti-odor: a lógica do orçamento (StepPricePicker; dono, 25 Nov). O sofá com
// anti-ácaros e os packs de várias peças estão no PackStepPicker.
import StepPricePicker from '@/components/StepPricePicker';

export type TreatmentKind = 'sofa' | 'mattress' | 'rug';
interface Props { kind: Exclude<TreatmentKind, 'sofa'>; city: string; source: string; onCity?: (city: string) => void }

export default function TreatmentPackPicker(props: Props) {
  return <StepPricePicker kind={props.kind} city={props.city} source={props.source} onCity={props.onCity} />;
}
