import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, CircleDollarSign, RadioTower, ScrollText, ShieldAlert, Users } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCampaign } from '@/contexts/CampaignContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { useQuest } from '@/contexts/QuestContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useSession } from '@/contexts/SessionContext';
import { useNavigate } from 'react-router-dom';

type AlertSeverity = 'critical' | 'warning' | 'info';

interface GMAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  icon: React.ElementType;
  actionLabel?: string;
  actionPath?: string;
}

const severityClass: Record<AlertSeverity, string> = {
  critical: 'border-red-500/40 bg-red-500/10 text-red-300',
  warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
  info: 'border-terminal-primary/40 bg-terminal-primary/10 text-terminal-primary',
};

export function GMAlertCenter() {
  const navigate = useNavigate();
  const { isGM, characters, vehicles, activeCharacter } = useCampaign();
  const { upcomingEvents } = useCalendar();
  const { quests } = useQuest();
  const { partyFunds, recurringExpenses } = useFinance();
  const { sessions } = useSession();
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('gm_alert_center_acknowledged') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const openCenter = () => setOpen(true);
    window.addEventListener('gm-alert-center:open', openCenter);
    return () => window.removeEventListener('gm-alert-center:open', openCenter);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gm_alert_center_acknowledged', JSON.stringify(acknowledged));
    }
  }, [acknowledged]);

  const alerts = useMemo<GMAlert[]>(() => {
    const activeQuests = quests.filter((quest) => quest.status === 'active');
    const urgentQuests = activeQuests.filter((quest) => quest.priority === 'urgent' || quest.priority === 'high');
    const activeExpenses = recurringExpenses.filter((expense) => expense.is_active);
    const lowFunds = (partyFunds?.balance ?? 0) < 10000;
    const draftQuests = quests.filter((quest) => quest.is_hidden);
    const nextSession = sessions.find((session) => session.status !== 'completed');

    return [
      ...(!activeCharacter ? [{
        id: 'no-active-character',
        severity: 'warning' as const,
        title: 'No active character selected',
        detail: 'Player-facing crew-scoped content may appear empty until an active character is selected.',
        icon: Users,
        actionLabel: 'Open Crew',
        actionPath: '/app/crew',
      }] : []),
      ...(vehicles.length === 0 ? [{
        id: 'no-vehicles',
        severity: 'warning' as const,
        title: 'No vessels in hangar',
        detail: 'Ship dashboards, finance summaries, and bridge readiness have no primary vessel to reference.',
        icon: ShieldAlert,
        actionLabel: 'Open Hangar',
        actionPath: '/app/vehicles',
      }] : []),
      ...(urgentQuests.length > 0 ? [{
        id: 'urgent-quests',
        severity: 'critical' as const,
        title: `${urgentQuests.length} high-priority quest${urgentQuests.length === 1 ? '' : 's'}`,
        detail: urgentQuests.slice(0, 2).map((quest) => quest.title).join(' · '),
        icon: AlertTriangle,
        actionLabel: 'Open Quests',
        actionPath: '/app/campaign?subtab=quests',
      }] : []),
      ...(draftQuests.length > 0 ? [{
        id: 'hidden-quests',
        severity: 'info' as const,
        title: `${draftQuests.length} hidden quest draft${draftQuests.length === 1 ? '' : 's'}`,
        detail: 'These are visible to GMs only until revealed.',
        icon: ScrollText,
        actionLabel: 'Review Drafts',
        actionPath: '/app/campaign?subtab=quests',
      }] : []),
      ...(upcomingEvents.length > 0 ? [{
        id: 'upcoming-events',
        severity: 'info' as const,
        title: `${upcomingEvents.length} upcoming calendar event${upcomingEvents.length === 1 ? '' : 's'}`,
        detail: `${upcomingEvents[0].title} · ${upcomingEvents[0].imperial_date}`,
        icon: CalendarClock,
        actionLabel: 'Open Calendar',
        actionPath: '/app/campaign?subtab=calendar',
      }] : []),
      ...(lowFunds ? [{
        id: 'low-party-funds',
        severity: (partyFunds?.balance ?? 0) < 0 ? 'critical' as const : 'warning' as const,
        title: 'Party funds need attention',
        detail: `Current balance: Cr${(partyFunds?.balance ?? 0).toLocaleString()} · ${activeExpenses.length} active recurring expense${activeExpenses.length === 1 ? '' : 's'}`,
        icon: CircleDollarSign,
        actionLabel: 'Open Campaign',
        actionPath: '/app/campaign',
      }] : []),
      ...(!nextSession ? [{
        id: 'no-session',
        severity: 'info' as const,
        title: 'No next session scheduled',
        detail: 'Create or mark a session as planned/in progress to populate player-facing recaps.',
        icon: RadioTower,
        actionLabel: 'Open Sessions',
        actionPath: '/app/campaign?subtab=sessions',
      }] : []),
      ...(characters.length === 0 ? [{
        id: 'empty-roster',
        severity: 'warning' as const,
        title: 'Crew roster is empty',
        detail: 'No character records are available for active crew assignment or combat imports.',
        icon: Users,
        actionLabel: 'Open Crew',
        actionPath: '/app/crew',
      }] : []),
    ];
  }, [activeCharacter, characters.length, partyFunds?.balance, quests, recurringExpenses, sessions, upcomingEvents, vehicles.length]);

  const visibleAlerts = alerts.filter((alert) => !acknowledged.includes(alert.id));

  if (!isGM) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-xl bg-black border-terminal-primary/40 text-terminal-primary overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-terminal-primary font-mono tracking-[0.18em] uppercase flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" /> GM Alert Center
          </SheetTitle>
          <SheetDescription className="text-terminal-primary/60">
            Operational issues, hidden prep, and campaign state reminders.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 flex items-center justify-between">
          <Badge className="border-terminal-primary/40 bg-terminal-primary/10 text-terminal-primary">
            {visibleAlerts.length} active
          </Badge>
          {acknowledged.length > 0 && (
            <Button variant="outline" size="sm" className="border-terminal-primary/30 text-terminal-primary hover:bg-terminal-primary/10" onClick={() => setAcknowledged([])}>
              Restore acknowledged
            </Button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {visibleAlerts.length === 0 ? (
            <div className="rounded border border-terminal-primary/30 bg-terminal-primary/5 p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-terminal-primary/70" />
              <p className="mt-3 font-mono text-sm text-terminal-primary/70">All current alerts acknowledged.</p>
            </div>
          ) : visibleAlerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div key={alert.id} className={`rounded border p-3 ${severityClass[alert.severity]}`}>
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-semibold">{alert.title}</div>
                    <p className="mt-1 text-xs opacity-75">{alert.detail}</p>
                    <div className="mt-3 flex gap-2">
                      {alert.actionPath && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-current text-current hover:bg-current/10"
                          onClick={() => {
                            navigate(alert.actionPath!);
                            setOpen(false);
                          }}
                        >
                          {alert.actionLabel || 'Open'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-current hover:bg-current/10"
                        onClick={() => setAcknowledged((prev) => [...prev, alert.id])}
                      >
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
