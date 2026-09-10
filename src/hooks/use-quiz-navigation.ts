import { useState } from 'react';
import type { QuizFormData, SofaItem, MattressItem, CarpetItem } from '@/components/quiz';
import { carpetAllItemsValid } from '@/components/quiz/quizHelpers';

// As 4 telas de upsell dedicadas são sempre mutuamente exclusivas — ver
// QuizForm.tsx para o histórico completo (eram 4 booleans independentes,
// unificados 2026-09-08 no audit de código).
export type UpsellScreen = 'chairs' | 'sofa' | 'mattress' | 'combo' | null;

interface UseQuizNavigationParams {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  sofaItems: SofaItem[];
  mattressItems: MattressItem[];
  carpetItems: CarpetItem[];
  totalPrice: number;
  initialStep: number;
  firstStep: number;
  totalSteps: number;
  activeUpsellScreen: UpsellScreen;
  setActiveUpsellScreen: (screen: UpsellScreen) => void;
  upsellShown: boolean;
  setUpsellShown: (shown: boolean) => void;
  setLocationQuery: (query: string) => void;
}

// Extraído de QuizForm.tsx (2026-09-08, thinning do audit de código — o
// ficheiro tinha 1224 linhas a misturar navegação de passos, agregação de
// preços, reset de formulário e submissão no mesmo componente). Esta parte
// isola só a "máquina de passos": em que step está o quiz, se pode avançar,
// e o que acontece ao avançar/recuar — sempre a partir do formData/itens já
// existentes, nunca donos desse estado (isso continua em QuizForm.tsx,
// entrelaçado de propósito com os efeitos de reset ao reabrir o quiz, que já
// causaram bugs reais quando ficaram espalhados por sítios diferentes).
export function useQuizNavigation({
  formData,
  updateFormData,
  sofaItems,
  mattressItems,
  carpetItems,
  totalPrice,
  initialStep,
  firstStep,
  totalSteps,
  activeUpsellScreen,
  setActiveUpsellScreen,
  upsellShown,
  setUpsellShown,
  setLocationQuery,
}: UseQuizNavigationParams) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Sofá, colchão e cadeiras têm todos o seu próprio Passo 2 (Higienização vs
  // Impermeabilização/Anti Ácaros) — só o tapete não tem esse conceito (sempre
  // sob orçamento), por isso é o único que salta a etapa. Antes incluía também
  // colchão e cadeiras aqui, o que desalinhava com o clique direto no Passo 1
  // (que já não os saltava) e causava o "Voltar" a saltar o Passo 2 por engano.
  // Colchão voltou a saltar este passo (2026-09-08): Anti Ácaros não existe
  // como serviço primário próprio, só como upsell dependente de uma limpeza
  // (tal como a impermeabilização do sofá nunca é pedida sozinha sem limpeza
  // — mas ao contrário desse caso, o colchão não tem um "modo impermeabilização"
  // real por trás, por isso nem faz sentido perguntar aqui).
  const shouldSkipServiceType = formData.service === 'carpet' || formData.service === 'mattress';

  const canProceedStep3 = () => {
    switch (formData.service) {
      case 'sofa': {
        return sofaItems.some(i => i.qty > 0);
      }
      case 'carpet': {
        return carpetAllItemsValid(carpetItems);
      }
      case 'mattress':
        return mattressItems.some(i => i.qty > 0);
      case 'chairs': {
        // Ecrã mostra "1" por omissão sem o utilizador tocar no stepper
        // (Math.max(1, parseInt(...) || 1) em QuizStepConfig), mas o estado
        // real fica em '' até ao primeiro clique em +/-. Sem isto, escolher
        // a quantidade de 1 cadeira "de calha" e avançar ficava bloqueado
        // (parseInt('') é NaN), mesmo o ecrã mostrando 1 corretamente.
        // Na direção impermeabilização este atalho fica desligado (2026-09-08):
        // o stepper só aparece depois de escolher Premium/Essencial, e sem
        // exigir um clique real ali, dava para carregar em "Continuar" antes
        // de escolher tier nenhum e ficar com o Premium por omissão em
        // silêncio (nada aparecia selecionado no ecrã).
        if (formData.serviceType !== 'waterproofing' && formData.chairQuantity === '') return true;
        const n = parseInt(formData.chairQuantity);
        return !isNaN(n) && n >= 1;
      }
      default:
        return false;
    }
  };

  // Step order: [0-Location?], 1-Service, 2-ServiceType, 3-Config, [Upsell], 4-Contact (submit)
  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.location !== '' && formData.location !== 'other';
      case 1: return formData.service !== '';
      case 2: return formData.serviceType !== '';
      case 3: return canProceedStep3();
      case 4: return canProceedStep3() && formData.location.trim() !== '' && formData.name.trim() !== '' && /^[+\d\s().-]+$/.test(formData.phone.trim()) && formData.phone.replace(/\D/g, '').length >= 9 && formData.phone.replace(/\D/g, '').length <= 15;
      default: return false;
    }
  };

  // Extraído do handleNext original: o que acontece depois da etapa de
  // quantidades (step 3), partilhado entre o fluxo normal e o "Continuar"
  // de cada upsell dedicado por serviço, que intercepta antes.
  const proceedPastConfig = () => {
    setUpsellShown(true);
    setActiveUpsellScreen('combo');
  };

  const handleNext = () => {
    if (canProceed()) {
      // Commita o valor implícito de 1 cadeira ao avançar (canProceedStep3
      // já aceita '' como válido para não bloquear "Continuar" com o ecrã a
      // mostrar 1) — sem isto o preço, o resumo do pedido e o payload do
      // Formspree ficavam todos a tratar '' como "sem cadeiras" (0€, linha
      // de cadeiras omitida da mensagem), mesmo o cliente tendo avançado
      // com 1 cadeira visível no ecrã.
      if (formData.service === 'chairs' && formData.chairQuantity === '') {
        updateFormData({ chairQuantity: '1', chairType: 'bulk_full' });
      }
      let nextStep = currentStep + 1;
      if (nextStep === 2 && shouldSkipServiceType) {
        updateFormData({ serviceType: 'cleaning' });
        nextStep = 3;
      }
      // Upsell "estilo companhia aérea" dedicado por serviço, sempre a seguir
      // às quantidades (só quando a limpeza é o serviço principal) — a pessoa
      // pensa só em quantidade no step 3, decide a proteção/Anti Ácaros aqui.
      if (currentStep === 3 && formData.service === 'chairs' && (formData.serviceType === 'cleaning' || formData.serviceType === 'waterproofing')) {
        setActiveUpsellScreen('chairs');
        return;
      }
      if (currentStep === 3 && formData.service === 'sofa' && (formData.serviceType === 'cleaning' || formData.serviceType === 'waterproofing')) {
        setActiveUpsellScreen('sofa');
        return;
      }
      if (currentStep === 3 && formData.service === 'mattress' && formData.serviceType === 'cleaning') {
        setActiveUpsellScreen('mattress');
        return;
      }
      // Upsell intercept: always show Pack Família when going forward from step 3
      // (re-shows if user clicked Voltar from Pack back to quantities).
      if (currentStep === 3) {
        proceedPastConfig();
        return;
      }
      if (nextStep <= totalSteps) {
        (document.activeElement as HTMLElement)?.blur();
        setCurrentStep(nextStep);
      }
    }
  };

  const handlePrev = () => {
    // If on step 4 (contact) and upsell was shown, go back to upsell item selector
    if (currentStep === 4 && upsellShown) {
      setActiveUpsellScreen('combo');
      return;
    }
    let prevStep = currentStep - 1;
    // Details (step 3): skip ServiceType only for services that don't use it
    if (currentStep === 3 && shouldSkipServiceType) prevStep = 1;
    // Sofa/mattress go 3→2 naturally; still skip step 2 on explicit backward from step 2
    else if (prevStep === 2 && shouldSkipServiceType) prevStep = 1;

    if (prevStep >= firstStep) {
      // Going back to location step: clear selection so city cards render again
      if (prevStep === 0) {
        updateFormData({ location: '' });
        setLocationQuery('');
      }
      setCurrentStep(prevStep);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    shouldSkipServiceType,
    canProceed,
    canProceedStep3,
    proceedPastConfig,
    handleNext,
    handlePrev,
  };
}
