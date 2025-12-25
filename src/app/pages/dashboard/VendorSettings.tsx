import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Lock,
  CreditCard,
  Globe,
  Save,
  Camera,
  Building,
  FileText,
  Shield,
  CheckCircle,
} from 'lucide-react';

// Types pour les paramètres utilisateur
interface UserSettings {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  avatar?: string;
  // Notifications
  notifyViews: boolean;
  notifyFavorites: boolean;
  notifyMessages: boolean;
  notifyModeration: boolean;
  notifyBoostExpired: boolean;
  notifyLowCredits: boolean;
  // Business
  accountType: string;
  companyName?: string;
  companyId?: string;
  website?: string;
  companyDescription?: string;
}

const SETTINGS_KEY = 'annonceauto_user_settings';

export function VendorSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, profile, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // États pour le formulaire
  const [settings, setSettings] = useState<UserSettings>({
    fullName: '',
    email: '',
    phone: '',
    city: 'Abidjan',
    address: '',
    avatar: '',
    notifyViews: true,
    notifyFavorites: true,
    notifyMessages: true,
    notifyModeration: true,
    notifyBoostExpired: true,
    notifyLowCredits: true,
    accountType: 'Particulier',
    companyName: '',
    companyId: '',
    website: '',
    companyDescription: '',
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, [user, profile]);

  const loadSettings = () => {
    if (profile) {
      // Charger TOUS les paramètres depuis le profil Supabase
      setSettings(prev => ({
        ...prev,
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatar: profile.avatar_url || '',
        address: profile.address || '',
        city: profile.city || 'Abidjan',
        // Notifications
        notifyViews: profile.notify_views ?? true,
        notifyFavorites: profile.notify_favorites ?? true,
        notifyMessages: profile.notify_messages ?? true,
        notifyModeration: profile.notify_moderation ?? true,
        notifyBoostExpired: profile.notify_boost_expired ?? true,
        notifyLowCredits: profile.notify_low_credits ?? true,
        // Entreprise
        accountType: profile.account_type || 'Particulier',
        companyName: profile.company_name || '',
        companyId: profile.company_id || '',
        website: profile.website || '',
        companyDescription: profile.company_description || '',
      }));
    }
  };

  const saveSettings = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      // Sauvegarder TOUS les paramètres dans Supabase
      const { error } = await updateProfile({
        full_name: settings.fullName,
        email: settings.email,
        phone: settings.phone,
        avatar_url: settings.avatar,
        address: settings.address,
        city: settings.city,
        // Notifications
        notify_views: settings.notifyViews,
        notify_favorites: settings.notifyFavorites,
        notify_messages: settings.notifyMessages,
        notify_moderation: settings.notifyModeration,
        notify_boost_expired: settings.notifyBoostExpired,
        notify_low_credits: settings.notifyLowCredits,
        // Entreprise
        account_type: settings.accountType,
        company_name: settings.companyName,
        company_id: settings.companyId,
        website: settings.website,
        company_description: settings.companyDescription,
      });

      if (error) {
        toast.error('Erreur lors de l\'enregistrement');
        console.error('Erreur sauvegarde:', error);
        return;
      }

      toast.success('Paramètres enregistrés avec succès !');
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Une erreur est survenue');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 5MB');
      return;
    }

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image (JPG, PNG ou GIF)');
      return;
    }

    try {
      toast.loading('Téléchargement de la photo...');
      
      // Importer le service de storage
      const { storageService } = await import('../../services/storage.service');
      
      // Upload vers Supabase Storage
      const { url, error } = await storageService.uploadProfileImage(file, user!.id);
      
      if (error || !url) {
        toast.error('Erreur lors du téléchargement de la photo');
        console.error('Erreur upload:', error);
        return;
      }

      // Mettre à jour l'avatar dans l'état local
      setSettings(prev => ({ ...prev, avatar: url }));
      
      // Sauvegarder dans Supabase
      await updateProfile({ avatar_url: url });
      
      toast.dismiss();
      toast.success('Photo de profil mise à jour !');
    } catch (error) {
      console.error('Erreur téléchargement photo:', error);
      toast.dismiss();
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current) {
      toast.error('Veuillez entrer votre mot de passe actuel');
      return;
    }
    
    if (!passwords.new || passwords.new.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (passwords.new !== passwords.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      // Importer le service d'auth
      const { authService } = await import('../../services/auth.service');
      
      // Changer le mot de passe avec Supabase Auth
      const { error } = await authService.updatePassword(passwords.new);
      
      if (error) {
        toast.error('Erreur lors du changement de mot de passe');
        console.error('Erreur:', error);
        return;
      }
      
      toast.success('Mot de passe modifié avec succès !');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      toast.error('Une erreur est survenue');
    }
  };

  const getInitials = () => {
    if (settings.fullName) {
      return settings.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'business', label: 'Entreprise', icon: Building },
  ];

  return (
    <DashboardLayout userType="vendor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Paramètres</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Avatar */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-[#0F172A] mb-6">Photo de profil</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {settings.avatar ? (
                    <img
                      src={settings.avatar}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-[#FACC15] to-[#FBBF24] rounded-full flex items-center justify-center text-3xl font-bold text-[#0F172A]">
                      {getInitials()}
                    </div>
                  )}
                  <button
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#0F172A] rounded-full flex items-center justify-center text-white hover:bg-[#1e293b] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Changer la photo</p>
                  <p className="text-sm text-gray-500 mb-3">
                    JPG, PNG ou GIF. Max 5MB.
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Télécharger
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handlePhotoUpload}
                    accept="image/*"
                  />
                </div>
              </div>
            </Card>

            {/* Personal Info */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-[#0F172A] mb-6">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nom complet
                    </div>
                  </label>
                  <input
                    type="text"
                    value={settings.fullName}
                    onChange={(e) => setSettings(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Téléphone
                    </div>
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Ville
                    </div>
                  </label>
                  <select
                    value={settings.city}
                    onChange={(e) => setSettings(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  >
                    <option>Abidjan</option>
                    <option>Yamoussoukro</option>
                    <option>Bouaké</option>
                    <option>San-Pédro</option>
                    <option>Daloa</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Adresse
                    </div>
                  </label>
                  <textarea
                    rows={3}
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={saveSettings}
                  className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold px-8"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold text-[#0F172A] mb-6">Préférences de notification</h3>
              <div className="space-y-6">
                {[
                  { title: 'Nouvelles vues', desc: 'Recevoir une notification quand quelqu\'un consulte vos annonces' },
                  { title: 'Nouveaux favoris', desc: 'Être notifié quand un utilisateur ajoute votre annonce en favori' },
                  { title: 'Messages', desc: 'Recevoir les messages des acheteurs potentiels' },
                  { title: 'Modération', desc: 'Être informé du statut de validation de vos annonces' },
                  { title: 'Boost expiré', desc: 'Notification quand un boost arrive à expiration' },
                  { title: 'Crédits faibles', desc: 'Alerte quand votre solde de crédits est faible' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between pb-6 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={settings[`notify${item.title.replace(/\s+/g, '')}`]}
                        onChange={(e) => setSettings(prev => ({ ...prev, [`notify${item.title.replace(/\s+/g, '')}`]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FACC15]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FACC15]"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={saveSettings}
                  className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold px-8"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Change Password */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-[#0F172A] mb-6">Changer le mot de passe</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handlePasswordChange}
                  className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold px-8"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Changer le mot de passe
                </Button>
              </div>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">
                    Authentification à deux facteurs
                  </h3>
                  <p className="text-gray-600">
                    Ajoutez une couche de sécurité supplémentaire à votre compte
                  </p>
                </div>
                <Button variant="outline" className="border-[#FACC15] text-[#FACC15] hover:bg-[#FACC15] hover:text-[#0F172A]">
                  <Shield className="w-4 h-4 mr-2" />
                  Activer
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Business Tab */}
        {activeTab === 'business' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold text-[#0F172A] mb-6">Informations professionnelles</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de compte
                  </label>
                  <select
                    value={settings.accountType}
                    onChange={(e) => setSettings(prev => ({ ...prev, accountType: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  >
                    <option>Particulier</option>
                    <option>Professionnel</option>
                    <option>Concessionnaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Nom de l'entreprise
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="Optionnel"
                    value={settings.companyName}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Numéro SIRET/SIREN
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="Optionnel"
                    value={settings.companyId}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Site web
                    </div>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.example.com"
                    value={settings.website}
                    onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description de l'entreprise
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Présentez votre activité..."
                    value={settings.companyDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyDescription: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={saveSettings}
                  className="bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0F172A] font-bold px-8"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}