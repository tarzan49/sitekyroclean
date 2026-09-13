import { MessageCircle } from 'lucide-react';
import { locationPrices } from '@/components/quiz/QuizTypes';
import { trackWhatsAppClick } from '@/lib/quizTracking';

export default function SofaLeadActions({ city, price, href, source }: { city: string; price: string; href: string; source: string }) {
  const fee = locationPrices[city];
  return (
    <div className="max-w-lg">
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick(source)}
        className="flex items-center justify-center gap-2 min-h-[52px] px-3 bg-[#16833e] hover:bg-[#116b32] text-white font-semibold text-base shadow-lg transition-colors">
        <MessageCircle className="w-5 h-5 shrink-0" /> Pedir orçamento por WhatsApp
      </a>
      <a href="#precos" className="flex items-center justify-center min-h-11 mt-1 text-base font-medium text-white underline underline-offset-4">Ver preços</a>
      <p className="text-white/85 text-sm leading-relaxed">Desde {price} + deslocação {fee === undefined ? 'a partir de 10€ (confirmada pela morada)' : `de ${fee}€`}. Orçamento gratuito, sem compromisso.</p>
    </div>
  );
}
