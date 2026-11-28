import { Linking, Platform, Share } from 'react-native';

import type { IconName } from './navigation';

/** À renseigner dans .env : EXPO_PUBLIC_APP_URL=https://ton-domaine */
export const APP_URL = process.env.EXPO_PUBLIC_APP_URL ?? 'https://dps-minsante.example';
export const APP_TITLE = 'DPS Minsanté';
export const APP_MESSAGE =
  'Découvre DPS Minsanté : évaluation des symptômes et téléconsultation au Cameroun.';

export type SharePlatform = {
  key: string;
  label: string;
  icon: IconName;
  color: string;
  url: string;
};

export function sharePlatforms(): SharePlatform[] {
  const text = encodeURIComponent(APP_MESSAGE);
  const url = encodeURIComponent(APP_URL);

  return [
    { key: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366', url: `https://wa.me/?text=${text}%20${url}` },
    { key: 'facebook', label: 'Facebook', icon: 'logo-facebook', color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { key: 'x', label: 'X', icon: 'logo-twitter', color: '#111111', url: `https://twitter.com/intent/tweet?text=${text}&url=${url}` },
    { key: 'telegram', label: 'Telegram', icon: 'paper-plane', color: '#229ED9', url: `https://t.me/share/url?url=${url}&text=${text}` },
    { key: 'linkedin', label: 'LinkedIn', icon: 'logo-linkedin', color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { key: 'email', label: 'E-mail', icon: 'mail', color: '#2E7D32', url: `mailto:?subject=${encodeURIComponent(APP_TITLE)}&body=${text}%20${url}` },
  ];
}

export function openPlatform(platform: SharePlatform) {
  return Linking.openURL(platform.url).catch(() => {});
}

/** Partage natif (téléphone) ou Web Share API (navigateurs compatibles). */
export const canNativeShare =
  Platform.OS !== 'web' || (typeof navigator !== 'undefined' && 'share' in navigator);

export async function nativeShare() {
  try {
    await Share.share(
      Platform.OS === 'ios'
        ? { message: APP_MESSAGE, url: APP_URL }
        : { message: `${APP_MESSAGE} ${APP_URL}` },
    );
  } catch {
    // partage annulé
  }
}

/** Copie du lien : disponible sur le web uniquement (sans dépendance supplémentaire). */
export const canCopy =
  Platform.OS === 'web' && typeof navigator !== 'undefined' && Boolean(navigator.clipboard);

export async function copyLink(): Promise<boolean> {
  if (!canCopy) return false;
  try {
    await navigator.clipboard.writeText(APP_URL);
    return true;
  } catch {
    return false;
  }
}