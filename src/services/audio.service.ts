import { supabase } from '../app/lib/supabase';

/**
 * 🎤 SERVICE AUDIO - GESTION DES MESSAGES VOCAUX
 * Upload et gestion des fichiers audio dans Supabase Storage
 */

const AUDIO_BUCKET = 'message-audios';
const AUDIO_PREFIX = 'messages';

export const audioService = {
  /**
   * Upload un fichier audio vers Supabase Storage
   * @param audioBlob - Blob audio à uploader
   * @param userId - ID de l'utilisateur qui envoie le message
   * @returns Chemin Storage du fichier audio (ex: messages/{userId}/{timestamp}.webm)
   *
   * ⚠️ IMPORTANT:
   * Le bucket `message-audios` est censé être PRIVÉ (RLS). Donc on ne peut pas utiliser
   * `getPublicUrl()` ici. Le lecteur doit générer une URL signée au moment de la lecture.
   */
  async uploadAudio(audioBlob: Blob, userId: string): Promise<string> {
    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const fileName = `${timestamp}.webm`;
      // Structurer le path avec l'userId pour respecter les RLS
      const filePath = `${AUDIO_PREFIX}/${userId}/${fileName}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(AUDIO_BUCKET)
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (error) {
        console.error('❌ Erreur upload audio:', error);
        throw new Error('Impossible d\'uploader le message vocal');
      }

      console.log('✅ Audio uploadé (path):', filePath, data?.path);
      return filePath;
    } catch (error) {
      console.error('❌ Erreur audioService.uploadAudio:', error);
      throw error;
    }
  },

  /**
   * Résout une référence audio (ancien public URL / path) en URL lisible.
   * - Si c'est déjà `blob:` ou `data:` → retourne tel quel
   * - Si c'est une URL Supabase /object/public/... → extrait le path et génère une URL signée
   * - Si c'est déjà un path (messages/...) → génère une URL signée
   */
  async getPlayableUrl(audioRef: string, expiresInSeconds: number = 60 * 60): Promise<string> {
    if (!audioRef) throw new Error('audioRef manquant');
    if (audioRef.startsWith('blob:') || audioRef.startsWith('data:')) return audioRef;

    const path = this.extractAudioPath(audioRef) ?? audioRef;

    // Si on a encore une URL http(s) non reconnue, on la renvoie telle quelle.
    // (utile si un jour on rend le bucket public ou on stocke une URL signée côté DB)
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // Si le bucket est public, l'URL publique est la plus simple et ne nécessite pas d'URL signée.
    // Cela évite aussi les erreurs si des policies Storage bloquent la signature.
    const { data: publicData } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path);
    if (publicData?.publicUrl) return publicData.publicUrl;

    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.error('❌ Erreur createSignedUrl:', error);
      throw new Error('Impossible de générer une URL audio signée');
    }

    return data.signedUrl;
  },

  /**
   * Extrait le chemin storage depuis une URL Supabase.
   * Supporte:
   * - /storage/v1/object/public/<bucket>/<path>
   * - /storage/v1/object/sign/<bucket>/<path>?token=...
   */
  extractAudioPath(audioRef: string): string | null {
    try {
      if (!audioRef.startsWith('http://') && !audioRef.startsWith('https://')) return null;
      const url = new URL(audioRef);
      const parts = url.pathname.split('/').filter(Boolean);
      // Exemple: storage/v1/object/public/message-audios/messages/<uid>/<file>.webm
      const bucketIdx = parts.findIndex((p) => p === AUDIO_BUCKET);
      if (bucketIdx === -1) return null;
      const pathParts = parts.slice(bucketIdx + 1);
      return pathParts.join('/');
    } catch {
      return null;
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
   * @param audioRef - URL (ancienne) ou path du fichier à supprimer
   */
  async deleteAudio(audioRef: string): Promise<void> {
    try {
      const filePath = this.extractAudioPath(audioRef) ?? audioRef;

      const { error } = await supabase.storage
        .from(AUDIO_BUCKET)
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

