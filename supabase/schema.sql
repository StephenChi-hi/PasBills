-- ============================================
-- PasBills Database Schema - Accounts Table Only
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Accounts Table
-- ============================================
-- Fixed account types: 'cash', 'checking', 'savings', 'business', 'investment', 'crypto'
-- Currency values come from frontend currency selector (NGN, USD, EUR, GBP, etc.)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'checking', 'savings', 'business', 'investment', 'crypto')),
  balance DECIMAL(15, 2) DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Create Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Drop Existing RLS Policies (to update them)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;

-- ============================================
-- RLS Policies for Accounts
-- ============================================
CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================================================
-- BUSINESSES TABLE
-- ============================================================================================================

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  revenue DECIMAL(15, 2) DEFAULT 0,
  expenses DECIMAL(15, 2) DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('profit', 'loss')) DEFAULT 'profit',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Create Indexes for Businesses
-- ============================================
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);

-- ============================================
-- Enable Row Level Security for Businesses
-- ============================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Drop Existing RLS Policies for Businesses
-- ============================================
DROP POLICY IF EXISTS "Users can view their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can update their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can delete their own businesses" ON businesses;

-- ============================================
CREATE POLICY "Users can view their own businesses"
  ON businesses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own businesses"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses"
  ON businesses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own businesses"
  ON businesses FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================================================================
-- BALANCE TABLE
-- ============================================================================================================

CREATE TABLE IF NOT EXISTS balance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  liquid_balance DECIMAL(15, 2) DEFAULT 0,
  net_worth DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_balance UNIQUE (user_id)
);

-- ============================================
-- Create Indexes for Balance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_balance_user_id ON balance(user_id);

-- ============================================
-- Enable Row Level Security for Balance
-- ============================================
ALTER TABLE balance ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Drop Existing RLS Policies for Balance
-- ============================================
DROP POLICY IF EXISTS "Users can view their own balance" ON balance;
DROP POLICY IF EXISTS "Users can insert their own balance" ON balance;
DROP POLICY IF EXISTS "Users can update their own balance" ON balance;
DROP POLICY IF EXISTS "Users can delete their own balance" ON balance;

-- ============================================
CREATE POLICY "Users can view their own balance"
  ON balance FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================
