import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Crown, Calendar, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendChart } from '@/components/charts/TrendChart';
import { BarChart } from '@/components/charts/BarChart';
import { EmptyState } from '@/components/ui/States';
import { CategoryIcon } from '@/components/CategoryIcon';
import {
  formatCurrency, monthKey, expensesForMonth, sumAmount, groupByCategory,
  lastNMonthKeys, shortMonthLabel, monthLabel, CATEGORY_META,
} from '@/lib/utils';
import type { Category } from '@/lib/types';
import { cn } from '@/components/utils';

export function AnalyticsPage() {
  const { expenses, loading } = useStore();
  const currentKey = monthKey(new Date());

  const last6 = useMemo(() => {
    const keys = lastNMonthKeys(6);
    return keys.map((k) => ({ label: k, value: sumAmount(expensesForMonth(expenses, k)) }));
  }, [expenses]);

  const monthOverMonth = useMemo(() => {
    if (last6.length < 2) return null;
    const cur = last6[last6.length - 1].value;
    const prev = last6[last6.length - 2].value;
    if (prev === 0) return null;
    return ((cur - prev) / prev) * 100;
  }, [last6]);

  const avgMonthly = useMemo(() => {
    const total = last6.reduce((a, d) => a + d.value, 0);
    return total / last6.length;
  }, [last6]);

  const allTimeTotal = useMemo(() => sumAmount(expenses), [expenses]);

  const categoryAllTime = useMemo(() => {
    const grouped = groupByCategory(expenses);
    return (Object.entries(grouped) as [Category, number][])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const topCategory = categoryAllTime[0] ?? null;
  const topCategoryShare = topCategory && allTimeTotal > 0
    ? (topCategory[1] / allTimeTotal) * 100
    : 0;

  const monthlyCategories = useMemo(() => {
    const keys = lastNMonthKeys(6);
    return keys.map((k) => {
      const grouped = groupByCategory(expensesForMonth(expenses, k));
      const top = (Object.entries(grouped) as [Category, number][])
        .sort((a, b) => b[1] - a[1])[0];
      return { key: k, top: top && top[1] > 0 ? top[0] : null, total: sumAmount(expensesForMonth(expenses, k)) };
    });
  }, [expenses]);

  const busiestMonth = useMemo(() => {
    return [...last6].sort((a, b) => b.value - a.value)[0] ?? null;
  }, [last6]);

  const quietestMonth = useMemo(() => {
    const nonZero = last6.filter((d) => d.value > 0);
    return [...nonZero].sort((a, b) => a.value - b.value)[0] ?? null;
  }, [last6]);

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-ink-400">Loading analytics…</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <Card>
          <EmptyState
            icon={<Activity size={24} />}
            title="No data to analyze yet"
            description="Add some expenses and your spending insights will appear here."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      {/* Insight cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          label="Avg Monthly Spend"
          value={formatCurrency(avgMonthly)}
          icon={<TrendingUp size={18} />}
          tone="primary"
          sublabel="Last 6 months"
        />
        <InsightCard
          label="Month-over-Month"
          value={monthOverMonth !== null ? `${monthOverMonth > 0 ? '+' : ''}${monthOverMonth.toFixed(1)}%` : '—'}
          icon={monthOverMonth !== null && monthOverMonth >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          tone={monthOverMonth !== null && monthOverMonth >= 0 ? 'danger' : 'success'}
          sublabel={`vs ${shortMonthLabel(last6[last6.length - 2]?.label ?? currentKey)}`}
        />
        <InsightCard
          label="Top Category"
          value={topCategory ? topCategory[0] : '—'}
          icon={<Crown size={18} />}
          tone="warning"
          sublabel={topCategory ? `${topCategoryShare.toFixed(0)}% of all spending` : 'No data'}
        />
        <InsightCard
          label="All-Time Spending"
          value={formatCurrency(allTimeTotal)}
          icon={<Calendar size={18} />}
          tone="accent"
          sublabel={`${expenses.length} transactions`}
        />
      </div>

      {/* Trend chart */}
      <Card>
        <CardHeader
          title="Spending Trend"
          subtitle="Last 6 months"
          icon={<TrendingUp size={16} />}
          action={
            monthOverMonth !== null && (
              <Badge tone={monthOverMonth >= 0 ? 'danger' : 'success'} dot>
                {monthOverMonth >= 0 ? 'Up' : 'Down'} {Math.abs(monthOverMonth).toFixed(0)}%
              </Badge>
            )
          }
        />
        <div className="px-5 py-6">
          <TrendChart data={last6} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Category bars */}
        <Card>
          <CardHeader title="Category Ranking" subtitle="All-time spending by category" icon={<Crown size={16} />} />
          <div className="px-5 py-5">
            <div className="space-y-4">
              {categoryAllTime.map(([cat, val], i) => {
                const meta = CATEGORY_META[cat];
                const pct = allTimeTotal > 0 ? (val / allTimeTotal) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold',
                          i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-ink-100 text-ink-500',
                        )}>
                          {i + 1}
                        </span>
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-lg"
                          style={{ background: `${meta.color}1a`, color: meta.color }}
                        >
                          <CategoryIcon name={meta.icon} size={14} />
                        </span>
                        <span className="text-sm font-medium text-ink-700">{cat}</span>
                        {i === 0 && <Badge tone="warning" className="ml-1">Top</Badge>}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-ink-900">{formatCurrency(val)}</span>
                        <span className="ml-2 text-xs text-ink-400">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Monthly highlights */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Monthly Highlights" subtitle="Your spending patterns" icon={<Activity size={16} />} />
            <div className="divide-y divide-ink-100">
              <HighlightRow
                icon={<TrendingUp size={16} />}
                label="Highest spending month"
                value={busiestMonth ? `${monthLabel(busiestMonth.label)}` : '—'}
                detail={busiestMonth ? formatCurrency(busiestMonth.value) : ''}
                tone="text-red-500"
              />
              <HighlightRow
                icon={<TrendingDown size={16} />}
                label="Lowest spending month"
                value={quietestMonth ? `${monthLabel(quietestMonth.label)}` : '—'}
                detail={quietestMonth ? formatCurrency(quietestMonth.value) : ''}
                tone="text-primary-600"
              />
              <HighlightRow
                icon={<Crown size={16} />}
                label="Most consistent top category"
                value={topCategory ? topCategory[0] : '—'}
                detail={topCategory ? `${topCategoryShare.toFixed(0)}% of total` : ''}
                tone="text-amber-500"
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Top Category per Month" subtitle="What you spent most on" icon={<Calendar size={16} />} />
            <div className="divide-y divide-ink-100">
              {monthlyCategories.map((m) => {
                const meta = m.top ? CATEGORY_META[m.top] : null;
                return (
                  <div key={m.key} className="flex items-center justify-between px-5 py-2.5">
                    <span className="text-xs font-medium text-ink-500">{monthLabel(m.key)}</span>
                    <div className="flex items-center gap-2">
                      {m.top && meta ? (
                        <>
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-md"
                            style={{ background: `${meta.color}1a`, color: meta.color }}
                          >
                            <CategoryIcon name={meta.icon} size={13} />
                          </span>
                          <span className="text-xs font-semibold text-ink-700">{m.top}</span>
                        </>
                      ) : (
                        <span className="text-xs text-ink-400">No spending</span>
                      )}
                      <span className="text-xs font-medium text-ink-500">{formatCurrency(m.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Monthly bar comparison */}
      <Card>
        <CardHeader title="Monthly Comparison" subtitle="Total spending per month" icon={<TrendingUp size={16} />} />
        <div className="px-5 py-6">
          <BarChart data={last6} height={200} />
        </div>
      </Card>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">Analytics</h1>
      <p className="mt-1 text-sm text-ink-500">Understand your spending trends and patterns.</p>
    </div>
  );
}

function InsightCard({
  label, value, icon, tone, sublabel,
}: {
  label: string; value: string; icon: React.ReactNode; tone: 'primary' | 'danger' | 'success' | 'warning' | 'accent'; sublabel: string;
}) {
  const tones = {
    primary: 'bg-primary-50 text-primary-600 ring-primary-100',
    danger: 'bg-red-50 text-red-500 ring-red-100',
    success: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    warning: 'bg-amber-50 text-amber-600 ring-amber-100',
    accent: 'bg-blue-50 text-blue-600 ring-blue-100',
  };
  return (
    <Card hover className="animate-slide-up p-5">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl ring-4', tones[tone])}>
        {icon}
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-ink-400">{sublabel}</p>
    </Card>
  );
}

function HighlightRow({
  icon, label, value, detail, tone,
}: {
  icon: React.ReactNode; label: string; value: string; detail: string; tone: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50', tone)}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-400">{label}</p>
        <p className="text-sm font-semibold text-ink-800">{value}</p>
      </div>
      <span className="shrink-0 text-sm font-semibold text-ink-700">{detail}</span>
    </div>
  );
}
