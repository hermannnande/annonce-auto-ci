/**
 * 🔒 UTILITAIRES DE SÉCURITÉ
 * 
 * Fonctions helper pour vérifier les permissions et valider les données
 */

import { Profile } from '../lib/supabase';

/**
 * Vérifie si un utilisateur est un administrateur
 */
export function isAdmin(profile: Profile | null): boolean {
  return profile?.user_type === 'admin';
}

/**
 * Vérifie si un utilisateur est un vendeur
 */
export function isVendor(profile: Profile | null): boolean {
  return profile?.user_type === 'vendor';
}

/**
 * Vérifie si un utilisateur est le propriétaire d'une ressource
 */
export function isOwner(profile: Profile | null, resourceOwnerId: string): boolean {
  return profile?.id === resourceOwnerId;
}

/**
 * Vérifie si un utilisateur peut modifier une ressource
 * (soit il en est le propriétaire, soit il est admin)
 */
export function canModifyResource(profile: Profile | null, resourceOwnerId: string): boolean {
  if (!profile) return false;
  return isOwner(profile, resourceOwnerId) || isAdmin(profile);
}

/**
 * Sanitize une chaîne de caractères pour éviter les injections
 * (Basique - pour usage côté client uniquement)
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone (format Côte d'Ivoire)
 */
export function isValidPhone(phone: string): boolean {
  // Format: +225 XX XX XX XX XX ou 07 08 09 05 01 02 03
  const phoneRegex = /^(\+225\s?)?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Valide un prix (doit être positif)
 */
export function isValidPrice(price: number): boolean {
  return price > 0 && price < 1000000000; // Max 1 milliard
}

/**
 * Valide une année (véhicule)
 */
export function isValidYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 1;
}

/**
 * Valide un kilométrage
 */
export function isValidMileage(mileage: number): boolean {
  return mileage >= 0 && mileage <= 10000000; // Max 10 millions de km
}

/**
 * Limite la taille d'une chaîne
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Vérifie si une URL d'image est valide
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return validExtensions.some(ext => parsedUrl.pathname.toLowerCase().endsWith(ext));
  } catch {
    return false;
  }
}

/**
 * Limite le nombre d'images uploadées
 */
export const MAX_IMAGES = 10;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Vérifie la taille d'un fichier image
 */
export function isValidImageSize(size: number): boolean {
  return size > 0 && size <= MAX_IMAGE_SIZE;
}

/**
 * Vérifie le type MIME d'une image
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimeType);
}

/**
 * Génère un ID unique sécurisé
 */
export function generateSecureId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Escape les caractères spéciaux pour une recherche
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Rate limiting côté client (simple debounce)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}




