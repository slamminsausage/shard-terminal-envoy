# Player Crew Assignment — Implementation Plan

## Goal
Support Pirates of Drinax with multiple ships, independent color-coded crew groups, and job assignments. Both PCs and NPCs can belong to a crew and hold a position. Crews exist independently and can optionally be assigned to a ship.

---

## Data Model

### New: Crew Group
```typescript
interface CrewGroup {
  id: string;
  player_id: string;           // campaign owner
  name: string;                // e.g. "Red Crew", "Harrier Crew"
  color: string;               // hex color, e.g. '#ff4444'
  ship_id?: string;            // optional vehicle ID this crew operates
  description?: string;        // optional notes
  created_at?: string;
  updated_at?: string;
}
```

### Character (new fields)
```typescript
crew_id?: string;        // references CrewGroup.id
crew_position?: string;  // job aboard ship — preset or custom string
```

### Ship Position Presets
```
Captain, Pilot, Astrogator, Engineer, Medic, Gunner, Marine, Steward, Sensor Operator
```
Plus free-text custom entry.

### Preset Crew Colors
```
Red (#ff4444), Blue (#4488ff), Green (#44ff88), Gold (#ffcc00), Purple (#bb77ff), Cyan (#00ccff)
```

---

## Phase 1: Foundation — Fix Bugs & Add Fields

### 1a. Fix `saveCharacter()` — persist `character_type` and `npc_role`
- **File**: `src/lib/supabase.ts`
- Add `character_type` and `npc_role` to the `dbPayload` in `saveCharacter()`
- Critical bug: NPCs lose their type on save

### 1b. Add crew fields to Character type
- **File**: `src/types/database.ts`
- Add `crew_id?: string` and `crew_position?: string` to `Character`

### 1c. Add CrewGroup type
- **File**: `src/types/database.ts`
- Add the `CrewGroup` interface

### 1d. Database migration
- **File**: `supabase/migrations/` (new file)
```sql
-- Crew groups table
CREATE TABLE IF NOT EXISTS public.crew_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT DEFAULT 'campaign',
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#00ff00',
  ship_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crew_groups ENABLE ROW LEVEL SECURITY;

-- Character crew fields
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS crew_id UUID REFERENCES public.crew_groups(id) ON DELETE SET NULL;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS crew_position TEXT;
```

### 1e. Update `saveCharacter()` with all new fields
- **File**: `src/lib/supabase.ts`
- Map `character_type`, `npc_role`, `crew_id`, `crew_position` into `dbPayload`
- Update localStorage paths too

### 1f. Add Supabase helpers for CrewGroup CRUD
- **File**: `src/lib/supabase.ts`
- `fetchCrewGroups(playerId)`, `saveCrewGroup(group)`, `deleteCrewGroup(id)`
- localStorage fallback for each

---

## Phase 2: Crew Context & State Management

### 2a. Create CrewContext (or extend CampaignContext)
- **File**: `src/contexts/CampaignContext.tsx` (extend existing)
- Add to CampaignContext state:
  - `crewGroups: CrewGroup[]`
  - `addCrewGroup()`, `updateCrewGroup()`, `deleteCrewGroup()`
  - `assignCharacterToCrew(characterId, crewId, position)`
  - `removeCharacterFromCrew(characterId)`
- Load crew groups alongside characters and vehicles on campaign load
- Extending CampaignContext keeps it alongside the existing character/vehicle CRUD that crew management depends on

---

## Phase 3: Crew Management UI

### 3a. Crew Group Manager component
- **File**: `src/components/crew/CrewGroupManager.tsx` (new)
- Accessible from the Crew Interface
- Create / edit / delete crew groups
- Set name, pick color (preset palette + custom), optionally link a ship
- Shows member count per crew

### 3b. Redesign `CrewAssignmentDialog`
- **File**: `src/components/crew/CrewAssignmentDialog.tsx`
- Rework to show:
  - Current crew members with their positions
  - Dropdown to select crew group when assigning
  - Position selector: preset dropdown + "Custom..." text input option
  - Unassigned pool of characters to pick from
- On save: updates character's `crew_id` and `crew_position`
- GM can assign anyone; players can assign their own characters

### 3c. Quick crew assign on character cards
- In the CrewInterface roster, add a quick-assign dropdown on each character card
- Pick crew from dropdown, shows color swatch next to each option
- Position can be set inline or via a popup

---

## Phase 4: Crew Interface Enhancements

### 4a. Crew roster grouping mode
- **File**: `src/components/interfaces/CrewInterface.tsx`
- Add a **"Group by Crew"** toggle alongside existing filters
- When active, roster sections by crew group:
  - Each section has colored header bar matching crew color
  - Ship name shown if crew has one assigned
  - Members listed with position badges
  - "Unassigned" section at the bottom for characters without a crew
- Preserve existing "All / PC / NPC" filter — works alongside grouping

### 4b. Color-coded crew badges on character cards
- In both grouped and ungrouped views, show:
  - Colored dot/tag with crew label (e.g. "Red Crew" with red accent)
  - Position badge (e.g. "Pilot") in secondary style
- Unassigned characters show "No Crew" in muted style

### 4c. Crew filter dropdown
- Add to existing filter bar: "Filter by Crew" dropdown
- Options: All Crews / [each crew name with color swatch] / Unassigned
- Stacks with PC/NPC filter

---

## Phase 5: Character Creation Crew Selection

### 5a. Add crew selection to CharacterGenerator final step
- **File**: `src/components/character-gen/CharacterGenerator.tsx`
- At the review/save stage, show a "Crew Assignment" panel:
  - List of crew groups with color, name, ship (if any), current count
  - Position dropdown (presets + custom)
  - "Skip — assign later" option
- Save `crew_id` and `crew_position` with the character

### 5b. Add crew section to Character Sheet editing
- **File**: `src/components/crew/CharacterSheet.tsx`
- In edit mode, add "Crew Assignment" section:
  - Crew group selector (dropdown with color swatches)
  - Position selector (presets + custom input)
  - Shows current assignment with colored badge

---

## Phase 6: Display Polish

### 6a. Character Sheet header crew display
- **File**: `src/components/crew/CharacterSheet.tsx`
- In the info header area (read mode), display:
  - Crew name with color indicator dot
  - Ship name (if crew has one)
  - Position/job title

### 6b. Vehicle Sheet crew manifest
- **File**: `src/components/crew/VehicleSheet.tsx`
- Add "Crew Manifest" section showing:
  - All characters whose crew is linked to this ship
  - Each member's name, PC/NPC badge, position
  - Crew color accent on the section header

---

## Implementation Order
1. **Phase 1** — Foundation (bugs + types + migration + persistence)
2. **Phase 2** — Context/state management for crew groups
3. **Phase 3** — Crew management UI (create crews, assign members)
4. **Phase 4** — Crew Interface enhancements (grouping, badges, filters)
5. **Phase 5** — Character creation crew selection
6. **Phase 6** — Display polish on sheets

---

## Permissions Model
- **GM**: Can create/edit/delete crew groups, assign any character to any crew
- **Players**: Can assign their own characters to a crew and pick their position; cannot modify crew group settings or assign other players' characters

## Notes
- `vehicle.crew_requirements` is kept for backward compatibility but the source of truth for crew membership moves to `character.crew_id`
- The crew color system is purely visual — terminal-themed with CRT glow effects matching each color
- All crew data falls back to localStorage when Supabase is unavailable
