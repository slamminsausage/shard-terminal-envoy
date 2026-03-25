# Shard-Terminal-Envoy Code Review
*Generated: 2026-01-13*

## Executive Summary

The Shard-Terminal-Envoy is a well-architected Traveller RPG campaign management system with a retro terminal interface. The codebase demonstrates solid React patterns, TypeScript usage, and thoughtful fallback mechanisms. This review identifies potential bugs and suggests feature enhancements that align with the project's vision.

---

## Potential Bugs & Issues

### 1. **Race Condition in JumpPlannerContext** ⚠️ HIGH PRIORITY
**Location**: `src/contexts/JumpPlannerContext.tsx:349-380`

**Issue**: The `loadJumpWorlds` function accesses stale state via closure:
```typescript
const loadJumpWorlds = useCallback(async () => {
  const { currentLocation, jumpRating } = state; // Closure over stale state
  // ...
}, [state.currentLocation, state.jumpRating]);
```

**Problem**: When `jumpRating` or `currentLocation` change rapidly, the callback may execute with outdated values, causing incorrect API calls or failed world lookups.

**Impact**: Users may see incorrect jump destinations or stale data when adjusting jump rating quickly.

**Fix**: Access state via functional updates or add proper dependencies.

---

### 2. **Missing Cleanup in useBridgeState Polling** ⚠️ MEDIUM PRIORITY
**Location**: `src/hooks/useBridgeState.ts:268-313`

**Issue**: The visibility change event listener cleanup may leave intervals running:
```typescript
useEffect(() => {
  // ...
  return () => {
    stopPolling();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [bridgeState.id, loadContacts, loadMessages, loadScans]);
```

**Problem**: If `bridgeState.id` changes while the tab is hidden, the old interval may continue running indefinitely, causing memory leaks and unnecessary API calls.

**Impact**: Performance degradation over time, especially in long-running sessions.

---

### 3. **LocalStorage Sync Issue in CampaignContext** ⚠️ MEDIUM PRIORITY
**Location**: `src/contexts/CampaignContext.tsx:367-393`

**Issue**: `deleteCharacter` doesn't update localStorage backup:
```typescript
const deleteCharacter = async (characterId: string): Promise<boolean> => {
  try {
    await dbHelpers.deleteCharacter(characterId);
    setCharacters(prev => prev.filter(char => char.id !== characterId));
    // Missing: localStorage update
    // ...
  }
}
```

**Problem**: When Supabase is unavailable, deleted characters persist in localStorage and reappear on refresh.

**Impact**: Data inconsistency between sessions when working offline.

---

### 4. **Missing Error Boundary for Bridge Console** ⚠️ MEDIUM PRIORITY
**Location**: `src/components/bridge/BridgeConsole.tsx`

**Issue**: The Bridge Console has complex real-time state management but no error boundary to catch rendering errors from malformed contact data or failed database migrations.

**Problem**: A single corrupted contact record could crash the entire Bridge interface.

**Impact**: Loss of tactical display functionality until page reload.

---

### 5. **Insufficient Validation in Terminal Access** ⚠️ LOW PRIORITY
**Location**: `src/lib/terminals.ts:11-38`

**Issue**: Terminal definitions don't validate that `logPath` files exist:
```typescript
{ code: 'lysani01', name: 'Lysani Labs System', logPath: '/logs/lysani01.json' }
```

**Problem**: If a log file is missing, terminal access fails silently with a fetch error.

**Impact**: Poor user experience when terminals are added but log files aren't deployed.

**Suggestion**: Add a dev-mode validation script to check all log files exist.

---

### 6. **Hex Marker Deletion Race Condition** ⚠️ LOW PRIORITY
**Location**: `src/contexts/JumpPlannerContext.tsx:588-606`

**Issue**: `deleteMarker` optimistically removes markers from state but doesn't rollback on error:
```typescript
const deleteMarker = useCallback(async (id: string) => {
  try {
    await dbHelpers.deleteHexMarker(id);
    // Optimistic removal happens AFTER deletion
    setState((prev) => ({
      ...prev,
      hexMarkers: prev.hexMarkers.filter((m) => m.id !== id),
    }));
  } catch (error) {
    // Marker already removed from UI but still in DB
  }
}, []);
```

