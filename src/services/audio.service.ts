import { supabase } from '../app/lib/supabase';

/**
 * 🎤 SERVICE AUDIO - GESTION DES MESSAGES VOCAUX
 * Upload et gestion des fichiers audio dans Supabase Storage
 */

export const audioService = {
  /**
   * Upload un fichier audio vers Supabase Storage
   * @param audioBlob - Blob audio à uploader
   * @param userId - ID de l'utilisateur qui envoie le message
   * @returns URL publique du fichier audio
   */
  async uploadAudio(audioBlob: Blob, userId: string): Promise<string> {
    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const fileName = `${userId}_${timestamp}.webm`;
      const filePath = `messages/${fileName}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('message-audios')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (error) {
        console.error('❌ Erreur upload audio:', error);
        throw new Error('Impossible d\'uploader le message vocal');
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('message-audios')
        .getPublicUrl(filePath);

      console.log('✅ Audio uploadé:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('❌ Erreur audioService.uploadAudio:', error);
      throw error;
    }
  },

  /**
   * Valide un fichier audio
   * @param audioBlob - Blob à valider
   * @param maxSizeBytes - Taille maximale en bytes (défaut: 5MB)
   * @param maxDurationSeconds - Durée maximale en secondes (défaut: 60s)
   * @returns true si valide, sinon throw une erreur
   */
  async validateAudio(
    audioBlob: Blob,
    maxSizeBytes: number = 5 * 1024 * 1024, // 5MB
    maxDurationSeconds: number = 60
  ): Promise<boolean> {
    // Vérifier la taille
    if (audioBlob.size > maxSizeBytes) {
      throw new Error(`Le fichier audio est trop volumineux (max ${Math.round(maxSizeBytes / 1024 / 1024)}MB)`);
    }

    // Vérifier le type MIME
    if (!audioBlob.type.startsWith('audio/')) {
      throw new Error('Le fichier doit être un fichier audio');
    }

    // TODO: Vérifier la durée (nécessite de lire le fichier)
    // Pour l'instant, on fait confiance au frontend qui limite à 60s

    return true;
  },

  /**
   * Supprime un fichier audio de Supabase Storage
   * @param audioUrl - URL publique du fichier à supprimer
   */
  async deleteAudio(audioUrl: string): Promise<void> {
    try {
      // Extraire le chemin depuis l'URL
      const url = new URL(audioUrl);
      const pathSegments = url.pathname.split('/');
      const filePath = pathSegments.slice(pathSegments.indexOf('message-audios') + 1).join('/');

      const { error } = await supabase.storage
        .from('message-audios')
        .remove([filePath]);

      if (error) {
        console.error('❌ Erreur suppression audio:', error);
        throw new Error('Impossible de supprimer le message vocal');
      }

      console.log('✅ Audio supprimé:', filePath);
    } catch (error) {
      console.error('❌ Erreur audioService.deleteAudio:', error);
      // Ne pas throw, car la suppression d'un audio n'est pas critique
    }
  },
};

