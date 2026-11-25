// Os únicos CTAs do site são estes dois (dono, 25 Nov 2026: "os CTAs só podem ser o que for combinado, não pode fugir
// disso"), com o desenho 5B: "Falar por WhatsApp" cheio verde-esmeralda com filete dourado por dentro e o símbolo do
// WhatsApp, e "Calcular o meu preço" em moldura dourada com a calculadora (dono, 25 Nov: o branco não combinava e faltavam
// os símbolos). Sem degradês, brilhos nem sombras. Os botões de passo do orçamento usam a moldura com o nome do passo, sem
// ícone. O aspeto está em index.css (.cta); `onLight` é obrigatório quando o fundo é claro. O teste ctaRegra.test.ts falha
// se algo fugir.
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import WhatsAppGlyph from '@/components/WhatsAppGlyph';
import CalculatorGlyph from '@/components/CalculatorGlyph';

export const CTA_WHATSAPP = 'Falar por WhatsApp';
export const CTA_PRICE = 'Calcular o meu preço';

const look = (kind: string, small: boolean, onLight: boolean, className: string) => `cta ${kind} ${onLight ? 'cta-light' : ''} ${small ? 'cta-sm' : ''} ${className}`;

/** `total` junta o valor final ao texto ("Falar por WhatsApp · 219€"); `en` só nas páginas em inglês. */
export function WhatsAppCta({ href, source, total, en = false, small = false, onLight = false, heroPart, className = '', onClick }: { href: string; source: string; total?: string; en?: boolean; small?: boolean; onLight?: boolean; heroPart?: string; className?: string; onClick?: () => void }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" data-tracking-source={source} data-hero-part={heroPart} onClick={onClick} className={look('cta-wa', small, onLight, className)}>
    <WhatsAppGlyph className="cta-icon" />
    <span>{en ? 'Message on WhatsApp' : CTA_WHATSAPP}{total ? ` · ${total}` : ''}</span>
  </a>;
}

export function PriceCta({ small = false, onLight = false, className = '', children, ...rest }: { small?: boolean; onLight?: boolean; className?: string; children?: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...rest} className={look('cta-gold', small, onLight, className)}>
    {children == null && <CalculatorGlyph className="cta-icon" />}
    <span>{children ?? CTA_PRICE}</span>
  </button>;
}
