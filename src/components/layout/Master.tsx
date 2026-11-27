import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, space } from '@/theme';

import { Footer } from './Footer';
import { Menu } from './Menu';

type Props = {
  children: ReactNode;
  /** Titre de page. Sans titre : barre « marque » (accueil). */
  title?: string;
  /** Barre d'action collée en bas (Continuer, Envoyer…). */
  footer?: ReactNode;
  /** Footer institutionnel en fin de page. Par défaut : seulement s'il n'y a pas de barre d'action. */
  showFooter?: boolean;
};

export function Master({ children, title, footer, showFooter }: Props) {
  const insets = useSafeAreaInsets();
  const withFooter = showFooter ?? !footer;

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right']}>
      <Menu title={title} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>{children}</View>
          {withFooter ? <Footer /> : null}
        </ScrollView>

        {footer ? (
          <View style={[styles.sticky, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.xl,
  },
  sticky: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.sand,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});