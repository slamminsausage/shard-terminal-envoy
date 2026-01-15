import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Receipt } from 'lucide-react';

interface TransactionCreatorProps {
  characterId?: string;
  onClose: () => void;
}

export const TransactionCreator: React.FC<TransactionCreatorProps> = ({
  characterId,
  onClose,
}) => {
  const { addTransaction } = useFinance();
  const { currentDate } = useCalendar();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer' | 'loan_taken' | 'loan_payment'>('income');
  const [category, setCategory] = useState('misc');
  const [isPartyTransaction, setIsPartyTransaction] = useState(false);
  const [notes, setNotes] = useState('');

  const handleCreate = async () => {
    if (!description.trim() || !amount || parseInt(amount) <= 0) return;

    await addTransaction({
      description,
      amount: parseInt(amount),
      transaction_type: transactionType,
      category,
      character_id: characterId,
      is_party_transaction: isPartyTransaction,
      imperial_date: currentDate?.formatted,
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <Card className="bg-black border-terminal-primary/50 mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-terminal-primary flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Add Transaction
          </CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-terminal-primary hover:bg-terminal-primary/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
            Description *
          </label>
          <Input
            placeholder="e.g., Trade profit, Fuel purchase, Ship repair"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-black border-terminal-primary/50 text-terminal-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              Type
            </label>
            <Select value={transactionType} onValueChange={(v: any) => setTransactionType(v)}>
              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                <SelectItem value="income" className="text-terminal-primary">Income</SelectItem>
                <SelectItem value="expense" className="text-terminal-primary">Expense</SelectItem>
                <SelectItem value="transfer" className="text-terminal-primary">Transfer</SelectItem>
                <SelectItem value="loan_taken" className="text-terminal-primary">Loan Taken</SelectItem>
                <SelectItem value="loan_payment" className="text-terminal-primary">Loan Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-terminal-primary/50">
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

        <div>
          <label className="flex items-center gap-2 text-sm text-terminal-primary cursor-pointer">
            <input
              type="checkbox"
              checked={isPartyTransaction}
              onChange={(e) => setIsPartyTransaction(e.target.checked)}
              className="rounded border-terminal-primary/50"
            />
            Party Transaction (affects shared party funds)
          </label>
        </div>

        <div>
          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
            Notes
          </label>
          <Textarea
            placeholder="Additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
          />
        </div>

        {currentDate && (
          <div className="text-xs text-terminal-primary/60 border-t border-terminal-primary/20 pt-3">
            <p>Imperial Date: {currentDate.formatted}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleCreate}
            disabled={!description.trim() || !amount || parseInt(amount) <= 0}
            className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
          >
            <Save className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
