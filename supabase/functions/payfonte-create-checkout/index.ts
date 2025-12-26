// Supabase Edge Function: payfonte-create-checkout
// Cette fonction sécurise les appels à l'API Payfonte en utilisant les secrets côté serveur

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYFONTE_CLIENT_ID = Deno.env.get('PAYFONTE_CLIENT_ID')!
const PAYFONTE_CLIENT_SECRET = Deno.env.get('PAYFONTE_CLIENT_SECRET')!
const PAYFONTE_ENV = Deno.env.get('PAYFONTE_ENV') || 'sandbox'
const PAYFONTE_WEBHOOK_URL = Deno.env.get('PAYFONTE_WEBHOOK_URL')!

const PAYFONTE_API_URL = PAYFONTE_ENV === 'production'
  ? 'https://api.payfonte.com/payments/v1/checkouts'
  : 'https://sandbox-api.payfonte.com/payments/v1/checkouts'

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

    // Récupérer les paramètres
    const body = await req.json()
    const {
      reference,
      amount,
      currency,
      country,
      user: payfonteUser,
      narration,
      redirectURL,
      customerBearsCharge = false,
      metadata = {}
    } = body

    // Validation
    if (!reference || !amount || !currency || !country || !payfonteUser || !redirectURL) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Paramètres manquants' }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('📤 Appel API Payfonte - Reference:', reference)

    // Appeler l'API Payfonte
    const payfonteResponse = await fetch(PAYFONTE_API_URL, {
      method: 'POST',
      headers: {
        'client-id': PAYFONTE_CLIENT_ID,
        'client-secret': PAYFONTE_CLIENT_SECRET,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference,
        amount,
        currency,
        country,
        redirectURL,
        customerBearsCharge,
        webhook: PAYFONTE_WEBHOOK_URL,
        user: payfonteUser,
        narration,
      }),
    })

    const payfonteData = await payfonteResponse.json()

    if (!payfonteResponse.ok) {
      console.error('❌ Erreur Payfonte:', payfonteData)
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: payfonteData.message || 'Erreur lors de la création du checkout',
            code: payfonteData.code
          }
        }),
        { status: payfonteResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Checkout créé avec succès:', payfonteData.data?.reference)

    // Sauvegarder la transaction dans la base
    const { error: insertError } = await supabaseClient
      .from('credits_transactions')
      .insert({
        user_id: user.id,
        amount: metadata.credits || 0,
        type: 'pending',
        reference: reference,
        status: 'pending',
        description: narration,
        metadata: {
          ...metadata,
          payfonte_id: payfonteData.data?.id,
          payfonte_url: payfonteData.data?.url
        }
      })

    if (insertError) {
      console.error('⚠️ Erreur sauvegarde transaction:', insertError)
    }

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




