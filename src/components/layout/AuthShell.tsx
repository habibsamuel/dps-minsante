import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, type ReactNode } from 'react';
import {
    Animated,
    Easing,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { IconName } from '@/lib/navigation';
import { colors, font, space } from '@/theme';

const LOGO = require('../../../assets/images/logo.png');
const WIDE_MIN = 1024;

/* ------------------------------------------------------------------ */
/*  Marque                                                             */
/* ------------------------------------------------------------------ */

function Brand({ light, size = 44 }: { light?: boolean; size?: number }) {
  return (
    <View style={styles.brandRow}>
      <View style={[styles.badge, { width: size, height: size }]}>
        <Image
          source={LOGO}
          style={{ width: size - 10, height: size - 10 }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text style={[styles.brandName, light && styles.brandNameLight]}>DPS Minsanté</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Carte flottante                                                    */
/* ------------------------------------------------------------------ */

function FloatingCard({
  icon,
  title,
  sub,
  delay = 0,
  light,
  style,
}: {
  icon: IconName;
  title: string;
  sub: string;
  delay?: number;
  light?: boolean;
  style: StyleProp<ViewStyle>;
}) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const native = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, {
          toValue: -8,
          duration: 2500,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: native,
        }),
        Animated.timing(y, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: native,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [y, delay]);

  return (
    <Animated.View
      style={[
        styles.card,
        light ? styles.cardLight : styles.cardDark,
        style,
        { transform: [{ translateY: y }] },
      ]}
    >
      <Ionicons name={icon} size={20} color={light ? colors.primary : '#FFFFFF'} />
      <View>
        <Text style={[styles.cardTitle, light && { color: colors.primary }]}>{title}</Text>
        <Text style={[styles.cardSub, light && { color: colors.inkSoft }]}>{sub}</Text>
      </View>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Cadre : panneau gauche + zone formulaire                           */
/* ------------------------------------------------------------------ */

type Props = {
  children: ReactNode;
  /** Citation affichée en bas du panneau décoratif. */
  quote: string;
  /** Largeur maximale de la boîte du formulaire. */
  maxWidth?: number;
};

export function AuthShell({ children, quote, maxWidth = 420 }: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_MIN;

  return (
    <SafeAreaView style={[styles.root, wide && styles.rootWide]}>
      {/* ---------- Panneau gauche (déco) ---------- */}
      {wide ? (
        <View style={styles.side}>
          <View style={styles.circleTop} />
          <View style={styles.circleBottom} />
          <View style={styles.sideShade} />

          <View style={styles.sideBrand}>
            <Brand light />
          </View>

          <FloatingCard
            icon="videocam-outline"
            title="Téléconsultation"
            sub="Partout au Cameroun"
            delay={400}
            style={{ top: '38%', left: 28 }}
          />
          <FloatingCard
            icon="pulse"
            title="Évaluation gratuite"
            sub="Une orientation en quelques minutes"
            delay={900}
            light
            style={{ bottom: '16%', right: 28 }}
          />

          <View style={styles.sideQuote}>
            <Text style={styles.quote}>“{quote}”</Text>
          </View>
        </View>
      ) : null}

      {/* ---------- Zone principale ---------- */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.main}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.box, { maxWidth }]}>
          {!wide ? (
            <View style={styles.mobileBrand}>
              <Brand size={38} />
            </View>
          ) : null}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/*  Titres partagés                                                    */
/* ------------------------------------------------------------------ */

export function AuthTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function AuthSub({ children }: { children: ReactNode }) {
  return <Text style={styles.sub}>{children}</Text>;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  rootWide: { flexDirection: 'row' },
  flex: { flex: 1 },

  /* Panneau gauche */
  side: { width: '42%', backgroundColor: colors.primary, overflow: 'hidden' },
  circleTop: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sideShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  sideBrand: { position: 'absolute', top: 40, left: 32 },
  sideQuote: { position: 'absolute', left: 32, right: 32, bottom: 32 },
  quote: {
    fontFamily: 'Comfortaa_500Medium',
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.85)',
  },

  /* Cartes flottantes */
  card: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    zIndex: 10,
  },
  cardDark: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardLight: { backgroundColor: colors.sand },
  cardTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 13, color: '#FFFFFF' },
  cardSub: {
    fontFamily: 'Comfortaa_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  /* Zone formulaire */
  main: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
  },
  box: { width: '100%' },
  mobileBrand: { alignItems: 'center', marginBottom: space.xl },

  /* Marque */
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontFamily: 'Comfortaa_700Bold', fontSize: 18, color: colors.ink },
  brandNameLight: { color: '#FFFFFF', fontSize: 20 },

  /* Titres */
  title: { ...font.h1, color: colors.ink },
  sub: { ...font.small, color: colors.inkSoft, lineHeight: 20, marginTop: space.sm, marginBottom: space.xl },
});