-- Create characters table for Traveller RPG character sheets
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL DEFAULT 'campaign',
  
  -- Header information
  name TEXT NOT NULL DEFAULT '',
  species TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  age INTEGER DEFAULT 0,
  
  -- Characteristics (core stats)
  strength INTEGER DEFAULT 7,
  dexterity INTEGER DEFAULT 7,
  endurance INTEGER DEFAULT 7,
  intellect INTEGER DEFAULT 7,
  education INTEGER DEFAULT 7,
  social_standing INTEGER DEFAULT 7,
  
  -- Derived characteristics
  melee_dmg INTEGER DEFAULT 0,
  ranged_dmg INTEGER DEFAULT 0,
  lifeblood INTEGER DEFAULT 0,
  stamina INTEGER DEFAULT 0,
  
  -- Career and background
  homeworld TEXT DEFAULT '',
  career TEXT DEFAULT '',
  rank TEXT DEFAULT '',
  terms_served INTEGER DEFAULT 0,
  
  -- Skills (stored as JSONB for flexibility)
  skills JSONB DEFAULT '{}',
  
  -- Equipment and inventory
  equipment JSONB DEFAULT '{}',
  armor JSONB DEFAULT '{}',
  weapons JSONB DEFAULT '{}',
  
  -- Finances
  credits BIGINT DEFAULT 0,
  debt BIGINT DEFAULT 0,
  
  -- Personal details
  allies TEXT DEFAULT '',
  contacts TEXT DEFAULT '',
  rivals TEXT DEFAULT '',
  enemies TEXT DEFAULT '',
  
  -- Augments and modifications
  augments JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table for ships, ground vehicles, etc.
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL DEFAULT 'campaign',
  
  -- Basic information
  name TEXT NOT NULL DEFAULT '',
  vehicle_type TEXT DEFAULT 'Ship',
  class_type TEXT DEFAULT '',
  
  -- Technical specifications
  tech_level INTEGER DEFAULT 10,
  tonnage INTEGER DEFAULT 100,
  cost BIGINT DEFAULT 0,
  
  -- Hull and structure
  hull INTEGER DEFAULT 1,
  structure INTEGER DEFAULT 1,
  armor INTEGER DEFAULT 0,
  
  -- Core systems
  maneuver_drive INTEGER DEFAULT 1,
  jump_drive INTEGER DEFAULT 1,
  power_plant INTEGER DEFAULT 1,
  
  -- Performance
  acceleration INTEGER DEFAULT 1,
  top_speed INTEGER DEFAULT 0,
  jump_rating INTEGER DEFAULT 1,
  
  -- Fuel and cargo
  fuel_capacity INTEGER DEFAULT 10,
  cargo_capacity INTEGER DEFAULT 10,
  passenger_capacity INTEGER DEFAULT 0,
  
  -- Weapons and defenses
  weapons JSONB DEFAULT '{}',
  screens JSONB DEFAULT '{}',
  
  -- Systems and equipment
  computer_rating INTEGER DEFAULT 5,
  sensors INTEGER DEFAULT 1,
  communications INTEGER DEFAULT 1,
  
  -- Maintenance and operations
  maintenance_cost INTEGER DEFAULT 0,
  crew_requirements JSONB DEFAULT '{}',
  
  -- Additional specifications
  specifications JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for characters
CREATE POLICY "Allow all operations on characters" 
ON public.characters 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create RLS policies for vehicles
CREATE POLICY "Allow all operations on vehicles" 
ON public.vehicles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_characters_player_id ON public.characters(player_id);
CREATE INDEX idx_characters_created_at ON public.characters(created_at);
CREATE INDEX idx_vehicles_player_id ON public.vehicles(player_id);
CREATE INDEX idx_vehicles_created_at ON public.vehicles(created_at);