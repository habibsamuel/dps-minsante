import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Button, CheckCard, OptionCard, Progress, Screen } from '@/components/ui';
import {
  ACCOUNT_TYPES, DEMO_CODE, FOSA_KINDS, LICENSE_LABEL, PROFESSIONS,
  isPro, normalizePhone, sendOtp, validateInfos, verifyOtp,
  type AccountType, type RegisterData,
} from '@/lib/auth';
import { saveJSON, STORAGE_KEYS } from '@/lib/storage';
import { isBackendConfigured } from '@/lib/supabase';
import { useTriage, type Role } from '@/store';
import { colors, font, radius, space } from '@/theme';

// À étendre dans le store : type Role = 'patient' | 'medecin' | 'pharmacie' | 'fosa'
const ROLE_BY_TYPE: Record<AccountType, Role> = {
  patient: 'patient',
  praticien: 'medecin',
  pharmacie: 'pharmacie' as Role,
  fosa: 'fosa' as Role,
};

const TITLES = ['Tu es…', 'Tes informations', 'Vérification'];

export function RegisterForm() {
  const router = useRouter();
  const { saveProfile } = useTriage();

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState<RegisterData>({
    type: 'patient', name: '', phone: '', city: '', acceptedTerms: false,
  });
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof RegisterData>(key: K, value: RegisterData[K]) => {
    setError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pro = isPro(form.type);
  const organisation = form.type === 'pharmacie' || form.type === 'fosa';

  async function next() {
    setError(null);

    if (step === 0) return setStep(1);

    if (step === 1) {
      const problem = validateInfos(form);
      if (problem) return setError(problem);
      setBusy(true);
      const phone = normalizePhone(form.phone)!;
      const res = await sendOtp(phone, { type: form.type, name: form.name.trim() });
      setBusy(false);
      if (!res.ok) return setError(res.message);
      return setStep(2);
    }

    setBusy(true);
    const phone = normalizePhone(form.phone)!;
    const res = await verifyOtp(phone, code.trim());
    if (!res.ok) {
      setBusy(false);
      return setError(res.message);
    }
    await saveJSON(STORAGE_KEYS.registration, {
      ...form,
      phone,
      status: pro ? 'en_attente' : 'actif',
    });
    saveProfile({
      name: form.name.trim(),
      phone,
      city: form.city.trim(),
      role: ROLE_BY_TYPE[form.type],
    });
    setBusy(false);
    router.replace('/');
  }

  function back() {
    setError(null);
    if (step === 0) router.back();
    else setStep((s) => (s - 1) as 0 | 1);
  }

  return (
    <Screen
      footer={
        <View style={styles.footerRow}>
          <View style={styles.footerBack}>
            <Button label="Retour" variant="ghost" onPress={back} />
          </View>
          <View style={styles.footerNext}>
            <Button
              label={step === 1 ? 'Recevoir le code' : step === 2 ? 'Créer mon compte' : 'Continuer'}
              onPress={next}
              disabled={busy || (step === 2 && code.trim().length < 6)}
            />
          </View>
        </View>
      }
    >
      <View style={styles.container}>
        <Text style={styles.step}>Étape {step + 1} / 3</Text>
        <Progress value={(step + 1) / 3} />
        <Text style={styles.title}>{TITLES[step]}</Text>

        {/* ---------- Étape 1 : type de compte ---------- */}
        {step === 0 ? (
          <View style={styles.list}>
            {ACCOUNT_TYPES.map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                sub={o.sub}
                selected={form.type === o.value}
                onPress={() => set('type', o.value)}
              />
            ))}
          </View>
        ) : null}

        {/* ---------- Étape 2 : informations ---------- */}
        {step === 1 ? (
          <View style={styles.list}>
            {organisation ? (
              <Field
                label={form.type === 'pharmacie' ? 'Nom de la pharmacie' : 'Nom de l’établissement'}
                value={form.establishment ?? ''}
                onChangeText={(v) => set('establishment', v)}
              />
            ) : null}

            {form.type === 'fosa' ? (
              <>
                <Text style={styles.label}>Type de formation sanitaire</Text>
                {FOSA_KINDS.map((o) => (
                  <OptionCard
                    key={o.value}
                    label={o.label}
                    selected={form.fosaKind === o.value}
                    onPress={() => set('fosaKind', o.value)}
                  />
                ))}
              </>
            ) : null}

            <Field
              label={organisation ? 'Nom du responsable' : 'Nom complet'}
              value={form.name}
              onChangeText={(v) => set('name', v)}
              placeholder="Ex. Habib Samuel"
            />
            <Field
              label="Téléphone"
              value={form.phone}
              onChangeText={(v) => set('phone', v)}
              placeholder="6XX XX XX XX"
              keyboardType="phone-pad"
            />
            <Field
              label="Ville"
              value={form.city}
              onChangeText={(v) => set('city', v)}
              placeholder="Douala, Yaoundé…"
            />

            {organisation ? (
              <Field
                label="Quartier / adresse"
                value={form.address ?? ''}
                onChangeText={(v) => set('address', v)}
              />
            ) : null}

            {form.type === 'praticien' ? (
              <>
                <Text style={styles.label}>Profession</Text>
                {PROFESSIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    label={o.label}
                    selected={form.profession === o.value}
                    onPress={() => set('profession', o.value)}
                  />
                ))}
                {form.profession === 'medecin' ? (
                  <Field
                    label="Spécialité (facultatif)"
                    value={form.specialty ?? ''}
                    onChangeText={(v) => set('specialty', v)}
                    placeholder="Généraliste, pédiatre…"
                  />
                ) : null}
                <Field
                  label="Structure d’exercice (facultatif)"
                  value={form.structure ?? ''}
                  onChangeText={(v) => set('structure', v)}
                />
              </>
            ) : null}

            {pro ? (
              <>
                <Field
                  label={LICENSE_LABEL[form.type as Exclude<AccountType, 'patient'>]}
                  value={form.licenseNumber ?? ''}
                  onChangeText={(v) => set('licenseNumber', v)}
                />
                <Text style={styles.hint}>
                  Ton compte sera visible après vérification par la DPS.
                </Text>
              </>
            ) : null}

            <CheckCard
              label="J’accepte le traitement de mes données de santé pour l’orientation et la téléconsultation."
              selected={form.acceptedTerms}
              onPress={() => set('acceptedTerms', !form.acceptedTerms)}
            />
          </View>
        ) : null}

        {/* ---------- Étape 3 : code SMS ---------- */}
        {step === 2 ? (
          <View style={styles.list}>
            <Text style={styles.hint}>
              Un code à 6 chiffres a été envoyé au {normalizePhone(form.phone)}.
            </Text>
            <TextInput
              value={code}
              onChangeText={(v) => { setError(null); setCode(v.replace(/\D/g, '')); }}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="······"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.codeInput]}
            />
            <Button label="Renvoyer le code" variant="ghost" onPress={() => sendOtp(normalizePhone(form.phone)!, { type: form.type, name: form.name.trim() })} />
            {!isBackendConfigured ? (
              <Text style={styles.hint}>Mode démo : le code est {DEMO_CODE}.</Text>
            ) : null}
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </Screen>
  );
}

function Field({ label, ...input }: { label: string } & TextInputProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={styles.input} {...input} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  step: { ...font.small, color: colors.primary, fontWeight: '700', marginBottom: space.sm },
  title: { ...font.h2, color: colors.ink, marginTop: space.lg },
  list: { marginTop: space.lg, gap: space.sm },
  label: { ...font.small, color: colors.inkSoft, marginBottom: 6, marginTop: space.sm },
  hint: { ...font.small, color: colors.muted, lineHeight: 19 },
  error: { ...font.small, color: colors.danger, marginTop: space.lg, textAlign: 'center' },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line,
    borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 12,
    fontSize: 16, color: colors.ink,
  },
  codeInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
  footerRow: { flexDirection: 'row', gap: space.md },
  footerBack: { flex: 1 },
  footerNext: { flex: 2 },
});