import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { Master } from '@/components/layout';
import type { IconName } from '@/lib/navigation';
import { useTriage } from '@/store';
import { colors, font, radius, shadow, space } from '@/theme';

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type TabKey = 'popular' | 'recent' | 'my_groups' | 'near_me';
type NavKey = 'feed' | 'groups' | 'events' | 'trends' | 'saved' | 'notifications';

type Post = {
  id: string;
  author: { id: string; name: string; avatar: string; verified: boolean; city: string };
  group?: { name: string; icon: string; color: string };
  timeAgo: string;
  content: string;
  event?: {
    id: string;
    day: string;
    month: string;
    title: string;
    location: string;
    attendees: number;
    max?: number;
    attending: boolean;
  };
  reactions: { count: number; liked: boolean };
  comments: { count: number };
};

type Group = {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  members: number;
  joined: boolean;
};

type Member = { id: string; name: string; avatar: string };
type EventItem = { id: string; title: string; location: string; day: string; month: string; attendees: number };
type Topic = { tag: string; posts: number };

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════ */

const AVATARS = {
  a: 'https://i.pravatar.cc/150?img=1',
  b: 'https://i.pravatar.cc/150?img=5',
  c: 'https://i.pravatar.cc/150?img=8',
  d: 'https://i.pravatar.cc/150?img=12',
  e: 'https://i.pravatar.cc/150?img=20',
  f: 'https://i.pravatar.cc/150?img=25',
  g: 'https://i.pravatar.cc/150?img=32',
  h: 'https://i.pravatar.cc/150?img=45',
};

const NAV_ITEMS: { key: NavKey; label: string; icon: IconName; badge?: number }[] = [
  { key: 'feed', label: "Fil d'actualité", icon: 'home-outline' },
  { key: 'groups', label: 'Groupes', icon: 'people-outline', badge: 3 },
  { key: 'events', label: 'Événements', icon: 'calendar-outline' },
  { key: 'trends', label: 'Tendances', icon: 'flame-outline' },
  { key: 'saved', label: 'Sauvegardés', icon: 'bookmark-outline' },
  { key: 'notifications', label: 'Notifications', icon: 'notifications-outline', badge: 2 },
];

const MOCK_GROUPS: Group[] = [
  { id: 'g1', name: 'Paludisme', icon: 'bug-outline', color: colors.accent, members: 479, joined: false },
  { id: 'g2', name: 'Maternité', icon: 'heart-outline', color: colors.primary, members: 853, joined: true },
  { id: 'g3', name: 'Diabète', icon: 'water-outline', color: colors.warning, members: 412, joined: false },
  { id: 'g4', name: 'Nutrition', icon: 'leaf-outline', color: colors.calm, members: 687, joined: true },
];

const MOCK_MEMBERS: Member[] = [
  { id: 'm1', name: 'Amina', avatar: AVATARS.a },
  { id: 'm2', name: 'Paul', avatar: AVATARS.b },
  { id: 'm3', name: 'Sandrine', avatar: AVATARS.c },
  { id: 'm4', name: 'Ibrahim', avatar: AVATARS.d },
  { id: 'm5', name: 'Grace', avatar: AVATARS.e },
  { id: 'm6', name: 'Serge', avatar: AVATARS.f },
  { id: 'm7', name: 'Estelle', avatar: AVATARS.g },
  { id: 'm8', name: 'Habib', avatar: AVATARS.h },
];

const MOCK_EVENTS: EventItem[] = [
  { id: 'e1', title: 'Journée de dépistage gratuit', location: 'CHU Yaoundé', day: '15', month: 'JAN', attendees: 87 },
  { id: 'e2', title: 'Atelier nutrition & diabète', location: 'Centre Bonanjo', day: '22', month: 'JAN', attendees: 34 },
  { id: 'e3', title: 'Table ronde maternité', location: 'Hôpital Central', day: '05', month: 'FÉV', attendees: 56 },
];

