# Terminal Addition Guide for Traveller Terminal System

This guide explains how to add new terminals to the Traveller terminal system, including proper configuration, file structure, and integration with the unlock system.

## Overview

The terminal system consists of:
- **Terminal Definitions** (`src/lib/terminals.ts`) - Configuration and metadata
- **Log Files** (`public/logs/*.json`) - Content and data for each terminal
- **Database Integration** - Unlock tracking via Supabase
- **Audio Support** - Optional audio files for enhanced experience
- **Special Handlers** - Custom terminal behaviors

## 1. Terminal Definition Structure

### Basic Terminal Definition

Add terminals to the `TERMINALS` array in `src/lib/terminals.ts`:

```typescript
export interface TerminalDefinition {
  code: string;                    // Unique access code (lowercase)
  name: string;                    // Display name for the terminal
  logPath: string;                 // Path to JSON log file
  requiresRoll?: number;           // Difficulty rating (6-12)
  requiresPassword?: boolean;      // Requires password entry
  password?: string;               // Password (if requiresPassword is true)
  requiresSpecialHandler?: boolean; // Custom terminal behavior
}
```

### Example Definitions

```typescript
// Simple terminal (no security)
{ 
  code: 'publicterminal01', 
  name: 'Public Access Terminal', 
  logPath: '/logs/publicterminal01.json' 
},

// Terminal with skill check
{ 
  code: 'securenode42', 
  name: 'Secure Research Node', 
  logPath: '/logs/securenode42.json', 
  requiresRoll: 8 
},

// Terminal with password
{
  code: 'corporate01',
  name: 'Corporate Hub',
  logPath: '/logs/corporate01.json',
  requiresRoll: 10,
  requiresPassword: true,
  password: 'executive2024'
},

// Special handler terminal
{ 
  code: 'deepcore01', 
  name: 'Deep Core Security', 
  logPath: '/logs/deepcore01.json', 
  requiresSpecialHandler: true 
}
```

## 2. Log File Format

### File Location
- Place log files in `public/logs/`
- Use descriptive names: `terminal-code.json`

### Basic Structure

```json
{
  "title": "Log Entry Title",
  "location": "Terminal Location/Description", 
  "date": "Imperial Date (DDD-YYYY format)",
  "author": "Author Name or System",
  "content": "Main log content text",
  "security_level": "unlocked|restricted|classified",
  "requires_roll": false
}
```

### Multiple Log Entries

```json
[
  {
    "title": "System Status Report",
    "location": "Research Station Alpha",
    "date": "156-1105", 
    "author": "Station AI",
    "content": "All systems operational. No anomalies detected.",
    "security_level": "unlocked",
    "requires_roll": false
  },
  {
    "title": "Classified Research Data",
    "location": "Research Station Alpha - Lab 7",
    "date": "157-1105",
    "author": "Dr. Sarah Chen",
    "content": "Initial access granted. Full data requires security clearance.",
    "security_level": "restricted", 
    "requires_roll": true,
    "roll_check": {
      "difficulty": 8,
      "skill": "Electronics (computers)",
      "on_success": "Project Lazarus progress shows 73% completion. Subject exhibits unexpected neural pathway enhancement. Recommend immediate containment protocols.",
      "on_failure": "Access denied. Insufficient clearance level."
    }
  }
]
```

## 3. Security Levels

### Unlocked Entries
- `"security_level": "unlocked"`
- `"requires_roll": false`
- Always accessible once terminal is unlocked

### Restricted Entries
- `"security_level": "restricted"`
- `"requires_roll": true`
- Requires skill check to access full content
- Must include `roll_check` object

### Roll Check Object
```json
"roll_check": {
  "difficulty": 8,                    // Target number (6-12)
  "skill": "Electronics (computers)", // Required skill
  "on_success": "Full classified content here",
  "on_failure": "Access denied message"
}
```

## 4. Audio Integration

### Adding Audio Files

1. Place audio files in `public/audio/`
2. Supported formats: MP3, WAV, OGG
3. Use descriptive names: `terminal-code-audio.mp3`

### Audio in Log Entries

```json
{
  "title": "Audio Log - Emergency Broadcast",
  "location": "Communication Array",
  "date": "089-1105",
  "author": "Commander Hayes", 
  "content": "Emergency transmission detected. Audio quality degraded.",
  "audio_file": "/audio/emergency-broadcast.mp3",
  "security_level": "unlocked",
  "requires_roll": false
}
```

## 5. Terminal Discovery System

### Initial Availability
Terminals are unlocked by default if listed in the initial database seed. Currently available terminals:
- lysani01, s.elara01, slocombe875, waferterm01
- labpc81, vanagandr001, blackcircuit01, fuw01  
- caldonis_public, fuwnet, 01-1485-10-4-89-40

### Adding to Available List
To make a new terminal immediately available, add it to the database migration or use the admin interface.

### Discovery Through Gameplay
Players can discover new terminals by:
- Finding access codes in log entries
- Story progression revealing new codes
- Successful completion of missions/objectives

## 6. Special Handlers

### When to Use Special Handlers
- Complex interactive terminals
- Custom UI requirements  
- Multi-step authentication
- Dynamic content generation

