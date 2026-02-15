-- Allow registration to request GM/Player role, while enforcing
-- that only the first GM account can be created via public registration.

CREATE OR REPLACE FUNCTION public.register_player(
  p_campaign_code TEXT,
  p_username TEXT,
  p_password TEXT,
  p_display_name TEXT DEFAULT NULL,
  p_requested_role TEXT DEFAULT 'player'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_player RECORD;
  new_role TEXT;
  requested_role TEXT;
  actual_name TEXT;
  norm_user TEXT;
  gm_exists BOOLEAN;
BEGIN
  IF UPPER(TRIM(p_campaign_code)) != 'TRAVELLER2024' THEN
    RETURN json_build_object('error', 'Invalid campaign code.');
  END IF;

  norm_user := LOWER(TRIM(p_username));
  requested_role := LOWER(TRIM(COALESCE(p_requested_role, 'player')));

  IF requested_role NOT IN ('gm', 'player') THEN
    RETURN json_build_object('error', 'Role must be gm or player.');
  END IF;

  IF LENGTH(norm_user) < 3 OR LENGTH(norm_user) > 20 THEN
    RETURN json_build_object('error', 'Username must be 3-20 characters.');
  END IF;

  IF norm_user !~ '^[a-z0-9_]+$' THEN
    RETURN json_build_object('error', 'Username can only contain letters, numbers, and underscores.');
  END IF;

  IF LENGTH(p_password) < 6 THEN
    RETURN json_build_object('error', 'Password must be at least 6 characters.');
  END IF;

  IF EXISTS (SELECT 1 FROM public.players WHERE LOWER(access_code) = norm_user) THEN
    RETURN json_build_object('error', 'Username is already taken.');
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.players WHERE role = 'gm') INTO gm_exists;

  IF requested_role = 'gm' THEN
    IF gm_exists THEN
      RETURN json_build_object('error', 'A GM account already exists. Register as player instead.');
    END IF;
    new_role := 'gm';
  ELSE
    new_role := 'player';
  END IF;

  actual_name := COALESCE(NULLIF(TRIM(p_display_name), ''), norm_user);

  INSERT INTO public.players (name, role, access_code, password_hash, is_active)
  VALUES (
    actual_name,
    new_role,
    norm_user,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    true
  )
  RETURNING * INTO new_player;

  RETURN json_build_object(
    'success', true,
    'role', new_role,
    'player', json_build_object(
      'id', new_player.id,
      'name', new_player.name,
      'role', new_player.role,
      'access_code', new_player.access_code,
      'is_active', new_player.is_active,
      'last_accessed', new_player.last_accessed,
      'created_at', new_player.created_at
    )
  );
END;
$$;
