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
      <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
      <p className="text-sm font-bold tracking-[0.08em] uppercase" style={{ color: light ? "#1A4E30" : "#D4AF37" }}>
        {overline}
      </p>
    </div>
    <h2 className={`type-section-title font-playfair      ${light ? "text-[#111111]" : "text-white"}`}>
      {heading}{" "}
      <em className="not-italic" style={{ color: light ? "#1A4E30" : "#D4AF37" }}>{goldWord}</em>
    </h2>
    {subtitle && (
      <p className={`mt-4 type-lead max-w-2xl ${light ? "text-[#505650]" : "text-white/80"}`}>
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeader;
