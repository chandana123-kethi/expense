import { useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, Receipt, SlidersHorizontal, Inbox } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/States';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { Expense, ExpenseInput } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import { formatCurrency, formatDate, CATEGORY_META } from '@/lib/utils';

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export function TransactionsPage() {
  const { expenses, loading, addExpense, updateExpense, deleteExpense } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<SortKey>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.payment_method.toLowerCase().includes(q),
      );
    }
    if (category !== 'all') list = list.filter((e) => e.category === category);
    if (dateFrom) list = list.filter((e) => e.expense_date >= dateFrom);
    if (dateTo) list = list.filter((e) => e.expense_date <= dateTo);

    list.sort((a, b) => {
      switch (sort) {
        case 'date-asc':
          return a.expense_date.localeCompare(b.expense_date);
        case 'date-desc':
          return b.expense_date.localeCompare(a.expense_date);
        case 'amount-asc':
          return Number(a.amount) - Number(b.amount);
        case 'amount-desc':
          return Number(b.amount) - Number(a.amount);
        default:
          return 0;
      }
    });
    return list;
  }, [expenses, search, category, dateFrom, dateTo, sort]);

  const totalShown = useMemo(() => filtered.reduce((a, e) => a + Number(e.amount), 0), [filtered]);

  const openEdit = (e: Expense) => {
    setEditing(e);
    setFormOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleSubmit = async (input: ExpenseInput) => {
    setSaving(true);
    try {
      if (editing) {
        await updateExpense(editing.id, input);
      } else {
        await addExpense(input);
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      // surfaced via store error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteExpense(deleteId);
      setDeleteId(null);
    } catch {
      // surfaced via store
    } finally {
      setDeleting(false);
    }
  };

  const editingInitial: ExpenseInput | null = editing
    ? {
        title: editing.title,
        amount: Number(editing.amount),
        category: editing.category,
        expense_date: editing.expense_date,
        payment_method: editing.payment_method,
        description: editing.description ?? '',
      }
    : null;

  const hasActiveFilters = category !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">Transactions</h1>
          <p className="mt-1 text-sm text-ink-500">Search, filter, and manage all your expenses.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> Add Expense
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or payment method…"
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="w-auto">
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </Select>
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters((s) => !s)}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal size={15} /> Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-ink-100 pt-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-600">Category</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-600">From date</label>
              <Input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-600">To date</label>
              <Input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setCategory('all');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="col-span-full justify-self-start text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
          <p className="text-xs font-medium text-ink-500">
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
            {filtered.length > 0 && (
              <span className="ml-2 text-ink-400">· {formatCurrency(totalShown)} total</span>
            )}
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-ink-400">Loading transactions…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={hasActiveFilters || search ? <Inbox size={24} /> : <Receipt size={24} />}
            title={hasActiveFilters || search ? 'No matching transactions' : 'No transactions yet'}
            description={
              hasActiveFilters || search
                ? 'Try adjusting your search or filters.'
                : 'Add your first expense to get started.'
            }
            action={
              hasActiveFilters || search ? (
                <Button variant="outline" size="sm" onClick={() => { setSearch(''); setCategory('all'); setDateFrom(''); setDateTo(''); }}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={openAdd}><Plus size={15} /> Add Expense</Button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                    <th className="px-5 py-3">Title</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Payment</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {filtered.map((e) => {
                    const meta = CATEGORY_META[e.category];
                    return (
                      <tr key={e.id} className="group transition-colors hover:bg-ink-50/60">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                              style={{ background: `${meta.color}1a`, color: meta.color }}
                            >
                              <CategoryIcon name={meta.icon} size={16} />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink-800">{e.title}</p>
                              {e.description && (
                                <p className="truncate text-xs text-ink-400">{e.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Badge tone="default">{e.category}</Badge>
                        </td>
                        <td className="px-3 py-3 text-ink-500">{formatDate(e.expense_date)}</td>
                        <td className="px-3 py-3 text-ink-500">{e.payment_method}</td>
                        <td className="px-3 py-3 text-right font-semibold text-ink-900">
                          -{formatCurrency(Number(e.amount))}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => openEdit(e)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-primary-50 hover:text-primary-600"
                              aria-label="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteId(e.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600"
                              aria-label="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="divide-y divide-ink-100 md:hidden">
              {filtered.map((e) => {
                const meta = CATEGORY_META[e.category];
                return (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${meta.color}1a`, color: meta.color }}
                    >
                      <CategoryIcon name={meta.icon} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-800">{e.title}</p>
                      <p className="text-xs text-ink-400">
                        {formatDate(e.expense_date)} · {e.category}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-ink-900">-{formatCurrency(Number(e.amount))}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(e)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:bg-primary-50 hover:text-primary-600"
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(e.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <ExpenseForm
        open={formOpen}
        initial={editingInitial}
        title={editing ? 'Edit Expense' : 'Add Expense'}
        submitLabel={editing ? 'Save Changes' : 'Add Expense'}
        loading={saving}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
