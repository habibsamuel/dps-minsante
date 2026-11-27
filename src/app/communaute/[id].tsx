import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Master } from '@/components/layout';
import {
  findCommunity,
  totalMembers,
  type Community,
  type CommunityGroup,
} from '@/lib/communities';
import { colors, font, radius, shadow, space } from '@/theme';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const community = typeof id === 'string' ? findCommunity(id) : undefined;

  // État local de démo — à remplacer par un vrai store + backend plus tard.
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  const toggleJoin = (groupId: string) =>
    setJoined((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

  if (!community) {
    return (
      <Master title="Communauté">
        <Text style={styles.notFound}>Communauté introuvable.</Text>
      </Master>
    );
  }

  const members = totalMembers(community);
  const groupCount = community.groups.length;

  return (
    <Master title={community.name}>
      <View style={styles.container}>
        {/* En-tête de communauté */}
        <View style={styles.header}>
          <View style={[styles.iconLarge, { backgroundColor: `${community.color}20` }]}>
            <Ionicons name={community.icon} size={32} color={community.color} />
          </View>
          <Text style={styles.title}>{community.name}</Text>
          <Text style={styles.description}>{community.description}</Text>
          <Text style={styles.stats}>
            {groupCount} groupe{groupCount > 1 ? 's' : ''} ·{' '}
            {members.toLocaleString('fr-FR')} membre{members > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Section groupes */}
        <Text style={styles.sectionTitle}>Groupes</Text>
        <View style={styles.groups}>
          {community.groups.length === 0 ? (
            <Text style={styles.empty}>Aucun groupe pour l’instant.</Text>
          ) : (
            community.groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                joined={!!joined[group.id]}
                onToggle={() => toggleJoin(group.id)}
              />
            ))
          )}
        </View>

        <Text style={styles.note}>
          Pour poser une question médicale précise, commence par une évaluation. La communauté
          ne remplace pas l’avis d’un professionnel.
        </Text>
      </View>
    </Master>
  );
}

function GroupCard({
  group,
  joined,
  onToggle,
}: {
  group: CommunityGroup;
  joined: boolean;
  onToggle: () => void;
}) {
  const displayCount = group.memberCount + (joined ? 1 : 0);

  return (
    <View style={styles.groupCard}>
      <Text style={styles.groupName}>{group.name}</Text>
      <Text style={styles.groupDescription}>{group.description}</Text>

      <View style={styles.groupFooter}>
        <Text style={styles.groupMeta}>
          {displayCount.toLocaleString('fr-FR')} membre{displayCount > 1 ? 's' : ''} ·{' '}
          Actif {group.lastActivityLabel}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: joined }}
          accessibilityLabel={joined ? 'Quitter le groupe' : 'Rejoindre le groupe'}
          onPress={onToggle}
          style={({ pressed }) => [
            styles.joinBtn,
            joined && styles.joinBtnActive,
            pressed && styles.joinBtnPressed,
          ]}
        >
          <Ionicons
            name={joined ? 'checkmark' : 'add'}
            size={14}
            color={joined ? colors.primary : '#FFFFFF'}
          />
          <Text style={[styles.joinBtnText, joined && styles.joinBtnTextActive]}>
            {joined ? 'Rejoint' : 'Rejoindre'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingTop: space.sm,
  },

  header: {
    alignItems: 'center',
    paddingVertical: space.lg,
  },
  iconLarge: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  title: {
    ...font.h1,
    color: colors.ink,
    textAlign: 'center',
  },
  description: {
    ...font.body,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: space.sm,
    maxWidth: 480,
  },
  stats: {
    fontFamily: 'Comfortaa_500Medium',
    fontSize: 12,
    color: colors.muted,
    marginTop: space.sm,
  },

  sectionTitle: {
    ...font.h3,
    color: colors.ink,
    marginTop: space.xxl,
    marginBottom: space.md,
  },
  groups: { gap: space.md },

  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: space.lg,
    ...shadow.soft,
  },
  groupName: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 16,
    color: colors.ink,
  },
  groupDescription: {
    ...font.small,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
    lineHeight: 18,
  },
  groupFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    marginTop: space.md,
  },
  groupMeta: {
    ...font.small,
    fontSize: 11,
    color: colors.muted,
    flex: 1,
  },

  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  joinBtnActive: {
    backgroundColor: colors.primarySoft,
  },
  joinBtnPressed: { opacity: 0.85 },
  joinBtnText: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  joinBtnTextActive: { color: colors.primary },

  empty: {
    ...font.small,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: space.lg,
  },

  note: {
    ...font.small,
    fontSize: 11,
    color: colors.muted,
    marginTop: space.xl,
    lineHeight: 17,
  },
  notFound: {
    ...font.body,
    color: colors.inkSoft,
    marginTop: space.lg,
    textAlign: 'center',
  },
});