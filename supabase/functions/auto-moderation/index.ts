// ================================================================
// EDGE FUNCTION: AUTO-MODÉRATION DES ANNONCES
// ================================================================
// À appeler périodiquement (toutes les 5-10 minutes) pour approuver
// automatiquement les annonces valides en attente depuis >5 min
// ================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Vérifier l'authentification (optionnel: utiliser une clé secrète)
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('x-api-key');
    
    // Pour sécuriser, vérifier une clé API custom (à définir dans Supabase Dashboard > Edge Functions > Secrets)
    const CRON_SECRET = Deno.env.get('CRON_SECRET');
    if (CRON_SECRET && apiKey !== CRON_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer un client Supabase avec les credentials service_role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🤖 Auto-modération: démarrage...');

    // Appeler la fonction SQL d'auto-approbation
    const { data, error } = await supabase.rpc('auto_approve_pending_listings');

    if (error) {
      console.error('❌ Erreur auto-modération:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = data && data.length > 0 ? data[0] : { approved_count: 0, rejected_count: 0, details: [] };

    console.log(`✅ Auto-modération terminée: ${result.approved_count} approuvées, ${result.rejected_count} rejetées`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        approved: result.approved_count || 0,
        rejected: result.rejected_count || 0,
        details: result.details || []
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('💥 Exception auto-modération:', err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
