import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableStateCallbackType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dashboardItemsFor, isItemActive, ROLE_LABEL } from '@/lib/dashboard';
import { initialsOf } from '@/lib/format';
import { useTriage } from '@/store';
import { colors } from '@/theme';

import { ShareSheet } from './ShareSheet';

const GREEN = colors.primary;
const TINT = colors.primarySoft;
const WHITE = '#FFFFFF';

const LOGO = require('../../../assets/images/logo.png');

type HoverState = PressableStateCallbackType & { hovered?: boolean };

type Props = {
  /** Appelé après un clic sur un lien (ferme le tiroir sur mobile). */
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useTriage();
  const [shareOpen, setShareOpen] = useState(false);

  const items = dashboardItemsFor(profile?.role);

  const go = (href: Parameters<typeof router.push>[0]) => {
    onNavigate?.();
    router.push(href);
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 20, paddingBottom: Math.max(insets.bottom, 16) + 8 },
      ]}
    >
      {/* ---------- Marque ---------- */}
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Retour à l’accueil du site"
        onPress={() => {
          onNavigate?.();
          router.replace('/');
        }}
        style={styles.brand}
      >
        <Image
          source={LOGO}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.brandText}>
          <Text style={styles.brandName}>DPS Minsanté</Text>
          <Text style={styles.brandSub}>ESPACE PERSONNEL</Text>
        </View>
      </Pressable>

      {/* ---------- Navigation ---------- */}
      <Text style={styles.section}>MENU</Text>
      <View style={styles.list}>
        {items.map((item) => {
          const active = isItemActive(item, pathname);
          return (
            <Pressable
              key={item.key}
              accessibilityRole="link"
              accessibilityState={{ selected: active }}
              onPress={() => (active ? onNavigate?.() : go(item.href))}
              style={(state) => {
                const hovered = Boolean((state as HoverState).hovered);
                return [styles.item, active && styles.itemActive, !active && hovered && styles.itemHover];
              }}
            >
              <View style={[styles.itemIcon, active && styles.itemIconActive]}>
                <Ionicons name={item.icon} size={17} color={active ? WHITE : GREEN} />
              </View>
              <Text style={[styles.itemLabel, active && styles.itemLabelActive]} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />

      {/* ---------- Partager ---------- */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Partager l’application"
        onPress={() => setShareOpen(true)}
        style={(state) => [styles.share, Boolean((state as HoverState).hovered) && styles.shareHover]}
      >
        <View style={styles.shareIcon}>
          <Ionicons name="share-social" size={17} color={WHITE} />
        </View>
        <View style={styles.shareText}>
          <Text style={styles.shareTitle}>Partager l’application</Text>
          <Text style={styles.shareSub}>WhatsApp, Facebook, X…</Text>
        </View>
      </Pressable>

      {/* ---------- Bas : retour au site + utilisateur ---------- */}
      <Pressable
        accessibilityRole="link"
        onPress={() => {
          onNavigate?.();
          router.replace('/');
        }}
        style={(state) => [styles.back, Boolean((state as HoverState).hovered) && styles.itemHover]}
      >
        <Ionicons name="arrow-back-outline" size={16} color={colors.inkSoft} />
        <Text style={styles.backText}>Retour au site</Text>
      </Pressable>

      <View style={styles.user}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initialsOf(profile?.name)}</Text>
        </View>
        <View style={styles.userText}>
          <Text style={styles.userName} numberOfLines={1}>
            {profile?.name ?? 'Invité'}
          </Text>
          <Text style={styles.userRole} numberOfLines={1}>
            {ROLE_LABEL[profile?.role ?? ''] ?? 'Compte'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Se déconnecter"
          hitSlop={8}
          onPress={() => {
            onNavigate?.();
            signOut();
            router.replace('/');
          }}
          style={styles.logout}
        >
          <Ionicons name="log-out-outline" size={19} color={colors.inkSoft} />
        </Pressable>
      </View>

      <ShareSheet visible={shareOpen} onClose={() => setShareOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },

  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4, marginBottom: 28 },
  logo: { width: 56, height: 56, mixBlendMode: 'multiply' },
  brandText: { flex: 1 },
  brandName: { fontFamily: 'Comfortaa_700Bold', fontSize: 16, color: GREEN },
  brandSub: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.muted,
    marginTop: 2,
  },

  section: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.muted,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  list: { gap: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  itemActive: { backgroundColor: GREEN },
  itemHover: { backgroundColor: TINT },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TINT,
  },
  itemIconActive: { backgroundColor: 'rgba(255,255,255,0.18)' },
  itemLabel: { flex: 1, fontFamily: 'Comfortaa_600SemiBold', fontSize: 15, color: colors.ink },
  itemLabelActive: { color: WHITE },

  spacer: { flex: 1, minHeight: 24 },

  share: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: TINT,
    marginBottom: 10,
  },
  shareHover: { backgroundColor: colors.sandDeep },
  shareIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
  },
  shareText: { flex: 1 },
  shareTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 14, color: GREEN },
  shareSub: { fontFamily: 'Comfortaa_500Medium', fontSize: 11, color: colors.inkSoft, marginTop: 1 },

  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  backText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 14, color: colors.inkSoft },

  user: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: colors.sand,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Comfortaa_700Bold', fontSize: 14, color: WHITE },
  userText: { flex: 1 },
  userName: { fontFamily: 'Comfortaa_700Bold', fontSize: 14, color: colors.ink },
  userRole: { fontFamily: 'Comfortaa_500Medium', fontSize: 12, color: colors.muted, marginTop: 1 },
  logout: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});