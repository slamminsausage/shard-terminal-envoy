/**
 * Traveller Core Rulebook - Augments Catalog
 *
 * Augments cover cybernetic implants, genetic engineering, and surgical
 * alterations. Each TL/improvement level is a separate entry for clean
 * dropdown selection. All augments require surgery to install (typically
 * 1D weeks, often reduced with Slow Drug).
 *
 * Important rules:
 * - Augmentations can take characteristics above species maximums.
 * - Augments interfere with medical treatment: long-term care / surgery
 *   Medic checks suffer a negative DM equal to the TL difference between
 *   the medical facility and the highest relevant implant.
 * - Skill Augmentation is limited to one per Traveller, and the
 *   Traveller must already have the skill at level 0+.
 */

import { AugmentCatalogItem } from './types';

// ═══════════════════════════════════════════════════════════════════════
//  PHYSICAL AUGMENTATIONS  —  STR, DEX, END
// ═══════════════════════════════════════════════════════════════════════

export const PHYSICAL_AUGMENTS: AugmentCatalogItem[] = [
  // ── Strength ─────────────────────────────────────────────────────
  {
    id: 'str-aug-1',
    name: 'Strength Augmentation +1',
    category: 'augment',
    augmentType: 'physical',
    tl: 11,
    mass_kg: 0,
    cost: 500000,
    improvement: 'STR +1',
    slot: 'musculature',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Reinforced bones, replaced motor neurons with faster synthetic cells, and vat-grown muscle tissue boost raw physical strength. Can take STR above species maximum. Must be purchased separately from DEX/END augmentations.',
  },
  {
    id: 'str-aug-2',
    name: 'Strength Augmentation +2',
    category: 'augment',
    augmentType: 'physical',
    tl: 12,
    mass_kg: 0,
    cost: 1000000,
    improvement: 'STR +2',
    slot: 'musculature',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Extensive replacement of motor neurons and reinforcement of the skeletal and muscular systems. More invasive than the +1 variant but significantly more effective.',
  },
  {
    id: 'str-aug-3',
    name: 'Strength Augmentation +3',
    category: 'augment',
    augmentType: 'physical',
    tl: 15,
    mass_kg: 0,
    cost: 5000000,
    improvement: 'STR +3',
    slot: 'musculature',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Near-total replacement of the musculoskeletal system with advanced synthetic components. The pinnacle of physical enhancement technology.',
  },

  // ── Dexterity ────────────────────────────────────────────────────
  {
    id: 'dex-aug-1',
    name: 'Dexterity Augmentation +1',
    category: 'augment',
    augmentType: 'physical',
    tl: 11,
    mass_kg: 0,
    cost: 500000,
    improvement: 'DEX +1',
    slot: 'nervous system',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Replacement of peripheral nerve fibres with faster synthetic substrates and fine-tuning of motor control centres. Improves reaction time, hand-eye coordination, and fine motor skills.',
  },
  {
    id: 'dex-aug-2',
    name: 'Dexterity Augmentation +2',
    category: 'augment',
    augmentType: 'physical',
    tl: 12,
    mass_kg: 0,
    cost: 1000000,
    improvement: 'DEX +2',
    slot: 'nervous system',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Extensive nervous system reworking with synthetic nerve clusters and enhanced proprioception. Significantly faster reflexes and precision.',
  },
  {
    id: 'dex-aug-3',
    name: 'Dexterity Augmentation +3',
    category: 'augment',
    augmentType: 'physical',
    tl: 15,
    mass_kg: 0,
    cost: 5000000,
    improvement: 'DEX +3',
    slot: 'nervous system',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Near-total replacement of the peripheral nervous system. Reaction times and motor precision far exceed natural human limits.',
  },

  // ── Endurance ────────────────────────────────────────────────────
  {
    id: 'end-aug-1',
    name: 'Endurance Augmentation +1',
    category: 'augment',
    augmentType: 'physical',
    tl: 11,
    mass_kg: 0,
    cost: 500000,
    improvement: 'END +1',
    slot: 'organs',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Replacement of key organs with tougher vat-grown clones and reinforcement of the cardiovascular system. Improved stamina, resilience, and recovery.',
  },
  {
    id: 'end-aug-2',
    name: 'Endurance Augmentation +2',
    category: 'augment',
    augmentType: 'physical',
    tl: 12,
    mass_kg: 0,
    cost: 1000000,
    improvement: 'END +2',
    slot: 'organs',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Extensive organ replacement and cardiovascular enhancement. The body can sustain far greater punishment and recover more quickly.',
  },
  {
    id: 'end-aug-3',
    name: 'Endurance Augmentation +3',
    category: 'augment',
    augmentType: 'physical',
    tl: 15,
    mass_kg: 0,
    cost: 5000000,
    improvement: 'END +3',
    slot: 'organs',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Near-total replacement of vital organs with advanced synthetic equivalents. Superhuman endurance and resilience to injury, toxins, and fatigue.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  COGNITIVE AUGMENTATION  —  INT
// ═══════════════════════════════════════════════════════════════════════

export const COGNITIVE_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'int-aug-1',
    name: 'Cognitive Augmentation +1',
    category: 'augment',
    augmentType: 'cognitive',
    tl: 12,
    mass_kg: 0,
    cost: 500000,
    improvement: 'INT +1',
    slot: 'brain',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Replacing slow nerve cells with faster synthetic substrates and implanting optoelectronic boosters increases the speed at which a Traveller thinks, effectively boosting their intelligence.',
  },
  {
    id: 'int-aug-2',
    name: 'Cognitive Augmentation +2',
    category: 'augment',
    augmentType: 'cognitive',
    tl: 14,
    mass_kg: 0,
    cost: 1000000,
    improvement: 'INT +2',
    slot: 'brain',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Extensive neural replacement with synthetic substrates and multiple optoelectronic boosters. Dramatically faster cognitive processing and pattern recognition.',
  },
  {
    id: 'int-aug-3',
    name: 'Cognitive Augmentation +3',
    category: 'augment',
    augmentType: 'cognitive',
    tl: 16,
    mass_kg: 0,
    cost: 5000000,
    improvement: 'INT +3',
    slot: 'brain',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Near-total neural augmentation with advanced synthetic cognitive architecture. Thought processes far exceed baseline human capability.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  NEURAL IMPLANTS  —  Neural Comm, Wafer Jack
// ═══════════════════════════════════════════════════════════════════════

export const NEURAL_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'neural-comm-audio',
    name: 'Neural Comm (Audio)',
    category: 'augment',
    augmentType: 'neural',
    tl: 10,
    mass_kg: 0,
    cost: 1000,
    improvement: 'Audio comm (thought-activated)',
    slot: 'neural',
    stackable: false,
    installationTime: '1D weeks',
    description: 'An implanted communications device with identical capacities to a standard comm, but operated by thought alone. Audio-only at this TL. Still requires skill checks for complicated activities.',
  },
  {
    id: 'neural-comm-av',
    name: 'Neural Comm (Audio/Visual)',
    category: 'augment',
    augmentType: 'neural',
    tl: 12,
    mass_kg: 0,
    cost: 5000,
    improvement: 'Audio/Visual comm, Computer/0',
    slot: 'neural',
    stackable: false,
    installationTime: '1D weeks',
    description: 'An advanced neural comm supporting both audio and visual data transmission, with an integrated Computer/0. Operated entirely by thought.',
  },
  {
    id: 'neural-comm-full',
    name: 'Neural Comm (Full Spectrum)',
    category: 'augment',
    augmentType: 'neural',
    tl: 14,
    mass_kg: 0,
    cost: 20000,
    improvement: 'Multiple data forms, Computer/1',
    slot: 'neural',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A top-of-the-line neural comm capable of transmitting and receiving multiple forms of data simultaneously. Includes an integrated Computer/1, all operated by thought alone.',
  },
  {
    id: 'wafer-jack-4',
    name: 'Wafer Jack (Bandwidth/4)',
    category: 'augment',
    augmentType: 'neural',
    tl: 12,
    mass_kg: 0,
    cost: 10000,
    improvement: 'Expert programs (INT/EDU), Bandwidth/4',
    slot: 'skull base',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A computer system implanted into the base of the skull with a physical data socket and processor running an interface program. Allows use of Expert programs for INT or EDU tasks by thought alone. Has Computer/2 for Expert programs only and always runs Intelligence Interface (no Bandwidth cost). Swapping software requires physical media. Bandwidth/4 for Expert software.',
  },
  {
    id: 'wafer-jack-8',
    name: 'Wafer Jack (Bandwidth/8)',
    category: 'augment',
    augmentType: 'neural',
    tl: 13,
    mass_kg: 0,
    cost: 15000,
    improvement: 'Expert programs (INT/EDU), Bandwidth/8',
    slot: 'skull base',
    stackable: false,
    installationTime: '1D weeks',
    description: 'An upgraded wafer jack with double the bandwidth for running Expert programs. Same capabilities as the Bandwidth/4 version but supports more complex or multiple Expert programs simultaneously.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SENSORY AUGMENTATION
// ═══════════════════════════════════════════════════════════════════════

export const SENSORY_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'enhanced-vision',
    name: 'Enhanced Vision',
    category: 'augment',
    augmentType: 'sensory',
    tl: 13,
    mass_kg: 0,
    cost: 25000,
    improvement: 'Binoculars, IR/Light Intensification',
    slot: 'eyes',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Augmented eyes with built-in binocular magnification, infrared vision, and light intensification. Provides the equivalent of electronic binoculars and IR/LI goggles at all times without external equipment.',
  },
  {
    id: 'ballistic-tracking-lenses',
    name: 'Ballistic Tracking Lenses',
    category: 'augment',
    augmentType: 'sensory',
    tl: 12,
    mass_kg: 0,
    cost: 40000,
    improvement: 'DM+1 to all ranged attacks',
    slot: 'eyes',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Implanted optical processors that calculate ballistic trajectories in real time, overlaying targeting solutions directly onto the Traveller\'s vision. Grants DM+1 to all ranged attack rolls.',
  },
  {
    id: 'cockpit-sensory-suite',
    name: 'Cockpit Sensory Suite',
    category: 'augment',
    augmentType: 'sensory',
    tl: 9,
    mass_kg: 0,
    cost: 1000000,
    improvement: 'DM+1 to Pilot, Drive, Flyer, and Seafarer checks',
    slot: 'eyes/neural',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A comprehensive neural-sensory interface that integrates vehicle sensor feeds directly into the Traveller\'s perception. Grants DM+1 to all Pilot, Drive, Flyer, and Seafarer skill checks when operating a vehicle.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SKILL AUGMENTATION
// ═══════════════════════════════════════════════════════════════════════

export const SKILL_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'skill-augmentation',
    name: 'Skill Augmentation',
    category: 'augment',
    augmentType: 'skill',
    tl: 12,
    mass_kg: 0,
    cost: 50000,
    improvement: 'Skill DM+1 (one specific skill)',
    slot: 'nervous system',
    stackable: false,
    installationTime: '1D weeks',
    description: 'The Traveller\'s nervous system is rewired to be more suited to a particular task. A pilot might have their reflexes improved; a broker might control pupil responses and smell pheromones. Grants DM+1 when using one specific skill. Limited to ONE skill augmentation per Traveller. Must already possess the skill at level 0 or higher.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  PROTECTIVE AUGMENTATION
// ═══════════════════════════════════════════════════════════════════════

export const PROTECTIVE_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'subdermal-armour-1',
    name: 'Subdermal Armour +1',
    category: 'augment',
    augmentType: 'protective',
    tl: 10,
    mass_kg: 0,
    cost: 50000,
    improvement: 'Protection +1',
    slot: 'skeletal/skin',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A mesh of ballistic fibres added to the skin and reinforced bones, giving the Traveller extra armour. Subdermal armour stacks with other worn protection.',
  },
  {
    id: 'subdermal-armour-3',
    name: 'Subdermal Armour +3',
    category: 'augment',
    augmentType: 'protective',
    tl: 11,
    mass_kg: 0,
    cost: 100000,
    improvement: 'Protection +3',
    slot: 'skeletal/skin',
    stackable: false,
    installationTime: '1D weeks',
    description: 'An extensive mesh of advanced ballistic fibres woven under the skin with significant bone reinforcement. Provides substantial armour that stacks with all other worn protection.',
  },
  {
    id: 'subdermal-armour-4',
    name: 'Subdermal Armour +4',
    category: 'augment',
    augmentType: 'protective',
    tl: 12,
    mass_kg: 0,
    cost: 250000,
    improvement: 'Protection +4',
    slot: 'skeletal/skin',
    stackable: false,
    installationTime: '1D weeks',
    description: 'High-grade composite ballistic mesh and ceramic plates bonded beneath the skin with extensive skeletal reinforcement. Significant protection that stacks with all other worn armour.',
  },
  {
    id: 'subdermal-armour-5',
    name: 'Subdermal Armour +5',
    category: 'augment',
    augmentType: 'protective',
    tl: 14,
    mass_kg: 0,
    cost: 500000,
    improvement: 'Protection +5',
    slot: 'skeletal/skin',
    stackable: false,
    installationTime: '1D weeks',
    description: 'The pinnacle of subdermal protection: advanced nano-composite armour layered throughout the dermal and skeletal structure. Provides formidable protection stacking with all other worn armour.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  CYBERLIMBS & PROSTHETICS  —  Combat Arms, Weapon Implants, Mobility
// ═══════════════════════════════════════════════════════════════════════

export const CYBERLIMB_AUGMENTS: AugmentCatalogItem[] = [
  // ── Prosthetics ──────────────────────────────────────────────────
  {
    id: 'crude-prosthetic',
    name: 'Crude Prosthetic',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 3,
    mass_kg: 0,
    cost: 100,
    improvement: 'Replaces lost limb; DEX -2',
    slot: 'limb',
    stackable: true,
    installationTime: '1D weeks',
    description: 'A basic mechanical replacement for a missing limb with limited functionality. Functional but clumsy; imposes DM-2 to DEX checks involving the prosthetic.',
  },
  {
    id: 'functional-prosthetic',
    name: 'Functional Prosthetic',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 7,
    mass_kg: 0,
    cost: 250,
    improvement: 'Replaces lost limb; DEX -1',
    slot: 'limb',
    stackable: true,
    installationTime: '1D weeks',
    description: 'A serviceable cybernetic limb replacement. Still slightly less precise than a natural limb, imposing DM-1 to DEX checks involving the prosthetic.',
  },

  // ── Combat Arms ──────────────────────────────────────────────────
  {
    id: 'combat-arm-tl8',
    name: 'Combat Arm (TL8)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 8,
    mass_kg: 0,
    cost: 25000,
    improvement: 'STR 12, Armour +2',
    slot: 'arm',
    stackable: true,
    installationTime: '1D weeks',
    description: 'A military-grade cybernetic arm replacement built for combat. Sets the arm\'s effective STR to 12 (if higher, use the character\'s own STR) and provides an Armour bonus of +2 on that limb.',
  },
  {
    id: 'combat-arm-tl11',
    name: 'Combat Arm (TL11)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 11,
    mass_kg: 0,
    cost: 50000,
    improvement: 'STR 15, Armour +4',
    slot: 'arm',
    stackable: true,
    installationTime: '1D weeks',
    description: 'An advanced combat arm with improved synthetic musculature and hardened armour plating. Sets effective arm STR to 15 and provides Armour +4 on that limb.',
  },
  {
    id: 'combat-arm-tl13',
    name: 'Combat Arm (TL13)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 13,
    mass_kg: 0,
    cost: 75000,
    improvement: 'STR 18, Armour +6',
    slot: 'arm',
    stackable: true,
    installationTime: '1D weeks',
    description: 'A high-tech combat arm at the cutting edge of cybernetic engineering. Sets effective arm STR to 18 and provides Armour +6 on that limb.',
  },

  // ── Aslan Cyber-Claw ─────────────────────────────────────────────
  {
    id: 'aslan-cyber-claw',
    name: 'Aslan Cyber-Claw',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 10,
    mass_kg: 0,
    cost: 20000,
    improvement: 'Retractable claw: Melee 1D+1 damage, STR+1',
    slot: 'hand/forearm',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A retractable cybernetic claw modelled on Aslan dewclaw anatomy. When extended it functions as a melee weapon dealing 1D+1 damage. Also grants a minor STR bonus of +1 due to the reinforced forearm musculature.',
  },

  // ── Weapon Implants ──────────────────────────────────────────────
  {
    id: 'weapon-implant-dagger',
    name: 'Weapon Implant (Dagger)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 10,
    mass_kg: 0,
    cost: 5000,
    improvement: 'Concealed dagger implant',
    slot: 'forearm',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A retractable dagger blade concealed within the forearm. DM-4 to detect by scanners or physical search. Counts as a dagger when deployed (1D+2 damage, Melee (blade)).',
  },
  {
    id: 'weapon-implant-stunstick',
    name: 'Weapon Implant (Stunstick)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 10,
    mass_kg: 0,
    cost: 10000,
    improvement: 'Concealed stunstick implant',
    slot: 'forearm',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A retractable shock-delivery system in the forearm, functioning as a stunstick when activated (2D Stun damage, Melee). DM-4 to detect.',
  },
  {
    id: 'weapon-implant-autopistol',
    name: 'Weapon Implant (Autopistol)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 10,
    mass_kg: 0,
    cost: 12000,
    improvement: 'Concealed autopistol implant',
    slot: 'forearm',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A compact autopistol mechanism fitted into the forearm, fired by triggering a nerve impulse. Functions as an autopistol (3D-3 damage, 10m range, Gun Combat (slug)). DM-4 to detect by scanners.',
  },
  {
    id: 'weapon-implant-laser-pistol',
    name: 'Weapon Implant (Laser Pistol)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 10,
    mass_kg: 0,
    cost: 25000,
    improvement: 'Concealed laser pistol implant',
    slot: 'forearm',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A miniaturised laser pistol emitter built into the forearm, powered by an internal cell. Functions as a laser pistol (3D damage, 20m range, Gun Combat (energy)). DM-4 to detect.',
  },

  // ── Additional Manipulator ───────────────────────────────────────
  {
    id: 'additional-manipulator',
    name: 'Additional Manipulator',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 10,
    mass_kg: 0,
    cost: 7500,
    improvement: 'Extra cybernetic arm (STR 6, DEX 10)',
    slot: 'torso',
    stackable: true,
    installationTime: '1D weeks',
    description: 'A cybernetic arm mounted on the torso, giving the Traveller an extra limb for holding or manipulating objects. Has its own STR 6 and DEX 10 characteristics independent of the Traveller\'s own stats.',
  },

  // ── Enhanced Mobility ────────────────────────────────────────────
  {
    id: 'enhanced-mobility-tl8',
    name: 'Enhanced Mobility (TL8)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 8,
    mass_kg: 0,
    cost: 10000,
    improvement: '+1.5m/round movement, DM+1 to balance checks',
    slot: 'legs',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Cybernetic leg enhancements that increase movement speed and balance. Adds 1.5m to the Traveller\'s movement per round and grants DM+1 to checks requiring balance or sure-footedness.',
  },
  {
    id: 'enhanced-mobility-tl11',
    name: 'Enhanced Mobility (TL11)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 11,
    mass_kg: 0,
    cost: 15000,
    improvement: '+3m/round movement, DM+2 to balance checks',
    slot: 'legs',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Advanced cybernetic leg replacements with superior actuators and proprioception feedback. Adds 3m to movement per round and grants DM+2 to balance-related checks.',
  },
  {
    id: 'enhanced-mobility-tl13',
    name: 'Enhanced Mobility (TL13)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 13,
    mass_kg: 0,
    cost: 25000,
    improvement: '+6m/round movement, DM+3 to balance checks',
    slot: 'legs',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Cutting-edge cybernetic legs with high-performance actuators and neural feedback systems. Adds 6m to movement per round and grants DM+3 to balance-related checks.',
  },

  // ── Autonomous Locomotion Rig ────────────────────────────────────
  {
    id: 'autonomous-locomotion-rig',
    name: 'Autonomous Locomotion Rig',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 9,
    mass_kg: 0,
    cost: 15000,
    improvement: 'Cybernetic leg system with independent processor',
    slot: 'legs',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A cybernetic leg replacement system with an integrated autonomous processor that can handle basic locomotion tasks independently, freeing higher brain functions. Useful for paraplegics or those who have lost both legs.',
  },

  // ── Assisted Ambulation ──────────────────────────────────────────
  {
    id: 'assisted-ambulation-tl13',
    name: 'Assisted Ambulation (TL13)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 13,
    mass_kg: 0,
    cost: 100000,
    improvement: 'Enhanced movement and physical performance',
    slot: 'musculature/skeletal',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A comprehensive system of cybernetic musculature and skeletal reinforcement that assists and amplifies physical movement throughout the body.',
  },
  {
    id: 'assisted-ambulation-tl14',
    name: 'Assisted Ambulation (TL14)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 14,
    mass_kg: 0,
    cost: 300000,
    improvement: 'Superior enhanced movement and physical performance',
    slot: 'musculature/skeletal',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Advanced full-body cybernetic musculature with superior actuator technology and neural integration, significantly enhancing all physical activities.',
  },
  {
    id: 'assisted-ambulation-tl15',
    name: 'Assisted Ambulation (TL15)',
    category: 'augment',
    augmentType: 'cyberlimb',
    tl: 15,
    mass_kg: 0,
    cost: 500000,
    improvement: 'Maximum enhanced movement and physical performance',
    slot: 'musculature/skeletal',
    stackable: false,
    installationTime: '1D weeks',
    description: 'The pinnacle of cybernetic musculature technology: a fully integrated system of synthetic muscles and skeletal reinforcement that provides extraordinary physical capability.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  BIOTECH AUGMENTATION  —  Biological engineering & organ replacement
// ═══════════════════════════════════════════════════════════════════════

export const BIOTECH_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'all-temperature-epidermal-symbiote',
    name: 'All-Temperature Epidermal Symbiote',
    category: 'augment',
    augmentType: 'biotech',
    tl: 14,
    mass_kg: 0,
    cost: 2500,
    improvement: 'Extreme temperature protection (biological)',
    slot: 'skin',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A genetically engineered biological symbiote that lives on and within the skin, regulating body temperature across extreme environmental conditions. Provides significant protection from both extreme heat and cold.',
  },
  {
    id: 'metastatic-platelet-injection',
    name: 'Metastatic Platelet Injection',
    category: 'augment',
    augmentType: 'biotech',
    tl: 12,
    mass_kg: 0,
    cost: 25000,
    improvement: 'Enhanced healing and wound stabilisation',
    slot: 'blood',
    stackable: false,
    installationTime: '1 hour (injection)',
    description: 'An injection of engineered meta-platelets that circulate permanently in the blood. These synthetic clotting agents dramatically speed wound closure and internal haemostasis, reducing the severity of injuries.',
  },
  {
    id: 'soldiers-organ-package',
    name: "Soldier's Organ Package",
    category: 'augment',
    augmentType: 'biotech',
    tl: 12,
    mass_kg: 0,
    cost: 1500000,
    improvement: 'Multiple combat-optimised organ replacements',
    slot: 'organs',
    stackable: false,
    installationTime: '2D weeks',
    description: 'A comprehensive set of vat-grown, combat-optimised replacement organs: reinforced heart, improved lungs, hardened liver, and enhanced adrenal glands. Dramatically improves endurance, resilience to toxins, and combat performance.',
  },
  {
    id: 'muscular-bridging',
    name: 'Muscular Bridging',
    category: 'augment',
    augmentType: 'biotech',
    tl: 13,
    mass_kg: 0,
    cost: 250000,
    improvement: 'STR +1, DEX +1, Move +3m',
    slot: 'musculature',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Engineered biological fibre bridges are woven through the major muscle groups, augmenting both strength and speed of contraction. Grants STR +1, DEX +1, and increases base movement by 3m per round.',
  },
  {
    id: 'terminal-stabilisation-system',
    name: 'Terminal Stabilisation System',
    category: 'augment',
    augmentType: 'biotech',
    tl: 16,
    mass_kg: 0,
    cost: 2500000,
    improvement: 'Prevents death from mortal wounds',
    slot: 'organs',
    stackable: false,
    installationTime: '2D weeks',
    description: 'An extreme biotech augmentation that combines engineered organ redundancies, nanoscale repair systems, and emergency biochemical stabilisers. When the Traveller would be killed, this system activates to prevent death and stabilise the body, keeping them alive long enough for medical intervention.',
  },
  {
    id: 'full-body-transplant',
    name: 'Full Body Transplant',
    category: 'augment',
    augmentType: 'biotech',
    tl: 18,
    mass_kg: 0,
    cost: 1000000000,
    improvement: 'STR 14, DEX 12, END 15 (vat-grown replacement body)',
    slot: 'full body',
    stackable: false,
    installationTime: 'Several months',
    description: 'The consciousness is transferred into a vat-grown biological replacement body with STR 14, DEX 12, and END 15 characteristics. The ultimate biotech augmentation — effectively granting a new, superior physical form. Extraordinarily expensive and only available at the highest tech levels.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  INTERNAL IMPLANTS  —  Power ports, injectors, containers
// ═══════════════════════════════════════════════════════════════════════

export const IMPLANT_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'bio-fusion-power-port',
    name: 'Bio-Fusion Power Port',
    category: 'augment',
    augmentType: 'implant',
    tl: 13,
    mass_kg: 0,
    cost: 10000,
    improvement: 'Internal power source for cybernetic systems',
    slot: 'torso',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A miniaturised bio-fusion power cell implanted in the torso that provides continuous power to cybernetic augmentations. Eliminates the need for external power packs for most implanted systems.',
  },
  {
    id: 'cardiotrigger-detonator',
    name: 'Cardiotrigger Detonator',
    category: 'augment',
    augmentType: 'implant',
    tl: 7,
    mass_kg: 0,
    cost: 0,
    improvement: 'Heartbeat-linked dead man\'s switch',
    slot: 'torso',
    stackable: false,
    installationTime: '1D weeks',
    description: 'An implanted detonator linked to the subject\'s heartbeat. If the subject dies (or if the heartbeat pattern is externally triggered), a linked explosive device detonates. Used as a deterrent or dead man\'s switch. Cost varies — the implant itself is minor; the explosive and any bespoke triggering mechanism are extra.',
  },
  {
    id: 'internal-auto-injector',
    name: 'Internal Auto-Injector',
    category: 'augment',
    augmentType: 'implant',
    tl: 10,
    mass_kg: 0,
    cost: 50000,
    improvement: 'Automated drug/medication delivery system',
    slot: 'torso',
    stackable: false,
    installationTime: '1D weeks',
    description: 'An implanted system of reservoirs and micro-injectors that can automatically deliver pre-loaded drugs or medications in response to programmed triggers (injury, environmental cues, or mental command). Holds multiple doses of one or more substances.',
  },
  {
    id: 'smuggling-container',
    name: 'Smuggling Container',
    category: 'augment',
    augmentType: 'implant',
    tl: 8,
    mass_kg: 0,
    cost: 15000,
    improvement: 'Concealed internal storage cavity',
    slot: 'torso',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A surgical cavity created within the body — typically the abdomen — lined with shielded material that prevents most scanners from detecting its contents. Can hold a small quantity of contraband, data chips, or other small items. DM-4 to detect by standard scanners.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  COMBINED CATALOG & UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** All augments in a single array for searching/filtering */
export const AUGMENT_CATALOG: AugmentCatalogItem[] = [
  ...PHYSICAL_AUGMENTS,
  ...COGNITIVE_AUGMENTS,
  ...NEURAL_AUGMENTS,
  ...SENSORY_AUGMENTS,
  ...SKILL_AUGMENTS,
  ...PROTECTIVE_AUGMENTS,
  ...CYBERLIMB_AUGMENTS,
  ...BIOTECH_AUGMENTS,
  ...IMPLANT_AUGMENTS,
];

/** Look up an augment by its catalog ID */
export function getAugmentById(id: string): AugmentCatalogItem | undefined {
  return AUGMENT_CATALOG.find(a => a.id === id);
}

/** Get all augments of a specific type (for dropdown grouping) */
export function getAugmentsByType(augmentType: AugmentCatalogItem['augmentType']): AugmentCatalogItem[] {
  return AUGMENT_CATALOG.filter(a => a.augmentType === augmentType);
}

/**
 * Calculate the medical treatment penalty for a character with augments.
 * The DM equals the TL difference between the medical facility and
 * the highest-TL relevant implant.
 */
export function calculateAugmentMedicalPenalty(
  augmentTLs: number[],
  facilityTL: number,
): number {
  if (augmentTLs.length === 0) return 0;
  const highestAugmentTL = Math.max(...augmentTLs);
  const penalty = highestAugmentTL - facilityTL;
  return Math.max(0, penalty); // Only a penalty if augment TL > facility TL
}

/**
 * Check if a character can install a given augment.
 * Rules:
 * - Only one Skill Augmentation allowed per Traveller
 * - Physical augments for the same characteristic replace (not stack)
 * - Neural Comm variants replace each other
 * - Subdermal Armour variants replace each other
 * - Wafer Jack variants replace each other
 */
export function getAugmentConflicts(
  newAugment: AugmentCatalogItem,
  installedAugmentIds: string[],
): string[] {
  const conflicts: string[] = [];
  const installed = installedAugmentIds
    .map(id => getAugmentById(id))
    .filter((a): a is AugmentCatalogItem => a !== undefined);

  for (const existing of installed) {
    // Same augment type + slot = replacement
    if (existing.augmentType === newAugment.augmentType && existing.slot === newAugment.slot) {
      conflicts.push(existing.id);
    }

    // Skill augmentation: only one allowed
    if (newAugment.augmentType === 'skill' && existing.augmentType === 'skill') {
      conflicts.push(existing.id);
    }
  }

  return [...new Set(conflicts)];
}

/**
 * Format augment cost for display. Handles MCr notation.
 */
export function formatAugmentCost(cost: number): string {
  if (cost >= 1000000) {
    const mcr = cost / 1000000;
    return `MCr${mcr}`;
  }
  return `Cr${cost.toLocaleString()}`;
}
