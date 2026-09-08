// Legenda de escalões de preço por m² (alcatifas) no widget de preços
// (PriceWidget.tsx). Cores escuro/dourado atualizadas 2026-09-09 — ainda
// tinha as cores do widget antigo (texto escuro pensado para fundo branco),
// ficava quase ilegível depois do widget passar a escuro (achado real:
// "as páginas de alcatifa estão desatualizadas, não acompanharam a nova
// transição").
const ALCATIFA_TIERS = [
  { max: 50, label: 'até 50m²', price: '3€/m²' },
  { max: Infinity, label: '+50m²', price: 'Sob orçamento' },
];

export function CarpetTierLegend({ isAlcatifa, qty }: { isAlcatifa: boolean; qty: number }) {
  // Tapetes (não-alcatifa) já não têm escalão por m² — sempre sob orçamento,
  // não há tabela para mostrar (2026-09-06).
  if (!isAlcatifa) return null;
  const tiers = ALCATIFA_TIERS;
  const activeIdx = qty > 0 ? tiers.findIndex(t => qty <= t.max) : -1;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2.5">
      {tiers.map((t, i) => {
        const active = i === activeIdx;
        return (
          <span
            key={t.label}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-semibold leading-none transition-colors"
            style={{
              background: active ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.04)",
              color: active ? "#D4AF37" : "rgba(255,255,255,0.45)",
              border: `1px solid ${active ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.12)"}`,
            }}
          >
            {t.label}
            <span style={{ opacity: 0.5 }}>·</span>
            {t.price}
          </span>
        );
      })}
    </div>
  );
}
