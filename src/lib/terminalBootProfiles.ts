export type TerminalCategory =
  | 'corrupted'
  | 'corporate'
  | 'high-security'
  | 'personal'
  | 'ship-systems'
  | 'public-kiosk'
  | 'research'
  | 'criminal'
  | 'maintenance'
  | 'government'
  | 'default';

export type ProgressStyle = 'glide' | 'stall' | 'fast' | 'pulse';

export interface TerminalBootProfile {
  category: TerminalCategory;
  headerLabel: string;
  accentColor: string;
  dimColor: string;
  bootMessages: string[];
  minDisplayMs: number;
  progressStyle: ProgressStyle;
}

// ── Terminal → category mapping ──────────────────────────────────────────────

const TERMINAL_CATEGORIES: Record<string, TerminalCategory> = {
  // Corrupted / Eclipse Shard-adjacent
  'es1-omegalab':    'corrupted',
  'es1-gamma':       'corrupted',
  'vennik-personal': 'corrupted',
  'blacktalon':      'corrupted',
  'sayelle-logs':    'corrupted',

  // Corporate
  'vennik01':        'corporate',
  'slocombe875':     'corporate',

  // High-security
  'azura01':         'high-security',

  // Personal nodes
  's.elara01':       'personal',

  // Ship systems
  'vanagandr001':    'ship-systems',

  // Public kiosks
  'caldonis_public': 'public-kiosk',
  'tobia-jashu01':   'public-kiosk',
  'torpolpub':       'public-kiosk',

  // Research / lab
  'lysani01':        'research',
  'labpc81':         'research',

  // Underground / criminal
  'blackcircuit01':  'criminal',
  'fuw01':           'criminal',
  'fuwnet':          'criminal',

  // Maintenance
  'waferterm01':     'maintenance',

  // Government / official
  'drinax_gat':      'government',
  'tppadmin':        'government',
};

export const getTerminalCategory = (code: string): TerminalCategory =>
  TERMINAL_CATEGORIES[code.toLowerCase()] ?? 'default';

// ── Boot profiles per category ────────────────────────────────────────────────

