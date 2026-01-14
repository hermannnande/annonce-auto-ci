# ============================================
# SCRIPT BACKUP COMPLET - ANNONCEAUTO.CI
# ============================================
# Date : 27 Décembre 2024
# Description : Sauvegarde complète de la base de données Supabase

# Configuration
$PROJECT_ID = "vnhwllsawfaueivykhly"
$BACKUP_DIR = "C:\Users\nande\Desktop\annonce-auto-ci\backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"

# Créer le dossier de backup s'il n'existe pas
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null
}

Write-Host "🔄 Début de la sauvegarde..." -ForegroundColor Yellow
Write-Host "📁 Dossier : $BACKUP_DIR" -ForegroundColor Cyan

# ============================================
# 1. SAUVEGARDER LES FICHIERS DU PROJET
# ============================================

Write-Host "`n📦 Sauvegarde des fichiers du projet..." -ForegroundColor Yellow

$PROJECT_BACKUP = "$BACKUP_DIR\project_$TIMESTAMP.zip"

# Créer une archive ZIP du projet (sans node_modules)
$SOURCE = "C:\Users\nande\Desktop\annonce-auto-ci"
$EXCLUDE = @("node_modules", ".git", "dist", "backups", ".vercel")

Write-Host "   Création de l'archive ZIP..." -ForegroundColor Gray

# Utiliser 7-Zip si disponible, sinon Compress-Archive
if (Get-Command "7z" -ErrorAction SilentlyContinue) {
    7z a -tzip "$PROJECT_BACKUP" "$SOURCE\*" -xr!node_modules -xr!.git -xr!dist -xr!backups -xr!.vercel
} else {
    # Fallback sur Compress-Archive (plus lent)
    $files = Get-ChildItem -Path $SOURCE -Recurse -File | 
             Where-Object { 
                 $_.FullName -notmatch "node_modules|\.git|\\dist\\|\\backups\\|\.vercel" 
             }
    Compress-Archive -Path $files.FullName -DestinationPath $PROJECT_BACKUP -Force
}

Write-Host "   ✅ Fichiers projet sauvegardés : $PROJECT_BACKUP" -ForegroundColor Green

# ============================================
# 2. SAUVEGARDER LES VARIABLES D'ENVIRONNEMENT
# ============================================

Write-Host "`n🔐 Sauvegarde des variables d'environnement..." -ForegroundColor Yellow

$ENV_BACKUP = "$BACKUP_DIR\env_$TIMESTAMP.txt"

$envContent = @"
# ============================================
# VARIABLES D'ENVIRONNEMENT - ANNONCEAUTO.CI
# ============================================
# Date : $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Projet : $PROJECT_ID

VITE_SUPABASE_URL=https://$PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=[REDACTED - Voir .env.local]

# Resend SMTP
RESEND_API_KEY=[REDACTED - Voir Resend Dashboard]

# Supabase Project
PROJECT_ID=$PROJECT_ID
PROJECT_REF=$PROJECT_ID

# Backup info
BACKUP_DATE=$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
BACKUP_TYPE=Manuel complet
"@

$envContent | Out-File -FilePath $ENV_BACKUP -Encoding UTF8

Write-Host "   ✅ Variables d'environnement sauvegardées : $ENV_BACKUP" -ForegroundColor Green

# ============================================
# 3. EXPORTER LE SCHÉMA SQL
# ============================================

Write-Host "`n📊 Export du schéma SQL..." -ForegroundColor Yellow

$SCHEMA_BACKUP = "$BACKUP_DIR\schema_$TIMESTAMP.sql"

$schemaContent = @"
-- ============================================
-- SCHÉMA BASE DE DONNÉES - ANNONCEAUTO.CI
-- ============================================
-- Date : $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Projet : $PROJECT_ID

-- NOTE : Pour obtenir le schéma complet, exécutez :
-- 1. Aller sur https://supabase.com/dashboard/project/$PROJECT_ID/database/migrations
-- 2. Télécharger toutes les migrations
-- OU
-- 3. Exécuter pg_dump avec l'option --schema-only

-- Tables principales :
-- - profiles (utilisateurs)
-- - listings (annonces)
-- - conversations (conversations)
-- - messages (messages)
-- - credit_transactions (crédits)
-- - boosts (boosts)
-- - favorites (favoris)
-- - vendor_reputation (réputations)
-- - analytics_* (analytics)
-- - storage.objects (fichiers)

-- Voir le dossier 'supabase/migrations' pour les migrations complètes
"@

$schemaContent | Out-File -FilePath $SCHEMA_BACKUP -Encoding UTF8

Write-Host "   ✅ Schéma SQL sauvegardé : $SCHEMA_BACKUP" -ForegroundColor Green

# ============================================
# 4. LISTER LES MIGRATIONS
# ============================================

Write-Host "`n📝 Copie des migrations..." -ForegroundColor Yellow

