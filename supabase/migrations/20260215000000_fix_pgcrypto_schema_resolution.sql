-- Fix pgcrypto function resolution for DB-only auth RPCs.
-- Supabase installs pgcrypto functions in the `extensions` schema,
-- while these SECURITY DEFINER functions use `SET search_path = public`.
-- Explicit qualification avoids runtime 42883 errors for gen_salt/crypt.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.authenticate_player(p_username TEXT, p_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
BEGIN
  SELECT id, name, role, access_code, is_active, last_accessed, created_at, password_hash
  INTO rec
  FROM public.players
  WHERE LOWER(access_code) = LOWER(TRIM(p_username))
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Invalid username or password.');
  END IF;

  IF rec.password_hash IS NULL THEN
    UPDATE public.players SET last_accessed = now() WHERE id = rec.id;

    RETURN json_build_object(
      'success', true,
      'needs_password', true,
      'player', json_build_object(
        'id', rec.id,
        'name', rec.name,
        'role', rec.role,
        'access_code', rec.access_code,
        'is_active', rec.is_active,
        'last_accessed', now(),
        'created_at', rec.created_at
      )
    );
  END IF;

  IF rec.password_hash = extensions.crypt(p_password, rec.password_hash) THEN
    UPDATE public.players SET last_accessed = now() WHERE id = rec.id;

    RETURN json_build_object(
      'success', true,
      'player', json_build_object(
        'id', rec.id,
        'name', rec.name,
        'role', rec.role,
        'access_code', rec.access_code,
        'is_active', rec.is_active,
        'last_accessed', now(),
        'created_at', rec.created_at
      )
    );
  ELSE
    RETURN json_build_object('error', 'Invalid username or password.');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_player(
  p_campaign_code TEXT,
  p_username TEXT,
  p_password TEXT,
  p_display_name TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_player RECORD;
  new_role TEXT;
  actual_name TEXT;
  norm_user TEXT;
BEGIN
  IF UPPER(TRIM(p_campaign_code)) != 'TRAVELLER2024' THEN
    RETURN json_build_object('error', 'Invalid campaign code.');
  END IF;

  norm_user := LOWER(TRIM(p_username));

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

  IF NOT EXISTS (SELECT 1 FROM public.players WHERE role = 'gm' AND password_hash IS NOT NULL) THEN
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

CREATE OR REPLACE FUNCTION public.set_player_password(p_player_id UUID, p_new_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF LENGTH(p_new_password) < 6 THEN
    RETURN json_build_object('error', 'Password must be at least 6 characters.');
  END IF;

  UPDATE public.players
  SET password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf'))
  WHERE id = p_player_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Player not found.');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;
