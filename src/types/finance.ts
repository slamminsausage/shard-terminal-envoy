// TypeScript types for Financial Automation features

export interface Transaction {
  id: string;
  player_id: string;

  // Transaction details
  transaction_date: string;
  imperial_date?: string;

  amount: number;
  transaction_type: 'income' | 'expense' | 'transfer' | 'loan_taken' | 'loan_payment';
  category?: string;

  description: string;
  notes?: string;

  // Related entities
  character_id?: string;
  vehicle_id?: string;
  session_id?: string;
  quest_id?: string;

  // Party funds
  is_party_transaction: boolean;

  // Counterparty (for transfers)
  from_character_id?: string;
  to_character_id?: string;

  created_at: string;
}

export interface PartyFunds {
  id: string;
  player_id: string;
  balance: number;
  updated_at: string;
}

export interface RecurringExpense {
  id: string;
  player_id: string;

  name: string;
  description?: string;
  amount: number;

  frequency: 'monthly' | 'yearly';

  character_id?: string;
  vehicle_id?: string;

  is_active: boolean;

  last_processed_date?: string;
  next_due_date?: string;

  created_at: string;
  updated_at: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'loan_taken' | 'loan_payment';
export type TransactionCategory = 'salary' | 'trade' | 'loot' | 'maintenance' | 'fuel' | 'supplies' | 'misc';
export type ExpenseFrequency = 'monthly' | 'yearly';
