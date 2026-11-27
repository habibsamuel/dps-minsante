import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Fragment, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Master } from '@/components/layout';
import type { IconName } from '@/lib/navigation';
import { questions } from '@/lib/triage';
import { useTriage } from '@/store';
import { colors, font, radius, shadow, space } from '@/theme';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

const STEPS = [
  { n: '1', title: 'Tu réponds', text: 'Symptômes, durée, intensité.' },
  { n: '2', title: 'On évalue', text: 'Vert, orange ou rouge.' },
  { n: '3', title: 'Tu es orienté', text: 'Vers le bon médecin.' },
] as const;

const WIDE_MIN = 900;

export default function HomeScreen() {
  const router = useRouter();
  const { profile, history, result } = useTriage();
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_MIN;
  const firstName = profile?.name?.trim().split(' ')[0] ?? '';

  const pendingCount = history.filter((h) => h.status === 'envoyee').length;
  const showContext = !!result && result.level !== 'surveillance';

  return (
    <Master>
      <View style={styles.container}>
        <Text style={styles.greeting}>
          {greeting()}
          {firstName ? `, ${firstName}` : ''}
        </Text>
        <Text style={styles.headline}>Comment te sens-tu aujourd’hui ?</Text>
        <Text style={styles.lede}>
          Quelques questions courtes pour t’orienter vers le bon soin.
        </Text>

        {showContext ? (
          <Pressable
            onPress={() => router.push('/resultat')}
            style={[
              styles.contextBanner,
              result.level === 'urgence' && styles.contextBannerUrgent,
            ]}
          >
            <Ionicons
              name={result.level === 'urgence' ? 'alert-circle' : 'information-circle'}
              size={18}
              color={result.level === 'urgence' ? colors.danger : colors.warning}
            />
            <Text style={styles.contextText} numberOfLines={2}>
              {result.level === 'urgence'
                ? 'Ton évaluation précédente indiquait une urgence. Reprends le parcours.'
                : 'Ton évaluation suggère un avis médical. Reprends le parcours.'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
        ) : null}

        <View style={[styles.heroGrid, isWide && styles.heroGridWide]}>
          <View style={[styles.hero, isWide && styles.heroWide]}>
            <Text style={styles.heroEyebrow}>PRÉ-CONSULTATION</Text>
            <Text style={styles.heroTitle}>Faire le point en 2 minutes</Text>
            <Text style={styles.heroText}>
              {questions.length} questions simples. Aucun compte requis pour commencer.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/triage')}
              style={({ pressed }) => [styles.heroCta, pressed && styles.heroCtaPressed]}
            >
              <Text style={styles.heroCtaText}>Commencer l’évaluation</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </Pressable>

            <Text style={styles.heroNote}>
              Ce n’est pas un diagnostic. En cas de danger immédiat, va au centre de santé le
              plus proche.
            </Text>
          </View>

          <View style={[styles.side, isWide && styles.sideWide]}>
            <QuickLink
              icon="document-text-outline"
              label="Mes demandes"
              sub={
                pendingCount > 0
                  ? `${pendingCount} en attente`
                  : 'Suivre une consultation'
              }
              highlight={pendingCount > 0}
              onPress={() => router.push('/historique')}
            />
            <View style={styles.sideDivider} />
            <QuickLink
              icon="people-outline"
              label="Médecins"
              sub="Choisir un praticien"
              onPress={() => router.push('/medecins')}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Comment ça marche</Text>
        <View style={styles.roadmapRow}>
          {STEPS.map((step, i) => (
            <Fragment key={step.n}>
              <RoadmapStep step={step} index={i} />
              {i < STEPS.length - 1 ? <RoadmapConnector index={i} /> : null}
            </Fragment>
          ))}
        </View>

        <Text style={styles.footnote}>
          Prochainement : visio sécurisée, messagerie avec le médecin, ordonnance numérique.
        </Text>
      </View>
    </Master>
  );
}

/* ------------------------------------------------------------------ */
/*  Ligne d'action rapide                                              */
/* ------------------------------------------------------------------ */

function QuickLink({
  icon,
  label,
  sub,
  highlight,
  onPress,
}: {
  icon: IconName;
  label: string;
  sub: string;
  highlight?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.quickRow, pressed && styles.quickRowPressed]}
    >
      <View style={[styles.quickIcon, highlight && styles.quickIconHighlight]}>
        <Ionicons
          name={icon}
          size={20}
          color={highlight ? colors.accent : colors.inkSoft}
        />
      </View>
      <View style={styles.quickBody}>
        <Text style={styles.quickLabel}>{label}</Text>
        <Text style={[styles.quickSub, highlight && styles.quickSubHighlight]}>
          {sub}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Étape de roadmap — numéro + glow au hover                         */
/* ------------------------------------------------------------------ */

function RoadmapStep({
  step,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const dotScale = useRef(new Animated.Value(0.3)).current;
  const hoverProgress = useRef(new Animated.Value(0)).current;

  const delay = 300 + index * 400;

  // Animation d'apparition (une seule fois)
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(dotScale, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Animation au hover (0 → 1 en entrée, 1 → 0 en sortie)
  useEffect(() => {
    Animated.timing(hoverProgress, {
      toValue: hovered ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [hovered, hoverProgress]);

  const hoverScale = hoverProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.14],
  });
  const haloScale = hoverProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.65],
  });

  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={styles.stepColumn}
    >
      <Animated.View
        style={[styles.stepContent, { opacity, transform: [{ translateY }] }]}
      >
        <View style={styles.dotWrap}>
          {/* Halo qui s'étend autour du dot au hover */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              { opacity: hoverProgress, transform: [{ scale: haloScale }] },
            ]}
          />
          {/* Scale d'apparition (ressort) → wrapper extérieur */}
          <Animated.View style={{ transform: [{ scale: dotScale }] }}>
            {/* Scale de hover → wrapper intérieur */}
            <Animated.View
              style={[
                styles.dot,
                hovered && styles.dotHovered,
                { transform: [{ scale: hoverScale }] },
              ]}
            >
              <Text style={[styles.dotNum, hovered && styles.dotNumHovered]}>
                {step.n}
              </Text>
            </Animated.View>
          </Animated.View>
        </View>
        <Text style={[styles.stepTitle, hovered && styles.stepTitleHovered]}>
          {step.title}
        </Text>
        <Text style={styles.stepText}>{step.text}</Text>
      </Animated.View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Connecteur animé entre deux étapes                                */
