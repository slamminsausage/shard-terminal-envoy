import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    const { username, password } = await req.json()

    if (!username || typeof username !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Username is required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Password is required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const trimmedUsername = username.trim().toLowerCase()
    const email = `${trimmedUsername}@${EMAIL_DOMAIN}`

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // ── Sign in via direct GoTrue REST API (bypasses Supabase JS client which hangs) ──
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    let authResult: any
    try {
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      authResult = await authResponse.json()

      if (!authResponse.ok) {
        console.error('GoTrue auth error:', authResult)
        const msg = authResult?.error_description || authResult?.msg || 'Invalid username or password.'
        return new Response(
          JSON.stringify({ error: msg }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }
    } catch (fetchErr: any) {
      clearTimeout(timeout)
      if (fetchErr.name === 'AbortError') {
        console.error('GoTrue auth request aborted after 8s timeout')
        return new Response(
          JSON.stringify({ error: 'Authentication timed out. Please try again.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 504 }
        )
      }
      throw fetchErr
    }

    // GoTrue returns access_token, refresh_token, user directly in the response body
    const accessToken = authResult.access_token
    const refreshToken = authResult.refresh_token
    const authUser = authResult.user

    if (!accessToken || !refreshToken || !authUser) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed — no session returned.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // ── Fetch player record using admin client ──
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Try lookup by auth_user_id first, fall back to access_code if column missing or no match
    let player: any = null
    const { data: p1, error: playerError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .eq('is_active', true)
      .maybeSingle()

    if (playerError) {
      console.warn('auth_user_id lookup failed, falling back to access_code:', playerError.message)
    }

    player = p1

    // If auth_user_id lookup returned no row (or errored), try by access_code
    if (!player) {
      const { data: p2, error: fallbackError } = await supabaseAdmin
        .from('players')
        .select('*')
        .eq('access_code', trimmedUsername)
        .eq('is_active', true)
        .maybeSingle()

      if (fallbackError) {
        console.error('Player access_code lookup error:', fallbackError)
      }
      player = p2

      // Link auth_user_id to the player if found by access_code
      if (player && !player.auth_user_id) {
        await supabaseAdmin
          .from('players')
          .update({ auth_user_id: authUser.id })
          .eq('id', player.id)
          .then(({ error: linkError }) => {
            if (linkError) {
              console.warn('Could not link auth_user_id to player:', linkError.message)
            }
          })
      }
    }

    // Update last_accessed
    if (player) {
      await supabaseAdmin
        .from('players')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', player.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        access_token: accessToken,
        refresh_token: refreshToken,
        player: player || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Login function error:', error)
    return new Response(
      JSON.stringify({ error: 'Server error occurred.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