const MOCK_TOPICS: Topic[] = [
  { tag: '#paludisme', posts: 234 },
  { tag: '#grossesse', posts: 189 },
  { tag: '#nutrition', posts: 156 },
  { tag: '#dépistage', posts: 98 },
  { tag: '#santémentale', posts: 71 },
];

const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    author: { id: 'u1', name: 'Amina Ngo Bassong', avatar: AVATARS.a, verified: true, city: 'Douala' },
    group: { name: 'Paludisme', icon: '🦟', color: colors.accent },
    timeAgo: 'il y a 2 h',
    content:
      "Mon fils a fait de la fièvre pendant 3 jours. J'ai suivi vos conseils : hydratation, surveillance de la température, direction le centre de santé dès que ça a dépassé 39°C. Merci pour les partages, ça aide vraiment.",
    reactions: { count: 47, liked: false },
    comments: { count: 12 },
  },
  {
    id: 'p2',
    author: { id: 'u2', name: 'Dr Paul Etoundi', avatar: AVATARS.b, verified: true, city: 'Yaoundé' },
    group: { name: 'Maternité', icon: '💗', color: colors.primary },
    timeAgo: 'il y a 5 h',
    content:
      "Journée portes ouvertes pour les futures mamans : échographies, conseils nutrition, préparation à l'accouchement. Entrée gratuite, inscrivez-vous !",
    event: {
      id: 'ev1',
      day: '15',
      month: 'JAN',
      title: 'Journée portes ouvertes maternité',
      location: 'CHU de Yaoundé',
      attendees: 87,
      max: 120,
      attending: false,
    },
    reactions: { count: 89, liked: true },
    comments: { count: 24 },
  },
  {
    id: 'p3',
    author: { id: 'u3', name: 'Grace Ayuk', avatar: AVATARS.e, verified: false, city: 'Buea' },
    timeAgo: 'hier',
    content:
      "Astuce du jour pour les parents à petit budget : une banane + une poignée d'arachides = un goûter équilibré et pas cher pour les enfants. Testé et approuvé !",
    reactions: { count: 156, liked: false },
    comments: { count: 41 },
  },
];

/* ═══════════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
   ═══════════════════════════════════════════════════════════════════ */

