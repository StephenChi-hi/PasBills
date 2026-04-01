-- ============================================
-- PasBills Database Schema for Supabase
-- ============================================
-- 
-- IDEMPOTENT SCRIPT:
-- This script is fully idempotent and can be safely run multiple times.
-- It will:
--   1. Create tables if they don't exist
--   2. Create or replace functions
--   3. Drop and recreate triggers (to handle schema changes)
--   4. Drop and recreate policies (to handle RLS updates)
--   5. Create indexes if they don't exist
--   6. Upsert seed data (inserts with ON CONFLICT DO UPDATE)
--
-- Use this workflow:
--   1. Edit this file with schema changes
--   2. Copy entire script to Supabase SQL Editor
--   3. Run it - all changes will be applied
--   4. Repeat as needed
--
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users Table (extends Supabase auth)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  default_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Accounts Table
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'checking', 'savings', 'investment', 'crypto', 'cash', 'business'
  balance DECIMAL(15, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  color TEXT, -- 'blue', 'green', 'purple', 'orange', 'red'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Businesses Table
-- ============================================
-- NOTE: revenue and expenses are calculated fields derived from transactions
-- They should NOT be manually updated. Instead, query the transactions table
-- and aggregate by business_id and type (income/expense).
-- 
-- To calculate revenue for a business:
--   SELECT COALESCE(SUM(amount), 0) FROM transactions 
--   WHERE business_id = <business_id> AND type = 'income'
--
-- To calculate expenses for a business:
--   SELECT COALESCE(SUM(amount), 0) FROM transactions 
--   WHERE business_id = <business_id> AND type = 'expense'
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  revenue DECIMAL(15, 2) DEFAULT 0, -- CALCULATED: sum of income transactions
  expenses DECIMAL(15, 2) DEFAULT 0, -- CALCULATED: sum of expense transactions
  status TEXT DEFAULT 'profit', -- 'profit', 'loss' (derived from revenue vs expenses)
  growth DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Loans Table
-- ============================================
-- Tracks borrowed and lent money with payment timeline
-- loan_type: 'borrowed' = money I owe, 'lent' = money owed to me
-- When loan created: auto-generates initial transaction (income if borrowed, expense if lent)
-- When payment made: creates loan_payment record + transaction
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL, -- 'borrowed' or 'lent'
  counterparty_name TEXT NOT NULL, -- person or entity name
  description TEXT,
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) DEFAULT 0, -- optional percentage for compound interest
  status TEXT DEFAULT 'active', -- 'active', 'settled', 'defaulted'
  borrowed_date DATE NOT NULL,
  due_date DATE,
  total_amount_due DECIMAL(15, 2), -- principal + calculated interest
  total_paid DECIMAL(15, 2) DEFAULT 0, -- total amount paid back so far
  currency TEXT DEFAULT 'USD',
  account TEXT NOT NULL, -- account ID where money received/paid
  transaction_type TEXT NOT NULL, -- 'personal' or 'business'
  business_id UUID REFERENCES businesses(id), -- FK to business if transaction_type='business'
  category TEXT NOT NULL, -- category ID/slug
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Loan Payments Table
-- ============================================
-- Tracks individual payments on loans
-- Each payment creates a corresponding transaction
CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Transactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type TEXT NOT NULL, -- 'income', 'expense'
  category_id UUID NOT NULL, -- References income_categories or expense_categories by UUID
  from_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  is_internal BOOLEAN DEFAULT false,
  transaction_date DATE NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Income Categories
-- ============================================
-- Supports both default (system) and custom (user-created) categories
-- Default categories have user_id = NULL and are available to all users
-- Custom categories have user_id = <user_id> and belong to specific users
-- 
-- IDs are auto-generated as UUIDs by the database
-- Users can create custom categories by:
-- 1. Entering a name and selecting an icon from the wide Lucide icon library
-- 2. Specifying if it's personal or business category
-- 3. Frontend sends category data, DB auto-generates UUID and creates record
CREATE TABLE IF NOT EXISTS income_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for defaults
  name TEXT NOT NULL,
  subcategory TEXT NOT NULL, -- 'personal', 'business'
  icon_name TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, subcategory)
);

-- ============================================
-- Expense Categories
-- ============================================
-- Supports both default (system) and custom (user-created) categories
-- Default categories have user_id = NULL and are available to all users
-- Custom categories have user_id = <user_id> and belong to specific users
-- 
-- IDs are auto-generated as UUIDs by the database
-- Users can create custom categories by:
-- 1. Entering a name and selecting an icon from the wide Lucide icon library
-- 2. Specifying if it's personal or business category
-- 3. Frontend sends category data, DB auto-generates UUID and creates record
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for defaults
  name TEXT NOT NULL,
  subcategory TEXT NOT NULL, -- 'personal', 'business'
  icon_name TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, subcategory)
);