**Problem**: If deletion fails, the marker disappears from UI but remains in database, causing confusion.

**Impact**: Minor UX issue - marker reappears on page refresh.

---

### 7. **Missing Thumbnail Cleanup on Character/Vehicle Deletion** ⚠️ LOW PRIORITY
**Location**: `src/lib/supabase.ts:315-323, 424-432`

**Issue**: When deleting characters or vehicles, their thumbnails in Supabase Storage aren't removed:
```typescript
async deleteCharacter(characterId: string) {
  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', characterId)
  // Missing: Call to deleteCharacterThumbnail(characterId)
}
```

**Problem**: Orphaned files accumulate in storage buckets.

**Impact**: Increased storage costs over time.

---

### 8. **Session Expiration Not Enforced** ⚠️ LOW PRIORITY
**Location**: `src/contexts/CampaignContext.tsx:15-37`

**Issue**: Session validation checks expiration but doesn't actively log out users:
```typescript
const isValidSession = (): boolean => {
  // ...
  if (Date.now() > session.expiresAt) {
    localStorage.removeItem('traveller_session');
    return false; // But user isn't logged out, just marked invalid
  }
}
```

**Problem**: Expired sessions prevent saves but don't redirect to login, leaving users confused.

**Impact**: Poor UX when sessions expire mid-use.

---

### 9. **Test Coverage is Insufficient** ⚠️ LOW PRIORITY
**Finding**: Only 2 test files exist for a codebase of 9,380 lines.

**Problem**: Critical paths (database operations, context state management, API calls) lack automated tests.

**Impact**: Increased risk of regressions during refactoring.

**Recommendation**: Add tests for:
- Database helper functions (`src/lib/supabase.ts`)
- Context providers (especially BridgeContext)
- API wrappers (`src/lib/travellerMapApi.ts`)

---

## Suggested Features

### **Priority 1: Essential Enhancements**

#### 1. **Dice Roller Integration** 🎲
**Rationale**: Traveller RPG requires frequent 2d6 rolls for skill checks, combat, and encounters.

**Implementation**:
- Add a floating dice roller widget accessible from any tab
- Support 2d6, 1d6, and custom dice expressions (e.g., "3d6+2")
- Log roll history with context (e.g., "Electronics check: 2d6+1 = 9")
- Integration with Terminal skill checks and Bridge combat

**Benefit**: Reduces context switching to external dice apps.

**Complexity**: Low (1-2 days)

---

#### 2. **Combat Tracker for Personal Combat** ⚔️
**Rationale**: The Bridge Console handles space combat excellently, but personal/ground combat lacks tracking tools.

**Implementation**:
- Initiative tracker with character/NPC ordering
- Health/stamina tracking for combatants
- Range bands and cover tracking
- Action economy counter (actions, reactions, movement)
- Integrate with character sheets for stats

**Benefit**: Complete combat management suite.

**Complexity**: Medium (3-5 days)

---

#### 3. **Terminal Command History** 📜
**Rationale**: Players may need to reference previously accessed terminals.

**Implementation**:
- Store terminal access history with timestamps
- Add "Recent Terminals" section to Terminal tab
- Track which log entries have been viewed
- Mark new/unread log entries

**Benefit**: Improves narrative tracking and reduces re-searching.

**Complexity**: Low (1 day)

---

#### 4. **Vehicle/Ship Damage Calculator** 🛠️
**Rationale**: Space combat damage calculations are complex in Traveller.

**Implementation**:
- Modal tool for damage calculation
- Input: weapon type, damage dice, armor, screens
- Output: final damage, critical hit effects, system failures
- Quick-apply damage to vehicles in Bridge Console
- Damage location tables for critical hits

**Benefit**: Speeds up combat resolution.

**Complexity**: Medium (2-3 days)

---

#### 5. **Export/Import Campaign Data** 💾
**Rationale**: Users should be able to backup or transfer campaigns.

**Implementation**:
- Export all characters, vehicles, notes, markers to JSON
- Import from JSON with validation
- Option to share specific characters/vehicles
- Support for importing from other Traveller character generators

**Benefit**: Data portability and backup protection.

**Complexity**: Low (1-2 days)

---

