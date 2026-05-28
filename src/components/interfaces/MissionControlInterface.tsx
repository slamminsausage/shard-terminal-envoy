import React, { useMemo } from 'react';
import { Activity, AlertTriangle, CalendarClock, CircleDollarSign, Compass, RadioTower, Rocket, ScrollText, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCampaign } from '@/contexts/CampaignContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { useQuest } from '@/contexts/QuestContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useSession } from '@/contexts/SessionContext';
import { useNavigate } from 'react-router-dom';

const statusTone = {
  nominal: 'border-terminal-primary/30 text-terminal-primary bg-terminal-primary/10',
  warning: 'border-yellow-500/40 text-yellow-300 bg-yellow-500/10',
  danger: 'border-red-500/40 text-red-300 bg-red-500/10',
};

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'nominal',
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
  tone?: keyof typeof statusTone;
}) {
  return (
    <Card className={`bg-black/80 ${statusTone[tone]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-xs uppercase tracking-[0.18em]">
          <span>{label}</span>
          <Icon className="h-4 w-4 opacity-70" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
        <p className="mt-1 text-xs opacity-70">{detail}</p>
      </CardContent>
    </Card>
  );
}

export const MissionControlInterface: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { characters, vehicles, activeCharacter, activeCrewId, crewGroups, isGM } = useCampaign();
  const { currentDate, upcomingEvents } = useCalendar();
  const { quests } = useQuest();
  const { partyFunds, recurringExpenses } = useFinance();
  const { sessions } = useSession();

  const activeQuests = useMemo(() => quests.filter((q) => q.status === 'active'), [quests]);
  const urgentQuests = useMemo(() => activeQuests.filter((q) => q.priority === 'urgent' || q.priority === 'high'), [activeQuests]);
  const activeCrew = activeCrewId ? crewGroups.find((crew) => crew.id === activeCrewId) : null;
  const nextSession = useMemo(() => sessions.find((session) => session.status !== 'completed'), [sessions]);
  const primaryShip = vehicles[0];
  const funds = partyFunds?.balance ?? 0;

  const quickLinks = [
    { label: 'Open Terminal', to: '/app/terminal', icon: RadioTower },
    { label: 'Crew Roster', to: '/app/crew', icon: Users },
    { label: 'Ship Hangar', to: '/app/vehicles', icon: Rocket },
    { label: 'Star Map', to: '/app/navigation', icon: Compass },
    { label: 'Campaign', to: '/app/campaign', icon: ScrollText },
  ];

  return (
    <div className="interface-container">
      <header className="interface-header">
        <div>
          <h1 className="interface-title">MISSION CONTROL</h1>
          <p className="interface-subtitle">Campaign operations dashboard and rapid-launch console</p>
        </div>
        <Badge className="border-terminal-primary/40 bg-terminal-primary/10 text-terminal-primary">
          {currentDate?.formatted ?? 'DATE SYNC PENDING'}
        </Badge>
      </header>

      <div className="interface-content space-y-5">
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard
            label="Crew Readiness"
            value={activeCrew?.name ?? activeCharacter?.name ?? 'No active crew'}
            detail={`${characters.length} known character${characters.length === 1 ? '' : 's'} in registry`}
            icon={Users}
            tone={activeCharacter || activeCrew ? 'nominal' : 'warning'}
          />
          <StatCard
            label="Ship Status"
            value={primaryShip?.name ?? 'No ship selected'}
            detail={primaryShip ? `${primaryShip.tonnage ?? 0} tons · ${primaryShip.vehicle_type ?? 'vessel'}` : 'Add a vessel in Hangar'}
            icon={Rocket}
            tone={primaryShip ? 'nominal' : 'warning'}
          />
          <StatCard
            label="Quest Load"
            value={activeQuests.length}
            detail={`${urgentQuests.length} high-priority objective${urgentQuests.length === 1 ? '' : 's'}`}
            icon={AlertTriangle}
            tone={urgentQuests.length > 0 ? 'warning' : 'nominal'}
          />
          <StatCard
            label="Party Funds"
            value={`Cr${funds.toLocaleString()}`}
            detail={`${recurringExpenses.filter((e) => e.is_active).length} active recurring expense${recurringExpenses.filter((e) => e.is_active).length === 1 ? '' : 's'}`}
            icon={CircleDollarSign}
            tone={funds < 0 ? 'danger' : funds < 10000 ? 'warning' : 'nominal'}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
          <Card className="bg-black/80 border-terminal-primary/30">
            <CardHeader>
              <CardTitle className="text-terminal-primary flex items-center gap-2">
                <Activity className="h-5 w-5" /> Operations Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...urgentQuests.slice(0, 3).map((quest) => ({
                key: `quest-${quest.id}`,
                title: quest.title,
                meta: `${quest.priority.toUpperCase()} QUEST · ${quest.location || 'location unknown'}`,
                tone: 'text-yellow-300',
              })), ...upcomingEvents.slice(0, 3).map((event) => ({
                key: `event-${event.id}`,
                title: event.title,
                meta: `${event.event_type.toUpperCase()} · ${event.imperial_date}`,
                tone: 'text-terminal-primary',
              }))].map((item) => (
                <div key={item.key} className="rounded border border-terminal-primary/20 bg-terminal-primary/5 p-3 font-mono">
                  <div className={`text-sm font-semibold ${item.tone}`}>{item.title}</div>
                  <div className="text-[11px] text-terminal-primary/50 mt-1">{item.meta}</div>
                </div>
              ))}
              {urgentQuests.length === 0 && upcomingEvents.length === 0 && (
                <div className="rounded border border-terminal-primary/20 bg-terminal-primary/5 p-6 text-center text-terminal-primary/60 font-mono text-sm">
                  No active alerts in the operations feed.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-terminal-primary/30">
            <CardHeader>
              <CardTitle className="text-terminal-primary flex items-center gap-2">
                <Shield className="h-5 w-5" /> Rapid Launch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map(({ label, to, icon: Icon }) => (
                <Button
                  key={to}
                  variant="outline"
                  className="w-full justify-start border-terminal-primary/30 text-terminal-primary hover:bg-terminal-primary/15"
                  onClick={() => navigate(to)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              ))}
              {isGM && (
                <Button
                  variant="outline"
                  className="w-full justify-start border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
                  onClick={() => window.dispatchEvent(new Event('gm-alert-center:open'))}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Open GM Alert Center
                </Button>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="bg-black/80 border-terminal-primary/30">
            <CardHeader className="pb-2"><CardTitle className="text-terminal-primary text-sm">Next Session</CardTitle></CardHeader>
            <CardContent className="font-mono text-sm text-terminal-primary/80">
              {nextSession ? `${nextSession.title} · ${nextSession.status}` : 'No session scheduled'}
            </CardContent>
          </Card>
          <Card className="bg-black/80 border-terminal-primary/30">
            <CardHeader className="pb-2"><CardTitle className="text-terminal-primary text-sm">Upcoming Event</CardTitle></CardHeader>
            <CardContent className="font-mono text-sm text-terminal-primary/80">
              {upcomingEvents[0] ? `${upcomingEvents[0].title} · ${upcomingEvents[0].imperial_date}` : 'No upcoming events'}
            </CardContent>
          </Card>
          <Card className="bg-black/80 border-terminal-primary/30">
            <CardHeader className="pb-2"><CardTitle className="text-terminal-primary text-sm">Command Hint</CardTitle></CardHeader>
            <CardContent className="font-mono text-sm text-terminal-primary/80">
              Press <kbd className="px-1 border border-terminal-primary/30 rounded">Ctrl/Cmd+K</kbd> for Command Palette 2.0.
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
});

MissionControlInterface.displayName = 'MissionControlInterface';