### Implementation
1. Set `requiresSpecialHandler: true` in terminal definition
2. Create custom component in `src/components/`
3. Add routing logic in `TerminalInterface.tsx`

### Example Special Handler Check
```typescript
// In TerminalInterface.tsx
if (terminal.code === '01-1485-10-4-89-40') {
  return <DeepCoreTerminal />;
}
```

## 7. File Organization

```
public/
├── logs/
│   ├── terminal-code.json     # Log data files
│   └── ...
└── audio/
    ├── terminal-audio.mp3     # Audio files
    └── ...

src/
├── lib/
│   └── terminals.ts           # Terminal definitions
├── components/
│   ├── interfaces/
│   │   └── TerminalInterface.tsx  # Main terminal handler
│   └── special-handlers/
│       └── CustomTerminal.tsx     # Special terminal components
└── ...
```

## 8. Testing New Terminals

### Basic Testing Checklist
- [ ] Terminal appears in available list
- [ ] Access code works correctly
- [ ] Log content displays properly
- [ ] Security checks function (if applicable)
- [ ] Audio plays correctly (if included)
- [ ] Special handlers work (if applicable)
- [ ] Terminal unlocks are saved to database

### Manual Testing Process
1. Start with terminal not in unlocked list
2. Enter access code in terminal interface
3. Verify content loads correctly
4. Test all log entries and security levels
5. Confirm terminal saves to unlocked list
6. Test audio playback (if applicable)

## 9. Common Issues & Troubleshooting

### Terminal Not Appearing
- Check terminal code matches exactly (case-sensitive in interface)
- Verify terminal is in unlocked list in database
- Ensure no typos in terminal definition

### Log File Not Loading
- Verify file path in terminal definition
- Check JSON syntax validity
- Ensure file is in `public/logs/` directory
- Confirm file permissions

### Audio Not Playing
- Check file path in log entry
- Verify audio file exists in `public/audio/`
- Test with different browsers
- Check console for loading errors

### Roll Checks Not Working
- Verify `requires_roll: true` is set
- Check `roll_check` object structure
- Ensure difficulty is reasonable (6-12)
- Test both success and failure cases

### Special Handler Issues
- Verify `requiresSpecialHandler: true` is set
- Check component import/export
- Ensure routing logic is added to TerminalInterface
- Test component renders correctly

## 10. Best Practices

### Naming Conventions
- **Codes**: lowercase, alphanumeric, descriptive (`research-lab-01`)
- **Files**: match terminal code (`research-lab-01.json`)
- **Audio**: descriptive with context (`research-lab-emergency.mp3`)

### Content Guidelines
- Keep log entries concise but atmospheric
- Use consistent date formatting (DDD-YYYY)
- Include realistic technical details
- Balance challenge with accessibility

### Security Design
- Start with difficulty 6-8 for routine checks
- Use 10+ for highly classified content
- Consider player skill progression
- Provide meaningful failure messages

### Performance Considerations
- Keep audio files under 5MB when possible
- Optimize JSON structure
- Use appropriate security levels
- Avoid overly complex special handlers

## 11. Advanced Features

### Dynamic Content
```json
{
  "title": "Real-time Status",
  "content": "System shows {{current_date}} readings",
  "dynamic": true
}
```

### Conditional Unlocks
```json
{
  "unlock_conditions": {
    "requires_terminals": ["terminal1", "terminal2"],
    "requires_story_flag": "mission_complete"
  }
}
```

### Cross-References
```json
{
  "content": "See also terminal code: RESEARCH-NODE-7 for related data",
  "references": ["research-node-7"]
}
```

## Example: Complete Terminal Implementation

### 1. Add to `src/lib/terminals.ts`
```typescript
{ 
  code: 'mining-station-07', 
  name: 'Belter Mining Station 07', 
  logPath: '/logs/mining-station-07.json',
  requiresRoll: 7
}
```

### 2. Create `public/logs/mining-station-07.json`
```json
[
  {
    "title": "Shift Report - Day 1247",
    "location": "Mining Station 07 - Operations",
    "date": "247-1105",
    "author": "Shift Supervisor Kane",
    "content": "Asteroid yield down 12% this quarter. Equipment showing wear.",
    "security_level": "unlocked",
    "requires_roll": false
  },
  {
    "title": "Safety Incident Report",
    "location": "Mining Station 07 - Safety Office", 
    "date": "248-1105",
    "author": "Safety Officer Martinez",
    "content": "Incident occurred in Sector 7. Full details require clearance.",
    "security_level": "restricted",
    "requires_roll": true,
    "roll_check": {
      "difficulty": 7,
      "skill": "Electronics (computers)",
      "on_success": "Hull breach in Sector 7 caused by equipment malfunction. Three casualties. Company covering up incident to avoid inspection.",
      "on_failure": "Insufficient clearance. Contact station administrator."
    }
  }
]
```

### 3. Test and Verify
- Enter code `mining-station-07` in terminal
- Verify both log entries display
- Test skill check for restricted content
- Confirm terminal saves to unlocked list

This completes the terminal addition process. Follow this guide to ensure consistent, functional terminals that integrate seamlessly with the existing system.