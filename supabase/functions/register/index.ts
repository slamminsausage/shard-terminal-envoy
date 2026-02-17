import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

const CAMPAIGN_CODE = (Deno.env.get('CAMPAIGN_CODE') ?? '').trim().toUpperCase()
const EMAIL_DOMAIN = Deno.env.get('AUTH_EMAIL_DOMAIN') ?? 'eclipse-shard.local'

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

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
    if (!CAMPAIGN_CODE) {
      return new Response(
        JSON.stringify({ error: 'Server campaign code is not configured.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

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
      (u: { email?: string | null }) => u.email?.toLowerCase() === email.toLowerCase()
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
    let role = 'player'
    const { data: gmCheck, error: gmCheckError } = await supabaseAdmin
      .from('players')
      .select('id')
      .not('auth_user_id', 'is', null)
      .eq('role', 'gm')
      .limit(1)

    if (gmCheckError) {
      // auth_user_id column may not exist yet — fall back to checking any GM
      console.warn('GM check with auth_user_id failed, falling back:', gmCheckError.message)
      const { data: anyGM } = await supabaseAdmin
        .from('players')
        .select('id')
        .eq('role', 'gm')
        .limit(1)
      role = (!anyGM || anyGM.length === 0) ? 'gm' : 'player'
    } else {
      role = (!gmCheck || gmCheck.length === 0) ? 'gm' : 'player'
    }

    // 8. Create player record (try with auth_user_id, fall back without if column missing)
    let player: Record<string, unknown> | null = null
    let playerError: { message?: string; code?: string } | null = null

    const { data: p1, error: e1 } = await supabaseAdmin
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

    if (e1 && (e1.message?.includes('auth_user_id') || e1.code === '42703')) {
      // auth_user_id column doesn't exist — insert without it
      console.warn('auth_user_id column missing, inserting without it:', e1.message)
      const { data: p2, error: e2 } = await supabaseAdmin
        .from('players')
        .insert({
          name,
          role,
          access_code: trimmedUsername,
          is_active: true,
        })
        .select()
        .single()
      player = p2
      playerError = e2
    } else {
      player = p1
      playerError = e1
    }

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