### **Priority 2: Quality of Life Improvements**

#### 6. **Dark/Light Mode Toggle** 🌓
**Rationale**: `next-themes` is installed but not exposed in UI.

**Implementation**:
- Add theme toggle to AppHeader
- Provide "Retro Green", "Amber", "Blue" CRT color schemes
- Persist preference per user

**Benefit**: Accessibility and user preference support.

**Complexity**: Very Low (2-4 hours)

---

#### 7. **Character Comparison Tool** 📊
**Rationale**: Players often need to compare multiple characters' stats.

**Implementation**:
- Side-by-side character comparison view
- Highlight stat differences
- Compare skills, equipment, finances
- Export comparison as PDF/PNG

**Benefit**: Helps with party balance and NPC comparison.

**Complexity**: Medium (2-3 days)

---

#### 8. **Trade Goods Calculator** 💰
**Rationale**: Trade is a major component of Traveller campaigns.

**Implementation**:
- Trade goods database by tech level
- Price calculator with supply/demand modifiers
- Cargo capacity vs. profit calculator
- Track purchased goods across systems
- Integration with vehicle cargo capacity

**Benefit**: Streamlines merchant gameplay.

**Complexity**: Medium (3-4 days)

---

#### 9. **Random Encounter Generator** 🎭
**Rationale**: GMs need quick random encounters.

**Implementation**:
- Generate encounters by world type (starport, wilderness, urban)
- NPC generator with Traveller careers
- Ship encounter generator for space
- Customize encounter tables per campaign
- One-click add generated NPCs to notes

**Benefit**: Reduces GM prep time.

**Complexity**: Medium (3-5 days)

---

#### 10. **Audio Log Player Enhancements** 🎧
**Rationale**: Audio logs exist but lack playback controls.

**Implementation**:
- Persistent mini-player for audio logs
- Playback controls (play, pause, seek, volume)
- Queue multiple audio logs
- Transcription view alongside audio
- Mark logs as "heard"

**Benefit**: Better immersion and accessibility.

**Complexity**: Low (1-2 days)

---

#### 11. **Bridge Console - Weapons Firing Calculator** 🎯
**Rationale**: Weapon hit calculations require multiple modifiers.

**Implementation**:
- Weapons panel in Bridge Console
- Select weapon, target contact
- Auto-calculate to-hit modifiers (range, sensor lock, countermeasures)
- Roll to-hit and damage
- Apply damage directly to target hull

**Benefit**: Streamlines combat turns.

**Complexity**: Medium (2-3 days)

---

#### 12. **Jump Planner - Fuel Cost Calculator** ⛽
**Rationale**: Jump fuel is a critical resource.

**Implementation**:
- Calculate fuel required for planned routes
- Show refueling stations along route
- Track current fuel levels per vehicle
- Warn when route exceeds fuel capacity
- Calculate refueling costs

**Benefit**: Prevents stranded ships and improves planning.

**Complexity**: Low (1-2 days)

---

#### 13. **Notes - Rich Text Editor** ✍️
**Rationale**: Campaign notes currently support basic text.

**Implementation**:
- Replace textarea with rich text editor (TipTap or similar)
- Support: bold, italic, lists, links, images
- Markdown export/import
- Tables for data
- Code blocks for stat blocks

**Benefit**: More organized and professional notes.

**Complexity**: Medium (2-3 days)

---

#### 14. **Character XP & Advancement Tracker** 📈
**Rationale**: Character progression needs tracking.

**Implementation**:
- XP tracking system
- Skill advancement costs
- Training time calculator
- Characteristic improvement tracking
- Aging crisis tracking
- Campaign timeline with ages

**Benefit**: Simplifies long-term campaign management.

**Complexity**: Medium (3-4 days)

---

#### 15. **Multi-User / GM Mode** 👥
**Rationale**: Current system is single-player focused.

**Implementation**:
- Separate GM and Player views
- GMs can see all data; players see only their characters
- GM can push terminals, encounters, and handouts to players
- Real-time updates for Bridge Console (already partially implemented)
- Player permissions system

**Benefit**: Enables live online sessions.

**Complexity**: High (7-10 days) - Requires authentication overhaul

---

### **Priority 3: Advanced Features**

