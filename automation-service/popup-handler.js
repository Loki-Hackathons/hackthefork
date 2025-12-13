import { SELECTORS } from './selectors.js';
import { CONFIG } from './config.js';

/**
 * Gestion déterministe des popups Carrefour
 */
export class PopupHandler {
  constructor(page) {
    this.page = page;
  }
  
  /**
   * Ferme TOUTES les popups visibles - VERSION ULTRA RAPIDE
   */
  async closeAllPopups() {
    console.log('      🔍 Vérification popups...');
    
    // Exécuter tous les handlers EN PARALLÈLE pour gagner du temps
    const handlers = [
      this.closeDeliveryModePopup(),
      this.closeConfirmationPopup(),
      this.closeGenericPopup()
    ];
    
    await Promise.allSettled(handlers);
    console.log('      ✅ Popups traitées');
  }
  
  /**
   * Gère la popup de mode de livraison (Drive)
   */
  async closeDeliveryModePopup() {
    try {
      const popup = this.page.locator(SELECTORS.DELIVERY_MODE_POPUP);
      const isVisible = await popup.isVisible({ timeout: CONFIG.POPUP_WAIT_TIMEOUT });
      
      if (isVisible) {
        console.log('         🏪 Popup mode de livraison détectée');
        const driveBtn = this.page.locator(SELECTORS.DELIVERY_MODE_DRIVE).first();
        await driveBtn.click();
        // SUPPRIMÉ : Plus d'attente après sélection
        console.log('         ✅ Mode Drive sélectionné');
        return true;
      }
    } catch {}
    return false;
  }
  
  /**
   * Ferme la popup de confirmation "Produit ajouté"
   */
  async closeConfirmationPopup() {
    try {
      const popup = this.page.locator(SELECTORS.CONFIRMATION_POPUP);
      const isVisible = await popup.isVisible({ timeout: CONFIG.POPUP_WAIT_TIMEOUT });
      
      if (isVisible) {
        // Essayer "Continuer mes achats"
        const continueBtn = this.page.locator(SELECTORS.CONTINUE_SHOPPING_BUTTON).first();
        if (await continueBtn.isVisible({ timeout: 500 })) {
          await continueBtn.click();
          // SUPPRIMÉ : Plus d'attente après click
          return true;
        }
        
        // Sinon, fermer avec X
        await this.closeGenericPopup();
        return true;
      }
    } catch {}
    return false;
  }
  
  /**
   * Ferme une popup générique avec bouton close
   */
  async closeGenericPopup() {
    for (const selector of SELECTORS.POPUP_CLOSE_BUTTONS) {
      try {
        const closeBtn = this.page.locator(selector).first();
        const isVisible = await closeBtn.isVisible({ timeout: 1000 });
        
        if (isVisible) {
          await closeBtn.click();
          // SUPPRIMÉ : Plus d'attente après fermeture
          return true;
        }
      } catch {}
    }
    return false;
  }
  
  /**
   * Attendre la fin des chargements - VERSION RAPIDE
   */
  async waitForLoadingToFinish() {
    try {
      console.log('      ⏳ Attente chargement réseau...');
      // Attendre que le réseau soit stable (domcontentloaded au lieu de networkidle)
      await this.page.waitForLoadState('domcontentloaded', { 
        timeout: 5000 
      });
      console.log('      ✅ DOM chargé');
      
      // Vérifier rapidement si un loader est visible
      const loader = this.page.locator(SELECTORS.LOADING_INDICATOR).first();
      if (await loader.isVisible({ timeout: 500 })) {
        console.log('      ⏳ Loader détecté, attente...');
        await loader.waitFor({ state: 'hidden', timeout: 3000 });
        console.log('      ✅ Loader disparu');
      }
    } catch (e) {
      console.log(`      ⚠️  Timeout chargement (ignoré): ${e.message}`);
    }
  }
}


