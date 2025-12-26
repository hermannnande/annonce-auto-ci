import { motion } from 'motion/react';
import { FileText, Download, Image as ImageIcon, Video, X } from 'lucide-react';
import { MessageAttachment as AttachmentType } from '../../services/messages.service';

interface MessageAttachmentProps {
  attachment: AttachmentType;
  onRemove?: () => void;
  compact?: boolean;
}

export function MessageAttachment({ attachment, onRemove, compact = false }: MessageAttachmentProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    window.open(attachment.url, '_blank');
  };

  // Image
  if (attachment.type === 'image') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group"
      >
        <img
          src={attachment.url}
          alt={attachment.name}
          className={`rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity ${
            compact ? 'w-32 h-32' : 'max-w-sm max-h-64'
          }`}
          onClick={handleDownload}
        />
        
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-xs truncate">{attachment.name}</p>
          {attachment.size && (
            <p className="text-white/80 text-xs">{formatFileSize(attachment.size)}</p>
          )}
        </div>
      </motion.div>
    );
  }

  // Vidéo
  if (attachment.type === 'video') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group"
      >
        <video
          src={attachment.url}
          controls
          className={`rounded-lg ${compact ? 'w-48 h-32' : 'max-w-md max-h-64'}`}
        />
        
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }

  // Document
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-[#FACC15] transition-colors group"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <FileText className="w-5 h-5 text-gray-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
        {attachment.size && (
          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleDownload}
          className="p-1.5 text-[#FACC15] hover:bg-yellow-50 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}




