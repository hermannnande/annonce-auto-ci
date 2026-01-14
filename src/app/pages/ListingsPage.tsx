import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { VehicleCard } from '../components/VehicleCard';
import { listingsService } from '../services/listings.service';
import type { Listing } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { favoritesService } from '../services/favorites.service';
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
  const [visibleCount, setVisibleCount] = useState(5); // ⚡ Affichage progressif: 5 par 5
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [brandSearch, setBrandSearch] = useState('');
  const ITEMS_PER_PAGE = 30;
  const [currentPage, setCurrentPage] = useState(() => {
    const raw = Number(searchParams.get('page') || '1');
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  });
  
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

  // ⚡ Charger progressivement les annonces
  useEffect(() => {
    let cancelled = false;
    async function loadListings() {
      try {
        const BATCH_SIZE = 5; // ✅ 5 annonces, puis 5 autres, etc.
        const MAX_TOTAL = 180; // garde-fou
        const TIMEOUT_MS = 12_000;

        const withTimeout = async <T,>(p: Promise<T>, ms: number): Promise<T> => {
          return await Promise.race([
            p,
            new Promise<T>((_, reject) =>
              window.setTimeout(() => reject(new Error(`timeout:${ms}ms`)), ms)
            ),
          ]);
        };

        const sleep = async (ms: number) =>
          await new Promise<void>((resolve) => window.setTimeout(resolve, ms));

        setLoadError(null);
        setLoadingMore(false);
        setLoading(true);
        setAllVehicles([]);

        // ✅ Étape 1: charger 5 annonces (affichage immédiat)
        const firstBatch = await withTimeout(
          listingsService.getActiveListingsBatch(undefined, { offset: 0, limit: BATCH_SIZE }),
          TIMEOUT_MS
        );
        if (cancelled) return;
        setAllVehicles(firstBatch);
        setLoading(false);

        // ✅ Étape 2: charger le reste en arrière-plan, par lots de 5
        let offset = firstBatch.length;
        if (offset === 0) return;
        setLoadingMore(true);

        while (!cancelled && offset < MAX_TOTAL) {
          const batch = await withTimeout(
            listingsService.getActiveListingsBatch(undefined, { offset, limit: BATCH_SIZE }),
            TIMEOUT_MS
          );
          if (cancelled) return;
          if (!batch || batch.length === 0) break;

          setAllVehicles((prev) => [...prev, ...batch]);
          offset += batch.length;
          if (batch.length < BATCH_SIZE) break;

          // petit délai pour garder l’UI fluide
          await sleep(150);
        }
        if (!cancelled) setLoadingMore(false);
      } catch (error) {
        console.error('Erreur chargement annonces:', error);
        const msg =
          (error as any)?.message === 'timeout:12000ms'
            ? "Le serveur met trop de temps à répondre. Réessayez."
            : (error as any)?.message || 'Erreur lors du chargement des annonces.';
        setLoadError(msg);
        setLoading(false);
        setLoadingMore(false);
      }
    }
    loadListings();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  // ⚡ Perf: charger les favoris en 1 seule requête (évite N requêtes par carte)
  useEffect(() => {
    let cancelled = false;
    async function loadFavorites() {
      if (!user) {
        setFavoriteIds(new Set());
        return;
      }
      try {
        const ids = await favoritesService.getFavoriteListingIds(user.id);
        if (!cancelled) setFavoriteIds(new Set(ids));
      } catch {
        if (!cancelled) setFavoriteIds(new Set());
      }
    }
    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [user]);

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

  // Mettre à jour la page si le paramètre URL change (ex: partage de lien)
  useEffect(() => {
    const raw = Number(searchParams.get('page') || '1');
    const next = Number.isFinite(raw) && raw > 0 ? raw : 1;
    setCurrentPage(next);
  }, [searchParams]);

  // Filtrer les véhicules
  const filteredVehicles = useMemo(() => {
    return allVehicles.filter(vehicle => {
      const brand = (vehicle.brand ?? '').toString();
      const model = (vehicle.model ?? '').toString();
      const location = (vehicle.location ?? '').toString();
      const transmission = (vehicle.transmission ?? '').toString();
      const condition = (vehicle.condition ?? '').toString();
      const description = ((vehicle as any).description ?? '').toString();
      const fuelAny = ((vehicle as any).fuel ?? (vehicle as any).fuel_type ?? '').toString();

      // Filtre recherche globale
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const brandMatch = brand.toLowerCase().includes(searchLower);
        const modelMatch = model.toLowerCase().includes(searchLower);
        const locationMatch = location.toLowerCase().includes(searchLower);
        const descMatch = description.toLowerCase().includes(searchLower);
        
        if (!brandMatch && !modelMatch && !locationMatch && !descMatch) {
          return false;
        }
      }

      // Filtre marque
      if (filters.brand !== 'all' && brand.toLowerCase() !== filters.brand) {
        return false;
      }

      // Filtre prix
      const price = Number(vehicle.price ?? 0);
      if (filters.priceMin && price < parseInt(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && price > parseInt(filters.priceMax)) {
        return false;
      }

      // Filtre année
      const year = Number(vehicle.year ?? 0);
      if (filters.yearMin && filters.yearMin !== 'all' && year < parseInt(filters.yearMin)) {
        return false;
      }
      if (filters.yearMax && filters.yearMax !== 'all' && year > parseInt(filters.yearMax)) {
        return false;
      }

      // Filtre kilométrage
      const mileage = Number(vehicle.mileage ?? 0);
      if (filters.mileageMin && mileage < parseInt(filters.mileageMin)) {
        return false;
      }
      if (filters.mileageMax && mileage > parseInt(filters.mileageMax)) {
        return false;
      }

      // Filtre transmission
      if (filters.transmission !== 'all') {
        const vehicleTrans = transmission.toLowerCase();
        if (filters.transmission === 'auto' && vehicleTrans !== 'automatique') {
          return false;
        }
        if (filters.transmission === 'manual' && vehicleTrans !== 'manuelle') {
          return false;
        }
      }

      // Filtre carburant
      if (filters.fuel !== 'all') {
        const vehicleFuel = fuelAny.toLowerCase();
        if (!vehicleFuel.includes(filters.fuel)) {
          return false;
        }
      }

      // Filtre condition
      if (filters.condition !== 'all') {
        const vehicleCondition = condition.toLowerCase();
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

    const nowMs = Date.now();
    const getBoostUntil = (v: Listing): string | null => {
      const anyV = v as any;
      return (anyV.boost_until ?? anyV.boost_expires_at ?? null) as string | null;
    };

    const isBoostActive = (v: Listing): boolean => {
      const boostUntil = getBoostUntil(v);
      if (!v.is_boosted || !boostUntil) return false;
      const t = new Date(boostUntil).getTime();
      return Number.isFinite(t) && t > nowMs;
    };

    const compareWithinGroup = (a: Listing, b: Listing) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'mileage':
          return a.mileage - b.mileage;
        case 'year':
          return b.year - a.year;
        case 'recent':
        default: {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        }
      }
    };

    // ✅ Règle business: les annonces sponsorisées (boost actif) restent toujours en tête
    return sorted.sort((a, b) => {
      const aBoost = isBoostActive(a) ? 1 : 0;
      const bBoost = isBoostActive(b) ? 1 : 0;
      if (aBoost !== bBoost) return bBoost - aBoost;
      return compareWithinGroup(a, b);
    });
  }, [filteredVehicles, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedVehicles.length / ITEMS_PER_PAGE));

  // Si les filtres réduisent le nombre de pages, on ramène la page courante dans les limites
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedVehicles.slice(start, end);
  }, [sortedVehicles, currentPage]);

  // ✅ Reset quand l’utilisateur change page/tri/filtres (mais PAS quand de nouvelles données arrivent)
  useEffect(() => {
    setVisibleCount(5);
  }, [currentPage, sortBy, filters]);

  // ⚡ Affichage progressif: 5 puis +5, +5, +5… dès que les données sont dispo
  useEffect(() => {
    const len = paginatedVehicles.length;
    if (len <= 5) return;
    if (visibleCount >= len) return;

    const id = window.setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= len) return prev;
        return Math.min(len, prev + 5);
      });
    }, 220);

    return () => window.clearInterval(id);
    // NOTE: on dépend de len (pas du tableau) pour éviter de relancer trop souvent
  }, [paginatedVehicles.length, visibleCount]);

  const displayedVehicles = useMemo(() => {
    return paginatedVehicles.slice(0, Math.max(0, Math.min(paginatedVehicles.length, visibleCount)));
  }, [paginatedVehicles, visibleCount]);

  const goToPage = (page: number) => {
    const next = Math.min(totalPages, Math.max(1, page));
    setCurrentPage(next);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(next));
    setSearchParams(nextParams, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    // Affiche: 1 ... (p-1) p (p+1) ... last (max 7 boutons)
    const pages: (number | '...')[] = [];
    const last = totalPages;
    if (last <= 7) {
      for (let i = 1; i <= last; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(last - 1, currentPage + 1);

    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < last - 1) pages.push('...');
    pages.push(last);
    return pages;
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
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
    setCurrentPage(1);
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
          <p className="text-gray-600 text-sm md:text-base">
            {sortedVehicles.length} véhicule{sortedVehicles.length > 1 ? 's' : ''} disponible{sortedVehicles.length > 1 ? 's' : ''}
            {sortedVehicles.length > 0 && (
              <> — page {currentPage}/{totalPages}</>
            )}
          </p>
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
          {loadError ? (
            <div className="col-span-full text-center text-gray-600 py-10 space-y-3">
              <div className="text-red-600 font-medium">{loadError}</div>
              <Button
                className="bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24]"
                onClick={() => setReloadToken((v) => v + 1)}
              >
                Réessayer
              </Button>
            </div>
          ) : loading ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              Chargement des annonces...
            </div>
          ) : displayedVehicles.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              Aucune annonce trouvée.
            </div>
          ) : (
            displayedVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                skipFavoriteCheck={!!user}
                initialIsFavorite={!!user && favoriteIds.has(vehicle.id)}
              />
            ))
          )}
        </div>

        {!loading && !loadError && loadingMore && (
          <div className="text-center text-sm text-gray-500 pb-6">
            Chargement de plus d’annonces…
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-2 flex-wrap items-center">
            <Button
              variant="outline"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="text-sm md:text-base"
            >
              Précédent
            </Button>

            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
              const pageNum = p as number;
              const isActive = pageNum === currentPage;
              return (
                <Button
                  key={pageNum}
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => goToPage(pageNum)}
                  className={isActive ? 'bg-[#FACC15] text-[#0F172A] hover:bg-[#FBBF24] text-sm md:text-base' : 'text-sm md:text-base'}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="text-sm md:text-base"
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}