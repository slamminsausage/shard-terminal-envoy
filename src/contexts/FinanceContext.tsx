import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Transaction, PartyFunds, RecurringExpense } from '@/types/finance';
import { dbHelpers } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface FinanceContextType {
  // Transactions
  transactions: Transaction[];
  isLoading: boolean;
  getAllTransactions: (characterId?: string) => Promise<void>;
  addTransaction: (transaction: Partial<Transaction>) => Promise<Transaction | null>;

  // Party funds
  partyFunds: PartyFunds | null;
  getPartyFunds: () => Promise<void>;
  updatePartyFundsBalance: (newBalance: number) => Promise<void>;
  adjustPartyFunds: (amount: number) => Promise<void>;

  // Recurring expenses
  recurringExpenses: RecurringExpense[];
  getAllRecurringExpenses: () => Promise<void>;
  addRecurringExpense: (expense: Partial<RecurringExpense>) => Promise<RecurringExpense | null>;
  updateRecurringExpense: (expenseId: string, updates: Partial<RecurringExpense>) => Promise<RecurringExpense | null>;
  deleteRecurringExpense: (expenseId: string) => Promise<boolean>;

  // Utilities
  getTransactionsByCategory: (category: string) => Transaction[];
  calculateNetIncome: (startDate?: string, endDate?: string) => {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
  };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [partyFunds, setPartyFunds] = useState<PartyFunds | null>(null);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load party funds on mount
  useEffect(() => {
    getPartyFunds();
  }, [getPartyFunds]);

  const getAllTransactions = useCallback(async (characterId?: string) => {
    setIsLoading(true);
    try {
      const data = await dbHelpers.getAllTransactions(characterId);
      setTransactions(data as Transaction[]);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addTransaction = useCallback(async (transaction: Partial<Transaction>): Promise<Transaction | null> => {
    try {
      const newTransaction = {
        player_id: 'campaign',
        transaction_date: new Date().toISOString(),
        is_party_transaction: false,
        ...transaction,
      };

      const data = await dbHelpers.saveTransaction(newTransaction);

      if (data) {
        setTransactions(prev => [data as Transaction, ...prev]);

        // Update party funds if this is a party transaction
        if (newTransaction.is_party_transaction) {
          const amount = newTransaction.amount || 0;
          const adjustment = newTransaction.transaction_type === 'income' ? amount : -amount;
          const currentBalance = partyFunds?.balance || 0;
          await updatePartyFundsBalance(currentBalance + adjustment);
        }

        toast({
          title: 'Success',
          description: 'Transaction added',
        });
        return data as Transaction;
      }
      return null;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast, partyFunds]);

  const getPartyFunds = useCallback(async () => {
    try {
      const data = await dbHelpers.getPartyFunds();
      setPartyFunds(data as PartyFunds | null);
    } catch (error) {
      console.error('Failed to load party funds:', error);
      toast({
        title: 'Error',
        description: 'Failed to load party funds',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const updatePartyFundsBalance = useCallback(async (newBalance: number) => {
    try {
      const data = await dbHelpers.updatePartyFunds(newBalance);
      setPartyFunds(data as PartyFunds);
    } catch (error) {
      console.error('Failed to update party funds:', error);
      toast({
        title: 'Error',
        description: 'Failed to update party funds',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const adjustPartyFunds = useCallback(async (amount: number) => {
    if (!partyFunds) {
      await updatePartyFundsBalance(amount);
      return;
    }

    const newBalance = partyFunds.balance + amount;
    await updatePartyFundsBalance(newBalance);
  }, [partyFunds, updatePartyFundsBalance]);

  const getAllRecurringExpenses = useCallback(async () => {
    try {
      const data = await dbHelpers.getAllRecurringExpenses();
      setRecurringExpenses(data as RecurringExpense[]);
    } catch (error) {
      console.error('Failed to load recurring expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recurring expenses',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const addRecurringExpense = useCallback(async (expense: Partial<RecurringExpense>): Promise<RecurringExpense | null> => {
    try {
      const newExpense = {
        player_id: 'campaign',
        is_active: true,
        ...expense,
      };

      const data = await dbHelpers.saveRecurringExpense(newExpense);

      if (data) {
        setRecurringExpenses(prev => [...prev, data as RecurringExpense]);
        toast({
          title: 'Success',
          description: 'Recurring expense added',
        });
        return data as RecurringExpense;
      }
      return null;
    } catch (error) {
      console.error('Failed to add recurring expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add recurring expense',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const updateRecurringExpense = useCallback(async (expenseId: string, updates: Partial<RecurringExpense>): Promise<RecurringExpense | null> => {
    try {
      const data = await dbHelpers.saveRecurringExpense({ id: expenseId, ...updates });

      if (data) {
        setRecurringExpenses(prev => prev.map(exp => exp.id === expenseId ? data as RecurringExpense : exp));
        toast({
          title: 'Success',
          description: 'Recurring expense updated',
        });
        return data as RecurringExpense;
      }
      return null;
    } catch (error) {
      console.error('Failed to update recurring expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to update recurring expense',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const deleteRecurringExpense = useCallback(async (expenseId: string): Promise<boolean> => {
    try {
      await dbHelpers.deleteRecurringExpense(expenseId);
      setRecurringExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      toast({
        title: 'Success',
        description: 'Recurring expense deleted',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete recurring expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete recurring expense',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const getTransactionsByCategory = useCallback((category: string) => {
    return transactions.filter(t => t.category === category);
  }, [transactions]);

  const calculateNetIncome = useCallback((startDate?: string, endDate?: string) => {
    let filteredTransactions = transactions;

    if (startDate || endDate) {
      filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        if (startDate && tDate < new Date(startDate)) return false;
        if (endDate && tDate > new Date(endDate)) return false;
        return true;
      });
    }

    const totalIncome = filteredTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
    };
  }, [transactions]);

  const value: FinanceContextType = {
    transactions,
    isLoading,
    getAllTransactions,
    addTransaction,
    partyFunds,
    getPartyFunds,
    updatePartyFundsBalance,
    adjustPartyFunds,
    recurringExpenses,
    getAllRecurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    getTransactionsByCategory,
    calculateNetIncome,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