#### 16. **World Generator** 🌍
**Rationale**: Traveller's Universal World Profile (UWP) system can be automated.

**Implementation**:
- Generate worlds using Traveller world creation rules
- Output: UWP, trade codes, bases, allegiance
- Customize generation parameters
- Save custom worlds to database
- Export worlds to Traveller Map format
- Integration with Jump Planner for custom sectors

**Benefit**: Accelerates worldbuilding for homebrew sectors.

**Complexity**: High (5-7 days)

---

#### 17. **Patron & Mission Generator** 🎯
**Rationale**: Traveller adventures often start with patrons offering missions.

**Implementation**:
- Generate patrons with backgrounds and motives
- Mission generator by type (trade, combat, exploration, intrigue)
- Complication generator
- Payment calculator based on mission risk
- Mission tracking system
- Link missions to terminals (e.g., mission briefings as terminal logs)

**Benefit**: Endless adventure hooks.

**Complexity**: High (5-7 days)

---

#### 18. **Subsector/Sector Mapping Tool** 🗺️
**Rationale**: Custom sector creation for homebrew campaigns.

**Implementation**:
- Visual editor for placing worlds in hexes
- World generation integration
- Trade route visualization
- Political boundaries
- Jump route overlay
- Export to standard Traveller XML format
- Import existing sectors

**Benefit**: Complete worldbuilding tool.

**Complexity**: Very High (10-14 days)

---

#### 19. **AI-Powered Terminal Response Generator** 🤖
**Rationale**: NEXA interface exists but is basic.

**Implementation**:
- Integrate with Claude API or OpenAI
- NEXA acts as in-universe AI assistant
- Query campaign data (characters, vehicles, worlds)
- Generate NPC dialogue
- Suggest plot hooks based on campaign state
- Context-aware responses using terminal logs
- Option to enable/disable per campaign

**Benefit**: Enhanced storytelling and GM assistance.

**Complexity**: Medium (3-5 days) - Requires API integration

---

#### 20. **Session Recorder & Replay** 📹
**Rationale**: Record campaign sessions for later review.

**Implementation**:
- Record all state changes during session
- Replay feature to review past sessions
- Export session summary with key events
- Timeline view of session events
- Screenshot/snapshot at key moments

**Benefit**: Campaign journaling and review.

**Complexity**: High (7-10 days)

---

## Code Quality Recommendations

### 1. **Add More Unit Tests**
- Target 70%+ coverage for:
  - Database operations (`src/lib/supabase.ts`)
  - API wrappers (`src/lib/travellerMapApi.ts`)
  - Context state machines (BridgeContext, JumpPlannerContext)

### 2. **Consolidate Error Handling**
- Create centralized error handling utility
- Standardize error toast messages
- Add error boundary for each major interface

### 3. **Performance Optimization**
- Add React.memo to expensive components (TacticalDisplay, StarMapPanel)
- Virtualize long lists (character list, vehicle list, notes list)
- Lazy load terminal log files only when accessed

### 4. **Type Safety Improvements**
- Replace `any` types with specific interfaces
- Add stricter TypeScript config (noImplicitAny, strictNullChecks)
- Add runtime validation for API responses using Zod

### 5. **Accessibility Enhancements**
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works throughout
- Add screen reader support for Bridge Console tactical display

---

## Conclusion

The Shard-Terminal-Envoy codebase is well-structured with excellent fallback mechanisms and a solid foundation. The identified bugs are mostly minor and easily fixable. The suggested features align with Traveller RPG gameplay and would significantly enhance the campaign management experience.

**Recommended Next Steps**:
1. Fix Priority 1 bugs (race conditions, localStorage sync)
2. Implement Dice Roller (quick win, high value)
3. Add Combat Tracker (complements existing Bridge Console)
4. Improve test coverage for critical paths
5. Consider Multi-User/GM Mode for future expansion

---

## Code Review Round 2 — 2026-02-07

### Bugs Fixed

#### 1. **`rollDamageExpression` fails on whitespace in dice expressions** — FIXED
**Location**: `src/lib/dice.ts:173`

