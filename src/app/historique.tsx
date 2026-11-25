import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, Eyebrow, Screen } from '@/components/ui';
import { STATUS_LABEL, type Consultation } from '@/lib/api';
import { useTriage } from '@/store';
import { colors, font, space } from '@/theme';

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoriqueScreen() {
  const router = useRouter();
  const { history } = useTriage();

  if (history.length === 0) {
    return (
      <Screen>
        <Card>
          <Eyebrow>Aucune demande</Eyebrow>
          <Text style={styles.emptyTitle}>Rien pour le moment</Text>
          <Text style={styles.emptyText}>
            Fais une évaluation, puis choisis un médecin : ta demande apparaîtra ici avec son
            statut.
          </Text>
          <View style={styles.emptyAction}>
            <Button label="Commencer une évaluation" onPress={() => router.push('/triage')} />
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.lede}>
        {history.length} demande{history.length > 1 ? 's' : ''} enregistrée
        {history.length > 1 ? 's' : ''} sur ce téléphone.
      </Text>
      {history.map((item) => (
        <ConsultationCard key={item.id} consultation={item} />
      ))}
    </Screen>
  );
}

function ConsultationCard({ consultation }: { consultation: Consultation }) {
  const tone =
    consultation.status === 'envoyee'
      ? ('warning' as const)
      : consultation.status === 'confirmee'
        ? ('primary' as const)
        : ('calm' as const);

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.main}>
          <Text style={styles.doctor}>{consultation.doctorName}</Text>
          <Text style={styles.meta}>
            {consultation.doctorSpecialty} · {consultation.city}
          </Text>
        </View>
        <Badge label={STATUS_LABEL[consultation.status]} tone={tone} />
      </View>
      <Text style={styles.date}>{formatDate(consultation.createdAt)}</Text>
      {consultation.summary.slice(0, 2).map((line) => (
        <Text key={line} style={styles.summary}>
          · {line}
        </Text>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  lede: { ...font.small, color: colors.muted, marginTop: space.sm, marginBottom: space.md },
  card: { marginBottom: space.md },
  row: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  main: { flex: 1 },
  doctor: { ...font.body, fontWeight: '700', color: colors.ink },
  meta: { ...font.small, color: colors.inkSoft, marginTop: 2 },
  date: { ...font.small, fontSize: 11, color: colors.muted, marginTop: space.sm },
  summary: { ...font.small, color: colors.inkSoft, marginTop: 2 },
  emptyTitle: { ...font.h2, color: colors.ink, marginTop: space.xs },
  emptyText: { ...font.body, color: colors.inkSoft, marginTop: space.sm },
  emptyAction: { marginTop: space.lg },
});
