/**
 * Global Command Palette / Search (Ctrl+K)
 * Allows searching across all campaign data
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
import { useNavigate } from 'react-router-dom';
import {
  User,
  Ship,
  FileText,
  MapPin,
  Swords,
  Terminal as TerminalIcon,
  Search,
} from 'lucide-react';
import { TERMINALS } from '@/lib/terminals';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'character' | 'vehicle' | 'note' | 'terminal' | 'world' | 'combat';
  icon: React.ReactNode;
  action: () => void;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { characters, vehicles } = useCampaign();
  const navigate = useNavigate();

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

  // Build search results (memoized for performance)
  const results = useMemo(() => {
    const results: SearchResult[] = [];

    // Search characters
    characters.forEach((char) => {
    const matchesSearch =
      searchQuery === '' ||
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.career?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.homeworld?.toLowerCase().includes(searchQuery.toLowerCase());

    if (matchesSearch) {
      results.push({
        id: `char-${char.id}`,
        title: char.name,
        subtitle: `${char.career || 'Character'} - ${char.species || 'Human'}`,
        type: 'character',
        icon: <User className="h-4 w-4" />,
        action: () => {
          navigate('/');
          setTimeout(() => {
            // Trigger character sheet opening via URL or event
            window.location.hash = `character-${char.id}`;
          }, 100);
          setOpen(false);
        },
      });
    }
  });

  // Search vehicles/ships
  vehicles.forEach((vehicle) => {
    const matchesSearch =
      searchQuery === '' ||
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.class?.toLowerCase().includes(searchQuery.toLowerCase());

    if (matchesSearch) {
      results.push({
        id: `vehicle-${vehicle.id}`,
        title: vehicle.name,
        subtitle: `${vehicle.class || 'Vehicle'} - ${vehicle.tonnage || 0} tons`,
        type: 'vehicle',
        icon: <Ship className="h-4 w-4" />,
        action: () => {
          navigate('/');
          setTimeout(() => {
            window.location.hash = `vehicle-${vehicle.id}`;
          }, 100);
          setOpen(false);
        },
      });
    }
  });

  // Search terminals
  TERMINALS.forEach((terminal) => {
    const matchesSearch =
      searchQuery === '' ||
      terminal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      terminal.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (matchesSearch) {
      results.push({
        id: `terminal-${terminal.code}`,
        title: terminal.name,
        subtitle: `Terminal - Access Code: ${terminal.code}`,
        type: 'terminal',
        icon: <TerminalIcon className="h-4 w-4" />,
        action: () => {
          navigate('/');
          setTimeout(() => {
            window.location.hash = `terminal-${terminal.code}`;
          }, 100);
          setOpen(false);
        },
      });
    }
  });

    return results;
  }, [characters, vehicles, searchQuery, navigate]);

  // Quick navigation commands
  const quickNav = useMemo(() => [
    {
      id: 'nav-crew',
      title: 'Crew',
      subtitle: 'Manage characters',
      type: 'note' as const,
      icon: <User className="h-4 w-4" />,
      action: () => {
        navigate('/');
        window.location.hash = 'crew';
        setOpen(false);
      },
    },
    {
      id: 'nav-hangar',
      title: 'Hangar',
      subtitle: 'Manage vehicles & ships',
      type: 'note' as const,
      icon: <Ship className="h-4 w-4" />,
      action: () => {
        navigate('/');
        window.location.hash = 'hangar';
        setOpen(false);
      },
    },
    {
      id: 'nav-bridge',
      title: 'Bridge',
      subtitle: 'Tactical space combat',
      type: 'note' as const,
      icon: <MapPin className="h-4 w-4" />,
      action: () => {
        navigate('/');
        window.location.hash = 'bridge';
        setOpen(false);
      },
    },
    {
      id: 'nav-starmap',
      title: 'Star Map',
      subtitle: 'Jump planner & navigation',
      type: 'note' as const,
      icon: <MapPin className="h-4 w-4" />,
      action: () => {
        navigate('/');
        window.location.hash = 'starmap';
        setOpen(false);
      },
    },
    {
      id: 'nav-notes',
      title: 'Notes',
      subtitle: 'Campaign notes & handouts',
      type: 'note' as const,
      icon: <FileText className="h-4 w-4" />,
      action: () => {
        navigate('/');
        window.location.hash = 'notes';
        setOpen(false);
      },
    },
    {
      id: 'nav-combat',
      title: 'Combat Tracker',
      subtitle: 'Initiative & combat management',
      type: 'combat' as const,
      icon: <Swords className="h-4 w-4" />,
      action: () => {
        navigate('/');
        window.location.hash = 'combat';
        setOpen(false);
      },
    },
    {
      id: 'nav-terminal',
      title: 'Terminal',
      subtitle: 'Access terminal logs',
      type: 'terminal' as const,
      icon: <TerminalIcon className="h-4 w-4" />,
      action: () => {
        navigate('/');
        window.location.hash = 'terminal';
        setOpen(false);
      },
    },
  ], [navigate]);

  // Group results by type (memoized)
  const characterResults = useMemo(() => results.filter((r) => r.type === 'character'), [results]);
  const vehicleResults = useMemo(() => results.filter((r) => r.type === 'vehicle'), [results]);
  const terminalResults = useMemo(() => results.filter((r) => r.type === 'terminal'), [results]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search characters, vehicles, terminals, or navigate..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6">
            <Search className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No results found.</p>
          </div>
        </CommandEmpty>

        {searchQuery === '' && (
          <CommandGroup heading="Quick Navigation">
            {quickNav.map((item) => (
              <CommandItem key={item.id} onSelect={item.action}>
                <div className="flex items-center gap-2">
                  {item.icon}
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {characterResults.length > 0 && (
          <>
            {searchQuery === '' && <CommandSeparator />}
            <CommandGroup heading="Characters">
              {characterResults.slice(0, 5).map((result) => (
                <CommandItem key={result.id} onSelect={result.action}>
                  <div className="flex items-center gap-2">
                    {result.icon}
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {vehicleResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Vehicles & Ships">
              {vehicleResults.slice(0, 5).map((result) => (
                <CommandItem key={result.id} onSelect={result.action}>
                  <div className="flex items-center gap-2">
                    {result.icon}
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {terminalResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Terminals">
              {terminalResults.slice(0, 5).map((result) => (
                <CommandItem key={result.id} onSelect={result.action}>
                  <div className="flex items-center gap-2">
                    {result.icon}
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
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
