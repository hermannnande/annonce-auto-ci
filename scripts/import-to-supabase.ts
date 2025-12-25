import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importData() {
  try {
    console.log('🚀 Début de l\'import vers Supabase...\n');
    const backupPath = process.argv[2] || './backup.json';
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Fichier introuvable: ${backupPath}`);
    }
    
    const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    
    console.log('📊 Données à importer:');
    console.log(`   👤 Utilisateur: ${data.currentUser?.email || 'Aucun'}`);
    console.log(`   📝 Annonces: ${data.listings?.length || 0}`);
    console.log(`   ❤️  Favoris: ${data.favorites?.length || 0}\n`);
    
    if (data.currentUser) {
      console.log('👤 Import du profil utilisateur...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.currentUser.email,
        password: 'MotDePasseTemporaire123!',
        email_confirm: true
      });
      
      if (authError && authError.message !== 'User already registered') {
        throw authError;
      }
      
      const userId = authData?.user?.id || data.currentUser.id;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: data.currentUser.email,
          full_name: data.currentUser.profile?.name || 'Utilisateur',
          phone: data.currentUser.profile?.phone || '+225 00 00 00 00 00',
          user_type: data.currentUser.profile?.user_type || 'vendor',
          credits: 100,
          verified: true
        });
      
      if (profileError) {
        console.error('❌ Erreur profil:', profileError.message);
      } else {
        console.log('✅ Profil importé: ' + data.currentUser.email);
      }
      data.importedUserId = userId;
    }
    
    console.log('');
    
    if (data.listings && data.listings.length > 0) {
      console.log(`📝 Import de ${data.listings.length} annonces...`);
      let successCount = 0;
      let errorCount = 0;
      
      for (const listing of data.listings) {
        try {
          const { error } = await supabase
            .from('listings')
            .insert({
              id: listing.id,
              user_id: data.importedUserId || listing.user_id,
              title: listing.title,
              brand: listing.brand,
              model: listing.model,
              year: listing.year,
              price: listing.price,
              location: listing.location,
              description: listing.description,
              mileage: listing.mileage,
              fuel_type: listing.fuel_type,
              transmission: listing.transmission,
              condition: listing.condition,
              doors: listing.doors,
              color: listing.color,
              images: listing.images || [],
              status: listing.status || 'pending',
              views: listing.views || 0,
              is_boosted: listing.is_boosted || false,
              featured: listing.featured || false,
              created_at: listing.created_at,
              updated_at: listing.updated_at
            });
          
          if (error) {
            if (error.code === '23505') {
              console.log(`⚠️  Annonce déjà existante: ${listing.title}`);
            } else {
              throw error;
            }
          } else {
            console.log(`✅ Importé: ${listing.title}`);
            successCount++;
          }
        } catch (err: any) {
          console.error(`❌ Erreur pour "${listing.title}": ${err.message}`);
          errorCount++;
        }
      }
      console.log(`\n📊 Résumé annonces: ${successCount} réussies, ${errorCount} erreurs\n`);
    }
    
    if (data.favorites && data.favorites.length > 0 && data.importedUserId) {
      console.log(`❤️  Import de ${data.favorites.length} favoris...`);
      for (const listingId of data.favorites) {
        try {
          const { error } = await supabase
            .from('favorites')
            .insert({
              user_id: data.importedUserId,
              listing_id: listingId
            });
          
          if (error && error.code !== '23505') {
            console.error(`❌ Erreur favori: ${error.message}`);
          } else {
            console.log(`✅ Favori ajouté: ${listingId.substring(0, 8)}...`);
          }
        } catch (err: any) {
          console.error(`❌ Erreur favori: ${err.message}`);
        }
      }
    }
    
    console.log('\n🎉 Import terminé avec succès !\n');
    
    const { data: stats } = await supabase
      .from('listings')
      .select('status, count', { count: 'exact' });
    
    console.log('📊 Statistiques Supabase:');
    console.log(`   Total annonces: ${stats?.length || 0}`);
    
  } catch (error: any) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    process.exit(1);
  }
}

importData();





