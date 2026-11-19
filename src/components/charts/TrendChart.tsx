import { useState } from 'react';
import { formatCurrency, shortMonthLabel } from '@/lib/utils';

interface TrendPoint {
  label: string;
  value: number;
}

export function TrendChart({ data, height = 240 }: { data: TrendPoint[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 100;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * width;
    const y = 10 + (1 - (d.value - min) / range) * (height - 40);
    return { ...d, x, y };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');
  const areaD = `${pathD} L ${points[points.length - 1]?.x ?? 0} ${height - 30} L ${points[0]?.x ?? 0} ${height - 30} Z`;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={width}
            y1={10 + f * (height - 40)}
            y2={10 + f * (height - 40)}
            stroke="#e2e8f0"
            strokeWidth="0.3"
            strokeDasharray="1 1"
          />
        ))}
        <path d={areaD} fill="url(#trendFill)" />
        <path d={pathD} fill="none" stroke="#10b981" strokeWidth="0.8" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 1.6 : 1}
              fill="#10b981"
              stroke="white"
              strokeWidth="0.5"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            {hover === i && (
              <circle cx={p.x} cy={p.y} r="3" fill="#10b981" opacity="0.2" />
            )}
          </g>
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex justify-around">
        {data.map((d, i) => (
          <button
            key={i}
            className="flex flex-col items-center pt-1"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="text-[11px] font-medium text-ink-500">{shortMonthLabel(d.label)}</span>
          </button>
        ))}
      </div>
      {hover !== null && points[hover] && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
          style={{
            left: `${points[hover].x}%`,
            top: points[hover].y - 4,
          }}
        >
          {formatCurrency(points[hover].value)}
        </div>
      )}
    </div>
  );
}
