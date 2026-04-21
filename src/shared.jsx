
// terminal/shared.jsx — Themes, data, utilities
// All symbols exported to window for cross-script access

const TT = {
  shipboard: {
    id: 'shipboard', name: 'SHIPBOARD', accent: '#00ccff', dim: '#004466',
    bg: '#000810', label: 'VANAGANDR SHIPBOARD SYSTEMS',
    headerLabel: 'SYS // VANAGANDR-001 // OPERATIONS & NAVIGATION',
    connectStyle: 'orbital', glitchLevel: 0.06,
    uptime: '47d 12h',
  },
  corporate: {
    id: 'corporate', name: 'CORPORATE', accent: '#ffaa00', dim: '#664400',
    bg: '#080601', label: 'FUWNET CORPORATE MAINFRAME',
    headerLabel: 'FUWNET // SECTOR 7 // FINANCIAL SYSTEMS',
    connectStyle: 'grid', glitchLevel: 0.02,
    uptime: '312d 8h',
  },
  government: {
    id: 'government', name: 'IMPERIAL', accent: '#ffe066', dim: '#665500',
    bg: '#080800', label: 'IMPERIAL INTELLIGENCE NETWORK',
    headerLabel: 'CLASSIFIED // IMPERIAL AUTHORITY // SECTOR SECURITY',
    connectStyle: 'secure', glitchLevel: 0.15,
    uptime: '8d 3h',
  },
  criminal: {
    id: 'criminal', name: 'CRIMINAL', accent: '#ff4422', dim: '#661100',
    bg: '#080100', label: 'BLACKNET // ENCRYPTED RELAY',
    headerLabel: '/// BLACKTALON // PIRATE RELAY NODE ///',
    connectStyle: 'chaos', glitchLevel: 0.45,
    uptime: '???',
  },
};

const TERMINAL_CODES = {
  'VANAGANDR001': 'shipboard', 'VANAGANDR': 'shipboard', 'SHIP': 'shipboard',
  'FUWNET': 'corporate', 'FUWNET01': 'corporate', 'CORP': 'corporate', 'FUW01': 'corporate',
  'IMPERIAL': 'government', 'ES1-GAMMA': 'government', 'GAMMA': 'government',
  'BLACKTALON': 'criminal', 'BLACKNET': 'criminal', 'PIRATE': 'criminal',
};

