import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, ListTodo, ScrollText, FileText, Image } from 'lucide-react';
import { NotesInterface } from './NotesInterface';

// Placeholder components - will be implemented
const SessionsTab: React.FC = () => {
  return (
    <div className="p-4">
      <div className="text-terminal-primary text-center py-8">
        <h2 className="text-xl font-bold mb-2">Session Management</h2>
        <p className="text-terminal-primary/70">Coming soon...</p>
      </div>
    </div>
  );
};

const QuestsTab: React.FC = () => {
  return (
    <div className="p-4">
      <div className="text-terminal-primary text-center py-8">
        <h2 className="text-xl font-bold mb-2">Quest Tracker</h2>
        <p className="text-terminal-primary/70">Coming soon...</p>
      </div>
    </div>
  );
};

const CalendarTab: React.FC = () => {
  return (
    <div className="p-4">
      <div className="text-terminal-primary text-center py-8">
        <h2 className="text-xl font-bold mb-2">Imperial Calendar</h2>
        <p className="text-terminal-primary/70">Coming soon...</p>
      </div>
    </div>
  );
};

export const CampaignInterface: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (typeof window === "undefined") return "sessions";
    return localStorage.getItem("campaign_active_subtab") || "sessions";
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("campaign_active_subtab", activeSubTab);
    }
  }, [activeSubTab]);

  return (
    <div className="h-full flex flex-col bg-black text-terminal-primary font-mono">
      <div className="border-b border-terminal-primary/30 p-4">
        <h1 className="text-2xl font-bold text-terminal-primary">
          CAMPAIGN MANAGEMENT
        </h1>
        <p className="text-terminal-primary/70 text-sm mt-1">
          Manage sessions, quests, calendar, notes, and handouts
        </p>
      </div>

      <ScrollArea className="flex-1">
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <div className="sticky top-0 z-10 bg-black border-b border-terminal-primary/30 px-4 pt-4">
            <TabsList className="grid w-full grid-cols-5 bg-black border border-terminal-primary/30">
              <TabsTrigger
                value="sessions"
                className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary flex items-center gap-2"
              >
                <ScrollText className="h-4 w-4" />
                <span className="hidden sm:inline">Sessions</span>
              </TabsTrigger>
              <TabsTrigger
                value="quests"
                className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary flex items-center gap-2"
              >
                <ListTodo className="h-4 w-4" />
                <span className="hidden sm:inline">Quests</span>
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Notes</span>
              </TabsTrigger>
              <TabsTrigger
                value="handouts"
                className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary flex items-center gap-2"
              >
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Handouts</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="sessions" className="mt-0">
              <SessionsTab />
            </TabsContent>

            <TabsContent value="quests" className="mt-0">
              <QuestsTab />
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <CalendarTab />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              {/* Wrap NotesInterface in a container that starts on the "notes" tab */}
              <div className="campaign-notes-wrapper">
                <NotesInterface defaultTab="notes" />
              </div>
            </TabsContent>

            <TabsContent value="handouts" className="mt-0">
              {/* Wrap NotesInterface in a container that starts on the "handouts" tab */}
              <div className="campaign-handouts-wrapper">
                <NotesInterface defaultTab="handouts" />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
