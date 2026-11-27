/**
 * Palette « naturelle » : sable chaud, vert forêt doux, terre cuite en accent.
 * Volontairement peu saturée pour rester calme et lisible en plein soleil.
 */
export const colors = {
  sand: '#F6F3EA',
  sandDeep: '#EDE7DA',
  surface: '#FFFFFF',
  surfaceAlt: '#FBF9F3',

  ink: '#1C2A24',
  inkSoft: '#54685E',
  muted: '#8A9A91',
  line: '#E3DDCF',

  primary: '#2F5D50',
  primaryDark: '#234639',
  primarySoft: '#E3EDE7',

  accent: '#C97B4A',
  accentSoft: '#F7E9DE',

  danger: '#A9452F',
  dangerSoft: '#F6E5DF',

  warning: '#B07C24',
  warningSoft: '#F8EFDA',

  calm: '#4A7C59',
  calmSoft: '#E6EFE6',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#2B3A33',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  soft: {
    shadowColor: '#2B3A33',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
} as const;

/**
 * Typographie : Comfortaa (arrondie, chaleureuse — adaptée au soin).
 *
 * Trois corrections par rapport aux styles système :
 *  1. On référence la **famille explicite** (`Comfortaa_700Bold`, etc.) au lieu
 *     de `fontWeight`. Sur Android, `fontWeight` + police custom déclenche une
 *     synthèse de graisse qui casse le rendu. La famille est la seule source de vérité.
 *  2. `lineHeight` légèrement **augmenté (+1 à +2)** : Comfortaa a une hauteur
 *     d'x plus grande, sans ça le texte paraît serré.
 *  3. `letterSpacing` **moins négatif** sur h1/h2 (dessin large, le -0.6 initial
 *     tassait les lettres). `label` gagne +0.2 en tracking pour aérer les capitales.
 *
 * Graisses disponibles : 400 / 500 / 600 / 700 uniquement.
 * Comfortaa n'a **pas d'italique** — utilise `fontStyle` avec parcimonie.
 */
export const font = {
  h1: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.1,
  },
  h3: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 17,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  small: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  label: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.3,
    textTransform: 'uppercase' as const,
  },
} as const;