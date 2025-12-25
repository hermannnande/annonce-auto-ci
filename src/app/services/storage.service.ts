import { supabase } from '../lib/supabase';

class StorageService {
  private readonly BUCKET_NAME = 'vehicle-images';
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Uploader des images de véhicules
   */
  async uploadVehicleImages(files: File[]): Promise<{ urls: string[]; error: Error | null }> {
    try {
      const urls: string[] = [];

      for (const file of files) {
        // Validation
        if (!this.ALLOWED_TYPES.includes(file.type)) {
          return { 
            urls: [], 
            error: new Error(`Type de fichier non autorisé: ${file.type}. Utilisez JPG, PNG ou WebP.`) 
          };
        }

        if (file.size > this.MAX_FILE_SIZE) {
          return { 
            urls: [], 
            error: new Error(`Fichier trop volumineux: ${file.name}. Maximum 5 MB.`) 
          };
        }

        // Générer un nom unique
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload vers Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Erreur upload fichier:', uploadError);
          return { urls: [], error: uploadError as Error };
        }

        // Récupérer l'URL publique
        const { data } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(filePath);

        urls.push(data.publicUrl);
      }

      return { urls, error: null };
    } catch (error) {
      console.error('Erreur upload images:', error);
      return { urls: [], error: error as Error };
    }
  }

  /**
   * Supprimer une image (avec vérification RLS côté Supabase)
   * Note: La suppression est déjà protégée par les RLS policies Supabase
   * qui vérifient que owner = auth.uid()
   */
  async deleteVehicleImage(url: string): Promise<{ error: Error | null }> {
    try {
      // Extraire le nom du fichier de l'URL
      const fileName = url.split('/').pop();
      if (!fileName) {
        return { error: new Error('URL invalide') };
      }

      // La suppression sera bloquée par RLS si l'utilisateur n'est pas le propriétaire
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur suppression image:', error);
      return { error: error as Error };
    }
  }

  /**
   * Supprimer plusieurs images
   */
  async deleteVehicleImages(urls: string[]): Promise<{ error: Error | null }> {
    try {
      const fileNames = urls
        .map(url => url.split('/').pop())
        .filter(Boolean) as string[];

      if (fileNames.length === 0) {
        return { error: null };
      }

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(fileNames);

      if (error) {
        return { error: error as Error };
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur suppression images:', error);
      return { error: error as Error };
    }
  }

  /**
   * Uploader une photo de profil
   */
  async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
    try {
      // Validation
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        return { 
          url: null, 
          error: new Error('Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.') 
        };
      }

      if (file.size > this.MAX_FILE_SIZE) {
        return { 
          url: null, 
          error: new Error('Fichier trop volumineux. Maximum 5 MB.') 
        };
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${userId}.${fileExt}`;

      // Upload (remplace si existe déjà)
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        return { url: null, error: uploadError as Error };
      }

      // Récupérer l'URL publique
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error('Erreur upload avatar:', error);
      return { url: null, error: error as Error };
    }
  }

  /**
   * Alias pour uploadAvatar (cohérence avec VendorSettings)
   */
  async uploadProfileImage(file: File, userId: string): Promise<{ url: string | null; error: Error | null }> {
    return this.uploadAvatar(userId, file);
  }
}

export const storageService = new StorageService();
