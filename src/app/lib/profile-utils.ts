import { Profile } from '../lib/supabase';

/**
 * Vérifie si un profil utilisateur est complet
 * Un profil est considéré complet si :
 * - Le nom complet est renseigné
 * - Le numéro de téléphone est renseigné et valide (pas le numéro par défaut)
 */
export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  
  // Vérifier le nom complet
  if (!profile.full_name || profile.full_name.trim() === '' || profile.full_name === 'Utilisateur') {
    return false;
  }
  
  // Vérifier le téléphone
  if (!profile.phone || profile.phone.trim() === '') {
    return false;
  }
  
  // Vérifier que ce n'est pas le numéro par défaut
  if (profile.phone.includes('00 00 00 00')) {
    return false;
  }
  
  return true;
}

/**
 * Obtient le message d'erreur approprié pour un profil incomplet
 */
export function getIncompleteProfileMessage(profile: Profile | null): string {
  if (!profile) {
    return 'Profil non trouvé';
  }
  
  if (!profile.full_name || profile.full_name.trim() === '') {
    return 'Veuillez renseigner votre nom complet';
  }
  
  if (!profile.phone || profile.phone.trim() === '' || profile.phone.includes('00 00 00 00')) {
    return 'Veuillez renseigner votre numéro de téléphone';
  }
  
  return 'Profil incomplet';
}

