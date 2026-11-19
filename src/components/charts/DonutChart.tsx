import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ data, size = 200 }: { data: DonutDatum[]; size?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((a, d) => a + d.value, 0);
  const radius = size / 2 - 18;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const fraction = d.value / total;
      const dash = fraction * circumference;
      const seg = {
        ...d,
        dash,
        offset: offset * circumference,
        fraction,
      };
      offset += fraction;
      return seg;
    });

  const hovered = hover !== null ? segments[hover] : null;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={22} />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={hover === i ? 28 : 22}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-200"
              style={{ opacity: hover === null || hover === i ? 1 : 0.35 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {hovered ? (
            <>
              <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                {hovered.label}
              </span>
              <span className="mt-0.5 text-lg font-bold text-ink-900">
                {formatCurrency(hovered.value)}
              </span>
              <span className="text-[11px] text-ink-400">
                {((hovered.fraction ?? 0) * 100).toFixed(0)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                Total
              </span>
              <span className="mt-0.5 text-lg font-bold text-ink-900">
                {formatCurrency(total)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <button
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-ink-50"
              onMouseEnter={() => d.value > 0 && setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                <span className="truncate text-xs font-medium text-ink-600">{d.label}</span>
              </div>
              <span className="shrink-0 text-xs font-semibold text-ink-800">
                {pct.toFixed(0)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
