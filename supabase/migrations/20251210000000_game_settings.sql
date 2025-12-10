-- Create game_settings table for persistent key-value storage
-- Used for storing player location, map preferences, and other campaign state
CREATE TABLE public.game_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (global access for campaign mode)
CREATE POLICY "Allow all operations on game_settings"
ON public.game_settings
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_game_settings_updated_at
  BEFORE UPDATE ON public.game_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for fast key lookups
CREATE INDEX idx_game_settings_key ON public.game_settings(setting_key);
