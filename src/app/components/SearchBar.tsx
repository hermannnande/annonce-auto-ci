import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

// Liste des marques de base (triées alphabétiquement)
const allBrands = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti', 'Buick',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Dacia', 'Daewoo', 'Daihatsu', 'Dodge',
  'Ferrari', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hummer', 'Hyundai',
  'Infiniti', 'Isuzu', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus',
  'Lincoln', 'Lotus', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi',
  'Nissan', 'Opel', 'Peugeot', 'Porsche', 'RAM', 'Renault', 'Rolls-Royce', 'Saab',
  'Saturn', 'Scion', 'Seat', 'Skoda', 'Smart', 'Subaru', 'Suzuki', 'Tesla',
  'Toyota', 'Volkswagen', 'Volvo'
].sort();

// Options épinglées en haut (toujours visibles en premier)
const pinnedBrands = ['Voiture chinoise', 'Autre'];

// Liste complète des marques de véhicules (identique à PublishPage)
const CAR_BRANDS = [...pinnedBrands, ...allBrands];

// Générer les années de 1998 à 2026
const YEARS = Array.from({ length: 2026 - 1998 + 1 }, (_, i) => 2026 - i);

export function SearchBar() {
  const navigate = useNavigate();
  const [brand, setBrand] = useState('all');
  const [brandSearch, setBrandSearch] = useState('');
  const [model, setModel] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [year, setYear] = useState('all');
  const [type, setType] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filtrer les marques selon la recherche
  const filteredBrands = CAR_BRANDS.filter(b => 
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const handleSearch = () => {
    // Construire les paramètres de recherche
    const params = new URLSearchParams();
    
    if (model) params.append('search', model);
    if (brand && brand !== 'all') params.append('brand', brand);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (year && year !== 'all') params.append('year', year);
    if (type && type !== 'all') params.append('type', type);
    
    // Naviguer vers la page des annonces avec les paramètres
    navigate(`/annonces?${params.toString()}`);
  };

  const handleQuickSearch = (searchTerm: string) => {
    // Recherche rapide
    navigate(`/annonces?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[#FACC15]/20 via-[#FBBF24]/20 to-[#FACC15]/20 rounded-3xl blur-xl opacity-75" />
      
      {/* Glass Morphism Container */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 max-w-6xl mx-auto border border-white/50">
        
        {/* Simple Search - Always Visible */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="flex-1 w-full">
            <Input
              type="text"
              placeholder="Rechercher une marque, un modèle, une localisation..."
              value={model}
              onChange={(e) => setModel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="h-14 border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors bg-white/50 backdrop-blur-sm text-base px-6"
            />
          </div>

          {/* Search Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSearch}
              className="w-full md:w-auto h-14 px-8 bg-gradient-to-r from-[#0F172A] to-[#1e293b] hover:from-[#FACC15] hover:to-[#FBBF24] text-white hover:text-[#0F172A] shadow-xl hover:shadow-2xl hover:shadow-[#FACC15]/50 transition-all duration-300 font-bold group whitespace-nowrap"
            >
              <Search className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Rechercher
            </Button>
          </motion.div>

          {/* Advanced Search Toggle Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="w-full md:w-auto h-14 px-6 border-2 border-[#FACC15] bg-gradient-to-r from-[#FACC15] to-[#FBBF24] hover:from-[#FBBF24] hover:to-[#FACC15] text-[#0F172A] shadow-lg hover:shadow-xl transition-all duration-300 font-bold group whitespace-nowrap"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Recherche Avancée
              <ChevronDown className={`w-5 h-5 ml-2 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </motion.div>
        </div>

        {/* Advanced Filters - Collapsible */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Marque avec recherche */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                      Marque
                    </label>
                    <Select value={brand} onValueChange={setBrand}>
                      <SelectTrigger className="border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors bg-white/50 backdrop-blur-sm">
                        <SelectValue placeholder="Toutes les marques" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Barre de recherche */}
                        <div className="px-2 py-2 border-b sticky top-0 bg-white z-10">
                          <Input
                            placeholder="Rechercher une marque..."
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                            className="h-8 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <SelectItem value="all">Toutes les marques</SelectItem>
                        
                        {/* Options épinglées */}
                        {!brandSearch && pinnedBrands.map((brandName) => (
                          <SelectItem key={brandName} value={brandName.toLowerCase().replace(/\s+/g, '-')}>
                            {brandName}
                          </SelectItem>
                        ))}
                        
                        {/* Séparateur */}
                        {!brandSearch && (
                          <div className="px-2 py-1">
                            <div className="border-t border-gray-200"></div>
                          </div>
                        )}
                        
                        {/* Marques filtrées */}
                        {filteredBrands.filter(b => !pinnedBrands.includes(b)).map((brandName) => (
                          <SelectItem key={brandName} value={brandName.toLowerCase().replace(/\s+/g, '-')}>
                            {brandName}
                          </SelectItem>
                        ))}
                        
                        {filteredBrands.length === 0 && (
                          <div className="px-2 py-4 text-sm text-gray-500 text-center">
                            Aucune marque trouvée
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prix Min */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                      Prix minimum
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors bg-white/50 backdrop-blur-sm pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                        FCFA
                      </span>
                    </div>
                  </div>

                  {/* Prix Max */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                      Prix maximum
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="∞"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors bg-white/50 backdrop-blur-sm pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                        FCFA
                      </span>
                    </div>
                  </div>

                  {/* Année (1998 - 2026) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                      Année
                    </label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors bg-white/50 backdrop-blur-sm">
                        <SelectValue placeholder="Toutes les années" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="all">Toutes les années</SelectItem>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* État */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#FACC15] rounded-full" />
                      État
                    </label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="border-2 border-gray-200 hover:border-[#FACC15] focus:border-[#FACC15] transition-colors bg-white/50 backdrop-blur-sm">
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="neuf">Neuf</SelectItem>
                        <SelectItem value="occasion">Occasion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Filters - Always visible */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 font-medium">Recherches populaires :</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Toyota Camry',
              'SUV Occasion',
              'Mercedes Neuf',
              'Prix < 20M',
              'Automatique',
              'Diesel'
            ].map((tag) => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-[#FACC15]/20 hover:to-[#FBBF24]/20 rounded-full text-sm font-medium text-gray-700 hover:text-[#0F172A] border border-gray-200 hover:border-[#FACC15] transition-all duration-300"
                onClick={() => handleQuickSearch(tag)}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}