-- Trigger Function to Update User Balance
-- ============================================
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert into balance table: sum all account balances for the user
  INSERT INTO balance (user_id, liquid_balance, net_worth, updated_at)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    (SELECT COALESCE(SUM(balance), 0) FROM accounts WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)),
    (SELECT COALESCE(SUM(balance), 0) FROM accounts WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET liquid_balance = EXCLUDED.liquid_balance,
        net_worth = EXCLUDED.net_worth,
        updated_at = NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers on Accounts Table
-- ============================================
DROP TRIGGER IF EXISTS trg_update_user_balance_insert ON accounts;
DROP TRIGGER IF EXISTS trg_update_user_balance_update ON accounts;
DROP TRIGGER IF EXISTS trg_update_user_balance_delete ON accounts;

CREATE TRIGGER trg_update_user_balance_insert
  AFTER INSERT ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_user_balance();

CREATE TRIGGER trg_update_user_balance_update
  AFTER UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_user_balance();

CREATE TRIGGER trg_update_user_balance_delete
  AFTER DELETE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_user_balance();

CREATE POLICY "Users can insert their own balance"
  ON balance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance"
  ON balance FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own balance"
  ON balance FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Initialize Balance Table for Existing Users
-- ============================================
INSERT INTO balance (user_id, liquid_balance, net_worth, created_at, updated_at)
SELECT
  a.user_id,
  COALESCE(SUM(a.balance), 0) AS liquid_balance,
  COALESCE(SUM(a.balance), 0) AS net_worth,
  NOW(),
  NOW()
FROM accounts a
GROUP BY a.user_id
ON CONFLICT (user_id) DO UPDATE
  SET liquid_balance = EXCLUDED.liquid_balance,
      net_worth = EXCLUDED.net_worth,
      updated_at = NOW();


-- ============================================================================================================
-- CATEGORIES TABLE
-- ============================================================================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'HelpCircle',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_type TEXT NOT NULL CHECK (category_type IN ('personal', 'business')),
  is_custom BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Create Indexes for Categories
-- ============================================
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_category_type ON categories(category_type);
CREATE INDEX IF NOT EXISTS idx_categories_is_custom ON categories(is_custom);

-- ============================================
-- Enable Row Level Security for Categories
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Drop Existing RLS Policies for Categories
-- ============================================
DROP POLICY IF EXISTS "Users can view all categories" ON categories;
DROP POLICY IF EXISTS "Users can view their own custom categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

-- ============================================
-- RLS Policies for Categories
-- ============================================
CREATE POLICY "Users can view all categories"
  ON categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Insert Default Categories
-- ============================================

-- Income Categories - Personal
INSERT INTO categories (user_id, name, icon, type, category_type, is_custom) VALUES
  (NULL, 'Salary', 'Banknote', 'income', 'personal', false),
  (NULL, 'Freelance', 'Briefcase', 'income', 'personal', false),
  (NULL, 'Investment', 'TrendingUp', 'income', 'personal', false),
  (NULL, 'Refund', 'RotateCcw', 'income', 'personal', false),
  (NULL, 'Gift', 'Gift', 'income', 'personal', false),
  (NULL, 'Bonus', 'DollarSign', 'income', 'personal', false)
ON CONFLICT DO NOTHING;

-- Income Categories - Business
INSERT INTO categories (user_id, name, icon, type, category_type, is_custom) VALUES
  (NULL, 'Sales', 'ShoppingCart', 'income', 'business', false),
  (NULL, 'Services', 'Wrench', 'income', 'business', false),
  (NULL, 'Consulting', 'MessageSquare', 'income', 'business', false),
  (NULL, 'Sponsorship', 'Megaphone', 'income', 'business', false),
  (NULL, 'Partnership', 'Handshake', 'income', 'business', false)
ON CONFLICT DO NOTHING;

-- Expense Categories - Personal
INSERT INTO categories (user_id, name, icon, type, category_type, is_custom) VALUES
  (NULL, 'Food & Dining', 'UtensilsCrossed', 'expense', 'personal', false),
  (NULL, 'Transportation', 'Car', 'expense', 'personal', false),
  (NULL, 'Entertainment', 'Music', 'expense', 'personal', false),
  (NULL, 'Shopping', 'ShoppingBag', 'expense', 'personal', false),
  (NULL, 'Utilities', 'Zap', 'expense', 'personal', false),
  (NULL, 'Healthcare', 'Heart', 'expense', 'personal', false),
  (NULL, 'Housing', 'Home', 'expense', 'personal', false),
  (NULL, 'Education', 'Lightbulb', 'expense', 'personal', false),
  (NULL, 'Phone', 'Phone', 'expense', 'personal', false),
  (NULL, 'Fuel', 'Fuel', 'expense', 'personal', false)
ON CONFLICT DO NOTHING;

-- Expense Categories - Business
INSERT INTO categories (user_id, name, icon, type, category_type, is_custom) VALUES
  (NULL, 'Supplies', 'Package', 'expense', 'business', false),
  (NULL, 'Equipment', 'Settings', 'expense', 'business', false),
  (NULL, 'Rent', 'Home', 'expense', 'business', false),
  (NULL, 'Utilities', 'Zap', 'expense', 'business', false),
  (NULL, 'Marketing', 'Megaphone', 'expense', 'business', false),
  (NULL, 'Payroll', 'Users', 'expense', 'business', false),
  (NULL, 'Insurance', 'Shield', 'expense', 'business', false),
  (NULL, 'Maintenance', 'Wrench', 'expense', 'business', false),
  (NULL, 'Travel', 'Plane', 'expense', 'business', false),
  (NULL, 'Software', 'Code', 'expense', 'business', false)
ON CONFLICT DO NOTHING;


-- ============================================================================================================
-- TRANSACTIONS TABLE
-- ============================================================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  from_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  is_business BOOLEAN DEFAULT false,
  tangible_assets BOOLEAN DEFAULT false,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================
-- Create Indexes for Transactions
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from_account_id ON transactions(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_account_id ON transactions(to_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_business_id ON transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);

-- ============================================
-- Enable Row Level Security for Transactions
-- ============================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Drop Existing RLS Policies for Transactions
-- ============================================
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

-- ============================================
-- RLS Policies for Transactions
-- ============================================
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================================================================
-- CASH FLOW SUMMARY TABLE
-- ============================================================================================================

CREATE TABLE IF NOT EXISTS cash_flow_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  total_inflow DECIMAL(15, 2) DEFAULT 0,
  total_outflow DECIMAL(15, 2) DEFAULT 0,
  net_flow DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_cash_flow UNIQUE (user_id)
);

-- ============================================
-- Create Indexes for Cash Flow Summary
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cash_flow_summary_user_id ON cash_flow_summary(user_id);

-- ============================================
-- Enable Row Level Security for Cash Flow Summary
-- ============================================
ALTER TABLE cash_flow_summary ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Drop Existing RLS Policies for Cash Flow Summary
-- ============================================
DROP POLICY IF EXISTS "Users can view their own cash flow" ON cash_flow_summary;
DROP POLICY IF EXISTS "Users can insert their own cash flow" ON cash_flow_summary;
DROP POLICY IF EXISTS "Users can update their own cash flow" ON cash_flow_summary;
DROP POLICY IF EXISTS "Users can delete their own cash flow" ON cash_flow_summary;

-- ============================================
-- RLS Policies for Cash Flow Summary
-- ============================================
CREATE POLICY "Users can view their own cash flow"
  ON cash_flow_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cash flow"
  ON cash_flow_summary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cash flow"
  ON cash_flow_summary FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cash flow"
  ON cash_flow_summary FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Trigger Function to Update Cash Flow Summary
-- ============================================
CREATE OR REPLACE FUNCTION update_cash_flow_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert into cash_flow_summary table
  INSERT INTO cash_flow_summary (user_id, total_inflow, total_outflow, net_flow, updated_at)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    (SELECT COALESCE(SUM(amount), 0) FROM transactions 
     WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND type = 'income'),
    (SELECT COALESCE(SUM(amount), 0) FROM transactions 
     WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND type = 'expense'),
    (SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) 
     FROM transactions WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET total_inflow = EXCLUDED.total_inflow,
        total_outflow = EXCLUDED.total_outflow,
        net_flow = EXCLUDED.net_flow,
        updated_at = NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers on Transactions Table
-- ============================================
DROP TRIGGER IF EXISTS trg_update_cash_flow_insert ON transactions;
DROP TRIGGER IF EXISTS trg_update_cash_flow_update ON transactions;
DROP TRIGGER IF EXISTS trg_update_cash_flow_delete ON transactions;

CREATE TRIGGER trg_update_cash_flow_insert
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_cash_flow_summary();

CREATE TRIGGER trg_update_cash_flow_update
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_cash_flow_summary();

CREATE TRIGGER trg_update_cash_flow_delete
  AFTER DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_cash_flow_summary();

-- ============================================
-- Initialize Cash Flow Summary for Existing Users
-- ============================================
INSERT INTO cash_flow_summary (user_id, total_inflow, total_outflow, net_flow, created_at, updated_at)
SELECT
  t.user_id,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_inflow,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_outflow,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) AS net_flow,
  NOW(),
  NOW()
