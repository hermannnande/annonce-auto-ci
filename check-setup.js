#!/usr/bin/env node

/**
 * Script de vérification de l'installation
 * AnnonceAuto.ci
 * 
 * Usage: node check-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Vérification de l\'installation AnnonceAuto.ci\n');

let errors = 0;
let warnings = 0;

// Colors for terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function success(msg) {
  console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function error(msg) {
  console.log(`${colors.red}❌ ${msg}${colors.reset}`);
  errors++;
}

function warning(msg) {
  console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
  warnings++;
}

function info(msg) {
  console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);
}

// Check Node.js version
function checkNode() {
  try {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      success(`Node.js ${version} installé`);
    } else {
      error(`Node.js ${version} trop ancien. Minimum requis: v18.0.0`);
    }
  } catch (e) {
    error('Impossible de vérifier la version de Node.js');
  }
}

// Check pnpm
function checkPnpm() {
  try {
    const version = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
    success(`pnpm ${version} installé`);
  } catch (e) {
    error('pnpm non installé. Exécuter: npm install -g pnpm');
  }
}

// Check required files
function checkFiles() {
  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'index.html',
    'src/main.tsx',
    'src/app/App.tsx',
    'src/styles/index.css',
    'src/styles/theme.css'
  ];

  requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      success(`Fichier ${file} présent`);
    } else {
      error(`Fichier ${file} manquant`);
    }
  });
}

// Check node_modules
function checkDependencies() {
  if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    success('Dossier node_modules présent');
    
    // Check key dependencies
    const keyDeps = ['react', 'react-dom', 'react-router-dom', 'vite', 'tailwindcss'];
    keyDeps.forEach(dep => {
      const depPath = path.join(__dirname, 'node_modules', dep);
      if (fs.existsSync(depPath)) {
        success(`Dépendance ${dep} installée`);
      } else {
        warning(`Dépendance ${dep} manquante`);
      }
    });
  } else {
    error('Dossier node_modules manquant. Exécuter: pnpm install');
  }
}

// Check documentation
function checkDocs() {
  const docs = [
    'README.md',
    'ARCHITECTURE.md',
    'DEVELOPER_GUIDE.md',
    'QUICK_REFERENCE.md',
    'INSTALLATION_LOCALE.md'
  ];

  docs.forEach(doc => {
    if (fs.existsSync(path.join(__dirname, doc))) {
      success(`Documentation ${doc} présente`);
    } else {
      warning(`Documentation ${doc} manquante`);
    }
  });
}

// Check directory structure
function checkStructure() {
  const requiredDirs = [
    'src',
    'src/app',
    'src/app/components',
    'src/app/pages',
    'src/app/pages/dashboard',
    'src/styles'
  ];

  requiredDirs.forEach(dir => {
    if (fs.existsSync(path.join(__dirname, dir))) {
      success(`Dossier ${dir} présent`);
    } else {
      error(`Dossier ${dir} manquant`);
    }
  });
}

// Main checks
console.log('1️⃣  Vérification des prérequis système\n');
checkNode();
checkPnpm();

console.log('\n2️⃣  Vérification de la structure du projet\n');
checkStructure();

console.log('\n3️⃣  Vérification des fichiers essentiels\n');
checkFiles();

console.log('\n4️⃣  Vérification des dépendances\n');
checkDependencies();

console.log('\n5️⃣  Vérification de la documentation\n');
checkDocs();

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ\n');

if (errors === 0 && warnings === 0) {
  console.log(`${colors.green}✨ Installation parfaite ! Tout est OK.${colors.reset}`);
  console.log('\n🚀 Prochaines étapes :');
  console.log('   1. Lancer le serveur : pnpm run dev');
  console.log('   2. Ouvrir : http://localhost:5173');
  console.log('   3. Lire : ARCHITECTURE.md\n');
} else {
  if (errors > 0) {
    console.log(`${colors.red}❌ ${errors} erreur(s) trouvée(s)${colors.reset}`);
  }
  if (warnings > 0) {
    console.log(`${colors.yellow}⚠️  ${warnings} avertissement(s)${colors.reset}`);
  }
  
  console.log('\n📝 Actions recommandées :');
  if (errors > 0) {
    console.log('   1. Corriger les erreurs ci-dessus');
    console.log('   2. Relancer : node check-setup.js');
  }
  if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('   3. Lancer quand même : pnpm run dev');
  } else {
    console.log('   3. Installer les dépendances : pnpm install');
  }
  console.log('');
}

console.log('='.repeat(50));
console.log('\n💡 Pour plus d\'aide, consulter INSTALLATION_LOCALE.md\n');

process.exit(errors > 0 ? 1 : 0);