-- ============================================
-- Create Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_account ON transactions(to_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_business ON transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_income_categories_user ON income_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_income_categories_subcategory ON income_categories(subcategory);
CREATE INDEX IF NOT EXISTS idx_expense_categories_user ON expense_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_subcategory ON expense_categories(subcategory);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_type ON loans(loan_type);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_date ON loan_payments(payment_date);

-- ============================================
-- Drop All Existing Policies (to update them)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can view their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can update their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can delete their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view default and custom income categories" ON income_categories;
DROP POLICY IF EXISTS "Users can insert their own income categories" ON income_categories;
DROP POLICY IF EXISTS "Users can view default and custom expense categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can insert their own expense categories" ON expense_categories;
DROP POLICY IF EXISTS "Users can view their own loans" ON loans;
DROP POLICY IF EXISTS "Users can insert their own loans" ON loans;
DROP POLICY IF EXISTS "Users can update their own loans" ON loans;
DROP POLICY IF EXISTS "Users can delete their own loans" ON loans;
DROP POLICY IF EXISTS "Users can view payments for their loans" ON loan_payments;
DROP POLICY IF EXISTS "Users can insert payments for their loans" ON loan_payments;
DROP POLICY IF EXISTS "Users can delete payments for their loans" ON loan_payments;

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for Users
-- ============================================
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

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

-- ============================================
-- RLS Policies for Businesses
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

-- ============================================
-- RLS Policies for Categories
-- ============================================
-- Users can view:
--   1. Default categories (user_id IS NULL)
--   2. Their own custom categories (user_id = auth.uid())
--
-- Category IDs are auto-generated UUIDs by the database
CREATE POLICY "Users can view default and custom income categories"
  ON income_categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own income categories"
  ON income_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can view default and custom expense categories"
  ON expense_categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own expense categories"
  ON expense_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_custom = true);

-- ============================================
-- Enable RLS on Loans Tables
-- ============================================
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for Loans
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

-- ============================================
-- RLS Policies for Loan Payments
-- ============================================
CREATE POLICY "Users can view payments for their loans"
  ON loan_payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM loans WHERE id = loan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert payments for their loans"
  ON loan_payments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM loans WHERE id = loan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete payments for their loans"
  ON loan_payments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM loans WHERE id = loan_id AND user_id = auth.uid()
  ));

-- ============================================
-- Functions and Triggers for Business Metrics
-- ============================================
-- Function to update business revenue and expenses from transactions
CREATE OR REPLACE FUNCTION update_business_metrics(p_business_id UUID)
RETURNS void AS $$
DECLARE
  v_revenue DECIMAL(15, 2);
  v_expenses DECIMAL(15, 2);
  v_status TEXT;
BEGIN
  -- Calculate total revenue (sum of income transactions)
  SELECT COALESCE(SUM(amount), 0) INTO v_revenue
  FROM transactions
  WHERE business_id = p_business_id AND type = 'income';

  -- Calculate total expenses (sum of expense transactions)
  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM transactions
  WHERE business_id = p_business_id AND type = 'expense';

  -- Determine profit/loss status
  v_status := CASE WHEN (v_revenue - v_expenses) >= 0 THEN 'profit' ELSE 'loss' END;

  -- Update the business table
  UPDATE businesses
  SET 
    revenue = v_revenue,
    expenses = v_expenses,
    status = v_status,
    updated_at = NOW()
  WHERE id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Drop Existing Triggers (before recreating)
-- ============================================
DROP TRIGGER IF EXISTS on_transaction_insert ON transactions;
DROP TRIGGER IF EXISTS on_transaction_update ON transactions;
DROP TRIGGER IF EXISTS on_transaction_delete ON transactions;

