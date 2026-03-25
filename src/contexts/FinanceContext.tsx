import React, { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react';
import { Transaction, PartyFunds, RecurringExpense } from '@/types/finance';
import { dbHelpers } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface FinanceContextType {
  // Transactions
  transactions: Transaction[];
  isLoading: boolean;
  getAllTransactions: (characterId?: string) => Promise<void>;
  addTransaction: (transaction: Partial<Transaction>) => Promise<Transaction | null>;
  deleteTransaction: (transactionId: string) => Promise<boolean>;

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
  const partyFundsRef = useRef(partyFunds);
  useEffect(() => { partyFundsRef.current = partyFunds; }, [partyFunds]);

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

  const getAllTransactions = useCallback(async (characterId?: string) => {
    setIsLoading(true);
    try {
      const data = await dbHelpers.getAllTransactions(characterId);
      const loadedTransactions = data as Transaction[];
      setTransactions(loadedTransactions);

      // Recalculate party funds balance from party transactions if balance is 0
      // but party transactions exist (handles out-of-sync stored balance)
      const currentBalance = partyFundsRef.current?.balance || 0;
      if (currentBalance === 0) {
        const partyTxns = loadedTransactions.filter(t => t.is_party_transaction);
        if (partyTxns.length > 0) {
          const recalculated = partyTxns.reduce((sum, t) => {
            return t.transaction_type === 'income' ? sum + t.amount : sum - t.amount;
          }, 0);
          if (recalculated !== 0) {
            await updatePartyFundsBalance(recalculated);
          }
        }
      }
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
          const currentBalance = partyFundsRef.current?.balance || 0;
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
  }, [toast]);

  const deleteTransaction = useCallback(async (transactionId: string): Promise<boolean> => {
    try {
      // Find the transaction before deleting so we can reverse its party fund effect
      const transaction = transactions.find(t => t.id === transactionId);

      await dbHelpers.deleteTransaction(transactionId);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));

      // Reverse the party funds balance if this was a party transaction
      if (transaction?.is_party_transaction) {
        const amount = transaction.amount || 0;
        const reversal = transaction.transaction_type === 'income' ? -amount : amount;
        const currentBalance = partyFundsRef.current?.balance || 0;
        await updatePartyFundsBalance(currentBalance + reversal);
      }

      toast({
        title: 'Success',
        description: 'Transaction deleted',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast, transactions]);

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

  // Load party funds on mount
  useEffect(() => {
    getPartyFunds();
  }, [getPartyFunds]);

  const adjustPartyFunds = useCallback(async (amount: number) => {
    if (!partyFundsRef.current) {
      await updatePartyFundsBalance(amount);
      return;
    }

    const newBalance = partyFundsRef.current.balance + amount;
    await updatePartyFundsBalance(newBalance);
  }, [updatePartyFundsBalance]);

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
    deleteTransaction,
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
