import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Master } from '@/components/layout';
import { doctors, specialties, type Doctor, type SpecialtyFilter } from '@/lib/doctors';
import type { IconName } from '@/lib/navigation';
import { useTriage } from '@/store';
import { colors, font, radius, shadow, space } from '@/theme';

export default function DoctorsScreen() {
  const router = useRouter();
  const { selectDoctor, result } = useTriage();
  const [filter, setFilter] = useState<SpecialtyFilter>('Tous');
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const counts = useMemo(() => {
    const map: Record<string, number> = { Tous: doctors.length };
    for (const d of doctors) map[d.specialty] = (map[d.specialty] ?? 0) + 1;
    return map;
  }, []);

  const list = useMemo(() => {
    const filtered = doctors.filter((d) => filter === 'Tous' || d.specialty === filter);
    return [...filtered].sort((a, b) => Number(b.availableNow) - Number(a.availableNow));
  }, [filter]);

  const availableNow = list.filter((d) => d.availableNow).length;
  const featured = useMemo(() => list.find((d) => d.availableNow), [list]);
  const rest = useMemo(() => list.filter((d) => d.id !== featured?.id), [list, featured]);

  const openDoctor = (doctor: Doctor) => {
    selectDoctor(doctor.id);
    router.push({ pathname: '/consultation/[id]', params: { id: doctor.id } });
  };

  return (
    <Master title="Médecins">
      <View style={styles.container}>
        {/* ───── Hero ───── */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Trouver un médecin</Text>
          <Text style={styles.heroLede}>
            {result?.level === 'consultation'
              ? 'Ton évaluation suggère un avis médical. Choisis un praticien, il recevra le résumé de tes réponses.'
              : 'Choisis un praticien et envoie-lui le résumé de ton évaluation.'}
          </Text>
          <View style={styles.statsRow}>
            <StatChip icon="people-outline" label={`${doctors.length} praticiens`} />
            <StatChip
              icon="ellipse"
              label={`${availableNow} disponible${availableNow > 1 ? 's' : ''}`}
              highlight
            />
            <StatChip
              icon="medical-outline"
              label={`${specialties.length - 1} spécialités`}
            />
          </View>
        </View>

        {/* ───── Filtres ───── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {specialties.map((item) => {
            const active = filter === item;
            const count = counts[item] ?? 0;
            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                <View style={[styles.chipCount, active && styles.chipCountActive]}>
                  <Text
                    style={[styles.chipCountText, active && styles.chipCountTextActive]}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ───── Carte « recommandé » ───── */}
        {featured ? (
          <Pressable
            onPress={() => openDoctor(featured)}
            style={({ pressed }) => [styles.featured, pressed && styles.pressed]}
          >
            <View style={styles.featuredBadge}>
              <Ionicons name="sparkles" size={11} color="#FFFFFF" />
              <Text style={styles.featuredBadgeText}>Recommandé</Text>
            </View>

            <View style={styles.featuredBody}>
              <View style={styles.featuredAvatarWrap}>
                <Image source={{ uri: featured.avatar }} style={styles.featuredAvatar} />
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.featuredInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.featuredName} numberOfLines={1}>
                    {featured.name}
                  </Text>
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                </View>
                <Text style={styles.meta}>
                  {featured.specialty} · {featured.city}
                </Text>
                <View style={styles.featuredRating}>
                  <Ionicons name="star" size={11} color={colors.accent} />
                  <Text style={styles.ratingValue}>{featured.rating.toFixed(1)}</Text>
                  <Text style={styles.ratingCount}>({featured.reviews} avis)</Text>
                </View>
              </View>
            </View>

            <Text style={styles.featuredBio} numberOfLines={2}>
              {featured.bio}
            </Text>

            <View style={styles.featuredFooter}>
              <View style={styles.facilityRow}>
                <Ionicons name="business-outline" size={12} color={colors.muted} />
                <Text style={styles.facility} numberOfLines={1}>
                  {featured.facility}
                </Text>
              </View>
              <View style={styles.ctaRow}>
                <Text style={styles.ctaText}>Prendre rendez-vous</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.primary} />
              </View>
            </View>
          </Pressable>
        ) : null}

        {/* ───── Liste ───── */}
        <View style={[styles.list, isWide && styles.listWide]}>
          {rest.map((doctor) => (
            <Pressable
              key={doctor.id}
              onPress={() => openDoctor(doctor)}
              style={({ pressed }) => [
                styles.card,
                isWide && styles.cardWide,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.avatarWrap}>
                  <Image source={{ uri: doctor.avatar }} style={styles.avatar} />
                  {doctor.availableNow ? <View style={styles.onlineDot} /> : null}
                </View>
                <View style={styles.identity}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {doctor.name}
                    </Text>
                    <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                  </View>
                  <Text style={styles.meta}>
                    {doctor.specialty} · {doctor.city}
                  </Text>
                </View>
                <View style={styles.ratingBox}>
                  <Ionicons name="star" size={11} color={colors.accent} />
                  <Text style={styles.ratingValue}>{doctor.rating.toFixed(1)}</Text>
                </View>
              </View>

              <View style={styles.facilityRow}>
                <Ionicons name="business-outline" size={11} color={colors.muted} />
                <Text style={styles.facility} numberOfLines={1}>
                  {doctor.facility}
                </Text>
              </View>

              <Text style={styles.bio} numberOfLines={2}>
                {doctor.bio}
              </Text>

              <View style={styles.langRow}>
                {doctor.languages.map((lang) => (
                  <View key={lang} style={styles.langPill}>
                    <Text style={styles.langPillText}>{lang}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <View
                  style={[styles.availability, doctor.availableNow && styles.availabilityOn]}
                >
                  <View
                    style={[
                      styles.availabilityDot,
                      doctor.availableNow && styles.availabilityDotOn,
                    ]}
                  />
                  <Text
                    style={[
                      styles.availabilityText,
                      doctor.availableNow && styles.availabilityTextOn,
                    ]}
                    numberOfLines={1}
                  >
                    {doctor.availability}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* ───── État vide ───── */}
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={32} color={colors.muted} />
            <Text style={styles.emptyTitle}>Aucun médecin trouvé</Text>
            <Text style={styles.emptyText}>
              Essaie une autre spécialité ou change les filtres.
            </Text>
          </View>
        ) : null}

        <Text style={styles.note}>
          Médecins de démonstration. Les profils réels seront vérifiés (ordre des médecins,
          diplôme) avant publication.
        </Text>
      </View>
    </Master>
  );
}

/* ───── Sous-composants ───── */

function StatChip({
  icon,
  label,
  highlight,
}: {
  icon: IconName;
  label: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.statChip, highlight && styles.statChipHighlight]}>
      <Ionicons
        name={icon}
        size={12}
        color={highlight ? colors.calm : colors.inkSoft}
      />
      <Text style={[styles.statChipText, highlight && styles.statChipTextHighlight]}>
        {label}
      </Text>
    </View>
  );
}

/* ───── Styles ───── */

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    paddingTop: space.sm,
  },

  /* Hero */
  hero: { gap: space.sm },
  heroTitle: { ...font.h1, color: colors.ink },
  heroLede: { ...font.body, color: colors.inkSoft, lineHeight: 22 },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    marginTop: space.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  statChipHighlight: {
    backgroundColor: colors.calmSoft,
    borderColor: colors.calmSoft,
  },
  statChipText: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 11,
    color: colors.inkSoft,
  },
  statChipTextHighlight: { color: colors.calm },

  /* Filtres */
  filters: { gap: space.sm, paddingTop: space.lg, paddingBottom: space.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 13,
    color: colors.inkSoft,
  },
  chipTextActive: { color: '#FFFFFF' },
  chipCount: {
    minWidth: 22,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: colors.sandDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCountActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
  chipCountText: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 10,
    color: colors.inkSoft,
  },
  chipCountTextActive: { color: '#FFFFFF' },

  /* Carte recommandé */
  featured: {
    position: 'relative',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.accent,
    padding: space.lg,
    paddingTop: space.lg + 8,
    gap: space.sm,
    marginBottom: space.md,
    ...shadow.card,
  },
  featuredBadge: {
    position: 'absolute',
    top: 0,
    left: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.accent,
    transform: [{ translateY: -8 }],
  },
  featuredBadgeText: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  featuredBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  featuredAvatarWrap: { position: 'relative' },
  featuredAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.accentSoft,
  },
  featuredInfo: { flex: 1, minWidth: 0 },
  featuredName: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 16,
    color: colors.ink,
    flexShrink: 1,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  featuredBio: {
    ...font.small,
    fontSize: 13,
    color: colors.inkSoft,
    lineHeight: 19,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    marginTop: 4,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ctaText: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 12,
    color: colors.primary,
  },

  /* Liste */
  list: { gap: space.md },
  listWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: space.md,
  },

  /* Carte médecin */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    gap: space.sm,
    ...shadow.soft,
  },
  cardWide: { width: '48.5%' },
  pressed: { opacity: 0.92 },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primarySoft,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.calm,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  identity: { flex: 1, minWidth: 0 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 15,
    color: colors.ink,
    flexShrink: 1,
  },
  meta: {
    ...font.small,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingValue: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 12,
    color: colors.accent,
  },
  ratingCount: {
    ...font.small,
    fontSize: 11,
    color: colors.muted,
  },

  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  facility: {
    ...font.small,
    fontSize: 12,
    color: colors.muted,
    flexShrink: 1,
  },

  bio: {
    ...font.small,
    fontSize: 13,
    color: colors.inkSoft,
    lineHeight: 19,
  },

  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.sand,
  },
  langPillText: {
    fontFamily: 'Comfortaa_500Medium',
    fontSize: 10,
    color: colors.inkSoft,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    marginTop: 2,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  availabilityOn: {},
  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  availabilityDotOn: { backgroundColor: colors.calm },
  availabilityText: {
    ...font.small,
    fontSize: 11,
    color: colors.muted,
    flexShrink: 1,
  },
  availabilityTextOn: { color: colors.calm },

  /* État vide */
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxxl,
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    marginTop: space.md,
  },
  emptyTitle: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 15,
    color: colors.ink,
  },
  emptyText: {
    ...font.small,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },

  note: {
    ...font.small,
    fontSize: 11,
    color: colors.muted,
    marginTop: space.xl,
    lineHeight: 17,
  },
});