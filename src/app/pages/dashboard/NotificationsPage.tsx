import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { notificationsService, type Notification } from '../../services/notifications.service';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Loader2,
  AlertCircle
} from 'lucide-react';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [user, filter]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (filter === 'unread') {
        const { notifications: unread } = await notificationsService.getUnreadNotifications(user.id);
        setNotifications(unread);
      } else {
        const { notifications: all } = await notificationsService.getUserNotifications(user.id);
        setNotifications(all);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await notificationsService.markAsRead(notificationId);
      if (!error) {
        await loadNotifications();
      }
    } catch (error) {
      console.error('Erreur marquage lecture:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      setProcessing(true);
      const { error } = await notificationsService.markAllAsRead(user.id);
      
      if (error) {
        toast.error('Erreur lors du marquage');
        return;
      }
      
      await loadNotifications();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Erreur marquage tout:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const { error } = await notificationsService.deleteNotification(notificationId);
      
      if (error) {
        toast.error('Erreur lors de la suppression');
        return;
      }
      
      await loadNotifications();
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Une erreur est survenue');
    }
  };

  const handleDeleteRead = async () => {
    if (!user) return;
    
    try {
      setProcessing(true);
      const { error } = await notificationsService.deleteReadNotifications(user.id);
      
      if (error) {
        toast.error('Erreur lors de la suppression');
        return;
      }
      
      await loadNotifications();
      toast.success('Notifications lues supprimées');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout userType={profile?.user_type || 'vendor'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] flex items-center gap-3">
              <Bell className="w-8 h-8" />
              Notifications
            </h1>
            <p className="text-gray-600 mt-2">
              {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Toutes vos notifications sont lues'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={processing}
                variant="outline"
                className="gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Tout marquer comme lu
              </Button>
            )}
            
            <Button
              onClick={handleDeleteRead}
              disabled={processing}
              variant="outline"
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer les lues
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            Toutes ({notifications.length})
          </Button>
          <Button
            onClick={() => setFilter('unread')}
            variant={filter === 'unread' ? 'default' : 'outline'}
            className="gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Non lues ({unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? 'Vous êtes à jour ! Toutes vos notifications ont été lues.'
                : 'Vous n\'avez pas encore reçu de notifications.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <Card
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                      !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getNotificationTypeColor(notification.type)}`}>
                        {notification.type.toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {notification.message}
                            </p>
                            {notification.action_label && notification.action_url && (
                              <Button
                                size="sm"
                                className="mt-3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                              >
                                {notification.action_label}
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                title="Marquer comme lu"
                              >
                                <Check className="w-4 h-4 text-blue-600" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}





