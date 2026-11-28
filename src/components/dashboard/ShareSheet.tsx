import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  APP_URL,
  canCopy,
  canNativeShare,
  copyLink,
  nativeShare,
  openPlatform,
  sharePlatforms,
} from '@/lib/share';
import { colors, radius, shadow } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ShareSheet({ visible, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const platforms = sharePlatforms();

  async function copy() {
    const ok = await copyLink();
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Fermer"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.card}>
          <View style={styles.head}>
            <Text style={styles.title}>Partager l’application</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              onPress={onClose}
              hitSlop={8}
              style={styles.close}
            >
              <Ionicons name="close" size={18} color={colors.inkSoft} />
            </Pressable>
          </View>
          <Text style={styles.sub}>
            Aide tes proches à s’orienter plus vite : choisis où envoyer le lien.
          </Text>

          <View style={styles.grid}>
            {platforms.map((platform) => (
              <Pressable
                key={platform.key}
                accessibilityRole="button"
                accessibilityLabel={`Partager sur ${platform.label}`}
                onPress={() => openPlatform(platform)}
                style={({ pressed }) => [styles.platform, pressed && styles.pressed]}
              >
                <View style={[styles.circle, { backgroundColor: platform.color }]}>
                  <Ionicons name={platform.icon} size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.platformLabel}>{platform.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.linkBox}>
            <Ionicons name="link" size={16} color={colors.muted} />
            <Text style={styles.linkText} numberOfLines={1}>
              {APP_URL}
            </Text>
            {canCopy ? (
              <Pressable accessibilityRole="button" onPress={copy} hitSlop={6}>
                <Text style={styles.copy}>{copied ? 'Copié ✓' : 'Copier'}</Text>
              </Pressable>
            ) : null}
          </View>

          {canNativeShare ? (
            <Pressable
              accessibilityRole="button"
              onPress={nativeShare}
              style={({ pressed }) => [styles.more, pressed && styles.pressed]}
            >
              <Ionicons name="share-social-outline" size={18} color={colors.primary} />
              <Text style={styles.moreText}>Plus d’options…</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 30, 30, 0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: 'Comfortaa_700Bold', fontSize: 20, color: colors.ink },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.sandDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sub: { fontFamily: 'Comfortaa_500Medium', fontSize: 13, lineHeight: 20, color: colors.inkSoft, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18, marginTop: 24 },
  platform: { width: '30%', alignItems: 'center', gap: 8 },
  pressed: { opacity: 0.85 },
  circle: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  platformLabel: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 12, color: colors.ink },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.sand,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  linkText: { flex: 1, fontFamily: 'Comfortaa_500Medium', fontSize: 13, color: colors.inkSoft },
  copy: { fontFamily: 'Comfortaa_700Bold', fontSize: 13, color: colors.primary },
  more: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  moreText: { fontFamily: 'Comfortaa_700Bold', fontSize: 14, color: colors.primary },
});