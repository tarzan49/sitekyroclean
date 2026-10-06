import { cn } from '@/lib/utils';

const positions = { sofa: '100% 0%', mattress: '0% 0%', chairs: '0% 100%', carpet: '100% 100%' };
// O sprite só tem quatro sofás (1, 2, 3 e 4 lugares). O tamanho maior
// ('4+-lugares': 5 ou mais lugares, em U ou modular) usa o de 4 lugares com um
// selo "5+", para não ficarem duas imagens iguais lado a lado sem diferença.
const sofaPositions: Record<string, string> = { '1-lugar': '0% 0%', '2-lugares': '100% 0%', '3-lugares': '0% 100%', '4-lugares': '100% 100%', '4+-lugares': '100% 100%' };
const sofaBadges: Record<string, string> = { '4+-lugares': '5+' };
const mattressCrops: Record<string, { width: number; start: number }> = { solteiro: { width: 600, start: 0 }, casal: { width: 760, start: 600 }, king: { width: 812, start: 1360 } };

export default function QuizFurnitureImage({ service, sizeId, className }: { service: keyof typeof positions; sizeId?: string; className?: string }) {
  const sofaSize = service === 'sofa' && sizeId ? sofaPositions[sizeId] : undefined;
  const mattressSize = service === 'mattress' && sizeId ? mattressCrops[sizeId] : undefined;
  const asset = sofaSize ? 'quote-sofa-sizes.webp' : mattressSize ? 'quote-mattress-sizes.webp' : 'quote-furniture.webp';
  if (mattressSize) {
    return <span aria-hidden="true" className={cn('flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 shrink-0', className)}>
      <span className="block h-full bg-no-repeat" style={{ width: `${mattressSize.width / 812 * 100}%`, backgroundImage: `url(/images/services/${asset})`, backgroundSize: `${2172 / mattressSize.width * 100}% ${724 / 812 * 100}%`, backgroundPosition: `${mattressSize.start / (2172 - mattressSize.width) * 100}% 50%` }} />
    </span>;
  }
  const badge = sofaSize && sizeId ? sofaBadges[sizeId] : undefined;
  return <span aria-hidden="true" className={cn('relative block w-12 h-12 sm:w-14 sm:h-14 shrink-0', className)}
    style={{ backgroundImage: `url(/images/services/${asset})`, backgroundSize: '200% 200%', backgroundPosition: sofaSize || positions[service] }}>
    {badge && <span className="absolute right-0 top-0 rounded-sm bg-[#D4AF37] px-1 text-[10px] font-bold leading-[14px] text-black">{badge}</span>}
  </span>;
}
