# CLAUDE.md

This file provides guidance for AI assistants working on the Shard Terminal Envoy codebase.

## Project Overview

**Shard Terminal Envoy** is a retro CRT-styled web application for managing *Eclipse Shard Saga*, a Traveller RPG campaign. It provides character creation, vehicle/ship management, a tactical bridge console, space navigation, combat tracking, session logs, finance tracking, quest management, and interactive in-game terminals.

## Tech Stack

- **Framework**: React 18.3 + TypeScript 5.8
- **Build Tool**: Vite 5.4 (with `@vitejs/plugin-react-swc`)
- **Styling**: Tailwind CSS 3.4 + CSS variables for terminal theme
- **UI Components**: shadcn/ui (Radix UI primitives) in `src/components/ui/`
- **Database**: Supabase (PostgreSQL) with localStorage fallback
- **State Management**: 11 React Context providers + TanStack React Query 5
- **Forms**: react-hook-form + Zod validation
- **Routing**: React Router DOM 6
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Commands

```bash
npm run dev        # Start dev server on port 8080
npm run build      # Production build (output: dist/)
npm run build:dev  # Development build with source maps
npm run lint       # ESLint check
npm run test       # Run Vitest tests
npm run preview    # Preview production build
```

## Project Structure

```
src/
├── components/          # React components (138 .tsx files)
│   ├── ui/              # shadcn/ui components (40+ primitives)
│   ├── interfaces/      # 7 major tab interfaces
│   │   ├── TerminalInterface.tsx
│   │   ├── CombatInterface.tsx
│   │   ├── CrewInterface.tsx
│   │   ├── VehicleInterface.tsx
│   │   ├── NotesInterface.tsx
│   │   ├── CampaignInterface.tsx
│   │   └── NexaInterface.tsx
│   ├── character-gen/   # Character creation state machine
│   │   ├── CharacterGenerator.tsx  # Main generator component
│   │   ├── careers/     # 14+ career definitions (scout, navy, marine, etc.)
│   │   │   └── pre-careers/  # University, Military Academy
│   │   ├── tables/      # Character generation data tables
│   │   ├── EventHandler.tsx
│   │   └── MusteringOut.tsx
│   ├── bridge/          # Tactical bridge console
│   ├── navigation/      # Jump planner & star map
│   ├── terminal/        # Terminal emulator & security
│   ├── crew/            # Character/NPC management
│   ├── combat/          # Combat system
│   ├── inventory/       # Equipment management
│   ├── sessions/        # Session tracking
│   ├── calendar/        # In-game calendar
│   ├── trade/           # Trading system
│   ├── finance/         # Financial tracking
│   ├── quests/          # Quest management
│   ├── layout/          # AppHeader, AppFooter
│   ├── auth/            # AccessCodeEntry
│   ├── MainframeShell.tsx  # Tab navigation hub
│   └── ErrorBoundary.tsx
├── contexts/            # 11 Context providers
│   ├── CampaignContext.tsx    # Auth, character/vehicle CRUD
│   ├── JumpPlannerContext.tsx  # Navigation & route planning
│   ├── BridgeContext.tsx      # Tactical bridge state
│   ├── SessionContext.tsx     # Session management
│   ├── QuestContext.tsx       # Quest tracking
│   ├── CalendarContext.tsx    # In-game calendar
│   ├── FinanceContext.tsx     # Credits/expenses
│   ├── InventoryContext.tsx   # Equipment tracking
│   ├── TradeContext.tsx       # Trade goods
│   ├── NotesContext.tsx       # Player notes & handouts
│   └── PlayerContext.tsx      # Player profile
├── hooks/               # Custom React hooks
│   ├── useBridgeState.ts      # Bridge console data + Supabase sync
│   ├── useTerminalSession.ts  # Terminal interaction logic
│   ├── useCharacterSkills.ts  # Skill management
│   ├── useKeyboardShortcuts.ts
│   ├── useTypewriter.ts      # Text animation effect
│   ├── usePinchZoom.ts
│   └── use-mobile.tsx, use-toast.ts, usePasswordAuth.ts, etc.
├── types/               # TypeScript type definitions
│   ├── database.ts      # Character, Vehicle, Player, AccessCode
│   ├── navigation.ts    # TravellerWorld, JumpWorld, RouteWorld
│   ├── shipCombat.ts    # Ship combat state & actions
│   ├── quest.ts, finance.ts, calendar.ts, notes.ts, session.ts,
│   │   npc.ts, trade.ts, inventory.ts
│   └── (11 files total)
├── lib/                 # Utilities and business logic
│   ├── supabase.ts      # Database helpers + local fallbacks
│   ├── dice.ts          # 2d6 rolling, boon/bane mechanics
│   ├── travellerMapApi.ts  # External star map API integration
│   ├── localStorage.ts  # Type-safe storage wrapper
│   ├── terminals.ts     # Terminal definitions
│   ├── audioManager.ts  # Sound effects
│   ├── glitchText.ts    # Terminal glitch effects
│   ├── exportImport.ts  # Campaign export/import
│   ├── bridge/          # Bridge console utilities
│   ├── calendar/        # Date calculation utilities
│   └── utils.ts         # clsx/tailwind-merge helper (cn function)
├── integrations/
│   └── supabase/
│       ├── client.ts    # Supabase client initialization
│       └── types.ts     # Auto-generated DB schema types
├── pages/               # Route-level page components
│   ├── Index.tsx        # Main auth/shell entry point
│   ├── AdminBridge.tsx  # Admin bridge console
│   ├── AdminNotes.tsx   # Admin notes management
│   └── NotFound.tsx
├── data/                # Static data
│   └── campaignDefaults.ts
├── config/
│   └── markerTypes.ts
├── styles/
│   └── design-system.css  # Terminal theme CSS variables
├── test/
│   └── setup.ts         # Vitest setup (jest-dom)
├── App.tsx              # Root: providers + router
├── main.tsx             # Vite entry point
└── index.css            # Tailwind base + CRT effects
```