export default function CommunauteScreen() {
  const { width } = useWindowDimensions();
  const { profile } = useTriage();
  const isWide = width >= 1100;
  const isMedium = width >= 768;

  const [activeNav, setActiveNav] = useState<NavKey>('feed');
  const [composeOpen, setComposeOpen] = useState(false);
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [posts, setPosts] = useState(MOCK_POSTS);

  const handleJoin = (id: string) =>
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, joined: !g.joined } : g)));

  const handleLike = (id: string) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              reactions: {
                count: p.reactions.count + (p.reactions.liked ? -1 : 1),
                liked: !p.reactions.liked,
              },
            }
          : p,
      ),
    );

  const handleEventRsvp = (eventId: string) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.event && p.event.id === eventId
          ? {
              ...p,
              event: {
                ...p.event,
                attending: !p.event.attending,
                attendees: p.event.attendees + (p.event.attending ? -1 : 1),
              },
            }
          : p,
      ),
    );

  const handleCreatePost = (text: string) => {
    const newPost: Post = {
      id: `p_${Date.now()}`,
      author: {
        id: 'me',
        name: profile?.name ?? 'Moi',
        avatar: AVATARS.d,
        verified: true,
        city: profile?.city ?? 'Cameroun',
      },
      timeAgo: "À l'instant",
      content: text,
      reactions: { count: 0, liked: false },
      comments: { count: 0 },
    };
    setPosts((prev) => [newPost, ...prev]);
    setComposeOpen(false);
  };

  return (
    <Master title="Communauté" showFooter={false}>
      <View style={styles.container}>
        {!isWide && (
          <MobileHeader
            name={profile?.name ?? 'Toi'}
            city={profile?.city ?? 'Cameroun'}
            activeNav={activeNav}
            onNavChange={setActiveNav}
          />
        )}

        <View style={[styles.layout, isWide && styles.layoutWide]}>
          {isWide && (
            <LeftSidebar
              profile={profile}
              groups={groups}
              onJoin={handleJoin}
              activeNav={activeNav}
              onNavChange={setActiveNav}
            />
          )}

          <View style={styles.center}>
            {activeNav === 'feed' ? (
              <Feed
                posts={posts}
                onCompose={() => setComposeOpen(true)}
                onLike={handleLike}
                onEventRsvp={handleEventRsvp}
              />
            ) : (
              <PlaceholderSection nav={activeNav} />
            )}
          </View>

          {isMedium && (
            <RightSidebar members={MOCK_MEMBERS} events={MOCK_EVENTS} topics={MOCK_TOPICS} />
          )}
        </View>
      </View>

      <ComposeModal
        visible={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSubmit={handleCreatePost}
        userName={profile?.name ?? 'Toi'}
      />
    </Master>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR GAUCHE
   ═══════════════════════════════════════════════════════════════════ */

function LeftSidebar({
  profile,
  groups,
  onJoin,
  activeNav,
  onNavChange,
}: {
  profile: { name?: string; city?: string } | null;
  groups: Group[];
  onJoin: (id: string) => void;
  activeNav: NavKey;
  onNavChange: (k: NavKey) => void;
}) {
  const joinedCount = groups.filter((g) => g.joined).length;

  return (
    <View style={styles.leftSidebar}>
      {/* Profil */}
      <View style={styles.panel}>
        <View style={styles.profileBanner} />
        <View style={styles.profileBody}>
          <Image source={{ uri: AVATARS.d }} style={styles.profileAvatar} />
          <View style={styles.profileNameRow}>
            <Text style={styles.profileName} numberOfLines={1}>
              {profile?.name ?? 'Toi'}
            </Text>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          </View>
          <View style={styles.profileMetaRow}>
            <Ionicons name="location-outline" size={11} color={colors.muted} />
            <Text style={styles.profileMeta} numberOfLines={1}>
              {profile?.city ?? 'Cameroun'}
            </Text>
          </View>
          <View style={styles.profileStats}>
            <ProfileStat label="Posts" value="24" />
            <ProfileStat label="Abonnés" value="156" />
            <ProfileStat label="Groupes" value={String(joinedCount)} />
          </View>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.panel}>
        <View style={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => onNavChange(item.key)}
                style={({ pressed }) => [
                  styles.navItem,
                  active && styles.navItemActive,
                  pressed && !active && styles.navItemPressed,
                ]}
              >
                <View style={[styles.navIcon, active && styles.navIconActive]}>
                  <Ionicons
                    name={item.icon}
                    size={15}
                    color={active ? colors.accent : colors.inkSoft}
                  />
                </View>
                <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
                  {item.label}
                </Text>
                {item.badge ? (
                  <View style={styles.navBadge}>
                    <Text style={styles.navBadgeText}>{item.badge}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Groupes */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Groupes populaires</Text>
        </View>
        <View style={styles.groupList}>
          {groups.map((g) => (
            <View key={g.id} style={styles.groupItem}>
              <View style={[styles.groupIcon, { backgroundColor: `${g.color}18` }]}>
                <Ionicons name={g.icon} size={15} color={g.color} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.groupName} numberOfLines={1}>
                  {g.name}
                </Text>
                <Text style={styles.groupMeta}>
                  {g.members.toLocaleString('fr-FR')} membres
                </Text>
              </View>
              <Pressable
                onPress={() => onJoin(g.id)}
                style={({ pressed }) => [
                  styles.groupJoin,
                  g.joined && styles.groupJoinActive,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.groupJoinText, g.joined && styles.groupJoinTextActive]}>
                  {g.joined ? '✓ Rejoint' : 'Rejoindre'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileStat}>
      <Text style={styles.profileStatValue}>{value}</Text>
      <Text style={styles.profileStatLabel}>{label}</Text>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FEED
   ═══════════════════════════════════════════════════════════════════ */

function Feed({
  posts,
  onCompose,
  onLike,
  onEventRsvp,
}: {
  posts: Post[];
  onCompose: () => void;
  onLike: (id: string) => void;
  onEventRsvp: (id: string) => void;
}) {
  const [tab, setTab] = useState<TabKey>('popular');
  const tabs: { key: TabKey; label: string; icon: IconName }[] = [
    { key: 'popular', label: 'Populaires', icon: 'flame-outline' },
    { key: 'recent', label: 'Récents', icon: 'time-outline' },
    { key: 'my_groups', label: 'Mes groupes', icon: 'people-outline' },
    { key: 'near_me', label: 'Près de moi', icon: 'location-outline' },
  ];

  return (
    <View style={styles.feed}>
      {/* Compose box */}
      <View style={styles.composeBox}>
        <View style={styles.composeTop}>
          <Image source={{ uri: AVATARS.d }} style={styles.composeAvatar} />
          <Pressable onPress={onCompose} style={styles.composeInput}>
            <Text style={styles.composePlaceholder} numberOfLines={1}>
              Partage quelque chose avec la communauté…
            </Text>
          </Pressable>
        </View>
        <View style={styles.composeActions}>
          <View style={styles.composeTools}>
            <ComposeTool icon="image-outline" label="Photo" onPress={onCompose} />
            <ComposeTool icon="calendar-outline" label="Événement" onPress={onCompose} />
            <ComposeTool icon="pricetag-outline" label="#Tag" onPress={onCompose} />
          </View>
          <Pressable onPress={onCompose} style={({ pressed }) => [styles.composeSubmit, pressed && { opacity: 0.9 }]}>
            <Text style={styles.composeSubmitText}>Publier</Text>
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: space.lg }}>
        <View style={styles.tabsRow}>
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={({ pressed }) => [
                  styles.tab,
                  active && styles.tabActive,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Ionicons name={t.icon} size={13} color={active ? '#FFFFFF' : colors.inkSoft} />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Posts */}
      {posts.map((p) => (
        <PostCard key={p.id} post={p} onLike={onLike} onEventRsvp={onEventRsvp} />
      ))}
    </View>
  );
}

function ComposeTool({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.composeTool, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={icon} size={13} color={colors.inkSoft} />
      <Text style={styles.composeToolText}>{label}</Text>
    </Pressable>
  );
}

function PostCard({
  post,
  onLike,
  onEventRsvp,
}: {
  post: Post;
  onLike: (id: string) => void;
  onEventRsvp: (id: string) => void;
}) {
  return (
    <View style={styles.postCard}>
      {/* En-tête */}
      <View style={styles.postHeader}>
        <Image source={{ uri: post.author.avatar }} style={styles.postAvatar} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.postAuthorRow}>
            <Text style={styles.postAuthorName} numberOfLines={1}>
              {post.author.name}
            </Text>
            {post.author.verified && (
              <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
            )}
            {post.group && (
              <View style={[styles.postGroupBadge, { backgroundColor: `${post.group.color}18` }]}>
                <Text style={[styles.postGroupBadgeText, { color: post.group.color }]}>
                  {post.group.icon} {post.group.name}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.postMetaRow}>
            <Ionicons name="location-outline" size={10} color={colors.muted} />
            <Text style={styles.postMetaText}>{post.author.city}</Text>
            <Text style={styles.postMetaSep}>·</Text>
            <Text style={styles.postMetaText}>{post.timeAgo}</Text>
          </View>
        </View>
        <Pressable style={styles.postMenu}>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.muted} />
        </Pressable>
      </View>

      {/* Contenu */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Carte événement */}
      {post.event && (
        <View style={styles.postEventCard}>
          <View style={styles.postEventDate}>
            <Text style={styles.postEventDay}>{post.event.day}</Text>
            <Text style={styles.postEventMonth}>{post.event.month}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.postEventTitle} numberOfLines={2}>
              {post.event.title}
            </Text>
            <View style={styles.postEventMetaRow}>
              <Ionicons name="location-outline" size={10} color={colors.muted} />
              <Text style={styles.postEventMeta} numberOfLines={1}>
                {post.event.location}
              </Text>
            </View>
            <View style={styles.postEventMetaRow}>
              <Ionicons name="people-outline" size={10} color={colors.muted} />
              <Text style={styles.postEventMeta}>
                {post.event.attendees}/{post.event.max ?? '∞'} inscrits
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => post.event && onEventRsvp(post.event.id)}
            style={({ pressed }) => [
              styles.postEventRsvp,
              post.event!.attending && styles.postEventRsvpActive,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text
              style={[
                styles.postEventRsvpText,
                post.event!.attending && styles.postEventRsvpTextActive,
              ]}
            >
              {post.event!.attending ? '✓ Inscrit' : "S'inscrire"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Footer */}
      <View style={styles.postFooter}>
        <View style={styles.postReactions}>
          <Text style={styles.postReactionCount}>{post.reactions.count} réactions</Text>
          <Text style={styles.postMetaSep}>·</Text>
          <Text style={styles.postReactionCount}>{post.comments.count} commentaires</Text>
        </View>
        <View style={styles.postActions}>
          <PostAction
            icon={post.reactions.liked ? 'heart' : 'heart-outline'}
            label={post.reactions.liked ? 'Aimé' : "J'aime"}
            active={post.reactions.liked}
            onPress={() => onLike(post.id)}
          />
          <PostAction icon="chatbubble-outline" label="Commenter" />
          <PostAction icon="share-outline" label="Partager" />
          <PostAction icon="bookmark-outline" label="Sauver" />
        </View>
      </View>
    </View>
  );
}

function PostAction({
  icon,
  label,
  active,
  onPress,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.postAction,
        active && styles.postActionActive,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name={icon} size={13} color={active ? colors.danger : colors.inkSoft} />
      <Text style={[styles.postActionText, active && styles.postActionTextActive]}>{label}</Text>
    </Pressable>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR DROITE
   ═══════════════════════════════════════════════════════════════════ */

function RightSidebar({
  members,
  events,
  topics,
}: {
  members: Member[];
  events: EventItem[];
  topics: Topic[];
}) {
  return (
    <View style={styles.rightSidebar}>
      {/* Membres */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Actifs maintenant</Text>
          <Text style={styles.panelBadge}>{members.length} en ligne</Text>
        </View>
        <View style={styles.membersGrid}>
          {members.map((m) => (
            <View key={m.id} style={styles.memberItem}>
              <Image source={{ uri: m.avatar }} style={styles.memberAvatar} />
              <View style={styles.memberOnline} />
            </View>
          ))}
        </View>
      </View>

      {/* Événements */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>À venir</Text>
        </View>
        <View style={styles.sideList}>
          {events.map((e) => (
            <Pressable
              key={e.id}
              style={({ pressed }) => [styles.eventItem, pressed && { opacity: 0.75 }]}
            >
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>{e.day}</Text>
                <Text style={styles.eventMonth}>{e.month}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {e.title}
                </Text>
                <View style={styles.eventMetaRow}>
                  <Ionicons name="location-outline" size={10} color={colors.muted} />
                  <Text style={styles.eventMeta} numberOfLines={1}>
                    {e.location}
                  </Text>
                </View>
                <View style={styles.eventMetaRow}>
                  <Ionicons name="people-outline" size={10} color={colors.muted} />
                  <Text style={styles.eventMeta}>{e.attendees} participants</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Tendances */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Tendances</Text>
        </View>
        <View style={styles.sideList}>
          {topics.map((t, i) => (
            <Pressable
              key={t.tag}
              style={({ pressed }) => [styles.trendItem, pressed && { opacity: 0.75 }]}
            >
              <Text style={[styles.trendRank, i < 3 && styles.trendRankTop]}>{i + 1}</Text>
              <Text style={styles.trendTag}>{t.tag}</Text>
              <Text style={styles.trendCount}>{t.posts} posts</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HEADER MOBILE
   ═══════════════════════════════════════════════════════════════════ */

function MobileHeader({
  name,
  city,
  activeNav,
  onNavChange,
}: {
  name: string;
  city: string;
  activeNav: NavKey;
  onNavChange: (k: NavKey) => void;
}) {
  return (
    <View style={styles.mobileHeader}>
      <View style={styles.mobileProfile}>
        <Image source={{ uri: AVATARS.d }} style={styles.mobileAvatar} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.mobileName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.mobileCity} numberOfLines={1}>
            {city}
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileNavRow}>
        {NAV_ITEMS.map((item) => {
          const active = activeNav === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => onNavChange(item.key)}
              style={[styles.mobilePill, active && styles.mobilePillActive]}
            >
              <Ionicons
                name={item.icon}
                size={13}
                color={active ? '#FFFFFF' : colors.inkSoft}
              />
              <Text style={[styles.mobilePillText, active && styles.mobilePillTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION PLACEHOLDER (nav ≠ feed)
   ═══════════════════════════════════════════════════════════════════ */

function PlaceholderSection({ nav }: { nav: NavKey }) {
  const labels: Record<NavKey, string> = {
    feed: '',
    groups: 'Groupes',
    events: 'Événements',
    trends: 'Tendances',
    saved: 'Sauvegardés',
    notifications: 'Notifications',
  };
  return (
    <View style={styles.placeholder}>
      <Ionicons name="construct-outline" size={32} color={colors.muted} />
      <Text style={styles.placeholderTitle}>{labels[nav]}</Text>
      <Text style={styles.placeholderText}>Cette section sera disponible prochainement.</Text>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MODALE COMPOSITION
   ═══════════════════════════════════════════════════════════════════ */

function ComposeModal({
  visible,
  onClose,
  onSubmit,
  userName,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  userName: string;
}) {
  const [text, setText] = useState('');
  const [type, setType] = useState<'post' | 'photo' | 'event' | 'hashtag'>('post');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
    setType('post');
  };

  const types: { key: typeof type; label: string; icon: IconName }[] = [
    { key: 'post', label: 'Post', icon: 'chatbubble-outline' },
    { key: 'photo', label: 'Photo', icon: 'image-outline' },
    { key: 'event', label: 'Événement', icon: 'calendar-outline' },
    { key: 'hashtag', label: '#Tag', icon: 'pricetag-outline' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle publication</Text>
            <Pressable onPress={onClose} style={styles.modalClose} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.inkSoft} />
            </Pressable>
          </View>

          {/* Auteur */}
          <View style={styles.modalAuthor}>
            <Image source={{ uri: AVATARS.d }} style={styles.modalAuthorAvatar} />
            <View>
              <Text style={styles.modalAuthorName}>{userName}</Text>
              <Text style={styles.modalAuthorVis}>🌐 Public</Text>
            </View>
          </View>

          {/* Textarea */}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Quoi de neuf ? Partage tes pensées…"
            placeholderTextColor={colors.muted}
            multiline
            style={styles.modalTextarea}
            autoFocus
          />

          {/* Type selector */}
          <View style={styles.modalTypes}>
            {types.map((t) => {
              const active = type === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setType(t.key)}
                  style={[styles.modalTypeBtn, active && styles.modalTypeBtnActive]}
                >
                  <Ionicons name={t.icon} size={13} color={active ? colors.accent : colors.inkSoft} />
                  <Text style={[styles.modalTypeText, active && styles.modalTypeTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={!text.trim()}
            style={({ pressed }) => [
              styles.modalSubmit,
              !text.trim() && styles.modalSubmitDisabled,
              pressed && text.trim() && { opacity: 0.9 },
            ]}
          >
            <Ionicons name="paper-plane-outline" size={15} color="#FFFFFF" />
            <Text style={styles.modalSubmitText}>Publier</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1400, alignSelf: 'center', paddingTop: space.sm },

  /* Layout */
  layout: { flexDirection: 'column', gap: space.lg },
  layoutWide: { flexDirection: 'row', alignItems: 'flex-start' },
  leftSidebar: { width: 260, gap: space.md },
  center: { flex: 1, minWidth: 0 },
  rightSidebar: { width: 280, gap: space.md },

  /* Panels */
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: 'hidden',
    ...shadow.soft,
  },
  panelHeader: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  panelBadge: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 10,
    color: colors.calm,
  },

  /* Profil */
  profileBanner: {
    height: 68,
    backgroundColor: colors.primary,
  },
  profileBody: {
    paddingTop: space.lg,
    paddingBottom: space.md,
    paddingHorizontal: space.md,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.surface,
    marginTop: -32,
    marginBottom: space.sm,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  profileName: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 14,
    color: colors.ink,
    flexShrink: 1,
  },
  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  profileMeta: { ...font.small, fontSize: 11, color: colors.muted },
  profileStats: {
    flexDirection: 'row',
    marginTop: space.md,
    width: '100%',
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatValue: { fontFamily: 'Comfortaa_700Bold', fontSize: 14, color: colors.ink },
  profileStatLabel: {
    fontFamily: 'Comfortaa_500Medium',
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },

  /* Navigation */
  navList: { paddingVertical: space.sm, paddingHorizontal: space.sm, gap: 2 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
  },
  navItemActive: { backgroundColor: colors.primarySoft },
  navItemPressed: { backgroundColor: colors.sandDeep },
  navIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  navIconActive: { backgroundColor: colors.accentSoft },
  navLabel: {
    flex: 1,
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 13,
    color: colors.inkSoft,
  },
  navLabelActive: { color: colors.ink },
  navBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: colors.dangerSoft,
  },
  navBadgeText: { fontFamily: 'Comfortaa_700Bold', fontSize: 10, color: colors.danger },

  /* Groupes */
  groupList: { padding: space.sm, gap: space.xs },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
  },
  groupIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 13, color: colors.ink },
  groupMeta: { ...font.small, fontSize: 11, color: colors.muted, marginTop: 1 },
  groupJoin: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
  },
  groupJoinActive: { backgroundColor: colors.primarySoft },
  groupJoinText: { fontFamily: 'Comfortaa_700Bold', fontSize: 10, color: colors.accent },
  groupJoinTextActive: { color: colors.primary },

  /* Compose box */
  composeBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: space.md,
    marginBottom: space.md,
    ...shadow.soft,
  },
  composeTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  composeAvatar: { width: 38, height: 38, borderRadius: 19 },
  composeInput: {
    flex: 1,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    backgroundColor: colors.sand,
    borderRadius: 999,
  },
  composePlaceholder: { ...font.small, fontSize: 13, color: colors.muted },
  composeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.sm,
    gap: space.sm,
  },
  composeTools: { flexDirection: 'row', gap: space.xs, flex: 1 },
  composeTool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
  },
  composeToolText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 11, color: colors.inkSoft },
  composeSubmit: {
    paddingVertical: 8,
    paddingHorizontal: space.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  composeSubmitText: { fontFamily: 'Comfortaa_700Bold', fontSize: 12, color: '#FFFFFF' },

  /* Tabs */
  tabsRow: { flexDirection: 'row', gap: space.xs, paddingVertical: 2 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: space.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 12, color: colors.inkSoft },
  tabTextActive: { color: '#FFFFFF' },

  /* Post */
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    marginBottom: space.md,
    overflow: 'hidden',
    ...shadow.soft,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: space.md,
    paddingBottom: space.sm,
  },
  postAvatar: { width: 42, height: 42, borderRadius: 21 },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  postAuthorName: { fontFamily: 'Comfortaa_700Bold', fontSize: 13, color: colors.ink },
  postGroupBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 2,
  },
  postGroupBadgeText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 10 },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  postMetaText: { ...font.small, fontSize: 11, color: colors.muted },
  postMetaSep: { fontSize: 11, color: colors.muted, opacity: 0.6 },
  postMenu: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  postContent: {
    ...font.body,
    fontSize: 13,
    color: colors.inkSoft,
    lineHeight: 20,
    paddingHorizontal: space.md,
    paddingBottom: space.md,
  },

  /* Event card dans un post */
  postEventCard: {
    marginHorizontal: space.md,
    marginBottom: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    backgroundColor: colors.accentSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  postEventDate: {
    width: 46,
    paddingVertical: space.sm,
    borderRadius: 12,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postEventDay: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  postEventMonth: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.6,
  },
  postEventTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 13, color: colors.ink },
  postEventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  postEventMeta: { ...font.small, fontSize: 11, color: colors.inkSoft, flexShrink: 1 },
  postEventRsvp: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  postEventRsvpActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  postEventRsvpText: { fontFamily: 'Comfortaa_700Bold', fontSize: 11, color: colors.accent },
  postEventRsvpTextActive: { color: '#FFFFFF' },

  /* Footer post */
  postFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    gap: space.sm,
  },
  postReactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postReactionCount: { ...font.small, fontSize: 11, color: colors.muted },
  postActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  postActionActive: { borderColor: colors.dangerSoft, backgroundColor: colors.dangerSoft },
  postActionText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 11, color: colors.inkSoft },
  postActionTextActive: { color: colors.danger },

  /* Right sidebar */
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: space.sm,
    gap: space.xs,
  },
  memberItem: { position: 'relative', width: '23%', aspectRatio: 1 },
  memberAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  memberOnline: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.calm,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  sideList: { padding: space.sm, gap: space.sm },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  eventDate: {
    width: 40,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  eventDay: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  eventMonth: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 8,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  eventTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 12, color: colors.ink, lineHeight: 16 },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  eventMeta: { ...font.small, fontSize: 10, color: colors.muted, flexShrink: 1 },

  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: 6,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
  },
  trendRank: { fontFamily: 'Comfortaa_700Bold', fontSize: 12, color: colors.muted, width: 16 },
  trendRankTop: { color: colors.accent },
  trendTag: { flex: 1, fontFamily: 'Comfortaa_700Bold', fontSize: 12, color: colors.accent },
  trendCount: { ...font.small, fontSize: 10, color: colors.muted },

  /* Header mobile */
  mobileHeader: { marginBottom: space.lg, gap: space.md },
  mobileProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  mobileAvatar: { width: 40, height: 40, borderRadius: 20 },
  mobileName: { fontFamily: 'Comfortaa_700Bold', fontSize: 13, color: colors.ink },
  mobileCity: { ...font.small, fontSize: 11, color: colors.muted, marginTop: 1 },
  mobileNavRow: { gap: space.xs },
  mobilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: space.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  mobilePillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  mobilePillText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 11, color: colors.inkSoft },
  mobilePillTextActive: { color: '#FFFFFF' },

  /* Placeholder */
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxxl,
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  placeholderTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 16, color: colors.ink },
  placeholderText: { ...font.small, fontSize: 13, color: colors.muted },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 30, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    gap: space.md,
    ...shadow.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 16, color: colors.ink },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  modalAuthor: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  modalAuthorAvatar: { width: 40, height: 40, borderRadius: 20 },
  modalAuthorName: { fontFamily: 'Comfortaa_700Bold', fontSize: 13, color: colors.ink },
  modalAuthorVis: { ...font.small, fontSize: 11, color: colors.muted, marginTop: 1 },
  modalTextarea: {
    ...font.body,
    fontSize: 14,
    color: colors.ink,
    minHeight: 120,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.sand,
    textAlignVertical: 'top',
  },
  modalTypes: { flexDirection: 'row', gap: space.xs },
  modalTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  modalTypeBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  modalTypeText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 11, color: colors.inkSoft },
  modalTypeTextActive: { color: colors.accent },
  modalSubmit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  modalSubmitDisabled: { opacity: 0.4 },
  modalSubmitText: { fontFamily: 'Comfortaa_700Bold', fontSize: 14, color: '#FFFFFF' },
});