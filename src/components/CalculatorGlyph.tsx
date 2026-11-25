/** Calculadora do CTA "Calcular o meu preço", com o mesmo peso do símbolo do WhatsApp (dono, 25 Nov). */
export default function CalculatorGlyph({ className = '' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}><path fillRule="evenodd" clipRule="evenodd" d="M6 1.5A2.5 2.5 0 0 0 3.500 4v16A2.500 2.500 0 0 0 6 22.500h12a2.500 2.500 0 0 0 2.500-2.500V4A2.500 2.500 0 0 0 18 1.500H6ZM5.300 4c0-.39.31-.7.7-.7h12c.39 0 .7.31.7.7v16a.7.7 0 0 1-.7.7H6a.7.7 0 0 1-.7-.7V4ZM7.300 6h9.400v4H7.300V6Zm0 6.200h2.200v2.200H7.300v-2.200Zm3.600 0h2.200v2.200h-2.200v-2.200Zm3.600 0h2.200v6h-2.200v-6Zm-7.200 3.800h2.200v2.200H7.300V16Zm3.600 0h2.200v2.200h-2.200V16Z" /></svg>;
}
