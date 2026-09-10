import type { QuizFormData, SofaItem, MattressItem, CarpetItem } from '@/components/quiz/QuizTypes';
import QuizStepConfigSofa from './QuizStepConfigSofa';
import QuizStepConfigMattress from './QuizStepConfigMattress';
import QuizStepConfigCarpet from './QuizStepConfigCarpet';
import QuizStepConfigChairs from './QuizStepConfigChairs';

export { WaterproofingTierPicker } from './WaterproofingTierPicker';

interface QuizStepConfigProps {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  sofaItems: SofaItem[];
  setSofaItems: React.Dispatch<React.SetStateAction<SofaItem[]>>;
  mattressItems: MattressItem[];
  setMattressItems: React.Dispatch<React.SetStateAction<MattressItem[]>>;
  carpetItems: CarpetItem[];
  setCarpetItems: React.Dispatch<React.SetStateAction<CarpetItem[]>>;
}

// Dispatcher fino por serviço (2026-09-08, thinning do audit de código — era
// um único componente de 417 linhas com um bloco `if (formData.service ===
// X)` por serviço, cada um com a sua própria matemática de preços inline no
// JSX). Cada serviço agora vive no seu próprio ficheiro
// (QuizStepConfig{Sofa,Mattress,Carpet,Chairs}.tsx) — mesmo comportamento,
// isola o blast radius de cada edição.
const QuizStepConfig = (props: QuizStepConfigProps) => {
  switch (props.formData.service) {
    case 'sofa':
      return <QuizStepConfigSofa formData={props.formData} updateFormData={props.updateFormData} sofaItems={props.sofaItems} setSofaItems={props.setSofaItems} />;
    case 'mattress':
      return <QuizStepConfigMattress formData={props.formData} updateFormData={props.updateFormData} mattressItems={props.mattressItems} setMattressItems={props.setMattressItems} />;
    case 'carpet':
      return <QuizStepConfigCarpet carpetKind={props.formData.carpetKind} carpetItems={props.carpetItems} setCarpetItems={props.setCarpetItems} />;
    case 'chairs':
      return <QuizStepConfigChairs formData={props.formData} updateFormData={props.updateFormData} />;
    default:
      return null;
  }
};

export default QuizStepConfig;