-- Trigger: Update business metrics when transaction is inserted
CREATE OR REPLACE FUNCTION trigger_transaction_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.business_id IS NOT NULL THEN
    PERFORM update_business_metrics(NEW.business_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_transaction_insert();

-- Trigger: Update business metrics when transaction is updated
CREATE OR REPLACE FUNCTION trigger_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the new business (if it exists)
  IF NEW.business_id IS NOT NULL THEN
    PERFORM update_business_metrics(NEW.business_id);
  END IF;

  -- Also update the old business if transaction was moved to different business
  IF OLD.business_id IS NOT NULL AND OLD.business_id != NEW.business_id THEN
    PERFORM update_business_metrics(OLD.business_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_update
AFTER UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_transaction_update();

-- Trigger: Update business metrics when transaction is deleted
CREATE OR REPLACE FUNCTION trigger_transaction_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.business_id IS NOT NULL THEN
    PERFORM update_business_metrics(OLD.business_id);
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_delete
AFTER DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_transaction_delete();

-- ============================================
-- Insert Default Income Categories
-- ============================================
INSERT INTO income_categories (name, subcategory, icon_name) VALUES
('Salary', 'personal', 'Banknote'),
('Freelance', 'personal', 'Briefcase'),
('Investment Income', 'personal', 'TrendingUp'),
('Dividends', 'personal', 'Coins'),
('Rental Income', 'personal', 'Home'),
('Pension/Retirement', 'personal', 'HandshakeIcon'),
('Interest Income', 'personal', 'Percent'),
('Tax Refund', 'personal', 'FileCheck'),
('Gifts & Allowance', 'personal', 'Gift'),
('Bonuses', 'personal', 'Trophy'),
('Reimbursements', 'personal', 'RotateCcw'),
('Other Income', 'personal', 'DollarSign'),
('Product Sales', 'business', 'ShoppingCart'),
('Service Revenue', 'business', 'Wrench'),
('Consulting', 'business', 'MessageSquare'),
('Affiliate Commission', 'business', 'LinkIcon'),
('Royalties', 'business', 'Music'),
('Licensing & Patents', 'business', 'Award'),
('Partnership Income', 'business', 'Handshake'),
('Grants & Sponsorship', 'business', 'Flag'),
('Courses & Training', 'business', 'BookOpen'),
('Subscription Revenue', 'business', 'Bell'),
('Other Business Income', 'business', 'DollarSign')
ON CONFLICT (user_id, name, subcategory) DO UPDATE SET
  icon_name = EXCLUDED.icon_name,
  updated_at = NOW();

-- ============================================
-- Insert Default Expense Categories
-- ============================================
INSERT INTO expense_categories (name, subcategory, icon_name) VALUES
('Groceries', 'personal', 'ShoppingCart'),
('Utilities', 'personal', 'Zap'),
('Transportation', 'personal', 'Car'),
('Gas & Fuel', 'personal', 'Fuel'),
('Entertainment', 'personal', 'Music'),
('Healthcare & Medical', 'personal', 'Heart'),
('Insurance', 'personal', 'Shield'),
('Education & Training', 'personal', 'BookOpen'),
('Shopping & Clothing', 'personal', 'Bag'),
('Dining & Food', 'personal', 'UtensilsCrossed'),
('Rent & Housing', 'personal', 'Home'),
('Phone & Internet', 'personal', 'Phone'),
('Subscriptions', 'personal', 'Repeat'),
('Fitness & Gym', 'personal', 'Dumbbell'),
('Childcare', 'personal', 'Baby'),
('Pet Care', 'personal', 'Heart'),
('Home Maintenance', 'personal', 'Wrench'),
('Clothing & Fashion', 'personal', 'ShirtIcon'),
('Beauty & Personal Care', 'personal', 'Sparkles'),
('Other Personal', 'personal', 'DollarSign'),
('Office Supplies', 'business', 'Package'),
('Software & Tools', 'business', 'Code'),
('Marketing & Advertising', 'business', 'Megaphone'),
('Payroll & Salaries', 'business', 'Users'),
('Equipment & Machinery', 'business', 'Cpu'),
('Travel & Accommodation', 'business', 'Plane'),
('Client Acquisition', 'business', 'Target'),
('Professional Development', 'business', 'Zap'),
('Business Insurance', 'business', 'Shield'),
('Legal & Accounting', 'business', 'Scale'),
('Rent & Office Space', 'business', 'Briefcase'),
('Utilities & Services', 'business', 'Zap'),
('Hosting & Cloud', 'business', 'Server'),
('Contractors & Freelance', 'business', 'Briefcase'),
('Shipping & Logistics', 'business', 'TrendingUp'),
('Bank Fees', 'business', 'CreditCard'),
('Other Business Expense', 'business', 'DollarSign')
ON CONFLICT (user_id, name, subcategory) DO UPDATE SET
  icon_name = EXCLUDED.icon_name,
  updated_at = NOW();

-- ============================================
-- Schema Complete & Idempotent
-- ============================================
-- This script is fully idempotent and safe to run repeatedly.
-- Use this workflow:
--   1. Make changes to this schema.sql file
--   2. Copy entire script to Supabase SQL Editor
--   3. Run it
--   4. Safe to repeat as needed during development
