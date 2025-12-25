import { Reply } from 'lucide-react';
import { Message } from '../../services/messages.service';

interface QuotedMessageProps {
  message: Message;
  compact?: boolean;
}

export function QuotedMessage({ message, compact = false }: QuotedMessageProps) {
  return (
    <div className={`flex items-start gap-2 ${compact ? 'p-2' : 'p-3'} bg-gray-100/50 border-l-4 border-[#FACC15] rounded-r-lg`}>
      <Reply className={`flex-shrink-0 ${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 mt-0.5`} />
      
      <div className="flex-1 min-w-0">
        <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
          {message.sender?.full_name || 'Utilisateur'}
        </p>
        
        {message.content && (
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 truncate`}>
            {message.content}
          </p>
        )}
        
        {message.attachments && message.attachments.length > 0 && (
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 italic`}>
            {message.attachments.length === 1 
              ? `📎 ${message.attachments[0].name}`
              : `📎 ${message.attachments.length} pièces jointes`
            }
          </p>
        )}
      </div>
    </div>
  );
}



