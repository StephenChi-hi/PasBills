-- ============================================================================================================
-- TOKEN SYSTEM MIGRATION - Run this in Supabase SQL Editor
-- ============================================================================================================

-- USER TOKENS TABLE
CREATE TABLE IF NOT EXISTS user_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 NOT NULL,
  total_purchased INTEGER DEFAULT 0 NOT NULL,
  total_used INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_tokens
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_balance ON user_tokens(balance);

-- Enable RLS for user_tokens
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies for user_tokens
DROP POLICY IF EXISTS "Users can view their own tokens" ON user_tokens;
DROP POLICY IF EXISTS "Users can insert their own tokens" ON user_tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON user_tokens;

-- RLS policies for user_tokens
CREATE POLICY "Users can view their own tokens"
  ON user_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
  ON user_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON user_tokens FOR UPDATE
  USING (auth.uid() = user_id);


-- TOKEN TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage')),
  amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for token_transactions
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(type);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_date ON token_transactions(user_id, created_at);

-- Enable RLS for token_transactions
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies for token_transactions
DROP POLICY IF EXISTS "Users can view their own token transactions" ON token_transactions;
DROP POLICY IF EXISTS "Users can insert their own token transactions" ON token_transactions;

-- RLS policies for token_transactions
CREATE POLICY "Users can view their own token transactions"
  ON token_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own token transactions"
  ON token_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================================================================
-- DAILY TRANSACTION LOG TABLE (Track which users got daily reward)
-- ============================================================================================================
-- Purpose: Track which users already received their daily reward
-- Logic: 1 token per day per user when they record ANY income or expense
-- Even if they record 3-5 transactions, they only get 1 token per day
-- ============================================================================================================

CREATE TABLE IF NOT EXISTS daily_transaction_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_date DATE NOT NULL,
  token_amount INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reward_date)
);

