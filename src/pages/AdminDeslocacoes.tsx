import { locationPrices } from "@/components/quiz/QuizTypes";

const zones = [
  { label: "Zona 0: Porto Core (Grátis)", price: 0, color: "bg-emerald-900/40 border-emerald-500/30" },
  { label: "Zona 1: Subúrbios imediatos (~10-20 min)", price: 5, color: "bg-blue-900/40 border-blue-500/30" },
  { label: "Zona 2: Grande Porto (~20-30 min)", price: 10, color: "bg-yellow-900/40 border-yellow-500/30" },
  { label: "Zona 3: Interior norte (~35-45 min)", price: 15, color: "bg-orange-900/40 border-orange-500/30" },
  { label: "Zona 4: Mais afastado (~45-55 min)", price: 20, color: "bg-red-900/40 border-red-500/30" },
  { label: "Zona 5: Minho (~55-70 min)", price: 25, color: "bg-purple-900/40 border-purple-500/30" },
  { label: "Zona Lisboa: Deslocação especial", price: null, color: "bg-gray-800/60 border-gray-500/30" },
];

const citiesByPrice = Object.entries(locationPrices).reduce<Record<number, string[]>>((acc, [city, price]) => {
  if (!acc[price]) acc[price] = [];
  acc[price].push(city);
  return acc;
}, {});

export default function AdminDeslocacoes() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Tabela de Preços de Deslocação</h1>
          <p className="text-white/40 text-sm">Kyro Clean Solutions · Uso interno</p>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 mb-6 text-sm text-emerald-300">
          Deslocação <strong>gratuita</strong> em pedidos acima de <strong>150€</strong> (independente da zona).
        </div>

        <div className="space-y-4">
          {zones.map((zone) => {
            const price = zone.price;
            const cities = price !== null ? (citiesByPrice[price] || []) : Object.entries(locationPrices).filter(([, p]) => p >= 35).map(([c]) => c);
            return (
              <div key={zone.label} className={`border rounded-xl p-4 ${zone.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white/90 text-sm">{zone.label}</span>
                  <span className="font-mono font-bold text-base">
                    {price === 0 ? <span className="text-emerald-400">Grátis</span>
                      : price !== null ? <span className="text-gold">{price}€</span>
                      : <span className="text-white/50">35–40€</span>}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <span key={city} className="bg-white/[0.07] border border-white/10 rounded-full px-3 py-1 text-xs text-white/70">
                      {city}
                      {price === null && (
                        <span className="ml-1 text-white/40">({locationPrices[city]}€)</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Cidade</th>
                <th className="text-right px-4 py-3">Deslocação</th>
                <th className="text-right px-4 py-3">Grátis a partir de</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(locationPrices).map(([city, price]) => (
                <tr key={city} className="border-b border-white/[0.05] hover:bg-white/[0.03]">
                  <td className="px-4 py-2.5 text-white/80">{city}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-medium">
                    {price === 0
                      ? <span className="text-emerald-400">Grátis</span>
                      : <span className="text-gold">{price}€</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right text-white/40 text-xs">
                    150€ em serviços
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-white/20 text-xs text-center">
          Para editar: <code className="text-white/30">src/components/quiz/QuizTypes.ts → locationPrices</code>
        </p>
      </div>
    </div>
  );
}
