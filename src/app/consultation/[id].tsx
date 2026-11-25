import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Bullet, Button, Card, Eyebrow, Screen } from '@/components/ui';
import { createConsultation } from '@/lib/api';
import { findDoctor, initials } from '@/lib/doctors';
import { answerLabel } from '@/lib/triage';
import { useTriage } from '@/store';
import { colors, font, radius, shadow, space } from '@/theme';

const LEVEL_LABEL = {
  urgence: { label: 'Priorité élevée', tone: 'danger' as const },
  consultation: { label: 'Avis médical conseillé', tone: 'warning' as const },
  surveillance: { label: 'Surveillance', tone: 'calm' as const },
};

export default function ConsultationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { answers, result, addConsultation } = useTriage();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const doctor = findDoctor(id ?? '');

  if (!doctor) {
    return (
      <Screen>
        <Text style={styles.fallback}>Médecin introuvable.</Text>
        <Button label="Voir les médecins" onPress={() => router.replace('/medecins')} />
      </Screen>
    );
  }

  const summary = [
    answers.symptome ? `Motif : ${answerLabel('symptome', String(answers.symptome))}` : null,
    answers.duree ? `Durée : ${answerLabel('duree', String(answers.duree))}` : null,
    answers.intensite
      ? `Intensité : ${answerLabel('intensite', String(answers.intensite))}`
      : null,
    answers.fievre ? `Fièvre : ${answerLabel('fievre', String(answers.fievre))}` : null,
    answers.age ? `Âge : ${answerLabel('age', String(answers.age))}` : null,
  ].filter((line): line is string => Boolean(line));

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      const consultation = await createConsultation({
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        city: doctor.city,
        level: result?.level ?? 'consultation',
        summary,
      });
      addConsultation(consultation);
    } finally {
      setSending(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <Screen>
        <View style={styles.successBanner}>
          <View style={styles.successIcon}>
            <Text style={styles.successMark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Demande envoyée</Text>
          <Text style={styles.successText}>
            {doctor.name} a reçu ton résumé. Tu recevras une réponse dans l’application dès qu’il
            l’aura consultée.
          </Text>
        </View>

        <Card style={styles.card}>
          <Eyebrow>Prochaine étape</Eyebrow>
          <Text style={styles.cardTitle}>La visio arrive bientôt</Text>
          <Text style={styles.cardText}>
            Cette version transmet le dossier. L’appel vidéo sera activé dans la prochaine mise à
            jour, avec une salle d’attente et une ordonnance numérique.
          </Text>
          <View style={styles.bullets}>
            <Bullet>Messagerie sécurisée avec le médecin</Bullet>
            <Bullet>Appel vidéo depuis l’application</Bullet>
            <Bullet>Ordonnance et compte-rendu archivés</Bullet>
          </View>
          <View style={styles.disabledButton}>
            <Button label="Démarrer la visio (bientôt)" onPress={() => {}} disabled />
          </View>
        </Card>

        <View style={styles.actions}>
          <Button label="Voir mes demandes" onPress={() => router.push('/historique')} />
          <View style={styles.actionsGap} />
          <Button label="Retour à l’accueil" variant="ghost" onPress={() => router.replace('/')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <Button label="Envoyer la demande" onPress={handleSend} loading={sending} />
          <Text style={styles.footerNote}>Aucun paiement demandé à cette étape.</Text>
        </View>
      }
    >
      <Card style={styles.doctorCard}>
        <View style={styles.doctorTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(doctor.name)}</Text>
          </View>
          <View style={styles.identity}>
            <Text style={styles.name}>{doctor.name}</Text>
            <Text style={styles.meta}>
              {doctor.specialty} · {doctor.city}
            </Text>
            <Text style={styles.facility}>{doctor.facility}</Text>
          </View>
        </View>
        <Text style={styles.bio}>{doctor.bio}</Text>
        <View style={styles.badges}>
          <Badge label={doctor.availability} tone={doctor.availableNow ? 'calm' : 'neutral'} />
          <Badge label={`${doctor.experience} ans d’exercice`} />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Eyebrow>Résumé envoyé au médecin</Eyebrow>
          {result ? (
            <Badge label={LEVEL_LABEL[result.level].label} tone={LEVEL_LABEL[result.level].tone} />
          ) : null}
        </View>
        {summary.length > 0 ? (
          summary.map((line) => <Bullet key={line}>{line}</Bullet>)
        ) : (
          <Text style={styles.cardText}>
            Aucune évaluation enregistrée. Le médecin te posera les questions directement.
          </Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Eyebrow>Ce qui se passe ensuite</Eyebrow>
        <View style={styles.timeline}>
          <TimelineItem
            title="1. Le médecin lit ton résumé"
            text="Il peut te demander une précision avant de répondre."
          />
          <TimelineItem
            title="2. Il confirme le créneau"
            text={
              doctor.availableNow
                ? 'Disponible maintenant : réponse attendue dans les prochaines minutes.'
                : `Créneau proposé : ${doctor.availability.toLowerCase()}.`
            }
          />
          <TimelineItem
            title="3. La consultation"
            text="Par messagerie dans cette version, puis en visio à la prochaine étape."
            last
          />
        </View>
      </Card>

      <Text style={styles.disclaimer}>
        En cas d’aggravation rapide, ne reste pas dans l’attente : rends-toi au centre de santé le
        plus proche.
      </Text>
    </Screen>
  );
}

function TimelineItem({
  title,
  text,
  last,
}: {
  title: string;
  text: string;
  last?: boolean;
}) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineRail}>
        <View style={styles.timelineDot} />
        {last ? null : <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineBody}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { ...font.body, color: colors.inkSoft, marginBottom: space.lg },
  doctorCard: { ...shadow.soft },
  doctorTop: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...font.h2, color: colors.primary },
  identity: { flex: 1 },
  name: { ...font.h3, color: colors.ink },
  meta: { ...font.small, color: colors.inkSoft, marginTop: 2 },
  facility: { ...font.small, fontSize: 12, color: colors.muted },
  bio: { ...font.small, color: colors.inkSoft, marginTop: space.md },
  badges: { flexDirection: 'row', gap: space.sm, marginTop: space.md, flexWrap: 'wrap' },
  card: { marginTop: space.lg },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space.sm,
    marginBottom: space.sm,
  },
  cardTitle: { ...font.h3, color: colors.ink },
  cardText: { ...font.small, color: colors.inkSoft, marginTop: space.xs },
  bullets: { marginTop: space.md },
  disabledButton: { marginTop: space.lg },
  actions: { marginTop: space.xl },
  actionsGap: { height: space.sm },
  footer: { gap: space.xs },
  footerNote: { ...font.small, fontSize: 11, color: colors.muted, textAlign: 'center' },
  disclaimer: { ...font.small, fontSize: 11, color: colors.muted, marginTop: space.xl, lineHeight: 17 },
  timeline: { marginTop: space.sm },
  timelineItem: { flexDirection: 'row', gap: space.md },
  timelineRail: { alignItems: 'center', width: 12 },
  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  timelineLine: { flex: 1, width: 1.5, backgroundColor: colors.line, marginVertical: 3 },
  timelineBody: { flex: 1, paddingBottom: space.lg },
  timelineTitle: { ...font.body, fontWeight: '600', color: colors.ink },
  timelineText: { ...font.small, color: colors.inkSoft, marginTop: 2 },
  successBanner: {
    backgroundColor: colors.calmSoft,
    borderRadius: radius.xl,
    padding: space.xl,
    alignItems: 'flex-start',
  },
  successIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.calm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  successMark: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  successTitle: { ...font.h2, color: colors.calm },
  successText: { ...font.body, color: colors.inkSoft, marginTop: space.sm },
});
