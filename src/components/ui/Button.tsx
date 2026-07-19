import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button({ children, className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: Variant }) {
  const variants: Record<Variant, string> = {
    primary: 'pressable bg-[var(--accent)] text-[#102007] font-extrabold',
    secondary: 'bg-[#222c37] text-white border border-[#34404d] hover:bg-[#293542]',
    danger: 'bg-[#ff4b4b] text-white hover:bg-[#ff6262]',
    ghost: 'bg-transparent text-[#aab7c4] hover:bg-[#202933] hover:text-white',
  };

  return (
    <button className={cn('inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50', variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
