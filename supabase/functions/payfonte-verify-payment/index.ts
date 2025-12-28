// Supabase Edge Function: payfonte-verify-payment
// Vérifie le statut d'un paiement auprès de l'API Payfonte

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!PAYFONTE_CLIENT_ID || !PAYFONTE_CLIENT_SECRET) {
      console.error('❌ Secrets Payfonte manquants (PAYFONTE_CLIENT_ID / PAYFONTE_CLIENT_SECRET)')
      return new Response(
        JSON.stringify({ success: false, error: { message: 'Configuration paiement manquante côté serveur' } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const PAYFONTE_VERIFY_URL = PAYFONTE_ENV === 'production'
      ? 'https://api.payfonte.com/payments/v1/verify'
      : 'https://sandbox-api.payfonte.com/payments/v1/verify'

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: { message: 'Non autorisé' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: { message: 'Non autorisé' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Client service role (bypass RLS) pour finaliser la transaction si besoin
    const serviceClient = SUPABASE_SERVICE_ROLE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null

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

    // =========================
    // Fallback webhook: finaliser la transaction si Payfonte dit success
    // =========================
    try {
      const payStatus = (payfonteData?.data?.status || payfonteData?.data?.paymentStatus || '').toString().toLowerCase()

      // On n'essaye de finaliser que si on a la clé service role
      if (serviceClient && reference) {
        const { data: tx, error: txErr } = await serviceClient
          .from('credits_transactions')
          .select('*')
          .eq('payment_reference', reference)
          .maybeSingle()

        if (txErr) {
          console.error('⚠️ Impossible de récupérer la transaction (service):', txErr)
        } else if (tx) {
          // Sécurité: la transaction doit appartenir au user connecté
          if (tx.user_id !== user.id) {
            return new Response(
              JSON.stringify({ success: false, error: { message: 'Non autorisé' } }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Idempotent
          if (tx.payment_status === 'completed') {
            console.log('ℹ️ Transaction déjà complétée, rien à faire')
          } else if (payStatus === 'success') {
            // Créditer le compte
            const { data: profileRow, error: profileErr } = await serviceClient
              .from('profiles')
              .select('credits')
              .eq('id', tx.user_id)
              .single()

            if (profileErr) {
              console.error('⚠️ Impossible de lire le profil (service):', profileErr)
            } else {
              const current = profileRow?.credits || 0
              const creditsToAdd = tx.amount || 0
              const newCredits = current + creditsToAdd

              const { error: updProfileErr } = await serviceClient
                .from('profiles')
                .update({ credits: newCredits })
                .eq('id', tx.user_id)

              if (updProfileErr) {
                console.error('⚠️ Impossible de créditer le profil:', updProfileErr)
              } else {
                await serviceClient
                  .from('credits_transactions')
                  .update({
                    payment_status: 'completed',
                    balance_after: newCredits,
                    metadata: {
                      ...(tx.metadata || {}),
                      payfonte_verify: payfonteData?.data ?? payfonteData,
                      fallback_completed_at: new Date().toISOString(),
                    },
                  })
                  .eq('id', tx.id)

                console.log('✅ Transaction finalisée via verify-payment fallback:', tx.id)
              }
            }
          } else if (payStatus === 'failed' || payStatus === 'cancelled') {
            await serviceClient
              .from('credits_transactions')
              .update({
                payment_status: 'failed',
                metadata: {
                  ...(tx.metadata || {}),
                  payfonte_verify: payfonteData?.data ?? payfonteData,
                  fallback_failed_at: new Date().toISOString(),
                },
              })
              .eq('id', tx.id)

            console.log('ℹ️ Transaction marquée failed via verify-payment fallback:', tx.id)
          }
        }
      }
    } catch (finalizeErr) {
      console.error('⚠️ Erreur fallback finalisation:', finalizeErr)
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




