import { SELECTORS } from './selectors.js';
import { CONFIG } from './config.js';
import { PopupHandler } from './popup-handler.js';

export class CartManager {
  constructor(page) {
    this.page = page;
    this.popupHandler = new PopupHandler(page);
  }
  
  /**
   * Ajoute un produit au panier avec retry
   */
  async addToCart(productName) {
    const startTime = Date.now();
    console.log(`\n🛍️  [${new Date().toLocaleTimeString()}] Traitement de: "${productName}"`);
    
    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES || 3; attempt++) {
      try {
        // 1. Rechercher le produit
        const searchStart = Date.now();
        console.log(`   🔍 [${Date.now() - startTime}ms] Recherche (tentative ${attempt}/3)...`);
        await this.searchProduct(productName);
        console.log(`   ⏱️  [${Date.now() - searchStart}ms] Recherche lancée`);
        
        // 2. Attendre les résultats SANS timeout fixe
        console.log(`   ⏳ [${Date.now() - startTime}ms] Attente résultats...`);
        await this.popupHandler.waitForLoadingToFinish();
        console.log(`   ✅ [${Date.now() - startTime}ms] Chargement terminé`);
        
        // 3. Vérification rapide des résultats
        const noResults = await this.page.locator(SELECTORS.NO_RESULTS_MESSAGE).isVisible({ timeout: 1000 });
        if (noResults) {
          console.log(`   ❌ Aucun résultat trouvé`);
          return {
            success: false,
            productName,
            message: 'Aucun résultat trouvé',
            attempts: attempt
          };
        }
        
        // 4. Chercher et cliquer sur le bouton "Ajouter" IMMÉDIATEMENT
        console.log(`   🎯 [${Date.now() - startTime}ms] Recherche du bouton "Ajouter"...`);
        const addButton = await this.findAddToCartButton();
        
        if (!addButton) {
          console.log(`   ⚠️  [${Date.now() - startTime}ms] Bouton non trouvé, retry...`);
          await this.page.waitForTimeout(CONFIG.RETRY_DELAY);
          continue;
        }
        
        console.log(`   📍 [${Date.now() - startTime}ms] Bouton trouvé !`);
        
        // Récupérer le texte du bouton pour debug
        const buttonText = await addButton.textContent();
        console.log(`   📝 [${Date.now() - startTime}ms] Texte du bouton: "${buttonText}"`);
        
        // Récupérer le compteur du panier AVANT le clic
        const cartCountBefore = await this.getCartCount();
        console.log(`   🛒 [${Date.now() - startTime}ms] Panier avant: ${cartCountBefore}`);
        
        // 5. Cliquer et attendre que l'ajout soit effectif
        await addButton.scrollIntoViewIfNeeded();
        const clickStart = Date.now();
        await addButton.click();
        console.log(`   👆 [${Date.now() - clickStart}ms] Clic effectué`);
        
        // IMPORTANT : Attendre que l'ajout soit confirmé
        console.log(`   ⏳ [${Date.now() - startTime}ms] Attente confirmation ajout...`);
        
        // Attendre soit :
        // 1. Le compteur du panier change
        // 2. Un message de confirmation apparaît
        // 3. Le bouton devient disabled (indique que l'ajout est en cours/terminé)
        let confirmed = false;
        for (let waitAttempt = 0; waitAttempt < 10; waitAttempt++) {
          await this.page.waitForTimeout(200);
          
          // Vérifier si le compteur a changé
          const cartCountAfter = await this.getCartCount();
          if (cartCountAfter !== cartCountBefore) {
            console.log(`   ✅ [${Date.now() - startTime}ms] Panier mis à jour: ${cartCountBefore} → ${cartCountAfter}`);
            confirmed = true;
            break;
          }
          
          // Vérifier si un message de confirmation apparaît
          const confirmation = await this.page.locator(SELECTORS.CONFIRMATION_POPUP).isVisible({ timeout: 100 });
          if (confirmation) {
            console.log(`   ✅ [${Date.now() - startTime}ms] Message de confirmation détecté`);
            confirmed = true;
            break;
          }
          
          // Vérifier si le bouton est maintenant disabled (ajout en cours)
          const isDisabled = await addButton.isDisabled({ timeout: 100 }).catch(() => false);
          if (isDisabled) {
            console.log(`   ⏳ [${Date.now() - startTime}ms] Bouton désactivé (ajout en cours)`);
            // Attendre encore un peu pour que l'ajout se termine
            await this.page.waitForTimeout(500);
            confirmed = true;
            break;
          }
        }
        
        if (!confirmed) {
          console.log(`   ⚠️  [${Date.now() - startTime}ms] Aucune confirmation détectée après 2s`);
        }
        
        // 6. Gérer les popups
        console.log(`   🔄 [${Date.now() - startTime}ms] Gestion popups...`);
        await this.popupHandler.closeAllPopups();
        
        const totalTime = Date.now() - startTime;
        console.log(`   ✅ [${totalTime}ms] Produit "${productName}" ajouté en ${totalTime}ms !`);
        return {
          success: true,
          productName,
          message: `Ajouté en ${totalTime}ms`,
          attempts: attempt
        };
        
      } catch (error) {
        console.log(`   ⚠️  [${Date.now() - startTime}ms] Erreur tentative ${attempt}: ${error.message}`);
        
        if (attempt === (CONFIG.MAX_RETRIES || 3)) {
          return {
            success: false,
            productName,
            message: `Échec après ${attempt} tentatives`,
            attempts: attempt
          };
        }
        
        await this.page.waitForTimeout(CONFIG.RETRY_DELAY);
      }
    }
  }
  
  /**
   * Rechercher un produit
   */
  async searchProduct(productName) {
    const searchInput = this.page.locator(SELECTORS.SEARCH_INPUT).first();
    await searchInput.clear();
    await searchInput.fill(productName);
    // SUPPRIMÉ : Plus d'attente entre fill et click
    
    const searchButton = this.page.locator(SELECTORS.SEARCH_BUTTON).first();
    await searchButton.click();
  }
  
  /**
   * Trouver le premier bouton "Ajouter au panier" valide
   */
  async findAddToCartButton() {
    for (const selector of SELECTORS.ADD_TO_CART_BUTTONS) {
      try {
        const buttons = this.page.locator(selector);
        const count = await buttons.count();
        console.log(`      🔍 Sélecteur "${selector}": ${count} bouton(s) trouvé(s)`);
        
        for (let i = 0; i < count; i++) {
          const button = buttons.nth(i);
          const isVisible = await button.isVisible({ timeout: 1000 });
          const isEnabled = await button.isEnabled();
          
          if (isVisible && isEnabled) {
            // Vérifier qu'il n'est pas dans un spinbutton (quantité)
            const parent = await button.locator('xpath=ancestor::*[@role="spinbutton"]').count();
            if (parent === 0) {
              return button;
            }
          }
        }
      } catch (e) {
        console.log(`      ⚠️  Erreur avec sélecteur "${selector}": ${e.message}`);
      }
    }
    return null;
  }
  
  /**
   * Récupérer le compteur du panier
   */
  async getCartCount() {
    try {
      const cartLink = this.page.locator(SELECTORS.CART_ICON).first();
      const text = await cartLink.textContent({ timeout: 500 });
      // Extraire le nombre du texte (ex: "0,00 €" ou "1,29 €")
      const match = text?.match(/(\d+)/);
      return match ? match[1] : '0';
    } catch {
      return '0';
    }
  }
}


