# Bridge Console Integration Plan
## Integrating into Terminal Envoy (Eclipse Shard Saga)

**Date:** December 2025  
**Target:** Add Bridge Console as 4th tab in MainframeShell  
**Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind

---

## Integration Overview

### Current MainframeShell Tabs
```
1. Terminal Interface    - Log reading, access codes
2. Crew & Sheets        - Character management  
3. Vehicles & Spaceships - Ship tracking
```

### After Integration
```
1. Terminal Interface    - Log reading, access codes
2. Crew & Sheets        - Character management
3. Vehicles & Spaceships - Ship tracking
4. Bridge Console (NEW)  - Tactical display, comms, navigation
```

---

## Access Model

**Same as your existing app:** Open access, anyone can view and edit everything.

- **You (GM):** Control ship positions, send messages from your laptop
- **Players:** View the same interface on the TV or their devices
- **No login required:** Just like your current terminal system

Since you're the one driving the session, you'll be the one moving enemy ships and sending messages - players will naturally just watch the tactical display and read messages. No need for role-based restrictions.

---

## Architecture

### New Files Structure

```
src/
├── components/
│   ├── bridge/
│   │   ├── BridgeConsole.tsx        # Main container
│   │   ├── TacticalDisplay.tsx      # Hex grid with ships
│   │   ├── CommunicationsPanel.tsx  # Messages list
│   │   ├── ContactsList.tsx         # Detected ships
│   │   ├── ShipStatusMini.tsx       # Quick status
│   │   ├── NavigationInfo.tsx       # Position/destination/ETA
│   │   ├── ActionBar.tsx            # Alert, scan, hail buttons
│   │   └── hooks/
│   │       ├── useBridgeState.ts    # Bridge state management
│   │       ├── useContacts.ts       # Ship tracking
│   │       └── useMessages.ts       # Comms state
│   └── interfaces/
│       └── MainframeShell.tsx       # ADD: Bridge tab
├── lib/
│   ├── bridge/
│   │   ├── bridgeTypes.ts           # TypeScript interfaces
│   │   ├── shipTemplates.ts         # Pre-built ship stats
│   │   └── hexGrid.ts               # Hex math utilities
│   └── supabase.ts                  # ADD: bridge tables
└── contexts/
    └── BridgeContext.tsx            # Bridge state context
```

### Database Schema Additions (Supabase)

```sql
-- Bridge state per campaign session
CREATE TABLE bridge_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Current state
  mode TEXT DEFAULT 'tactical', -- 'tactical' | 'navigation' | 'stellar'
  current_system TEXT DEFAULT 'Drinax',
  destination TEXT,
  eta TEXT,
  alert_level TEXT DEFAULT 'normal', -- 'normal' | 'elevated' | 'combat' | 'emergency'
  
  -- Player ship reference
  player_ship_id UUID REFERENCES vehicles(id)
);

-- Ships in current tactical view
CREATE TABLE bridge_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_state_id UUID REFERENCES bridge_state(id) ON DELETE CASCADE,
  
  -- Ship identity
  name TEXT NOT NULL,
  ship_class TEXT,
  tonnage INTEGER,
  
  -- Tactical state
  status TEXT DEFAULT 'unknown', -- 'friendly' | 'unknown' | 'enemy'
  hex_q INTEGER DEFAULT 0,
  hex_r INTEGER DEFAULT 0,
  facing INTEGER DEFAULT 0, -- 0-5 for hex directions
  
  -- Combat state
  hull_current INTEGER,
  hull_max INTEGER,
  is_player_ship BOOLEAN DEFAULT FALSE,
  
  -- Reference to full vehicle if exists
  vehicle_id UUID REFERENCES vehicles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages/transmissions
CREATE TABLE bridge_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_state_id UUID REFERENCES bridge_state(id) ON DELETE CASCADE,
  
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'normal' | 'priority' | 'emergency'
  encrypted BOOLEAN DEFAULT FALSE,
  encryption_difficulty INTEGER, -- Roll required to decrypt
  
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sector annotations (campaign notes per world)
CREATE TABLE sector_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Location
  sector_name TEXT NOT NULL,
  hex TEXT NOT NULL, -- e.g., "1910"
  world_name TEXT,
  
  -- Flags
  visited BOOLEAN DEFAULT FALSE,
  safe_haven BOOLEAN DEFAULT FALSE,
  hostile BOOLEAN DEFAULT FALSE,
  network_present BOOLEAN DEFAULT FALSE,
  hideout BOOLEAN DEFAULT FALSE,
  patron BOOLEAN DEFAULT FALSE,
  active_mission BOOLEAN DEFAULT FALSE,
  treasure BOOLEAN DEFAULT FALSE,
  custom_flags JSONB DEFAULT '[]',
  
  -- Notes
  gm_notes TEXT, -- Hidden from players
  player_notes TEXT, -- Visible to all
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(sector_name, hex)
);

-- Enable realtime for bridge tables
ALTER PUBLICATION supabase_realtime ADD TABLE bridge_state;
ALTER PUBLICATION supabase_realtime ADD TABLE bridge_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE bridge_messages;
```

