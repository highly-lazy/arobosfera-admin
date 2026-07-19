import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Badge({ children, tone = 'green', className }: { children: ReactNode; tone?: 'green' | 'blue' | 'yellow' | 'red' | 'gray' | 'purple'; className?: string }) {
  const tones = {
    green: 'bg-[#58cc02]/15 text-[#76e536] border-[#58cc02]/25',
    blue: 'bg-[#1cb0f6]/15 text-[#55c7ff] border-[#1cb0f6]/25',
    yellow: 'bg-[#ffc800]/15 text-[#ffd84e] border-[#ffc800]/25',
    red: 'bg-[#ff4b4b]/15 text-[#ff7676] border-[#ff4b4b]/25',
    gray: 'bg-[#303945] text-[#b4c0cc] border-[#3b4653]',
    purple: 'bg-[#ce82ff]/15 text-[#ddb0ff] border-[#ce82ff]/25',
  };
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold', tones[tone], className)}>{children}</span>;
}
