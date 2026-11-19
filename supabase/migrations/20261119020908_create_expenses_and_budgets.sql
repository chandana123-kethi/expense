/*
# Create expenses and budgets tables (single-tenant, no auth)

1. Overview
This is a single-user Smart Expense Tracker. There is no sign-in screen, so data
is intentionally shared/public and all policies target `anon, authenticated`.

2. New Tables
- `expenses`
  - id (uuid, primary key)
  - title (text, not null) - short label for the expense
  - amount (numeric(12,2), not null) - must be > 0 (enforced by CHECK)
  - category (text, not null) - one of: Food, Travel, Shopping, Entertainment, Healthcare, Education, Others
  - expense_date (date, not null) - the date the expense occurred
  - payment_method (text, not null) - e.g. Cash, Credit Card, Debit Card, UPI, Bank Transfer
  - description (text, nullable) - optional longer note
  - created_at (timestamptz, default now())
  - updated_at (timestamptz, default now()) - touched on every update via trigger

- `budgets`
  - id (uuid, primary key)
  - month_key (text, not null, unique) - 'YYYY-MM' format, one budget per month
  - amount (numeric(12,2), not null) - the monthly budget limit, must be >= 0
  - created_at (timestamptz, default now())
  - updated_at (timestamptz, default now())

3. Indexes
- expenses(category) - filter by category
- expenses(expense_date desc) - sort/filter by date
- expenses(amount desc) - sort by amount

4. Security
- RLS enabled on both tables.
- CRUD granted to anon + authenticated (no-auth single-tenant app).
- Policies allow all CRUD for anon + authenticated (intentionally public data).

5. Notes
- updated_at auto-refreshed via a trigger function + per-table triggers.
- CHECK constraints enforce amount > 0 on expenses and amount >= 0 on budgets,
  and category membership on expenses, so bad data cannot land even if the
  frontend validation is bypassed.
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  category text NOT NULL CHECK (category IN ('Food','Travel','Shopping','Entertainment','Healthcare','Education','Others')),
  expense_date date NOT NULL,
  payment_method text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key text NOT NULL UNIQUE,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_amount ON expenses(amount DESC);

-- updated_at touch trigger
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS expenses_touch_updated_at ON expenses;
CREATE TRIGGER expenses_touch_updated_at BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS budgets_touch_updated_at ON budgets;
CREATE TRIGGER budgets_touch_updated_at BEFORE UPDATE ON budgets
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON budgets TO anon, authenticated;

-- expenses policies (intentionally public single-tenant data)
DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
CREATE POLICY "anon_select_expenses" ON expenses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
CREATE POLICY "anon_insert_expenses" ON expenses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
CREATE POLICY "anon_update_expenses" ON expenses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "anon_delete_expenses" ON expenses FOR DELETE
  TO anon, authenticated USING (true);

-- budgets policies
DROP POLICY IF EXISTS "anon_select_budgets" ON budgets;
CREATE POLICY "anon_select_budgets" ON budgets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_budgets" ON budgets;
CREATE POLICY "anon_insert_budgets" ON budgets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_budgets" ON budgets;
CREATE POLICY "anon_update_budgets" ON budgets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_budgets" ON budgets;
CREATE POLICY "anon_delete_budgets" ON budgets FOR DELETE
  TO anon, authenticated USING (true);