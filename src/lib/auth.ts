import { supabase } from './supabase';

export type AccountType = 'patient' | 'praticien' | 'pharmacie' | 'fosa';
export type Profession = 'medecin' | 'infirmier' | 'sage_femme';
export type FosaKind = 'hopital' | 'centre_sante' | 'clinique' | 'poste_sante';

export type RegisterData = {
  type: AccountType;
  /** Patient / praticien : nom complet. Pharmacie / FOSA : nom du responsable. */
  name: string;
  phone: string;
  city: string;
  /** Praticien */
  profession?: Profession;
  specialty?: string;
  structure?: string;
  /** Pharmacie / FOSA */
  establishment?: string;
  fosaKind?: FosaKind;
  address?: string;
  /** N° d'ordre (praticien), d'autorisation (pharmacie) ou d'agrément (FOSA). */
  licenseNumber?: string;
  acceptedTerms: boolean;
};

export type Choice<T extends string> = { value: T; label: string; sub?: string };

export const ACCOUNT_TYPES: Choice<AccountType>[] = [
  { value: 'patient', label: 'Patient', sub: 'Je cherche des soins et des informations' },
  { value: 'praticien', label: 'Praticien de santé', sub: 'Médecin, infirmier, sage-femme' },
  { value: 'pharmacie', label: 'Pharmacie', sub: 'Officine ou pharmacie de garde' },
  { value: 'fosa', label: 'Formation sanitaire', sub: 'Hôpital, centre de santé, clinique' },
];

export const PROFESSIONS: Choice<Profession>[] = [
  { value: 'medecin', label: 'Médecin' },
  { value: 'infirmier', label: 'Infirmier(ère)' },
  { value: 'sage_femme', label: 'Sage-femme' },
];

export const FOSA_KINDS: Choice<FosaKind>[] = [
  { value: 'hopital', label: 'Hôpital' },
  { value: 'centre_sante', label: 'Centre de santé' },
  { value: 'clinique', label: 'Clinique' },
  { value: 'poste_sante', label: 'Poste de santé' },
];

export const isPro = (type: AccountType) => type !== 'patient';

export const LICENSE_LABEL: Record<Exclude<AccountType, 'patient'>, string> = {
  praticien: 'Numéro d’ordre',
  pharmacie: 'Numéro d’autorisation',
  fosa: 'Numéro d’agrément',
};

/** Accepte 6XXXXXXXX, 6XX XX XX XX, +237…, 237… → "+2376XXXXXXXX". */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '').replace(/^237/, '');
  return /^[62]\d{8}$/.test(digits) ? `+237${digits}` : null;
}

/** Retourne le premier message d'erreur de l'étape « informations », ou null. */
export function validateInfos(f: RegisterData): string | null {
  if (f.name.trim().length < 3) return 'Indique ton nom complet.';
  if (!normalizePhone(f.phone)) return 'Numéro invalide. Exemple : 6XX XX XX XX.';
  if (f.city.trim().length < 2) return 'Indique ta ville.';

  if (f.type === 'praticien') {
    if (!f.profession) return 'Choisis ta profession.';
    if ((f.licenseNumber ?? '').trim().length < 3) return 'Indique ton numéro d’ordre.';
  }
  if (f.type === 'pharmacie' || f.type === 'fosa') {
    if ((f.establishment ?? '').trim().length < 2) return 'Indique le nom de l’établissement.';
    if (f.type === 'fosa' && !f.fosaKind) return 'Choisis le type de formation sanitaire.';
    if ((f.address ?? '').trim().length < 3) return 'Indique le quartier ou l’adresse.';
    if ((f.licenseNumber ?? '').trim().length < 3) {
      return f.type === 'pharmacie'
        ? 'Indique le numéro d’autorisation.'
        : 'Indique le numéro d’agrément.';
    }
  }
  if (!f.acceptedTerms) return 'Accepte les conditions pour continuer.';
  return null;
}

/* ------------------------------------------------------------------ */
/*  OTP SMS (Supabase Auth) — mode démo si Supabase n'est pas configuré */
/* ------------------------------------------------------------------ */

export const DEMO_CODE = '123456';

export async function sendOtp(phone: string, metadata: Record<string, unknown>) {
  if (!supabase) return { ok: true as const };
  const { error } = await supabase.auth.signInWithOtp({ phone, options: { data: metadata } });
  return error ? { ok: false as const, message: error.message } : { ok: true as const };
}

export async function verifyOtp(phone: string, token: string) {
  if (!supabase) {
    return token === DEMO_CODE
      ? { ok: true as const }
      : { ok: false as const, message: 'Code incorrect.' };
  }
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  return error ? { ok: false as const, message: 'Code incorrect ou expiré.' } : { ok: true as const };
}

/* ------------------------------------------------------------------ */
/*  Étapes du formulaire d'inscription                                 */
/* ------------------------------------------------------------------ */

export type FieldErrors = Partial<Record<keyof RegisterData, string>>;
export type StepId = 'type' | 'identity' | 'pro' | 'verify';

/** Patient : 3 étapes. Praticien, pharmacie, FOSA : 4 étapes. */
export const stepsFor = (type: AccountType): StepId[] =>
  isPro(type) ? ['type', 'identity', 'pro', 'verify'] : ['type', 'identity', 'verify'];

export function stepLabel(id: StepId, type: AccountType): string {
  if (id === 'type') return 'Profil';
  if (id === 'identity') return 'Identité';
  if (id === 'verify') return 'Vérification';
  return type === 'praticien' ? 'Exercice' : 'Établissement';
}

/** Valide une seule étape. `requireTerms` : l'étape juste avant le code SMS. */
export function validateStep(step: StepId, f: RegisterData, requireTerms: boolean): FieldErrors {
  const e: FieldErrors = {};
  const organisation = f.type === 'pharmacie' || f.type === 'fosa';

  if (step === 'identity') {
    if (f.name.trim().length < 3) {
      e.name = organisation ? 'Indique le nom du responsable.' : 'Indique ton nom complet.';
    }
    if (!normalizePhone(f.phone)) e.phone = 'Numéro invalide. Exemple : 6XX XX XX XX';
    if (f.city.trim().length < 2) e.city = 'Indique ta ville.';
  }

  if (step === 'pro') {
    if (f.type === 'praticien' && !f.profession) e.profession = 'Choisis ta profession.';
    if (organisation) {
      if ((f.establishment ?? '').trim().length < 2) e.establishment = 'Indique le nom.';
      if (f.type === 'fosa' && !f.fosaKind) e.fosaKind = 'Choisis le type de formation sanitaire.';
      if ((f.address ?? '').trim().length < 3) e.address = 'Indique le quartier ou l’adresse.';
    }
    if (isPro(f.type) && (f.licenseNumber ?? '').trim().length < 3) {
      e.licenseNumber = `Indique ton ${LICENSE_LABEL[f.type as Exclude<AccountType, 'patient'>].toLowerCase()}.`;
    }
  }

  if (requireTerms && !f.acceptedTerms) e.acceptedTerms = 'Accepte les conditions pour continuer.';
  return e;
}