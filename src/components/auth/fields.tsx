import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import type { IconName } from '@/lib/navigation';
import { colors, font, radius, space } from '@/theme';

// Supprime le contour du navigateur : la bordure verte fait déjà office de focus.
const NO_OUTLINE = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

/* ------------------------------------------------------------------ */
/*  Champ de saisie                                                    */
/* ------------------------------------------------------------------ */

type FieldProps = TextInputProps & {
  label: string;
  icon?: IconName;
  prefix?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

export function Field({ label, icon, prefix, error, hint, optional, style, ...input }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional ? <Text style={styles.optional}>Facultatif</Text> : null}
      </View>

      <View style={[styles.inputWrap, focused && styles.inputFocus, error ? styles.inputError : null]}>
        {icon ? (
          <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.muted} />
        ) : null}
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          placeholderTextColor={colors.muted}
          {...input}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={[styles.input, NO_OUTLINE, style]}
        />
      </View>

      {error ? <ErrorText>{error}</ErrorText> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function ErrorText({ children }: { children: string }) {
  return (
    <View style={styles.errorRow}>
      <Ionicons name="alert-circle" size={14} color={colors.danger} />
      <Text style={styles.error}>{children}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Carte de choix (profil)                                            */
/* ------------------------------------------------------------------ */

export function ChoiceCard({
  icon,
  label,
  sub,
  selected,
  onPress,
}: {
  icon: IconName;
  label: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.cardOn, pressed && styles.pressed]}
    >
      <View style={[styles.cardIcon, selected && styles.cardIconOn]}>
        <Ionicons name={icon} size={22} color={selected ? '#FFFFFF' : colors.primary} />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardLabel}>{label}</Text>
        {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <Ionicons name="checkmark" size={13} color="#FFFFFF" /> : null}
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Pastilles de choix                                                 */
/* ------------------------------------------------------------------ */

export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: { value: T; label: string }[];
  value?: T;
  onChange: (value: T) => void;
  error?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, styles.chipLabel]}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[styles.chip, selected && styles.chipOn]}
            >
              {selected ? <Ionicons name="checkmark" size={14} color={colors.primary} /> : null}
              <Text style={[styles.chipText, selected && styles.chipTextOn]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Case à cocher                                                      */
/* ------------------------------------------------------------------ */

export function Checkbox({
  checked,
  onToggle,
  children,
  error,
}: {
  checked: boolean;
  onToggle: () => void;
  children: string;
  error?: string;
}) {
  return (
    <View style={styles.field}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onToggle}
        style={[styles.terms, error ? styles.termsError : null]}
      >
        <View style={[styles.box, checked && styles.boxOn]}>
          {checked ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
        </View>
        <Text style={styles.termsText}>{children}</Text>
      </Pressable>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Encadré d'information                                              */
/* ------------------------------------------------------------------ */

export function InfoNote({ icon = 'shield-checkmark', children }: { icon?: IconName; children: string }) {
  return (
    <View style={styles.note}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.noteText}>{children}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Code SMS en 6 cases                                                */
/* ------------------------------------------------------------------ */

export function OtpInput({
  value,
  onChange,
  error,
  length = 6,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  length?: number;
}) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable onPress={() => ref.current?.focus()} style={styles.otpRow}>
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.otpBox,
            focused && i === activeIndex && styles.otpBoxActive,
            error && styles.otpBoxError,
          ]}
        >
          <Text style={styles.otpChar}>{value[i] ?? ''}</Text>
        </View>
      ))}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
        caretHidden
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.otpHidden, NO_OUTLINE]}
      />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },

  // Champ
  field: { marginTop: space.lg },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  label: { ...font.small, fontWeight: '700', color: colors.ink },
  optional: { ...font.small, fontSize: 11, color: colors.muted },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  inputFocus: { borderColor: colors.primary, backgroundColor: '#FFFFFF' },
  inputError: { borderColor: colors.danger },
  prefix: { ...font.body, fontWeight: '700', color: colors.inkSoft },
  input: { flex: 1, fontSize: 16, color: colors.ink, paddingVertical: 12 },
  hint: { ...font.small, fontSize: 12, color: colors.muted, marginTop: 6 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  error: { ...font.small, fontSize: 12, color: colors.danger, flex: 1 },

  // Carte de choix
  card: {
    flexGrow: 1,
    flexBasis: 240,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  cardOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  cardIconOn: { backgroundColor: colors.primary },
  cardText: { flex: 1 },
  cardLabel: { ...font.body, fontWeight: '700', color: colors.ink },
  cardSub: { ...font.small, fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },

  // Pastilles
  chipLabel: { marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { ...font.small, color: colors.inkSoft },
  chipTextOn: { color: colors.primary, fontWeight: '700' },

  // Case à cocher
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  termsError: { borderColor: colors.danger },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: { ...font.small, color: colors.inkSoft, flex: 1, lineHeight: 19 },

  // Encadré
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: space.lg,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  noteText: { ...font.small, fontSize: 13, color: colors.primary, flex: 1, lineHeight: 19 },

  // Code SMS
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: space.lg },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: { borderColor: colors.primary, backgroundColor: '#FFFFFF' },
  otpBoxError: { borderColor: colors.danger },
  otpChar: { fontSize: 24, fontWeight: '700', color: colors.ink },
  otpHidden: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0 },
});