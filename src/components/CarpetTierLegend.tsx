// Legenda de escalões de preço por m² (tapetes/alcatifas) no widget de preços.
// Componente partilhado pelos 3 sítios que renderizam o widget (ver "terceira
// armadilha" no CLAUDE.md) para não triplicar também esta lógica.
const CARPET_TIERS = [
  { max: 3, label: '≤3m²', price: '15€/m²' },
  { max: 5, label: '≤5m²', price: '12,5€/m²' },
  { max: 8, label: '≤8m²', price: '11,5€/m²' },
  { max: 10, label: '≤10m²', price: '10,5€/m²' },
  { max: 15, label: '≤15m²', price: '10€/m²' },
  { max: Infinity, label: '+15m²', price: 'Sob orçamento' },
];

const ALCATIFA_TIERS = [
  { max: 50, label: 'até 50m²', price: '3€/m²' },
  { max: Infinity, label: '+50m²', price: 'Sob orçamento' },
];

export function CarpetTierLegend({ isAlcatifa, qty }: { isAlcatifa: boolean; qty: number }) {
  const tiers = isAlcatifa ? ALCATIFA_TIERS : CARPET_TIERS;
  const activeIdx = qty > 0 ? tiers.findIndex(t => qty <= t.max) : -1;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {tiers.map((t, i) => {
        const active = i === activeIdx;
        return (
          <span
            key={t.label}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold leading-none transition-colors"
            style={{
              background: active ? "rgba(212,175,55,0.14)" : "rgba(17,17,17,0.04)",
              color: active ? "#B8912A" : "rgba(17,17,17,0.45)",
              border: `1px solid ${active ? "rgba(212,175,55,0.35)" : "rgba(17,17,17,0.08)"}`,
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