const BOOT_PROFILES: Record<TerminalCategory, TerminalBootProfile> = {
  corrupted: {
    category: 'corrupted',
    headerLabel: 'SYSTEM RECOVERY ATTEMPT',
    accentColor: '#ff6600',
    dimColor:    '#7a2e00',
    bootMessages: [
      '>> INITIATING BOOT SEQUENCE...',
      '>> [ERROR] CHECKSUM FAIL ON SECTOR 0x4A2F',
      '>> ATTEMPTING MEMORY RECOVERY...',
      '>> [WARNING] DATA INTEGRITY COMPROMISED — 3 SECTORS UNREADABLE',
      '>> [ERROR] KERNEL PANIC — RESTARTING SUBSYSTEM...',
      '>> LOADING PARTIAL FILE INDEX...',
      '>> [WARNING] ENCRYPTION KEY MISMATCH',
      '>> BYPASSING CORRUPTED AUTHENTICATION LAYER...',
      '>> PARTIAL SYSTEM ACCESS GRANTED',
      '>> [CAUTION] SYSTEM STABILITY NOT GUARANTEED',
    ],
    minDisplayMs: 6000,
    progressStyle: 'stall',
  },

  corporate: {
    category: 'corporate',
    headerLabel: 'VENNIK INDUSTRIES SECURE NETWORK',
    accentColor: '#00ccff',
    dimColor:    '#006688',
    bootMessages: [
      '>> VENNIK INDUSTRIES SECURED NETWORK v4.12.1',
      '>> COPYRIGHT 1103 VENNIK CORP — ALL RIGHTS RESERVED',
      '>> LOADING CORPORATE SECURITY MODULES...',
      '>> VERIFYING EMPLOYEE ACCESS CREDENTIALS...',
      '>> SYNCHRONIZING WITH CORPORATE HQ MAINFRAME...',
      '>> CORPORATE FIREWALL ACTIVE — THREAT LEVEL: LOW',
      '>> ACTIVITY ON THIS SYSTEM IS MONITORED AND LOGGED',
      '>> UNAUTHORIZED ACCESS IS A CRIMINAL OFFENSE',
      '>> SECURE SESSION ESTABLISHED.',
    ],
    minDisplayMs: 3750,
    progressStyle: 'fast',
  },

  'high-security': {
    category: 'high-security',
    headerLabel: 'HOUSE AZURA SECURITY DIVISION',
    accentColor: '#e0e0ff',
    dimColor:    '#8888bb',
    bootMessages: [
      '>> AZURA SECURITY NODE // CLASSIFIED SYSTEM',
      '>> INITIATING MULTI-LAYER AUTHENTICATION...',
      '>> BIOMETRIC VERIFICATION: SCANNING...',
      '>> [SCAN] RETINAL MATCH — PROCESSING',
      '>> RUNNING ACTIVE COUNTERMEASURE SWEEP...',
      '>> INTRUSION DETECTION SYSTEM: ARMED',
      '>> CHECKING AGAINST IMPERIAL WATCHLIST...',
      '>> VERIFYING NEED-TO-KNOW CLEARANCE...',
      '>> MULTI-FACTOR AUTHENTICATION COMPLETE',
      '>> SECURE ACCESS GRANTED. SESSION EXPIRES IN 15 MIN.',
    ],
    minDisplayMs: 5250,
    progressStyle: 'stall',
  },

  personal: {
    category: 'personal',
    headerLabel: 'PRIVATE NODE // PERSONAL SYSTEM',
    accentColor: '#00ff88',
    dimColor:    '#006633',
    bootMessages: [
      '>> PERSONAL NODE // PRIVATE SYSTEM',
      '>> DECRYPTING LOCAL CACHE...',
      '>> LOADING USER PREFERENCES...',
      '>> CHECKING MAIL — 3 NEW MESSAGES',
      '>> SYNCING PERSONAL FILES...',
      '>> WELCOME BACK.',
      '>> LAST ACCESS: 12 DAYS AGO',
    ],
    minDisplayMs: 3000,
    progressStyle: 'glide',
  },

  'ship-systems': {
    category: 'ship-systems',
    headerLabel: 'VESSEL SHIPNET — SYSTEMS INTERFACE',
    accentColor: '#00aaff',
    dimColor:    '#004477',
    bootMessages: [
      '>> VANAGANDR SHIPNET v2.3 — INITIALIZING',
      '>> RUNNING PRIMARY SYSTEMS CHECK...',
      '>> LIFE SUPPORT..................... OK',
      '>> MANEUVER DRIVE.................. OK',
      '>> JUMP DRIVE STATUS............... NOMINAL',
      '>> FUEL TANKAGE: 94% CAPACITY',
      '>> SENSORS......................... ACTIVE',
      '>> COMMS ARRAY..................... ONLINE',
      '>> BRIDGE LINK ESTABLISHED.',
    ],
    minDisplayMs: 3750,
    progressStyle: 'pulse',
  },

  'public-kiosk': {
    category: 'public-kiosk',
    headerLabel: 'IMPERIAL PUBLIC NETWORK',
    accentColor: '#bbffbb',
    dimColor:    '#559955',
    bootMessages: [
      '>> IMPERIAL PUBLIC NETWORK — LOCAL NODE',
      '>> PUBLIC TERMINAL // FREE ACCESS',
      '>> ACTIVITY ON THIS TERMINAL MAY BE MONITORED',
      '>> CONNECTING TO REGIONAL NETWORK...',
      '>> READY.',
    ],
    minDisplayMs: 2250,
    progressStyle: 'fast',
  },

  research: {
    category: 'research',
    headerLabel: 'RESEARCH NETWORK — SECURE ACCESS',
    accentColor: '#00ff00',
    dimColor:    '#006600',
    bootMessages: [
      '>> LYSANI RESEARCH NETWORK // SECURE PARTITION',
      '>> LOADING EXPERIMENT DATABASE...',
      '>> INITIALIZING LAB NETWORK PROTOCOLS...',
      '>> CROSS-REFERENCING PERSONNEL CLEARANCE...',
      '>> CLEARANCE LEVEL VERIFIED',
      '>> SECURE DATA ENVIRONMENT ACTIVE',
      '>> LAB NETWORK READY.',
    ],
    minDisplayMs: 3000,
    progressStyle: 'fast',
  },

  criminal: {
    category: 'criminal',
    headerLabel: 'ANONYMOUS RELAY — IDENTITY MASKED',
    accentColor: '#ff8800',
    dimColor:    '#663300',
    bootMessages: [
      '>> ESTABLISHING ANONYMOUS CONNECTION...',
      '>> ROUTING THROUGH RELAY NODE 1 OF 4...',
      '>> ROUTING THROUGH RELAY NODE 2 OF 4...',
      '>> ROUTING THROUGH RELAY NODE 3 OF 4...',
      '>> MASKING ORIGIN SIGNATURE...',
      '>> SPOOFING IMPERIAL TRAFFIC ANALYSIS...',
      '>> DARK NET RELAY ESTABLISHED',
      '>> [WARNING] ACCESS WINDOW: APPROXIMATELY 8 MINUTES',
      '>> PROCEED QUICKLY. LEAVE NO TRACE.',
    ],
    minDisplayMs: 4500,
    progressStyle: 'stall',
  },

  maintenance: {
    category: 'maintenance',
    headerLabel: 'MAINTENANCE TERMINAL — DIAGNOSTICS',
    accentColor: '#ffaa00',
    dimColor:    '#664400',
    bootMessages: [
      '>> MAINTENANCE TERMINAL v1.0 — WAFERTECH SYSTEMS',
      '>> RUNNING HARDWARE DIAGNOSTIC...',
      '>> MEMORY CHECK: 2 SECTORS FLAGGED',
      '>> THERMAL SENSORS: ELEVATED (NON-CRITICAL)',
      '>> NETWORK UPLINK: DEGRADED',
      '>> [WARNING] 4 WARNINGS DETECTED — SEE FAULT LOG',
      '>> SYSTEM DEGRADED — PROCEED WITH CAUTION.',
    ],
    minDisplayMs: 3000,
    progressStyle: 'pulse',
  },

  government: {
    category: 'government',
    headerLabel: 'DRINAX NETWORK — OFFICIAL USE ONLY',
    accentColor: '#44ccaa',
    dimColor:    '#226644',
    bootMessages: [
      '>> DRINAX GENERAL ACCESS TERMINAL // OFFICIAL USE ONLY',
      '>> IMPERIAL REGISTRY SYNCHRONIZING...',
      '>> VERIFYING GOVERNMENT CREDENTIALS...',
      '>> LOADING PUBLIC RECORDS INDEX...',
      '>> SECURE CHANNEL ESTABLISHED',
      '>> THIS SYSTEM IS PROPERTY OF THE IMPERIUM',
      '>> GOVERNMENT NODE READY.',
    ],
    minDisplayMs: 3750,
    progressStyle: 'fast',
  },

  default: {
    category: 'default',
    headerLabel: 'TRAVELLER TERMINAL // SYSTEM BOOT',
    accentColor: '#00ff00',
    dimColor:    '#006600',
    bootMessages: [
      '>> INITIALIZING TERMINAL SUBSYSTEMS...',
      '>> CONNECTING TO NETWORK NODE...',
      '>> AUTHENTICATING SECURITY PROTOCOLS...',
      '>> ESTABLISHING ENCRYPTED CHANNEL...',
      '>> SYNCHRONIZING DATABASE INDICES...',
      '>> TERMINAL READY.',
    ],
    minDisplayMs: 3000,
    progressStyle: 'glide',
  },
};