FROM transactions t
GROUP BY t.user_id
ON CONFLICT (user_id) DO UPDATE
  SET total_inflow = EXCLUDED.total_inflow,
      total_outflow = EXCLUDED.total_outflow,
      net_flow = EXCLUDED.net_flow,
      updated_at = NOW();


-- ============================================================================================================
-- ACCOUNT BALANCE UPDATE TRIGGER
-- ============================================================================================================
-- Automatically updates account balances when transactions are created/updated/deleted
-- Logic:
--   from_account → ALWAYS subtract the amount (for both income and expense)
--   to_account → ALWAYS add the amount (for both income and expense)

CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- For DELETE, reverse the transaction
    -- from_account: add back the amount (reverse subtraction)
    IF OLD.from_account_id IS NOT NULL THEN
      UPDATE accounts
      SET balance = balance + OLD.amount, updated_at = NOW()
      WHERE id = OLD.from_account_id;
    END IF;

    -- to_account: subtract the amount (reverse addition)
    IF OLD.to_account_id IS NOT NULL THEN
      UPDATE accounts
      SET balance = balance - OLD.amount, updated_at = NOW()
      WHERE id = OLD.to_account_id;
    END IF;

  ELSIF TG_OP = 'INSERT' THEN
    -- For INSERT, apply the transaction
    -- from_account: subtract the amount
    IF NEW.from_account_id IS NOT NULL THEN
      UPDATE accounts
      SET balance = balance - NEW.amount, updated_at = NOW()
      WHERE id = NEW.from_account_id;
    END IF;

    -- to_account: add the amount
    IF NEW.to_account_id IS NOT NULL THEN
      UPDATE accounts
      SET balance = balance + NEW.amount, updated_at = NOW()
      WHERE id = NEW.to_account_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- For UPDATE, reverse old and apply new
    -- Handle from_account
    IF OLD.from_account_id IS DISTINCT FROM NEW.from_account_id OR OLD.amount IS DISTINCT FROM NEW.amount THEN
      -- Reverse old from_account
      IF OLD.from_account_id IS NOT NULL THEN
        UPDATE accounts
        SET balance = balance + OLD.amount, updated_at = NOW()
        WHERE id = OLD.from_account_id;
      END IF;

      -- Apply new from_account
      IF NEW.from_account_id IS NOT NULL THEN
        UPDATE accounts
        SET balance = balance - NEW.amount, updated_at = NOW()
        WHERE id = NEW.from_account_id;
      END IF;
    END IF;

    -- Handle to_account
    IF OLD.to_account_id IS DISTINCT FROM NEW.to_account_id OR OLD.amount IS DISTINCT FROM NEW.amount THEN
      -- Reverse old to_account
      IF OLD.to_account_id IS NOT NULL THEN
        UPDATE accounts
        SET balance = balance - OLD.amount, updated_at = NOW()
        WHERE id = OLD.to_account_id;
      END IF;

      -- Apply new to_account
      IF NEW.to_account_id IS NOT NULL THEN
        UPDATE accounts
        SET balance = balance + NEW.amount, updated_at = NOW()
        WHERE id = NEW.to_account_id;
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers for Account Balance Updates
-- ============================================
DROP TRIGGER IF EXISTS trg_update_account_balance_insert ON transactions;
DROP TRIGGER IF EXISTS trg_update_account_balance_update ON transactions;
DROP TRIGGER IF EXISTS trg_update_account_balance_delete ON transactions;

