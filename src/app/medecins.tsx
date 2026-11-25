import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, Screen } from '@/components/ui';
import { doctors, initials, specialties, type SpecialtyFilter } from '@/lib/doctors';
import { useTriage } from '@/store';
import { colors, font, radius, shadow, space } from '@/theme';

export default function DoctorsScreen() {
  const router = useRouter();
  const { selectDoctor, result } = useTriage();
  const [filter, setFilter] = useState<SpecialtyFilter>('Tous');

  const list = useMemo(() => {
    const filtered = doctors.filter((d) => filter === 'Tous' || d.specialty === filter);
    return [...filtered].sort((a, b) => Number(b.availableNow) - Number(a.availableNow));
  }, [filter]);

  return (
    <Screen>
      <Text style={styles.lede}>
        {result?.level === 'consultation'
          ? 'Ton évaluation suggère un avis médical. Choisis un médecin : il recevra le résumé de tes réponses.'
          : 'Choisis un médecin et envoie-lui le résumé de ton évaluation.'}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {specialties.map((item) => {
          const active = filter === item;
          return (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {list.map((doctor) => (
          <Pressable
            key={doctor.id}
            onPress={() => {
              selectDoctor(doctor.id);
              router.push({ pathname: '/consultation/[id]', params: { id: doctor.id } });
            }}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(doctor.name)}</Text>
              </View>
              <View style={styles.identity}>
                <Text style={styles.name}>{doctor.name}</Text>
                <Text style={styles.meta}>
                  {doctor.specialty} · {doctor.city}
                </Text>
                <Text style={styles.facility}>{doctor.facility}</Text>
              </View>
              <View style={styles.rating}>
                <Text style={styles.ratingValue}>★ {doctor.rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>{doctor.reviews}</Text>
              </View>
            </View>

            <Text style={styles.bio}>{doctor.bio}</Text>

            <View style={styles.cardFooter}>
              <Badge
                label={doctor.availability}
                tone={doctor.availableNow ? 'calm' : 'neutral'}
              />
              <Text style={styles.languages}>{doctor.languages.join(' · ')}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={styles.note}>
        Médecins de démonstration pour cette version. Les profils réels seront vérifiés (ordre des
        médecins, diplôme) avant publication.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lede: { ...font.body, color: colors.inkSoft, marginBottom: space.lg },
  filters: { gap: space.sm, paddingBottom: space.lg },
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...font.small, fontWeight: '600', color: colors.inkSoft },
  chipTextActive: { color: '#FFFFFF' },
  list: { gap: space.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadow.soft,
  },
  cardPressed: { opacity: 0.92 },
  cardTop: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...font.h3, color: colors.primary },
  identity: { flex: 1 },
  name: { ...font.h3, color: colors.ink },
  meta: { ...font.small, color: colors.inkSoft, marginTop: 2 },
  facility: { ...font.small, color: colors.muted, fontSize: 12 },
  rating: { alignItems: 'flex-end' },
  ratingValue: { ...font.small, fontWeight: '700', color: colors.accent },
  ratingCount: { ...font.small, fontSize: 11, color: colors.muted },
  bio: { ...font.small, color: colors.inkSoft, marginTop: space.md },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.md,
    gap: space.sm,
  },
  languages: { ...font.small, fontSize: 11, color: colors.muted },
  note: { ...font.small, fontSize: 11, color: colors.muted, marginTop: space.xl, lineHeight: 17 },
});
