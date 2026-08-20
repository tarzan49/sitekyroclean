import { locationPrices } from "@/components/quiz/QuizTypes";
import { cities } from "@/data/locationSeoData";

type Area = "porto" | "lisboa" | "algarve";

const REGIONS: { area: Area; label: string; color: string }[] = [
  { area: "porto", label: "Porto / Norte", color: "border-emerald-500/30" },
  { area: "lisboa", label: "Lisboa / Área Metropolitana", color: "border-blue-500/30" },
  { area: "algarve", label: "Algarve", color: "border-orange-500/30" },
];

const ZONE_COLORS = [
  "bg-emerald-900/40 border-emerald-500/30",
  "bg-blue-900/40 border-blue-500/30",
  "bg-yellow-900/40 border-yellow-500/30",
  "bg-orange-900/40 border-orange-500/30",
  "bg-red-900/40 border-red-500/30",
  "bg-purple-900/40 border-purple-500/30",
];

export default function AdminDeslocacoes() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Tabela de Preços de Deslocação</h1>
          <p className="text-white/40 text-sm">Kyro Clean Solutions · Uso interno · 3 equipas locais, 3 sistemas de zonas independentes</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6 text-sm text-white/50">
          A deslocação é sempre o preço fixo da zona. <strong className="text-white/70">Nunca é gratuita nem varia</strong> com o valor do pedido: mínimo 10€, sobe quanto mais afastado do centro de cada equipa.
        </div>

        {REGIONS.map(region => {
          const regionCities = cities.filter(c => c.area === region.area);
          const byPrice = regionCities.reduce<Record<number, string[]>>((acc, c) => {
            const price = locationPrices[c.name] ?? 0;
            if (!acc[price]) acc[price] = [];
            acc[price].push(c.name);
            return acc;
          }, {});
          const prices = Object.keys(byPrice).map(Number).sort((a, b) => a - b);

          return (
            <div key={region.area} className="mb-8">
              <h2 className={`text-sm font-bold uppercase tracking-wide mb-3 border-b pb-2 ${region.color} text-white/80`}>
                {region.label} <span className="text-white/40 font-normal">({regionCities.length} concelhos)</span>
              </h2>
              <div className="space-y-3">
                {prices.map((price, i) => (
                  <div key={price} className={`border rounded-xl p-4 ${ZONE_COLORS[i % ZONE_COLORS.length]}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-white/90 text-sm">Zona {i}</span>
                      <span className="font-mono font-bold text-base text-gold">{price}€</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {byPrice[price].map((city) => (
                        <span key={city} className="bg-white/[0.07] border border-white/10 rounded-full px-3 py-1 text-xs text-white/70">
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-8 bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Cidade</th>
                <th className="text-right px-4 py-3">Deslocação</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(locationPrices).map(([city, price]) => (
                <tr key={city} className="border-b border-white/[0.05] hover:bg-white/[0.03]">
                  <td className="px-4 py-2.5 text-white/80">{city}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-medium text-gold">{price}€</td>
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
