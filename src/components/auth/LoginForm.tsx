import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { AuthSub, AuthTitle } from '@/components/layout/AuthShell';
import {
  DEMO_CODE,
  normalizePhone,
  sendOtp,
  verifyOtp,
  type AccountType,
  type RegisterData,
} from '@/lib/auth';
import { formatPhone } from '@/lib/format';
import { ROUTES } from '@/lib/navigation';
import { loadJSON, STORAGE_KEYS } from '@/lib/storage';
import { isBackendConfigured } from '@/lib/supabase';
import { useTriage, type Role } from '@/store';
import { colors, font, space } from '@/theme';

import { ErrorText, Field, InfoNote, OtpInput } from './fields';

const RESEND_DELAY = 30;

// À étendre dans le store : type Role = 'patient' | 'medecin' | 'pharmacie' | 'fosa'
const ROLE_BY_TYPE: Record<AccountType, Role> = {
  patient: 'patient',
  praticien: 'medecin',
  pharmacie: 'pharmacie' as Role,
  fosa: 'fosa' as Role,
};

type SavedRegistration = RegisterData & { status?: 'actif' | 'en_attente' };

export function LoginForm() {
  const router = useRouter();
  const { saveProfile } = useTriage();

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [codeError, setCodeError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const normalized = normalizePhone(phone);

  /* ---------- Étape 1 : envoyer le code ---------- */
  async function requestCode() {
    setBanner(null);
    if (!normalized) return setPhoneError('Numéro invalide. Exemple : 6XX XX XX XX');

    setBusy(true);

    // Mode démo : on ne peut se connecter qu'avec un compte créé sur cet appareil.
    if (!isBackendConfigured) {
      const saved = await loadJSON<SavedRegistration | null>(STORAGE_KEYS.registration, null);
      if (!saved || saved.phone !== normalized) {
        setBusy(false);
        return setPhoneError('Aucun compte trouvé avec ce numéro.');
      }
    }

    const res = await sendOtp(normalized, { purpose: 'login' });
    setBusy(false);
    if (!res.ok) return setBanner(res.message);

    setCode('');
    setCodeError(null);
    setCooldown(RESEND_DELAY);
    setStep('code');
  }

  async function resend() {
    if (cooldown > 0 || busy || !normalized) return;
    setBusy(true);
    const res = await sendOtp(normalized, { purpose: 'login' });
    setBusy(false);
    if (!res.ok) return setBanner(res.message);
    setCode('');
    setCodeError(null);
    setCooldown(RESEND_DELAY);
  }

  /* ---------- Étape 2 : vérifier le code ---------- */
  async function submitCode() {
    if (!normalized) return;
    if (code.length < 6) return setCodeError('Saisis les 6 chiffres du code.');

    setBusy(true);
    const res = await verifyOtp(normalized, code);
    if (!res.ok) {
      setBusy(false);
      return setCodeError(res.message);
    }

    const saved = await loadJSON<SavedRegistration | null>(STORAGE_KEYS.registration, null);
    if (saved && saved.phone === normalized) {
      saveProfile({
        name: saved.name.trim(),
        phone: normalized,
        city: saved.city.trim(),
        role: ROLE_BY_TYPE[saved.type],
      });
    } else {
      // TODO FastAPI : récupérer le vrai profil avec GET /me après la vérification.
      saveProfile({ name: 'Mon compte', phone: normalized, city: '', role: 'patient' });
    }

    setBusy(false);
    router.replace('/');
  }

  function next() {
    if (busy) return;
    if (step === 'phone') requestCode();
    else submitCode();
  }

  function changeNumber() {
    setStep('phone');
    setCode('');
    setCodeError(null);
    setBanner(null);
  }

  return (
    <View>
      {step === 'phone' ? (
        <>
          <AuthTitle>Content de te revoir</AuthTitle>
          <AuthSub>Entre ton numéro de téléphone. Tu recevras un code de connexion par SMS.</AuthSub>

          <Field
            label="Téléphone"
            prefix="+237"
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              setPhoneError(undefined);
              setBanner(null);
            }}
            placeholder="6XX XX XX XX"
            keyboardType="phone-pad"
            returnKeyType="go"
            onSubmitEditing={next}
            error={phoneError}
          />

          {phoneError?.startsWith('Aucun compte') ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push(ROUTES.register)}
              style={styles.inlineLink}
            >
              <Text style={styles.linkText}>Créer un compte avec ce numéro</Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <>
          <AuthTitle>Saisis le code</AuthTitle>
          <AuthSub>Un code à 6 chiffres a été envoyé par SMS.</AuthSub>

          <View style={styles.phoneBadge}>
            <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
            <Text style={styles.phoneText}>{formatPhone(normalized)}</Text>
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

          <View style={styles.codeLinks}>
            <Pressable accessibilityRole="button" disabled={cooldown > 0 || busy} onPress={resend}>
              <Text style={[styles.linkText, cooldown > 0 && styles.linkOff]}>
                {cooldown > 0 ? `Renvoyer le code dans ${cooldown} s` : 'Renvoyer le code'}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={changeNumber}>
              <Text style={styles.linkText}>Changer de numéro</Text>
            </Pressable>
          </View>

          {!isBackendConfigured ? (
            <InfoNote icon="flask">{`Mode démo : le code est ${DEMO_CODE}.`}</InfoNote>
          ) : null}
        </>
      )}

      {banner ? (
        <View style={styles.banner}>
          <ErrorText>{banner}</ErrorText>
        </View>
      ) : null}

      <View style={styles.action}>
        <Button
          label={step === 'phone' ? 'Recevoir le code' : 'Se connecter'}
          onPress={next}
          loading={busy}
          disabled={busy || (step === 'code' && code.length < 6)}
        />
      </View>

      <Pressable
        accessibilityRole="link"
        onPress={() => router.push(ROUTES.register)}
        style={styles.registerLink}
      >
        <Text style={styles.registerText}>Pas encore de compte ? Créer un compte</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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

  codeLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space.md,
    marginTop: space.lg,
  },
  inlineLink: { alignSelf: 'flex-start', paddingVertical: space.sm },
  linkText: { ...font.small, fontWeight: '700', color: colors.primary },
  linkOff: { color: colors.muted, fontWeight: '500' },

  banner: { marginTop: space.lg },
  action: { marginTop: space.xl },

  registerLink: { alignSelf: 'center', paddingVertical: space.lg, marginTop: space.sm },
  registerText: { ...font.small, fontWeight: '700', color: colors.primary },
});