const LOGS = {
  shipboard: [
    { id:'s1', title:'NAV LOG — JUMP 7', date:'127-1105', author:'HELM-AI', security_level:'standard',
      content:'Jump drive engaged at 0340 ship time.\nCourse plotted to Efate subsector via jump-2.\nETA: 168 hours standard. All navigation systems nominal.\n\nPassenger manifest reviewed. Cargo bay 3 sealed per Captain\'s standing orders.\n\nPassive sensor contact logged at bearing 227-14 — see Anomaly Report.' },
    { id:'s2', title:'ENGINE ROOM STATUS', date:'125-1105', author:'CHIEF ENGINEER', security_level:'standard',
      content:'Power plant: 94% efficiency\nJump capacitors: 97% charged\nManeuver drive: nominal (2-G rated)\nLife support: all green\n\nConcern: particulate buildup in fuel processor inlet #3.\nNon-critical — recommend maintenance at next port call.\n\nFuel reserves: 82% max. Sufficient for planned route.' },
    { id:'s3', title:'BRIDGE LOG — CAPTAIN', date:'126-1105', author:'CAPTAIN', security_level:'restricted', requires_password:true,
      content:'CAPTAIN PERSONAL LOG — LEVEL 4 ENCRYPTION\n\nThe cargo in bay 3 is not what the manifest states. The weight is wrong. Seventeen tonnes wrong.\n\nWe are being followed. Type-S scout, no transponder. Lost them in the gas giant\'s shadow but they are good.\n\nTelling no one yet. At Efate I contact my Navy source quietly.\n\nCombination: 7-7-4-1-SIGMA. If something happens to me.' },
    { id:'s4', title:'SENSOR ANOMALY REPORT', date:'124-1105', author:'SENSOR OFFICER', security_level:'high', requires_roll:true, roll_check:{ difficulty:8, skill:'Electronics (Sensors)' },
      content:'Contact at bearing 227-14, elevation +12°.\nProfile: Type-S scout running silent. No transponder.\nAcoustic signature not in Imperial registry.\n\nTrack held for 2h 17m before contact dissolved into Tanith debris field.\n\nRECOMMEND: Heightened sensor watch. Brief captain.' },
    { id:'s5', title:'CARGO MANIFEST — BAY 3', date:'119-1105', author:'CARGO MASTER', security_level:'high',
      content:'OFFICIAL MANIFEST:\n  Medical supplies (class 4-A) .... 34 tonnes\n\nACTUAL SCAN:\n  Measured: ████████████ [REDACTED]\n  Discrepancy: ████████████\n\nSEALED BY CAPTAIN\'S AUTHORITY\nACCESS LEVEL 5+ ONLY\n\n// DO NOT SCAN // DO NOT OPEN //' },
    { id:'s6', title:'CREW MANIFEST', date:'120-1105', author:'PURSER', security_level:'standard',
      content:'ACTIVE CREW (7): Captain, Pilot, Navigator, Engineer, Medic, Gunner x2\nAll cleared, biometrics logged.\n\nPASSENGERS (5):\n  High passage: 3 — documentation verified\n  Middle passage: 2 — documentation verified\n\nNo irregularities.' },
  ],
  corporate: [
    { id:'c1', title:'Q3 FINANCIAL SUMMARY', date:'110-1105', author:'CFO-AI', security_level:'standard',
      content:'Revenue:    4,720,000 Cr\nOperating: -3,108,000 Cr\nNet:        1,612,000 Cr  (+12.4% vs Q2)\n\nROUTE PERFORMANCE:\n  Alpha (Efate-Alell-Yres):  +12% vs projection\n  Beta  (Regina-Efate):       -3% vs projection\n  Gamma (Alell-Corridor):     +7% vs projection\n\nREC: Increase Alpha allocation for Q4.' },
    { id:'c2', title:'PERSONNEL FILE — RESTRICTED', date:'108-1105', author:'HR DIVISION', security_level:'restricted', requires_password:true,
      content:'EMPLOYEE: ████████████████\nPOSITION: Regional Director, Sector 7\nCLEARANCE: Level 4\n\nFLAGGED: Under surveillance — Board Directive 7-C.\nSuspected information leak to competitor.\nDO NOT ALERT SUBJECT.\n\nACTION: Contact Special Investigations if access pattern changes.' },
    { id:'c3', title:'ACQUISITION TARGET BRIEF', date:'105-1105', author:'BOARD', security_level:'critical', requires_roll:true, roll_check:{ difficulty:10, skill:'Electronics (Computers)' },
      content:'TARGET: Zhodani Interests Ltd.\nESTIMATED VALUE: 340,000,000 Cr\nAPPROACH: Hostile acquisition via proxy entities\n\nPHASE 1: Approach key shareholders with confidential offer\nPHASE 2: ████████████████████████████████\nPHASE 3: ████████████████████████████████\n\nTIMELINE: 6 months. All proxies in position before the sector summit.\nDO NOT DISCLOSE. Breach is a terminable offense.' },
    { id:'c4', title:'TRADE ROUTE DATA', date:'100-1105', author:'LOGISTICS-AI', security_level:'standard',
      content:'Route 7-Alpha: Efate→Alell→Yres\n  Margin: 340 Cr/ton | Cargo: Electronics, Pharma | Risk: LOW\n\nRoute 9-Beta: Regina→Efate\n  Margin: 210 Cr/ton | Cargo: Consumables | Risk: MODERATE\n\nRoute 12-Epsilon: Alell→████████\n  CLASSIFIED — Level 3 access required' },
  ],
  government: [
    { id:'g1', title:'INTELLIGENCE BRIEF — CLASSIFIED', date:'001-1105', author:'DIRECTORATE', security_level:'critical', requires_password:true,
      content:'LEVEL 5 CLEARANCE REQUIRED\n\nSubsector destabilization pattern: CONFIRMED.\n7 incidents in 6 months. Probability of coincidence: <0.3%\n\nOperation SILENT WARDEN: Phase 2 authorized.\n\nAll field operatives: maintain cover.\nExtraction protocols standing by — frequency DELTA-7.\n\n[EYES ONLY — DESTROY AFTER READING]' },
    { id:'g2', title:'DOSSIER: SUBJECT 7741', date:'089-1105', author:'SPECIAL BRANCH', security_level:'critical', requires_roll:true, roll_check:{ difficulty:12, skill:'Electronics (Computers)' },
      content:'SUBJECT:     ████████████████\nSTATUS:      WANTED — EXTREME DANGER\nLAST KNOWN:  Efate downport, Level 7 transient quarter\nDANGER:      5/5\n\nCONFIRMED:\n  3 assassinations (noble, agent, merchant)\n  2 corporate espionage ops (Fuwnet, Tukera)\n  1 attempt on Imperial noble\n\n>> APPREHEND ON SIGHT\n>> DO NOT ENGAGE ALONE\n>> LETHAL FORCE AUTHORIZED' },
    { id:'g3', title:'SECTOR SECURITY ASSESSMENT', date:'071-1105', author:'NAVAL INTELLIGENCE', security_level:'high',
      content:'Piracy incidents: +23% this quarter.\nAffected: Beta, Gamma, Epsilon corridors.\n\nRECOMMENDATIONS:\n  1. Increase naval patrol on Beta route\n  2. Advisory embargo for Yres (corruption concern)\n  3. Deploy Q-ship on Gamma route — undercover\n  4. Review convoy protocols for vessels 200t+\n\nClassified appendix: Level 3 required.' },
    { id:'g4', title:'DIRECTIVE 7-ZETA', date:'055-1105', author:'IMPERIAL AUTHORITY', security_level:'critical', requires_password:true,
      content:'DIRECTIVE 7-ZETA: MARTIAL LAW CONTINGENCY\n\nTRIGGER: Category-4 destabilization event\n\n1. All civilian transports grounded immediately\n2. Imperial forces assume port authority — Class A & B ports\n3. ████████████████████████████████████████\n4. Communications blackout — civilian channels suspended\n\nTHIS DIRECTIVE SUPERSEDES ALL LOCAL LAW.' },
  ],
  criminal: [
    { id:'cr1', title:'HEIST PLAN — ALPHA', date:'???-????', author:'UNKNOWN', security_level:'critical',
      content:'TARGET: Fuwnet vault — Sector 7, sublevel 3\nENTRY: Docking bay maintenance shaft, junction 7-C\nCREW: 4 (pilot, tech-4+, muscle x2)\nWINDOW: 72 hours\n\nSECURITY: 90-min rotation, 6 guards day / 3 night\nVAULT: Megacorp Grade-3 — need Tech-4+\n\nPAYOUT: 250,000 Cr split 4 ways\n\nDon\'t contact me on this channel after.' },
    { id:'cr2', title:'HEAT MAP — ENFORCEMENT', date:'???-????', author:'SCOUT', security_level:'high',
      content:'HOT ZONES — AVOID:\n  Jenghe:  6 naval patrols active\n  Efate:   Deep-scan array at highport (2AU range)\n  Regina:  Imperial crackdown — 4 arrests last week\n\nCLEAR:\n  Alell:   Minimal enforcement, harbor master cooperative\n  Yres:    Port authority negotiable — standard rate\n  Bowman:  No questions asked\n\nUpdate cycle: 48h. Check timestamp before relying.' },
    { id:'cr3', title:'BOUNTY LIST — ACTIVE', date:'???-????', author:'NETWORK', security_level:'standard',
      content:'DO NOT SHARE OUTSIDE NETWORK\n\n#1: ████████████████ — 50,000 Cr D.O.A.\n    Last: Efate starport, Level 7\n\n#2: ████████████████ — 25,000 Cr ALIVE ONLY\n    Must be intact for intel extraction\n\n#3: Imperial Scout (unlicensed Type-S) — 15,000 Cr\n    Crew: neutralize or recruit\n\n#4: ████████████████ — 8,000 Cr\n    Low priority. Take if opportunity.' },
    { id:'cr4', title:'ENCRYPTED COMM LOG', date:'???-????', author:'RELAY NODE', security_level:'critical', requires_roll:true, roll_check:{ difficulty:11, skill:'Electronics (Computers)' },
      content:'ORIGIN: UNKNOWN RELAY NODE\nENCRYPTION: MILITARY GRADE — ZHODANI PATTERN\nDECRYPTION: PARTIAL (31%)\n\nFRAGMENTS:\n"...shipment moves in three days..."\n"...cargo is not what they think..."\n"...if they find out about the ████████..."\n"...do not contact me again on this channel..."\n\n[SIGNAL DEGRADED — ORIGIN TRACE FAILED]' },
  ],
};

const GLITCH_CHARS = '░▒▓█▄▀■□▪◘◙ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*/\\<>?;:|~`';
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%!?/\\';

function glitchChar() { return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]; }
function matrixChar() { return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]; }

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededRng(seed) {
  let s = hashStr(String(seed)) || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function fakeFileSize(seed) {
  const rng = seededRng(seed);
  const kb = Math.floor(rng() * 900 + 12);
  return kb >= 1000 ? `${(kb/1024).toFixed(1)}MB` : `${kb}KB`;
}

Object.assign(window, { TT, TERMINAL_CODES, LOGS, GLITCH_CHARS, MATRIX_CHARS, glitchChar, matrixChar, hashStr, seededRng, fakeFileSize });
