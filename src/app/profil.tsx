import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Master } from '@/components/layout';
import { Badge, Button } from '@/components/ui';
import { ROLE_LABEL } from '@/lib/dashboard';
import { initialsOf } from '@/lib/format';
import { useTriage } from '@/store';
import { colors, radius, shadow, space } from '@/theme';

/* ---------- Helpers téléphone (Cameroun : +237, 9 chiffres, 6xx ou 2xx) ---------- */

function localDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('237') && digits.length > 9 ? digits.slice(3) : digits;
}

function normalizePhone(raw: string): string | null {
  const local = localDigits(raw);
  return /^[62]\d{8}$/.test(local) ? `+237${local}` : null;
}

type Errors = { name?: string; phone?: string; city?: string };

export default function ProfilScreen() {
  const router = useRouter();
  const { profile, signOut, updateProfile } = useTriage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  // Préremplit les champs avec le profil enregistré (vide s'il n'y en a pas).
  useEffect(() => {
    setName(profile?.name ?? '');
    setPhone(localDigits(profile?.phone ?? ''));
    setCity(profile?.city ?? '');
  }, [profile]);

  const roleLabel = ROLE_LABEL[profile?.role ?? 'patient'] ?? 'Patient';

  function save() {
    const next: Errors = {};
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanCity = city.trim();
    const cleanPhone = normalizePhone(phone);

    if (cleanName.length < 2) next.name = 'Entre ton nom (2 caractères minimum).';
    if (!cleanPhone) next.phone = 'Numéro invalide. Exemple : 6 77 12 34 56.';
    if (cleanCity.length < 2) next.city = 'Entre ta ville.';

    setErrors(next);
    if (Object.keys(next).length > 0 || !cleanPhone) return;

    updateProfile({ name: cleanName, phone: cleanPhone, city: cleanCity });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <Master title="Profil" footer={<Button label="Enregistrer" onPress={save} />}>
      {/* ---------- En-tête ---------- */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initialsOf(name)}</Text>
        </View>
        <Text style={styles.name}>{name.trim() || 'Mon profil'}</Text>
        <View style={styles.badges}>
          <Badge label={roleLabel} tone="neutral" />
        </View>
      </View>

      {saved ? (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color={colors.calm} />
          <Text style={styles.toastText}>Profil enregistré.</Text>
        </View>
      ) : null}

      {/* ---------- Informations personnelles ---------- */}
      <Text style={styles.section}>Informations personnelles</Text>
      <View style={styles.form}>
        <Field label="Nom complet" error={errors.name}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex. Marie Ngono"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            autoComplete="name"
            style={[styles.input, errors.name && styles.inputError]}
          />
        </Field>

        <Field label="Téléphone" error={errors.phone}>
          <View style={[styles.phoneRow, errors.phone && styles.inputError]}>
            <Text style={styles.prefix}>+237</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="6 77 12 34 56"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={14}
              style={styles.phoneInput}
            />
          </View>
        </Field>

        <Field label="Ville" error={errors.city}>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Ex. Yaoundé"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            style={[styles.input, errors.city && styles.inputError]}
          />
        </Field>
      </View>

      {/* ---------- Déconnexion ---------- */}
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
    </Master>
  );
}

/* ---------- Sous-composant ---------- */

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: space.md,
    padding: space.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadow.soft,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primarySoft,
  },
  avatarText: { fontFamily: 'Comfortaa_700Bold', fontSize: 28, color: '#FFFFFF' },
  name: { fontFamily: 'Comfortaa_700Bold', fontSize: 22, color: colors.ink, marginTop: space.md },
  badges: { flexDirection: 'row', justifyContent: 'center', marginTop: space.md },

  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  toastText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 13, color: colors.primary },

  section: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginTop: space.xl,
    marginBottom: space.sm,
    paddingHorizontal: space.xs,
  },
  form: {
    padding: space.lg,
    gap: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  field: { gap: 6 },
  fieldLabel: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 12, color: colors.inkSoft },
  input: {
    minHeight: 50,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.sand,
    fontFamily: 'Comfortaa_500Medium',
    fontSize: 15,
    color: colors.ink,
  },
  inputError: { borderColor: colors.danger },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.sand,
    gap: space.sm,
  },
  prefix: { fontFamily: 'Comfortaa_700Bold', fontSize: 15, color: colors.inkSoft },
  phoneInput: { flex: 1, fontFamily: 'Comfortaa_500Medium', fontSize: 15, color: colors.ink },
  error: { fontFamily: 'Comfortaa_500Medium', fontSize: 12, color: colors.danger },

  signOut: { marginTop: space.xl },
});