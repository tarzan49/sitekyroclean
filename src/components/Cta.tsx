// Os únicos CTAs do site são estes dois, os da página inicial (dono, 25 Nov 2026: "os CTAs só podem ser o que for
// combinado, não pode fugir disso"): verde "Falar por WhatsApp" e dourado "Calcular o meu preço". Os botões de passo
// do orçamento (continuar, juntar, guardar) usam o dourado com o nome do passo. O aspeto está em index.css (.cta).
// O teste ctaRegra.test.ts falha se aparecer um botão de contacto ou de preço com outro aspeto ou outro texto.
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Calculator, MessageCircle } from 'lucide-react';

export const CTA_WHATSAPP = 'Falar por WhatsApp';
export const CTA_PRICE = 'Calcular o meu preço';

/** `total` junta o valor final ao texto ("Falar por WhatsApp · 219€"); `en` só nas páginas em inglês. */
export function WhatsAppCta({ href, source, total, en = false, small = false, heroPart, className = '', onClick }: { href: string; source: string; total?: string; en?: boolean; small?: boolean; heroPart?: string; className?: string; onClick?: () => void }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" data-tracking-source={source} data-hero-part={heroPart} onClick={onClick} className={`cta cta-wa ${small ? 'cta-sm' : ''} ${className}`}>
    <MessageCircle className="cta-icon" strokeWidth={2} aria-hidden="true" />
    <span>{en ? 'Message on WhatsApp' : CTA_WHATSAPP}{total ? ` · ${total}` : ''}</span>
  </a>;
}

export function PriceCta({ small = false, className = '', children, icon, ...rest }: { small?: boolean; className?: string; children?: ReactNode; icon?: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...rest} className={`cta cta-gold ${small ? 'cta-sm' : ''} ${className}`}>
    {icon === undefined ? <Calculator className="cta-icon" strokeWidth={2.25} aria-hidden="true" /> : icon}
    <span>{children ?? CTA_PRICE}</span>
  </button>;
}
