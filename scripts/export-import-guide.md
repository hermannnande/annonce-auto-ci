# 📦 GUIDE EXPORT/IMPORT DES DONNÉES
## AnnonceAuto.CI - localStorage → Supabase

---

## 🎯 OBJECTIF

Ce guide vous permet de :
1. **Exporter** toutes les données localStorage vers un fichier JSON
2. **Importer** ces données vers Supabase
3. **Sauvegarder** régulièrement vos données
4. **Restaurer** en cas de problème

---

## 📥 ÉTAPE 1 : EXPORT DES DONNÉES

### Méthode A : Via la console navigateur (RAPIDE)

1. **Ouvrir l'application** dans votre navigateur
2. **Ouvrir la console DevTools** (F12 ou Cmd+Option+I sur Mac)
3. **Copier/coller le script suivant :**

```javascript
// ========================================
// SCRIPT D'EXPORT ANNONCEAUTO.CI
// ========================================

function exportAnnonceAutoData() {
  console.log('🚀 Début de l\'export...');
  
  // Récupérer toutes les données localStorage
  const data = {
    // Métadonnées export
    exportedAt: new Date().toISOString(),
    version: '1.0',
    source: 'localStorage',
    
    // Utilisateur connecté
    user: localStorage.getItem('annonceauto_user') 
      ? JSON.parse(localStorage.getItem('annonceauto_user')) 
      : null,
    
    // Annonces
    listings: localStorage.getItem('annonceauto_demo_listings')
      ? JSON.parse(localStorage.getItem('annonceauto_demo_listings'))
      : [],
    
    // Favoris
    favorites: localStorage.getItem('annonceauto_favorites')
      ? JSON.parse(localStorage.getItem('annonceauto_favorites'))
      : [],
    
    // Vues trackées
    views: localStorage.getItem('annonceauto_views')
      ? JSON.parse(localStorage.getItem('annonceauto_views'))
      : {}
  };
  
  // Statistiques
  console.log('📊 Statistiques de l\'export:');
  console.log(`   👤 Utilisateur: ${data.user ? data.user.email : 'Aucun'}`);
  console.log(`   📝 Annonces: ${data.listings.length}`);
  console.log(`   ❤️  Favoris: ${data.favorites.length}`);
  console.log(`   👁️  Vues trackées: ${Object.keys(data.views).length}`);
  
  // Créer un Blob JSON
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Créer un lien de téléchargement
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `annonceauto-backup-${Date.now()}.json`;
  
  // Déclencher le téléchargement
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Nettoyer
  URL.revokeObjectURL(url);
  
  console.log('✅ Export terminé ! Fichier téléchargé.');
  console.log(`📦 Taille: ${(blob.size / 1024).toFixed(2)} KB`);
  
  return data;
}

// Exécuter l'export
exportAnnonceAutoData();
```

4. **Appuyer sur Enter**
5. **Le fichier JSON se télécharge automatiquement** → `annonceauto-backup-1234567890.json`

---

### Méthode B : Via un fichier HTML dédié

Créer un fichier `export.html` :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Export AnnonceAuto.CI</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background: #f3f4f6;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    h1 {
      color: #0F172A;
      margin-bottom: 20px;
    }
    button {
      background: #FACC15;
      color: #0F172A;
      border: none;
      padding: 15px 30px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
    }
    button:hover {
      background: #F59E0B;
    }
    .stats {
      margin-top: 20px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      display: none;
    }
    .stats.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📦 Export des données AnnonceAuto.CI</h1>
    <p>Cliquez sur le bouton ci-dessous pour télécharger toutes vos données au format JSON.</p>
    
    <button onclick="exportData()">🚀 Exporter mes données</button>
    
    <div id="stats" class="stats">
      <h3>✅ Export réussi !</h3>
      <p id="statsContent"></p>
    </div>
  </div>
  
  <script>
    function exportData() {
      const data = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        source: 'localStorage',
        user: localStorage.getItem('annonceauto_user') 
          ? JSON.parse(localStorage.getItem('annonceauto_user')) 
          : null,
        listings: localStorage.getItem('annonceauto_demo_listings')
          ? JSON.parse(localStorage.getItem('annonceauto_demo_listings'))
          : [],
        favorites: localStorage.getItem('annonceauto_favorites')
          ? JSON.parse(localStorage.getItem('annonceauto_favorites'))
          : [],
        views: localStorage.getItem('annonceauto_views')
          ? JSON.parse(localStorage.getItem('annonceauto_views'))
          : {}
      };
      
      // Télécharger
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annonceauto-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Afficher les stats
      const stats = document.getElementById('stats');
      const statsContent = document.getElementById('statsContent');
      statsContent.innerHTML = `
        <strong>👤 Utilisateur:</strong> ${data.user ? data.user.email : 'Aucun'}<br>
        <strong>📝 Annonces:</strong> ${data.listings.length}<br>
        <strong>❤️ Favoris:</strong> ${data.favorites.length}<br>
        <strong>📦 Taille:</strong> ${(blob.size / 1024).toFixed(2)} KB
      `;
      stats.classList.add('show');
    }
  </script>
