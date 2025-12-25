# ============================================
# Script de déploiement du système Analytics
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT SYSTEME ANALYTICS" -ForegroundColor Cyan
Write-Host "  AnnonceAuto.ci" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Vérifier que Supabase CLI est installé
Write-Host "[1/4] Vérification Supabase CLI..." -ForegroundColor Yellow
$supabaseExists = Get-Command supabase -ErrorAction SilentlyContinue

if ($null -eq $supabaseExists) {
    Write-Host "   ERREUR: Supabase CLI n'est pas installé!" -ForegroundColor Red
    Write-Host "   Installez-le avec: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "   Supabase CLI detecte!" -ForegroundColor Green

# Appliquer les migrations
Write-Host "`n[2/4] Application des migrations SQL..." -ForegroundColor Yellow

# Migration 1: Tables analytics
Write-Host "   - Creation des tables analytics..." -ForegroundColor Cyan
supabase db push --file supabase/migrations/create_analytics_tables.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERREUR lors de la creation des tables!" -ForegroundColor Red
    exit 1
}

# Migration 2: Fonction increment
Write-Host "   - Creation de la fonction increment..." -ForegroundColor Cyan
supabase db push --file supabase/migrations/create_increment_function.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERREUR lors de la creation de la fonction!" -ForegroundColor Red
    exit 1
}

Write-Host "   Migrations appliquees avec succes!" -ForegroundColor Green

# Vérifier les dépendances npm
Write-Host "`n[3/4] Verification des dependances..." -ForegroundColor Yellow

$packageJsonPath = ".\package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    
    if ($packageJson.dependencies.'ua-parser-js') {
        Write-Host "   ua-parser-js: OK" -ForegroundColor Green
    } else {
        Write-Host "   Installation de ua-parser-js..." -ForegroundColor Cyan
        pnpm add ua-parser-js
    }
} else {
    Write-Host "   ERREUR: package.json introuvable!" -ForegroundColor Red
    exit 1
}

# Instructions finales
Write-Host "`n[4/4] Systeme Analytics pret!" -ForegroundColor Green
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEPLOIEMENT TERMINE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "  1. Demarrez le serveur dev: pnpm dev" -ForegroundColor White
Write-Host "  2. Allez sur: http://localhost:5174/dashboard/admin/analytics" -ForegroundColor White
Write-Host "  3. Consultez la doc: ANALYTICS_SYSTEM.md`n" -ForegroundColor White

Write-Host "Le tracking est maintenant actif sur tout le site!" -ForegroundColor Green
Write-Host "Les utilisateurs en ligne seront visibles en temps reel.`n" -ForegroundColor Green

Write-Host "Bon tracking! `u{1F680}`u{1F4CA}`n" -ForegroundColor Cyan



