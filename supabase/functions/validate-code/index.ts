import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ 
          is_valid: false, 
          player_id: null, 
          player_name: null, 
          error_message: 'Access code is required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Call the validate_access_code function
    const { data, error } = await supabaseClient.rpc('validate_access_code', {
      input_code: code.toUpperCase()
    })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          is_valid: false, 
          player_id: null, 
          player_name: null, 
          error_message: 'Database error occurred' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // If valid, update last_accessed timestamp
    if (data && data.length > 0 && data[0].is_valid) {
      await supabaseClient
        .from('players')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', data[0].player_id)
    }

    const result = data && data.length > 0 ? data[0] : {
      is_valid: false,
      player_id: null,
      player_name: null,
      error_message: 'Invalid access code'
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        is_valid: false, 
        player_id: null, 
        player_name: null, 
        error_message: 'Server error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})