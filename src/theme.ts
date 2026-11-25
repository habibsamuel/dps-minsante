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

export const font = {
  h1: { fontSize: 30, lineHeight: 36, fontWeight: '700' as const, letterSpacing: -0.6 },
  h2: { fontSize: 22, lineHeight: 29, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 17, lineHeight: 23, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' as const },
  small: { fontSize: 13, lineHeight: 19, fontWeight: '400' as const },
  label: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700' as const,
    letterSpacing: 1.1,
    textTransform: 'uppercase' as const,
  },
} as const;
