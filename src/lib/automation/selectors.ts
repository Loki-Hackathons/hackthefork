/**
 * Tous les sélecteurs CSS pour Auchan.fr
 * Testés sur le site réel
 */
export const SELECTORS = {
  // Barre de recherche
  SEARCH_INPUT: 'input[placeholder*="Rechercher un produit"], input[type="search"], searchbox',
  SEARCH_BUTTON: 'button:has-text("Lancer la recherche")',
  
  // Résultats de recherche
  SEARCH_RESULTS_CONTAINER: 'article, div[class*="product"]',
  NO_RESULTS_MESSAGE: 'text=Aucun résultat, text=0 résultat',
  
  // Boutons d'ajout au panier (ordre de priorité) - Auchan utilise aria-label avec "Ajouter ... au panier"
  ADD_TO_CART_BUTTONS: [
    'button[aria-label*="Ajouter"][aria-label*="au panier"]:not([disabled])',
    'button:has-text("Ajouter"):not([disabled])',
    'button[aria-label*="panier"]:not([disabled])'
  ],
  
  // Popups à gérer
  POPUP_CLOSE_BUTTONS: [
    'button[aria-label*="Fermer"]',
    'button[aria-label="Close"]',
    'button:has-text("×")',
    'button[class*="close"]'
  ],
  
  // Popup de confirmation d'ajout
  CONFIRMATION_POPUP: 'text=ajouté au panier, text=a bien été ajouté',
  CONTINUE_SHOPPING_BUTTON: 'button:has-text("Continuer")',
  
  // Popup de mode de livraison (Auchan peut avoir des popups similaires)
  DELIVERY_MODE_POPUP: 'text=Choisir mon mode de livraison',
  DELIVERY_MODE_DRIVE: 'button:has-text("Drive")',
  
  // Indicateur de chargement
  LOADING_INDICATOR: '[class*="loading"], [class*="spinner"]',
  
  // Panier
  CART_ICON: 'a[href*="panier"], a[href*="checkout/cart"]',
  CART_COUNT: '[class*="cart-count"], [data-testid="cart-count"]'
};

