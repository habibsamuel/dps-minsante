import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  Button,
  CheckCard,
  OptionCard,
  Progress,
  Screen,
} from '@/components/ui';
import { evaluate, questions, type Answers } from '@/lib/triage';
import { useTriage } from '@/store';
import { colors, font, space } from '@/theme';

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
    if (lock.current) return;
    lock.current = true;
    const merged: Answers = { ...answers, [question!.id]: value };
    setAnswer(question!.id, value);
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

  return (
    <Screen
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
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>
          Question {index + 1} sur {questions.length}
        </Text>
        <Text style={styles.progressHint}>
          {question.optional ? 'Facultatif' : 'Obligatoire'}
        </Text>
      </View>
      <Progress value={(index + 1) / questions.length} />

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: space.sm,
  },
  progressLabel: { ...font.label, color: colors.muted },
  progressHint: { ...font.small, color: colors.muted, fontSize: 12 },
  question: { ...font.h2, color: colors.ink, marginTop: space.xl },
  hint: { ...font.small, color: colors.inkSoft, marginTop: space.sm },
  options: { marginTop: space.xl },
  skipHint: { ...font.small, color: colors.muted, marginTop: space.sm, textAlign: 'center' },
  footerRow: { flexDirection: 'row', gap: space.md },
  footerBack: { flex: 1 },
  footerNext: { flex: 2 },
});
