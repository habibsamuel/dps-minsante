import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Master } from '@/components/layout';
import { Button } from '@/components/ui';
import { colors, font, radius, space } from '@/theme';

/* ------------------------------------------------------------------ */
/*  Données                                                            */
/* ------------------------------------------------------------------ */

type AccountType = 'patient' | 'praticien' | 'pharmacie' | 'fosa';

const TYPES: { value: AccountType; label: string }[] = [
  { value: 'patient', label: 'Patient' },
  { value: 'praticien', label: 'Praticien' },
  { value: 'pharmacie', label: 'Pharmacie' },
  { value: 'fosa', label: 'Formation sanitaire' },
];

const PROFESSIONS = ['Médecin', 'Infirmier(ère)', 'Sage-femme'];
const FOSA_KINDS = ['Hôpital', 'Centre de santé', 'Clinique', 'Poste de santé'];

const LICENSE_LABEL: Record<Exclude<AccountType, 'patient'>, string> = {
  praticien: 'Numéro d’ordre',
  pharmacie: 'Numéro d’autorisation',
  fosa: 'Numéro d’agrément',
};

type Form = {
  type: AccountType;
  name: string;
  phone: string;
  city: string;
  profession: string;
  establishment: string;
  fosaKind: string;
  address: string;
  license: string;
  accepted: boolean;
};

type Errors = Partial<Record<keyof Form, string>>;

const INITIAL: Form = {
  type: 'patient',
  name: '',
  phone: '',
  city: '',
  profession: '',
  establishment: '',
  fosaKind: '',
  address: '',
  license: '',
  accepted: false,
};

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

function validate(f: Form): Errors {
  const e: Errors = {};
  const phone = f.phone.replace(/\D/g, '').replace(/^237/, '');

  if (f.name.trim().length < 3) e.name = 'Indique un nom complet.';
  if (!/^[62]\d{8}$/.test(phone)) e.phone = 'Numéro invalide. Exemple : 6XX XX XX XX';
  if (f.city.trim().length < 2) e.city = 'Indique ta ville.';

  if (f.type === 'praticien') {
    if (!f.profession) e.profession = 'Choisis ta profession.';
    if (f.license.trim().length < 3) e.license = 'Champ obligatoire.';
  }
  if (f.type === 'pharmacie' || f.type === 'fosa') {
    if (f.establishment.trim().length < 2) e.establishment = 'Champ obligatoire.';
    if (f.address.trim().length < 3) e.address = 'Champ obligatoire.';
    if (f.license.trim().length < 3) e.license = 'Champ obligatoire.';
  }
  if (f.type === 'fosa' && !f.fosaKind) e.fosaKind = 'Choisis un type.';

  if (!f.accepted) e.accepted = 'Accepte les conditions pour continuer.';
  return e;
}

