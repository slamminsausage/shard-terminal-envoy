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

*End of Code Review*