/* ------------------------------------------------------------------ */

function RoadmapConnector({ index }: { index: number }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300 + index * 400 + 350),
      Animated.timing(width, {
        toValue: 100,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.connectorWrap}>
      <Animated.View
        style={[
          styles.connectorLine,
          {
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    paddingHorizontal: space.sm,
    paddingTop: space.sm,
  },

  /* ---- En-tête ---- */
  greeting: {
    ...font.small,
    color: colors.muted,
    marginTop: space.sm,
    letterSpacing: 0.2,
  },
  headline: { ...font.h1, color: colors.ink, marginTop: space.xs },
  lede: {
    ...font.body,
    color: colors.inkSoft,
    marginTop: space.sm,
    marginBottom: space.xl,
  },

  /* ---- Bandeau contextuel ---- */
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
    marginBottom: space.md,
  },
  contextBannerUrgent: { backgroundColor: colors.dangerSoft },
  contextText: { ...font.small, flex: 1, color: colors.ink },

  /* ---- Hero grid ---- */
  heroGrid: { gap: space.lg },
  heroGridWide: { flexDirection: 'row', alignItems: 'stretch', gap: space.lg },

  /* ---- Hero ---- */
  hero: {
    borderRadius: radius.lg,
    padding: space.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadow.soft,
  },
  heroWide: { flex: 3, justifyContent: 'space-between' },
  heroEyebrow: { ...font.label, color: colors.primary },
  heroTitle: { ...font.h2, color: colors.ink, marginTop: space.sm },
  heroText: { ...font.body, color: colors.inkSoft, marginTop: space.xs },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: space.lg,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  heroCtaPressed: { opacity: 0.92 },
  heroCtaText: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  heroNote: {
    ...font.small,
    fontSize: 12,
    color: colors.muted,
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    lineHeight: 18,
  },

  /* ---- Side card ---- */
  side: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: 'hidden',
    ...shadow.soft,
  },
  sideWide: { flex: 2, justifyContent: 'center' },
  sideDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginLeft: 76,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
  },
  quickRowPressed: { backgroundColor: colors.sandDeep },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  quickIconHighlight: { backgroundColor: colors.accentSoft },
  quickBody: { flex: 1 },
  quickLabel: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 15,
    color: colors.ink,
  },
  quickSub: {
    ...font.small,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  quickSubHighlight: {
    color: colors.accent,
    fontFamily: 'Comfortaa_600SemiBold',
  },

  /* ---- Roadmap ---- */
  sectionTitle: {
    ...font.h3,
    color: colors.ink,
    marginTop: space.xxxl,
    marginBottom: space.xl,
  },
  roadmapRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepColumn: { flex: 1, alignItems: 'center' },
  stepContent: { alignItems: 'center' },

  /* Conteneur du dot : accueille le halo en absolute */
  dotWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotHovered: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  dotNum: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  dotNumHovered: { color: '#FFFFFF' },
  stepTitle: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 14,
    color: colors.ink,
    textAlign: 'center',
    marginTop: space.md,
  },
  stepTitleHovered: { color: colors.accent },
  stepText: {
    ...font.small,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
  },

  /* ---- Connecteur (aligné sur dot 40) ---- */
  connectorWrap: {
    width: 32,
    height: 2,
    marginTop: 19, // (40 - 2) / 2
    justifyContent: 'center',
  },
  connectorLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.line,
  },

  footnote: {
    ...font.small,
    fontSize: 11,
    color: colors.muted,
    marginTop: space.xl,
    marginBottom: space.xl,
    lineHeight: 17,
  },
});