import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shared visual endorsement for optional services, independent of selection. */
export default function QuizTopBadge({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn(
      'pointer-events-none inline-flex shrink-0 items-center justify-center gap-1 rounded-[5px] border border-[#f3df9b] bg-gradient-to-br from-[#f7e6ad] via-[#d6b956] to-[#b89132] px-2 py-1 text-[#26301b] shadow-[0_2px_6px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.2)]',
      className
    )}>
      <Crown aria-hidden="true" className="h-3 w-3" strokeWidth={1.8} />
      <span className="text-sm font-black leading-none tracking-[0.12em]">TOP</span>
    </span>
  );
}
