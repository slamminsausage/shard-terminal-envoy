import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ListTodo, ScrollText, FileText, Image } from 'lucide-react';
import { NotesInterface } from './NotesInterface';
import { SessionsList } from '../sessions/SessionsList';
import { QuestBoard } from '../quests/QuestBoard';
import { CalendarView } from '../calendar/CalendarView';

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
    <div className="interface-container">
      <header className="interface-header">
        <div>
          <h1 className="interface-title">CAMPAIGN MANAGEMENT</h1>
          <p className="interface-subtitle">
            Manage sessions, quests, calendar, notes, and handouts
          </p>
        </div>
      </header>

      <div className="interface-content">
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="terminal-tabs-list grid-cols-5 mb-4">
            <TabsTrigger value="sessions" className="terminal-tab-trigger">
              <ScrollText className="h-4 w-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="quests" className="terminal-tab-trigger">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Quests</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="terminal-tab-trigger">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="terminal-tab-trigger">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="handouts" className="terminal-tab-trigger">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Handouts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="mt-0">
            <SessionsList />
          </TabsContent>

          <TabsContent value="quests" className="mt-0">
            <QuestBoard />
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <CalendarView />
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <div className="campaign-notes-wrapper">
              <NotesInterface defaultTab="notes" />
            </div>
          </TabsContent>

          <TabsContent value="handouts" className="mt-0">
            <div className="campaign-handouts-wrapper">
              <NotesInterface defaultTab="handouts" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
