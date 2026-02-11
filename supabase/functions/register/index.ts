import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CAMPAIGN_CODE = 'TRAVELLER2024'
const EMAIL_DOMAIN = 'eclipse-shard.local'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )
  }

  try {
    const { campaign_code, username, password, display_name } = await req.json()

    // 1. Validate campaign code
    if (!campaign_code || campaign_code.toUpperCase() !== CAMPAIGN_CODE) {
      return new Response(
        JSON.stringify({ error: 'Invalid campaign code.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // 2. Validate username
    if (!username || typeof username !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Username is required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const trimmedUsername = username.trim().toLowerCase()
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Username must be 3-20 characters.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      return new Response(
        JSON.stringify({ error: 'Username can only contain letters, numbers, and underscores.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 3. Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 4. Validate display name
    const name = (display_name && typeof display_name === 'string' && display_name.trim())
      ? display_name.trim()
      : trimmedUsername

    // Create admin client with service role key (bypasses email confirmation)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 5. Check if username is already taken (check players table)
    const { data: existingPlayer } = await supabaseAdmin
      .from('players')
      .select('id')
      .eq('access_code', trimmedUsername)
      .maybeSingle()

    if (existingPlayer) {
      return new Response(
        JSON.stringify({ error: 'Username is already taken.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      )
    }

    // Also check auth users by email
    const email = `${trimmedUsername}@${EMAIL_DOMAIN}`
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const emailTaken = existingUsers?.users?.some(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    )

    if (emailTaken) {
      return new Response(
        JSON.stringify({ error: 'Username is already taken.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      )
    }

    // 6. Create Supabase Auth user (auto-confirmed via admin API)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: trimmedUsername, display_name: name },
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return new Response(
        JSON.stringify({ error: authError.message || 'Failed to create account.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const authUserId = authData.user.id

    // 7. Determine role: first auth-linked account becomes GM
    const { data: gmCheck } = await supabaseAdmin
      .from('players')
      .select('id')
      .not('auth_user_id', 'is', null)
      .eq('role', 'gm')
      .limit(1)

    const role = (!gmCheck || gmCheck.length === 0) ? 'gm' : 'player'

    // 8. Create player record
    const { data: player, error: playerError } = await supabaseAdmin
      .from('players')
      .insert({
        name,
        role,
        access_code: trimmedUsername,
        is_active: true,
        auth_user_id: authUserId,
      })
      .select()
      .single()

    if (playerError) {
      console.error('Player creation error:', playerError)
      // Clean up: delete the auth user we just created
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      return new Response(
        JSON.stringify({ error: 'Failed to create player profile.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        player_id: player.id,
        role,
        name: player.name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    )

  } catch (error) {
    console.error('Register function error:', error)
    return new Response(
      JSON.stringify({ error: 'Server error occurred.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