CREATE TRIGGER trg_update_account_balance_insert
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();

CREATE TRIGGER trg_update_account_balance_update
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();

CREATE TRIGGER trg_update_account_balance_delete
  AFTER DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();


-- ============================================================================================================
-- BUSINESS DATA UPDATE TRIGGER
-- ============================================================================================================
-- Automatically updates business revenue, expenses, and calculates profit/loss status
-- Logic:
--   Income transaction → add to business revenue
--   Expense transaction → add to business expenses
--   Status = 'profit' if revenue >= expenses, else 'loss'

CREATE OR REPLACE FUNCTION update_business_data()
RETURNS TRIGGER AS $$
DECLARE
  business_revenue DECIMAL(15, 2);
  business_expenses DECIMAL(15, 2);
  business_status TEXT;
BEGIN
  -- Only process if business_id is set
  IF COALESCE(NEW.business_id, OLD.business_id) IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get the business ID
  DECLARE
    bid UUID := COALESCE(NEW.business_id, OLD.business_id);
  BEGIN
    -- Calculate total revenue for the business
    SELECT COALESCE(SUM(amount), 0) INTO business_revenue
    FROM transactions
    WHERE business_id = bid AND type = 'income';

    -- Calculate total expenses for the business
    SELECT COALESCE(SUM(amount), 0) INTO business_expenses
    FROM transactions
    WHERE business_id = bid AND type = 'expense';

    -- Determine status: profit if revenue >= expenses, else loss
    business_status := CASE
      WHEN business_revenue >= business_expenses THEN 'profit'
      ELSE 'loss'
    END;

    -- Update the business with new values
    UPDATE businesses
    SET revenue = business_revenue,
        expenses = business_expenses,
        status = business_status,
        updated_at = NOW()
    WHERE id = bid;
  END;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers for Business Data Updates
