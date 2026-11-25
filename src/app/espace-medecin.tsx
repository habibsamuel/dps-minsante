import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, Eyebrow, Screen } from '@/components/ui';
import { STATUS_LABEL, type Consultation } from '@/lib/api';
import { useTriage } from '@/store';
import { colors, font, radius, space } from '@/theme';

export default function EspaceMedecinScreen() {
  const router = useRouter();
  const { profile, history } = useTriage();

  if (profile?.role !== 'medecin') {
    return (
      <Screen>
        <Card>
          <Eyebrow>Accès réservé</Eyebrow>
          <Text style={styles.title}>Espace professionnel de santé</Text>
          <Text style={styles.text}>
            Cet espace reçoit les demandes des patients et permet de confirmer un créneau. Passe
            ton profil en « Médecin » pour le tester.
          </Text>
          <View style={styles.action}>
            <Button label="Activer le profil médecin" onPress={() => router.push('/auth')} />
          </View>
        </Card>
        <Text style={styles.note}>
          En production, l’accès sera vérifié avec le numéro d’ordre et la pièce professionnelle
          avant activation du compte.
        </Text>
      </Screen>
    );
  }

  const pending = history.filter((item) => item.status === 'envoyee').length;

  return (
    <Screen>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>Demandes reçues</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{pending}</Text>
          <Text style={styles.statLabel}>À traiter</Text>
        </View>
      </View>

      <Text style={styles.section}>File d’attente</Text>
      {history.length === 0 ? (
        <Card>
          <Text style={styles.text}>
            Aucune demande pour l’instant. Les évaluations envoyées par les patients apparaîtront
            ici avec leur niveau de priorité.
          </Text>
        </Card>
      ) : (
        history.map((item) => <RequestCard key={item.id} consultation={item} />)
      )}
    </Screen>
  );
}

function RequestCard({ consultation }: { consultation: Consultation }) {
  const priority =
    consultation.level === 'urgence'
      ? { label: 'Priorité élevée', tone: 'danger' as const }
      : consultation.level === 'consultation'
        ? { label: 'Avis conseillé', tone: 'warning' as const }
        : { label: 'Surveillance', tone: 'calm' as const };

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.patient}>Patient anonyme</Text>
        <Badge label={priority.label} tone={priority.tone} />
      </View>
      {consultation.summary.slice(0, 3).map((line) => (
        <Text key={line} style={styles.summary}>
          · {line}
        </Text>
      ))}
      <View style={styles.footerRow}>
        <Text style={styles.status}>{STATUS_LABEL[consultation.status]}</Text>
        <Button
          label="Confirmer"
          variant="secondary"
          onPress={() =>
            Alert.alert(
              'Mode démo',
              'La confirmation et la visio seront branchées à la prochaine étape (Supabase Realtime + Daily).',
            )
          }
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { ...font.h2, color: colors.ink, marginTop: space.xs },
  text: { ...font.small, color: colors.inkSoft, marginTop: space.sm, lineHeight: 20 },
  action: { marginTop: space.lg },
  note: { ...font.small, fontSize: 11, color: colors.muted, marginTop: space.lg, lineHeight: 17 },
  stats: { flexDirection: 'row', gap: space.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
  },
  statValue: { ...font.h1, color: colors.primary },
  statLabel: { ...font.small, color: colors.muted, marginTop: 2 },
  section: { ...font.h3, color: colors.ink, marginTop: space.xl, marginBottom: space.md },
  card: { marginBottom: space.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
  patient: { ...font.body, fontWeight: '700', color: colors.ink },
  summary: { ...font.small, color: colors.inkSoft, marginTop: 2 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.md,
    gap: space.sm,
  },
  status: { ...font.small, fontSize: 11, color: colors.muted },
});
