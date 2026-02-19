/**
 * Traveller Core Rulebook - Weapons Catalog
 *
 * All weapons from the Core Rulebook organised by type. Multi-TL
 * variants (e.g. Laser Pistol TL9 vs TL11) are separate entries.
 * Weapon options/upgrades are listed separately at the bottom.
 */

import { WeaponCatalogItem, WeaponOption } from './types';

// ═══════════════════════════════════════════════════════════════════════
//  MELEE WEAPONS
// ═══════════════════════════════════════════════════════════════════════

export const MELEE_WEAPONS: WeaponCatalogItem[] = [
  {
    id: 'blade',
    name: 'Blade',
    category: 'weapon',
    weaponType: 'melee',
    tl: 2,
    range: 'Melee',
    damage: '2D',
    mass_kg: 1,
    cost: 100,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'A small blade weapon, somewhere between a dagger and a cutlass, with a large basket hilt.',
  },
  {
    id: 'broadsword',
    name: 'Broadsword',
    category: 'weapon',
    weaponType: 'melee',
    tl: 2,
    range: 'Melee',
    damage: '4D',
    mass_kg: 3,
    cost: 500,
    traits: ['Bulky'],
    requiredSkill: 'Melee (blade)',
    description: 'A heavy two-handed sword. Requires significant strength to wield effectively.',
  },
  {
    id: 'club',
    name: 'Club',
    category: 'weapon',
    weaponType: 'melee',
    tl: 1,
    range: 'Melee',
    damage: '2D',
    mass_kg: 2,
    cost: 0,
    traits: [],
    requiredSkill: 'Melee (bludgeon)',
    description: 'The first weapon emerging civilisations usually discover. Clubs can range from a length of heavy wood to extending riot batons of advanced polymers but they remain a popular and practical weapon regardless.',
  },
  {
    id: 'cutlass',
    name: 'Cutlass',
    category: 'weapon',
    weaponType: 'melee',
    tl: 2,
    range: 'Melee',
    damage: '3D',
    mass_kg: 2,
    cost: 200,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'The standard shipboard blade weapon, often kept near airlocks to repel boarders.',
  },
  {
    id: 'dagger',
    name: 'Dagger',
    category: 'weapon',
    weaponType: 'melee',
    tl: 1,
    range: 'Melee',
    damage: '1D+2',
    mass_kg: 0.5,
    cost: 10,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'A small knife weapon, approximately 20\u201330 centimetres in length. Easy to conceal.',
  },
  {
    id: 'improvised',
    name: 'Improvised Weapon',
    category: 'weapon',
    weaponType: 'melee',
    tl: 0,
    range: 'Melee',
    damage: '2D-2',
    mass_kg: 0,
    cost: 0,
    traits: [],
    requiredSkill: 'Melee',
    description: 'Sometimes a Traveller just has to use whatever comes to hand. This covers any non-weapon object a Traveller grabs during a fight \u2013 chairs, bottles, tools, etc.',
  },
  {
    id: 'rapier',
    name: 'Rapier',
    category: 'weapon',
    weaponType: 'melee',
    tl: 3,
    range: 'Melee',
    damage: '2D',
    mass_kg: 0.5,
    cost: 200,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'A duelling foil. Rapiers grant DM+1 for parrying.',
  },
  {
    id: 'shield',
    name: 'Shield',
    category: 'weapon',
    weaponType: 'melee',
    tl: 1,
    range: 'Melee',
    damage: '1D',
    mass_kg: 2,
    cost: 150,
    traits: [],
    requiredSkill: 'Melee',
    description: 'A Traveller using a shield increases their effective Melee skill by +1 when parrying. A Traveller with no Melee skill counts as having Melee 1 when using a shield to parry.',
  },
  {
    id: 'staff',
    name: 'Staff',
    category: 'weapon',
    weaponType: 'melee',
    tl: 1,
    range: 'Melee',
    damage: '2D',
    mass_kg: 2,
    cost: 0,
    traits: [],
    requiredSkill: 'Melee (bludgeon)',
    description: 'A length of wood or metal. Simple, effective, and available almost anywhere.',
  },
  {
    id: 'stunstick',
    name: 'Stunstick',
    category: 'weapon',
    weaponType: 'melee',
    tl: 8,
    range: 'Melee',
    damage: '2D',
    mass_kg: 0.5,
    cost: 300,
    traits: ['Stun'],
    requiredSkill: 'Melee',
    description: 'A short and innocuous looking weapon. This ceramic stick can deliver a painful and debilitating shock to anyone who touches the wrong end.',
  },
  {
    id: 'unarmed',
    name: 'Unarmed',
    category: 'weapon',
    weaponType: 'melee',
    tl: 0,
    range: 'Melee',
    damage: '1D',
    mass_kg: 0,
    cost: 0,
    traits: [],
    requiredSkill: 'Melee (unarmed)',
    description: 'Punches, kicks, and other natural attacks. Every Traveller has these available.',
  },

  // ── CSC: Bludgeoning ─────────────────────────────────────────────
  {
    id: 'anti-armour-flail',
    name: 'Anti-Armour Flail',
    category: 'weapon',
    weaponType: 'melee',
    tl: 8,
    range: 'Melee',
    damage: '4D',
    mass_kg: 3,
    cost: 250,
    traits: ['AP 5', 'One Use'],
    requiredSkill: 'Melee (bludgeon)',
    description: 'A flail with a chain-driven hardened head that shatters armour on impact. The head deforms on a successful hit and cannot be re-used.',
  },
  {
    id: 'gravity-hammer',
    name: 'Gravity Hammer',
    category: 'weapon',
    weaponType: 'melee',
    tl: 13,
    range: 'Melee',
    damage: '5D',
    mass_kg: 5,
    cost: 10000,
    traits: ['AP 50', 'Bulky', 'Smasher'],
    requiredSkill: 'Melee (bludgeon)',
    description: 'A heavy hammer with a gravitic impactor head that delivers devastating kinetic force on contact. DM-6 to attack rolls when targeting non-vehicle-scale opponents — the weapon is simply calibrated for much larger targets.',
  },
  {
    id: 'mace',
    name: 'Mace',
    category: 'weapon',
    weaponType: 'melee',
    tl: 1,
    range: 'Melee',
    damage: '2D+2',
    mass_kg: 3,
    cost: 20,
    traits: ['Bulky', 'Smasher'],
    requiredSkill: 'Melee (bludgeon)',
    description: 'A heavy club with a flanged or knobbed metal head, designed to crush armour and bone. Effective against hard targets.',
  },
  {
    id: 'sap',
    name: 'Sap',
    category: 'weapon',
    weaponType: 'melee',
    tl: 2,
    range: 'Melee',
    damage: '1D',
    mass_kg: 1,
    cost: 30,
    traits: ['Stun'],
    requiredSkill: 'Melee (bludgeon)',
    description: 'A small leather pouch filled with lead shot, designed to deliver a stunning blow to the head. Non-lethal in intent.',
  },
  {
    id: 'sledgehammer',
    name: 'Sledgehammer',
    category: 'weapon',
    weaponType: 'melee',
    tl: 1,
    range: 'Melee',
    damage: '4D',
    mass_kg: 8,
    cost: 30,
    traits: ['Smasher', 'Very Bulky'],
    requiredSkill: 'Melee (bludgeon)',
    description: 'A long-handled hammer with a massive head designed for demolition and industrial tasks. Devastating in combat but extremely unwieldy.',
  },
  {
    id: 'static-maul',
    name: 'Static Maul',
    category: 'weapon',
    weaponType: 'melee',
    tl: 11,
    range: 'Melee',
    damage: '3D',
    mass_kg: 3,
    cost: 650,
    traits: ['AP 4', 'Smasher'],
    requiredSkill: 'Melee (bludgeon)',
    description: 'A maul wrapped in a powerful static field generator that amplifies impact force and disrupts armour bonding. The field crackles blue-white on activation.',
  },

  // ── CSC: Blades ───────────────────────────────────────────────────
  {
    id: 'arc-field-weapon',
    name: 'Arc-Field Weapon',
    category: 'weapon',
    weaponType: 'melee',
    tl: 14,
    range: 'Melee',
    damage: '5D+2',
    mass_kg: 4,
    cost: 25000,
    traits: ['AP 30'],
    requiredSkill: 'Melee (blade)',
    description: 'A blade surrounded by a high-energy arc field that slices through almost any material. The field generates a distinctive crackling hum and blue-white corona.',
  },
  {
    id: 'assault-pike',
    name: 'Assault Pike',
    category: 'weapon',
    weaponType: 'melee',
    tl: 5,
    range: 'Melee',
    damage: '4D',
    mass_kg: 8,
    cost: 200,
    traits: ['AP 4', 'One Use'],
    requiredSkill: 'Melee (blade)',
    description: 'A long thrusting weapon with a hardened penetrating tip designed to punch through armour. The tip deforms on successful penetration and cannot be re-used.',
  },
  {
    id: 'battle-axe',
    name: 'Battle Axe',
    category: 'weapon',
    weaponType: 'melee',
    tl: 2,
    range: 'Melee',
    damage: '3D',
    mass_kg: 4,
    cost: 225,
    traits: ['AP 2', 'Bulky'],
    requiredSkill: 'Melee (blade)',
    description: 'A large single- or double-headed axe designed for combat. The heavy head delivers powerful swings capable of splitting light armour.',
  },
  {
    id: 'chaindrive-axe',
    name: 'Chaindrive Axe',
    category: 'weapon',
    weaponType: 'melee',
    tl: 10,
    range: 'Melee',
    damage: '4D',
    mass_kg: 7,
    cost: 600,
    traits: ['AP 4', 'Bulky'],
    requiredSkill: 'Melee (blade)',
    description: 'An axe with a motorised chain-driven edge that chews through armour with terrifying efficiency. The noise and vibration make it difficult to handle precisely.',
  },
  {
    id: 'chaindrive-sword',
    name: 'Chaindrive Sword',
    category: 'weapon',
    weaponType: 'melee',
    tl: 10,
    range: 'Melee',
    damage: '4D',
    mass_kg: 5,
    cost: 500,
    traits: ['AP 2'],
    requiredSkill: 'Melee (blade)',
    description: 'A sword with a motorised chainsaw-style cutting edge. More controllable than the chaindrive axe while still delivering brutal damage.',
  },
  {
    id: 'great-axe',
    name: 'Great Axe',
    category: 'weapon',
    weaponType: 'melee',
    tl: 2,
    range: 'Melee',
    damage: '4D+2',
    mass_kg: 10,
    cost: 750,
    traits: ['Smasher', 'Very Bulky'],
    requiredSkill: 'Melee (blade)',
    description: 'A massive two-handed axe with an enormous head. Requires considerable strength to wield effectively but delivers crushing blows that can destroy equipment and barriers.',
  },
  {
    id: 'hatchet',
    name: 'Hatchet',
    category: 'weapon',
    weaponType: 'melee',
    tl: 3,
    range: 'Melee',
    damage: '2D+2',
    mass_kg: 2,
    cost: 250,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'A short-handled axe useful as both a tool and a weapon. Compact and versatile.',
  },
  {
    id: 'knife',
    name: 'Knife',
    category: 'weapon',
    weaponType: 'melee',
    tl: 1,
    range: 'Melee',
    damage: '1D',
    mass_kg: 0,
    cost: 5,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'A simple cutting tool that doubles as a weapon. Smaller than a dagger but easily concealed.',
  },
  {
    id: 'lance',
    name: 'Lance',
    category: 'weapon',
    weaponType: 'melee',
    tl: 2,
    range: 'Melee',
    damage: '5D',
    mass_kg: 4,
    cost: 75,
    traits: ['AP 4'],
    requiredSkill: 'Melee (blade)',
    description: 'A long thrusting weapon designed for mounted combat. When used on foot it is treated as a spear. Full lance damage applies only when used while mounted and charging.',
  },
  {
    id: 'long-blade-tl2',
    name: 'Long Blade (TL2)',
    category: 'weapon',
    weaponType: 'melee',
    tl: 2,
    range: 'Melee',
    damage: '3D',
    mass_kg: 4,
    cost: 200,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'An early long sword of iron construction. Effective in combat though limited by the metallurgy of the era.',
  },
  {
    id: 'long-blade-tl3',
    name: 'Long Blade (TL3)',
    category: 'weapon',
    weaponType: 'melee',
    tl: 3,
    range: 'Melee',
    damage: '3D+2',
    mass_kg: 4,
    cost: 300,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'A steel long sword benefiting from improved metallurgical techniques. Sharper edge, better balance, and superior damage over the earlier iron version.',
  },
  {
    id: 'monoblade',
    name: 'Monoblade',
    category: 'weapon',
    weaponType: 'melee',
    tl: 12,
    range: 'Melee',
    damage: '3D',
    mass_kg: 2,
    cost: 2500,
    traits: ['AP 10'],
    requiredSkill: 'Melee (blade)',
    description: 'A blade kept at a single-molecule edge by a continuous field generator. Slices through most materials with minimal resistance. Requires careful handling to avoid accidental injury to the wielder.',
  },
  {
    id: 'piston-spear',
    name: 'Piston Spear',
    category: 'weapon',
    weaponType: 'melee',
    tl: 7,
    range: 'Melee',
    damage: '3D+2',
    mass_kg: 3,
    cost: 400,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'A spear with a pneumatic piston mechanism behind the tip that delivers a powerful additional thrust on impact, dramatically increasing penetration.',
  },
  {
    id: 'psi-blade',
    name: 'Psi Blade',
    category: 'weapon',
    weaponType: 'melee',
    tl: 16,
    range: 'Melee',
    damage: '2D + PSI DM',
    mass_kg: 2,
    cost: 30000,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'A blade that channels psionic energy, becoming more lethal as the wielder expends PSI points. Base damage is 2D + PSI DM. For every additional PSI point spent when attacking, add +1D damage and +5 AP to the strike.',
  },
  {
    id: 'psi-dagger',
    name: 'Psi Dagger',
    category: 'weapon',
    weaponType: 'melee',
    tl: 17,
    range: 'Melee',
    damage: '1D+2 + PSI DM',
    mass_kg: 1,
    cost: 25000,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'A small psionic weapon similar to the psi blade. Base damage is 1D+2 + PSI DM. For every additional PSI point spent when attacking, add +1D damage and +5 AP.',
  },
  {
    id: 'spear',
    name: 'Spear',
    category: 'weapon',
    weaponType: 'melee',
    tl: 1,
    range: 'Melee',
    damage: '2D',
    mass_kg: 2,
    cost: 10,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'A simple thrusting pole weapon. Can also be thrown (range 25m, uses Athletics (dexterity) to throw).',
  },
  {
    id: 'static-axe-tl11',
    name: 'Static Axe (TL11)',
    category: 'weapon',
    weaponType: 'melee',
    tl: 11,
    range: 'Melee',
    damage: '4D',
    mass_kg: 6,
    cost: 750,
    traits: ['AP 6', 'Smasher'],
    requiredSkill: 'Melee (blade)',
    description: 'An axe surrounded by a powerful static field that disrupts molecular bonds on contact. The field significantly increases armour penetration.',
  },
  {
    id: 'static-axe-tl12',
    name: 'Static Axe (TL12)',
    category: 'weapon',
    weaponType: 'melee',
    tl: 12,
    range: 'Melee',
    damage: '4D+2',
    mass_kg: 5,
    cost: 1000,
    traits: ['AP 8', 'Smasher'],
    requiredSkill: 'Melee (blade)',
    description: 'An improved static axe with a more powerful field generator and lighter construction. Superior armour penetration and damage.',
  },
  {
    id: 'static-blade-tl11',
    name: 'Static Blade (TL11)',
    category: 'weapon',
    weaponType: 'melee',
    tl: 11,
    range: 'Melee',
    damage: '3D',
    mass_kg: 4,
    cost: 700,
    traits: ['AP 5'],
    requiredSkill: 'Melee (blade)',
    description: 'A sword or large knife fitted with a static field generator that enhances penetration through armour.',
  },
  {
    id: 'static-blade-tl12',
    name: 'Static Blade (TL12)',
    category: 'weapon',
    weaponType: 'melee',
    tl: 12,
    range: 'Melee',
    damage: '3D+2',
    mass_kg: 3,
    cost: 900,
    traits: ['AP 6'],
    requiredSkill: 'Melee (blade)',
    description: 'An improved static blade with a higher-output field generator and lighter alloy construction.',
  },
  {
    id: 'stealth-dagger',
    name: 'Stealth Dagger',
    category: 'weapon',
    weaponType: 'melee',
    tl: 8,
    range: 'Melee',
    damage: '1D+2',
    mass_kg: 1,
    cost: 175,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'Constructed from non-metallic composites and ceramics to defeat conventional weapon scanners. DM-4 to any Electronics (sensors) check or physical search to detect it.',
  },
  {
    id: 'stone-axe',
    name: 'Stone Axe',
    category: 'weapon',
    weaponType: 'melee',
    tl: 0,
    range: 'Melee',
    damage: '2D',
    mass_kg: 3,
    cost: 5,
    traits: [],
    requiredSkill: 'Melee (blade)',
    description: 'A hand-knapped stone blade hafted on a wooden handle. Primitive but functional. If the attack Effect is -3 or worse, the blade shatters and the weapon is destroyed.',
  },
  {
    id: 'war-pick',
    name: 'War Pick',
    category: 'weapon',
    weaponType: 'melee',
    tl: 3,
    range: 'Melee',
    damage: '2D+2',
    mass_kg: 4,
    cost: 275,
    traits: ['AP 4'],
    requiredSkill: 'Melee (blade)',
    description: 'A single-pointed military pick designed to punch through armour gaps. The spike concentrates impact force on a very small area.',
  },

  // ── CSC: Unarmed ─────────────────────────────────────────────────
  {
    id: 'brass-knuckles',
    name: 'Brass Knuckles',
    category: 'weapon',
    weaponType: 'melee',
    tl: 1,
    range: 'Melee',
    damage: '1D+2',
    mass_kg: 0,
    cost: 10,
    traits: [],
    requiredSkill: 'Melee (unarmed)',
    description: 'Metal rings fitted over the knuckles to concentrate and amplify punch damage. Small, concealable, and effective.',
  },
  {
    id: 'garrotte',
    name: 'Garrotte',
    category: 'weapon',
    weaponType: 'melee',
    tl: 1,
    range: 'Melee',
    damage: '2D + Effect',
    mass_kg: 0,
    cost: 10,
    traits: [],
    requiredSkill: 'Melee (unarmed)',
    description: 'A length of wire, cord, or chain used for strangling. Requires the attacker to first successfully grapple the target (as a separate action). Once grappling, the garrotte deals 2D + attack Effect damage per round automatically.',
  },
  {
    id: 'handspikes',
    name: 'Handspikes',
    category: 'weapon',
    weaponType: 'melee',
    tl: 2,
    range: 'Melee',
    damage: '2D',
    mass_kg: 0,
    cost: 100,
    traits: [],
    requiredSkill: 'Melee (unarmed)',
    description: 'Short metal spikes fitted between the fingers or on a knuckle duster. Converts punches into piercing attacks.',
  },
  {
    id: 'knuckleblasters',
    name: 'Knuckleblasters',
    category: 'weapon',
    weaponType: 'melee',
    tl: 8,
    range: 'Melee',
    damage: '5D',
    mass_kg: 0,
    cost: 150,
    magazine: 4,
    magazineCost: 10,
    traits: [],
    requiredSkill: 'Melee (unarmed)',
    description: 'Knuckle-mounted devices containing four shotgun shells that discharge on impact. Each successful punch fires one shell for devastating close-range damage. Reloading requires 2 Significant Actions. STR DM is not added to damage.',
  },
  {
    id: 'piston-fist',
    name: 'Piston Fist',
    category: 'weapon',
    weaponType: 'melee',
    tl: 9,
    range: 'Melee',
    damage: '3D+2',
    mass_kg: 0,
    cost: 150,
    traits: [],
    requiredSkill: 'Melee (unarmed)',
    description: 'A powered glove with a pneumatic piston mechanism that dramatically amplifies punch force. STR DM is not added to damage — the piston does the work.',
  },
  {
    id: 'stunfist',
    name: 'Stunfist',
    category: 'weapon',
    weaponType: 'melee',
    tl: 8,
    range: 'Melee',
    damage: '1D+2',
    mass_kg: 0,
    cost: 250,
    traits: ['Stun'],
    requiredSkill: 'Melee (unarmed)',
    description: 'A glove or hand wrap with integrated electroshock contacts that deliver a stunning discharge on contact. Non-lethal in intent.',
  },

  // ── CSC: Shields ─────────────────────────────────────────────────
  {
    id: 'boarding-shield',
    name: 'Boarding Shield',
    category: 'weapon',
    weaponType: 'melee',
    tl: 9,
    range: 'Melee',
    damage: '1D',
    mass_kg: 7,
    cost: 1500,
    traits: [],
    requiredSkill: 'Melee',
    description: 'A large rigid shield designed for shipboard boarding actions. Provides cover with Armour +8 against attacks from the front rather than a parry bonus. Can also be used offensively to bash opponents (1D damage).',
  },
  {
    id: 'buckler',
    name: 'Buckler',
    category: 'weapon',
    weaponType: 'melee',
    tl: 2,
    range: 'Melee',
    damage: '1D',
    mass_kg: 2,
    cost: 10,
    traits: [],
    requiredSkill: 'Melee',
    description: 'A small round shield strapped to the forearm or gripped by a central handle. Requires Melee skill to use effectively for parrying; without it, provides no defensive benefit.',
  },
  {
    id: 'gravitic-shield',
    name: 'Gravitic Shield',
    category: 'weapon',
    weaponType: 'melee',
    tl: 17,
    range: 'Melee',
    damage: '1D',
    mass_kg: 0,
    cost: 2500,
    traits: [],
    requiredSkill: 'Melee',
    description: 'A field emitter that creates a localised gravity distortion capable of deflecting incoming attacks. Has no physical mass but generates a shimmering defensive field. Functions as a standard shield for parrying.',
  },
  {
    id: 'large-shield',
    name: 'Large Shield',
    category: 'weapon',
    weaponType: 'melee',
    tl: 1,
    range: 'Melee',
    damage: '\u2014',
    mass_kg: 8,
    cost: 200,
    traits: [],
    requiredSkill: 'Melee',
    description: 'A full-body shield such as a tower shield or pavise. Grants DM+2 to parrying. Its size makes it cumbersome for attacking.',
  },
  {
    id: 'riot-shield',
    name: 'Riot Shield',
    category: 'weapon',
    weaponType: 'melee',
    tl: 6,
    range: 'Melee',
    damage: '1D',
    mass_kg: 4,
    cost: 175,
    traits: [],
    requiredSkill: 'Melee',
    description: 'A large transparent polycarbonate shield used for crowd control. Provides +1 Armour against ranged attacks from the front. The material is fire-resistant, granting complete immunity to flame-based attacks from the front.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SLUG THROWER PISTOLS  —  Gun Combat (slug)
// ═══════════════════════════════════════════════════════════════════════

export const SLUG_PISTOLS: WeaponCatalogItem[] = [
  {
    id: 'antique-pistol',
    name: 'Antique Pistol',
    category: 'weapon',
    weaponType: 'slug_pistol',
    tl: 2,
    range: '5m',
    damage: '2D-3',
    mass_kg: 0.5,
    cost: 100,
    magazine: 1,
    magazineCost: 5,
    traits: [],
    requiredSkill: 'Gun Combat (slug)',
    description: 'A flintlock or other primitive projectile weapon. Unless especially well made, it will have DM-1 to all attacks. Requires a successful Gun Combat (slug) check to reload, taking 2D3 Minor Actions.',
  },
  {
    id: 'autopistol',
    name: 'Autopistol',
    category: 'weapon',
    weaponType: 'slug_pistol',
    tl: 5,
    range: '10m',
    damage: '3D-3',
    mass_kg: 1,
    cost: 200,
    magazine: 15,
    magazineCost: 10,
    traits: [],
    requiredSkill: 'Gun Combat (slug)',
    description: 'Variants of this semi-automatic pistol are the standard sidearm for law enforcement officers and criminals across the Imperium.',
  },
  {
    id: 'body-pistol',
    name: 'Body Pistol',
    category: 'weapon',
    weaponType: 'slug_pistol',
    tl: 8,
    range: '5m',
    damage: '2D',
    mass_kg: 0,
    cost: 500,
    magazine: 6,
    magazineCost: 10,
    traits: [],
    requiredSkill: 'Gun Combat (slug)',
    description: 'Manufactured from plastics and cultured bone, making them very difficult to detect using conventional weapons scanners. Imposes DM-4 to any Electronics (sensors) checks made to detect them.',
  },
  {
    id: 'gauss-pistol',
    name: 'Gauss Pistol',
    category: 'weapon',
    weaponType: 'slug_pistol',
    tl: 13,
    range: '20m',
    damage: '3D',
    mass_kg: 1,
    cost: 500,
    magazine: 40,
    magazineCost: 20,
    traits: ['AP 3', 'Auto 2'],
    requiredSkill: 'Gun Combat (slug)',
    description: 'Gauss pistols use electromagnetic coils to accelerate metallic darts to hypersonic speeds. Lightweight, efficient and deadly.',
  },
  {
    id: 'revolver',
    name: 'Revolver',
    category: 'weapon',
    weaponType: 'slug_pistol',
    tl: 4,
    range: '10m',
    damage: '3D-3',
    mass_kg: 0.5,
    cost: 150,
    magazine: 6,
    magazineCost: 5,
    traits: [],
    requiredSkill: 'Gun Combat (slug)',
    description: 'A conventional six-shooter handgun. Reliable, simple, and easy to maintain.',
  },
  {
    id: 'snub-pistol',
    name: 'Snub Pistol',
    category: 'weapon',
    weaponType: 'slug_pistol',
    tl: 8,
    range: '5m',
    damage: '3D-3',
    mass_kg: 0,
    cost: 150,
    magazine: 6,
    magazineCost: 10,
    traits: ['Zero-G'],
    requiredSkill: 'Gun Combat (slug)',
    description: 'Lightweight, low-recoil weapons designed for use aboard spacecraft and in zero gravity.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SLUG THROWER RIFLES  —  Gun Combat (slug)
// ═══════════════════════════════════════════════════════════════════════

export const SLUG_RIFLES: WeaponCatalogItem[] = [
  {
    id: 'accelerator-rifle',
    name: 'Accelerator Rifle',
    category: 'weapon',
    weaponType: 'slug_rifle',
    tl: 9,
    range: '250m',
    damage: '3D',
    mass_kg: 2,
    cost: 900,
    magazine: 15,
    magazineCost: 30,
    traits: ['Zero-G'],
    requiredSkill: 'Gun Combat (slug)',
    description: 'Also known as gyrojet weapons, accelerator rifles are designed for zero-gravity combat. They fire tiny missiles that leave the rifle with minimal velocity and thus minimal recoil, then accelerate to high speed.',
  },
  {
    id: 'advanced-combat-rifle',
    name: 'Advanced Combat Rifle',
    category: 'weapon',
    weaponType: 'slug_rifle',
    tl: 10,
    range: '450m',
    damage: '3D',
    mass_kg: 3,
    cost: 1000,
    magazine: 40,
    magazineCost: 15,
    traits: ['Auto 3', 'Scope'],
    requiredSkill: 'Gun Combat (slug)',
    description: 'The ultimate evolution of the conventional firearm. Standard equipment includes an electronic battlefield sight with light amplification, passive IR, visual magnification, and laser rangefinder (usable as target painter). Gyroscopically stabilised during firing. Includes sling, integral flash suppressor, and adaptor for launching a 40mm RAM shoot-through grenade.',
  },
  {
    id: 'antique-rifle',
    name: 'Antique Rifle',
    category: 'weapon',
    weaponType: 'slug_rifle',
    tl: 2,
    range: '25m',
    damage: '3D-3',
    mass_kg: 3,
    cost: 150,
    magazine: 1,
    magazineCost: 10,
    traits: [],
    requiredSkill: 'Gun Combat (slug)',
    description: 'A musket or other primitive rifle. Unless especially well made, it will have DM-1 to all attacks. Requires a successful Gun Combat (slug) check to reload, taking 2D3 Minor Actions.',
  },
  {
    id: 'assault-rifle',
    name: 'Assault Rifle',
    category: 'weapon',
    weaponType: 'slug_rifle',
    tl: 7,
    range: '200m',
    damage: '3D',
    mass_kg: 4,
    cost: 500,
    magazine: 30,
    magazineCost: 15,
    traits: ['Auto 2'],
    requiredSkill: 'Gun Combat (slug)',
    description: 'A standard military rifle capable of selective fire. Effective at medium range with a good rate of fire.',
  },
  {
    id: 'autorifle',
    name: 'Autorifle',
    category: 'weapon',
    weaponType: 'slug_rifle',
    tl: 6,
    range: '300m',
    damage: '3D',
    mass_kg: 5,
    cost: 750,
    magazine: 20,
    magazineCost: 10,
    traits: ['Auto 2'],
    requiredSkill: 'Gun Combat (slug)',
    description: 'Automatic rifles have a higher muzzle velocity and are capable of automatic fire. Sometimes called battle rifles.',
  },
  {
    id: 'gauss-rifle',
    name: 'Gauss Rifle',
    category: 'weapon',
    weaponType: 'slug_rifle',
    tl: 12,
    range: '600m',
    damage: '4D',
    mass_kg: 4,
    cost: 1500,
    magazine: 80,
    magazineCost: 40,
    traits: ['AP 5', 'Auto 3', 'Scope'],
    requiredSkill: 'Gun Combat (slug)',
    description: 'Gauss rifles replace conventional rifles at TL13. Like the smaller gauss pistol, rifles fire high-velocity projectiles using electromagnetic rails.',
  },
  {
    id: 'rifle',
    name: 'Rifle',
    category: 'weapon',
    weaponType: 'slug_rifle',
    tl: 5,
    range: '250m',
    damage: '3D',
    mass_kg: 3,
    cost: 200,
    magazine: 5,
    magazineCost: 10,
    traits: [],
    requiredSkill: 'Gun Combat (slug)',
    description: 'A long-range hunting rifle or light infantry weapon. Accurate and reliable.',
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    category: 'weapon',
    weaponType: 'slug_rifle',
    tl: 4,
    range: '50m',
    damage: '4D',
    mass_kg: 4,
    cost: 200,
    magazine: 6,
    magazineCost: 10,
    traits: ['Bulky'],
    requiredSkill: 'Gun Combat (slug)',
    description: 'Smoothbore weapon that typically fires ammunition containing multiple small pellets. Most effective at short range. Using pellet ammo ignores Dodge DMs but armour gives double Protection against pellet attacks.',
  },
  {
    id: 'submachine-gun',
    name: 'Submachine Gun',
    category: 'weapon',
    weaponType: 'slug_rifle',
    tl: 6,
    range: '25m',
    damage: '3D',
    mass_kg: 3,
    cost: 400,
    magazine: 20,
    magazineCost: 10,
    traits: ['Auto 3'],
    requiredSkill: 'Gun Combat (slug)',
    description: 'A short weapon capable of automatic fire, it puts the power of an assault rifle into a small package. However, it lacks a rifle\'s accuracy at range.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  ENERGY PISTOLS  —  Gun Combat (energy)
// ═══════════════════════════════════════════════════════════════════════

export const ENERGY_PISTOLS: WeaponCatalogItem[] = [
  {
    id: 'laser-pistol-tl9',
    name: 'Laser Pistol (TL9)',
    category: 'weapon',
    weaponType: 'energy_pistol',
    tl: 9,
    range: '20m',
    damage: '3D',
    mass_kg: 2,
    cost: 2000,
    magazine: 100,
    magazineCost: 1000,
    traits: ['Zero-G'],
    requiredSkill: 'Gun Combat (energy)',
    description: 'The TL9 pistol is bulky but effective, with no recoil and a large magazine. Must be connected to a belt- or wrist-mounted power pack.',
  },
  {
    id: 'laser-pistol-tl11',
    name: 'Laser Pistol (TL11)',
    category: 'weapon',
    weaponType: 'energy_pistol',
    tl: 11,
    range: '30m',
    damage: '3D+3',
    mass_kg: 1,
    cost: 3000,
    magazine: 100,
    magazineCost: 3000,
    traits: ['Zero-G'],
    requiredSkill: 'Gun Combat (energy)',
    description: 'Advances in battery technology and miniaturisation mean this pistol is no larger than a conventional firearm but must still be connected to a battery pack for sustained use.',
  },
  {
    id: 'stunner-tl8',
    name: 'Stunner (TL8)',
    category: 'weapon',
    weaponType: 'energy_pistol',
    tl: 8,
    range: '5m',
    damage: '2D',
    mass_kg: 0.5,
    cost: 500,
    magazine: 100,
    magazineCost: 200,
    traits: ['Stun', 'Zero-G'],
    requiredSkill: 'Gun Combat (energy)',
    description: 'A non-lethal weapon designed to inflict a massive shock to the target, incapacitating it. Power pack recharges in 8 hours from a ship\'s power plant.',
  },
  {
    id: 'stunner-tl10',
    name: 'Stunner (TL10)',
    category: 'weapon',
    weaponType: 'energy_pistol',
    tl: 10,
    range: '5m',
    damage: '2D+3',
    mass_kg: 0,
    cost: 750,
    magazine: 100,
    magazineCost: 200,
    traits: ['Stun', 'Zero-G'],
    requiredSkill: 'Gun Combat (energy)',
    description: 'An improved stunner with increased stopping power and negligible mass. Non-lethal incapacitation weapon.',
  },
  {
    id: 'stunner-tl12',
    name: 'Stunner (TL12)',
    category: 'weapon',
    weaponType: 'energy_pistol',
    tl: 12,
    range: '10m',
    damage: '3D',
    mass_kg: 0,
    cost: 1000,
    magazine: 100,
    magazineCost: 200,
    traits: ['Stun', 'Zero-G'],
    requiredSkill: 'Gun Combat (energy)',
    description: 'Advanced stunner with extended range and maximum stun output. The preferred non-lethal sidearm at higher tech levels.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  ENERGY RIFLES  —  Gun Combat (energy)
// ═══════════════════════════════════════════════════════════════════════

export const ENERGY_RIFLES: WeaponCatalogItem[] = [
  {
    id: 'laser-carbine-tl9',
    name: 'Laser Carbine (TL9)',
    category: 'weapon',
    weaponType: 'energy_rifle',
    tl: 9,
    range: '150m',
    damage: '4D',
    mass_kg: 4,
    cost: 2500,
    magazine: 50,
    magazineCost: 1000,
    traits: ['Zero-G'],
    requiredSkill: 'Gun Combat (energy)',
    description: 'Laser carbines are shorter and lighter than laser rifles and have a correspondingly shorter range. Powered by a backpack connected by cable.',
  },
  {
    id: 'laser-carbine-tl11',
    name: 'Laser Carbine (TL11)',
    category: 'weapon',
    weaponType: 'energy_rifle',
    tl: 11,
    range: '200m',
    damage: '4D+3',
    mass_kg: 2,
    cost: 4000,
    magazine: 50,
    magazineCost: 3000,
    traits: ['Zero-G'],
    requiredSkill: 'Gun Combat (energy)',
    description: 'Advanced laser carbine with improved power output and halved weight thanks to miniaturised components.',
  },
  {
    id: 'laser-rifle-tl9',
    name: 'Laser Rifle (TL9)',
    category: 'weapon',
    weaponType: 'energy_rifle',
    tl: 9,
    range: '200m',
    damage: '5D',
    mass_kg: 5,
    cost: 3500,
    magazine: 100,
    magazineCost: 1500,
    traits: ['Zero-G'],
    requiredSkill: 'Gun Combat (energy)',
    description: 'Laser rifles are highly accurate at long range and are powered by heavy backpacks connected by cable.',
  },
  {
    id: 'laser-rifle-tl11',
    name: 'Laser Rifle (TL11)',
    category: 'weapon',
    weaponType: 'energy_rifle',
    tl: 11,
    range: '400m',
    damage: '5D+3',
    mass_kg: 3,
    cost: 8000,
    magazine: 100,
    magazineCost: 3500,
    traits: ['Zero-G'],
    requiredSkill: 'Gun Combat (energy)',
    description: 'Advanced laser rifle with doubled effective range and significantly reduced weight.',
  },
  {
    id: 'laser-sniper-rifle',
    name: 'Laser Sniper Rifle',
    category: 'weapon',
    weaponType: 'energy_rifle',
    tl: 12,
    range: '600m',
    damage: '5D+3',
    mass_kg: 4,
    cost: 9000,
    magazine: 6,
    magazineCost: 250,
    traits: ['Scope', 'Zero-G'],
    requiredSkill: 'Gun Combat (energy)',
    description: 'A six-shot model designed for mobile sniping. The power pack is integrated into the weapon itself, removing the need for a heavy backpack.',
  },
  {
    id: 'plasma-rifle',
    name: 'Plasma Rifle',
    category: 'weapon',
    weaponType: 'energy_rifle',
    tl: 16,
    range: '300m',
    damage: '6D',
    mass_kg: 4,
    cost: 100000,
    magazine: -1,   // Unlimited - built-in micro-reactor
    magazineCost: 0,
    traits: [],
    requiredSkill: 'Gun Combat (energy)',
    description: 'TL16 technology allows the bulky reactor and plasma chamber of the PGHP to be made small enough to fit into a rifle frame. A high-powered weapon designed to crack battle dress. Unlimited ammunition from built-in micro-reactor.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  GRENADES  —  Athletics (dexterity) thrown / Heavy Weapons (portable) launched
// ═══════════════════════════════════════════════════════════════════════

export const GRENADES: WeaponCatalogItem[] = [
  {
    id: 'grenade-aerosol',
    name: 'Aerosol Grenade',
    category: 'weapon',
    weaponType: 'grenade',
    tl: 9,
    range: '20m',
    damage: '\u2014',
    mass_kg: 0.5,
    cost: 15,
    traits: ['Blast 9'],
    requiredSkill: 'Athletics (dexterity)',
    description: 'Creates a fine mist that diffuses any lasers fired into or through it. Laser damage reduced by -10 through the mist. Laser communications completely blocked. Dissipates after 1D \u00d7 3 rounds (heavy winds/rain reduce this).',
  },
  {
    id: 'grenade-frag',
    name: 'Frag Grenade',
    category: 'weapon',
    weaponType: 'grenade',
    tl: 6,
    range: '20m',
    damage: '5D',
    mass_kg: 0.5,
    cost: 30,
    traits: ['Blast 9'],
    requiredSkill: 'Athletics (dexterity)',
    description: 'Fragmentation grenades explode in a blast of shrapnel designed to kill or cripple anyone close by.',
  },
  {
    id: 'grenade-smoke',
    name: 'Smoke Grenade',
    category: 'weapon',
    weaponType: 'grenade',
    tl: 6,
    range: '20m',
    damage: '\u2014',
    mass_kg: 0.5,
    cost: 15,
    traits: ['Blast 9'],
    requiredSkill: 'Athletics (dexterity)',
    description: 'Creates a thick cloud that disrupts vision. Imposes DM-2 to all attacks on targets within the cloud. IR vision completely bypasses smoke. Dissipates after 1D \u00d7 3 rounds (heavy winds/rain reduce this).',
  },
  {
    id: 'grenade-stun',
    name: 'Stun Grenade',
    category: 'weapon',
    weaponType: 'grenade',
    tl: 7,
    range: '20m',
    damage: '3D',
    mass_kg: 0.5,
    cost: 30,
    traits: ['Blast 9', 'Stun'],
    requiredSkill: 'Athletics (dexterity)',
    description: 'Releases a powerful pulse of energy, usually in the form of light and/or sound, that incapacitates targets rather than killing them.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  HEAVY WEAPONS  —  Heavy Weapons (portable)
// ═══════════════════════════════════════════════════════════════════════

export const HEAVY_WEAPONS: WeaponCatalogItem[] = [
  {
    id: 'fghp-14',
    name: 'FGHP-14',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 14,
    range: '450m',
    damage: '2DD',
    mass_kg: 12,
    cost: 100000,
    traits: ['Radiation', 'Very Bulky'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'Fusion Gun, Human Portable. The ultimate personal firearm \u2013 more like a piece of artillery. Includes a gravity suspension system to reduce inertia and fires a directed nuclear explosion. Those without radiation protection nearby when fired will suffer a potentially lethal dose of radiation.',
  },
  {
    id: 'fghp-15',
    name: 'FGHP-15',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 15,
    range: '450m',
    damage: '2DD',
    mass_kg: 12,
    cost: 400000,
    traits: ['Bulky', 'Radiation'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'Improved Fusion Gun, Human Portable with reduced Bulky profile. Still fires directed nuclear explosions with lethal radiation to unprotected bystanders.',
  },
  {
    id: 'fghp-16',
    name: 'FGHP-16',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 16,
    range: '450m',
    damage: '2DD',
    mass_kg: 15,
    cost: 500000,
    traits: ['Radiation'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'Advanced Fusion Gun, Human Portable. No longer Bulky thanks to advanced materials, though slightly heavier. Radiation hazard remains.',
  },
  {
    id: 'grenade-launcher',
    name: 'Grenade Launcher',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 7,
    range: '100m',
    damage: 'As grenade',
    mass_kg: 6,
    cost: 400,
    magazine: 6,
    magazineCost: undefined, // Depends on grenade type
    traits: ['Bulky'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'Used to fire grenades over long distances. May be equipped with any normal type of grenade. Magazine cost depends on grenade type loaded.',
  },
  {
    id: 'machinegun',
    name: 'Machinegun',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 6,
    range: '500m',
    damage: '3D',
    mass_kg: 10,
    cost: 1500,
    magazine: 60,
    magazineCost: 100,
    traits: ['Auto 4'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'A larger and less portable version of the autorifle. Relatively low tech but capable of sawing even armoured targets in half.',
  },
  {
    id: 'pghp-12',
    name: 'PGHP-12',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 12,
    range: '250m',
    damage: '1DD',
    mass_kg: 10,
    cost: 20000,
    traits: ['Very Bulky'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'Plasma Gun, Human Portable. The standard assault weapon of the marines. So heavy and bulky it can only be used easily by a trooper in battle dress. Powered by a built-in micro-fusion generator firing a high-energy plasma stream.',
  },
  {
    id: 'pghp-13',
    name: 'PGHP-13',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 13,
    range: '450m',
    damage: '1DD',
    mass_kg: 10,
    cost: 65000,
    traits: ['Bulky'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'Improved Plasma Gun with extended range and reduced bulk. Still best used by troops in powered armour.',
  },
  {
    id: 'pghp-14',
    name: 'PGHP-14',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 14,
    range: '450m',
    damage: '1DD',
    mass_kg: 10,
    cost: 100000,
    traits: [],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'Advanced Plasma Gun with adjusted optimum range and plasma temperature. No longer Bulky, usable without battle dress.',
  },
  {
    id: 'ram-grenade-launcher',
    name: 'RAM Grenade Launcher',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 8,
    range: '250m',
    damage: 'As grenade',
    mass_kg: 2,
    cost: 800,
    magazine: 6,
    magazineCost: undefined, // Depends on grenade type
    traits: ['Auto 3', 'Bulky'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'Rocket Assisted Multi-purpose grenade launcher with longer range, capable of firing up to three grenades with a single attack. May be equipped with any normal type of grenade.',
  },
  {
    id: 'rocket-launcher-tl6',
    name: 'Rocket Launcher (TL6)',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 6,
    range: '120m',
    damage: '4D',
    mass_kg: 8,
    cost: 2000,
    magazine: 1,
    magazineCost: 300,
    traits: ['Blast 6'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'A simple tube device that launches rockets. Anyone standing behind when fired will be caught in back blast and suffer 3D damage. Takes three Minor Actions to reload.',
  },
  {
    id: 'rocket-launcher-tl7',
    name: 'Rocket Launcher (TL7)',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 7,
    range: '150m',
    damage: '4D+3',
    mass_kg: 8,
    cost: 2000,
    magazine: 1,
    magazineCost: 400,
    traits: ['Blast 6', 'Smart'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'Improved rocket launcher with smart-guided munitions for better accuracy. Back blast deals 3D damage. Three Minor Actions to reload.',
  },
  {
    id: 'rocket-launcher-tl8',
    name: 'Rocket Launcher (TL8)',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 8,
    range: '200m',
    damage: '5D',
    mass_kg: 8,
    cost: 2000,
    magazine: 2,
    magazineCost: 600,
    traits: ['Blast 6', 'Scope', 'Smart'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'Advanced rocket launcher with scope and smart munitions. Dual-tube design allows two shots before reloading. Back blast deals 3D damage.',
  },
  {
    id: 'rocket-launcher-tl9',
    name: 'Rocket Launcher (TL9)',
    category: 'weapon',
    weaponType: 'heavy',
    tl: 9,
    range: '250m',
    damage: '5D+6',
    mass_kg: 8,
    cost: 2000,
    magazine: 2,
    magazineCost: 800,
    traits: ['Blast 6', 'Scope', 'Smart'],
    requiredSkill: 'Heavy Weapons (portable)',
    description: 'Top-of-the-line rocket launcher with maximum range, smart guidance, and devastating warhead. Back blast deals 3D damage.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  EXPLOSIVES
// ═══════════════════════════════════════════════════════════════════════

export const EXPLOSIVES: WeaponCatalogItem[] = [
  {
    id: 'plastic-explosive',
    name: 'Plastic',
    category: 'weapon',
    weaponType: 'explosive',
    tl: 6,
    range: '\u2014',
    damage: '3D',
    mass_kg: 0,
    cost: 200,
    traits: ['Blast 9'],
    requiredSkill: 'Explosives',
    description: 'Generic, multi-purpose plastic explosive. A favourite of military units, terrorists, demolition teams and Travellers across Charted Space.',
  },
  {
    id: 'pocket-nuke',
    name: 'Pocket Nuke',
    category: 'weapon',
    weaponType: 'explosive',
    tl: 12,
    range: '\u2014',
    damage: '6DD',
    mass_kg: 4,
    cost: 250000,
    traits: ['Blast 1000', 'Radiation'],
    requiredSkill: 'Explosives',
    description: 'Hideously illegal on many worlds. Actually the size of a briefcase \u2013 too large for a grenade launcher. Using multiple pocket nukes will not increase the Damage or Blast of the explosion.',
  },
  {
    id: 'tdx',
    name: 'TDX',
    category: 'weapon',
    weaponType: 'explosive',
    tl: 12,
    range: '\u2014',
    damage: '4D',
    mass_kg: 0,
    cost: 1000,
    traits: ['Blast 15'],
    requiredSkill: 'Explosives',
    description: 'An advanced gravity-polarised explosive. TDX explodes only along the horizontal axis, making it ideal for controlled demolition and breaching.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  WEAPON OPTIONS / UPGRADES
// ═══════════════════════════════════════════════════════════════════════

export const WEAPON_OPTIONS: WeaponOption[] = [
  {
    id: 'auxiliary-grenade-launcher',
    name: 'Auxiliary Grenade Launcher',
    description: 'An underslung grenade launcher added to any rifle weapon. Has a magazine of one grenade and takes three Minor Actions to reload. Otherwise identical to a standard grenade launcher.',
    variants: [
      {
        tl: 7,
        cost: 1000,
        effect: 'Underslung grenade launcher (1 grenade, 3 Minor Actions to reload)',
        compatibleWeaponTypes: ['slug_rifle', 'energy_rifle'],
      },
    ],
  },
  {
    id: 'gyrostabiliser',
    name: 'Gyrostabiliser',
    description: 'Stabilisers reduce recoil and remove the Bulky trait. Cannot be added to any Destructive weapon.',
    variants: [
      {
        tl: 9,
        cost: 500,
        effect: 'Removes Bulky trait',
        // Cannot be added to Destructive weapons (DD damage) - checked in logic
      },
    ],
  },
  {
    id: 'intelligent-weapon',
    name: 'Intelligent Weapon',
    description: 'Adds an integrated computer system to the weapon.',
    variants: [
      {
        tl: 11,
        cost: 1000,
        effect: 'Computer/0',
      },
      {
        tl: 13,
        cost: 5000,
        effect: 'Computer/1',
      },
    ],
  },
  {
    id: 'laser-sight',
    name: 'Laser Sight',
    description: 'Integrated optics and laser sights for improved accuracy at close range.',
    variants: [
      {
        tl: 8,
        cost: 200,
        effect: 'DM+1 to attacks at less than 50m (visible red dot)',
      },
      {
        tl: 10,
        cost: 200,
        effect: 'DM+1 to attacks at less than 50m (UV laser, no visible dot)',
      },
    ],
  },
  {
    id: 'scope',
    name: 'Scope',
    description: 'A high-quality telescopic scope for attachment to a rifle or heavy weapon, allowing accurate shots at extreme ranges.',
    variants: [
      {
        tl: 5,
        cost: 50,
        effect: 'Adds Scope trait',
        compatibleWeaponTypes: ['slug_rifle', 'energy_rifle', 'heavy'],
      },
      {
        tl: 7,
        cost: 50,
        effect: 'Scope trait + image enhancement and light intensification (no low-light penalty)',
        compatibleWeaponTypes: ['slug_rifle', 'energy_rifle', 'heavy'],
      },
    ],
  },
  {
    id: 'secure-weapon',
    name: 'Secure Weapon',
    description: 'Requires authentication (DNA scan, iris pattern, password, or transmitted unlock code) before it can be fired.',
    variants: [
      {
        tl: 10,
        cost: 250,
        effect: 'Authentication required to fire',
      },
    ],
  },
  {
    id: 'suppressor',
    name: 'Suppressor',
    description: 'Masks the sound produced by firing. Can only be added to non-automatic slug throwers.',
    variants: [
      {
        tl: 8,
        cost: 250,
        effect: 'Suppressed firing sound',
        compatibleWeaponTypes: ['slug_pistol', 'slug_rifle'],
        // Additional check: cannot have Auto trait - handled in logic
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  COMBINED CATALOG & UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** All weapons in a single array for searching/filtering */
export const WEAPON_CATALOG: WeaponCatalogItem[] = [
  ...MELEE_WEAPONS,
  ...SLUG_PISTOLS,
  ...SLUG_RIFLES,
  ...ENERGY_PISTOLS,
  ...ENERGY_RIFLES,
  ...GRENADES,
  ...HEAVY_WEAPONS,
  ...EXPLOSIVES,
];

/** Look up a weapon by its catalog ID */
export function getWeaponById(id: string): WeaponCatalogItem | undefined {
  return WEAPON_CATALOG.find(w => w.id === id);
}

/** Look up a weapon option by its ID */
export function getWeaponOptionById(id: string): WeaponOption | undefined {
  return WEAPON_OPTIONS.find(o => o.id === id);
}

/** Get all weapons of a specific type (for dropdown grouping) */
export function getWeaponsByType(weaponType: WeaponCatalogItem['weaponType']): WeaponCatalogItem[] {
  return WEAPON_CATALOG.filter(w => w.weaponType === weaponType);
}

/**
 * Check if a weapon option variant is compatible with a given weapon.
 * Rules:
 * - If variant has compatibleWeaponTypes, weapon must match one
 * - Gyrostabiliser cannot be added to Destructive weapons (DD damage)
 * - Suppressor cannot be added to weapons with Auto trait
 */
export function isWeaponOptionCompatible(
  weapon: WeaponCatalogItem,
  option: WeaponOption,
  variantIndex: number = 0,
): boolean {
  const v = option.variants[variantIndex];
  if (!v) return false;

  // Check weapon type compatibility
  if (v.compatibleWeaponTypes && v.compatibleWeaponTypes.length > 0) {
    if (!v.compatibleWeaponTypes.includes(weapon.weaponType)) return false;
  }

  // Check specific incompatibilities
  if (v.incompatibleWith && v.incompatibleWith.length > 0) {
    if (v.incompatibleWith.includes(weapon.id)) return false;
  }

  // Gyrostabiliser: cannot add to Destructive weapons (DD damage)
  if (option.id === 'gyrostabiliser') {
    if (weapon.damage.includes('DD')) return false;
    // Only useful if weapon has Bulky trait
    if (!weapon.traits.includes('Bulky') && !weapon.traits.includes('Very Bulky')) return false;
  }

  // Suppressor: cannot add to weapons with Auto trait
  if (option.id === 'suppressor') {
    if (weapon.traits.some(t => t.startsWith('Auto'))) return false;
  }

  // Melee weapons generally don't take ranged weapon options
  if (weapon.weaponType === 'melee') {
    const rangedOnlyOptions = [
      'auxiliary-grenade-launcher', 'gyrostabiliser', 'laser-sight',
      'scope', 'suppressor',
    ];
    if (rangedOnlyOptions.includes(option.id)) return false;
  }

  // Grenades and explosives don't take weapon options
  if (weapon.weaponType === 'grenade' || weapon.weaponType === 'explosive') {
    return false;
  }

  return true;
}

/**
 * Get all compatible options for a given weapon.
 */
export function getCompatibleWeaponOptions(weapon: WeaponCatalogItem): Array<{
  option: WeaponOption;
  compatibleVariants: Array<{ index: number; variant: WeaponOption['variants'][0] }>;
}> {
  const results: Array<{
    option: WeaponOption;
    compatibleVariants: Array<{ index: number; variant: WeaponOption['variants'][0] }>;
  }> = [];

  for (const option of WEAPON_OPTIONS) {
    const compatibleVariants: Array<{ index: number; variant: WeaponOption['variants'][0] }> = [];

    for (let i = 0; i < option.variants.length; i++) {
      if (isWeaponOptionCompatible(weapon, option, i)) {
        compatibleVariants.push({ index: i, variant: option.variants[i] });
      }
    }

    if (compatibleVariants.length > 0) {
      results.push({ option, compatibleVariants });
    }
  }

  return results;
}

/**
 * Calculate total cost of a weapon with selected options.
 */
export function calculateWeaponCost(
  weapon: WeaponCatalogItem,
  selectedOptions: Array<{ optionId: string; variantIndex: number }>,
): number {
  let total = weapon.cost;

  for (const sel of selectedOptions) {
    const option = getWeaponOptionById(sel.optionId);
    if (option && option.variants[sel.variantIndex]) {
      total += option.variants[sel.variantIndex].cost;
    }
  }

  return total;
}

/**
 * Format weapon damage for display, including Destructive notation.
 * DD = Destructive Damage (each die does x10 damage).
 */
export function formatDamage(weapon: WeaponCatalogItem): string {
  return weapon.damage;
}

/**
 * Format magazine info for display.
 * Returns "—" for no magazine, "Unlimited" for -1, otherwise the count.
 */
export function formatMagazine(weapon: WeaponCatalogItem): string {
  if (weapon.magazine === undefined || weapon.magazine === null) return '\u2014';
  if (weapon.magazine === -1) return 'Unlimited';
  return String(weapon.magazine);
}

/**
 * Format magazine cost for display.
 */
export function formatMagazineCost(weapon: WeaponCatalogItem): string {
  if (!weapon.magazineCost && weapon.magazine !== -1) {
    if (weapon.damage === 'As grenade') return 'As grenade';
    return '\u2014';
  }
  if (weapon.magazine === -1) return '\u2014';
  return `Cr${weapon.magazineCost}`;
}
