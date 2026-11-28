import type { Href } from 'expo-router';

import type { IconName } from './navigation';

export type DashItem = {
  key: string;
  label: string;
  hint: string;
  icon: IconName;
  href: Href;
  /** Actif seulement si l'URL est exactement celle-ci (sinon : commence par). */
  exact?: boolean;
  /** Si absent : tous les rôles. */
  roles?: string[];
};

export const ROLE_LABEL: Record<string, string> = {
  patient: 'Patient',
  medecin: 'Praticien',
  pharmacie: 'Pharmacie',
  fosa: 'Formation sanitaire',
  admin: 'Administrateur',
};

export const DASH_ITEMS: DashItem[] = [
  {
    key: 'home',
    label: 'Tableau de bord',
    hint: 'Vue d’ensemble',
    icon: 'grid',
    href: '/dashboard',
    exact: true,
  },
  {
    key: 'self-eval',
    label: 'Auto-évaluation IA',
    hint: 'Suivre mon évolution et mes courbes',
    icon: 'sparkles',
    href: '/dashboard/auto-evaluation',
  },
  {
    key: 'contact',
    label: 'Contacter un médecin',
    hint: 'Choisir un praticien et lui écrire',
    icon: 'chatbubble-ellipses',
    href: '/dashboard/contact',
  },
  {
    key: 'history',
    label: 'Mes demandes',
    hint: 'Suivre mes consultations',
    icon: 'document-text',
    href: '/historique',
    roles: ['patient'],
  },
  {
    key: 'requests',
    label: 'Demandes reçues',
    hint: 'Patients en attente',
    icon: 'medkit',
    href: '/espace-medecin',
    roles: ['medecin'],
  },
  {
    key: 'community',
    label: 'Communauté',
    hint: 'Échanger avec d’autres personnes',
    icon: 'chatbubbles',
    href: '/communaute',
  },
  {
    key: 'profile',
    label: 'Mon profil',
    hint: 'Compte et confidentialité',
    icon: 'person',
    href: '/profil',
  },
];

export function dashboardItemsFor(role?: string): DashItem[] {
  return DASH_ITEMS.filter(
    (item) => !item.roles || (role !== undefined && item.roles.includes(role)),
  );
}

export function isItemActive(item: DashItem, pathname: string): boolean {
  if (typeof item.href !== 'string') return false;
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}