export interface TerminalDefinition {
  code: string;
  name: string;
  logPath: string;
  requiresRoll?: number;
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
    requiresRoll: 12
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
  { code: 'torpolpub', name: 'Torpol Polar Port – Public Kiosk', logPath: '/logs/torpolpub.json' },
  { code: 'tppadmin', name: 'Torpol Port Authority – Admin Node', logPath: '/logs/tppadmin.json', requiresRoll: 8 },
  { code: '01-1485-10-4-89-40', name: 'Deep Core Security', logPath: '/logs/01-1485-10-4-89-40.json', requiresSpecialHandler: true },
  { code: 'hg_xii_bridge', name: 'HG-Borite-XII Bridge Command', logPath: '/logs/hg-xii-bridge.json' },
  { code: 'hg_xii_general', name: 'HG-Borite-XII General Access', logPath: '/logs/hg-xii-general.json' },
  { code: 'hg_xii_krrsh', name: 'HG-Borite-XII — Krrsh Personal Terminal', logPath: '/logs/hg-xii-krrsh.json', requiresRoll: 10 },
  { code: 'seqtest', name: 'Action Sequence Test Terminal', logPath: '/logs/example-sequences.json' },
  // Blacksand City / Theev arc
  { code: 'blacksand_downport', name: 'Blacksand Downport — Public Terminal',  logPath: '/logs/terminal_blacksand_downport.json' },
  { code: 'grand_hotel',        name: 'Grand Hotel — Upper City',               logPath: '/logs/terminal_grand_hotel_upper_city.json' },
  { code: 'scrapheap',          name: 'Scrapheap — Salvager Terminal',          logPath: '/logs/terminal_scrapheap.json' },
  { code: 'house_blood_pit',    name: 'Lower City — House & Blood Pit',         logPath: '/logs/terminal_house_and_blood_pit.json' },
  { code: 'ferrik_intel',       name: 'Ferrik Redthane — Active Bounty',        logPath: '/logs/terminal_ferrik_intel.json' },
  { code: 'lower_city',         name: 'Lower City — Public Kiosk',              logPath: '/logs/terminal_lower_city.json' },
  { code: 'asharden_lore',      name: 'Asharden Camp — Archive Terminal',       logPath: '/logs/terminal_asharden_and_lore.json' },
];

export const TERMINAL_MAP = new Map(TERMINALS.map(terminal => [terminal.code.toLowerCase(), terminal]));

export const getTerminalDefinition = (code: string) => {
  return TERMINAL_MAP.get(code.toLowerCase());
};