**Bug**: The regex `/(\d*)d(\d+)([+-]\d+)?/i` operated on `expression.trim()`, which only strips leading/trailing whitespace. An input like `"2d6 + 3"` would fail to parse the `+ 3` modifier (space before `3`) and silently return `modifier: 0`.

**Fix**: Changed `expression.trim()` to `expression.replace(/\s+/g, '')` to strip all internal whitespace before regex matching.

---

#### 2. **Skill check test asserted wrong result for "meets difficulty"** — FIXED
**Location**: `src/lib/dice.test.ts:222`

**Bug**: The test asserted `performSkillCheck(8, 1, 1, 6).success` should be `false`, but `6+1+1=8` meets the difficulty of `8`. In Traveller RPG, meeting the target number is a success (`total >= difficulty`). The implementation was correct; the test expectation was wrong.

**Fix**: Changed assertion to `toBe(true)` with corrected comment.

---

#### 3. **`getLocalStorage` treats empty strings as missing values** — FIXED
**Location**: `src/lib/localStorage.ts:17`

**Bug**: The guard `if (!raw) return fallback` uses falsy coercion, so an empty string `""` stored via `setLocalStorage` would be treated as "key doesn't exist" and return the fallback instead. This also affected `hasLocalStorage` indirectly via the test mock.

**Fix**: Changed to `if (raw === null) return fallback` for an explicit null check. Also fixed the test mock's `getItem` from `store[key] || null` to `key in store ? store[key] : null`.

---

#### 4. **`recallHistory` returns empty string due to React 18 batching** — FIXED
**Location**: `src/hooks/useTerminalSession.ts:309-325`

**Bug**: `recallHistory` set a local `recalled` variable inside a `setState` updater function, then returned it after `setState`. In React 18, `setState` updater functions are deferred to the render phase — they don't execute synchronously during the `setState` call. So `recalled` was always `''` when `return recalled` executed.

**Fix**: Added a `stateRef` that mirrors `state`, and read command history/index from `stateRef.current` synchronously instead of relying on the `setState` updater. The `setState` call now only updates `historyIndex`.

---

#### 5. **`useTerminalHistory` calls `loadHistory` before it's defined** — FIXED
**Location**: `src/hooks/useTerminalHistory.ts:22-63`

**Bug**: The `useEffect` that calls `loadHistory()` was declared before the `useCallback` that defines `loadHistory`. While this worked at runtime due to JavaScript hoisting semantics with `useCallback`, it also had a missing ESLint dependency (`loadHistory` not in the dep array).

**Fix**: Moved `loadHistory` definition above the `useEffect`, and added `[loadHistory]` to the dependency array.

---

#### 6. **MainframeShell test crashes — missing context providers** — FIXED
**Location**: `src/components/MainframeShell.test.tsx`

**Bug**: The test rendered `<MainframeShell />` inside only `<MemoryRouter>`, but `AppHeader` calls `useCalendar()` and `AppFooter` renders `ExportImportDialog` which calls `useCampaign()`. Both throw without their context providers. The test also used wrong tab label patterns (`/crew & sheets/i`, `/vehicles & spaceships/i`) that don't match the actual labels ("Crew", "Hangar").

**Fix**: Added mocks for `AppHeader` and `AppFooter` to isolate the tab logic being tested. Updated tab name patterns to match actual labels.

---

### Additional Issues Found (Not Yet Fixed)

#### 7. **NexaInterface is unwired** ⚠️ LOW PRIORITY
**Location**: `src/components/interfaces/NexaInterface.tsx`

The NexaInterface component exists with a "COMING SOON" placeholder but is not registered as a tab in `MainframeShell.tsx`. It's a dead component — either wire it up or remove it.

---

#### 8. **AutoSaveIndicator component unused** ⚠️ LOW PRIORITY
**Location**: `src/components/AutoSaveIndicator.tsx`

This component is defined but never imported or rendered anywhere in the app.

---

#### 9. **~48 debug `console.log` statements left in production code** ⚠️ LOW PRIORITY
**Key files**:
- `src/lib/supabase.ts` (~18 occurrences — upload/delete status)
- `src/contexts/NotesContext.tsx` (~14 occurrences — migration logging)
- `src/lib/travellerMapApi.ts` (~8 occurrences — API debugging)
- `src/contexts/JumpPlannerContext.tsx` (2 occurrences — coordinate processing)

