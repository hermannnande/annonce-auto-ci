import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  Flag, 
  Download, 
  Ban,
  CheckCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ConversationWithDetails } from '../../services/messages.service';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';

interface ConversationMonitorPanelProps {
  conversation: ConversationWithDetails;
}

export function ConversationMonitorPanel({ conversation }: ConversationMonitorPanelProps) {
  const [suspiciousLevel, setSuspiciousLevel] = useState<'safe' | 'warning' | 'danger'>('safe');

  // Mots-clés suspects pour détecter les arnaques
  const checkSuspiciousContent = (content: string): string[] => {
    const suspiciousKeywords = [
      'western union',
      'moneygram',
      'virement',
      'paypal',
      'mobile money',
      'envoyer argent',
      'transfert',
      'western',
      'mandat',
      'urgent',
      'rapidement',
      'commission',
      'avance',
      'acompte hors plateforme',
      'rencontre privée',
      'whatsapp',
      'telegram'
    ];

    const found: string[] = [];
    const lowerContent = content.toLowerCase();
    
    suspiciousKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        found.push(keyword);
      }
    });

    return found;
  };

  const getSuspiciousLevel = () => {
    const keywords = checkSuspiciousContent(conversation.last_message || '');
    if (keywords.length > 2) return 'danger';
    if (keywords.length > 0) return 'warning';
    return 'safe';
  };

  const getLevelBadge = (level: 'safe' | 'warning' | 'danger') => {
    const config = {
      safe: { label: 'Sûre', color: 'bg-green-500', icon: CheckCircle },
      warning: { label: 'Attention', color: 'bg-yellow-500', icon: AlertTriangle },
      danger: { label: 'Suspect', color: 'bg-red-500', icon: Flag }
    };

    const { label, color, icon: Icon } = config[level];

    return (
      <Badge className={`${color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const handleExportConversation = () => {
    // Logique d'export à implémenter
    console.log('Export conversation:', conversation.id);
    alert('Export de la conversation en cours...');
  };

  const handleBlockConversation = () => {
    if (confirm('Êtes-vous sûr de vouloir bloquer cette conversation ?')) {
      // Logique de blocage à implémenter
      console.log('Block conversation:', conversation.id);
      alert('Conversation bloquée avec succès');
    }
  };

  const handleFlagConversation = () => {
    // Logique de signalement à implémenter
    console.log('Flag conversation:', conversation.id);
    alert('Conversation signalée pour révision');
  };

  const currentLevel = getSuspiciousLevel();

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#0F172A]">Surveillance de la conversation</h3>
        {getLevelBadge(currentLevel)}
      </div>

      {/* Users Info */}
      <div className="grid grid-cols-2 gap-4">
        {/* Buyer */}
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-600">ACHETEUR</span>
          </div>
          <p className="font-bold text-sm mb-1">{conversation.buyer_name}</p>
          {conversation.buyer_phone && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Phone className="w-3 h-3" />
              {conversation.buyer_phone}
            </div>
          )}
        </Card>

        {/* Seller */}
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-600">VENDEUR</span>
          </div>
          <p className="font-bold text-sm mb-1">{conversation.seller_name}</p>
          {conversation.seller_phone && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Phone className="w-3 h-3" />
              {conversation.seller_phone}
            </div>
          )}
        </Card>
      </div>

      {/* Conversation Stats */}
      <Card className="p-3 bg-gray-50">
        <h4 className="text-sm font-semibold mb-3">Statistiques</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <MessageSquare className="w-3 h-3" />
              <span>Messages</span>
            </div>
            <p className="font-bold">{conversation.total_messages || 0}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <Calendar className="w-3 h-3" />
              <span>Créée</span>
            </div>
            <p className="font-bold text-xs">
              {format(new Date(conversation.created_at), 'dd/MM/yyyy', { locale: fr })}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Activité</span>
            </div>
            <p className="font-bold text-xs">
              {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true, locale: fr })}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Statut</span>
            </div>
            <p className="font-bold text-xs">{conversation.status}</p>
          </div>
        </div>
      </Card>

      {/* Warning if suspicious */}
      {currentLevel !== 'safe' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg border-2 ${
            currentLevel === 'danger' 
              ? 'bg-red-50 border-red-300' 
              : 'bg-yellow-50 border-yellow-300'
          }`}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
              currentLevel === 'danger' ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <div>
              <p className={`font-semibold text-sm mb-1 ${
                currentLevel === 'danger' ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {currentLevel === 'danger' ? 'Activité suspecte détectée' : 'Attention requise'}
              </p>
              <p className={`text-xs ${
                currentLevel === 'danger' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {currentLevel === 'danger' 
                  ? 'Cette conversation contient plusieurs indicateurs d\'arnaque potentielle.'
                  : 'Cette conversation contient des mots-clés à surveiller.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Actions Admin</h4>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportConversation}
          className="w-full justify-start gap-2"
        >
          <Download className="w-4 h-4" />
          Exporter la conversation
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleFlagConversation}
          className="w-full justify-start gap-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
        >
          <Flag className="w-4 h-4" />
          Signaler pour révision
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleBlockConversation}
          className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Ban className="w-4 h-4" />
          Bloquer la conversation
        </Button>
      </div>
    </Card>
  );
}



