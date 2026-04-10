import React, { useState, useEffect } from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Minus, DollarSign } from 'lucide-react';

export const PartyFundsCard: React.FC = () => {
  const { partyFunds, getPartyFunds, adjustPartyFunds, addTransaction } = useFinance();
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isIncome, setIsIncome] = useState(true);

  useEffect(() => {
    getPartyFunds();
  }, [getPartyFunds]);

  const handleAdjustment = async () => {
    const amount = parseInt(adjustmentAmount, 10);
    if (!amount || amount <= 0) return;

    const finalAmount = isIncome ? amount : -amount;

    // Create transaction record
    await addTransaction({
      amount: amount,
      transaction_type: isIncome ? 'income' : 'expense',
      category: 'misc',
      description: adjustmentReason || (isIncome ? 'Income added to party funds' : 'Expense from party funds'),
      is_party_transaction: true,
    });

    // Adjustment is already done by addTransaction when is_party_transaction is true
    setAdjustmentAmount('');
    setAdjustmentReason('');
    setShowAdjustment(false);
  };

  const balance = partyFunds?.balance || 0;
  const animatedBalance = useCountUp(balance);

  return (
    <Card className="bg-black border-terminal-primary/50">
      <CardHeader>
        <CardTitle className="text-terminal-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Party Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded-lg p-4">
          <div className="text-xs text-terminal-primary/70 mb-1">Current Balance</div>
          <div className="text-3xl font-bold text-terminal-primary flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            {animatedBalance.toLocaleString()} Cr
          </div>
        </div>

        {/* Quick Actions */}
        {!showAdjustment ? (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setIsIncome(true);
                setShowAdjustment(true);
              }}
              className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
            <Button
              onClick={() => {
                setIsIncome(false);
                setShowAdjustment(true);
              }}
              className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
            >
              <Minus className="h-4 w-4 mr-2" />
              Spend Funds
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                Amount (Credits) *
              </label>
              <Input
                type="number"
                min="1"
                placeholder="0"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                className="bg-black border-terminal-primary/50 text-terminal-primary"
              />
            </div>

            <div>
              <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                Reason
              </label>
              <Input
                placeholder={isIncome ? "e.g., Trade profit" : "e.g., Ship maintenance"}
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="bg-black border-terminal-primary/50 text-terminal-primary"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAdjustment}
                disabled={!adjustmentAmount || parseInt(adjustmentAmount, 10) <= 0}
                className={`flex-1 ${
                  isIncome
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50'
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50'
                }`}
              >
                {isIncome ? 'Add' : 'Spend'} {adjustmentAmount ? parseInt(adjustmentAmount, 10).toLocaleString() : '0'} Cr
              </Button>
              <Button
                onClick={() => {
                  setShowAdjustment(false);
                  setAdjustmentAmount('');
                  setAdjustmentReason('');
                }}
                variant="outline"
                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-terminal-primary/60 border-t border-terminal-primary/20 pt-3">
          <p>Shared funds available to all party members</p>
          <p className="text-terminal-primary/40 mt-1">
            All transactions are automatically logged in the ledger
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
