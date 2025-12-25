// Supabase Edge Function: payfonte-webhook
// Gère les webhooks de Payfonte pour mettre à jour automatiquement les transactions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    console.log('📨 Webhook Payfonte reçu')

    // Parse le body du webhook
    const webhookData = await req.json()
    console.log('📦 Données webhook:', JSON.stringify(webhookData, null, 2))

    const {
      reference,
      status,
      amount,
      currency,
      customer,
      paidAt,
      id: payfonteId
    } = webhookData

    if (!reference) {
      console.error('❌ Référence manquante dans le webhook')
      return new Response(
        JSON.stringify({ error: 'Référence manquante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Créer un client Supabase avec la clé service (bypass RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Récupérer la transaction existante
    const { data: transaction, error: fetchError } = await supabase
      .from('credits_transactions')
      .select('*')
      .eq('reference', reference)
      .single()

    if (fetchError) {
      console.error('❌ Transaction non trouvée:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Transaction non trouvée' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('💳 Transaction trouvée:', transaction.id)

    // Traiter selon le statut
    if (status === 'success' && transaction.status !== 'completed') {
      console.log('✅ Paiement réussi - Créditation du compte')

      // Mettre à jour la transaction
      const { error: updateTransError } = await supabase
        .from('credits_transactions')
        .update({
          status: 'completed',
          metadata: {
            ...transaction.metadata,
            payfonte_paid_at: paidAt,
            payfonte_customer: customer
          }
        })
        .eq('id', transaction.id)

      if (updateTransError) {
        console.error('❌ Erreur mise à jour transaction:', updateTransError)
      }

      // Créditer l'utilisateur
      const creditsToAdd = transaction.metadata?.credits || transaction.amount

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', transaction.user_id)
        .single()

      if (!profileError && profile) {
        const newCredits = (profile.credits || 0) + creditsToAdd

        const { error: updateCreditsError } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', transaction.user_id)

        if (updateCreditsError) {
          console.error('❌ Erreur créditation:', updateCreditsError)
        } else {
          console.log(`✅ Utilisateur ${transaction.user_id} crédité de ${creditsToAdd} crédits`)
        }
      }

    } else if (status === 'failed' || status === 'cancelled') {
      console.log('❌ Paiement échoué/annulé')

      // Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('credits_transactions')
        .update({
          status: status === 'failed' ? 'failed' : 'cancelled',
          metadata: {
            ...transaction.metadata,
            payfonte_failed_at: new Date().toISOString()
          }
        })
        .eq('id', transaction.id)

      if (updateError) {
        console.error('❌ Erreur mise à jour transaction:', updateError)
      }
    }

    console.log('✅ Webhook traité avec succès')

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook traité' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Exception webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})


