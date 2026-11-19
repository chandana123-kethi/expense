import { useMemo, useState } from 'react';
import { Wallet, TrendingDown, Receipt, PiggyBank, Plus, ArrowRight, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/StatCard';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { EmptyState } from '@/components/ui/States';
import { ExpenseForm } from '@/components/ExpenseForm';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { ExpenseInput } from '@/lib/types';
import {
  formatCurrency, formatDate, monthLabel, monthKey, expensesForMonth,
  sumAmount, groupByCategory, lastNMonthKeys, CATEGORY_META,
} from '@/lib/utils';
import type { PageKey } from '@/components/layout/Sidebar';

export function DashboardPage({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { expenses, budgets, loading, addExpense } = useStore();
  const currentKey = monthKey(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const monthExpenses = useMemo(() => expensesForMonth(expenses, currentKey), [expenses, currentKey]);
  const monthTotal = useMemo(() => sumAmount(monthExpenses), [monthExpenses]);
  const budget = budgets.find((b) => b.month_key === currentKey);
  const budgetAmount = budget?.amount ?? 0;
  const remaining = budgetAmount - monthTotal;
  const utilization = budgetAmount > 0 ? (monthTotal / budgetAmount) * 100 : 0;

  const last6 = useMemo(() => {
    const keys = lastNMonthKeys(6);
    return keys.map((k) => ({ label: k, value: sumAmount(expensesForMonth(expenses, k)) }));
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const grouped = groupByCategory(monthExpenses);
    return Object.entries(grouped)
      .map(([cat, val]) => ({
        label: cat,
        value: val,
        color: CATEGORY_META[cat as keyof typeof CATEGORY_META].color,
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses]);

  const recent = useMemo(() => expenses.slice(0, 5), [expenses]);

  const handleSubmit = async (input: ExpenseInput) => {
    setSaving(true);
    try {
      await addExpense(input);
      setFormOpen(false);
    } catch {
      // error shown via store
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-ink-400">Loading your dashboard…</div>;
  }

  const overBudget = budgetAmount > 0 && monthTotal > budgetAmount;
  const nearBudget = budgetAmount > 0 && utilization >= 80 && !overBudget;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">{monthLabel(currentKey)} overview of your spending.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} /> Add Expense
        </Button>
      </div>

      {/* Budget alert */}
      {(overBudget || nearBudget) && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm animate-slide-up ${
            overBudget
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          <AlertTriangle size={18} className="shrink-0" />
          <span>
            {overBudget
              ? `You've exceeded your ${monthLabel(currentKey)} budget by ${formatCurrency(monthTotal - budgetAmount)}.`
              : `You've used ${utilization.toFixed(0)}% of your ${monthLabel(currentKey)} budget. Consider slowing down.`}
          </span>
          <button
            onClick={() => onNavigate('budget')}
            className="ml-auto shrink-0 font-semibold underline underline-offset-2"
          >
            Review
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Expenses"
          value={formatCurrency(monthTotal)}
          icon={<TrendingDown size={20} />}
          tone="primary"
          sublabel={`${monthExpenses.length} transaction${monthExpenses.length === 1 ? '' : 's'} this month`}
        />
        <StatCard
          label="Monthly Budget"
          value={formatCurrency(budgetAmount)}
          icon={<Wallet size={20} />}
          tone="accent"
          sublabel={budget ? monthLabel(currentKey) : 'No budget set'}
        />
        <StatCard
          label="Remaining Balance"
          value={formatCurrency(remaining)}
          icon={<PiggyBank size={20} />}
          tone={overBudget ? 'danger' : remaining < 0 ? 'danger' : 'primary'}
          sublabel={budgetAmount > 0 ? `${(100 - utilization).toFixed(0)}% of budget left` : 'Set a budget to track'}
        />
        <StatCard
          label="Transactions"
          value={String(expenses.length)}
          icon={<Receipt size={20} />}
          tone="neutral"
          sublabel="All time records"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Monthly Spending" subtitle="Last 6 months" icon={<TrendingDown size={16} />} />
          <div className="px-5 py-6">
            <BarChart data={last6} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Category Breakdown" subtitle={monthLabel(currentKey)} icon={<Receipt size={16} />} />
          <div className="px-5 py-6">
            {categoryBreakdown.length === 0 ? (
              <EmptyState title="No spending yet" description="Add an expense to see your category breakdown." />
            ) : (
              <DonutChart data={categoryBreakdown} />
            )}
          </div>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader
          title="Recent Transactions"
          subtitle="Your latest activity"
          icon={<Receipt size={16} />}
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('transactions')}>
              View all <ArrowRight size={14} />
            </Button>
          }
        />
        <div className="divide-y divide-ink-100">
          {recent.length === 0 ? (
            <EmptyState
              icon={<Receipt size={24} />}
              title="No transactions yet"
              description="Start tracking by adding your first expense."
              action={<Button onClick={() => setFormOpen(true)}><Plus size={15} /> Add Expense</Button>}
            />
          ) : (
            recent.map((e) => {
              const meta = CATEGORY_META[e.category];
              return (
                <div key={e.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink-50/60">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${meta.color}1a`, color: meta.color }}
                  >
                    <CategoryIcon name={meta.icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-800">{e.title}</p>
                    <p className="text-xs text-ink-400">
                      {formatDate(e.expense_date)} · {e.payment_method}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge tone="default" className="hidden sm:inline-flex">{e.category}</Badge>
                    <span className="text-sm font-semibold text-ink-900">-{formatCurrency(Number(e.amount))}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <ExpenseForm
        open={formOpen}
        title="Add Expense"
        submitLabel="Add Expense"
        loading={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
