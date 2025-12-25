/**
 * 🔒 UTILITAIRES DE SÉCURITÉ
 * Fonctions pour protéger contre les attaques courantes
 */

/**
 * Valide qu'une URL de redirection est sûre (pas d'open redirect)
 * @param url - URL à valider
 * @param allowedOrigins - Origines autorisées (par défaut: annonceauto.ci)
 * @returns URL validée ou null si dangereuse
 */
export function sanitizeRedirectUrl(
  url: string | null,
  allowedOrigins: string[] = ['https://annonceauto.ci', 'https://www.annonceauto.ci']
): string | null {
  if (!url) return null;

  try {
    // Si l'URL est relative (commence par /), c'est OK
    if (url.startsWith('/') && !url.startsWith('//')) {
      // Bloquer les doubles slashes et autres tentatives d'injection
      if (url.includes('//') || url.includes('\\')) {
        console.warn('🚨 Tentative de redirection suspecte bloquée:', url);
        return null;
      }
      return url;
    }

    // Si l'URL est absolue, vérifier l'origine
    const urlObj = new URL(url);
    
    // En dev, autoriser localhost
    if (import.meta.env.DEV && urlObj.hostname === 'localhost') {
      return url;
    }

    // Vérifier que l'origine est dans la liste autorisée
    const origin = `${urlObj.protocol}//${urlObj.hostname}`;
    if (allowedOrigins.includes(origin)) {
      return url;
    }

    console.warn('🚨 Tentative de redirection vers domaine non autorisé:', url);
    return null;
  } catch (error) {
    console.warn('🚨 URL de redirection invalide:', url);
    return null;
  }
}

/**
 * Nettoie l'URL du navigateur après OAuth pour enlever les tokens sensibles
 * Supabase redirige avec #access_token= dans l'URL
 */
export function cleanUrlAfterOAuth(): void {
  // Si l'URL contient un fragment (#) avec des tokens OAuth
  if (window.location.hash && window.location.hash.includes('access_token')) {
    // Remplacer l'URL sans recharger la page
    const cleanUrl = window.location.pathname + window.location.search;
    window.history.replaceState({}, document.title, cleanUrl);
    console.log('🧹 URL nettoyée après OAuth');
  }
}

/**
 * Sanitize user input pour éviter XSS
 * @param input - Texte à nettoyer
 * @returns Texte sécurisé
 */
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valide un email
 * @param email - Email à valider
 * @returns true si valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone ivoirien
 * @param phone - Numéro à valider
 * @returns true si valide
 */
export function isValidIvorianPhone(phone: string): boolean {
  // Format: +225 XX XX XX XX XX ou 225XXXXXXXXXX ou XX XX XX XX XX
  const cleanPhone = phone.replace(/\s/g, '');
  return /^(\+?225)?[0-9]{10}$/.test(cleanPhone);
}

/**
 * Génère un nonce cryptographique pour CSP
 * @returns Nonce aléatoire
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

