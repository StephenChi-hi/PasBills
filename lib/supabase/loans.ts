import { createClient } from "@/lib/supabase/client";
import { Currency, CURRENCIES } from "@/lib/currency/currencies";

export interface Loan {
  id: string;
  loanType: "borrowed" | "lent";
  counterpartyName: string;
  amount: number;
  principalAmount: number;
  interestRate: number;
  status: "active" | "settled" | "defaulted";
  borrowedDate: string;
  dueDate?: string;
  totalPaid: number;
  currency: string;
  description?: string;
  account: string;
  transactionType: "personal" | "business";
  businessId?: string;
}

// Helper function to convert amounts to NGN
// Converts from any currency to NGN using USD as base
export function convertToNGN(amount: number, userCurrency: Currency): number {
  if (userCurrency.code === "NGN") return amount;
  // Step 1: Convert user's currency to USD
  const valueInUSD = amount / userCurrency.rateToUSD;
  // Step 2: Convert USD to NGN
  const amountInNGN = valueInUSD * CURRENCIES.NGN.rateToUSD;
  return parseFloat(amountInNGN.toFixed(2));
}

// Helper function to find the correct loan category based on transaction type
export async function getLoanCategoryId(
  transactionType: "income" | "expense",
  categoryType: "personal" | "business",
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "Loan")
    .eq("type", transactionType)
    .eq("category_type", categoryType)
    .eq("is_system", true)
    .single();

  if (error || !data) {
    console.error(
      `Error finding loan category for ${transactionType}/${categoryType}:`,
      error,
    );
    throw new Error(
      `Loan category not found for ${transactionType}/${categoryType}`,
    );
  }

  return data.id;
}

// Create a new loan in the database and initial transaction
export async function createLoan(
  userId: string,
  loanData: {
    loanType: "borrowed" | "lent";
    counterpartyName: string;
    principalAmount: number;
    interestRate: number;
    totalAmountDue: number;
    borrowedDate: string;
    dueDate?: string;
    currency: string;
    description?: string;
    accountId: string;
    transactionType: "personal" | "business";
    businessId?: string;
  },
) {
  const supabase = createClient();

  // 1. Create the loan record (all amounts in NGN)
  const { data: loanRecord, error: loanError } = await supabase
    .from("loans")
    .insert({
      user_id: userId,
      loan_type: loanData.loanType,
      counterparty_name: loanData.counterpartyName,
      principal_amount: loanData.principalAmount,
      interest_rate: loanData.interestRate,
      total_amount_due: loanData.totalAmountDue,
      amount_remaining: loanData.principalAmount,
      amount_paid: 0,
      status: "active",
      borrowed_date: loanData.borrowedDate,
      due_date: loanData.dueDate || null,
      currency: "NGN",
      description: loanData.description || null,
      account_id: loanData.accountId,
      transaction_type: loanData.transactionType,
      business_id: loanData.businessId || null,
    })
    .select()
    .single();

  if (loanError) throw loanError;

  // 2. Create initial transaction linked to the loan
  // For borrowed loans (Credit In): money comes TO account (income)
  // For lent loans (Credit Out): money comes FROM account (expense)
  const transactionType =
    loanData.loanType === "borrowed" ? "income" : "expense";
  const fromAccountId =
    loanData.loanType === "lent" ? loanData.accountId : null;
  const toAccountId =
    loanData.loanType === "borrowed" ? loanData.accountId : null;

  // Get the correct loan category ID based on transaction type
  const loanCategoryId = await getLoanCategoryId(
    transactionType as "income" | "expense",
    loanData.transactionType,
  );

  const { error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      type: transactionType,
      description: `Initial ${loanData.loanType === "borrowed" ? "borrowing" : "lending"} from ${loanData.counterpartyName}`,
      amount: loanData.principalAmount,
      category_id: loanCategoryId,
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      transaction_date: loanData.borrowedDate,
      is_business: loanData.transactionType === "business",
      business_id: loanData.businessId || null,
    });

  if (transactionError) throw transactionError;

  return loanRecord;
}

// Record a loan payment (creates a transaction that updates loan via trigger)
// Payment amount should already be converted to NGN before calling this function
export async function recordLoanPayment(
  userId: string,
  loanId: string,
  paymentData: {
    amount: number; // Must be in NGN
    transactionDate: string;
    description?: string;
    accountId: string;
    loanType: "borrowed" | "lent";
    transactionType: "personal" | "business";
    businessId?: string;
  },
) {
  const supabase = createClient();

  // Fetch loan details to get counterparty name
  const { data: loanData, error: loanFetchError } = await supabase
    .from("loans")
    .select("counterparty_name")
    .eq("id", loanId)
    .single();

  if (loanFetchError || !loanData) {
    throw new Error(`Failed to fetch loan details: ${loanFetchError?.message}`);
  }

  // Determine transaction type based on loan type
  const transactionType =
    paymentData.loanType === "borrowed" ? "expense" : "income";

  // For borrowed loans (credit in): money goes FROM account (from_account_id)
  // For lent loans (credit out): money comes TO account (to_account_id)
  const fromAccountId =
    paymentData.loanType === "borrowed" ? paymentData.accountId : null;
  const toAccountId =
    paymentData.loanType === "lent" ? paymentData.accountId : null;

  // Get the correct loan category ID based on transaction type
  const loanCategoryId = await getLoanCategoryId(
    transactionType as "income" | "expense",
    paymentData.transactionType,
  );

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      type: transactionType,
      description:
        paymentData.description ||
        `Loan payment for ${loanData.counterparty_name}`,
      amount: paymentData.amount,
      category_id: loanCategoryId,
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      transaction_date: paymentData.transactionDate,
      loan_id: loanId,
      is_business: paymentData.transactionType === "business",
      business_id: paymentData.businessId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get loan by ID
export async function getLoanById(userId: string, loanId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loanId)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

// Get all loans for user
export async function getUserLoans(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Delete a loan
export async function deleteLoan(userId: string, loanId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("loans")
    .delete()
    .eq("id", loanId)
    .eq("user_id", userId);

  if (error) throw error;
}

// Get payment transactions for a loan
export async function getLoanPayments(loanId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("loan_id", loanId)
    .order("transaction_date", { ascending: false });

  if (error) throw error;
  return data;
}
