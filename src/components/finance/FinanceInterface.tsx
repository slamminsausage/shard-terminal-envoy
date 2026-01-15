import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Receipt, Users, Calendar, Plus } from 'lucide-react';
import { TransactionLedger } from './TransactionLedger';
import { PartyFundsCard } from './PartyFundsCard';
import { RecurringExpensesList } from './RecurringExpensesList';
import { TransactionCreator } from './TransactionCreator';

export const FinanceInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ledger');
  const [showTransactionCreator, setShowTransactionCreator] = useState(false);

  return (
    <div className="h-full flex flex-col bg-black text-terminal-primary font-mono">
      <div className="border-b border-terminal-primary/30 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-terminal-primary">
              FINANCIAL MANAGEMENT
            </h1>
            <p className="text-terminal-primary/70 text-sm mt-1">
              Track transactions, party funds, and recurring expenses
            </p>
          </div>
          {activeTab === 'ledger' && (
            <Button
              onClick={() => setShowTransactionCreator(!showTransactionCreator)}
              className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-0 z-10 bg-black border-b border-terminal-primary/30 px-4 pt-4">
            <TabsList className="grid w-full grid-cols-3 bg-black border border-terminal-primary/30">
              <TabsTrigger
                value="ledger"
                className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary flex items-center gap-2"
              >
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Ledger</span>
              </TabsTrigger>
              <TabsTrigger
                value="party"
                className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Party Funds</span>
              </TabsTrigger>
              <TabsTrigger
                value="recurring"
                className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Recurring</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="ledger" className="mt-0">
              {showTransactionCreator && (
                <TransactionCreator onClose={() => setShowTransactionCreator(false)} />
              )}
              <TransactionLedger />
            </TabsContent>

            <TabsContent value="party" className="mt-0">
              <div className="max-w-2xl">
                <PartyFundsCard />
              </div>
            </TabsContent>

            <TabsContent value="recurring" className="mt-0">
              <RecurringExpensesList />
            </TabsContent>
          </div>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
