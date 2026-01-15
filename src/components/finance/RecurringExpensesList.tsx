import React, { useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { RecurringExpense } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Save, Trash2, Calendar, AlertCircle } from 'lucide-react';

export const RecurringExpensesList: React.FC = () => {
  const { recurringExpenses, getAllRecurringExpenses, addRecurringExpense, updateRecurringExpense, deleteRecurringExpense } = useFinance();
  const [showCreator, setShowCreator] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    getAllRecurringExpenses();
  }, [getAllRecurringExpenses]);

  const handleCreate = async () => {
    if (!name.trim() || !amount || parseInt(amount) <= 0) return;

    await addRecurringExpense({
      name,
      description: description || undefined,
      amount: parseInt(amount),
      frequency,
    });

    // Reset form
    setName('');
    setDescription('');
    setAmount('');
    setFrequency('monthly');
    setShowCreator(false);
  };

  const handleToggleActive = async (expense: RecurringExpense) => {
    await updateRecurringExpense(expense.id, {
      is_active: !expense.is_active,
    });
  };

  const handleDelete = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this recurring expense?')) {
      await deleteRecurringExpense(expenseId);
    }
  };

  const calculateMonthlyTotal = () => {
    return recurringExpenses
      .filter(e => e.is_active)
      .reduce((sum, e) => {
        const monthlyAmount = e.frequency === 'monthly' ? e.amount : e.amount / 12;
        return sum + monthlyAmount;
      }, 0);
  };

  const calculateYearlyTotal = () => {
    return recurringExpenses
      .filter(e => e.is_active)
      .reduce((sum, e) => {
        const yearlyAmount = e.frequency === 'yearly' ? e.amount : e.amount * 12;
        return sum + yearlyAmount;
      }, 0);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-terminal-primary">Recurring Expenses</h2>
          <div className="flex gap-4 text-sm text-terminal-primary/70">
            <span>{calculateMonthlyTotal().toLocaleString()} Cr/month</span>
            <span>•</span>
            <span>{calculateYearlyTotal().toLocaleString()} Cr/year</span>
          </div>
        </div>
        <Button
          onClick={() => setShowCreator(true)}
          className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Expense
        </Button>
      </div>

      {/* Creator Form */}
      {showCreator && (
        <Card className="bg-black border-terminal-primary/50 mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-terminal-primary text-sm">Add Recurring Expense</CardTitle>
              <Button
                onClick={() => setShowCreator(false)}
                variant="ghost"
                size="sm"
                className="text-terminal-primary hover:bg-terminal-primary/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                Expense Name *
              </label>
              <Input
                placeholder="e.g., Ship Payment, Docking Fees"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black border-terminal-primary/50 text-terminal-primary"
              />
            </div>

            <div>
              <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                Description
              </label>
              <Textarea
                placeholder="Optional description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                  Amount (Credits) *
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-black border-terminal-primary/50 text-terminal-primary"
                />
              </div>

              <div>
                <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                  Frequency
                </label>
                <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                  <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-terminal-primary/50">
                    <SelectItem value="monthly" className="text-terminal-primary">Monthly</SelectItem>
                    <SelectItem value="yearly" className="text-terminal-primary">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || !amount || parseInt(amount) <= 0}
                size="sm"
                className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
              >
                <Save className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button
                onClick={() => setShowCreator(false)}
                variant="outline"
                size="sm"
                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <ScrollArea className="flex-1">
        {recurringExpenses.length === 0 ? (
          <Card className="bg-black border-terminal-primary/30">
            <CardContent className="p-8 text-center text-terminal-primary/70">
              No recurring expenses yet. Add your first recurring expense to track regular costs.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recurringExpenses.map((expense) => (
              <Card
                key={expense.id}
                className={`bg-black transition-colors ${
                  expense.is_active
                    ? 'border-terminal-primary/30 hover:border-terminal-primary/50'
                    : 'border-terminal-primary/10 opacity-50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-terminal-primary/70" />
                        <h3 className="font-bold text-terminal-primary">{expense.name}</h3>
                        <Badge className={`${
                          expense.frequency === 'monthly'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                            : 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                        }`}>
                          {expense.frequency}
                        </Badge>
                        {!expense.is_active && (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                            Inactive
                          </Badge>
                        )}
                      </div>

                      {expense.description && (
                        <p className="text-sm text-terminal-primary/80 mb-2">
                          {expense.description}
                        </p>
                      )}

                      <div className="flex gap-4 text-xs text-terminal-primary/70">
                        <div>
                          Amount: <span className="text-terminal-primary font-mono">{expense.amount.toLocaleString()} Cr</span>
                        </div>
                        {expense.frequency === 'yearly' && (
                          <div>
                            Monthly: <span className="text-terminal-primary font-mono">{Math.round(expense.amount / 12).toLocaleString()} Cr</span>
                          </div>
                        )}
                      </div>

                      {expense.next_due_date && (
                        <div className="flex items-center gap-1 text-xs text-yellow-400/70 mt-2">
                          <AlertCircle className="h-3 w-3" />
                          <span>Next due: {expense.next_due_date}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleToggleActive(expense)}
                        variant="ghost"
                        size="sm"
                        className={`${
                          expense.is_active
                            ? 'text-terminal-primary hover:bg-terminal-primary/20'
                            : 'text-green-400 hover:bg-green-500/20'
                        }`}
                      >
                        {expense.is_active ? 'Pause' : 'Activate'}
                      </Button>
                      <Button
                        onClick={() => handleDelete(expense.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Summary Card */}
      {recurringExpenses.some(e => e.is_active) && (
        <Card className="bg-red-500/5 border-red-500/30 mt-4">
          <CardContent className="p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-red-400/70">Active Recurring Costs:</span>
              <div className="flex gap-3">
                <span className="text-red-400 font-bold">
                  {calculateMonthlyTotal().toLocaleString()} Cr/mo
                </span>
                <span className="text-terminal-primary/50">•</span>
                <span className="text-red-400 font-bold">
                  {calculateYearlyTotal().toLocaleString()} Cr/yr
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
