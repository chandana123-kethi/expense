import { useState } from 'react';
import { formatCurrency, shortMonthLabel } from '@/lib/utils';

interface BarDatum {
  label: string;
  value: number;
}

export function BarChart({ data, height = 220 }: { data: BarDatum[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="relative" style={{ height }}>
      <div className="absolute inset-0 flex flex-col justify-between">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-t border-dashed border-ink-100" />
        ))}
      </div>
      <div className="relative flex h-full items-end justify-around gap-2 px-1">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const active = hover === i;
          return (
            <div
              key={i}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {active && (
                <div className="absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
                  {formatCurrency(d.value)}
                </div>
              )}
              <div
                className="chart-bar w-full max-w-[36px] rounded-t-md transition-all duration-200"
                style={{
                  height: `${Math.max(pct, 1)}%`,
                  background:
                    active || hover === null
                      ? 'linear-gradient(180deg, #34d399 0%, #10b981 100%)'
                      : 'linear-gradient(180deg, #6ee7b7 0%, #34d399 100%)',
                  opacity: hover === null || active ? 1 : 0.55,
                }}
              />
              <span className="mt-2 text-[11px] font-medium text-ink-500">
                {shortMonthLabel(d.label)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