---

## Component Specifications

### BridgeConsole.tsx (Main Container)

```tsx
import { useBridgeState } from './hooks/useBridgeState';
import { TacticalDisplay } from './TacticalDisplay';
import { CommunicationsPanel } from './CommunicationsPanel';
import { ContactsList } from './ContactsList';
import { ShipStatusMini } from './ShipStatusMini';
import { NavigationInfo } from './NavigationInfo';
import { ActionBar } from './ActionBar';

export function BridgeConsole() {
  const { bridgeState, contacts, messages, isGM } = useBridgeState();
  
  return (
    <div className="bridge-console h-full flex flex-col">
      {/* Header */}
      <BridgeHeader 
        shipName={bridgeState.playerShip?.name}
        alertLevel={bridgeState.alertLevel}
      />
      
      {/* Main Content */}
      <div className="flex-1 grid grid-cols-[1fr_320px] gap-3 p-3">
        {/* Left: Tactical/Navigation Display */}
        <div className="flex flex-col">
          <TacticalDisplay 
            contacts={contacts}
            mode={bridgeState.mode}
            onShipSelect={handleShipSelect}
          />
          <NavigationInfo 
            currentSystem={bridgeState.currentSystem}
            destination={bridgeState.destination}
            eta={bridgeState.eta}
          />
        </div>
        
        {/* Right: Sidebar */}
        <div className="flex flex-col gap-3">
          <CommunicationsPanel 
            messages={messages}
            onMessageClick={handleMessageClick}
          />
          <ContactsList 
            contacts={contacts}
            onContactClick={handleContactClick}
          />
          <ShipStatusMini ship={bridgeState.playerShip} />
        </div>
      </div>
      
      {/* Action Bar */}
      <ActionBar 
        isGM={isGM}
        onAlert={handleAlert}
        onScan={handleScan}
        onHail={handleHail}
        onEmergency={handleEmergency}
      />
    </div>
  );
}
```

### TacticalDisplay.tsx (Hex Grid)

```tsx
interface Contact {
  id: string;
  name: string;
  status: 'friendly' | 'unknown' | 'enemy';
  hexQ: number;
  hexR: number;
  facing: number;
  isPlayerShip: boolean;
}

interface TacticalDisplayProps {
  contacts: Contact[];
  mode: 'tactical' | 'navigation';
  onShipSelect: (contactId: string) => void;
}

export function TacticalDisplay({ contacts, mode, onShipSelect }: TacticalDisplayProps) {
  // Hex grid rendering using SVG
  // Color coding:
  //   friendly (green): #00ff88
  //   unknown (blue): #00ccff  
  //   enemy (red): #ff4455
  
  return (
    <div className="tactical-display flex-1 relative bg-panel border border-border rounded">
      <div className="panel-header">
        <span>NAVIGATION</span>
        <span>{mode === 'tactical' ? 'TACTICAL VIEW' : 'STELLAR MAP'}</span>
      </div>
      
      <svg viewBox="0 0 500 500" className="w-full h-full">
        {/* Range rings */}
        <circle className="range-ring" cx="250" cy="250" r="60" />
        <circle className="range-ring" cx="250" cy="250" r="120" />
        <circle className="range-ring" cx="250" cy="250" r="180" />
        
        {/* Crosshairs */}
        <line className="crosshairs" x1="250" y1="50" x2="250" y2="450" />
        <line className="crosshairs" x1="50" y1="250" x2="450" y2="250" />
        
        {/* Ships */}
        {contacts.map(contact => (
          <ShipMarker 
            key={contact.id}
            contact={contact}
            onClick={() => onShipSelect(contact.id)}
          />
        ))}
      </svg>
    </div>
  );
}
```

