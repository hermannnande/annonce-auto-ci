import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Car,
  Image as ImageIcon,
  FileText,
  Sparkles,
  MapPin,
  DollarSign,
  Calendar,
  Gauge,
  Settings,
  Fuel,
  Palette,
  Shield,
  Zap,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { SearchableSelect } from '../../components/ui/searchable-select';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { ImageUpload } from '../../components/ImageUpload';
import { listingsService } from '../../services/listings.service';
import { useAuth } from '../../context/AuthContext';
import { isProfileComplete, getIncompleteProfileMessage } from '../../lib/profile-utils';
import { toast } from 'sonner';
import { carBrands, carYears, carColors, fuelTypes, transmissions, conditions } from '../../data/vehicleOptions';

export function VendorPublish() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Vehicle Info
    brand: '',
    model: '',
    year: '',
    condition: '',
    
    // Step 2: Technical Details
    mileage: '',
    transmission: '',
    fuel: '',
    doors: '',
    color: '',
    
    // Step 3: Pricing & Location
    price: '',
    location: '',
    description: '',
    
    // Step 4: Images
    images: [] as string[]
  });

  const steps = [
    {
      id: 0,
      title: 'Informations du véhicule',
      subtitle: 'Les bases de votre annonce',
      icon: Car,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 1,
      title: 'Détails techniques',
      subtitle: 'Caractéristiques complètes',
      icon: Settings,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Prix & Localisation',
      subtitle: 'Finalisation de l\'offre',
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 3,
      title: 'Photos du véhicule',
      subtitle: 'Valorisez votre annonce',
      icon: ImageIcon,
      gradient: 'from-orange-500 to-yellow-500'
    }
  ];

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour publier une annonce');
      navigate('/connexion');
      return;
    }

    // Vérifier si le profil est complet
    if (!isProfileComplete(profile)) {
      const message = getIncompleteProfileMessage(profile);
      toast.error(message, {
        description: 'Vous devez compléter votre profil avant de publier',
        action: {
          label: 'Compléter mon profil',
          onClick: () => navigate('/dashboard/vendeur/parametres')
        }
      });
      return;
    }

    // Validation - modèle n'est PAS obligatoire
    if (!formData.brand || !formData.year || !formData.condition) {
      toast.error('Veuillez remplir la marque, l\'année et l\'état du véhicule');
      setCurrentStep(0);
      return;
    }

    if (!formData.mileage || !formData.transmission || !formData.fuel || !formData.color) {
      toast.error('Veuillez remplir tous les détails techniques');
      setCurrentStep(1);
      return;
    }

    if (!formData.price || !formData.location || !formData.description) {
      toast.error('Veuillez remplir le prix, la localisation et la description');
      setCurrentStep(2);
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Veuillez ajouter au moins une photo');
      setCurrentStep(3);
      return;
    }

    try {
      setSubmitting(true);

      // Créer l'annonce
      const { listing, error } = await listingsService.createListing(user.id, {
        title: `${formData.brand} ${formData.model} ${formData.year}`,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        condition: formData.condition as any, // Sera converti dans le service
        mileage: parseInt(formData.mileage),
        transmission: formData.transmission as any, // Sera converti dans le service
        fuel_type: formData.fuel as any, // Sera converti dans le service
        color: formData.color,
        doors: parseInt(formData.doors || '4'),
        price: parseInt(formData.price),
        location: formData.location,
        description: formData.description,
        images: formData.images,
      });

      if (error) {
        throw error;
      }

      toast.success('🎉 Annonce créée avec succès !', {
        description: 'Votre annonce est en attente de validation par nos modérateurs.'
      });

      // Rediriger vers le tableau de bord
      navigate('/dashboard/vendeur/annonces');
      
    } catch (error: any) {
      console.error('Erreur création annonce:', error);
      toast.error(error.message || 'Erreur lors de la création de l\'annonce');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout userType="vendor">
      <div className="space-y-8">
        {/* Hero Section */}
        <div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] rounded-full px-4 py-2 mb-4 text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            Publication Guidée
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2">
            Publiez votre annonce
          </h1>
          <p className="text-gray-600">
            Vendez votre véhicule rapidement avec notre processus simple et efficace
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative max-w-3xl">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                className="h-full bg-gradient-to-r from-[#FACC15] to-[#FBBF24]"
                transition={{ duration: 0.5 }}
              />
            </div>

            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center relative"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 cursor-pointer transition-all duration-300 ${
                    currentStep >= index
                      ? `bg-gradient-to-br ${step.gradient} shadow-lg`
                      : 'bg-white border-2 border-gray-300'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  {currentStep > index ? (
                    <CheckCircle className="w-7 h-7 text-white" />
                  ) : (
                    <step.icon className={`w-7 h-7 ${currentStep >= index ? 'text-white' : 'text-gray-400'}`} />
                  )}
                </motion.div>

                <div className="text-center hidden md:block">
                  <p className={`text-xs font-bold ${
                    currentStep >= index ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 md:p-8 border-0 shadow-xl relative overflow-hidden">
              {/* Background Decoration */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${steps[currentStep].gradient} opacity-5 rounded-full blur-3xl`} />

              {/* Step 1: Vehicle Info */}
              {currentStep === 0 && (
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${steps[0].gradient} flex items-center justify-center`}>
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Informations du véhicule</h2>
                      <p className="text-gray-500 text-sm">Commençons par les informations essentielles</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Marque avec recherche */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                        Marque *
                      </Label>
                      <SearchableSelect
                        value={formData.brand}
                        onValueChange={(value) => updateFormData('brand', value)}
                        options={carBrands}
                        placeholder="Sélectionnez la marque"
                        searchPlaceholder="Rechercher une marque..."
                        emptyMessage="Aucune marque trouvée"
                      />
                    </div>

                    {/* Modèle - NON obligatoire */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full" />
                        Modèle
                      </Label>
                      <Input
                        placeholder="Ex: Camry, Série 5... (optionnel)"
                        value={formData.model}
                        onChange={(e) => updateFormData('model', e.target.value)}
                        className="border-2 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors h-12"
                      />
                    </div>

                    {/* Année avec recherche */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#FACC15]" />
                        Année *
                      </Label>
                      <SearchableSelect
                        value={formData.year}
                        onValueChange={(value) => updateFormData('year', value)}
                        options={carYears}
                        placeholder="Sélectionnez l'année"
                        searchPlaceholder="Rechercher une année..."
                        emptyMessage="Aucune année trouvée"
                      />
                    </div>

                    {/* État du véhicule */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#FACC15]" />
                        État *
                      </Label>
                      <Select value={formData.condition} onValueChange={(value) => updateFormData('condition', value)}>
                        <SelectTrigger className="border-2 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors h-12">
                          <SelectValue placeholder="État du véhicule" />
                        </SelectTrigger>
                        <SelectContent>
                          {conditions.map(cond => (
                            <SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-lg mt-6">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Conseil Pro</p>
                        <p className="text-sm text-blue-700">
                          Soyez précis dans vos informations. Plus votre annonce est détaillée, plus vous attirez d'acheteurs sérieux.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Technical Details */}
              {currentStep === 1 && (
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${steps[1].gradient} flex items-center justify-center`}>
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Détails techniques</h2>
                      <p className="text-gray-500 text-sm">Caractéristiques complètes du véhicule</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-[#FACC15]" />
                        Kilométrage (km) *
                      </Label>
                      <Input
                        type="number"
                        placeholder="Ex: 50000"
                        value={formData.mileage}
                        onChange={(e) => updateFormData('mileage', e.target.value)}
                        className="border-2 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[#FACC15]" />
                        Transmission *
                      </Label>
                      <Select value={formData.transmission} onValueChange={(value) => updateFormData('transmission', value)}>
                        <SelectTrigger className="border-2 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors h-12">
                          <SelectValue placeholder="Type de transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          {transmissions.map(trans => (
                            <SelectItem key={trans.value} value={trans.value}>{trans.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Fuel className="w-4 h-4 text-[#FACC15]" />
                        Carburant *
                      </Label>
                      <Select value={formData.fuel} onValueChange={(value) => updateFormData('fuel', value)}>
                        <SelectTrigger className="border-2 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors h-12">
                          <SelectValue placeholder="Type de carburant" />
                        </SelectTrigger>
                        <SelectContent>
                          {fuelTypes.map(fuel => (
                            <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-[#FACC15]" />
                        Nombre de portes *
                      </Label>
                      <Select value={formData.doors} onValueChange={(value) => updateFormData('doors', value)}>
                        <SelectTrigger className="border-2 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors h-12">
                          <SelectValue placeholder="Nombre de portes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 portes</SelectItem>
                          <SelectItem value="3">3 portes</SelectItem>
                          <SelectItem value="4">4 portes</SelectItem>
                          <SelectItem value="5">5 portes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#FACC15]" />
                        Couleur * {formData.color && <span className="text-xs text-gray-500">({formData.color})</span>}
                      </Label>
                      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                        {[
                          { name: 'Noir', color: 'bg-black' },
                          { name: 'Blanc', color: 'bg-white border-2 border-gray-300' },
                          { name: 'Gris', color: 'bg-gray-500' },
                          { name: 'Argent', color: 'bg-gray-300' },
                          { name: 'Bleu', color: 'bg-blue-600' },
                          { name: 'Rouge', color: 'bg-red-600' },
                          { name: 'Vert', color: 'bg-green-600' },
                          { name: 'Jaune', color: 'bg-yellow-400' },
                          { name: 'Orange', color: 'bg-orange-500' },
                          { name: 'Marron', color: 'bg-amber-700' },
                          { name: 'Beige', color: 'bg-amber-200 border border-gray-300' },
                          { name: 'Doré', color: 'bg-yellow-600' },
                          { name: 'Violet', color: 'bg-purple-600' },
                          { name: 'Rose', color: 'bg-pink-500' },
                          { name: 'Autre', color: 'bg-gradient-to-br from-gray-400 to-gray-600' }
                        ].map(colorOption => (
                          <motion.button
                            key={colorOption.name}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => updateFormData('color', colorOption.name)}
                            className={`relative aspect-square rounded-lg ${colorOption.color} ${
                              formData.color === colorOption.name ? 'ring-4 ring-[#FACC15] ring-offset-2' : ''
                            }`}
                            title={colorOption.name}
                          >
                            {formData.color === colorOption.name && (
                              <CheckCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white drop-shadow-lg" />
                            )}
                            <span className="sr-only">{colorOption.name}</span>
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Cliquez sur une couleur pour la sélectionner</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Location */}
              {currentStep === 2 && (
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${steps[2].gradient} flex items-center justify-center`}>
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Prix & Localisation</h2>
                      <p className="text-gray-500 text-sm">Finalisez votre offre</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#FACC15]" />
                        Prix de vente (FCFA) *
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Ex: 15000000"
                          value={formData.price}
                          onChange={(e) => updateFormData('price', e.target.value)}
                          className="border-2 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors h-12 text-lg pr-20"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                          FCFA
                        </span>
                      </div>
                      {formData.price && (
                        <p className="text-sm text-gray-500">
                          Soit environ {new Intl.NumberFormat('fr-FR').format(parseInt(formData.price))} FCFA
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#FACC15]" />
                        Localisation *
                      </Label>
                      <Input
                        placeholder="Ex: Abidjan, Plateau / Yamoussoukro..."
                        value={formData.location}
                        onChange={(e) => updateFormData('location', e.target.value)}
                        className="border-2 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors h-12"
                      />
                      <p className="text-xs text-gray-500">Indiquez la ville et le quartier où se trouve le véhicule</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#FACC15]" />
                        Description détaillée *
                      </Label>
                      <Textarea
                        placeholder="Décrivez votre véhicule : état général, entretien, équipements, raison de la vente..."
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        className="border-2 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors min-h-[150px] resize-none"
                      />
                      <p className="text-sm text-gray-500">
                        {formData.description.length} / 1000 caractères
                      </p>
                    </div>
                  </div>

                  {/* Pricing Tips */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Conseils de prix</p>
                        <p className="text-sm text-green-700">
                          Consultez les annonces similaires pour fixer un prix compétitif. Un prix juste attire plus d'acheteurs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Images */}
              {currentStep === 3 && (
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${steps[3].gradient} flex items-center justify-center`}>
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Photos du véhicule</h2>
                      <p className="text-gray-500 text-sm">Des photos de qualité augmentent vos chances de vente</p>
                    </div>
                  </div>

                  <ImageUpload
                    onImagesChange={(images) => updateFormData('images', images)}
                    maxImages={10}
                  />

                  {/* Photo Tips */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <ImageIcon className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-900">Conseils photo</p>
                        <ul className="text-sm text-orange-700 space-y-1 mt-2">
                          <li>✓ Prenez des photos en pleine lumière naturelle</li>
                          <li>✓ Photographiez l'extérieur sous plusieurs angles</li>
                          <li>✓ Montrez l'intérieur (tableau de bord, sièges, coffre)</li>
                          <li>✓ Ajoutez des détails (compteur kilométrique, pneus)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="gap-2 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </Button>

                {currentStep === steps.length - 1 ? (
                  <div className="space-y-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full gap-2 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] hover:from-[#FBBF24] hover:to-[#FACC15] shadow-lg hover:shadow-xl px-8"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Publication en cours...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Publier mon annonce
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                    
                    {/* Barre de progression pendant la publication */}
                    {submitting && (
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                          className="h-full bg-gradient-to-r from-[#FACC15] to-[#FBBF24]"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={nextStep}
                    className="gap-2 bg-gradient-to-r from-[#0F172A] to-[#1e293b] hover:from-[#1e293b] hover:to-[#0F172A]"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
