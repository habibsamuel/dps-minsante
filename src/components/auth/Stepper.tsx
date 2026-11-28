import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font } from '@/theme';

type Props = {
  steps: { id: string; label: string }[];
  current: number;
};

export function Stepper({ steps, current }: Props) {
  return (
    <View style={styles.row} accessibilityRole="progressbar">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;

        return (
          <View key={step.id} style={styles.item}>
            {last ? null : <View style={[styles.line, done && styles.lineDone]} />}
            <View style={[styles.dot, (done || active) && styles.dotOn, active && styles.dotActive]}>
              {done ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={[styles.dotText, active && styles.dotTextOn]}>{i + 1}</Text>
              )}
            </View>
            <Text style={[styles.label, (done || active) && styles.labelOn]} numberOfLines={1}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 28 },
  item: { flex: 1, alignItems: 'center' },
  line: {
    position: 'absolute',
    top: 15,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: colors.line,
  },
  lineDone: { backgroundColor: colors.primary },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotActive: { borderWidth: 4, borderColor: colors.primarySoft, backgroundColor: colors.primary },
  dotText: { ...font.small, fontWeight: '700', color: colors.muted },
  dotTextOn: { color: '#FFFFFF' },
  label: { ...font.small, fontSize: 11, color: colors.muted, marginTop: 8 },
  labelOn: { color: colors.ink, fontWeight: '700' },
});