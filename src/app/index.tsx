import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bullet, Button, Card, Eyebrow } from '@/components/ui';
import { useTriage } from '@/store';
import { colors, font, radius, shadow, space } from '@/theme';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useTriage();
  const firstName = profile?.name?.trim().split(' ')[0] ?? '';
  const initials =
    profile?.name
      ?.trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '＋';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topbar}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoMark}>+</Text>
            </View>
            <View>
              <Text style={styles.brandName}>DPS Minsanté</Text>
              <Text style={styles.brandSub}>Téléconsultation · Cameroun</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvrir mon profil"
            onPress={() => router.push('/profil')}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
        </View>

        <Text style={styles.greeting}>
          {greeting()}
          {firstName ? `, ${firstName}` : ''}
        </Text>
        <Text style={styles.headline}>Comment te sens-tu aujourd’hui ?</Text>
        <Text style={styles.lede}>
          Réponds à quelques questions courtes. Si c’est sérieux, on te met en relation avec un
          médecin.
        </Text>

        <Card style={styles.heroCard}>
          <Eyebrow>Pré-consultation</Eyebrow>
          <Text style={styles.heroTitle}>Faire le point en 2 minutes</Text>
          <Text style={styles.heroText}>
            9 questions simples sur ce que tu ressens. Aucun compte à créer, rien à payer.
          </Text>
          <View style={styles.heroFooter}>
            <Button label="Commencer l’évaluation" onPress={() => router.push('/triage')} />
          </View>
          <Text style={styles.heroNote}>
            Ce n’est pas un diagnostic. En cas de danger immédiat, va au centre de santé le plus
            proche.
          </Text>
        </Card>

        <View style={styles.quickRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/historique')}
            style={styles.quickItem}
          >
            <Text style={styles.quickTitle}>Mes demandes</Text>
            <Text style={styles.quickText}>Suivre une consultation</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/espace-medecin')}
            style={styles.quickItem}
          >
            <Text style={styles.quickTitle}>Espace médecin</Text>
            <Text style={styles.quickText}>Demandes reçues</Text>
          </Pressable>
        </View>

        <View style={styles.urgenceStrip}>
          <View style={styles.urgenceDot} />
          <Text style={styles.urgenceText}>
            <Text style={styles.urgenceStrong}>Urgence vitale : </Text>
            ne passe pas par l’application. Fais-toi accompagner aux urgences.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Comment ça marche</Text>
        <View style={styles.steps}>
          <Step
            index="1"
            title="Tu réponds"
            text="Symptômes, durée, intensité, signes d’alerte."
          />
          <Step
            index="2"
            title="On évalue"
            text="Vert : surveillance à la maison. Orange : avis médical. Rouge : urgences."
          />
          <Step
            index="3"
            title="Tu es orienté"
            text="Si besoin, tu choisis un médecin et tu lui envoies ton résumé."
          />
        </View>

        <Card style={styles.infoCard}>
          <Eyebrow>Prochainement</Eyebrow>
          <Text style={styles.infoTitle}>La visio arrive à la prochaine étape</Text>
          <Text style={styles.infoText}>
            Cette version valide déjà le parcours : questions, orientation et dossier médecin.
            L’appel vidéo et le paiement seront ajoutés ensuite.
          </Text>
          <View style={styles.infoBullets}>
            <Bullet>Messagerie avec le médecin</Bullet>
            <Bullet>Visio sécurisée</Bullet>
            <Bullet>Ordonnance numérique</Bullet>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepIndex}>
        <Text style={styles.stepIndexText}>{index}</Text>
      </View>
      <View style={styles.stepBody}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxxl },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space.sm,
    marginBottom: space.xl,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginTop: -2 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatarText: { ...font.small, fontWeight: '700', color: colors.primary },
  quickRow: { flexDirection: 'row', gap: space.md, marginTop: space.md },
  quickItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
  },
  quickTitle: { ...font.small, fontWeight: '700', color: colors.ink },
  quickText: { ...font.small, color: colors.muted, fontSize: 11, marginTop: 2 },
  brandName: { ...font.h3, color: colors.ink },
  brandSub: { ...font.small, color: colors.muted, fontSize: 11 },
  greeting: { ...font.small, color: colors.muted, marginBottom: space.xs },
  headline: { ...font.h1, color: colors.ink },
  lede: { ...font.body, color: colors.inkSoft, marginTop: space.sm, marginBottom: space.xl },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    ...shadow.card,
  },
  heroTitle: { ...font.h2, color: colors.ink },
  heroText: { ...font.body, color: colors.inkSoft, marginTop: space.sm },
  heroFooter: { marginTop: space.lg },
  heroNote: { ...font.small, color: colors.muted, marginTop: space.md, fontSize: 12 },
  urgenceStrip: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'flex-start',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: space.lg,
    marginTop: space.lg,
  },
  urgenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginTop: 6,
  },
  urgenceText: { ...font.small, color: colors.danger, flex: 1 },
  urgenceStrong: { fontWeight: '700' },
  sectionTitle: { ...font.h3, color: colors.ink, marginTop: space.xxl, marginBottom: space.md },
  steps: { gap: space.md },
  step: { flexDirection: 'row', gap: space.md },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.sandDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: { ...font.small, fontWeight: '700', color: colors.primary },
  stepBody: { flex: 1 },
  stepTitle: { ...font.body, fontWeight: '700', color: colors.ink },
  stepText: { ...font.small, color: colors.inkSoft, marginTop: 2 },
  infoCard: { marginTop: space.xxl },
  infoTitle: { ...font.h3, color: colors.ink },
  infoText: { ...font.small, color: colors.inkSoft, marginTop: space.sm },
  infoBullets: { marginTop: space.md },
});
