import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { StoreProvider, useStore } from '@/store/StoreContext';
import { Sidebar, type PageKey } from '@/components/layout/Sidebar';
import { DashboardPage } from '@/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { BudgetPage } from '@/pages/BudgetPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

function ErrorBanner() {
  const { error, refresh } = useStore();
  const [dismissed, setDismissed] = useState(false);
  if (!error || dismissed) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-4">
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 shadow-lg sm:max-w-md">
        <AlertCircle size={18} className="shrink-0 text-red-500" />
        <p className="flex-1 text-xs text-ink-700">{error}</p>
        <button
          onClick={() => { setDismissed(true); refresh(); }}
          className="shrink-0 text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          Retry
        </button>
        <button onClick={() => setDismissed(true)} className="shrink-0 text-ink-400 hover:text-ink-600">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function Shell() {
  const [page, setPage] = useState<PageKey>('dashboard');

  return (
    <div className="min-h-screen bg-ink-100">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
          {page === 'transactions' && <TransactionsPage />}
          {page === 'budget' && <BudgetPage />}
          {page === 'analytics' && <AnalyticsPage />}
        </div>
      </main>
      <ErrorBanner />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
