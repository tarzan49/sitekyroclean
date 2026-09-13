import { useEffect } from 'react';
import CommercialHero from './CommercialHero';
import QuizForm from './QuizFormLazy';
import { useQuizLauncher } from '@/hooks/use-quiz-launcher';
import { WHATSAPP_BASE } from '@/constants/business';

export default function HeroV1() {
  const { isQuizOpen, openQuiz, closeQuiz } = useQuizLauncher();
  useEffect(() => {
    window.addEventListener('openQuiz', openQuiz);
    return () => window.removeEventListener('openQuiz', openQuiz);
  }, [openQuiz]);
  return <>
    <CommercialHero title="Estofos como novos, ao domicílio." subtitle="Limpeza profissional de sofás, colchões, cadeiras e tapetes." serviceSlug="limpeza-sofas" image={{ m: '/images/hero-sofa-mobile-extended.webp', d: '/images/hero-sofa-v1.jpeg' }} breadcrumbs={[{ label: 'Início' }]} whatsappHref={`${WHATSAPP_BASE}?text=${encodeURIComponent('Olá! Gostaria de pedir um orçamento para limpeza de estofos.')}`} source="home_hero" pricesHref="#servicos" />
    <QuizForm isOpen={isQuizOpen} onClose={closeQuiz} />
  </>;
}
