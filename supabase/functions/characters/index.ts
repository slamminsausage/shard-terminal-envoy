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

    const url = new URL(req.url)
    const characterId = url.pathname.split('/').pop()

    switch (req.method) {
      case 'GET': {
        const playerId = url.searchParams.get('player_id')
        
        if (!playerId) {
          return new Response(
            JSON.stringify({ error: 'Player ID is required' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }

        const { data, error } = await supabaseClient
          .from('characters')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch characters' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }

        return new Response(
          JSON.stringify(data),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'POST': {
        const characterData = await req.json()

        if (!characterData.player_id) {
          return new Response(
            JSON.stringify({ error: 'Player ID is required' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }

        const { data, error } = await supabaseClient
          .from('characters')
          .insert([{
            ...characterData,
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to create character' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }

        return new Response(
          JSON.stringify(data),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201,
          }
        )
      }

      case 'PUT': {
        if (!characterId) {
          return new Response(
            JSON.stringify({ error: 'Character ID is required' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }

        const characterData = await req.json()
        delete characterData.id // Remove ID from update data
        delete characterData.created_at // Remove created_at from update data

        const { data, error } = await supabaseClient
          .from('characters')
          .update({
            ...characterData,
            updated_at: new Date().toISOString()
          })
          .eq('id', characterId)
          .select()
          .single()

        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to update character' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }

        return new Response(
          JSON.stringify(data),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      case 'DELETE': {
        if (!characterId) {
          return new Response(
            JSON.stringify({ error: 'Character ID is required' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }

        const { error } = await supabaseClient
          .from('characters')
          .delete()
          .eq('id', characterId)

        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to delete character' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 405,
          }
        )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Server error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})