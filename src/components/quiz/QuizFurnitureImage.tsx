import { cn } from '@/lib/utils';

const positions = { sofa: '100% 0%', mattress: '0% 0%', chairs: '0% 100%', carpet: '100% 100%' };

export default function QuizFurnitureImage({ service, className }: { service: keyof typeof positions; className?: string }) {
  return <span aria-hidden="true" className={cn('block w-12 h-12 sm:w-14 sm:h-14 shrink-0', className)}
    style={{ backgroundImage: 'url(/images/services/quote-furniture.png)', backgroundSize: '200% 200%', backgroundPosition: positions[service] }} />;
}
