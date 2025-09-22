-- Create unlocked_terminals table to track which terminals are accessible
CREATE TABLE public.unlocked_terminals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  terminal_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unlocked_terminals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (global access for all players)
CREATE POLICY "Allow all operations on unlocked_terminals" 
ON public.unlocked_terminals 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert initially available terminals
INSERT INTO public.unlocked_terminals (terminal_code) VALUES
('lysani01'),
('s.elara01'),
('slocombe875'),
('waferterm01'),
('labpc81'),
('vanagandr001'),
('blackcircuit01'),
('fuw01'),
('caldonis_public'),
('fuwnet'),
('01-1485-10-4-89-40');