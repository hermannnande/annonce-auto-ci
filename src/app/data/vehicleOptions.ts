// Liste complète des marques de véhicules
const allBrands = [
  'Audi',
  'BMW',
  'Mercedes-Benz',
  'Volkswagen',
  'Toyota',
  'Honda',
  'Nissan',
  'Mazda',
  'Mitsubishi',
  'Subaru',
  'Suzuki',
  'Lexus',
  'Infiniti',
  'Acura',
  'Ford',
  'Chevrolet',
  'Dodge',
  'Jeep',
  'Ram',
  'GMC',
  'Cadillac',
  'Lincoln',
  'Tesla',
  'Peugeot',
  'Renault',
  'Citroën',
  'Opel',
  'Fiat',
  'Alfa Romeo',
  'Lancia',
  'Ferrari',
  'Lamborghini',
  'Maserati',
  'Bugatti',
  'Porsche',
  'Hyundai',
  'Kia',
  'Genesis',
  'SsangYong',
  'Land Rover',
  'Jaguar',
  'Mini',
  'Rolls-Royce',
  'Bentley',
  'Aston Martin',
  'McLaren',
  'Lotus',
  'MG',
  'Volvo',
  'Saab',
  'Skoda',
  'Seat',
  'Dacia',
  'Lada',
  'GAZ',
  'UAZ',
  'Chery',
  'Geely',
  'BYD',
  'Great Wall',
  'Haval',
  'JAC',
  'Lifan',
  'Brilliance',
  'Mahindra',
  'Tata',
  'Maruti Suzuki',
  'Proton',
  'Perodua',
  'Isuzu',
  'Daihatsu',
].sort();

// Options épinglées en haut (toujours visibles en premier)
const pinnedBrands = ['Voiture chinoise', 'Autre'];

// Liste finale avec les options épinglées en haut
export const carBrands = [...pinnedBrands, '---', ...allBrands];

// Générer les années de 1998 à 2026
export const carYears = Array.from({ length: 2026 - 1998 + 1 }, (_, i) => (2026 - i).toString());

// Couleurs de véhicules
export const carColors = [
  'Noir',
  'Blanc',
  'Gris',
  'Argent',
  'Bleu',
  'Rouge',
  'Vert',
  'Jaune',
  'Orange',
  'Marron',
  'Beige',
  'Doré',
  'Violet',
  'Rose',
  'Autre',
];

// Types de carburant
export const fuelTypes = [
  { value: 'essence', label: 'Essence' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electrique', label: 'Électrique' },
  { value: 'hybride', label: 'Hybride' },
];

// Types de transmission
export const transmissions = [
  { value: 'manuelle', label: 'Manuelle' },
  { value: 'automatique', label: 'Automatique' },
];

// État du véhicule
export const conditions = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'occasion', label: 'Occasion' },
];

