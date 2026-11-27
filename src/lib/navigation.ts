import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import type { ComponentProps } from 'react';

import type { Role } from '@/store';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/* ------------------------------------------------------------------ */
/*  Menu principal                                                     */
/* ------------------------------------------------------------------ */

export type MenuLeaf = {
  key: string;
  label: string;
  icon: IconName;
  href: Href;
};

export type MenuItem = {
  key: string;
  label: string;
  icon: IconName;
  /** Lien direct. Absent si l'item a des sous-menus. */
  href?: Href;
  children?: MenuLeaf[];
  /** Si absent : visible par tous. */
  roles?: Role[];
};

export const MENU_ITEMS: MenuItem[] = [
  { key: 'home', label: 'Accueil', icon: 'home', href: '/' },
  { key: 'triage', label: 'Évaluation', icon: 'pulse', href: '/triage' },
  { key: 'doctors', label: 'Médecins', icon: 'people', href: '/medecins' },
  { key: 'community', label: 'Communauté', icon: 'chatbubbles', href: '/communaute' },
  {
    key: 'pro',
    label: 'Espace médecin',
    icon: 'medkit',
    href: '/espace-medecin',
    roles: ['medecin'],
  },

  // 'profile' est retiré du menu : accessible via le bouton compte rond (header)
  // et via le lien "Mon profil" du footer.
  // 'historique' est retiré du menu : accessible via le footer et depuis la page profil.

  // Exemple de sous-menu (à activer quand les écrans existent) :
  // {
  //   key: 'sante',
  //   label: 'Santé & Prévention',
  //   icon: 'leaf',
  //   children: [
  //     { key: 'education', label: 'Éducation', icon: 'school', href: '/education' },
  //     { key: 'prevention', label: 'Prévention', icon: 'shield-checkmark', href: '/prevention' },
  //     { key: 'factcheck', label: 'Fact-checking', icon: 'checkmark-done', href: '/fact-checking' },
  //   ],
  // },
];

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

export type FooterLink = {
  key: string;
  label: string;
  href: Href;
};

export type FooterSection = {
  key: string;
  title: string;
  links: FooterLink[];
};

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    key: 'services',
    title: 'Services',
    links: [
      { key: 'triage', label: 'Évaluation des symptômes', href: '/triage' },
      { key: 'doctors', label: 'Trouver un médecin', href: '/medecins' },
      { key: 'community', label: 'Communauté', href: '/communaute' },
    ],
  },
  {
    key: 'account',
    title: 'Mon espace',
    links: [
      { key: 'history', label: 'Mes demandes', href: '/historique' },
      { key: 'profile', label: 'Mon profil', href: '/profil' },
      { key: 'auth', label: 'Connexion / Inscription', href: '/auth' },
      { key: 'pro', label: 'Espace médecin', href: '/espace-medecin' },
    ],
  },
];