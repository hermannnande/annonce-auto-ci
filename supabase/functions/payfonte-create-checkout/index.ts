// Supabase Edge Function: payfonte-create-checkout
// Cette fonction sécurise les appels à l'API Payfonte en utilisant les secrets côté serveur

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = new Set([
  'https://www.annonceauto.ci',
  'https://annonceauto.ci',
  'http://localhost:5173',
  'http://localhost:5174',
])

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: getCorsHeaders(req) })
  }

  try {
    const corsHeaders = getCorsHeaders(req)

    const PAYFONTE_CLIENT_ID = Deno.env.get('PAYFONTE_CLIENT_ID')
    const PAYFONTE_CLIENT_SECRET = Deno.env.get('PAYFONTE_CLIENT_SECRET')
    const PAYFONTE_ENV = Deno.env.get('PAYFONTE_ENV') || 'sandbox'
    const PAYFONTE_WEBHOOK_URL = Deno.env.get('PAYFONTE_WEBHOOK_URL')

    if (!PAYFONTE_CLIENT_ID || !PAYFONTE_CLIENT_SECRET || !PAYFONTE_WEBHOOK_URL) {
      console.error('❌ Secrets Payfonte manquants (PAYFONTE_CLIENT_ID / PAYFONTE_CLIENT_SECRET / PAYFONTE_WEBHOOK_URL)')
      return new Response(
        JSON.stringify({ success: false, error: { message: 'Configuration paiement manquante côté serveur' } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const PAYFONTE_API_URL = PAYFONTE_ENV === 'production'
      ? 'https://api.payfonte.com/payments/v1/checkouts'
      : 'https://sandbox-api.payfonte.com/payments/v1/checkouts'

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: { message: 'Non autorisé' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
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

    // Sauvegarder la transaction dans la base (schéma réel: credits_transactions)
    // Ici on enregistre un achat en "pending" (le webhook confirmera et créditera le solde).
    // Comme `balance_after` est NOT NULL, on met le solde actuel (inchangé tant que le paiement n'est pas confirmé).
    const { data: profileRow, error: profileErr } = await supabaseClient
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    const currentCredits = !profileErr && profileRow ? (profileRow.credits || 0) : 0

    const { error: insertError } = await supabaseClient
      .from('credits_transactions')
      .insert({
        user_id: user.id,
        amount: metadata.credits || 0, // nombre de crédits achetés
        balance_after: currentCredits,
        type: 'purchase',
        description: narration || `Recharge crédits (${metadata.credits || 0})`,
        payment_method: 'payfonte',
        payment_reference: reference,
        payment_status: 'pending',
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
      { status: 500, headers: { ...(getCorsHeaders(req)), 'Content-Type': 'application/json' } }
    )
  }
})




