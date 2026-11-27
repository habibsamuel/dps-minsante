import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type PressableStateCallbackType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FOOTER_SECTIONS } from '@/lib/navigation';
import { colors, shadow } from '@/theme';

/* ------------------------------------------------------------------ */
/*  Palette                                                            */
/* ------------------------------------------------------------------ */

const GREEN = colors.primary;
const CREAM = colors.sand;
const WHITE = '#FFFFFF';
const TEXT_SOFT = 'rgba(255, 255, 255, 0.9)';
const TEXT_MUTED = 'rgba(255, 255, 255, 0.62)';
const LINE = 'rgba(255, 255, 255, 0.14)';
const CORNER = 28;
const WIDE_MIN = 768;

const LOGO = require('../../../assets/images/logo.png');

type HoverState = PressableStateCallbackType & { hovered?: boolean };

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function Footer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_MIN;

  const version = Constants.expoConfig?.version ?? '0.1.0';
  const year = new Date().getFullYear();

  return (
    <View style={styles.root}>
      {/* ---------- Bande d'urgence ---------- */}
      <View style={[styles.urgenceWrap, wide && styles.padWide]}>
        <View style={styles.urgence}>
          <View style={styles.urgenceIcon}>
            <Ionicons name="alert-circle" size={20} color={colors.danger} />
          </View>
          <Text style={styles.urgenceText}>
            <Text style={styles.urgenceStrong}>Urgence vitale : </Text>
            ne passe pas par l’application. Fais-toi accompagner aux urgences.
          </Text>
        </View>
      </View>

      {/* ---------- Bloc vert ---------- */}
      <View
        style={[
          styles.block,
          wide && styles.padWide,
          { paddingBottom: Math.max(insets.bottom, 12) + 20 },
        ]}
      >
        <View style={[styles.top, wide && styles.topWide]}>
          {/* Marque */}
          <View style={[styles.brand, wide && styles.brandWide]}>
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <Image
                  source={LOGO}
                  style={styles.brandLogo}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
              </View>
              <View style={styles.brandText}>
                <Text style={styles.brandName}>DPS Minsanté</Text>
                <Text style={styles.brandSub}>Téléconsultation · Cameroun</Text>
              </View>
            </View>

            <Text style={styles.tagline}>
              Orientation et téléconsultation pour la santé de tous, partout au Cameroun.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/triage')}
              style={(state) => {
                const { pressed, hovered } = state as HoverState;
                return [styles.cta, hovered && styles.ctaHover, pressed && styles.ctaPressed];
              }}
            >
              <Ionicons name="pulse" size={16} color={GREEN} />
              <Text style={styles.ctaText}>Faire une évaluation</Text>
            </Pressable>
          </View>

          {/* Colonnes de liens */}
          <View style={[styles.columns, wide && styles.columnsWide]}>
            {FOOTER_SECTIONS.map((section) => (
              <View key={section.key} style={styles.col}>
                <View style={styles.colHeader}>
                  <View style={styles.colAccent} />
                  <Text style={styles.colTitle}>{section.title}</Text>
                </View>
                <View style={styles.colLinks}>
                  {section.links.map((link) => (
                    <Pressable
                      key={link.key}
                      accessibilityRole="link"
                      onPress={() => router.push(link.href)}
                      style={styles.linkRow}
                    >
                      {(state) => {
                        const { hovered, pressed } = state as HoverState;
                        return (
                          <Text
                            style={[styles.link, (hovered || pressed) && styles.linkHover]}
                          >
                            {link.label}
                          </Text>
                        );
                      }}
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={TEXT_SOFT}
            style={styles.disclaimerIcon}
          />
          <Text style={styles.disclaimer}>
            Les informations de l’application orientent la prise en charge. Elles ne remplacent
            pas l’examen d’un professionnel de santé.
          </Text>
        </View>

        {/* Divider en fondu */}
        <View style={styles.dividerWrap}>
          <View style={styles.dividerFade} />
          <View style={styles.dividerCore} />
          <View style={styles.dividerFade} />
        </View>

        {/* Bottom */}
        <View style={[styles.bottom, wide && styles.bottomWide]}>
          <Text style={styles.legal}>
            © {year} DPS MINSANTE · Ministère de la Santé Publique
          </Text>
          <View style={styles.versionPill}>
            <Text style={styles.versionText}>v{version}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: { marginTop: 24 },
  padWide: { paddingHorizontal: 48 },

  /* ---- Urgence ---- */
  urgenceWrap: { paddingHorizontal: 24, paddingBottom: 16 },
  urgence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.dangerSoft,
  },
  urgenceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgenceText: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: colors.danger,
    flex: 1,
  },
  urgenceStrong: {
    fontFamily: 'Comfortaa_700Bold',
  },

  /* ---- Bloc vert ---- */
  block: {
    backgroundColor: GREEN,
    borderTopLeftRadius: CORNER,
    borderTopRightRadius: CORNER,
    paddingHorizontal: 24,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    ...shadow.card,
  },
  top: { gap: 28 },
  topWide: { flexDirection: 'row', justifyContent: 'space-between', gap: 48 },

  /* ---- Marque ---- */
  brand: { gap: 16 },
  brandWide: { flex: 1, maxWidth: 380 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogo: { width: 38, height: 38 },
  brandText: { gap: 2 },
  brandName: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 20,
    color: WHITE,
    letterSpacing: 0.2,
  },
  brandSub: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.2,
  },
  tagline: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_SOFT,
  },

  /* ---- CTA ---- */
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: CREAM,
    ...shadow.soft,
  },
  ctaHover: {
    backgroundColor: WHITE,
    transform: [{ translateY: -2 }],
    ...shadow.card,
  },
  ctaPressed: { transform: [{ scale: 0.96 }] },
  ctaText: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 14,
    color: GREEN,
  },

  /* ---- Colonnes ---- */
  columns: { flexDirection: 'row', gap: 24 },
  columnsWide: { gap: 56 },
  col: { flexShrink: 1 },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  colAccent: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: CREAM,
  },
  colTitle: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: CREAM,
    textTransform: 'uppercase',
  },
  colLinks: { gap: 2 },

  /* ---- Liens ---- */
  linkRow: { paddingVertical: 8, minHeight: 36, justifyContent: 'center' },
  link: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 14,
    color: TEXT_SOFT,
  },
  linkHover: {
    fontFamily: 'Comfortaa_600SemiBold',
    color: WHITE,
    textDecorationLine: 'underline',
  },

  /* ---- Disclaimer ---- */
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 32,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LINE,
  },
  disclaimerIcon: { marginTop: 2 },
  disclaimer: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 12,
    lineHeight: 19,
    color: TEXT_SOFT,
    flex: 1,
  },

  /* ---- Divider en fondu ---- */
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerFade: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'transparent' },
  dividerCore: { flex: 2, height: StyleSheet.hairlineWidth, backgroundColor: LINE },

  /* ---- Bottom ---- */
  bottom: { gap: 10, alignItems: 'flex-start' },
  bottomWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legal: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 12,
    color: TEXT_MUTED,
  },
  versionPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  versionText: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 11,
    color: TEXT_SOFT,
    letterSpacing: 0.4,
  },
});