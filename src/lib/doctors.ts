export type Doctor = {
  id: string;
  name: string;
  specialty: 'Généraliste' | 'Pédiatre' | 'Gynécologie' | 'Dermatologie';
  city: string;
  facility: string;
  experience: number;
  languages: string[];
  availability: string;
  availableNow: boolean;
  rating: number;
  reviews: number;
  bio: string;
};

export const doctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr Amina Ngo Bassong',
    specialty: 'Généraliste',
    city: 'Douala',
    facility: 'Clinique Bonanjo',
    experience: 12,
    languages: ['Français', 'Anglais'],
    availability: 'Disponible maintenant',
    availableNow: true,
    rating: 4.8,
    reviews: 214,
    bio: 'Médecine générale et suivi des maladies infectieuses courantes. Reçoit adultes et adolescents.',
  },
  {
    id: 'd2',
    name: 'Dr Paul Etoundi',
    specialty: 'Pédiatre',
    city: 'Yaoundé',
    facility: 'CHU de Yaoundé',
    experience: 15,
    languages: ['Français', 'Ewondo'],
    availability: 'Disponible maintenant',
    availableNow: true,
    rating: 4.9,
    reviews: 331,
    bio: 'Suivi du nourrisson, fièvres de l’enfant, vaccination et nutrition.',
  },
  {
    id: 'd3',
    name: 'Dr Sandrine Mbarga',
    specialty: 'Gynécologie',
    city: 'Yaoundé',
    facility: 'Hôpital Central',
    experience: 10,
    languages: ['Français'],
    availability: "Aujourd'hui, 14h – 18h",
    availableNow: false,
    rating: 4.7,
    reviews: 158,
    bio: 'Suivi de grossesse, santé de la femme, contraception et infections gynécologiques.',
  },
  {
    id: 'd4',
    name: 'Dr Ibrahim Sali',
    specialty: 'Généraliste',
    city: 'Garoua',
    facility: 'Hôpital Régional de Garoua',
    experience: 8,
    languages: ['Français', 'Fulfulde'],
    availability: 'Disponible maintenant',
    availableNow: true,
    rating: 4.6,
    reviews: 96,
    bio: 'Médecine générale, paludisme, diarrhées et déshydratation.',
  },
  {
    id: 'd5',
    name: 'Dr Chantal Tchoumi',
    specialty: 'Généraliste',
    city: 'Bafoussam',
    facility: 'Clinique de la Famille',
    experience: 9,
    languages: ['Français'],
    availability: "Aujourd'hui, 16h – 20h",
    availableNow: false,
    rating: 4.7,
    reviews: 142,
    bio: 'Suivi des adultes, hypertension et diabète de proximité.',
  },
  {
    id: 'd6',
    name: 'Dr Grace Ayuk',
    specialty: 'Pédiatre',
    city: 'Buea',
    facility: 'Buea Regional Hospital',
    experience: 11,
    languages: ['Anglais', 'Français'],
    availability: 'Disponible maintenant',
    availableNow: true,
    rating: 4.8,
    reviews: 187,
    bio: 'Pediatric consultations in English and French. Child fever, asthma and growth follow-up.',
  },
  {
    id: 'd7',
    name: 'Dr Serge Kana',
    specialty: 'Dermatologie',
    city: 'Douala',
    facility: 'Centre Médical Akwa',
    experience: 7,
    languages: ['Français'],
    availability: 'Demain matin',
    availableNow: false,
    rating: 4.5,
    reviews: 74,
    bio: 'Éruptions cutanées, mycoses, eczéma et allergies de la peau.',
  },
  {
    id: 'd8',
    name: 'Dr Estelle Ngo',
    specialty: 'Généraliste',
    city: 'Kribi',
    facility: 'Poste de santé de Mpangou',
    experience: 5,
    languages: ['Français', 'Anglais'],
    availability: 'Disponible maintenant',
    availableNow: true,
    rating: 4.6,
    reviews: 63,
    bio: 'Soins de proximité, prévention et orientation vers les spécialistes.',
  },
];

export type SpecialtyFilter = 'Tous' | 'Généraliste' | 'Pédiatre' | 'Gynécologie' | 'Dermatologie';

export const specialties: SpecialtyFilter[] = [
  'Tous',
  'Généraliste',
  'Pédiatre',
  'Gynécologie',
  'Dermatologie',
];

export function findDoctor(id: string): Doctor | undefined {
  return doctors.find((d) => d.id === id);
}

export function initials(name: string): string {
  return name
    .replace(/^Dr\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
