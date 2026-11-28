import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Badge, Button } from '@/components/ui';
import {
  doctors,
  initials,
  specialties,
  type Doctor,
  type SpecialtyFilter,
} from '@/lib/doctors';
import { useTriage } from '@/store';
import { colors, radius, shadow } from '@/theme';

export default function ContactDoctor() {
  const router = useRouter();
  const { selectDoctor, result } = useTriage();
  const [filter, setFilter] = useState<SpecialtyFilter>('Tous');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors
      .filter((doctor) => filter === 'Tous' || doctor.specialty === filter)
      .filter(
        (doctor) =>
          q.length === 0 ||
          doctor.name.toLowerCase().includes(q) ||
          doctor.city.toLowerCase().includes(q) ||
          doctor.facility.toLowerCase().includes(q),
      )
      .sort((a, b) => Number(b.availableNow) - Number(a.availableNow));
  }, [filter, query]);

  function contact(doctor: Doctor) {
    selectDoctor(doctor.id);
    router.push({ pathname: '/consultation/[id]', params: { id: doctor.id } });
  }

  return (
    <View>
      <Text style={styles.title}>Contacter un médecin</Text>
      <Text style={styles.lede}>
        {result?.level === 'consultation'
          ? 'Ton évaluation suggère un avis médical. Choisis un médecin : il recevra le résumé de tes réponses.'
          : 'Choisis un médecin et envoie-lui le résumé de ton évaluation.'}
      </Text>

      <View style={styles.alert}>
        <Ionicons name="alert-circle" size={18} color={colors.danger} />
        <Text style={styles.alertText}>
          Urgence vitale : ne passe pas par l’application, fais-toi accompagner aux urgences.
        </Text>
      </View>

      {/* ---------- Recherche + filtres ---------- */}
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un médecin, une ville, un hôpital…"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
        {query.length > 0 ? (
          <Pressable accessibilityLabel="Effacer" onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

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
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(item)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ---------- Médecins ---------- */}
      {list.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={30} color={colors.muted} />
          <Text style={styles.emptyText}>Aucun médecin ne correspond à ta recherche.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {list.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} onContact={() => contact(doctor)} />
          ))}
        </View>
      )}

      <Text style={styles.note}>
        Médecins de démonstration pour cette version. Les profils réels seront vérifiés (ordre des
        médecins, diplôme) avant publication.
      </Text>
    </View>
  );
}

function DoctorCard({ doctor, onContact }: { doctor: Doctor; onContact: () => void }) {
  const [failed, setFailed] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.avatar}>
          {failed || !doctor.avatar ? (
            <Text style={styles.avatarText}>{initials(doctor.name)}</Text>
          ) : (
            <Image
              source={{ uri: doctor.avatar }}
              style={styles.avatarImg}
              onError={() => setFailed(true)}
              accessibilityIgnoresInvertColors
            />
          )}
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

      <View style={styles.footer}>
        <Badge label={doctor.availability} tone={doctor.availableNow ? 'calm' : 'neutral'} />
        <Text style={styles.languages}>{doctor.languages.join(' · ')}</Text>
      </View>

      <View style={styles.action}>
        <Button label="Contacter" onPress={onContact} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: 'Comfortaa_700Bold', fontSize: 28, color: colors.ink },
  lede: { fontFamily: 'Comfortaa_500Medium', fontSize: 14, lineHeight: 22, color: colors.inkSoft, marginTop: 8, maxWidth: 640 },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  alertText: { flex: 1, fontFamily: 'Comfortaa_600SemiBold', fontSize: 12, lineHeight: 18, color: colors.danger },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 16,
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, fontFamily: 'Comfortaa_500Medium', fontSize: 15, color: colors.ink, paddingVertical: 12 },

  filters: { gap: 8, paddingVertical: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 13, color: colors.inkSoft },
  chipTextActive: { color: '#FFFFFF' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: {
    flexGrow: 1,
    flexBasis: 340,
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadow.soft,
  },
  top: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: 56, height: 56 },
  avatarText: { fontFamily: 'Comfortaa_700Bold', fontSize: 18, color: colors.primary },
  identity: { flex: 1 },
  name: { fontFamily: 'Comfortaa_700Bold', fontSize: 16, color: colors.ink },
  meta: { fontFamily: 'Comfortaa_500Medium', fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  facility: { fontFamily: 'Comfortaa_500Medium', fontSize: 12, color: colors.muted, marginTop: 1 },
  rating: { alignItems: 'flex-end' },
  ratingValue: { fontFamily: 'Comfortaa_700Bold', fontSize: 13, color: colors.accent },
  ratingCount: { fontFamily: 'Comfortaa_500Medium', fontSize: 11, color: colors.muted },
  bio: { fontFamily: 'Comfortaa_500Medium', fontSize: 13, lineHeight: 20, color: colors.inkSoft, marginTop: 14 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14 },
  languages: { fontFamily: 'Comfortaa_500Medium', fontSize: 11, color: colors.muted, flexShrink: 1 },
  action: { marginTop: 16 },

  empty: { alignItems: 'center', gap: 10, paddingVertical: 48 },
  emptyText: { fontFamily: 'Comfortaa_500Medium', fontSize: 14, color: colors.muted },
  note: { fontFamily: 'Comfortaa_500Medium', fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 28 },
});