```
supabase/
├── migrations/          # 17 SQL migration files
├── functions/           # 4 Edge Functions (validate-code, create-player, characters, vehicles)
└── config.toml

public/
├── logs/                # 24 terminal log JSON files
├── images/, audio/, assets/
└── _redirects           # Netlify redirects
```

## Architecture

### Context Provider Hierarchy

The app wraps everything in nested context providers (see `App.tsx`):

```
ErrorBoundary → QueryClientProvider → TooltipProvider → CampaignProvider →
  SessionProvider → QuestProvider → CalendarProvider → InventoryProvider →
    FinanceProvider → TradeProvider → JumpPlannerProvider → NotesProvider →
      BridgeProvider → Router + UI
```

Each context owns its feature's state and exposes CRUD operations. Consume via the corresponding hook (e.g., `useCampaign()`, `useJumpPlanner()`, `useBridge()`).

### Key Patterns

**Offline-first with Supabase fallback**: Database operations in `src/lib/supabase.ts` fall back to localStorage when Supabase is disabled or unavailable. Always handle both paths.

**Ref-based state sync**: Contexts use `useRef` alongside `useState` to avoid stale closures in callbacks. When adding new context operations, follow this pattern:
```typescript
const dataRef = useRef<Data[]>([]);
useEffect(() => { dataRef.current = data; }, [data]);
const mutate = useCallback(async () => {
  // Use dataRef.current, not state directly
}, []);
```

**Career data as TypeScript objects**: Character generation careers are defined as typed data in `src/components/character-gen/careers/*.ts`. Each exports a career definition object with events, ranks, benefits, skills, and survival/advancement requirements.

**Terminal theme**: The UI uses a CRT terminal aesthetic with green-on-black colors. Use `terminal-*` Tailwind classes (e.g., `text-terminal-primary`, `bg-terminal-bg-dark`, `border-terminal-border`). Theme variables are in `src/styles/design-system.css`.

## Code Conventions

### File Naming
- Components: `PascalCase.tsx`
- Utilities/libs: `camelCase.ts`
- Contexts: `*Context.tsx`
- Hooks: `use*.ts` or `use*.tsx`
- Types: `camelCase.ts` in `src/types/`
- Tests: colocated as `*.test.ts` or `*.test.tsx`

### Imports
- Use path aliases: `@/components/...`, `@/lib/...`, `@/hooks/...`, `@/types/...`, `@/contexts/...`
- Supabase client: `import { supabase } from "@/integrations/supabase/client"`
- UI components: `import { Button } from "@/components/ui/button"`
- Utility function: `import { cn } from "@/lib/utils"` (combines clsx + tailwind-merge)

### Component Patterns
- Functional components with hooks (no class components)
- shadcn/ui components for standard UI elements (Card, Dialog, Button, Tabs, etc.)
- Error boundaries wrap major sections
- Toast notifications via `sonner` (`toast.success()`, `toast.error()`)

### TypeScript
- Strict mode is OFF (`strict: false`, `noImplicitAny: false`)
- Types are organized by domain in `src/types/`
- Supabase types are auto-generated in `src/integrations/supabase/types.ts` - do not edit manually
- Unused variable warnings are disabled in ESLint

### Styling
- Tailwind utility classes are primary
- Terminal-specific colors via `terminal-*` classes from design-system.css
- CRT overlay effects (scanlines, phosphor glow) applied globally via `CRTOverlay` component
- Dark mode uses class-based toggling
- No CSS modules or styled-components

