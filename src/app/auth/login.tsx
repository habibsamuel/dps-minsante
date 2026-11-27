import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Master } from '@/components/layout';
import { Button } from '@/components/ui';
import { colors, font, radius, space } from '@/theme';

function isValidPhone(input: string): boolean {
  const digits = input.replace(/\D/g, '').replace(/^237/, '');
  return /^[62]\d{8}$/.test(digits);
}

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function sendCode() {
    if (!isValidPhone(phone)) {
      setError('Numéro invalide. Exemple : 6XX XX XX XX');
      return;
    }
    setError(null);
    // TODO : brancher le backend ici (envoi du code SMS).
    setCodeSent(true);
  }

  function submit() {
    if (code.length < 6) {
      setError('Saisis le code à 6 chiffres.');
      return;
    }
    setError(null);
    // TODO : brancher le backend ici (vérification du code et connexion).
    console.log('Connexion', phone);
    router.replace('/');
  }

  return (
    <Master
      title="Connexion"
      footer={
        <Button
          label={codeSent ? 'Se connecter' : 'Recevoir le code'}
          onPress={codeSent ? submit : sendCode}
        />
      }
    >
      <View style={styles.container}>
        <Text style={styles.title}>Se connecter</Text>
        <Text style={styles.lede}>
          Entre ton numéro de téléphone. Tu recevras un code par SMS pour te connecter.
        </Text>

        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          value={phone}
          onChangeText={(v) => {
            setPhone(v);
            setError(null);
          }}
          placeholder="6XX XX XX XX"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          editable={!codeSent}
          style={[styles.input, codeSent && styles.inputLocked]}
        />

        {codeSent ? (
          <>
            <Text style={styles.label}>Code reçu par SMS</Text>
            <TextInput
              value={code}
              onChangeText={(v) => {
                setCode(v.replace(/\D/g, ''));
                setError(null);
              }}
              placeholder="······"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.input, styles.codeInput]}
            />
            <Pressable
              onPress={() => {
                setCodeSent(false);
                setCode('');
              }}
              style={styles.changeLink}
            >
              <Text style={styles.linkText}>Changer de numéro</Text>
            </Pressable>
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={() => router.push('/auth/register')} style={styles.registerLink}>
          <Text style={styles.linkText}>Pas encore de compte ? S’inscrire</Text>
        </Pressable>
      </View>
    </Master>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { ...font.h1, color: colors.ink, marginTop: space.md },
  lede: { ...font.body, color: colors.inkSoft, marginTop: space.sm },
  label: { ...font.small, color: colors.inkSoft, marginTop: space.xl, marginBottom: 6 },
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
  inputLocked: { opacity: 0.6 },
  codeInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
  error: { ...font.small, fontSize: 12, color: colors.danger, marginTop: space.md },
  changeLink: { alignSelf: 'flex-start', paddingVertical: space.sm },
  registerLink: { alignSelf: 'center', paddingVertical: space.lg, marginTop: space.lg },
  linkText: { ...font.small, color: colors.primary, fontWeight: '700' },
});