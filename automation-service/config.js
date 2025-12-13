export const CONFIG = {
  // URLs
  BASE_URL: 'https://www.auchan.fr',
  
  // Timeouts (en millisecondes) - MODE ULTRA RAPIDE ⚡⚡⚡
  NAVIGATION_TIMEOUT: 30000,
  ELEMENT_WAIT_TIMEOUT: 2000,        // Réduit au minimum
  SEARCH_WAIT_TIMEOUT: 0,            // SUPPRIMÉ - pas d'attente
  POPUP_WAIT_TIMEOUT: 300,           // Minimum pour détecter
  BETWEEN_ACTIONS_DELAY: 0,          // SUPPRIMÉ - pas d'attente entre actions
  AFTER_ADD_TO_CART_DELAY: 300,     // 300ms pour validation de l'ajout
  RETRY_DELAY: 500,                  // Réduit pour retry rapide
  
  // Comportement
  HEADLESS: false,
  SLOW_MO: 0,                        // Vitesse maximale
  
  // Session
  AUTH_FILE: './auth.json',
  
  // Logs
  VERBOSE: true
};

