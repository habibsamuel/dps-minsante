import { doctors, type Doctor } from './doctors';
import { supabase } from './supabase';
import type { Level } from './triage';

export type ConsultationStatus = 'envoyee' | 'confirmee' | 'terminee';

export type Consultation = {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  city: string;
  createdAt: string;
  status: ConsultationStatus;
  level: Level;
  summary: string[];
};

export const STATUS_LABEL: Record<ConsultationStatus, string> = {
  envoyee: 'Demande envoyée',
  confirmee: 'Confirmée',
  terminee: 'Terminée',
};

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Annuaire : Supabase si configuré, sinon jeu de données local. */
export async function fetchDoctors(): Promise<Doctor[]> {
  if (!supabase) return doctors;
  const { data, error } = await supabase
    .from('doctors')
    .select('id, name, specialty, city, facility, experience_years, languages, availability, available_now, rating, reviews, bio')
    .order('available_now', { ascending: false });
  if (error || !data?.length) return doctors;
  return data.map((row: any) => ({
    id: String(row.id),
    name: row.name,
    specialty: row.specialty,
    city: row.city,
    facility: row.facility,
    experience: row.experience_years ?? 0,
    languages: row.languages ?? ['Français'],
    availability: row.availability ?? 'Sur rendez-vous',
    availableNow: Boolean(row.available_now),
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
    bio: row.bio ?? '',
  }));
}

/** Crée une demande de consultation (Supabase si configuré, sinon locale). */
export async function createConsultation(
  input: Omit<Consultation, 'id' | 'createdAt' | 'status'>,
): Promise<Consultation> {
  const consultation: Consultation = {
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
    status: 'envoyee',
  };

  if (supabase) {
    const { error } = await supabase.from('consultations').insert({
      id: consultation.id,
      doctor_id: consultation.doctorId,
      level: consultation.level,
      summary: consultation.summary,
    });
    if (error) console.warn('consultation non enregistrée côté serveur', error.message);
  }

  return consultation;
}
