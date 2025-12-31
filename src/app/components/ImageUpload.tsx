import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Image as ImageIcon, CheckCircle, Sparkles, Loader2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from './ui/card';

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  initialImages?: string[]; // ✨ NOUVEAU : Images initiales pour l'édition
}

export function ImageUpload({ onImagesChange, maxImages = 10, initialImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages); // ✨ Initialisé avec les images existantes
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ✨ NOUVEAU : Synchroniser les images initiales au chargement
  useEffect(() => {
    if (initialImages.length > 0 && images.length === 0) {
      setImages(initialImages);
      onImagesChange(initialImages);
    }
  }, [initialImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      
      // Simuler un délai de chargement réaliste
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentLoaded = ((i + e.loaded / e.total) / imageFiles.length) * 100;
            setUploadProgress(percentLoaded);
          }
        };

        reader.onloadend = () => {
          setImages(prev => {
            const newImages = [...prev, reader.result as string].slice(0, maxImages);
            onImagesChange(newImages);
            return newImages;
          });
          
          const percentComplete = ((i + 1) / imageFiles.length) * 100;
          setUploadProgress(percentComplete);
          resolve();
        };
        
        reader.readAsDataURL(file);
      });
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      onImagesChange(newImages);
      return newImages;
    });
  };

  const moveImage = (from: number, to: number) => {
    if (from === to) return;
    setImages(prev => {
      if (from < 0 || from >= prev.length || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onImagesChange(next);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          isDragging
            ? 'border-[#FACC15] bg-[#FACC15]/10'
            : 'border-gray-300 hover:border-[#FACC15] hover:bg-gray-50'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ y: isDragging ? -10 : 0 }}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${
              isDragging
                ? 'bg-gradient-to-br from-[#FACC15] to-[#FBBF24]'
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-10 h-10 text-[#FACC15] animate-spin" />
            ) : (
              <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-gray-400'}`} />
            )}
          </motion.div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 font-[var(--font-poppins)]">
            {isUploading ? 'Chargement en cours...' : isDragging ? 'Déposez vos photos ici' : 'Ajoutez vos photos'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {isUploading 
              ? `${Math.round(uploadProgress)}% chargé` 
              : `Glissez-déposez ou cliquez pour sélectionner (${images.length}/${maxImages})`
            }
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-4 h-4" />
            <span>JPG, PNG jusqu'à 10MB par image</span>
          </div>
        </div>

        {/* Progress Bar - Upload en cours */}
        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-b-2xl overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              className="h-full bg-gradient-to-r from-[#FACC15] to-[#FBBF24]"
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Progress Bar - Compteur d'images */}
        {!isUploading && images.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(images.length / maxImages) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#FACC15] to-[#FBBF24]"
            />
          </div>
        )}
      </motion.div>

      {/* Image Preview Grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`relative group aspect-square ${dragOverIndex === index ? 'ring-2 ring-[#FACC15] rounded-xl' : ''}`}
                draggable
                onDragStart={(e) => {
                  // HTML5 drag & drop (desktop)
                  setDragFromIndex(index);
                  setDragOverIndex(index);
                  e.dataTransfer.effectAllowed = 'move';
                  // Obligatoire sur certains navigateurs pour activer le drag
                  e.dataTransfer.setData('text/plain', String(index));
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  if (dragFromIndex === null) return;
                  setDragOverIndex(index);
                }}
                onDragOver={(e) => {
                  // Nécessaire pour autoriser le drop
                  e.preventDefault();
                  if (dragFromIndex === null) return;
                  setDragOverIndex(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromRaw = e.dataTransfer.getData('text/plain');
                  const from = dragFromIndex ?? (fromRaw ? Number(fromRaw) : null);
                  if (from === null || Number.isNaN(from)) return;
                  moveImage(from, index);
                  setDragFromIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragFromIndex(null);
                  setDragOverIndex(null);
                }}
              >
                <Card className="overflow-hidden h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* First Image Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <CheckCircle className="w-3 h-3" />
                      Photo principale
                    </div>
                  )}

                  {/* Remove Button (toujours visible sur mobile) */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute top-2 right-2 z-20 w-9 h-9 bg-red-500 rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                    aria-label={`Retirer la photo ${index + 1}`}
                    title="Retirer"
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>

                  {/* Drag handle + fallback mobile reorder */}
                  <div className="absolute bottom-2 left-2 z-20 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-white text-[11px]">
                      <GripVertical className="w-4 h-4" />
                      <span className="hidden md:inline">Glisser pour réordonner</span>
                      <span className="md:hidden">Réordonner</span>
                    </div>

                    {/* Fallback buttons (utile mobile où le drag HTML5 est limité) */}
                    <div className="flex gap-1 md:hidden">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          moveImage(index, index - 1);
                        }}
                        disabled={index === 0}
                        className="w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center disabled:opacity-30"
                        aria-label="Monter"
                        title="Monter"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          moveImage(index, index + 1);
                        }}
                        disabled={index === images.length - 1}
                        className="w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center disabled:opacity-30"
                        aria-label="Descendre"
                        title="Descendre"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Overlay on Hover (ne doit pas bloquer les clics sur le bouton Retirer) */}
                  <div className="absolute inset-0 z-10 pointer-events-none bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
