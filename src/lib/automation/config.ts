export const CONFIG = {
  // URLs
  BASE_URL: 'https://www.auchan.fr',
  
  // Timeouts (in milliseconds) - ULTRA FAST MODE ⚡⚡⚡
  NAVIGATION_TIMEOUT: 30000,
  ELEMENT_WAIT_TIMEOUT: 2000,        // Reduced to minimum
  SEARCH_WAIT_TIMEOUT: 0,            // REMOVED - no waiting
  POPUP_WAIT_TIMEOUT: 300,           // Minimum to detect
  BETWEEN_ACTIONS_DELAY: 0,          // REMOVED - no waiting between actions
  AFTER_ADD_TO_CART_DELAY: 300,     // 300ms for add validation
  RETRY_DELAY: 500,                  // Reduced for fast retry
  
  // Comportement
  HEADLESS: false,
  SLOW_MO: 0,                        // Maximum speed
  
  // Session - Relative path to project root
  AUTH_FILE: './automation-service/auth.json',
  
  // Logs
  VERBOSE: true
};

