import type { Category, Expense } from '@/lib/types';
import { CATEGORY_META } from '@/lib/types';

export { CATEGORY_META };

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function monthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export function shortMonthLabel(key: string): string {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short' });
}

export function isSameMonth(iso: string, key: string): boolean {
  return iso.slice(0, 7) === key;
}

export function expensesForMonth(expenses: Expense[], key: string): Expense[] {
  return expenses.filter((e) => isSameMonth(e.expense_date, key));
}

export function sumAmount(expenses: Expense[]): number {
  return expenses.reduce((acc, e) => acc + Number(e.amount), 0);
}

export function groupByCategory(expenses: Expense[]): Record<Category, number> {
  const base = {
    Food: 0, Travel: 0, Shopping: 0, Entertainment: 0,
    Healthcare: 0, Education: 0, Others: 0,
  } as Record<Category, number>;
  for (const e of expenses) {
    base[e.category] += Number(e.amount);
  }
  return base;
}

export function lastNMonthKeys(n: number, anchor: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
