import { useState, type ReactNode } from 'react';
import { LayoutDashboard, Receipt, Wallet, PieChart, Menu, X, Wallet2 } from 'lucide-react';
import { cn } from '@/components/utils';

export type PageKey = 'dashboard' | 'transactions' | 'budget' | 'analytics';

interface NavItem {
  key: PageKey;
  label: string;
  icon: ReactNode;
}

const NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
  { key: 'transactions', label: 'Transactions', icon: <Receipt size={19} /> },
  { key: 'budget', label: 'Budget', icon: <Wallet size={19} /> },
  { key: 'analytics', label: 'Analytics', icon: <PieChart size={19} /> },
];

export function Sidebar({
  current,
  onNavigate,
}: {
  current: PageKey;
  onNavigate: (key: PageKey) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (key: PageKey) => {
    onNavigate(key);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200 bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Brand />
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-2xl animate-slide-up">
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <NavList current={current} onNavigate={go} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-ink-200 bg-white px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <Brand />
        </div>
        <NavList current={current} onNavigate={onNavigate} />
        <div className="mt-auto rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 p-4 text-white">
          <p className="text-xs font-semibold">Smart Expense Tracker</p>
          <p className="mt-1 text-[11px] text-primary-100">
            Track, budget, and grow your savings.
          </p>
        </div>
      </aside>
    </>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm shadow-primary-600/30">
        <Wallet2 size={20} />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold text-ink-900">Expense<span className="text-primary-600">IQ</span></p>
        <p className="text-[10px] font-medium uppercase tracking-wider text-ink-400">Smart Tracker</p>
      </div>
    </div>
  );
}

function NavList({ current, onNavigate }: { current: PageKey; onNavigate: (k: PageKey) => void }) {
  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = current === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              active
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800',
            )}
          >
            <span className={cn(active ? 'text-primary-600' : 'text-ink-400')}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