/* ------------------------------------------------------------------ */
/*  Écran                                                              */
/* ------------------------------------------------------------------ */

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(form);
  const show = (key: keyof Form) => (submitted ? errors[key] : undefined);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isOrg = form.type === 'pharmacie' || form.type === 'fosa';
  const isPro = form.type !== 'patient';

  function submit() {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    // TODO : brancher le backend ici (création du compte).
    console.log('Inscription', form);
    router.replace('/');
  }

  return (
    <Master title="Inscription" footer={<Button label="Créer mon compte" onPress={submit} />}>
      <View style={styles.container}>
        <Text style={styles.title}>Créer ton compte</Text>
        <Text style={styles.lede}>Choisis ton profil, puis remplis tes informations.</Text>

        {/* Type de compte */}
        <Text style={styles.section}>Je suis</Text>
        <View style={styles.chips}>
          {TYPES.map((t) => (
            <Chip
              key={t.value}
              label={t.label}
              selected={form.type === t.value}
              onPress={() => set('type', t.value)}
            />
          ))}
        </View>

        {/* Établissement (pharmacie / FOSA) */}
        {isOrg ? (
          <Field
            label={form.type === 'pharmacie' ? 'Nom de la pharmacie' : 'Nom de l’établissement'}
            value={form.establishment}
            onChangeText={(v) => set('establishment', v)}
            error={show('establishment')}
          />
        ) : null}

        {form.type === 'fosa' ? (
          <>
            <Text style={styles.label}>Type de formation sanitaire</Text>
            <View style={styles.chips}>
              {FOSA_KINDS.map((k) => (
                <Chip
                  key={k}
                  label={k}
                  selected={form.fosaKind === k}
                  onPress={() => set('fosaKind', k)}
                />
              ))}
            </View>
            {show('fosaKind') ? <Text style={styles.error}>{show('fosaKind')}</Text> : null}
          </>
        ) : null}

        {/* Identité */}
        <Field
          label={isOrg ? 'Nom du responsable' : 'Nom complet'}
          value={form.name}
          onChangeText={(v) => set('name', v)}
          placeholder="Ex. Habib Samuel"
          error={show('name')}
        />
        <Field
          label="Téléphone"
          value={form.phone}
          onChangeText={(v) => set('phone', v)}
          placeholder="6XX XX XX XX"
          keyboardType="phone-pad"
          error={show('phone')}
        />
        <Field
          label="Ville"
          value={form.city}
          onChangeText={(v) => set('city', v)}
          placeholder="Douala, Yaoundé…"
          error={show('city')}
        />

        {isOrg ? (
          <Field
            label="Quartier / adresse"
            value={form.address}
            onChangeText={(v) => set('address', v)}
            error={show('address')}
          />
        ) : null}

        {/* Praticien */}
        {form.type === 'praticien' ? (
          <>
            <Text style={styles.label}>Profession</Text>
            <View style={styles.chips}>
              {PROFESSIONS.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  selected={form.profession === p}
                  onPress={() => set('profession', p)}
                />
              ))}
            </View>
            {show('profession') ? <Text style={styles.error}>{show('profession')}</Text> : null}
          </>
        ) : null}

        {/* Numéro officiel (tous les comptes pro) */}
        {isPro ? (
          <>
            <Field
              label={LICENSE_LABEL[form.type as Exclude<AccountType, 'patient'>]}
              value={form.license}
              onChangeText={(v) => set('license', v)}
              error={show('license')}
            />
            <Text style={styles.hint}>Ton compte sera vérifié avant d’être activé.</Text>
          </>
        ) : null}

        {/* Conditions */}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: form.accepted }}
          onPress={() => set('accepted', !form.accepted)}
          style={styles.terms}
        >
          <View style={[styles.box, form.accepted && styles.boxChecked]}>
            {form.accepted ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
          </View>
          <Text style={styles.termsText}>
            J’accepte que mes données de santé soient utilisées pour l’orientation et la
            téléconsultation.
          </Text>
        </Pressable>
        {show('accepted') ? <Text style={styles.error}>{show('accepted')}</Text> : null}

        <Pressable onPress={() => router.push('/auth/login')} style={styles.loginLink}>
          <Text style={styles.loginText}>Déjà un compte ? Se connecter</Text>
        </Pressable>
      </View>
    </Master>
  );
}

/* ------------------------------------------------------------------ */
/*  Petits composants locaux                                           */
/* ------------------------------------------------------------------ */

function Field({
  label,
  error,
  ...input
}: { label: string; error?: string } & TextInputProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, error ? styles.inputError : null]}
        {...input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipActive]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { ...font.h1, color: colors.ink, marginTop: space.md },
  lede: { ...font.body, color: colors.inkSoft, marginTop: space.sm },
  section: { ...font.h3, color: colors.ink, marginTop: space.xl },
  label: { ...font.small, color: colors.inkSoft, marginTop: space.lg, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { ...font.small, color: colors.inkSoft },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  inputError: { borderColor: colors.danger },
  error: { ...font.small, fontSize: 12, color: colors.danger, marginTop: 4 },
  hint: { ...font.small, color: colors.muted, marginTop: space.sm },
  terms: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start', marginTop: space.xl },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: { ...font.small, color: colors.inkSoft, flex: 1, lineHeight: 19 },
  loginLink: { alignSelf: 'center', paddingVertical: space.lg, marginTop: space.md },
  loginText: { ...font.small, color: colors.primary, fontWeight: '700' },
});