</body>
</html>
```

**Usage :**
1. Ouvrir `export.html` dans le navigateur
2. Cliquer sur "Exporter mes données"
3. Le fichier JSON se télécharge

---

## 📤 ÉTAPE 2 : IMPORT VERS SUPABASE

### Prérequis
- Node.js installé
- Projet Supabase créé
- Variables d'environnement configurées

### Installation des dépendances

```bash
npm install --save-dev tsx @supabase/supabase-js dotenv
```

### Créer le fichier `.env.local`

```bash
# Credentials Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# ⚠️ CLÉ SERVICE (ADMIN) - NE JAMAIS COMMITER
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

⚠️ **IMPORTANT :** La `SUPABASE_SERVICE_KEY` se trouve dans :  
Supabase Dashboard → Settings → API → `service_role key` (secret)

---

### Script d'import

Créer `/scripts/import-to-supabase.ts` :

```typescript
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes !');
  process.exit(1);
}

// Créer le client Supabase avec la clé service (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importData() {
  try {
    console.log('🚀 Début de l\'import vers Supabase...\n');
    
    // 1. Lire le fichier JSON
    const backupPath = process.argv[2] || './backup.json';
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Fichier introuvable: ${backupPath}`);
    }
    
    const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    
    console.log('📊 Données à importer:');
    console.log(`   👤 Utilisateur: ${data.user?.email || 'Aucun'}`);
    console.log(`   📝 Annonces: ${data.listings?.length || 0}`);
    console.log(`   ❤️  Favoris: ${data.favorites?.length || 0}\n`);
    
    // 2. Importer le profil utilisateur
    if (data.user) {
      console.log('👤 Import du profil utilisateur...');
      
      // Créer le compte auth d'abord
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.user.email,
        password: 'MotDePasseTemporaire123!', // À changer par l'utilisateur
        email_confirm: true
      });
      
      if (authError && authError.message !== 'User already registered') {
        throw authError;
      }
      
      const userId = authData?.user?.id || data.user.id;
      
      // Créer/Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: data.user.email,
          full_name: data.user.profile?.name || 'Utilisateur',
          phone: data.user.profile?.phone || '+225 00 00 00 00 00',
          user_type: data.user.profile?.user_type || 'vendor',
          credits: 100, // Bonus de bienvenue
          verified: true
        });
      
      if (profileError) {
        console.error('❌ Erreur profil:', profileError.message);
      } else {
        console.log('✅ Profil importé: ' + data.user.email);
      }
      
      // Sauvegarder l'userId pour les annonces
      data.importedUserId = userId;
    }
    
    console.log(''); // Saut de ligne
    
    // 3. Importer les annonces
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
    
    // 4. Importer les favoris
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
          
          if (error && error.code !== '23505') { // Ignorer duplicates
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
    
    // 5. Afficher les statistiques finales
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

// Exécuter l'import
importData();
```

---

### Exécuter l'import

```bash
# Avec le fichier par défaut (backup.json)
npx tsx scripts/import-to-supabase.ts

# Avec un fichier spécifique
npx tsx scripts/import-to-supabase.ts ./annonceauto-backup-1234567890.json
```

---

## 🔄 ÉTAPE 3 : BACKUP RÉGULIER

### Script de backup automatique

Créer `/scripts/auto-backup.ts` :

```typescript
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function createBackup() {
  console.log('🚀 Création du backup Supabase...\n');
  
  // Récupérer toutes les données
  const { data: profiles } = await supabase.from('profiles').select('*');
  const { data: listings } = await supabase.from('listings').select('*');
  const { data: favorites } = await supabase.from('favorites').select('*');
  const { data: transactions } = await supabase.from('credits_transactions').select('*');
  
  const backup = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    source: 'supabase',
    profiles,
    listings,
    favorites,
    transactions
  };
  
  // Sauvegarder dans un fichier
  const filename = `backup-supabase-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
  
  console.log('✅ Backup créé:', filename);
  console.log(`📊 ${profiles?.length || 0} profils`);
  console.log(`📝 ${listings?.length || 0} annonces`);
  console.log(`❤️  ${favorites?.length || 0} favoris`);
}

createBackup();
```

**Exécution :**
```bash
npx tsx scripts/auto-backup.ts
```

---

### Automatiser avec cron (Linux/Mac)

```bash
# Éditer la crontab
crontab -e

# Ajouter cette ligne pour backup quotidien à 2h du matin
0 2 * * * cd /chemin/vers/annonceauto && npx tsx scripts/auto-backup.ts
```

---

## 🆘 ÉTAPE 4 : RESTAURATION D'URGENCE

### Si Supabase a un problème

1. **Exporter immédiatement les données :**
```bash
npx tsx scripts/auto-backup.ts
```

2. **Revenir au mode localStorage :**

```typescript
// Dans /src/lib/supabase.ts
export const USE_SUPABASE = false; // Passer à false

// L'app utilisera localStorage en fallback
```

3. **Importer le backup localStorage :**

```javascript
// Dans la console navigateur
const backup = /* coller le contenu du JSON */;

localStorage.setItem('annonceauto_user', JSON.stringify(backup.user));
localStorage.setItem('annonceauto_demo_listings', JSON.stringify(backup.listings));
localStorage.setItem('annonceauto_favorites', JSON.stringify(backup.favorites));

console.log('✅ Données restaurées !');
```

---

## 📊 VÉRIFICATION DES DONNÉES

### Script de comparaison localStorage ↔ Supabase

```typescript
// /scripts/compare-data.ts

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function compareData() {
  // Lire le backup localStorage
  const localData = JSON.parse(fs.readFileSync('./backup.json', 'utf-8'));
  
  // Récupérer les données Supabase
  const { data: supabaseListings } = await supabase
    .from('listings')
    .select('*');
  
  console.log('📊 COMPARAISON DES DONNÉES\n');
  console.log(`localStorage: ${localData.listings.length} annonces`);
  console.log(`Supabase: ${supabaseListings?.length || 0} annonces\n`);
  
  // Vérifier les différences
  const localIds = new Set(localData.listings.map((l: any) => l.id));
  const supabaseIds = new Set(supabaseListings?.map(l => l.id) || []);
  
  const missingInSupabase = [...localIds].filter(id => !supabaseIds.has(id));
  const missingInLocal = [...supabaseIds].filter(id => !localIds.has(id));
  
  if (missingInSupabase.length > 0) {
    console.log(`⚠️  ${missingInSupabase.length} annonces manquantes dans Supabase`);
  }
  
  if (missingInLocal.length > 0) {
    console.log(`⚠️  ${missingInLocal.length} annonces manquantes dans localStorage`);
  }
  
  if (missingInSupabase.length === 0 && missingInLocal.length === 0) {
    console.log('✅ Données synchronisées !');
  }
}

compareData();
```

---

## 🔧 TROUBLESHOOTING

### Problème : "User already registered"
**Solution :** L'email existe déjà dans Supabase Auth. Utilisez l'UUID existant.

### Problème : "duplicate key value violates unique constraint"
**Solution :** L'annonce existe déjà. Le script skip automatiquement.

### Problème : "row-level security policy violation"
**Solution :** Utilisez la `SUPABASE_SERVICE_KEY` (pas l'ANON_KEY).

### Problème : "relation does not exist"
**Solution :** Exécutez d'abord la migration SQL `001_initial_schema.sql`.

---

## ✅ CHECKLIST FINALE

- [ ] Export localStorage créé (`backup.json`)
- [ ] Backup sauvegardé en lieu sûr (cloud, USB, etc.)
- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] Migration SQL exécutée dans Supabase
- [ ] Script d'import exécuté avec succès
- [ ] Données vérifiées dans Supabase Dashboard
- [ ] Backup automatique configuré (optionnel)
- [ ] Plan de restauration testé

---

**Date :** 22 Décembre 2024  
**Version :** 1.0  
**Support :** cursor-ai-guide@annonceauto.ci
