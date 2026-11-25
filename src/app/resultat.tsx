import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Bullet, Button, Card, Eyebrow, Screen } from '@/components/ui';
import { useTriage } from '@/store';
import { colors, font, radius, space } from '@/theme';

const LEVELS = {
  urgence: {
    tone: 'danger' as const,
    badge: 'Priorité élevée',
    icon: '!',
    bg: colors.dangerSoft,
    fg: colors.danger,
    caption: 'Ne pas attendre',
  },
  consultation: {
    tone: 'warning' as const,
    badge: 'Avis médical conseillé',
    icon: '→',
    bg: colors.warningSoft,
    fg: colors.warning,
    caption: 'Sous 24 à 48 h',
  },
  surveillance: {
    tone: 'calm' as const,
    badge: 'Surveillance',
    icon: '✓',
    bg: colors.calmSoft,
    fg: colors.calm,
    caption: 'À la maison',
  },
};

export default function ResultScreen() {
  const router = useRouter();
  const { result, resetTriage } = useTriage();

  useEffect(() => {
    if (!result) router.replace('/triage');
  }, [result, router]);

  if (!result) return null;

  const level = LEVELS[result.level];

  function startOver() {
    resetTriage();
    router.replace('/triage');
  }

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          {result.level === 'consultation' ? (
            <Button
              label="Trouver un médecin"
              onPress={() => router.push('/medecins')}
            />
          ) : null}
          {result.level === 'urgence' ? (
            <Button label="J’ai compris" onPress={() => router.replace('/')} />
          ) : null}
          {result.level === 'surveillance' ? (
            <Button label="Terminer" onPress={() => router.replace('/')} />
          ) : null}
          <Button label="Refaire l’évaluation" variant="ghost" onPress={startOver} />
        </View>
      }
    >
      <View style={[styles.banner, { backgroundColor: level.bg }]}>
        <View style={[styles.iconCircle, { backgroundColor: level.fg }]}>
          <Text style={styles.iconText}>{level.icon}</Text>
        </View>
        <Badge label={level.badge} tone={level.tone} />
        <Text style={[styles.bannerTitle, { color: level.fg }]}>{result.title}</Text>
        <Text style={[styles.bannerCaption, { color: level.fg }]}>{level.caption}</Text>
      </View>

      <Text style={styles.summary}>{result.summary}</Text>

      {result.redFlags.length > 0 ? (
        <Card style={styles.card}>
          <Eyebrow>Signes d’alerte relevés</Eyebrow>
          {result.redFlags.map((flag) => (
            <Bullet key={flag}>{flag}</Bullet>
          ))}
        </Card>
      ) : null}

      {result.reasons.length > 0 ? (
        <Card style={styles.card}>
          <Eyebrow>Ce qui a été pris en compte</Eyebrow>
          {result.reasons.map((reason) => (
            <Bullet key={reason}>{reason}</Bullet>
          ))}
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Eyebrow>À faire maintenant</Eyebrow>
        {result.advice.map((item) => (
          <Bullet key={item}>{item}</Bullet>
        ))}
      </Card>

      <Text style={styles.disclaimer}>
        Cette évaluation est une orientation, pas un diagnostic. Elle ne remplace pas l’examen
        d’un professionnel de santé.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.xl,
    padding: space.xl,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  iconText: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  bannerTitle: { ...font.h1, fontSize: 26, lineHeight: 32, marginTop: space.md },
  bannerCaption: { ...font.small, marginTop: space.xs, opacity: 0.8 },
  summary: { ...font.body, color: colors.inkSoft, marginTop: space.lg },
  card: { marginTop: space.lg },
  disclaimer: {
    ...font.small,
    color: colors.muted,
    fontSize: 12,
    marginTop: space.xl,
    lineHeight: 18,
  },
  footer: { gap: space.sm },
});