Most appear to be leftover development/migration logging rather than intentional production logging. Consider gating behind `isDev` or removing.

---

#### 10. **Two incomplete TODO items in production code** ⚠️ LOW PRIORITY
- `src/components/bridge/BridgeConsole.tsx:306` — `// TODO: Apply damage to selected contact` — the `onApplyDamage` callback is a no-op
- `src/components/campaign/ExportImportDialog.tsx:127-128` — `// TODO: Import world notes and hex markers` — export/import skips world notes and hex markers

---

#### 11. **Bundle size is 1.8MB (gzipped: 461KB)** ⚠️ MEDIUM PRIORITY

The entire app ships as a single JS chunk. Vite warns about this. Consider:
- `React.lazy()` + `Suspense` for tab interfaces (each tab is independent)
- `manualChunks` in Vite config to split vendor libraries
- Dynamic import for heavy components like the star map, bridge console, and character generator

---

#### 12. **8 npm vulnerabilities (4 moderate, 4 high)**

Run `npm audit fix` to address known dependency vulnerabilities.

---

### Visual & UX Suggestions

1. **Code-split tab content** — Each MainframeShell tab renders independently; lazy-loading them would cut initial load time significantly and improve perceived performance.

2. **Add loading skeletons** — When switching tabs or loading data from Supabase, show terminal-themed skeleton/shimmer states instead of blank space.

3. **CRT color scheme options** — The design system defines green-on-black, but offering amber (`#FFB000`) and blue (`#00BFFF`) phosphor variants would add personality. The infrastructure for this is partially in `design-system.css` already.

4. **Keyboard shortcut discoverability** — Tab shortcuts (1-8) exist but are only shown as tiny numbers. Consider a `?` hotkey that shows a command palette or shortcut overlay.

5. **Terminal history panel** — The `useTerminalHistory` hook tracks terminal access history, but there's no UI exposing "recently accessed terminals" to users. A small sidebar or dropdown in the Terminal tab would make this useful.

---

---

## Code Review Round 3 — 2026-03-25

### Bugs & Critical Issues

#### 1. **Race Condition in `endCombat()` — Sequential Async Loop** — HIGH
**Location**: `src/hooks/useShipCombat.ts:225-257`

The `endCombat` function iterates over `combatants` with a sequential `for...of` + `await` loop, making two separate DB calls per destroyed ship. If the `combatants` array changes mid-loop (e.g., via a concurrent state update), stale references cause errors.

**Fix**: Use `Promise.all()` to batch updates, and combine hull-zero status updates into a single call per contact.

---

#### 2. **Stale Closure in JumpPlannerContext `handleMapClick`** — HIGH
**Location**: `src/contexts/JumpPlannerContext.tsx:251-270`

The `useEffect` that listens for `postMessage` events calls `handleMapClick(x, y)` but only includes `state.jumpRating` in its dependency array — not `handleMapClick` itself. If `handleMapClick` is redefined (e.g., when other state it depends on changes), the event listener retains the stale version.

**Fix**: Add `handleMapClick` to the dependency array, or use a ref to always call the latest version.

---

#### 3. **Silent Error Swallowing in `supabase.ts`** — HIGH
**Location**: `src/lib/supabase.ts:502, 552`

Empty `catch { /* ignore */ }` blocks around JSON.parse operations mean corrupted localStorage data is silently discarded. Users get no indication that their local fallback data is broken.

**Fix**: Log a warning in dev mode and consider clearing the corrupted key so it doesn't persistently fail.

---

#### 4. **Weak Session Token Generation** — HIGH (Security)
**Location**: `src/contexts/CampaignContext.tsx:50-54`

Session tokens are generated with `Math.random().toString(36)`, which is not cryptographically secure and is predictable.

**Fix**: Use `crypto.getRandomValues()` and convert to hex/base64 for session token generation.

---

#### 5. **`partyFunds` Circular Dependency in FinanceContext** — MEDIUM
**Location**: `src/contexts/FinanceContext.tsx:57-88`

The `recalculateBalance` callback depends on `partyFunds` in its dependency array but also calls `setPartyFunds` within itself. Rapid successive calls can read stale values of `partyFunds` before the previous `setState` has flushed.

