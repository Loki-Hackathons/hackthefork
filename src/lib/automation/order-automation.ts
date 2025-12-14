import { chromium } from 'playwright';
import { CONFIG } from './config';
import { CartManager } from './cart-manager';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Mock Data - Ingrédients par plat
 */
function getRecipeIngredients(dishId: string) {
  const recipes: Record<string, string[]> = {
    'burger-vege': [
      'Salade',
      'Champignons'
    ],
    'pizza-vege': [
      'Pâte à pizza bio',
      'Sauce tomate bio',
      'Fromage végétal',
      'Champignons'
    ],
    'pasta-vege': [
      'Pâtes complètes bio',
      'Sauce tomate bio',
      'Basilic frais',
      'Ail bio'
    ]
  };
  
  return recipes[dishId] || recipes['burger-vege'];
}

/**
 * Fonction principale d'automatisation avec Playwright
 */
export async function startShoppingAutomation(dishId: string = 'burger-vege') {
  console.log(`\n🍔 Démarrage de l'automatisation Playwright pour Auchan: ${dishId}`);
  
  const ingredients = getRecipeIngredients(dishId);
  console.log(`📋 Ingrédients à ajouter:`, ingredients);
  
  let browser;
  const results = {
    success: [] as Array<{ productName: string; message: string; attempts: number }>,
    failed: [] as Array<{ productName: string; message: string; attempts: number }>
  };
  
  try {
    // Chemin absolu vers le fichier auth.json
    const authFilePath = path.join(process.cwd(), CONFIG.AUTH_FILE);
    const hasSession = fs.existsSync(authFilePath);
    
    if (!hasSession) {
      console.log('\n⚠️  ERREUR: Aucune session sauvegardée !');
      console.log('📝 Lancez d\'abord: cd automation-service && npm run save-session\n');
      throw new Error('Session non trouvée. Exécutez "npm run save-session" dans automation-service d\'abord.');
    }
    
    console.log('🚀 Ouverture du navigateur avec votre session...');
    
    // Lancer le navigateur avec la session sauvegardée
    browser = await chromium.launch({
      headless: CONFIG.HEADLESS,
      slowMo: CONFIG.SLOW_MO
    });
    
    const context = await browser.newContext({
      storageState: authFilePath  // Charger la session !
    });
    
    const page = await context.newPage();
    const cartManager = new CartManager(page);
    
    // Aller sur Auchan
    console.log('🌐 Navigation vers Auchan...');
    await page.goto(CONFIG.BASE_URL, { 
      waitUntil: 'networkidle',
      timeout: CONFIG.NAVIGATION_TIMEOUT 
    });
    
    console.log('✅ Connecté avec votre session Auchan');
    
    // Traiter chaque ingrédient - MODE ULTRA RAPIDE
    const globalStart = Date.now();
    
    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      console.log(`\n[${i + 1}/${ingredients.length}] ━━━━━━━━━━━━━━━━━━━━━━━━━━ [Temps total: ${Date.now() - globalStart}ms]`);
      
      const result = await cartManager.addToCart(ingredient);
      
      if (result.success) {
        results.success.push(result);
      } else {
        results.failed.push(result);
      }
      
      // SUPPRIMÉ : Plus d'attente entre les produits
    }
    
    const totalTime = Date.now() - globalStart;
    console.log(`\n⚡ TEMPS TOTAL : ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    
    // Aller au panier
    console.log('\n🛒 Redirection vers le panier...');
    await page.goto('https://www.auchan.fr/checkout/cart/', {
      waitUntil: 'networkidle',
      timeout: CONFIG.NAVIGATION_TIMEOUT
    });
    
    // Rapport final
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RAPPORT FINAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Succès: ${results.success.length}/${ingredients.length}`);
    console.log(`❌ Échecs: ${results.failed.length}/${ingredients.length}`);
    
    if (results.success.length > 0) {
      console.log('\n✅ Produits ajoutés:');
      results.success.forEach(r => console.log(`   - ${r.productName}`));
    }
    
    if (results.failed.length > 0) {
      console.log('\n❌ Produits non ajoutés:');
      results.failed.forEach(r => console.log(`   - ${r.productName}: ${r.message}`));
    }
    
    console.log('\n🎉 Automatisation terminée ! Le navigateur reste ouvert.\n');
    
    // Ne PAS fermer le navigateur pour la démo
    // await browser.close();
    
    return results;
    
  } catch (error: any) {
    console.error('\n❌ Erreur fatale:', error.message);
    
    if (browser) {
      console.log('⚠️  Le navigateur reste ouvert pour inspection...');
    }
    
    throw error;
  }
}

