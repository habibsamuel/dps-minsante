import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Master } from '@/components/layout';
import { Button, CheckCard, OptionCard, Progress } from '@/components/ui';
import type { IconName } from '@/lib/navigation';
import { evaluate, questions, type Answers, type Question } from '@/lib/triage';
import { useTriage } from '@/store';
import { colors, font, space } from '@/theme';

/* ------------------------------------------------------------------ */
/*  Catégories                                                         */
/* ------------------------------------------------------------------ */

const CATEGORIES: Record<string, { label: string; icon: IconName }> = {
  pour_qui: { label: 'Pour qui', icon: 'people-outline' },
  age: { label: 'Âge', icon: 'calendar-outline' },
  sexe: { label: 'Sexe', icon: 'person-outline' },
  symptome: { label: 'Symptôme', icon: 'pulse' },
  duree: { label: 'Durée', icon: 'time-outline' },
  intensite: { label: 'Intensité', icon: 'speedometer-outline' },
  fievre: { label: 'Fièvre', icon: 'thermometer-outline' },
  alertes: { label: "Signes d'alerte", icon: 'warning-outline' },
  antecedents: { label: 'Antécédents', icon: 'medical-outline' },
};

const FALLBACK: { label: string; icon: IconName } = {
  label: 'Question',
  icon: 'help-circle-outline',
};

function getCategory(q: Question) {
  return CATEGORIES[q.id] ?? FALLBACK;
}

/* ------------------------------------------------------------------ */
/*  Écran                                                              */
/* ------------------------------------------------------------------ */

export default function TriageScreen() {
  const router = useRouter();
  const { answers, setAnswer, setResult } = useTriage();
  const [index, setIndex] = useState(0);
  const lock = useRef(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const currentValue = question ? answers[question.id] : undefined;
  const multiValue = Array.isArray(currentValue) ? currentValue : [];

  function finish(finalAnswers: Answers) {
    if (lock.current) return;
    lock.current = true;
    setResult(evaluate(finalAnswers));
    router.replace('/resultat');
  }

  function goNext(value: string | string[] | undefined) {
    if (!question) return;
    const merged: Answers = { ...answers, [question.id]: value };
    setAnswer(question.id, value ?? '');
    if (isLast) {
      finish(merged);
    } else {
      setIndex((prev) => prev + 1);
      setTimeout(() => {
        lock.current = false;
      }, 60);
    }
  }

  function selectSingle(value: string) {
    if (lock.current || !question) return;
    lock.current = true;
    const merged: Answers = { ...answers, [question.id]: value };
    setAnswer(question.id, value);
    setTimeout(() => {
      if (isLast) {
        finish(merged);
      } else {
        setIndex((prev) => prev + 1);
        lock.current = false;
      }
    }, 140);
  }

  function toggleMulti(value: string) {
    if (!question) return;
    const exclusive = question.id === 'antecedents' ? 'aucun' : null;
    let next: string[];
    if (multiValue.includes(value)) {
      next = multiValue.filter((v) => v !== value);
    } else if (exclusive && value === exclusive) {
      next = [exclusive];
    } else if (exclusive) {
      next = [...multiValue.filter((v) => v !== exclusive), value];
    } else {
      next = [...multiValue, value];
    }
    setAnswer(question.id, next);
  }

  function back() {
    if (index === 0) {
      router.back();
    } else {
      setIndex((prev) => prev - 1);
    }
  }

  if (!question) return null;

  const category = getCategory(question);
  const progress = (index + 1) / questions.length;

  return (
    <Master
      title="Évaluation"
      footer={
        <View style={styles.footerRow}>
          <View style={styles.footerBack}>
            <Button label="Retour" variant="ghost" onPress={back} />
          </View>
          {question.type === 'multi' ? (
            <View style={styles.footerNext}>
              <Button
                label={isLast ? 'Voir le résultat' : 'Continuer'}
                onPress={() => goNext(multiValue)}
              />
            </View>
          ) : null}
        </View>
      }
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Étape {index + 1} / {questions.length}
            </Text>
          </View>
          {question.optional ? (
            <View style={styles.optionalPill}>
              <Text style={styles.optionalPillText}>Facultatif</Text>
            </View>
          ) : null}
        </View>

        <Progress value={progress} />

        <View style={styles.category}>
          <Ionicons name={category.icon} size={13} color={colors.primary} />
          <Text style={styles.categoryText}>{category.label}</Text>
        </View>

        <Text style={styles.question}>{question.title}</Text>
        {question.hint ? <Text style={styles.hint}>{question.hint}</Text> : null}

        <View style={styles.options}>
          {question.options.map((option) => {
            if (question.type === 'multi') {
              return (
                <CheckCard
                  key={option.value}
                  label={option.label}
                  selected={multiValue.includes(option.value)}
                  onPress={() => toggleMulti(option.value)}
                />
              );
            }
            return (
              <OptionCard
                key={option.value}
                label={option.label}
                sub={option.sub}
                selected={currentValue === option.value}
                onPress={() => selectSingle(option.value)}
              />
            );
          })}
        </View>

        {question.optional ? (
          <Text style={styles.skipHint}>
            Tu peux continuer sans rien sélectionner.
          </Text>
        ) : null}

        {question.type === 'multi' && multiValue.length > 0 ? (
          <Text style={styles.selectedHint}>
            {multiValue.length} sélectionné{multiValue.length > 1 ? 's' : ''}
          </Text>
        ) : null}
      </View>
    </Master>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  stepPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  stepPillText: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.3,
  },
  optionalPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.sandDeep,
  },
  optionalPillText: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 11,
    color: colors.inkSoft,
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: space.xl,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  categoryText: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  question: {
    ...font.h2,
    color: colors.ink,
    marginTop: space.md,
  },
  hint: {
    ...font.small,
    color: colors.inkSoft,
    marginTop: space.sm,
    lineHeight: 20,
  },
  options: {
    marginTop: space.xl,
    gap: space.sm,
  },
  skipHint: {
    ...font.small,
    color: colors.muted,
    marginTop: space.md,
    textAlign: 'center',
  },
  selectedHint: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    marginTop: space.md,
  },
  footerRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  footerBack: { flex: 1 },
  footerNext: { flex: 2 },
});