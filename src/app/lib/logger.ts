/**
 * 🔒 Logger sécurisé
 * Les logs ne s'affichent QUE en développement, jamais en production
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Logger qui ne fonctionne qu'en développement
 */
export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // En production, on peut envoyer à un service de monitoring (Sentry, etc.)
      // Mais sans afficher dans la console du navigateur
      console.error('[Error logged]'); // Message générique
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  // Logger SÉCURISÉ pour données sensibles (JAMAIS en production)
  secure: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🔒 [SECURE] ${message}`, data);
    }
    // En production : RIEN n'est affiché
  },

  // Logger de débogage (désactivable facilement)
  debug: (...args: any[]) => {
    if (isDevelopment && import.meta.env.VITE_DEBUG === 'true') {
      console.log('🐛 [DEBUG]', ...args);
    }
  },
};

/**
 * Supprime les données sensibles d'un objet avant de logger
 */
export function sanitizeForLog(obj: any): any {
  if (!obj) return obj;

  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'email', 'phone', 'address'];
  
  if (typeof obj !== 'object') return obj;

  const sanitized = { ...obj };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '***HIDDEN***';
    }
  }

  return sanitized;
}

/**
 * Exemple d'utilisation :
 * 
 * // ❌ MAUVAIS (données exposées)
 * console.log('User:', user);
 * 
 * // ✅ BON (seulement en DEV)
 * logger.log('User loaded:', user);
 * 
 * // ✅ MEILLEUR (données sensibles cachées)
 * logger.secure('User profile:', sanitizeForLog(user));
 */