### State Management
- React Context for feature state (not Redux/Zustand)
- TanStack React Query for server state caching
- localStorage as persistence fallback
- No global store pattern - each context is independent

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Index` | Main entry (auth gate + MainframeShell) |
| `/character-view/:id` | `CharacterView` | Character detail page |
| `/vehicle-view/:id` | `VehicleView` | Vehicle detail page |
| `/admin/bridge` | `AdminBridge` | Admin bridge console |
| `/admin/notes` | `AdminNotes` | Admin notes management |
| `*` | `NotFound` | 404 fallback |

## Testing

- **Framework**: Vitest with jsdom environment
- **Libraries**: @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- **Setup**: `src/test/setup.ts` imports jest-dom matchers
- **Coverage**: Limited - primarily utility tests (`dice.test.ts`, `localStorage.test.ts`) and minimal component tests
- **Run**: `npm run test`
- **Pattern**: Describe blocks with `it()` assertions; statistical validation for random functions

## Database (Supabase)

- **Client**: `src/integrations/supabase/client.ts` (auto-generated, do not edit)
- **Schema types**: `src/integrations/supabase/types.ts` (auto-generated, do not edit)
- **Helper functions**: `src/lib/supabase.ts` (manual, safe to edit)
- **Migrations**: `supabase/migrations/` (17 SQL files)
- **Edge Functions**: `supabase/functions/` (validate-code, create-player, characters, vehicles)
- **Key tables**: characters, vehicles, players, access_codes, sessions, quests, world_notes, hex_markers, combat_encounters, player_notes, handouts, game_settings

## Domain Concepts

This is a **Traveller RPG** campaign manager. Key domain terms:

- **Characteristics**: STR, DEX, END, INT, EDU, SOC (+ Psionics) - core stats, each 2-12 range
- **Careers**: Life paths during character generation (Scout, Navy, Marine, Merchant, Army, Agent, Noble, Scholar, Entertainer, Citizen, Drifter, Rogue, Prisoner, Psion)
- **Terms**: 4-year career periods; characters serve multiple terms
- **Mustering Out**: Retirement benefits (cash, equipment, ship shares)
- **UWP**: Universal World Profile - compact world description code (e.g., "A434934-F")
- **Jump Rating**: FTL travel distance in parsecs (1-6)
- **Bridge Console**: Tactical display showing contacts, scans, and messages in real-time
- **Imperial Date**: In-game calendar format (day-year, e.g., 001-1105)
- **2d6**: Core dice mechanic - roll 2 six-sided dice, add modifiers, check against target (typically 8+)
- **Boon/Bane**: Roll 3d6, keep best 2 (boon) or worst 2 (bane)

## Environment Variables

```
VITE_SUPABASE_PROJECT_ID     # Supabase project identifier
VITE_SUPABASE_PUBLISHABLE_KEY # Supabase anon public key
VITE_SUPABASE_URL            # Supabase API URL
VITE_ENABLE_SUPABASE         # Enable Supabase in dev (true/false)
VITE_DISABLE_SUPABASE        # Disable Supabase entirely (true/false)
```

## Common Tasks

### Adding a new career
1. Create `src/components/character-gen/careers/newcareer.ts` following the pattern in existing careers (e.g., `scout.ts`, `navy.ts`)
2. Export a career definition object with `name`, `assignments`, `events`, `ranks`, `benefits`, `survival`, `advancement`
3. Register in `src/components/character-gen/careers/index.ts`

### Adding a new context/feature
1. Create type definitions in `src/types/newfeature.ts`
2. Create context in `src/contexts/NewFeatureContext.tsx` with provider and hook
3. Add provider to the hierarchy in `src/App.tsx`
4. Create components in `src/components/newfeature/`
5. Add Supabase helpers in `src/lib/supabase.ts` with localStorage fallback

### Adding a new interface tab
1. Create component in `src/components/interfaces/NewInterface.tsx`
2. Register in `MainframeShell.tsx` tab configuration

### Adding shadcn components
Use the shadcn CLI: components are configured via `components.json` with aliases pointing to `@/components/ui`, `@/lib/utils`, `@/lib`, and `@/hooks`.

## Existing Documentation

- `IMPLEMENTATION_PLAN.md` - Feature roadmap with database schemas
- `CODE_REVIEW.md` - Bug analysis and recommendations
- `TERMINAL_GUIDE.md` - Terminal system and log file format
- `HANDOUTS_STORAGE_SETUP.md` - Supabase storage migration guide
- `traveller_map_api_info.md` - External TravellerMap API docs
- `spacecombat.md` - Ship combat mechanics
- `bridge-console-terminal-envoy-integration.md` - Bridge console feature details