**Fix**: Use a ref (`partyFundsRef`) to always read the latest value, matching the pattern used in CampaignContext.

---

#### 6. **Unhandled Errors in Bridge Polling** — MEDIUM
**Location**: `src/hooks/useBridgeState.ts:296-300`

The `setInterval` polling loop calls `void loadContacts()`, `void loadMessages()`, `void loadScans()` without catching errors. If the database becomes unavailable, errors are silently discarded and the user sees stale data with no indication of a problem.

**Fix**: Wrap polling calls in try/catch and surface a "connection lost" indicator after N consecutive failures.

---

#### 7. **`parseInt` Without Radix in EventHandler** — MEDIUM
**Location**: `src/components/character-gen/EventHandler.tsx:80`

`parseInt(directMatch.value)` without a radix parameter could produce unexpected results if the string starts with `0` (octal interpretation in older engines).

**Fix**: Use `parseInt(directMatch.value, 10)` or `Number(directMatch.value)`.

---

#### 8. **Bidirectional Sensor Lock Removal** — LOW
**Location**: `src/hooks/useShipCombat.ts:302, 367`

```typescript
setSensorLocks(prev => Object.fromEntries(
  Object.entries(prev).filter(([k, v]) => k !== contactId && v !== contactId)
));
```

This removes a lock if EITHER the key OR value matches the contactId. While possibly intentional (removing all locks involving a destroyed ship), this behavior is undocumented and could surprise maintainers. If a ship is the target of multiple locks, all are removed.

**Fix**: Add a comment documenting the intentional bidirectional removal, or split into separate removal logic if only one direction is intended.

---

### Unwired Features & Dead Code

#### 9. **Extensive Unused Context Functions**

Many context providers export functions that are never consumed by any component:

| Context | Unused Functions |
|---------|-----------------|
| **BridgeContext** | `removeContact()`, `updateContactStatus()`, `updateContactFacing()`, `updateContactHull()`, `setMode()`, `updateNavigation()` |
| **JumpPlannerContext** | `clearError()`, `planRoute()`, `saveNote()`, `deleteMarker()` |
| **FinanceContext** | `getTransactionsByCategory()`, `calculateNetIncome()` |
| **InventoryContext** | `getItem()`, `createTemplate()`, `deleteTemplate()` |
| **TradeContext** | `calculatePotentialProfit()`, `getCargoByVehicle()`, `getAllMarketRolls()` |
| **CalendarContext** | `setCurrentDate()`, `getAllEvents()`, `formatDate()` |
| **PlayerContext** | `validateAccessCode()` |
| **SessionContext** | `addReward()` |

**Impact**: These represent either scaffolded features that were never wired to UI, or internal helpers that shouldn't be in the public context API. They add confusion for maintainers and bloat the context value objects (triggering unnecessary re-renders when the value object identity changes).

**Fix**: Either wire these to UI components, move them to internal-only helpers, or remove them if truly unneeded.

---

#### 10. **NexaInterface Still Unwired** (previously reported)
**Location**: `src/components/interfaces/NexaInterface.tsx`

Still not registered in MainframeShell tabs. Consider either wiring it up or removing the dead component.

---

#### 11. **AutoSaveIndicator Still Unused** (previously reported)
**Location**: `src/components/AutoSaveIndicator.tsx`

Defined but never imported or rendered anywhere.

---

### Architecture & Performance Issues

#### 12. **Deep Provider Nesting Causes Cascading Re-renders** — HIGH
**Location**: `src/App.tsx:45-93`

14 context providers are nested sequentially. Any state change in an outer provider (e.g., CampaignProvider) causes all inner providers and their children to potentially re-render.

**Fix**:
- Split `CampaignContext` (922 lines) into `AuthContext` and `CampaignDataContext` — auth changes rarely, campaign data changes often
- Memoize context value objects with `useMemo` to prevent unnecessary identity changes
- Consider a flat composition pattern where independent providers aren't nested

---

#### 13. **TanStack React Query Installed But Underutilized** — MEDIUM
**Location**: `src/App.tsx:43` (QueryClient created), various contexts

