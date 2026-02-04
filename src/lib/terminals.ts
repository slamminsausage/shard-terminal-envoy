export interface TerminalDefinition {
  code: string;
  name: string;
  logPath: string;
  requiresRoll?: number;
  requiresPassword?: boolean;
  password?: string;
  requiresSpecialHandler?: boolean;
}

export const TERMINALS: TerminalDefinition[] = [
  { code: 'lysani01', name: 'Lysani Labs System', logPath: '/logs/lysani01.json', requiresRoll: 8 },
  { code: 's.elara01', name: 'S. Elara Personal Node', logPath: '/logs/s.elara01.json' },
  { code: 'slocombe875', name: 'Slocombe Manufacturing Node', logPath: '/logs/slocombe875.json', requiresRoll: 8 },
  { code: 'waferterm01', name: 'Wafertech Maintenance Terminal', logPath: '/logs/waferterm01.json' },
  { code: 'labpc81', name: 'Research Lab PC-81', logPath: '/logs/labpc81.json', requiresRoll: 6 },
  { code: 'vanagandr001', name: 'Vanagandr Ship Systems', logPath: '/logs/vanagandr001.json', requiresRoll: 8 },
  { code: 'blackcircuit01', name: 'Black Circuit Relay', logPath: '/logs/blackcircuit01.json', requiresRoll: 8 },
  { code: 'fuw01', name: 'Free Union Workers Ops', logPath: '/logs/fuw01.json', requiresRoll: 8 },
  { code: 'azura01', name: 'House Azura Security Node', logPath: '/logs/azura01.json', requiresRoll: 10 },
  {
    code: 'vennik01',
    name: 'Vennik Corporate Hub',
    logPath: '/logs/vennik01.json',
    requiresRoll: 12,
    requiresPassword: true,
    password: 'vennik4ever'
  },
  { code: 'caldonis_public', name: 'Caldonis Public Network', logPath: '/logs/caldonis_public.json' },
  { code: 'es1-omegalab', name: 'ES1-OmegaLab', logPath: '/logs/es1-omegalab.json', requiresRoll: 10 },
  { code: 'es1-gamma', name: 'ES1-Gamma (Sub-Level 1)', logPath: '/logs/es1-gamma.json', requiresRoll: 10 },
  { code: 'blacktalon', name: 'Black Talon Operations', logPath: '/logs/blacktalon.json', requiresRoll: 12 },
  { code: 'vennik-personal', name: 'R. Vennik Personal Node', logPath: '/logs/vennik-personal.json', requiresRoll: 10 },
  { code: 'sayelle-logs', name: 'Sayelle Archive', logPath: '/logs/sayelle-logs.json', requiresRoll: 8 },
  { code: 'fuwnet', name: 'FUW Network Uplink', logPath: '/logs/fuw-network.json', requiresRoll: 8 },
  { code: 'tobia-jashu01', name: 'Tobia – Jashu Public Info Kiosk', logPath: '/logs/tobia-jashu01.json'},
  { code: 'drinax_gat', name: 'Drinax General Access Terminal', logPath: '/logs/drinax_gat.json', requiresRoll: 8 },
  { code: '01-1485-10-4-89-40', name: 'Deep Core Security', logPath: '/logs/01-1485-10-4-89-40.json', requiresSpecialHandler: true }
];

export const TERMINAL_MAP = new Map(TERMINALS.map(terminal => [terminal.code.toLowerCase(), terminal]));

export const getTerminalDefinition = (code: string) => {
  return TERMINAL_MAP.get(code.toLowerCase());
};
