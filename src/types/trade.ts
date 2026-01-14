// TypeScript types for Trade System features

export interface TradeGood {
  id: string;
  player_id: string;

  // Good details
  name: string;
  trade_code: string;
  base_price: number;
  tons: number;

  // Purchase info
  purchase_world?: string;
  purchase_price: number;
  purchase_date?: string;

  // Sale info (if sold)
  sale_world?: string;
  sale_price?: number;
  sale_date?: string;

  status: 'in_cargo' | 'sold';

  // Storage
  vehicle_id?: string;

  // Speculation
  is_speculation: boolean;
  broker_skill_used: number;

  notes?: string;

  created_at: string;
  updated_at: string;
}

export interface TradeMarketRoll {
  id: string;
  player_id: string;

  world_name: string;
  trade_codes: string[];

  roll_date: string;
  imperial_date?: string;

  available_goods: any;

  created_at: string;
}

export interface TradeGoodTemplate {
  name: string;
  trade_code: string;
  base_price: number;
  purchase_dm: number;
  sale_dm: number;
}

export interface MarketConditions {
  world_name: string;
  trade_codes: string[];
  available_goods: TradeGoodAvailability[];
}

export interface TradeGoodAvailability {
  name: string;
  trade_code: string;
  base_price: number;
  actual_price: number;
  tons_available: number;
  purchase_dm: number;
}

export type TradeGoodStatus = 'in_cargo' | 'sold';
