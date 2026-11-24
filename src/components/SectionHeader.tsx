/**
 * Cabeçalho de secção do site: SÓ o título (dono, 24 Nov 2026: "só um título em cada coisa", sem o texto
 * pequeno por cima nem subtítulo), sempre no mesmo formato: `type-section-title font-playfair`, preto em
 * fundo claro, branco em fundo verde, última palavra (`goldWord`) a dourado #D4AF37.
 * `overline` e `subtitle` continuam aceites para não partir as páginas que os passam, mas não se mostram.
 */
const SectionHeader = ({
  heading,
  goldWord,
  light = true,
  className = "",
}: {
  overline?: string;
  heading: string;
  goldWord: string;
  subtitle?: string;
  light?: boolean;
  className?: string;
}) => (
  <div className={`mb-8 md:mb-10 ${className}`}>
    <h2 className={`type-section-title font-playfair ${light ? "text-[#111111]" : "text-white"}`}>
      {heading}{" "}
      <em className="not-italic" style={{ color: "#D4AF37" }}>{goldWord}</em>
    </h2>
  </div>
);

export default SectionHeader;
