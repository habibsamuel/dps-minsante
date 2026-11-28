import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { AuthSub, AuthTitle } from '@/components/layout/AuthShell';
import {
  ACCOUNT_TYPES,
  DEMO_CODE,
  FOSA_KINDS,
  LICENSE_LABEL,
  PROFESSIONS,
  isPro,
  normalizePhone,
  sendOtp,
  stepLabel,
  stepsFor,
  validateStep,
  verifyOtp,
  type AccountType,
  type FieldErrors,
  type RegisterData,
  type StepId,
} from '@/lib/auth';
import type { IconName } from '@/lib/navigation';
import { saveJSON, STORAGE_KEYS } from '@/lib/storage';
import { isBackendConfigured } from '@/lib/supabase';
import { useTriage, type Role } from '@/store';
import { colors, font, space } from '@/theme';

import { ChipGroup, Checkbox, ChoiceCard, ErrorText, Field, InfoNote, OtpInput } from './fields';
import { Stepper } from './Stepper';

const NATIVE = Platform.OS !== 'web';
const RESEND_DELAY = 30;

// À étendre dans le store : type Role = 'patient' | 'medecin' | 'pharmacie' | 'fosa'
const ROLE_BY_TYPE: Record<AccountType, Role> = {
  patient: 'patient',
  praticien: 'medecin',
  pharmacie: 'pharmacie' as Role,
  fosa: 'fosa' as Role,
};

const TYPE_ICON: Record<AccountType, IconName> = {
  patient: 'person-outline',
  praticien: 'medkit-outline',
  pharmacie: 'medical-outline',
  fosa: 'business-outline',
};

const EMPTY: RegisterData = { type: 'patient', name: '', phone: '', city: '', acceptedTerms: false };

function formatPhone(phone: string | null): string {
  if (!phone) return '';
  return phone.replace(/^(\+237)(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2$3 $4 $5 $6');
}

function copyFor(step: StepId, type: AccountType): { title: string; sub: string } {
  if (step === 'type') {
    return {
      title: 'Quel est ton profil ?',
      sub: 'Choisis le type de compte qui te correspond. Les étapes s’adaptent à ton choix.',
    };
  }
  if (step === 'identity') {
    return type === 'pharmacie' || type === 'fosa'
      ? { title: 'Le responsable du compte', sub: 'Qui gère le compte au nom de l’établissement ?' }
      : { title: 'Faisons connaissance', sub: 'Ces informations servent à créer ton compte.' };
  }
  if (step === 'pro') {
    if (type === 'praticien') {
      return { title: 'Ton exercice', sub: 'Ces informations seront vérifiées par la DPS.' };
    }
    return type === 'pharmacie'
      ? { title: 'Ta pharmacie', sub: 'Les patients pourront te trouver près de chez eux.' }
      : { title: 'Ta formation sanitaire', sub: 'Les patients pourront te trouver près de chez eux.' };
  }
  return { title: 'Vérifie ton numéro', sub: 'Saisis le code à 6 chiffres reçu par SMS.' };
}

/* ------------------------------------------------------------------ */
/*  Transition entre étapes                                            */
/* ------------------------------------------------------------------ */

function StepView({ stepKey, children }: { stepKey: string; children: ReactNode }) {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE,
    }).start();
  }, [stepKey, anim]);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Formulaire                                                         */
/* ------------------------------------------------------------------ */

