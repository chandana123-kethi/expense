import type { ReactNode } from 'react';
import { cn } from '@/components/utils';

type Tone = 'default' | 'primary' | 'warning' | 'danger' | 'success' | 'info';

const tones: Record<Tone, string> = {
  default: 'bg-ink-100 text-ink-600',
  primary: 'bg-primary-50 text-primary-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-600',
  success: 'bg-emerald-50 text-emerald-700',
  info: 'bg-blue-50 text-blue-600',
};

export function Badge({
  children,
  tone = 'default',
  className,
  dot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
