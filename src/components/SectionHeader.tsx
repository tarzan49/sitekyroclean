const SectionHeader = ({
  overline,
  heading,
  goldWord,
  subtitle,
  light = true,
}: {
  overline: string;
  heading: string;
  goldWord: string;
  subtitle?: string;
  light?: boolean;
}) => (
  <div className="mb-10 md:mb-14">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-0.5 w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37" }} />
      <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.85 }}>
        {overline}
      </p>
    </div>
    <h2 className={`font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] ${light ? "text-[#111111]" : "text-white"}`}>
      {heading}{" "}
      <em className="not-italic" style={{ color: "#D4AF37" }}>{goldWord}</em>
    </h2>
    {subtitle && (
      <p className={`mt-4 text-[15px] leading-relaxed max-w-2xl ${light ? "text-[#111111]/55" : "text-white/50"}`}>
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeader;
