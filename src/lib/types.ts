export type Category =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Others';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'UPI'
  | 'Bank Transfer';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  expense_date: string;
  payment_method: PaymentMethod;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  month_key: string; // 'YYYY-MM'
  amount: number;
  created_at: string;
  updated_at: string;
}

export type ExpenseInput = Omit<Expense, 'id' | 'created_at' | 'updated_at'>;

export const CATEGORIES: Category[] = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Others',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Bank Transfer',
];

export const CATEGORY_META: Record<Category, { color: string; icon: string }> = {
  Food: { color: '#f97316', icon: 'utensils' },
  Travel: { color: '#0ea5e9', icon: 'plane' },
  Shopping: { color: '#ec4899', icon: 'shopping-bag' },
  Entertainment: { color: '#a855f7', icon: 'film' },
  Healthcare: { color: '#ef4444', icon: 'heart-pulse' },
  Education: { color: '#10b981', icon: 'graduation-cap' },
  Others: { color: '#64748b', icon: 'more-horizontal' },
};
