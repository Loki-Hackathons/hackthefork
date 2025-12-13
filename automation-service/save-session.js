import { chromium } from 'playwright';
import { CONFIG } from './config.js';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

/**
 * Obtenir le chemin du profil Chrome de l'utilisateur
 */
function getChromeUserDataPath() {
  const platform = os.platform();
  const homeDir = os.homedir();
  
  if (platform === 'win32') {
    return path.join(homeDir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
  } else if (platform === 'darwin') {
    return path.join(homeDir, 'Library', 'Application Support', 'Google', 'Chrome');
  } else {
    return path.join(homeDir, '.config', 'google-chrome');
  }
}

/**
 * Script pour sauvegarder votre session Auchan
 * Utilise votre profil Chrome réel pour éviter les CAPTCHAs
 */
async function saveSession() {
  console.log('🔑 Script de sauvegarde de session Auchan...\n');
  console.log('📝 Instructions :');
  console.log('   1. Le navigateur va s\'ouvrir avec VOTRE profil Chrome');
  console.log('   2. Connectez-vous à votre compte Auchan');
  console.log('   3. Résolvez le CAPTCHA si nécessaire (avec votre profil, ça devrait passer)');
  console.log('   4. Sélectionnez votre Drive Auchan');
  console.log('   5. Une fois prêt, appuyez sur ENTRÉE dans ce terminal\n');
  
  const userDataDir = getChromeUserDataPath();
  const chromePath = process.platform === 'win32' 
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : null;
  
  // Vérifier si Chrome est installé
  let executablePath = null;
  if (chromePath && fs.existsSync(chromePath)) {
    executablePath = chromePath;
    console.log('✅ Chrome détecté, utilisation de votre navigateur\n');
  } else {
    console.log('⚠️  Chrome non trouvé, utilisation de Chromium\n');
  }
  
  // Utiliser votre profil Chrome réel (Default)
  const profilePath = path.join(userDataDir, 'Default');
  
  console.log('🚀 Ouverture du navigateur avec votre profil Chrome...\n');
  
  // Utiliser launchPersistentContext pour utiliser votre profil Chrome réel
  const context = await chromium.launchPersistentContext(profilePath, {
    headless: false,
    slowMo: 100,
    channel: 'chrome', // Utiliser Chrome installé
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage'
    ]
  });
  
  const page = await context.pages()[0] || await context.newPage();
  
  await page.goto(CONFIG.BASE_URL, { waitUntil: 'networkidle' });
  
  console.log('⏳ TEMPS ILLIMITÉ - Prenez votre temps !');
  console.log('📝 Le navigateur utilise VOTRE profil Chrome (cookies, historique, etc.)');
  console.log('📝 Cela devrait éviter les CAPTCHAs\n');
  console.log('⏸️  Une fois connecté et configuré, appuyez sur ENTRÉE dans ce terminal...\n');
  
  // Attendre que l'utilisateur appuie sur Entrée
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  await new Promise((resolve) => {
    rl.question('Appuyez sur ENTRÉE pour sauvegarder la session... ', () => {
      rl.close();
      resolve();
    });
  });
  
  // Sauvegarder la session
  await context.storageState({ path: CONFIG.AUTH_FILE });
  console.log(`\n✅ Session sauvegardée dans ${CONFIG.AUTH_FILE}`);
  console.log('🎉 Fermeture du navigateur dans 3 secondes...\n');
  
  await page.waitForTimeout(3000);
  await context.close();
  
  console.log('✅ Terminé ! Lancez maintenant : npm start\n');
}

saveSession().catch(console.error);

