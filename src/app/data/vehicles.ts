export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: 'Automatique' | 'Manuelle';
  fuel: 'Essence' | 'Diesel' | 'Hybride' | 'Électrique';
  location: string;
  condition: 'Neuf' | 'Occasion';
  images: string[];
  badge?: 'Urgent' | 'Top annonce' | 'Bonne affaire';
  description?: string;
  doors?: number;
  color?: string;
  seller: {
    name: string;
    type: 'Particulier' | 'Professionnel';
    verified: boolean;
    phone?: string;
  };
}

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    price: 18500000,
    mileage: 12000,
    transmission: 'Automatique',
    fuel: 'Essence',
    location: 'Abidjan, Cocody',
    condition: 'Occasion',
    badge: 'Top annonce',
    images: ['https://images.unsplash.com/photo-1648178326814-9a38f772c326?w=800'],
    description: 'Véhicule en excellent état, entretien régulier chez Toyota',
    doors: 4,
    color: 'Gris',
    seller: {
      name: 'Auto Premium CI',
      type: 'Professionnel',
      verified: true,
      phone: '+225 07 00 00 00 00'
    }
  },
  {
    id: '2',
    brand: 'Mercedes-Benz',
    model: 'GLE 350',
    year: 2022,
    price: 35000000,
    mileage: 25000,
    transmission: 'Automatique',
    fuel: 'Diesel',
    location: 'Abidjan, Plateau',
    condition: 'Occasion',
    badge: 'Urgent',
    images: ['https://images.unsplash.com/photo-1639280791656-5f8506ff21d2?w=800'],
    description: 'SUV de luxe, toutes options, carnet d\'entretien complet',
    doors: 5,
    color: 'Noir',
    seller: {
      name: 'Kouassi Jean',
      type: 'Particulier',
      verified: true,
      phone: '+225 05 00 00 00 00'
    }
  },
  {
    id: '3',
    brand: 'BMW',
    model: 'Série 5',
    year: 2021,
    price: 28000000,
    mileage: 35000,
    transmission: 'Automatique',
    fuel: 'Essence',
    location: 'Abidjan, Marcory',
    condition: 'Occasion',
    images: ['https://images.unsplash.com/photo-1707407772603-274cc5cf18f4?w=800'],
    description: 'Berline sportive, équipements premium, très bon état',
    doors: 4,
    color: 'Bleu',
    seller: {
      name: 'Cars & More',
      type: 'Professionnel',
      verified: true,
      phone: '+225 07 11 11 11 11'
    }
  },
  {
    id: '4',
    brand: 'Ford',
    model: 'Ranger',
    year: 2023,
    price: 22000000,
    mileage: 5000,
    transmission: 'Manuelle',
    fuel: 'Diesel',
    location: 'Abidjan, Yopougon',
    condition: 'Neuf',
    badge: 'Bonne affaire',
    images: ['https://images.unsplash.com/photo-1551830820-330a71b99659?w=800'],
    description: 'Pick-up neuf, idéal pour le transport et les chantiers',
    doors: 4,
    color: 'Blanc',
    seller: {
      name: 'Ford Ivory Motors',
      type: 'Professionnel',
      verified: true,
      phone: '+225 07 22 22 22 22'
    }
  },
  {
    id: '5',
    brand: 'Porsche',
    model: '911 Carrera',
    year: 2022,
    price: 65000000,
    mileage: 8000,
    transmission: 'Automatique',
    fuel: 'Essence',
    location: 'Abidjan, Riviera',
    condition: 'Occasion',
    badge: 'Top annonce',
    images: ['https://images.unsplash.com/photo-1541348263662-e068662d82af?w=800'],
    description: 'Voiture de sport exceptionnelle, état impeccable',
    doors: 2,
    color: 'Rouge',
    seller: {
      name: 'Luxury Auto CI',
      type: 'Professionnel',
      verified: true,
      phone: '+225 07 33 33 33 33'
    }
  },
  {
    id: '6',
    brand: 'Honda',
    model: 'CR-V',
    year: 2021,
    price: 16500000,
    mileage: 42000,
    transmission: 'Automatique',
    fuel: 'Essence',
    location: 'Abidjan, Adjamé',
    condition: 'Occasion',
    images: ['https://images.unsplash.com/photo-1639280791656-5f8506ff21d2?w=800'],
    description: 'SUV familial spacieux, très fiable',
    doors: 5,
    color: 'Argent',
    seller: {
      name: 'N\'Guessan Marie',
      type: 'Particulier',
      verified: false,
      phone: '+225 05 44 44 44 44'
    }
  }
];