-- ============================================
DROP TRIGGER IF EXISTS trg_update_business_data_insert ON transactions;
DROP TRIGGER IF EXISTS trg_update_business_data_update ON transactions;
DROP TRIGGER IF EXISTS trg_update_business_data_delete ON transactions;

CREATE TRIGGER trg_update_business_data_insert
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_business_data();

CREATE TRIGGER trg_update_business_data_update
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_business_data();

CREATE TRIGGER trg_update_business_data_delete
  AFTER DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_business_data();


-- ============================================================================================================
-- LOANS FEATURE - UPDATE SCRIPTS FOR SUPABASE
-- ============================================================================================================
-- Copy and paste these scripts below into Supabase SQL Editor to add Loans functionality
-- Execute them in order

-- ============================================================================================================
-- STEP 1: Add is_system column to categories table
-- ============================================================================================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- ============================================================================================================
-- STEP 2: Create Loans Table (must be before adding FK to transactions)
-- ============================================================================================================
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_type VARCHAR(20) NOT NULL CHECK (loan_type IN ('borrowed', 'lent')),
  counterparty_name VARCHAR(255) NOT NULL,
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(10, 2) DEFAULT 0,
  total_amount_due DECIMAL(15, 2) NOT NULL,
  amount_remaining DECIMAL(15, 2) NOT NULL,
  amount_paid DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'settled', 'defaulted')) DEFAULT 'active',
  borrowed_date DATE NOT NULL,
  due_date DATE,
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  description TEXT,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('personal', 'business')),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Create Indexes for Loans
-- ============================================
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_loan_type ON loans(loan_type);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_account_id ON loans(account_id);
CREATE INDEX IF NOT EXISTS idx_loans_business_id ON loans(business_id);
CREATE INDEX IF NOT EXISTS idx_loans_borrowed_date ON loans(borrowed_date);

-- ============================================
-- Enable Row Level Security for Loans
-- ============================================
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS Policies for Loans
-- ============================================
CREATE POLICY "Users can view their own loans"
  ON loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans"
  ON loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans"
  ON loans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans"
  ON loans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================================================
-- STEP 3: Add loan_id column to transactions table (now loans table exists)
-- ============================================================================================================
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS loan_id UUID;

-- Add the foreign key constraint
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_loan_id 
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE;

-- Create index for loan_id
CREATE INDEX IF NOT EXISTS idx_transactions_loan_id ON transactions(loan_id);

-- ============================================================================================================
-- STEP 4: Add Loan Categories (System-only)
-- ============================================================================================================
INSERT INTO categories (user_id, name, icon, type, category_type, is_custom, is_system) VALUES
  (NULL, 'Loan', 'HandCoins', 'income', 'personal', false, true),
  (NULL, 'Loan', 'HandCoins', 'income', 'business', false, true),
  (NULL, 'Loan', 'HandCoins', 'expense', 'personal', false, true),
  (NULL, 'Loan', 'HandCoins', 'expense', 'business', false, true)
ON CONFLICT DO NOTHING;

-- ============================================================================================================
-- STEP 5: Create Loan Payment Update Function
-- ============================================================================================================
CREATE OR REPLACE FUNCTION update_loan_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.loan_id IS NOT NULL THEN
    -- Update loan's amount_paid and amount_remaining based on transaction
    UPDATE loans
    SET 
      amount_paid = COALESCE(amount_paid, 0) + NEW.amount,
      amount_remaining = principal_amount - (COALESCE(amount_paid, 0) + NEW.amount),
      status = CASE 
        WHEN (COALESCE(amount_paid, 0) + NEW.amount) >= principal_amount THEN 'settled'
        ELSE 'active'
      END,
      updated_at = NOW()
    WHERE id = NEW.loan_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================================================
