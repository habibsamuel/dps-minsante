import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, Eyebrow, Screen } from '@/components/ui';
import { useTriage, type Role } from '@/store';
import { colors, font, radius, space } from '@/theme';

export default function AuthScreen() {
  const router = useRouter();
  const { profile, saveProfile } = useTriage();
  const [mode, setMode] = useState<'connexion' | 'inscription'>('inscription');
  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [role, setRole] = useState<Role>(profile?.role ?? 'patient');

  const canSubmit = name.trim().length > 1 && phone.trim().length >= 8;

  const submit = () => {
    saveProfile({ name: name.trim(), phone: phone.trim(), city: city.trim() || 'Cameroun', role });
    router.replace(role === 'medecin' ? '/espace-medecin' : '/');
  };

  return (
    <Screen>
      <Text style={styles.title}>
        {mode === 'inscription' ? 'Créer ton compte' : 'Se connecter'}
      </Text>
      <Text style={styles.lede}>
        Un compte permet de retrouver ton dossier et le résumé de tes consultations sur ce
        téléphone.
      </Text>

      <View style={styles.switch}>
        {(['inscription', 'connexion'] as const).map((item) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            onPress={() => setMode(item)}
            style={[styles.switchItem, mode === item && styles.switchItemActive]}
          >
            <Text style={[styles.switchText, mode === item && styles.switchTextActive]}>
              {item === 'inscription' ? 'Inscription' : 'Connexion'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Card style={styles.card}>
        <Text style={styles.label}>Nom complet</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex. Habib Samuel"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="6XX XX XX XX"
          keyboardType="phone-pad"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Text style={styles.label}>Ville</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="Douala, Yaoundé…"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <Eyebrow>Je suis</Eyebrow>
        <View style={styles.roles}>
          {(['patient', 'medecin'] as const).map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              onPress={() => setRole(item)}
              style={[styles.role, role === item && styles.roleActive]}
            >
              <Text style={[styles.roleText, role === item && styles.roleTextActive]}>
                {item === 'patient' ? 'Patient' : 'Médecin'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.submit}>
          <Button
            label={mode === 'inscription' ? 'Créer mon compte' : 'Entrer'}
            onPress={submit}
            disabled={!canSubmit}
          />
        </View>
      </Card>

      <Text style={styles.note}>
        Mode démo : le compte est stocké sur ce téléphone. La connexion sécurisée (téléphone +
        code, puis Supabase Auth) sera branchée à l’étape suivante. Aucune donnée médicale n’est
        envoyée pour l’instant.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...font.h1, color: colors.ink, marginTop: space.md },
  lede: { ...font.body, color: colors.inkSoft, marginTop: space.sm },
  switch: {
    flexDirection: 'row',
    backgroundColor: colors.sandDeep,
    borderRadius: radius.pill,
    padding: 4,
    marginTop: space.lg,
  },
  switchItem: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center' },
  switchItemActive: { backgroundColor: colors.surface },
  switchText: { ...font.small, color: colors.inkSoft },
  switchTextActive: { color: colors.ink, fontWeight: '700' },
  card: { marginTop: space.lg, gap: 6 },
  label: { ...font.small, color: colors.inkSoft, marginTop: space.sm },
  input: {
    backgroundColor: colors.sand,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  roles: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  role: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  roleActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  roleText: { ...font.small, color: colors.inkSoft },
  roleTextActive: { color: colors.primary, fontWeight: '700' },
  submit: { marginTop: space.lg },
  note: { ...font.small, color: colors.muted, marginTop: space.lg, lineHeight: 19 },
});
