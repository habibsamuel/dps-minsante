import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dashboardItemsFor, isItemActive } from '@/lib/dashboard';
import { useTriage } from '@/store';
import { colors, shadow } from '@/theme';

import { Sidebar } from './Sidebar';

const GREEN = colors.primary;
const WIDE_MIN = 1024;
const SIDEBAR_W = 272;
const NATIVE = Platform.OS !== 'web';

/* ------------------------------------------------------------------ */
/*  Point d'entrée                                                     */
/* ------------------------------------------------------------------ */

export function DashboardShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  return width >= WIDE_MIN ? (
    <WideShell>{children}</WideShell>
  ) : (
    <NarrowShell>{children}</NarrowShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Contenu (scroll + largeur max)                                     */
/* ------------------------------------------------------------------ */

function Content({ children, wide }: { children: ReactNode; wide: boolean }) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scroll, wide && styles.scrollWide]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.page}>{children}</View>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop : sidebar fixe à gauche                                    */
/* ------------------------------------------------------------------ */

function WideShell({ children }: { children: ReactNode }) {
  return (
    <View style={styles.rowRoot}>
      <View style={styles.fixed}>
        <Sidebar />
      </View>
      <View style={styles.flex}>
        <Content wide>{children}</Content>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile : barre fine + tiroir                                       */
/* ------------------------------------------------------------------ */

function usePageTitle(): string {
  const pathname = usePathname();
  const { profile } = useTriage();
  const match = dashboardItemsFor(profile?.role).find((item) => isItemActive(item, pathname));
  return match?.label ?? 'Tableau de bord';
}

function NarrowShell({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const title = usePageTitle();
  const drawerW = Math.min(width * 0.84, 320);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: NATIVE,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [open, progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-drawerW, 0] });

  return (
    <View style={styles.narrowRoot}>
      <View style={[styles.topbar, { paddingTop: insets.top + 10 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le menu"
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen(true)}
          style={styles.burger}
        >
          <Ionicons name="menu" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <Content wide={false}>{children}</Content>

      {mounted ? (
        <>
          <Animated.View style={[styles.backdrop, { opacity: progress }]}>
            <Pressable
              accessibilityLabel="Fermer le menu"
              style={StyleSheet.absoluteFill}
              onPress={() => setOpen(false)}
            />
          </Animated.View>
          <Animated.View style={[styles.drawer, { width: drawerW, transform: [{ translateX }] }]}>
            <Sidebar onNavigate={() => setOpen(false)} />
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // Desktop
  rowRoot: { flex: 1, flexDirection: 'row', backgroundColor: colors.sand },
  fixed: {
    width: SIDEBAR_W,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.line,
  },

  // Contenu
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  scrollWide: { padding: 40 },
  page: { width: '100%', maxWidth: 1120, alignSelf: 'center' },

  // Mobile
  narrowRoot: { flex: 1, backgroundColor: colors.sand },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.sand,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  burger: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  topTitle: { flex: 1, fontFamily: 'Comfortaa_700Bold', fontSize: 18, color: GREEN },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 30, 30, 0.32)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    elevation: 20,
    backgroundColor: colors.surface,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    ...shadow.card,
  },
});