-- STEP 6: Create Loan Payment Trigger
-- ============================================================================================================
DROP TRIGGER IF EXISTS trg_update_loan_on_payment_insert ON transactions;

CREATE TRIGGER trg_update_loan_on_payment_insert
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_loan_on_payment();


-- ============================================================================================================
-- RESET BUTTON: User Data Clearance Function
-- ============================================================================================================
-- Purpose: Allow authenticated users to clear all their financial data on demand
-- This is a "reset" function - keeps auth intact so no re-login needed
-- Clears: transactions, loans, accounts, businesses, categories, balances, cash flow
-- Preserves: Authentication, user account, system categories
-- Usage: SELECT clear_my_data();

CREATE OR REPLACE FUNCTION clear_my_data()
RETURNS TABLE (status TEXT, message TEXT) AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_transaction_count INT := 0;
  v_loan_count INT := 0;
  v_account_count INT := 0;
  v_business_count INT := 0;
BEGIN
  
  -- Verify user is authenticated
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 'ERROR'::TEXT, 'User not authenticated'::TEXT;
    RETURN;
  END IF;

  BEGIN
    -- Delete transactions
    DELETE FROM transactions WHERE user_id = v_user_id;
    GET DIAGNOSTICS v_transaction_count = ROW_COUNT;
    
    -- Delete loans
    DELETE FROM loans WHERE user_id = v_user_id;
    GET DIAGNOSTICS v_loan_count = ROW_COUNT;
    
    -- Delete summaries
    DELETE FROM cash_flow_summary WHERE user_id = v_user_id;
    DELETE FROM balance WHERE user_id = v_user_id;
    
    -- Delete custom categories (keep system categories)
    DELETE FROM categories WHERE user_id = v_user_id AND is_system = false;
    
    -- Delete businesses
    DELETE FROM businesses WHERE user_id = v_user_id;
    GET DIAGNOSTICS v_business_count = ROW_COUNT;
    
    -- Delete accounts
    DELETE FROM accounts WHERE user_id = v_user_id;
    GET DIAGNOSTICS v_account_count = ROW_COUNT;
    
    RETURN QUERY SELECT 'SUCCESS'::TEXT, 
      format('Data reset complete: %s transactions, %s loans, %s accounts, %s businesses deleted. Auth preserved.', 
             v_transaction_count, v_loan_count, v_account_count, v_business_count)::TEXT;
    
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'ERROR'::TEXT, format('Reset failed: %s', SQLERRM)::TEXT;
  END;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grant User Execution Permission
-- ============================================
GRANT EXECUTE ON FUNCTION clear_my_data() TO authenticated;


-- ============================================================================================================
-- TANGIBLE ASSETS NET WORTH UPDATE TRIGGER
-- ============================================================================================================
-- Purpose: Add tangible asset transactions to net_worth only (not liquid_balance)
-- Logic:
--   If tangible_assets = true → Add amount to net_worth ONLY
--   Regular transactions (tangible_assets = false) → Handled by update_user_balance & update_account_balance triggers

CREATE OR REPLACE FUNCTION update_tangible_assets_net_worth()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tangible_assets THEN
    -- Add tangible asset to net_worth only
    INSERT INTO balance (user_id, liquid_balance, net_worth, updated_at)
    VALUES (NEW.user_id, 0, NEW.amount, NOW())
    ON CONFLICT (user_id) DO UPDATE
      SET net_worth = balance.net_worth + NEW.amount,
          updated_at = NOW();
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger for Tangible Assets Net Worth Updates
-- ============================================
DROP TRIGGER IF EXISTS trg_update_tangible_assets_net_worth_insert ON transactions;
DROP TRIGGER IF EXISTS trg_update_tangible_assets_net_worth_update ON transactions;
DROP TRIGGER IF EXISTS trg_update_tangible_assets_net_worth_delete ON transactions;

CREATE TRIGGER trg_update_tangible_assets_net_worth_insert
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_tangible_assets_net_worth();



  








