import { cn } from '@/lib/utils';

const positions = { sofa: '100% 0%', mattress: '0% 0%', chairs: '0% 100%', carpet: '100% 100%' };
const sofaPositions: Record<string, string> = { '1-lugar': '0% 0%', '2-lugares': '100% 0%', '3-lugares': '0% 100%', '4+-lugares': '100% 100%' };
const mattressCrops: Record<string, { width: number; start: number }> = { solteiro: { width: 600, start: 0 }, casal: { width: 760, start: 600 }, king: { width: 812, start: 1360 } };

export default function QuizFurnitureImage({ service, sizeId, className }: { service: keyof typeof positions; sizeId?: string; className?: string }) {
  const sofaSize = service === 'sofa' && sizeId ? sofaPositions[sizeId] : undefined;
  const mattressSize = service === 'mattress' && sizeId ? mattressCrops[sizeId] : undefined;
  const asset = sofaSize ? 'quote-sofa-sizes.png' : mattressSize ? 'quote-mattress-sizes.png' : 'quote-furniture.png';
  if (mattressSize) {
    return <span aria-hidden="true" className={cn('flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 shrink-0', className)}>
      <span className="block h-full bg-no-repeat" style={{ width: `${mattressSize.width / 812 * 100}%`, backgroundImage: `url(/images/services/${asset})`, backgroundSize: `${2172 / mattressSize.width * 100}% ${724 / 812 * 100}%`, backgroundPosition: `${mattressSize.start / (2172 - mattressSize.width) * 100}% 50%` }} />
    </span>;
  }
  return <span aria-hidden="true" className={cn('block w-12 h-12 sm:w-14 sm:h-14 shrink-0', className)}
    style={{ backgroundImage: `url(/images/services/${asset})`, backgroundSize: '200% 200%', backgroundPosition: sofaSize || positions[service] }} />;
}
