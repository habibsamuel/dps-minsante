import { colors } from '@/theme';

import type { IconName } from './navigation';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CommunityGroup = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  /** Libellé lisible : « il y a 1 h », « hier », etc. */
  lastActivityLabel: string;
};

export type Community = {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  color: string;
  groups: CommunityGroup[];
};

/* ------------------------------------------------------------------ */
/*  Données                                                            */
/* ------------------------------------------------------------------ */

export const communities: Community[] = [
  {
    id: 'paludisme',
    name: 'Paludisme',
    description: 'Prévention, symptômes et traitements du paludisme au Cameroun.',
    icon: 'bug-outline',
    color: colors.accent,
    groups: [
      {
        id: 'parents',
        name: 'Parents',
        description: 'Pour les parents qui veulent protéger leurs enfants.',
        memberCount: 234,
        lastActivityLabel: 'il y a 1 h',
      },
      {
        id: 'adultes',
        name: 'Adultes',
        description: 'Vivre avec le paludisme, en parler, se soutenir.',
        memberCount: 156,
        lastActivityLabel: 'il y a 3 h',
      },
      {
        id: 'prevention',
        name: 'Prévention',
        description: 'Moustiquaires, répulsifs, conseils pratiques.',
        memberCount: 89,
        lastActivityLabel: 'il y a 6 h',
      },
    ],
  },
  {
    id: 'maternite',
    name: 'Maternité',
    description: 'Grossesse, accouchement, soins du nourrisson.',
    icon: 'heart-outline',
    color: colors.primary,
    groups: [
      {
        id: 'grossesse',
        name: 'Suivi de grossesse',
        description: 'Échographies, alimentation, préparation à l’accouchement.',
        memberCount: 412,
        lastActivityLabel: 'il y a 30 min',
      },
      {
        id: 'nourrisson',
        name: 'Nourrissons 0-2 ans',
        description: 'Sommeil, allaitement, vaccins, premières dents.',
        memberCount: 298,
        lastActivityLabel: 'il y a 2 h',
      },
      {
        id: 'post-partum',
        name: 'Après l’accouchement',
        description: 'Récupération, baby blues, reprise du quotidien.',
        memberCount: 143,
        lastActivityLabel: 'il y a 5 h',
      },
    ],
  },
  {
    id: 'diabete',
    name: 'Diabète & hypertension',
    description: 'Suivi au quotidien, alimentation, médicaments.',
    icon: 'water-outline',
    color: colors.warning,
    groups: [
      {
        id: 'alimentation',
        name: 'Alimentation',
        description: 'Recettes locales adaptées, astuces pour réduire le sucre.',
        memberCount: 156,
        lastActivityLabel: 'il y a 1 h',
      },
      {
        id: 'suivi',
        name: 'Suivi glycémique',
        description: 'Lectures, appareils, comprendre ses chiffres.',
        memberCount: 234,
        lastActivityLabel: 'il y a 4 h',
      },
      {
        id: 'medicaments',
        name: 'Médicaments',
        description: 'Rappels de prise, effets secondaires, questions.',
        memberCount: 89,
        lastActivityLabel: 'hier',
      },
    ],
  },
  {
    id: 'mental',
    name: 'Santé mentale',
    description: 'Stress, anxiété, soutien psychologique.',
    icon: 'happy-outline',
    color: colors.calm,
    groups: [
      {
        id: 'anxiete',
        name: 'Anxiété & stress',
        description: 'Partager ce qu’on ressent sans jugement.',
        memberCount: 178,
        lastActivityLabel: 'il y a 45 min',
      },
      {
        id: 'soutien',
        name: 'Soutien mutuel',
        description: 'Un espace d’écoute entre personnes concernées.',
        memberCount: 234,
        lastActivityLabel: 'il y a 2 h',
      },
      {
        id: 'sommeil',
        name: 'Sommeil',
        description: 'Troubles du sommeil, rituels, relaxation.',
        memberCount: 89,
        lastActivityLabel: 'il y a 8 h',
      },
    ],
  },
  {
    id: 'vih',
    name: 'VIH & IST',
    description: 'Prévention, traitement, vie avec le VIH.',
    icon: 'shield-checkmark-outline',
    color: colors.danger,
    groups: [
      {
        id: 'vivre',
        name: 'Vivre avec le VIH',
        description: 'Témoignages, traitement, confidentialité.',
        memberCount: 145,
        lastActivityLabel: 'il y a 2 h',
      },
      {
        id: 'prevention',
        name: 'Prévention',
        description: 'PrEP, préservatifs, dépistage.',
        memberCount: 234,
        lastActivityLabel: 'il y a 4 h',
      },
    ],
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    description: 'Alimentation équilibrée, carences, recettes locales.',
    icon: 'leaf-outline',
    color: colors.primaryDark,
    groups: [
      {
        id: 'recettes',
        name: 'Recettes locales',
        description: 'Cuisiner sain avec ce qu’on trouve au marché.',
        memberCount: 312,
        lastActivityLabel: 'il y a 20 min',
      },
      {
        id: 'carences',
        name: 'Carences & vitamines',
        description: 'Fer, vitamine D, calcium — comment les repérer.',
        memberCount: 89,
        lastActivityLabel: 'il y a 3 h',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

export function findCommunity(id: string): Community | undefined {
  return communities.find((c) => c.id === id);
}

export function totalMembers(community: Community): number {
  return community.groups.reduce((sum, g) => sum + g.memberCount, 0);
}