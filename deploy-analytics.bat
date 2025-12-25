@echo off
chcp 65001 >nul
cls

echo ========================================
echo   DEPLOIEMENT SYSTEME ANALYTICS
echo   AnnonceAuto.ci
echo ========================================
echo.

echo [1/4] Verification Supabase CLI...
where supabase >nul 2>&1
if %errorlevel% neq 0 (
    echo    ERREUR: Supabase CLI n'est pas installe!
    echo    Installez-le avec: npm install -g supabase
    pause
    exit /b 1
)
echo    Supabase CLI detecte!

echo.
echo [2/4] Application des migrations SQL...
echo    - Creation des tables analytics...
supabase db push --file supabase\migrations\create_analytics_tables.sql
if %errorlevel% neq 0 (
    echo    ERREUR lors de la creation des tables!
    pause
    exit /b 1
)

echo    - Creation de la fonction increment...
supabase db push --file supabase\migrations\create_increment_function.sql
if %errorlevel% neq 0 (
    echo    ERREUR lors de la creation de la fonction!
    pause
    exit /b 1
)

echo    Migrations appliquees avec succes!

echo.
echo [3/4] Verification des dependances...
if exist "node_modules\ua-parser-js" (
    echo    ua-parser-js: OK
) else (
    echo    Installation de ua-parser-js...
    call pnpm add ua-parser-js
)

echo.
echo [4/4] Systeme Analytics pret!

echo.
echo ========================================
echo   DEPLOIEMENT TERMINE!
echo ========================================
echo.

echo Prochaines etapes:
echo   1. Demarrez le serveur dev: pnpm dev
echo   2. Allez sur: http://localhost:5174/dashboard/admin/analytics
echo   3. Consultez la doc: ANALYTICS_SYSTEM.md
echo.

echo Le tracking est maintenant actif sur tout le site!
echo Les utilisateurs en ligne seront visibles en temps reel.
echo.

echo Bon tracking! 🚀📊
echo.
pause