React Query is initialized but contexts use manual `useState` + `useCallback` + `useEffect` for all data fetching. This means the app misses out on request deduplication, automatic refetch on window focus, optimistic updates, and cache management.

**Fix**: Migrate data fetching operations to `useQuery()` and mutations to `useMutation()`. Start with the heaviest fetchers: CampaignContext character/vehicle loading, BridgeContext contact/message polling.

---

#### 14. **Missing Memoization Throughout** — MEDIUM

- `MainframeShell.tsx:36-46`: `tabs` array is recreated on every render, causing AppHeader to re-render
- `CrewInterface`: Character filtering/mapping logic not memoized — re-filters all characters on every keystroke
- `CharacterSheet`: Renders massive skill definition arrays without memoization
- Zero `React.memo` exports on tab content components

**Fix**: Memoize the `tabs` array, add `React.memo` to tab interface components, and use `useMemo` for derived data like filtered/sorted lists.

---

#### 15. **No Loading/Empty States for Data-Dependent UI** — MEDIUM

Most tab interfaces render immediately without waiting for data. No skeleton states, no "no data found" messages, no retry buttons on failure. Users see blank space while Supabase queries resolve.

**Fix**: Add `isLoading` state to contexts, create terminal-themed skeleton components, and add empty state messages.

---

#### 16. **Sequential Supabase Queries in `refreshData()`** — MEDIUM
**Location**: `src/contexts/CampaignContext.tsx:355-427`

`refreshData` calls `getAllCharacters()`, `getAllVehicles()`, and `getAllCrewGroups()` sequentially. These are independent queries that could run in parallel.

**Fix**: Use `Promise.all([getAllCharacters(), getAllVehicles(), getAllCrewGroups()])` to parallelize.

---

#### 17. **Accessibility Gaps** — MEDIUM

- No `aria-live` regions for real-time updates (bridge messages, combat round changes)
- No focus management when switching tabs
- Form inputs in character sheets may lack associated labels
- CRT overlay effects (scanlines, phosphor glow) may reduce readability for visually impaired users
- No high-contrast mode option

**Fix**: Add `aria-live="polite"` to bridge and combat containers, manage focus on tab change, audit form labels, and consider a high-contrast toggle.

---

### Improvement Recommendations

#### Quick Wins (< 1 hour each)
1. **Memoize `tabs` array** in MainframeShell with `useMemo`
2. **Use `crypto.getRandomValues()`** for session tokens
3. **Add radix to all `parseInt` calls** across the codebase
4. **Parallelize `refreshData()`** queries with `Promise.all`
5. **Add dev-mode warnings** to empty catch blocks in supabase.ts
6. **Remove or document unused context functions** — trim the public API

#### Medium Effort (1-4 hours each)
7. **Split CampaignContext** into Auth + Data contexts
8. **Add `React.memo`** to all tab interface components
9. **Add loading skeletons** for main tab interfaces
10. **Add `aria-live` regions** to bridge console and combat interface
11. **Wire up error handling** for bridge polling with connection status indicator
12. **Batch ship combat `endCombat()` updates** with Promise.all

#### Larger Efforts (1+ days each)
13. **Migrate to React Query** for data fetching in contexts
14. **Add test coverage** for context providers and authentication flow (currently ~5 test files for 215+ components)
15. **Code-split tab interfaces** with `React.lazy()` + `Suspense` (bundle is 1.8MB)
16. **Wire up unused BridgeContext functions** to admin bridge UI or remove them
17. **Implement `InventoryContext` template system** or remove dead `createTemplate`/`deleteTemplate` functions

---

### Summary

The codebase is well-structured with good patterns (ref-based state sync, offline-first fallbacks, typed career data). The main areas for improvement are:

1. **State management**: Stale closures, missing deps, cascading re-renders from deep nesting
2. **Dead code**: ~30 unused context functions representing scaffolded but unwired features
3. **Performance**: Missing memoization, sequential queries, no code splitting
4. **Security**: Weak session token generation
5. **Testing**: Only 5 test files for 215+ components — critical paths are untested
6. **UX polish**: No loading/empty states, no error recovery UI, accessibility gaps

The highest-impact fixes are splitting CampaignContext, parallelizing DB queries, securing session tokens, and memoizing expensive renders.

---

*End of Code Review*