export const getTerminalBootProfile = (code: string): TerminalBootProfile =>
  BOOT_PROFILES[getTerminalCategory(code)];

// ── Ghost terminal easter egg ─────────────────────────────────────────────────

export const GHOST_PROBABILITY = 0.02; // 2% chance per terminal boot

export const GHOST_MESSAGES = [
  '>> RECOVERED PARTIAL TRANSMISSION — ORIGIN: UNKNOWN\n>> [TO: ANYONE WHO FINDS THIS]\n>> WE MADE IT TO SAYELLE.\n>> DO NOT FOLLOW US.\n>> — CDR. E. MORAH',

  '>> FRAGMENT RECOVERED — FILE DATE: 3 YEARS AGO\n>> HE IS STILL IN THE SYSTEM.\n>> THEY CALL IT THE ECLIPSE.\n>> DON\'T LOOK DIRECTLY AT THE—\n>> [RECORD CORRUPTED]',

  '>> GHOST DATA: PREVIOUS USER SESSION DETECTED\n>> LOG ENTRY: IF YOU ARE READING THIS,\n>> THE STATION IS ALREADY COMPROMISED.\n>> INITIATED PURGE SEQUENCE. INCOMPLETE.\n>> — AUTOMATED SYSTEM',

  '>> RESIDUAL MEMORY FRAGMENT\n>> THEY WEREN\'T RESEARCHERS.\n>> THEY WERE BAIT.\n>> THE ES1 PROJECT WAS NEVER AUTHORIZED.\n>> [DATA EXPUNGED]',

  '>> RECOVERED DRAFT — UNSENT\n>> TO: LYSANI OVERSIGHT BOARD\n>> I CANNOT IN GOOD CONSCIENCE CONTINUE THIS WORK.\n>> THE SHARD RESPONDS TO CONSCIOUS INTENT.\n>> IT REMEMBERS.\n>> [MESSAGE NEVER SENT]',

  '>> ANOMALY DETECTED IN SESSION CACHE\n>> PREVIOUS OPERATOR: [IDENTITY SCRUBBED]\n>> FINAL LOG ENTRY: THEY\'VE BEEN HERE THE WHOLE TIME.\n>> WE JUST COULDN\'T SEE THEM.\n>> [END OF RECORD]',
];
