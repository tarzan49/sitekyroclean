import { useEffect, useState } from "react";

const FONT_OPTIONS = [
  {
    id: "avenir",
    label: "Proposta · Avenir Next",
    heading: "'Kyro Avenir Preview', 'Avenir Next', sans-serif",
    body: "'Kyro Avenir Preview', 'Avenir Next', sans-serif",
  },
  {
    id: "newsreader",
    label: "Teste anterior · Newsreader + Source Sans 3",
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
    isFontOption(initialFont) ? initialFont : "avenir",
  );

  const [collapsed, setCollapsed] = useState(false);
  const [fontAvailable, setFontAvailable] = useState<boolean | null>(null);

  const selected = FONT_OPTIONS.find((option) => option.id === selectedId) ?? FONT_OPTIONS[0];

  useEffect(() => {
    const fontStylesheetId = "kyro-font-comparison-stylesheet";
    const fontStylesheetHref = "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Newsreader:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Source+Serif+4:wght@400;500;600;700&display=swap";
    let stylesheet = document.getElementById(fontStylesheetId) as HTMLLinkElement | null;

    if (!stylesheet) {
      stylesheet = document.createElement("link");
      stylesheet.id = fontStylesheetId;
      stylesheet.rel = "stylesheet";
      document.head.appendChild(stylesheet);
    }
    stylesheet.href = fontStylesheetHref;

    document.documentElement.dataset.kyroFontPreview = "true";

    return () => {
      delete document.documentElement.dataset.kyroFontPreview;
      delete document.documentElement.dataset.kyroFontDirection;
      document.documentElement.style.removeProperty("--kyro-preview-heading");
      document.documentElement.style.removeProperty("--kyro-preview-body");
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.kyroFontDirection = selected.id;
    document.documentElement.style.setProperty("--kyro-preview-heading", selected.heading);
    document.documentElement.style.setProperty("--kyro-preview-body", selected.body);

    const url = new URL(window.location.href);
    url.searchParams.set("fonte", selected.id);
    window.history.replaceState(window.history.state, "", url);
  }, [selected]);

  useEffect(() => {
    // Local faces only: never distribute the commercial font in the repository.
    Promise.all([400, 500, 600].map(weight =>
      document.fonts.load(`${weight} 16px "Kyro Avenir Preview"`),
    )).then(faces => setFontAvailable(faces.every(face => face.length > 0)))
      .catch(() => setFontAvailable(false));
  }, []);

  return (
    <>
      <style>{`
        @font-face { font-family: "Kyro Avenir Preview"; src: local("AvenirNext-Regular"); font-weight: 400; }
        @font-face { font-family: "Kyro Avenir Preview"; src: local("AvenirNext-Medium"); font-weight: 500; }
        @font-face { font-family: "Kyro Avenir Preview"; src: local("AvenirNext-DemiBold"); font-weight: 600 900; }
        html[data-kyro-font-direction="avenir"] .kyro-original-label { display: none; }
        html[data-kyro-font-direction="avenir"] .kyro-avenir-label { display: inline !important; }
        html[data-kyro-font-direction="avenir"] h1 {
          font-size: clamp(30px, 3.4vw, 48px) !important;
          font-weight: 600 !important; line-height: 1.15 !important; letter-spacing: -0.035em !important;
        }
        html[data-kyro-font-direction="avenir"] h2 {
          font-size: clamp(28px, 2.7vw, 38px) !important;
          font-weight: 600 !important; line-height: 1.2 !important; letter-spacing: -0.025em !important;
          text-wrap: balance;
        }
        html[data-kyro-font-direction="avenir"] h3 {
          font-weight: 600 !important; letter-spacing: -0.015em !important; line-height: 1.3 !important;
        }
        html[data-kyro-font-direction="avenir"] #precos { scroll-margin-top: 100px; }
        html[data-kyro-font-direction="avenir"] #precos > div > div { align-items: start; }
        html[data-kyro-font-direction="avenir"] #precos h2 + p { color: #505650; font-size: 16px; line-height: 1.7; }
        html[data-kyro-font-direction="avenir"] #precos h3 { font-size: clamp(21px, 1.9vw, 26px) !important; }
        html[data-kyro-font-direction="avenir"] #precos .text-center:has(> h3) { text-align: left; padding-bottom: 24px; }
        html[data-kyro-font-direction="avenir"] #precos p[class*="uppercase"] { letter-spacing: 0.14em !important; }
        html[data-kyro-font-direction="avenir"] #precos [class*="text-white/65"] { color: rgb(255 255 255 / 0.78); }
        html[data-kyro-font-direction="avenir"] #precos [class*="text-[#111111]/"] { color: #505650; }
        @media (max-width: 767px) {
          html[data-kyro-font-direction="avenir"] #precos > div > div > div:first-child > div:first-child { margin-bottom: 0; }
        }
        html[data-kyro-font-direction="avenir"] #precos button { font-variant-numeric: tabular-nums; }

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

      <aside aria-label="Comparar tipografia" className="fixed bottom-3 right-3 left-3 sm:left-auto z-[100] rounded-lg border border-white/20 bg-[#071a12] p-3 text-white shadow-xl sm:w-[310px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium">Pré-visualização Kyro</span>
          <button type="button" onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed} className="min-h-11 px-2 text-xs text-white/75">{collapsed ? "Comparar" : "Recolher"}</button>
        </div>
        {!collapsed && <>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["current", "avenir"] as const).map(id => (
            <button key={id} type="button" aria-pressed={selectedId === id}
              onClick={() => setSelectedId(id)}
              className={`min-h-11 rounded border text-sm font-semibold ${selectedId === id ? "border-[#D4AF37] bg-[#D4AF37] text-[#071a12]" : "border-white/25 text-white"}`}>
              {id === "current" ? "Atual" : "Avenir Next"}
            </button>
          ))}
        </div>
        {selectedId === "avenir" && fontAvailable === false && (
          <p role="status" className="mt-2 text-xs text-amber-200">Avenir Next não está disponível neste dispositivo. A fonte apresentada é de substituição.</p>
        )}
        <details className="mt-2 text-xs text-white/70">
          <summary className="cursor-pointer py-1">Detalhes e testes anteriores</summary>
          <p className="my-2">{fontAvailable ? "Avenir Next disponível neste dispositivo." : "A verificar a disponibilidade da Avenir Next."} Publicação depende de licença web.</p>
          <label className="sr-only" htmlFor="font-comparison-select">Combinação tipográfica</label>
          <select id="font-comparison-select" value={selectedId}
            onChange={event => setSelectedId(event.target.value as FontOptionId)}
            className="min-h-11 w-full rounded border border-white/25 bg-[#0d241b] px-2 text-xs text-white">
            {FONT_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </details>
        </>}
      </aside>
    </>
  );
};

export default FontComparisonPanel;
