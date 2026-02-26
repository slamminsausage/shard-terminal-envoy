import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { Transaction } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionLedgerProps {
  characterId?: string;
  showPartyTransactions?: boolean;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  characterId,
  showPartyTransactions = true,
}) => {
  const { transactions, getAllTransactions, deleteTransaction, isLoading } = useFinance();
  const { isGM } = useCampaign();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const handleDelete = async (transactionId: string) => {
    setDeletingId(transactionId);
    await deleteTransaction(transactionId);
    setDeletingId(null);
  };

  useEffect(() => {
    getAllTransactions(characterId);
  }, [characterId, getAllTransactions]);

  // Detect newly added transactions and trigger slide-in animation
  useEffect(() => {
    const incoming: string[] = [];
    for (const t of transactions) {
      if (!knownIdsRef.current.has(t.id)) {
        incoming.push(t.id);
        knownIdsRef.current.add(t.id);
      }
    }
    if (incoming.length === 0) return;
    setNewIds(prev => new Set([...prev, ...incoming]));
    const t = setTimeout(() => {
      setNewIds(prev => {
        const next = new Set(prev);
        incoming.forEach(id => next.delete(id));
        return next;
      });
    }, 400);
    return () => clearTimeout(t);
  }, [transactions]);

  const filteredTransactions = transactions.filter(t => {
    // Party transaction filter
    if (!showPartyTransactions && t.is_party_transaction) return false;
    if (characterId && !t.is_party_transaction && t.character_id !== characterId) return false;

    // Type filter
    const matchesType = filterType === 'all' || t.transaction_type === filterType;

    // Category filter
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

    return matchesType && matchesCategory;
  });

  const calculateTotals = () => {
    const income = filteredTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, net: income - expenses };
  };

  const totals = calculateTotals();

  const transactionTypeColors = {
    income: 'bg-green-500/20 text-green-400 border-green-500/50',
    expense: 'bg-red-500/20 text-red-400 border-red-500/50',
    transfer: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    loan_taken: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    loan_payment: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  };

  const transactionTypeIcons = {
    income: <TrendingUp className="h-4 w-4" />,
    expense: <TrendingDown className="h-4 w-4" />,
    transfer: <DollarSign className="h-4 w-4" />,
    loan_taken: <DollarSign className="h-4 w-4" />,
    loan_payment: <DollarSign className="h-4 w-4" />,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Totals */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-terminal-primary mb-2">Transaction Ledger</h2>
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-3">
              <div className="text-xs text-green-400/70 mb-1">Income</div>
              <div className="text-lg font-bold text-green-400">
                +{totals.income.toLocaleString()} Cr
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-3">
              <div className="text-xs text-red-400/70 mb-1">Expenses</div>
              <div className="text-lg font-bold text-red-400">
                -{totals.expenses.toLocaleString()} Cr
              </div>
            </CardContent>
          </Card>

          <Card className={`${totals.net >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <CardContent className="p-3">
              <div className={`text-xs ${totals.net >= 0 ? 'text-green-400/70' : 'text-red-400/70'} mb-1`}>
                Net
              </div>
              <div className={`text-lg font-bold ${totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totals.net >= 0 ? '+' : ''}{totals.net.toLocaleString()} Cr
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-black border-terminal-primary/50">
            <SelectItem value="all" className="text-terminal-primary">All Types</SelectItem>
            <SelectItem value="income" className="text-terminal-primary">Income</SelectItem>
            <SelectItem value="expense" className="text-terminal-primary">Expenses</SelectItem>
            <SelectItem value="transfer" className="text-terminal-primary">Transfers</SelectItem>
            <SelectItem value="loan_taken" className="text-terminal-primary">Loans Taken</SelectItem>
            <SelectItem value="loan_payment" className="text-terminal-primary">Loan Payments</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-black border-terminal-primary/50">
            <SelectItem value="all" className="text-terminal-primary">All Categories</SelectItem>
            <SelectItem value="salary" className="text-terminal-primary">Salary</SelectItem>
            <SelectItem value="trade" className="text-terminal-primary">Trade</SelectItem>
            <SelectItem value="loot" className="text-terminal-primary">Loot</SelectItem>
            <SelectItem value="maintenance" className="text-terminal-primary">Maintenance</SelectItem>
            <SelectItem value="fuel" className="text-terminal-primary">Fuel</SelectItem>
            <SelectItem value="supplies" className="text-terminal-primary">Supplies</SelectItem>
            <SelectItem value="misc" className="text-terminal-primary">Miscellaneous</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="text-center py-8 text-terminal-primary/70">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <Card className="bg-black border-terminal-primary/30">
            <CardContent className="p-8 text-center text-terminal-primary/70">
              {filterType !== 'all' || filterCategory !== 'all'
                ? 'No transactions match your filters.'
                : 'No transactions yet. Add your first transaction to get started.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <Card
                key={transaction.id}
                className={`bg-black border-terminal-primary/30 hover:border-terminal-primary/50 transition-colors${newIds.has(transaction.id) ? ' transaction-enter' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {transactionTypeIcons[transaction.transaction_type]}
                        <Badge className={transactionTypeColors[transaction.transaction_type]}>
                          {transaction.transaction_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {transaction.category && (
                          <Badge className="bg-terminal-primary/10 text-terminal-primary/70 border-terminal-primary/30">
                            {transaction.category}
                          </Badge>
                        )}
                        {transaction.is_party_transaction && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                            Party
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-terminal-primary mb-1">
                        {transaction.description}
                      </h3>

                      <div className="flex flex-wrap gap-3 text-xs text-terminal-primary/70">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(transaction.transaction_date), 'MMM dd, yyyy HH:mm')}
                        </div>

                        {transaction.imperial_date && (
                          <div className="flex items-center gap-1">
                            <span>📅</span>
                            {transaction.imperial_date}
                          </div>
                        )}
                      </div>

                      {transaction.notes && (
                        <p className="text-xs text-terminal-primary/60 mt-2 italic">
                          {transaction.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className={`text-xl font-bold ${
                        transaction.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.transaction_type === 'income' ? '+' : '-'}
                        {transaction.amount.toLocaleString()} Cr
                      </div>
                      {isGM && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                          disabled={deletingId === transaction.id}
                          className="h-7 w-7 text-red-500/60 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
