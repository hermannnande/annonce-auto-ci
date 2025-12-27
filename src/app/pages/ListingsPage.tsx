import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { VehicleCard } from '../components/VehicleCard';
import { listingsService } from '../services/listings.service';
import type { Listing } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

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

// Liste complète des marques de véhicules (identique à PublishPage et SearchBar)
const CAR_BRANDS = [...pinnedBrands, ...allBrands];

// Générer les années de 1998 à 2026
const YEARS = Array.from({ length: 2026 - 1998 + 1 }, (_, i) => 2026 - i);

export function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allVehicles, setAllVehicles] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandSearch, setBrandSearch] = useState('');
  
  // États des filtres
  const [filters, setFilters] = useState({
    brand: 'all',
    priceMin: '',
    priceMax: '',
    yearMin: 'all',
    yearMax: 'all',
    mileageMin: '',
    mileageMax: '',
    transmission: 'all',
    fuel: 'all',
    condition: 'all',
    search: ''
  });

  // Scroll en haut au chargement de la page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filtrer les marques selon la recherche
  const filteredBrands = CAR_BRANDS.filter(b => 
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Charger les annonces depuis Supabase
  useEffect(() => {
    async function loadListings() {
      try {
        const listings = await listingsService.getAllListings();
        setAllVehicles(listings);
      } catch (error) {
        console.error('Erreur chargement annonces:', error);
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, []);

  // Appliquer les paramètres URL au chargement
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlBrand = searchParams.get('brand') || 'all';
    const urlMinPrice = searchParams.get('minPrice') || '';
    const urlMaxPrice = searchParams.get('maxPrice') || '';
    const urlYear = searchParams.get('year') || '';
    const urlType = searchParams.get('type') || 'all';
    const urlCity = searchParams.get('city') || '';

    setFilters(prev => ({
      ...prev,
      search: urlSearch,
      brand: urlBrand,
      priceMin: urlMinPrice,
      priceMax: urlMaxPrice,
      yearMin: urlYear ? urlYear : prev.yearMin,
      condition: urlType !== 'all' ? urlType : prev.condition,
    }));
  }, [searchParams]);

  // Filtrer les véhicules
  const filteredVehicles = useMemo(() => {
    return allVehicles.filter(vehicle => {

      // Filtre recherche globale
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const brandMatch = vehicle.brand.toLowerCase().includes(searchLower);
        const modelMatch = vehicle.model.toLowerCase().includes(searchLower);
        const locationMatch = vehicle.location.toLowerCase().includes(searchLower);
        const descMatch = (vehicle.description || '').toLowerCase().includes(searchLower);
        
        if (!brandMatch && !modelMatch && !locationMatch && !descMatch) {
          return false;
        }
      }

      // Filtre marque
      if (filters.brand !== 'all' && vehicle.brand.toLowerCase() !== filters.brand) {
        return false;
      }

      // Filtre prix
      if (filters.priceMin && vehicle.price < parseInt(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && vehicle.price > parseInt(filters.priceMax)) {
        return false;
      }

      // Filtre année
      if (filters.yearMin && filters.yearMin !== 'all' && vehicle.year < parseInt(filters.yearMin)) {
        return false;
      }
      if (filters.yearMax && filters.yearMax !== 'all' && vehicle.year > parseInt(filters.yearMax)) {
        return false;
      }

      // Filtre kilométrage
      if (filters.mileageMin && vehicle.mileage < parseInt(filters.mileageMin)) {
        return false;
      }
      if (filters.mileageMax && vehicle.mileage > parseInt(filters.mileageMax)) {
        return false;
      }

      // Filtre transmission
      if (filters.transmission !== 'all') {
        const vehicleTrans = vehicle.transmission.toLowerCase();
        if (filters.transmission === 'auto' && vehicleTrans !== 'automatique') {
          return false;
        }
        if (filters.transmission === 'manual' && vehicleTrans !== 'manuelle') {
          return false;
        }
      }

      // Filtre carburant
      if (filters.fuel !== 'all') {
        const vehicleFuel = (vehicle.fuel || vehicle.fuel_type || '').toLowerCase();
        if (!vehicleFuel.includes(filters.fuel)) {
          return false;
        }
      }

      // Filtre condition
      if (filters.condition !== 'all') {
        const vehicleCondition = vehicle.condition.toLowerCase();
        if (filters.condition === 'neuf' && vehicleCondition !== 'neuf') {
          return false;
        }
        if (filters.condition === 'occasion' && vehicleCondition !== 'occasion') {
          return false;
        }
      }

      return true;
    });
  }, [allVehicles, filters]);

  // Trier les véhicules
  const sortedVehicles = useMemo(() => {
    const sorted = [...filteredVehicles];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'mileage':
        return sorted.sort((a, b) => a.mileage - b.mileage);
      case 'year':
        return sorted.sort((a, b) => b.year - a.year);
      case 'recent':
      default:
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
    }
  }, [filteredVehicles, sortBy]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      brand: 'all',
      priceMin: '',
      priceMax: '',
      yearMin: 'all',
      yearMax: 'all',
      mileageMin: '',
      mileageMax: '',
      transmission: 'all',
      fuel: 'all',
      condition: 'all',
      search: ''
    });
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-4 md:py-8 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl text-[#0F172A] mb-2 font-[var(--font-poppins)] font-bold">
            Toutes les annonces
          </h1>
          <p className="text-gray-600 text-sm md:text-base">{sortedVehicles.length} véhicules disponibles</p>
        </div>

        {/* Barre de recherche en temps réel */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 md:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par marque, modèle, localisation..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 pr-10 h-12 text-base border-2 border-gray-200 focus:border-[#FACC15] transition-all"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {filters.search && (
            <p className="text-sm text-gray-500 mt-2">
              {sortedVehicles.length} résultat{sortedVehicles.length > 1 ? 's' : ''} pour "{filters.search}"
            </p>
          )}
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-4 md:mb-6 flex flex-wrap gap-3 md:gap-4 items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtres de recherche</SheetTitle>
                <SheetDescription>
                  Affinez votre recherche de véhicule
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Marque avec recherche */}
                <div>
                  <Label>Marque</Label>
                  <Select value={filters.brand} onValueChange={(value) => updateFilter('brand', value)}>
                    <SelectTrigger>
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

                {/* Prix */}
                <div>
                  <Label>Prix (FCFA)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input type="number" placeholder="Min" value={filters.priceMin} onChange={(e) => updateFilter('priceMin', e.target.value)} />
                    <Input type="number" placeholder="Max" value={filters.priceMax} onChange={(e) => updateFilter('priceMax', e.target.value)} />
                  </div>
                </div>

                {/* Année (1998 - 2026) */}
                <div>
                  <Label>Année</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Select value={filters.yearMin} onValueChange={(value) => updateFilter('yearMin', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="De" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="all">Toutes</SelectItem>
                        {YEARS.map((y) => (
                          <SelectItem key={`min-${y}`} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filters.yearMax} onValueChange={(value) => updateFilter('yearMax', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="À" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="all">Toutes</SelectItem>
                        {YEARS.map((y) => (
                          <SelectItem key={`max-${y}`} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Kilométrage */}
                <div>
                  <Label>Kilométrage (km)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input type="number" placeholder="Min" value={filters.mileageMin} onChange={(e) => updateFilter('mileageMin', e.target.value)} />
                    <Input type="number" placeholder="Max" value={filters.mileageMax} onChange={(e) => updateFilter('mileageMax', e.target.value)} />
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <Label>Transmission</Label>
                  <Select value={filters.transmission} onValueChange={(value) => updateFilter('transmission', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="auto">Automatique</SelectItem>
                      <SelectItem value="manual">Manuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Carburant */}
                <div>
                  <Label>Carburant</Label>
                  <Select value={filters.fuel} onValueChange={(value) => updateFilter('fuel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="essence">Essence</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="hybrid">Hybride</SelectItem>
                      <SelectItem value="electric">Électrique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition */}
                <div>
                  <Label>État</Label>
                  <Select value={filters.condition} onValueChange={(value) => updateFilter('condition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="neuf">Neuf</SelectItem>
                      <SelectItem value="occasion">Occasion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24]" onClick={applyFilters}>
                  Appliquer les filtres
                </Button>
                <Button className="w-full bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24]" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden md:inline">Trier par:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récent</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="mileage">Kilométrage</SelectItem>
                <SelectItem value="year">Année</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
          {sortedVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 flex-wrap">
          <Button variant="outline" disabled className="text-sm md:text-base">
            Précédent
          </Button>
          <Button className="bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24] text-sm md:text-base">
            1
          </Button>
          <Button variant="outline" className="text-sm md:text-base">2</Button>
          <Button variant="outline" className="text-sm md:text-base">3</Button>
          <Button variant="outline" className="text-sm md:text-base">
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}