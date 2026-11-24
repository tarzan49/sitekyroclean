import { WhatsAppCta } from '@/components/Cta';
import { locationPrices } from '@/components/quiz/QuizTypes';

export default function SofaLeadActions({ city, price, href, source }: { city: string; price: string; href: string; source: string }) {
  const fee = locationPrices[city];
  return (
    <div className="max-w-lg">
      <WhatsAppCta href={href} source={source} />
      <a href="#precos" className="flex items-center justify-center min-h-11 mt-1 text-base font-medium text-white underline underline-offset-4">Ver preços</a>
      <p className="text-white/85 text-sm leading-relaxed">Desde {price} + deslocação {fee === undefined ? 'a partir de 10€ (confirmada pela morada)' : `de ${fee}€`}. Orçamento gratuito, sem compromisso.</p>
    </div>
  );
}
