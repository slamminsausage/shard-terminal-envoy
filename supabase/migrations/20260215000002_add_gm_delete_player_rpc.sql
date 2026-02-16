-- Allow GM accounts to remove player/GM accounts safely.
-- Safeguards:
-- 1) Only active GM actor can perform deletion
-- 2) Actor cannot delete self
-- 3) Cannot delete the last remaining GM account
-- 4) Reassign owned characters to unassigned campaign pool before delete

CREATE OR REPLACE FUNCTION public.delete_player_account(
  p_actor_player_id UUID,
  p_target_player_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_role TEXT;
  actor_active BOOLEAN;
  target_role TEXT;
  gm_count INTEGER;
BEGIN
  IF p_actor_player_id IS NULL OR p_target_player_id IS NULL THEN
    RETURN json_build_object('error', 'Both actor and target player IDs are required.');
  END IF;

  SELECT role, is_active
  INTO actor_role, actor_active
  FROM public.players
  WHERE id = p_actor_player_id;

  IF actor_role IS NULL THEN
    RETURN json_build_object('error', 'Actor account not found.');
  END IF;

  IF actor_active IS DISTINCT FROM TRUE THEN
    RETURN json_build_object('error', 'Actor account is inactive.');
  END IF;

  IF actor_role <> 'gm' THEN
    RETURN json_build_object('error', 'Only GM accounts can delete users.');
  END IF;

  IF p_actor_player_id = p_target_player_id THEN
    RETURN json_build_object('error', 'You cannot delete your own account.');
  END IF;

  SELECT role
  INTO target_role
  FROM public.players
  WHERE id = p_target_player_id;

  IF target_role IS NULL THEN
    RETURN json_build_object('error', 'Target account not found.');
  END IF;

  IF target_role = 'gm' THEN
    SELECT COUNT(*)::INTEGER
    INTO gm_count
    FROM public.players
    WHERE role = 'gm';

    IF gm_count <= 1 THEN
      RETURN json_build_object('error', 'Cannot delete the last GM account.');
    END IF;
  END IF;

  UPDATE public.characters
  SET player_id = 'campaign'
  WHERE player_id = p_target_player_id;

  DELETE FROM public.players
  WHERE id = p_target_player_id;

  RETURN json_build_object('success', true);
END;
$$;
