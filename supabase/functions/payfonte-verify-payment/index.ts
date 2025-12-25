// Supabase Edge Function: payfonte-verify-payment
// Vérifie le statut d'un paiement auprès de l'API Payfonte

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYFONTE_CLIENT_ID = Deno.env.get('PAYFONTE_CLIENT_ID')!
const PAYFONTE_CLIENT_SECRET = Deno.env.get('PAYFONTE_CLIENT_SECRET')!
const PAYFONTE_ENV = Deno.env.get('PAYFONTE_ENV') || 'sandbox'

const PAYFONTE_VERIFY_URL = PAYFONTE_ENV === 'production'
  ? 'https://api.payfonte.com/payments/v1/verify'
  : 'https://sandbox-api.payfonte.com/payments/v1/verify'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: { message: 'Non autorisé' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer la référence
    const body = await req.json()
    const { reference } = body

    if (!reference) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Référence manquante' }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔍 Vérification paiement - Reference:', reference)

    // Appeler l'API de vérification Payfonte
    const payfonteResponse = await fetch(`${PAYFONTE_VERIFY_URL}/${reference}`, {
      method: 'GET',
      headers: {
        'client-id': PAYFONTE_CLIENT_ID,
        'client-secret': PAYFONTE_CLIENT_SECRET,
        'Content-Type': 'application/json',
      },
    })

    const payfonteData = await payfonteResponse.json()

    if (!payfonteResponse.ok) {
      console.error('❌ Erreur Payfonte:', payfonteData)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: payfonteData.message || 'Erreur lors de la vérification',
            code: payfonteData.code
          }
        }),
        { status: payfonteResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Paiement vérifié:', payfonteData.data)

    return new Response(
      JSON.stringify({
        success: true,
        data: payfonteData.data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Exception:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: error.message || 'Erreur serveur' }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