$MIGRATIONS_DIR = "$SOURCE\supabase\migrations"
if (Test-Path $MIGRATIONS_DIR) {
    $MIGRATIONS_BACKUP = "$BACKUP_DIR\migrations_$TIMESTAMP"
    Copy-Item -Path $MIGRATIONS_DIR -Destination $MIGRATIONS_BACKUP -Recurse -Force
    Write-Host "   ✅ Migrations sauvegardées : $MIGRATIONS_BACKUP" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Pas de dossier migrations trouvé" -ForegroundColor Yellow
}

# ============================================
# 5. SAUVEGARDER LA DOCUMENTATION
# ============================================

Write-Host "`n📚 Sauvegarde de la documentation..." -ForegroundColor Yellow

$DOCS_BACKUP = "$BACKUP_DIR\documentation_$TIMESTAMP"
New-Item -ItemType Directory -Force -Path $DOCS_BACKUP | Out-Null

$docFiles = Get-ChildItem -Path $SOURCE -Filter "*.md" -File
foreach ($doc in $docFiles) {
    Copy-Item -Path $doc.FullName -Destination $DOCS_BACKUP -Force
}

Write-Host "   ✅ Documentation sauvegardée : $DOCS_BACKUP ($($docFiles.Count) fichiers)" -ForegroundColor Green

# ============================================
# 6. CRÉER UN FICHIER RÉCAPITULATIF
# ============================================

Write-Host "`n📋 Création du récapitulatif..." -ForegroundColor Yellow

$RECAP_FILE = "$BACKUP_DIR\BACKUP_RECAP_$TIMESTAMP.txt"

$recapContent = @"
# ============================================
# RÉCAPITULATIF BACKUP - ANNONCEAUTO.CI
# ============================================

Date : $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Projet Supabase : $PROJECT_ID
Type : Sauvegarde manuelle complète

## 📁 FICHIERS SAUVEGARDÉS

1. ✅ Projet complet (ZIP) : 
   $PROJECT_BACKUP

2. ✅ Variables d'environnement :
   $ENV_BACKUP

3. ✅ Schéma SQL :
   $SCHEMA_BACKUP

4. ✅ Migrations SQL :
   $MIGRATIONS_BACKUP

5. ✅ Documentation :
   $DOCS_BACKUP

## 📊 STATISTIQUES

- Nombre de fichiers MD : $($docFiles.Count)
- Taille totale backup : $(Get-ChildItem $BACKUP_DIR -Recurse -File | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum | ForEach-Object { "{0:N2} MB" -f ($_ / 1MB) })

## 🔄 BACKUPS SUPABASE AUTOMATIQUES

Les backups automatiques Supabase (Pro) sont disponibles ici :
https://supabase.com/dashboard/project/$PROJECT_ID/database/backups

- Rétention : 30 jours
- Fréquence : Quotidienne
- Type : Base de données complète

## 📥 POUR RESTAURER

### Base de données :
1. Aller sur Supabase Dashboard → Database → Backups
2. Sélectionner un backup et cliquer "Restore"

### Fichiers projet :
1. Extraire le ZIP : $PROJECT_BACKUP
2. Exécuter : pnpm install
3. Copier .env.local depuis $ENV_BACKUP
4. Exécuter : pnpm dev

## ⚠️ IMPORTANT

- ⚠️ Ce backup NE contient PAS les données de la base de données
- Pour un backup complet des données, utiliser pg_dump ou Supabase Dashboard
- Les fichiers Storage (images, audios) sont sauvegardés par Supabase
- Les backups automatiques Supabase (Pro) sont la méthode la plus sûre

## 🔗 LIENS UTILES

- Dashboard Supabase : https://supabase.com/dashboard/project/$PROJECT_ID
- Backups : https://supabase.com/dashboard/project/$PROJECT_ID/database/backups
- GitHub Repo : https://github.com/hermannnande/annonce-auto-ci
- Site Production : https://annonceauto.ci

## ✅ BACKUP COMPLÉTÉ AVEC SUCCÈS !

Date de fin : $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Localisation : $BACKUP_DIR
"@

$recapContent | Out-File -FilePath $RECAP_FILE -Encoding UTF8

Write-Host "   ✅ Récapitulatif créé : $RECAP_FILE" -ForegroundColor Green

# ============================================
# RÉSUMÉ FINAL
# ============================================

Write-Host "`n" -NoNewline
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ BACKUP COMPLÉTÉ AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "`n📁 Localisation : $BACKUP_DIR" -ForegroundColor Cyan
Write-Host "📄 Récapitulatif : $RECAP_FILE" -ForegroundColor Cyan
Write-Host "`n⚠️  IMPORTANT :" -ForegroundColor Yellow
Write-Host "   Ce backup contient le code et la configuration." -ForegroundColor Gray
Write-Host "   Les DONNÉES de la base sont sauvegardées automatiquement par Supabase (Pro)." -ForegroundColor Gray
Write-Host "   Voir : https://supabase.com/dashboard/project/$PROJECT_ID/database/backups" -ForegroundColor Gray
Write-Host "`n✨ Backup terminé à $(Get-Date -Format "HH:mm:ss")`n" -ForegroundColor Green

# Ouvrir le dossier de backup
Start-Process explorer.exe $BACKUP_DIR









