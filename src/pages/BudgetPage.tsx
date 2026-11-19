import { useMemo, useState } from 'react';
import { Wallet, AlertTriangle, CheckCircle2, TrendingUp, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field, Input } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/States';
import { CategoryIcon } from '@/components/CategoryIcon';
import {
  formatCurrency, monthLabel, expensesForMonth, sumAmount,
  groupByCategory, lastNMonthKeys, shortMonthLabel, CATEGORY_META, clamp,
} from '@/lib/utils';
import type { Category } from '@/lib/types';
import { cn } from '@/components/utils';

export function BudgetPage() {
  const { expenses, budgets, setBudget } = useStore();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [amountStr, setAmountStr] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const monthExpenses = useMemo(() => expensesForMonth(expenses, currentKey), [expenses, currentKey]);
  const spent = useMemo(() => sumAmount(monthExpenses), [monthExpenses]);
  const budget = budgets.find((b) => b.month_key === currentKey);
  const limit = budget?.amount ?? 0;
  const remaining = limit - spent;
  const utilization = limit > 0 ? clamp((spent / limit) * 100, 0, 999) : 0;
  const overBudget = limit > 0 && spent > limit;
  const nearBudget = limit > 0 && utilization >= 80 && !overBudget;

  const categoryBreakdown = useMemo(() => {
    const grouped = groupByCategory(monthExpenses);
    return (Object.entries(grouped) as [Category, number][])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [monthExpenses]);

  const history = useMemo(() => {
    const keys = lastNMonthKeys(6, new Date(viewYear, viewMonth, 1));
    return keys.map((k) => {
      const b = budgets.find((x) => x.month_key === k);
      const s = sumAmount(expensesForMonth(expenses, k));
      return { key: k, budget: b?.amount ?? 0, spent: s };
    });
  }, [budgets, expenses, viewYear, viewMonth]);

  const shiftMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
    setAmountStr('');
    setSaved(false);
  };

  const handleSave = async () => {
    const amt = Number(amountStr);
    if (!amountStr || isNaN(amt) || amt < 0) return;
    setSaving(true);
    setSaved(false);
    try {
      await setBudget(currentKey, Math.round(amt * 100) / 100);
      setAmountStr('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // surfaced via store
    } finally {
      setSaving(false);
    }
  };

  const progressColor = overBudget
    ? 'bg-red-500'
    : nearBudget
      ? 'bg-amber-500'
      : 'bg-primary-500';

  const statusBadge = overBudget
    ? <Badge tone="danger" dot>Over budget</Badge>
    : nearBudget
      ? <Badge tone="warning" dot>Approaching limit</Badge>
      : limit > 0
        ? <Badge tone="success" dot>On track</Badge>
        : <Badge tone="default">No budget</Badge>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">Budget</h1>
          <p className="mt-1 text-sm text-ink-500">Set monthly limits and monitor your spending.</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1">
          <button
            onClick={() => shiftMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-ink-700">
            {monthLabel(currentKey)}
          </span>
          <button
            onClick={() => shiftMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Budget overview + setter */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Monthly Budget"
            subtitle={monthLabel(currentKey)}
            icon={<Wallet size={16} />}
            action={statusBadge}
          />
          <div className="px-5 py-6">
            {/* Progress ring */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
              <ProgressRing
                value={limit > 0 ? Math.min(utilization, 100) : 0}
                over={overBudget}
                near={nearBudget}
                label={limit > 0 ? `${utilization.toFixed(0)}%` : '—'}
                sublabel={limit > 0 ? 'used' : 'no budget'}
              />
              <div className="grid w-full grid-cols-3 gap-4">
                <Stat label="Budget" value={formatCurrency(limit)} tone="text-ink-900" />
                <Stat label="Spent" value={formatCurrency(spent)} tone="text-amber-600" />
                <Stat
                  label="Remaining"
                  value={formatCurrency(remaining)}
                  tone={overBudget ? 'text-red-500' : 'text-primary-600'}
                />
              </div>
            </div>

            {/* Progress bar */}
            {limit > 0 && (
              <div className="mt-6">
                <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', progressColor)}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-ink-400">
                  <span>{formatCurrency(0)}</span>
                  <span>{formatCurrency(limit)}</span>
                </div>
              </div>
            )}

            {/* Alerts */}
            {overBudget && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <span>You've exceeded your budget by <strong>{formatCurrency(spent - limit)}</strong>. Consider reviewing your spending.</span>
              </div>
            )}
            {nearBudget && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <span>You've used <strong>{utilization.toFixed(0)}%</strong> of your budget. Only <strong>{formatCurrency(remaining)}</strong> left.</span>
              </div>
            )}
            {limit > 0 && !overBudget && !nearBudget && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>You're on track. <strong>{formatCurrency(remaining)}</strong> remaining for {monthLabel(currentKey)}.</span>
              </div>
            )}

            {/* Set budget */}
            <div className="mt-6 border-t border-ink-100 pt-5">
              <Field
                label={budget ? 'Update Budget' : 'Set Budget'}
                hint={budget ? `Current budget is ${formatCurrency(limit)}` : 'No budget set for this month yet.'}
              >
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-400">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountStr}
                      onChange={(e) => { setAmountStr(e.target.value); setSaved(false); }}
                      placeholder={budget ? String(limit) : '0.00'}
                      className="pl-7"
                    />
                  </div>
                  <Button onClick={handleSave} loading={saving} disabled={!amountStr || Number(amountStr) < 0}>
                    {budget ? 'Update' : 'Save'}
                  </Button>
                </div>
              </Field>
              {saved && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary-600">
                  <CheckCircle2 size={14} /> Budget saved successfully.
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Category spending */}
        <Card>
          <CardHeader title="Spending by Category" subtitle={monthLabel(currentKey)} icon={<Target size={16} />} />
          <div className="px-5 py-4">
            {categoryBreakdown.length === 0 ? (
              <EmptyState title="No spending" description="No expenses recorded for this month yet." />
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map(([cat, val]) => {
                  const meta = CATEGORY_META[cat];
                  const pct = spent > 0 ? (val / spent) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-lg"
                            style={{ background: `${meta.color}1a`, color: meta.color }}
                          >
                            <CategoryIcon name={meta.icon} size={14} />
                          </span>
                          <span className="text-xs font-medium text-ink-700">{cat}</span>
                        </div>
                        <span className="text-xs font-semibold text-ink-800">{formatCurrency(val)}</span>
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
            )}
          </div>
        </Card>
      </div>

      {/* 6-month budget history */}
      <Card>
        <CardHeader title="Budget vs Spending" subtitle="Last 6 months" icon={<TrendingUp size={16} />} />
        <div className="px-5 py-6">
          <div className="grid grid-cols-6 gap-2 sm:gap-4">
            {history.map((h) => {
              const util = h.budget > 0 ? (h.spent / h.budget) * 100 : 0;
              const over = h.budget > 0 && h.spent > h.budget;
              return (
                <div key={h.key} className="flex flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end justify-center gap-1 rounded-lg bg-ink-50/60 px-1 py-2">
                    {/* budget bar */}
                    <div className="relative flex h-full w-1/2 max-w-[14px] items-end">
                      <div
                        className="w-full rounded-t bg-ink-200 transition-all"
                        style={{ height: h.budget > 0 ? '100%' : '4px' }}
                        title={`Budget: ${formatCurrency(h.budget)}`}
                      />
                    </div>
                    {/* spent bar */}
                    <div className="relative flex h-full w-1/2 max-w-[14px] items-end">
                      <div
                        className={cn('w-full rounded-t transition-all', over ? 'bg-red-500' : 'bg-primary-500')}
                        style={{ height: h.budget > 0 ? `${Math.min(util, 100)}%` : `${Math.min(h.spent / 500, 100)}%` }}
                        title={`Spent: ${formatCurrency(h.spent)}`}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-ink-500">{shortMonthLabel(h.key)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-5 text-xs text-ink-500">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-ink-200" /> Budget</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary-500" /> Spent</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Overspent</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ProgressRing({ value, over, near, label, sublabel }: { value: number; over: boolean; near: boolean; label: string; sublabel: string }) {
  const size = 160;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (value / 100) * circ;
  const color = over ? '#ef4444' : near ? '#f59e0b' : '#10b981';
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-ink-900">{label}</span>
        <span className="text-xs text-ink-400">{sublabel}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl bg-ink-50/60 px-3 py-3 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className={cn('mt-1 text-sm font-bold', tone)}>{value}</p>
    </div>
  );
}
