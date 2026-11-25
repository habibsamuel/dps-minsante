import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, Eyebrow, Screen } from '@/components/ui';
import { isBackendConfigured } from '@/lib/supabase';
import { useTriage } from '@/store';
import { colors, font, radius, space } from '@/theme';

export default function ProfilScreen() {
  const router = useRouter();
  const { profile, history, resetTriage, signOut } = useTriage();

  const initials =
    profile?.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '＋';

  return (
    <Screen>
      <Card style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.identity}>
          <Text style={styles.name}>{profile?.name ?? 'Invité'}</Text>
          <Text style={styles.meta}>
            {profile ? `${profile.phone} · ${profile.city}` : 'Aucun compte enregistré'}
          </Text>
          <View style={styles.badgeRow}>
            {profile ? (
              <Badge
                label={profile.role === 'medecin' ? 'Médecin' : 'Patient'}
                tone={profile.role === 'medecin' ? 'primary' : 'neutral'}
              />
            ) : null}
            {history.length > 0 ? (
              <Badge
                label={`${history.length} demande${history.length > 1 ? 's' : ''}`}
                tone="calm"
              />
            ) : null}
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Eyebrow>Mon dossier</Eyebrow>
        <View style={styles.links}>
          <Button
            label={profile ? 'Modifier mes informations' : 'Créer mon compte'}
            variant="secondary"
            onPress={() => router.push('/auth')}
          />
          <Button
            label="Mes demandes de consultation"
            variant="secondary"
            onPress={() => router.push('/historique')}
          />
          <Button
            label="Espace médecin"
            variant="secondary"
            onPress={() => router.push('/espace-medecin')}
          />
          <Button
            label="Refaire une évaluation"
            variant="ghost"
            onPress={() => {
              resetTriage();
              router.push('/triage');
            }}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Eyebrow>Données et confidentialité</Eyebrow>
        <Text style={styles.text}>
          {isBackendConfigured
            ? 'Connecté à Supabase : les demandes sont synchronisées et protégées par les règles d’accès (RLS).'
            : 'Mode local : tout reste sur ce téléphone. Ajoute les clés Supabase pour activer la synchronisation et le chiffrement côté serveur.'}
        </Text>
        <Text style={styles.text}>
          Tes réponses servent uniquement à orienter la prise en charge. Elles ne constituent pas
          un diagnostic.
        </Text>
      </Card>

      {profile ? (
        <View style={styles.signOut}>
          <Button
            label="Se déconnecter"
            variant="ghost"
            onPress={() => {
              signOut();
              router.replace('/');
            }}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...font.h2, color: colors.primary },
  identity: { flex: 1 },
  name: { ...font.h3, color: colors.ink },
  meta: { ...font.small, color: colors.muted, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  card: { marginTop: space.lg },
  links: { gap: space.sm, marginTop: space.md },
  text: { ...font.small, color: colors.inkSoft, marginTop: space.sm, lineHeight: 20 },
  signOut: { marginTop: space.xl },
});
