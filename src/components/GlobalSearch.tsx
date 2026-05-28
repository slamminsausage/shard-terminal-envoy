/**
 * Global Command Palette / Search (Ctrl+K)
 * Allows searching across all campaign data and running fast app actions.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useCampaign } from '@/contexts/CampaignContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { useQuest } from '@/contexts/QuestContext';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarDays,
  FileText,
  LayoutDashboard,
  MapPin,
  RadioTower,
  Rocket,
  ScrollText,
  Search,
  Ship,
  Swords,
  Terminal as TerminalIcon,
  User,
  Users,
} from 'lucide-react';
import { TERMINALS } from '@/lib/terminals';

type SearchResultType = 'character' | 'vehicle' | 'terminal' | 'navigation' | 'action' | 'quest' | 'calendar';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: SearchResultType;
  icon: React.ReactNode;
  action: () => void;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { characters, vehicles, isGM } = useCampaign();
  const { upcomingEvents } = useCalendar();
  const { quests } = useQuest();
  const navigate = useNavigate();

  const runAction = (action: () => void) => {
    action();
    setOpen(false);
    setSearchQuery('');
  };

  // Listen for Ctrl+K / Cmd+K and Ctrl+F / Cmd+F
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'f') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  // Build search results (memoized for performance)
  const results = useMemo(() => {
    const results: SearchResult[] = [];

    characters.forEach((char) => {
      const matchesSearch =
        query === '' ||
        char.name.toLowerCase().includes(query) ||
        char.career?.toLowerCase().includes(query) ||
        char.homeworld?.toLowerCase().includes(query);

      if (matchesSearch) {
        results.push({
          id: `char-${char.id}`,
          title: char.name,
          subtitle: `${char.career || 'Character'} · ${char.species || 'Human'}`,
          type: 'character',
          icon: <User className="h-4 w-4" />,
          action: () => navigate(`/character-view/${char.id}`),
        });
      }
    });

    vehicles.forEach((vehicle) => {
      const vehicleClass = vehicle.class_type || vehicle.vehicle_type || 'Vehicle';
      const matchesSearch =
        query === '' ||
        vehicle.name.toLowerCase().includes(query) ||
        vehicleClass.toLowerCase().includes(query);

      if (matchesSearch) {
        results.push({
          id: `vehicle-${vehicle.id}`,
          title: vehicle.name,
          subtitle: `${vehicleClass} · ${vehicle.tonnage || 0} tons`,
          type: 'vehicle',
          icon: <Ship className="h-4 w-4" />,
          action: () => navigate(`/vehicle-view/${vehicle.id}`),
        });
      }
    });

    TERMINALS.forEach((terminal) => {
      const matchesSearch =
        query === '' ||
        terminal.name.toLowerCase().includes(query) ||
        terminal.code.toLowerCase().includes(query);

      if (matchesSearch) {
        results.push({
          id: `terminal-${terminal.code}`,
          title: terminal.name,
          subtitle: `Terminal · Access Code: ${terminal.code}`,
          type: 'terminal',
          icon: <TerminalIcon className="h-4 w-4" />,
          action: () => navigate('/app/terminal'),
        });
      }
    });

    quests.forEach((quest) => {
      const matchesSearch =
        query === '' ||
        quest.title.toLowerCase().includes(query) ||
        quest.description?.toLowerCase().includes(query) ||
        quest.location?.toLowerCase().includes(query);

      if (matchesSearch) {
        results.push({
          id: `quest-${quest.id}`,
          title: quest.title,
          subtitle: `${quest.status} quest · ${quest.priority} priority`,
          type: 'quest',
          icon: <ScrollText className="h-4 w-4" />,
          action: () => navigate('/app/campaign?subtab=quests'),
        });
      }
    });

    upcomingEvents.forEach((event) => {
      const matchesSearch =
        query === '' ||
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.event_type.toLowerCase().includes(query);

      if (matchesSearch) {
        results.push({
          id: `event-${event.id}`,
          title: event.title,
          subtitle: `${event.event_type} · ${event.imperial_date}`,
          type: 'calendar',
          icon: <CalendarDays className="h-4 w-4" />,
          action: () => navigate('/app/campaign?subtab=calendar'),
        });
      }
    });

    return results;
  }, [characters, vehicles, quests, upcomingEvents, query, navigate]);

  const quickNav = useMemo<SearchResult[]>(() => [
    { id: 'nav-mission', title: 'Mission Control', subtitle: 'Operations dashboard', type: 'navigation', icon: <LayoutDashboard className="h-4 w-4" />, action: () => navigate('/app/mission') },
    { id: 'nav-terminal', title: 'Terminal', subtitle: 'Access terminal logs', type: 'navigation', icon: <TerminalIcon className="h-4 w-4" />, action: () => navigate('/app/terminal') },
    { id: 'nav-crew', title: 'Crew', subtitle: 'Manage characters', type: 'navigation', icon: <Users className="h-4 w-4" />, action: () => navigate('/app/crew') },
    { id: 'nav-hangar', title: 'Hangar', subtitle: 'Manage vehicles & ships', type: 'navigation', icon: <Ship className="h-4 w-4" />, action: () => navigate('/app/vehicles') },
    { id: 'nav-bridge', title: 'Bridge', subtitle: 'Tactical bridge console', type: 'navigation', icon: <RadioTower className="h-4 w-4" />, action: () => navigate('/app/bridge') },
    { id: 'nav-starmap', title: 'Star Map', subtitle: 'Jump planner & navigation', type: 'navigation', icon: <MapPin className="h-4 w-4" />, action: () => navigate('/app/navigation') },
    { id: 'nav-campaign', title: 'Campaign', subtitle: 'Sessions, quests, calendar, notes', type: 'navigation', icon: <FileText className="h-4 w-4" />, action: () => navigate('/app/campaign') },
    { id: 'nav-combat', title: 'Combat Tracker', subtitle: 'Initiative & combat management', type: 'navigation', icon: <Swords className="h-4 w-4" />, action: () => navigate('/app/combat') },
  ], [navigate]);

  const quickActions = useMemo<SearchResult[]>(() => [
    { id: 'action-new-quest', title: 'Create Quest', subtitle: 'Open campaign quest board', type: 'action', icon: <ScrollText className="h-4 w-4" />, action: () => navigate('/app/campaign?subtab=quests') },
    { id: 'action-new-session', title: 'Plan Session', subtitle: 'Open session manager', type: 'action', icon: <CalendarDays className="h-4 w-4" />, action: () => navigate('/app/campaign?subtab=sessions') },
    { id: 'action-calendar', title: 'Schedule Calendar Event', subtitle: 'Open campaign calendar', type: 'action', icon: <CalendarDays className="h-4 w-4" />, action: () => navigate('/app/campaign?subtab=calendar') },
    { id: 'action-start-combat', title: 'Start Combat', subtitle: 'Open combat tracker', type: 'action', icon: <Swords className="h-4 w-4" />, action: () => navigate('/app/combat') },
    { id: 'action-open-vtt', title: 'Open VTT', subtitle: 'Launch tabletop canvas', type: 'action', icon: <Rocket className="h-4 w-4" />, action: () => navigate('/app/vtt') },
    ...(isGM ? [{ id: 'action-alert-center', title: 'Open GM Alert Center', subtitle: 'Review operational alerts', type: 'action' as const, icon: <AlertTriangle className="h-4 w-4" />, action: () => window.dispatchEvent(new Event('gm-alert-center:open')) }] : []),
  ], [isGM, navigate]);

  const characterResults = results.filter((r) => r.type === 'character');
  const vehicleResults = results.filter((r) => r.type === 'vehicle');
  const terminalResults = results.filter((r) => r.type === 'terminal');
  const questResults = results.filter((r) => r.type === 'quest');
  const calendarResults = results.filter((r) => r.type === 'calendar');

  const renderItem = (item: SearchResult) => (
    <CommandItem key={item.id} onSelect={() => runAction(item.action)}>
      <div className="flex items-center gap-2">
        {item.icon}
        <div className="flex flex-col">
          <span className="font-medium">{item.title}</span>
          {item.subtitle && <span className="text-xs text-muted-foreground">{item.subtitle}</span>}
        </div>
      </div>
    </CommandItem>
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search or run command..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6">
            <Search className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No commands or results found.</p>
          </div>
        </CommandEmpty>

        {searchQuery === '' && (
          <>
            <CommandGroup heading="Quick Navigation">
              {quickNav.map(renderItem)}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Quick Actions">
              {quickActions.map(renderItem)}
            </CommandGroup>
          </>
        )}

        {characterResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Characters">
              {characterResults.slice(0, 6).map(renderItem)}
            </CommandGroup>
          </>
        )}

        {vehicleResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Vehicles & Ships">
              {vehicleResults.slice(0, 6).map(renderItem)}
            </CommandGroup>
          </>
        )}

        {questResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Quests">
              {questResults.slice(0, 6).map(renderItem)}
            </CommandGroup>
          </>
        )}

        {calendarResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Calendar">
              {calendarResults.slice(0, 6).map(renderItem)}
            </CommandGroup>
          </>
        )}

        {terminalResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Terminals">
              {terminalResults.slice(0, 8).map(renderItem)}
            </CommandGroup>
          </>
        )}
      </CommandList>

      <div className="border-t p-2 text-xs text-muted-foreground">
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>{' '}
        or{' '}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          Ctrl
        </kbd>
        +
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          K
        </kbd>{' '}
        to toggle
      </div>
    </CommandDialog>
  );
}
