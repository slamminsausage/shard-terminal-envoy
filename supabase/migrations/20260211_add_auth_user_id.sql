-- Add auth_user_id to link players to Supabase Auth users
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- Make access_code nullable for auth-based players (they use username/password instead)
ALTER TABLE public.players ALTER COLUMN access_code DROP NOT NULL;