-- Create indexes for daily_transaction_log
CREATE INDEX IF NOT EXISTS idx_daily_transaction_log_user_id ON daily_transaction_log(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_transaction_log_reward_date ON daily_transaction_log(reward_date);
CREATE INDEX IF NOT EXISTS idx_daily_transaction_log_user_date ON daily_transaction_log(user_id, reward_date);

-- Enable RLS for daily_transaction_log
ALTER TABLE daily_transaction_log ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies for daily_transaction_log
DROP POLICY IF EXISTS "Users can view their own daily logs" ON daily_transaction_log;
DROP POLICY IF EXISTS "Users can insert their own daily logs" ON daily_transaction_log;

-- RLS policies for daily_transaction_log
CREATE POLICY "Users can view their own daily logs"
  ON daily_transaction_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily logs"
  ON daily_transaction_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================================================================
-- DAILY REWARD FUNCTION - Award 1 token per user per day on first transaction
-- ============================================================================================================
-- Trigger: Fires on INSERT to transactions table
-- Logic:
--   1. Check if user already got reward today (CURRENT_DATE)
--   2. If not, insert into daily_transaction_log
--   3. Add 1 token to user_tokens.balance
--   4. Insert token_transactions record with type='reward'
-- ============================================================================================================

CREATE OR REPLACE FUNCTION award_daily_transaction_reward()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID := NEW.user_id;
  v_reward_date DATE := CURRENT_DATE;
  v_already_rewarded BOOLEAN;
BEGIN
  -- Check if user already got reward today
  SELECT EXISTS (
    SELECT 1 FROM daily_transaction_log
    WHERE user_id = v_user_id AND reward_date = v_reward_date
  ) INTO v_already_rewarded;

  -- If not rewarded today, award 1 token
  IF NOT v_already_rewarded THEN
    -- Insert into daily_transaction_log to mark as rewarded
    INSERT INTO daily_transaction_log (user_id, reward_date, token_amount)
    VALUES (v_user_id, v_reward_date, 1)
    ON CONFLICT (user_id, reward_date) DO NOTHING;

    -- Ensure user_tokens record exists
    INSERT INTO user_tokens (user_id, balance)
    VALUES (v_user_id, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET balance = user_tokens.balance + 1,
        updated_at = NOW();

    -- Log the reward transaction
    INSERT INTO token_transactions (user_id, type, amount, reason)
    VALUES (v_user_id, 'reward', 1, 'Daily transaction reward');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Drop existing trigger for daily reward
-- ============================================
DROP TRIGGER IF EXISTS trg_award_daily_transaction_reward ON transactions;

-- ============================================
-- Attach trigger to transactions table (AFTER INSERT)
-- ============================================
CREATE TRIGGER trg_award_daily_transaction_reward
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION award_daily_transaction_reward();


-- ============================================================================================================
-- TOKEN DEDUCTION FUNCTION - For AI Analysis & Tax Calculation (Framework)
-- ============================================================================================================
-- Framework prepared for future token deductions:
--   AI Analysis: 500 tokens (will be called from /api/analyze route)
--   Tax Calculation: 500 tokens (will be called from /api/taxes/calculate route)
-- ============================================================================================================

CREATE OR REPLACE FUNCTION deduct_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  new_balance INTEGER
) AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance FROM user_tokens WHERE user_id = p_user_id;

  -- Check if balance exists
  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT false, 'User tokens record not found'::TEXT, 0;
    RETURN;
  END IF;

  -- Check if sufficient tokens
  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT false, 'Insufficient tokens'::TEXT, v_current_balance;
    RETURN;
  END IF;

  -- Deduct tokens
  UPDATE user_tokens
  SET balance = balance - p_amount,
      total_used = total_used + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Get new balance
  SELECT balance INTO v_new_balance FROM user_tokens WHERE user_id = p_user_id;

  -- Log the transaction
  INSERT INTO token_transactions (user_id, type, amount, reason)
  VALUES (p_user_id, 'usage', p_amount, p_reason);

  RETURN QUERY SELECT true, 'Tokens deducted successfully'::TEXT, v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grant execution to authenticated users
-- ============================================
GRANT EXECUTE ON FUNCTION deduct_tokens(UUID, INTEGER, TEXT) TO authenticated;


-- ============================================================================================================
-- ADD TOKENS FUNCTION - For token purchases & manual additions
-- ============================================================================================================

CREATE OR REPLACE FUNCTION add_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  new_balance INTEGER
) AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Ensure user_tokens record exists
  INSERT INTO user_tokens (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET balance = user_tokens.balance + p_amount,
      total_purchased = user_tokens.total_purchased + p_amount,
      updated_at = NOW();

  -- Get new balance
  SELECT balance INTO v_new_balance FROM user_tokens WHERE user_id = p_user_id;

  -- Log the transaction
  INSERT INTO token_transactions (user_id, type, amount, reason)
  VALUES (p_user_id, 'purchase', p_amount, p_reason);

  RETURN QUERY SELECT true, 'Tokens added successfully'::TEXT, v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Grant execution to authenticated users
-- ============================================
GRANT EXECUTE ON FUNCTION add_tokens(UUID, INTEGER, TEXT) TO authenticated;


-- ============================================================================================================
-- INITIALIZATION: Create user_tokens record for all existing users
-- ============================================================================================================
-- This ensures all users have a token balance record when they first sign in
-- ============================================================================================================

INSERT INTO user_tokens (user_id, balance, total_purchased, total_used)
SELECT DISTINCT user_id, 0, 0, 0
FROM transactions
WHERE user_id NOT IN (SELECT user_id FROM user_tokens)
ON CONFLICT (user_id) DO NOTHING;

-- Also initialize for users with accounts
INSERT INTO user_tokens (user_id, balance, total_purchased, total_used)
SELECT DISTINCT user_id, 0, 0, 0
FROM accounts
WHERE user_id NOT IN (SELECT user_id FROM user_tokens)
ON CONFLICT (user_id) DO NOTHING;
