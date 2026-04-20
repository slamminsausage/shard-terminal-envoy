# VTT Styling Modernization Plan

## Problem
The VTT components use raw, inline Tailwind terminal classes (`terminal-primary`, `terminal-bg-dark`, `terminal-border`, `font-mono`, `text-[10px]`) creating a flat, bare-bones terminal look. The rest of the app uses the design system's unified component classes (`interface-container`, `terminal-card`, `terminal-card-header`, `terminal-btn`, `terminal-tabs-list`, `terminal-list-item`, `terminal-badge`, etc.) which add structure, gradients, glows, Orbitron headers, and a polished semi-modern feel.

## Goal
Bring VTT sidebar panels, toolbars, modals, and overlays in line with the rest of the app's semi-modern terminal aesthetic by:
1. Using design system CSS classes where applicable
2. Adding subtle gradients, glows, and box-shadows that the rest of the app has
3. Using Orbitron font for headers/titles
4. Adding proper card structure to panels with gradient header backgrounds
5. Making buttons feel more substantial with glow effects
6. Making list items use the `terminal-list-item` hover/active patterns
7. Adding the subtle green glow/border styling the rest of the app has

## Approach
Add new VTT-specific CSS utility classes in `design-system.css`, then update each component to use them. This keeps changes minimal per file while achieving visual consistency.

## Step 1: Add VTT design system classes to `design-system.css`
New classes for VTT components:
- `.vtt-sidebar` — sidebar container with gradient bg, glow border, box-shadow
- `.vtt-sidebar-header` — Orbitron font panel header with gradient bg
- `.vtt-section-label` — section label (replacing repeated `text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono`)
- `.vtt-input` — styled inputs matching terminal-input but compact
- `.vtt-btn` — compact terminal-btn variant with glow
- `.vtt-btn-danger` — red variant
- `.vtt-btn-icon` — toolbar icon button
- `.vtt-btn-icon--active` — active state with glow
- `.vtt-list-item` — list item with hover glow
- `.vtt-list-item--active` — selected state
- `.vtt-toolbar` — toolbar strip with gradient
- `.vtt-empty` — empty state text
- `.vtt-modal` — modal container with glow border
- `.vtt-modal-header` — modal header
- `.vtt-slider` — custom range input
- `.vtt-badge` — small badge/tag
- `.vtt-checkbox` — styled checkbox label
- `.vtt-separator` — divider with subtle glow

## Step 2: Update VTTSidebar.tsx
- Container: `.vtt-sidebar`
- Header: `.vtt-sidebar-header` with Orbitron font
- Close button with glow hover

## Step 3: Update VTTToolbar.tsx
- Container: `.vtt-toolbar`
- Buttons: `.vtt-btn-icon` / `.vtt-btn-icon--active`
- Separators: `.vtt-separator`

## Step 4: Update VTTRightToolbar.tsx
- Same treatment as VTTToolbar
- Panel buttons with labels using `.vtt-btn-icon`

## Step 5: Update all 16 sidebar panel components
Each panel gets:
- Section labels → `.vtt-section-label`
- Inputs → `.vtt-input`
- Buttons → `.vtt-btn` / `.vtt-btn-danger`
- List items → `.vtt-list-item` / `.vtt-list-item--active`
- Empty states → `.vtt-empty`
- Sliders → `.vtt-slider`
- Checkboxes → `.vtt-checkbox`

Files: VTTMapLibrary, VTTTokenPanel, VTTDrawingPanel, VTTEffectsPanel, VTTInitiativePanel, VTTFogPanel, VTTLightingPanel, VTTAudioMixer, VTTClocksPanel, VTTHandoutsPanel, VTTSettingsPanel, VTTScenePresets, VTTAoEPanel, VTTDiceRoller, VTTLayersPanel, VTTCharacterImport

## Step 6: Update modal/overlay components
- VTTTokenEditModal, VTTNoteModal: `.vtt-modal` + `.vtt-modal-header`
- VTTContextMenu: enhanced glow border
- VTTShortcutOverlay: modal overlay styling
- VTTTokenHUD: floating HUD with glow
- VTTAlignmentBar: toolbar styling
- VTTZoomControl: consistent button styling

## Step 7: Update view components
- VTTPlayerView overlay panels
- VTTPresenterView overlay panels

## Step 8: Update VTTInterface.tsx
- Match container styling patterns from rest of app

## Step 9: Build and verify
- `npm run build` — verify no errors
- `npm run lint` — check for issues
