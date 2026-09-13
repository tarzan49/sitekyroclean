import { useEffect, useState } from "react";

const FONT_OPTIONS = [
  {
    id: "newsreader",
    label: "Recomendada · Newsreader + Source Sans 3",
    heading: "'Newsreader', Georgia, serif",
    body: "'Source Sans 3', system-ui, sans-serif",
  },
  {
    id: "current",
    label: "Fonte atual · Cormorant Garamond + Inter",
    heading: "'Cormorant Garamond', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
  },
  {
    id: "source-serif",
    label: "Alternativa · Source Serif 4 + Source Sans 3",
    heading: "'Source Serif 4', Georgia, serif",
    body: "'Source Sans 3', system-ui, sans-serif",
  },
  {
    id: "lora",
    label: "Alternativa · Lora + Source Sans 3",
    heading: "'Lora', Georgia, serif",
    body: "'Source Sans 3', system-ui, sans-serif",
  },
] as const;

type FontOptionId = (typeof FONT_OPTIONS)[number]["id"];

const isFontOption = (value: string | null): value is FontOptionId =>
  FONT_OPTIONS.some((option) => option.id === value);

const FontComparisonPanel = () => {
  const initialFont = new URLSearchParams(window.location.search).get("fonte");
  const [selectedId, setSelectedId] = useState<FontOptionId>(
    isFontOption(initialFont) ? initialFont : "newsreader",
  );

  const selected = FONT_OPTIONS.find((option) => option.id === selectedId) ?? FONT_OPTIONS[0];

  useEffect(() => {
    const fontStylesheetId = "kyro-font-comparison-stylesheet";
    let stylesheet = document.getElementById(fontStylesheetId) as HTMLLinkElement | null;

    if (!stylesheet) {
      stylesheet = document.createElement("link");
      stylesheet.id = fontStylesheetId;
      stylesheet.rel = "stylesheet";
      stylesheet.href = "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;500;600;700&display=swap";
      document.head.appendChild(stylesheet);
    }

    document.documentElement.dataset.kyroFontPreview = "true";

    return () => {
      delete document.documentElement.dataset.kyroFontPreview;
      document.documentElement.style.removeProperty("--kyro-preview-heading");
      document.documentElement.style.removeProperty("--kyro-preview-body");
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--kyro-preview-heading", selected.heading);
    document.documentElement.style.setProperty("--kyro-preview-body", selected.body);

    const url = new URL(window.location.href);
    url.searchParams.set("fonte", selected.id);
    window.history.replaceState(window.history.state, "", url);
  }, [selected]);

  return (
    <>
      <style>{`
        html[data-kyro-font-preview="true"] body,
        html[data-kyro-font-preview="true"] button,
        html[data-kyro-font-preview="true"] input,
        html[data-kyro-font-preview="true"] select,
        html[data-kyro-font-preview="true"] textarea {
          font-family: var(--kyro-preview-body) !important;
        }

        html[data-kyro-font-preview="true"] h1,
        html[data-kyro-font-preview="true"] h2,
        html[data-kyro-font-preview="true"] h3,
        html[data-kyro-font-preview="true"] h4,
        html[data-kyro-font-preview="true"] h5,
        html[data-kyro-font-preview="true"] h6,
        html[data-kyro-font-preview="true"] .font-playfair {
          font-family: var(--kyro-preview-heading) !important;
        }
      `}</style>

      <aside className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-xl rounded-xl border border-[#D4AF37]/45 bg-[#071a12]/95 p-3 text-white shadow-2xl backdrop-blur-md sm:inset-x-auto sm:bottom-5 sm:left-1/2 sm:w-[min(92vw,580px)] sm:-translate-x-1/2 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Teste tipográfico local</p>
            <p className="mt-0.5 text-xs text-white/65">Página real de colchões em Paranhos</p>
          </div>
          <span className="shrink-0 rounded-full border border-white/15 px-2 py-1 text-[10px] font-semibold text-white/65">4 opções</span>
        </div>

        <label className="block text-xs font-semibold text-white/80" htmlFor="font-comparison-select">
          Combinação tipográfica
        </label>
        <select
          id="font-comparison-select"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value as FontOptionId)}
          className="mt-1.5 min-h-12 w-full rounded-lg border border-[#D4AF37]/45 bg-[#0d241b] px-3 text-sm font-semibold text-white outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/25"
        >
          {FONT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </aside>
    </>
  );
};

export default FontComparisonPanel;
