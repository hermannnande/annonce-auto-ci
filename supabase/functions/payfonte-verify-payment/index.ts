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

    const PAYFONTE_BASE_URL = PAYFONTE_ENV === 'production'
      ? 'https://api.payfonte.com'
      : 'https://sandbox-api.payfonte.com'

    const VERIFY_URLS = [
      // endpoint "verify" (si supporté)
      `${PAYFONTE_BASE_URL}/payments/v1/verify/${reference}`,
      // fallback: endpoint checkouts (souvent utilisé pour retrouver le statut d’un checkout)
      `${PAYFONTE_BASE_URL}/payments/v1/checkouts/${reference}`,
    ]

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

    const headers = {
      'client-id': PAYFONTE_CLIENT_ID,
      'client-secret': PAYFONTE_CLIENT_SECRET,
      'Content-Type': 'application/json',
    }

    let payfonteData: any = null
    let lastStatus = 0
    let lastText = ''
    let usedUrl: string | null = null

    for (const url of VERIFY_URLS) {
      try {
        const resp = await fetch(url, { method: 'GET', headers })
        lastStatus = resp.status
        lastText = await resp.text()
        usedUrl = url

        const parsed = (() => {
          try { return JSON.parse(lastText) } catch { return null }
        })()

        if (resp.ok) {
          payfonteData = parsed
          break
        }

        console.warn('⚠️ Payfonte verify non-ok:', { url, status: resp.status, body: parsed ?? lastText?.slice(0, 500) })
      } catch (e) {
        console.error('⚠️ Payfonte verify exception:', { url, error: e?.message || String(e) })
      }
    }

    if (!payfonteData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Impossible de vérifier le paiement Payfonte pour le moment',
            code: 'PAYFONTE_VERIFY_FAILED',
            status: lastStatus || null,
            url: usedUrl,
          },
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Paiement vérifié:', payfonteData?.data ?? payfonteData)

    // =========================
    // Fallback webhook: finaliser la transaction si Payfonte dit success
    // =========================
    let finalized = false
    let finalizedNewCredits: number | null = null
    let txStatus: string | null = null
    try {
      const payStatusRaw = (payfonteData?.data?.status || payfonteData?.data?.paymentStatus || payfonteData?.data?.state || '').toString()
      const payStatus = payStatusRaw.toLowerCase()
      const isSuccess = payStatus.includes('succ') || payStatus === 'paid' || payStatus === 'completed'
      const isFailed = payStatus.includes('fail') || payStatus.includes('cancel')
      const pfAmountRaw = payfonteData?.data?.amount
      const pfAmount = typeof pfAmountRaw === 'number' ? pfAmountRaw : Number(pfAmountRaw || 0)

      // On n'essaye de finaliser que si on a la clé service role
      if (serviceClient && reference) {
        let { data: txRows, error: txErr } = await serviceClient
          .from('credits_transactions')
          .select('*')
          .eq('payment_reference', reference)
          .order('created_at', { ascending: false })
          .limit(1)

        if (txErr) {
          console.error('⚠️ Impossible de récupérer la transaction (service):', txErr)
        }

        // Si la transaction n'existe pas, on la recrée (fallback) à partir du montant Payfonte
        if ((!txRows || txRows.length === 0) && isSuccess) {
          // Heuristique XOF: parfois Payfonte renvoie amount en unités *100
          const fcfa = (pfAmount >= 10000 && pfAmount % 100 === 0) ? Math.floor(pfAmount / 100) : pfAmount
          const credits = Math.max(0, Math.floor((fcfa || 0) / 100))

          const { data: profileRow, error: profileErr } = await serviceClient
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single()

          const currentCredits = !profileErr && profileRow ? (profileRow.credits || 0) : 0

          const { data: newTx, error: insErr } = await serviceClient
            .from('credits_transactions')
            .insert({
              user_id: user.id,
              amount: credits,
              balance_after: currentCredits,
              type: 'purchase',
              description: `Recharge crédits Payfonte (${credits})`,
              payment_method: 'payfonte',
              payment_reference: reference,
              payment_status: 'pending',
            })
            .select('*')
            .single()

          if (insErr) {
            console.error('⚠️ Impossible de recréer la transaction (service):', insErr)
          } else {
            txRows = [newTx]
            console.log('✅ Transaction recréée via verify-payment:', newTx.id)
          }
        }

        if (txRows && txRows.length > 0) {
          const tx = txRows[0] as any
          txStatus = tx?.payment_status ?? null
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
            finalized = true
          } else if (isSuccess) {
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
                  })
                  .eq('id', tx.id)

                console.log('✅ Transaction finalisée via verify-payment fallback:', tx.id)
                finalized = true
                finalizedNewCredits = newCredits
                txStatus = 'completed'
              }
            }
          } else if (isFailed) {
            await serviceClient
              .from('credits_transactions')
              .update({
                payment_status: 'failed',
              })
              .eq('id', tx.id)

            console.log('ℹ️ Transaction marquée failed via verify-payment fallback:', tx.id)
            txStatus = 'failed'
          }
        } else {
          console.warn('⚠️ Aucune transaction trouvée pour la référence (service):', reference)
        }
      }
    } catch (finalizeErr) {
      console.error('⚠️ Erreur fallback finalisation:', finalizeErr)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: payfonteData.data,
        finalize: {
          attempted: Boolean(serviceClient),
          finalized,
          tx_status: txStatus,
          new_credits: finalizedNewCredits,
        }
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




