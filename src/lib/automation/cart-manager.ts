import { SELECTORS } from './selectors';
import { CONFIG } from './config';
import { PopupHandler } from './popup-handler';
import type { Page } from 'playwright';

export class CartManager {
  private page: Page;
  private popupHandler: PopupHandler;
  
  constructor(page: Page) {
    this.page = page;
    this.popupHandler = new PopupHandler(page);
  }
  
  /**
   * Ajoute un produit au panier avec retry
   */
  async addToCart(productName: string) {
    const startTime = Date.now();
    console.log(`\n🛍️  [${new Date().toLocaleTimeString()}] Traitement de: "${productName}"`);
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // 1. Rechercher le produit
        const searchStart = Date.now();
        console.log(`   🔍 [${Date.now() - startTime}ms] Recherche (tentative ${attempt}/3)...`);
        await this.searchProduct(productName);
        console.log(`   ⏱️  [${Date.now() - searchStart}ms] Search launched`);
        
        // 2. Wait for results WITHOUT fixed timeout
        console.log(`   ⏳ [${Date.now() - startTime}ms] Waiting for results...`);
        await this.popupHandler.waitForLoadingToFinish();
        console.log(`   ✅ [${Date.now() - startTime}ms] Loading finished`);
        
        // 3. Quick results check
        const noResults = await this.page.locator(SELECTORS.NO_RESULTS_MESSAGE).isVisible({ timeout: 1000 });
        if (noResults) {
          console.log(`   ❌ No results found`);
          return {
            success: false,
            productName,
            message: 'No results found',
            attempts: attempt
          };
        }
        
        // 4. Find and click the "Add" button IMMEDIATELY
        console.log(`   🎯 [${Date.now() - startTime}ms] Looking for "Add" button...`);
        const addButton = await this.findAddToCartButton();
        
        if (!addButton) {
          console.log(`   ⚠️  [${Date.now() - startTime}ms] Button not found, retry...`);
          await this.page.waitForTimeout(CONFIG.RETRY_DELAY);
          continue;
        }
        
        console.log(`   📍 [${Date.now() - startTime}ms] Button found!`);
        
        // Get button text for debug
        const buttonText = await addButton.textContent();
        console.log(`   📝 [${Date.now() - startTime}ms] Button text: "${buttonText}"`);
        
        // Get cart count BEFORE click
        const cartCountBefore = await this.getCartCount();
        console.log(`   🛒 [${Date.now() - startTime}ms] Cart before: ${cartCountBefore}`);
        
        // 5. Click and wait for add to be effective
        await addButton.scrollIntoViewIfNeeded();
        const clickStart = Date.now();
        await addButton.click();
        console.log(`   👆 [${Date.now() - clickStart}ms] Click performed`);
        
        // IMPORTANT: Wait for add to be confirmed
        console.log(`   ⏳ [${Date.now() - startTime}ms] Waiting for add confirmation...`);
        
        // Wait for either:
        // 1. Cart count changes
        // 2. A confirmation message appears
        // 3. Button becomes disabled (indicates add is in progress/finished)
        let confirmed = false;
        for (let waitAttempt = 0; waitAttempt < 10; waitAttempt++) {
          await this.page.waitForTimeout(200);
          
          // Check if cart count changed
          const cartCountAfter = await this.getCartCount();
          if (cartCountAfter !== cartCountBefore) {
            console.log(`   ✅ [${Date.now() - startTime}ms] Cart updated: ${cartCountBefore} → ${cartCountAfter}`);
            confirmed = true;
            break;
          }
          
          // Check if a confirmation message appears
          const confirmation = await this.page.locator(SELECTORS.CONFIRMATION_POPUP).isVisible({ timeout: 100 });
          if (confirmation) {
            console.log(`   ✅ [${Date.now() - startTime}ms] Confirmation message detected`);
            confirmed = true;
            break;
          }
          
          // Check if button is now disabled (add in progress)
          const isDisabled = await addButton.isDisabled({ timeout: 100 }).catch(() => false);
          if (isDisabled) {
            console.log(`   ⏳ [${Date.now() - startTime}ms] Button disabled (add in progress)`);
            // Wait a bit more for add to finish
            await this.page.waitForTimeout(500);
            confirmed = true;
            break;
          }
        }
        
        if (!confirmed) {
          console.log(`   ⚠️  [${Date.now() - startTime}ms] No confirmation detected after 2s`);
        }
        
        // 6. Handle popups
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
        
      } catch (error: any) {
        console.log(`   ⚠️  [${Date.now() - startTime}ms] Erreur tentative ${attempt}: ${error.message}`);
        
        if (attempt === 3) {
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
    
    return {
      success: false,
      productName,
      message: 'Échec après toutes les tentatives',
      attempts: 3
    };
  }
  
  /**
   * Rechercher un produit
   */
  async searchProduct(productName: string) {
    const searchInput = this.page.locator(SELECTORS.SEARCH_INPUT).first();
    await searchInput.clear();
    await searchInput.fill(productName);
    
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
      } catch (e: any) {
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