export function RegisterForm() {
  const router = useRouter();
  const { saveProfile } = useTriage();

  const [form, setForm] = useState<RegisterData>(EMPTY);
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const steps = stepsFor(form.type);
  const stepId = steps[index];
  const verifyIndex = steps.indexOf('verify');
  const beforeVerify = index === verifyIndex - 1;
  const pro = isPro(form.type);
  const organisation = form.type === 'pharmacie' || form.type === 'fosa';
  const copy = copyFor(stepId, form.type);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const set = <K extends keyof RegisterData>(key: K, value: RegisterData[K]) => {
    setBanner(null);
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /** Changer de profil repart d'une base propre (on garde nom, téléphone, ville). */
  const chooseType = (type: AccountType) => {
    setErrors({});
    setForm((prev) => ({
      type,
      name: prev.name,
      phone: prev.phone,
      city: prev.city,
      acceptedTerms: prev.acceptedTerms,
    }));
  };

  async function requestCode() {
    setBusy(true);
    const res = await sendOtp(normalizePhone(form.phone)!, { ...form });
    setBusy(false);
    if (!res.ok) return setBanner(res.message);
    setCode('');
    setCodeError(null);
    setCooldown(RESEND_DELAY);
    setIndex(verifyIndex);
  }

  async function resend() {
    if (cooldown > 0 || busy) return;
    setBusy(true);
    const res = await sendOtp(normalizePhone(form.phone)!, { ...form });
    setBusy(false);
    if (!res.ok) return setBanner(res.message);
    setCode('');
    setCodeError(null);
    setCooldown(RESEND_DELAY);
  }

  async function submitCode() {
    if (code.length < 6) return setCodeError('Saisis les 6 chiffres du code.');
    setBusy(true);
    const phone = normalizePhone(form.phone)!;
    const res = await verifyOtp(phone, code);
    if (!res.ok) {
      setBusy(false);
      return setCodeError(res.message);
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
    setDone(true);
  }

  async function next() {
    setBanner(null);
    if (stepId === 'verify') return submitCode();

    const found = validateStep(stepId, form, beforeVerify);
    if (Object.keys(found).length > 0) return setErrors(found);
    setErrors({});

    if (beforeVerify) return requestCode();
    setIndex((i) => i + 1);
  }

  function back() {
    setBanner(null);
    setErrors({});
    setCodeError(null);
    setIndex((i) => Math.max(0, i - 1));
  }

  /* ---------- Écran final ---------- */
  if (done) {
    const firstName = form.name.trim().split(' ')[0];
    return (
      <View style={styles.success}>
        <View style={styles.successIcon}>
          <Ionicons name={pro ? 'time' : 'checkmark'} size={38} color="#FFFFFF" />
        </View>
        <AuthTitle>{pro ? 'Demande envoyée' : 'Compte créé'}</AuthTitle>
        <AuthSub>
          {pro
            ? 'Ton compte sera activé après vérification de tes informations par la DPS.'
            : `Bienvenue, ${firstName}. Tu peux dès maintenant faire ta première évaluation.`}
        </AuthSub>
        <Button label="Aller à l’accueil" onPress={() => router.replace('/')} />
      </View>
    );
  }

  const primaryLabel =
    stepId === 'verify' ? 'Créer mon compte' : beforeVerify ? 'Recevoir le code' : 'Continuer';

  return (
    <View>
      <Stepper
        steps={steps.map((id) => ({ id, label: stepLabel(id, form.type) }))}
        current={index}
      />

      <StepView stepKey={`${form.type}-${stepId}`}>
        <AuthTitle>{copy.title}</AuthTitle>
        <AuthSub>{copy.sub}</AuthSub>

        {/* ---------- Profil ---------- */}
        {stepId === 'type' ? (
          <View style={styles.grid}>
            {ACCOUNT_TYPES.map((option) => (
              <ChoiceCard
                key={option.value}
                icon={TYPE_ICON[option.value]}
                label={option.label}
                sub={option.sub}
                selected={form.type === option.value}
                onPress={() => chooseType(option.value)}
              />
            ))}
          </View>
        ) : null}

        {/* ---------- Identité ---------- */}
        {stepId === 'identity' ? (
          <View>
            <Field
              label={organisation ? 'Nom du responsable' : 'Nom complet'}
              icon="person-outline"
              value={form.name}
              onChangeText={(v) => set('name', v)}
              placeholder="Ex. Habib Samuel"
              autoCapitalize="words"
              error={errors.name}
            />
            <Field
              label="Téléphone"
              prefix="+237"
              value={form.phone}
              onChangeText={(v) => set('phone', v)}
              placeholder="6XX XX XX XX"
              keyboardType="phone-pad"
              error={errors.phone}
              hint="Tu recevras un code de vérification par SMS."
            />
            <Field
              label="Ville"
              icon="location-outline"
              value={form.city}
              onChangeText={(v) => set('city', v)}
              placeholder="Douala, Yaoundé…"
              autoCapitalize="words"
              error={errors.city}
            />
          </View>
        ) : null}

        {/* ---------- Exercice / Établissement ---------- */}
        {stepId === 'pro' ? (
          <View>
            {form.type === 'praticien' ? (
              <>
                <ChipGroup
                  label="Profession"
                  options={PROFESSIONS}
                  value={form.profession}
                  onChange={(v) => set('profession', v)}
                  error={errors.profession}
                />
                {form.profession === 'medecin' ? (
                  <Field
                    label="Spécialité"
                    icon="ribbon-outline"
                    optional
                    value={form.specialty ?? ''}
                    onChangeText={(v) => set('specialty', v)}
                    placeholder="Généraliste, pédiatre…"
                  />
                ) : null}
                <Field
                  label="Structure d’exercice"
                  icon="business-outline"
                  optional
                  value={form.structure ?? ''}
                  onChangeText={(v) => set('structure', v)}
                  placeholder="Hôpital, clinique, cabinet…"
                />
              </>
            ) : null}

            {organisation ? (
              <>
                <Field
                  label={form.type === 'pharmacie' ? 'Nom de la pharmacie' : 'Nom de l’établissement'}
                  icon="storefront-outline"
                  value={form.establishment ?? ''}
                  onChangeText={(v) => set('establishment', v)}
                  error={errors.establishment}
                />
                {form.type === 'fosa' ? (
                  <ChipGroup
                    label="Type de formation sanitaire"
                    options={FOSA_KINDS}
                    value={form.fosaKind}
                    onChange={(v) => set('fosaKind', v)}
                    error={errors.fosaKind}
                  />
                ) : null}
                <Field
                  label="Quartier / adresse"
                  icon="location-outline"
                  value={form.address ?? ''}
                  onChangeText={(v) => set('address', v)}
                  placeholder="Ex. Bastos, rue 1.234"
                  error={errors.address}
                />
              </>
            ) : null}

            <Field
              label={LICENSE_LABEL[form.type as Exclude<AccountType, 'patient'>]}
              icon="document-text-outline"
              value={form.licenseNumber ?? ''}
              onChangeText={(v) => set('licenseNumber', v)}
              autoCapitalize="characters"
              error={errors.licenseNumber}
            />
            <InfoNote>
              Ton compte sera visible par les patients après vérification de ces informations par la
              DPS.
            </InfoNote>
          </View>
        ) : null}

        {/* ---------- Conditions (étape juste avant le code) ---------- */}
        {beforeVerify ? (
          <Checkbox
            checked={form.acceptedTerms}
            onToggle={() => set('acceptedTerms', !form.acceptedTerms)}
            error={errors.acceptedTerms}
          >
            J’accepte le traitement de mes données de santé pour l’orientation et la
            téléconsultation.
          </Checkbox>
        ) : null}

        {/* ---------- Vérification ---------- */}
        {stepId === 'verify' ? (
          <View>
            <View style={styles.phoneBadge}>
              <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
              <Text style={styles.phoneText}>{formatPhone(normalizePhone(form.phone))}</Text>
            </View>

            <OtpInput
              value={code}
              onChange={(v) => {
                setCodeError(null);
                setCode(v);
              }}
              error={Boolean(codeError)}
            />
            {codeError ? (
              <View style={styles.centered}>
                <ErrorText>{codeError}</ErrorText>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={cooldown > 0 || busy}
              onPress={resend}
              style={styles.resend}
            >
              <Text style={[styles.resendText, cooldown > 0 && styles.resendOff]}>
                {cooldown > 0 ? `Renvoyer le code dans ${cooldown} s` : 'Renvoyer le code'}
              </Text>
            </Pressable>

            {!isBackendConfigured ? (
              <InfoNote icon="flask">{`Mode démo : le code est ${DEMO_CODE}.`}</InfoNote>
            ) : null}
          </View>
        ) : null}
      </StepView>

      {banner ? (
        <View style={styles.banner}>
          <ErrorText>{banner}</ErrorText>
        </View>
      ) : null}

      {/* ---------- Navigation ---------- */}
      <View style={styles.actions}>
        {index > 0 ? (
          <View style={styles.back}>
            <Button label="Retour" variant="ghost" onPress={back} />
          </View>
        ) : null}
        <View style={styles.next}>
          <Button
            label={primaryLabel}
            onPress={next}
            loading={busy}
            disabled={busy || (stepId === 'verify' && code.length < 6)}
          />
        </View>
      </View>

      {index === 0 ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/auth/login')}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>Déjà un compte ? Se connecter</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },

  phoneBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  phoneText: { ...font.small, fontWeight: '700', color: colors.primary },
  centered: { alignItems: 'center' },
  resend: { alignSelf: 'center', paddingVertical: space.md, marginTop: space.sm },
  resendText: { ...font.small, fontWeight: '700', color: colors.primary },
  resendOff: { color: colors.muted, fontWeight: '500' },

  banner: { marginTop: space.lg },

  actions: { flexDirection: 'row', gap: space.md, marginTop: space.xl },
  back: { flex: 1 },
  next: { flex: 2 },

  loginLink: { alignSelf: 'center', paddingVertical: space.lg, marginTop: space.sm },
  loginText: { ...font.small, fontWeight: '700', color: colors.primary },

  success: { alignItems: 'flex-start', paddingTop: space.lg },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
});