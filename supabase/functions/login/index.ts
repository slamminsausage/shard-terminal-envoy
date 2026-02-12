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

    // Use a regular client (anon key) to perform signInWithPassword server-side
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

    // Wrap signInWithPassword in a timeout — this call can hang indefinitely
    // if GoTrue is unresponsive or CAPTCHA is misconfigured
    let authData: any = null
    let authError: any = null

    try {
      const result = await Promise.race([
        supabaseClient.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 8000)
        ),
      ])
      authData = result.data
      authError = result.error
    } catch (timeoutErr: any) {
      if (timeoutErr?.message === 'AUTH_TIMEOUT') {
        console.error('signInWithPassword timed out after 8s')
        return new Response(
          JSON.stringify({ error: 'Authentication timed out. Please try again.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 504 }
        )
      }
      throw timeoutErr
    }

    if (authError) {
      console.error('Login auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid username or password.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    if (!authData?.session) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed — no session returned.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Fetch the player record using admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Try lookup by auth_user_id first, fall back to access_code if column missing or no match
    let player: any = null
    const { data: p1, error: playerError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (playerError) {
      // auth_user_id column may not exist — fall back to access_code
      console.warn('auth_user_id lookup failed, falling back to access_code:', playerError.message)
    }

    player = p1

    // If auth_user_id lookup returned no row (or errored), try by access_code
    // This covers players created before the auth_user_id migration
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

      // If we found a player by access_code but it lacks auth_user_id, link it now
      if (player && !player.auth_user_id) {
        await supabaseAdmin
          .from('players')
          .update({ auth_user_id: authData.user.id })
          .eq('id', player.id)
          .then(({ error: linkError }) => {
            if (linkError) {
              // Column might not exist — not critical, just log it
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
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
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
