import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { Budget, Expense, ExpenseInput } from '@/lib/types';
import { monthKey } from '@/lib/utils';

interface StoreContextValue {
  expenses: Expense[];
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  addExpense: (input: ExpenseInput) => Promise<void>;
  updateExpense: (id: string, input: ExpenseInput) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setBudget: (monthKeyStr: string, amount: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [exp, bud] = await Promise.all([
      supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
      supabase.from('budgets').select('*').order('month_key', { ascending: false }),
    ]);
    if (exp.error) {
      setError(exp.error.message);
    } else if (bud.error) {
      setError(bud.error.message);
    }
    setExpenses((exp.data as Expense[]) ?? []);
    setBudgets((bud.data as Budget[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addExpense = useCallback(async (input: ExpenseInput) => {
    const { error: err } = await supabase.from('expenses').insert(input);
    if (err) throw new Error(err.message);
    await load();
  }, [load]);

  const updateExpense = useCallback(async (id: string, input: ExpenseInput) => {
    const { error: err } = await supabase.from('expenses').update(input).eq('id', id);
    if (err) throw new Error(err.message);
    await load();
  }, [load]);

  const deleteExpense = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('expenses').delete().eq('id', id);
    if (err) throw new Error(err.message);
    await load();
  }, [load]);

  const setBudget = useCallback(async (monthKeyStr: string, amount: number) => {
    const existing = budgets.find((b) => b.month_key === monthKeyStr);
    if (existing) {
      const { error: err } = await supabase
        .from('budgets')
        .update({ amount })
        .eq('id', existing.id);
      if (err) throw new Error(err.message);
    } else {
      const { error: err } = await supabase
        .from('budgets')
        .insert({ month_key: monthKeyStr, amount });
      if (err) throw new Error(err.message);
    }
    await load();
  }, [budgets, load]);

  const value = useMemo<StoreContextValue>(
    () => ({
      expenses,
      budgets,
      loading,
      error,
      addExpense,
      updateExpense,
      deleteExpense,
      setBudget,
      refresh: load,
    }),
    [expenses, budgets, loading, error, addExpense, updateExpense, deleteExpense, setBudget, load],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useCurrentMonthKey(): string {
  return monthKey(new Date());
}
