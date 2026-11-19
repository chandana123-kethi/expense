import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/components/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: 'primary' | 'accent' | 'warning' | 'danger' | 'neutral';
  trend?: { value: string; positive: boolean } | null;
  sublabel?: string;
}

const toneStyles = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-100' },
  accent: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
  danger: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100' },
  neutral: { bg: 'bg-ink-100', text: 'text-ink-600', ring: 'ring-ink-200' },
};

export function StatCard({ label, value, icon, tone = 'primary', trend, sublabel }: StatCardProps) {
  const s = toneStyles[tone];
  return (
    <Card hover className="animate-slide-up p-5">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl ring-4', s.bg, s.text, s.ring)}>
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-ink-900">{value}</p>
        {sublabel && <p className="mt-1 text-xs text-ink-400">{sublabel}</p>}
      </div>
    </Card>
  );
}
