import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { CATEGORIES, PAYMENT_METHODS, type ExpenseInput, type Category, type PaymentMethod } from '@/lib/types';
import { CategoryIcon } from '@/components/CategoryIcon';
import { cn } from '@/components/utils';

interface ExpenseFormProps {
  open: boolean;
  initial?: ExpenseInput | null;
  title: string;
  submitLabel: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (input: ExpenseInput) => Promise<void>;
}

const emptyForm: ExpenseInput = {
  title: '',
  amount: 0,
  category: 'Food',
  expense_date: new Date().toISOString().slice(0, 10),
  payment_method: 'Credit Card',
  description: '',
};

function iconNameFor(c: Category): string {
  const map: Record<Category, string> = {
    Food: 'utensils',
    Travel: 'plane',
    Shopping: 'shopping-bag',
    Entertainment: 'film',
    Healthcare: 'heart-pulse',
    Education: 'graduation-cap',
    Others: 'more-horizontal',
  };
  return map[c];
}

export function ExpenseForm({
  open,
  initial,
  title,
  submitLabel,
  loading,
  onClose,
  onSubmit,
}: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseInput>(initial ?? emptyForm);
  const [amountStr, setAmountStr] = useState(initial ? String(initial.amount) : '');
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseInput, string>>>({});

  // Reset form whenever the modal opens or the initial value changes
  useEffect(() => {
    if (open) {
      setForm(initial ?? emptyForm);
      setAmountStr(initial ? String(initial.amount) : '');
      setErrors({});
    }
  }, [open, initial]);

  const set = <K extends keyof ExpenseInput>(k: K, v: ExpenseInput[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof ExpenseInput, string>> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    const amtNum = Number(amountStr);
    if (!amountStr || isNaN(amtNum)) e.amount = 'Amount is required';
    else if (amtNum <= 0) e.amount = 'Amount must be greater than zero';
    if (!form.expense_date) e.expense_date = 'Date is required';
    if (!form.payment_method) e.payment_method = 'Payment method is required';
    if (!form.category) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: ExpenseInput = {
      title: form.title.trim(),
      amount: Math.round(Number(amountStr) * 100) / 100,
      category: form.category,
      expense_date: form.expense_date,
      payment_method: form.payment_method,
      description: form.description?.trim() || null,
    };
    await onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle="Fields marked * are required."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>{submitLabel}</Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Field label="Expense Title" required error={errors.title}>
          <Input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Grocery shopping"
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Amount" required error={errors.amount}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-400">$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  set('amount', Number(e.target.value));
                }}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </Field>

          <Field label="Date" required error={errors.expense_date}>
            <Input
              type="date"
              value={form.expense_date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set('expense_date', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Category" required error={errors.category}>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((c) => {
              const active = form.category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('category', c as Category)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all',
                    active
                      ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-500/10'
                      : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50',
                  )}
                >
                  <CategoryIcon name={iconNameFor(c)} size={18} />
                  {c}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Payment Method" required error={errors.payment_method}>
          <Select value={form.payment_method} onChange={(e) => set('payment_method', e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </Field>

        <Field label="Description" hint="Optional note about this expense.">
          <Textarea
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Add any extra details…"
            maxLength={280}
          />
        </Field>

        {/* hidden submit so Enter key works */}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}
