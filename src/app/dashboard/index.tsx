import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dashboardItemsFor, ROLE_LABEL } from '@/lib/dashboard';
import { useTriage } from '@/store';
import { colors, radius, shadow } from '@/theme';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export default function DashboardHome() {
  const router = useRouter();
  const { profile, history } = useTriage();

  const role = profile?.role ?? '';
  const firstName = profile?.name?.trim().split(' ')[0] ?? '';
  const quick = dashboardItemsFor(role).filter((item) => item.key !== 'home');

  const pending = history.filter((item) => item.status === 'envoyee').length;
  const stats =
    role === 'patient'
      ? [
          { label: 'Demandes envoyées', value: history.length },
          { label: 'En attente de réponse', value: pending },
        ]
      : role === 'medecin'
        ? [
            { label: 'Demandes reçues', value: history.length },
            { label: 'À traiter', value: pending },
          ]
        : [];

  return (
    <View>
      <Text style={styles.hello}>
        {greeting()}
        {firstName ? `, ${firstName}` : ''}
      </Text>
      <Text style={styles.title}>Ton tableau de bord</Text>
      <Text style={styles.lede}>
        {ROLE_LABEL[role] ?? 'Compte'}
        {profile?.city ? ` · ${profile.city}` : ''}
      </Text>

      {stats.length > 0 ? (
        <View style={styles.stats}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.section}>Accès rapide</Text>
      <View style={styles.grid}>
        {quick.map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="link"
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardIcon}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardHint}>{item.hint}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hello: { fontFamily: 'Comfortaa_500Medium', fontSize: 14, color: colors.muted },
  title: { fontFamily: 'Comfortaa_700Bold', fontSize: 28, color: colors.ink, marginTop: 4 },
  lede: { fontFamily: 'Comfortaa_500Medium', fontSize: 15, color: colors.inkSoft, marginTop: 6 },

  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 28 },
  stat: {
    flexGrow: 1,
    flexBasis: 220,
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadow.soft,
  },
  statValue: { fontFamily: 'Comfortaa_700Bold', fontSize: 34, color: colors.primary },
  statLabel: { fontFamily: 'Comfortaa_500Medium', fontSize: 13, color: colors.muted, marginTop: 2 },

  section: { fontFamily: 'Comfortaa_700Bold', fontSize: 18, color: colors.ink, marginTop: 36, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: {
    flexGrow: 1,
    flexBasis: 300,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadow.soft,
  },
  cardPressed: { opacity: 0.9 },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardLabel: { fontFamily: 'Comfortaa_700Bold', fontSize: 15, color: colors.ink },
  cardHint: { fontFamily: 'Comfortaa_500Medium', fontSize: 12, color: colors.muted, marginTop: 2 },
});