### useBridgeState.ts (Real-time State Hook)

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useBridgeState() {
  const [bridgeState, setBridgeState] = useState<BridgeState | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Load initial state
  useEffect(() => {
    loadBridgeState();
    loadContacts();
    loadMessages();
  }, []);
  
  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('bridge-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bridge_state'
      }, handleStateChange)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bridge_contacts'
      }, handleContactsChange)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bridge_messages'
      }, handleNewMessage)
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Ship management (anyone can use - you'll control during sessions)
  const moveShip = async (contactId: string, hexQ: number, hexR: number) => {
    await supabase
      .from('bridge_contacts')
      .update({ hex_q: hexQ, hex_r: hexR })
      .eq('id', contactId);
  };
  
  const addContact = async (contact: Partial<Contact>) => {
    await supabase
      .from('bridge_contacts')
      .insert({ 
        bridge_state_id: bridgeState?.id,
        ...contact 
      });
  };
  
  const removeContact = async (contactId: string) => {
    await supabase
      .from('bridge_contacts')
      .delete()
      .eq('id', contactId);
  };
  
  const updateContactStatus = async (contactId: string, status: 'friendly' | 'unknown' | 'enemy') => {
    await supabase
      .from('bridge_contacts')
      .update({ status })
      .eq('id', contactId);
  };
  
  // Messages (you send as NPCs during sessions)
  const sendMessage = async (sender: string, content: string, priority: string = 'normal') => {
    await supabase
      .from('bridge_messages')
      .insert({ 
        bridge_state_id: bridgeState?.id,
        sender, 
        content, 
        priority 
      });
  };
  
  const markMessageRead = async (messageId: string) => {
    await supabase
      .from('bridge_messages')
      .update({ is_read: true })
      .eq('id', messageId);
  };
  
  // Alert level
  const updateAlertLevel = async (level: 'normal' | 'elevated' | 'combat' | 'emergency') => {
    await supabase
      .from('bridge_state')
      .update({ alert_level: level })
      .eq('id', bridgeState?.id);
  };
  
  // Navigation
  const updateNavigation = async (currentSystem: string, destination?: string, eta?: string) => {
    await supabase
      .from('bridge_state')
      .update({ 
        current_system: currentSystem,
        destination,
        eta
      })
      .eq('id', bridgeState?.id);
  };
  
  return {
    bridgeState,
    contacts,
    messages,
    // Ship actions
    moveShip,
    addContact,
    removeContact,
    updateContactStatus,
    // Message actions
    sendMessage,
    markMessageRead,
    // Bridge actions
    updateAlertLevel,
    updateNavigation,
  };
}
```

---

## Styling Integration

### Use Existing CRT Classes

Your terminal already has CRT effects. Bridge Console reuses them:

```tsx
// In BridgeConsole.tsx
<div className="bridge-console crt-screen">
  {/* Content */}
</div>
```

### Bridge-Specific Tailwind Classes

Add to your tailwind config or as component styles:

```css
/* Bridge Console specific styles */
.bridge-console {
  --friendly: #00ff88;
  --unknown: #00ccff;
  --enemy: #ff4455;
}

.ship-marker.friendly { color: var(--friendly); filter: drop-shadow(0 0 6px var(--friendly)); }
.ship-marker.unknown { color: var(--unknown); filter: drop-shadow(0 0 6px var(--unknown)); }
.ship-marker.enemy { color: var(--enemy); filter: drop-shadow(0 0 6px var(--enemy)); }

.range-ring {
  fill: none;
  stroke: var(--border);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.crosshairs {
  stroke: var(--primary-dim);
  stroke-width: 1;
  opacity: 0.5;
}
```

---

## MainframeShell Integration

### Update MainframeShell.tsx

```tsx
// Add import
import { BridgeConsole } from '@/components/bridge/BridgeConsole';

// Add to tabs array
const tabs = [
  { id: 'terminal', label: 'Terminal Interface', icon: Terminal },
  { id: 'crew', label: 'Crew & Sheets', icon: Users },
  { id: 'vehicles', label: 'Vehicles & Spaceships', icon: Ship },
  { id: 'bridge', label: 'Bridge Console', icon: Radar }, // NEW
];

// Add to tab content switch
{activeTab === 'bridge' && <BridgeConsole />}
```

---

## Integration with Existing Features

### Link to Vehicles Table

Your existing `vehicles` table has ship data. Bridge Console can reference it:

```tsx
// When adding a contact from your vehicle library
const addContactFromVehicle = async (vehicleId: string, status: string) => {
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .single();
  
  await supabase.from('bridge_contacts').insert({
    bridge_state_id: currentBridgeState.id,
    name: vehicle.name,
    ship_class: vehicle.ship_class,
    tonnage: vehicle.tonnage,
    hull_max: vehicle.hull,
    hull_current: vehicle.hull,
    status: status,
    vehicle_id: vehicleId, // Link back
  });
};
```

### Link to Characters (Crew)

When showing ship crew in Bridge Console:

```tsx
// Query characters assigned to the player ship
const { data: crew } = await supabase
  .from('characters')
  .select('*')
  .eq('vehicle_id', playerShip.id);
```

---

## Implementation Order

### Phase 1: Basic Bridge Tab (2-3 hours)
1. Create `BridgeConsole.tsx` with static mockup
2. Add tab to `MainframeShell.tsx`
3. Style with existing CRT classes
4. Verify it displays correctly

### Phase 2: Database + State (2-3 hours)
1. Create Supabase tables
2. Create `useBridgeState` hook
3. Load/display contacts from database
4. Load/display messages from database

### Phase 3: Real-Time Sync (2-3 hours)
1. Add Supabase real-time subscriptions
2. GM can move ships (updates database)
3. All clients see movement
4. GM can send messages

### Phase 4: GM Controls (2-3 hours)
1. Add GM control panel
2. Ship movement interface (click hex to move)
3. Message composer
4. Alert level controls
5. Add/remove contacts

### Phase 5: Polish (1-2 hours)
1. Ship movement animation
2. Message arrival animation
3. Alert level visual effects
4. Sound effects integration (use your existing audioManager)

---

## Quick Start

To get started immediately, I can create:

1. **`BridgeConsole.tsx`** - Full component with all UI
2. **`bridgeTypes.ts`** - TypeScript interfaces
3. **`useBridgeState.ts`** - State management hook
4. **SQL migration** - Database tables

Want me to generate these files ready to drop into your project?
