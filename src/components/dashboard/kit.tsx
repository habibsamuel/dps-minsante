import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';

import { longDate, type EvaluationEntry } from '@/lib/evaluations';
import { initialsOf } from '@/lib/format';
import type { IconName } from '@/lib/navigation';
import type { Level } from '@/lib/triage';
import { colors, font, radius, shadow, space } from '@/theme';

/* ---------- Tons ---------- */

export type Tone = 'primary' | 'accent' | 'danger' | 'calm' | 'warning' | 'muted';

export const TONE: Record<Tone, string> = {
  primary: colors.primary,
  accent: colors.accent,
  danger: colors.danger,
  calm: colors.calm,
  warning: colors.warning,
  muted: colors.muted,
};

const LEVEL: Record<Level, { label: string; tone: Tone }> = {
  urgence: { label: 'Priorité élevée', tone: 'danger' },
  consultation: { label: 'Avis conseillé', tone: 'warning' },
  surveillance: { label: 'Surveillance', tone: 'calm' },
};

/* ---------- Mise en page ---------- */

export function Columns({
  children,
  aside,
  asideFirst,
}: {
  children: ReactNode;
  aside?: ReactNode;
  asideFirst?: boolean;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= 1200;
  const side = aside ? (
    <View style={[styles.aside, wide && styles.asideWide]}>{aside}</View>
  ) : null;

  return (
    <View style={[styles.columns, wide && styles.columnsWide]}>
      {asideFirst ? side : null}
      <View style={styles.main}>{children}</View>
      {asideFirst ? null : side}
    </View>
  );
}

export function PageHead({ title, lede, eyebrow }: { title: string; lede?: string; eyebrow?: string }) {
  return (
    <View style={styles.head}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.pageTitle}>{title}</Text>
      {lede ? <Text style={styles.lede}>{lede}</Text> : null}
    </View>
  );
}

/* ---------- Panneau ---------- */

export function Panel({
  title,
  right,
  pad = true,
  style,
  children,
}: {
  title?: string;
  right?: ReactNode;
  pad?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <View style={[styles.panel, style]}>
      {title ? (
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{title}</Text>
          {right}
        </View>
      ) : null}
      <View style={pad ? styles.panelBody : undefined}>{children}</View>
    </View>
  );
}

export function PanelLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} hitSlop={8}>
      <Text style={styles.panelLink}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Éléments ---------- */

export function IconTile({ icon, tone = 'primary', size = 34 }: { icon: IconName; tone?: Tone; size?: number }) {
  const color = TONE[tone];
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={Math.round(size * 0.46)} color={color} />
    </View>
  );
}

export function Avatar({ name, size = 40 }: { name?: string | null; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: Math.round(size * 0.36) }]}>{initialsOf(name)}</Text>
    </View>
  );
}

export function Tag({ label, tone = 'primary', icon }: { label: string; tone?: Tone; icon?: IconName }) {
  const color = TONE[tone];
  return (
    <View style={[styles.tag, { backgroundColor: `${color}18` }]}>
      {icon ? <Ionicons name={icon} size={10} color={color} /> : null}
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

export function Pill({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: IconName;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={({ pressed }) => [styles.pill, active && styles.pillActive, pressed && { opacity: 0.85 }]}
    >
      {icon ? <Ionicons name={icon} size={13} color={active ? '#FFFFFF' : colors.inkSoft} /> : null}
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function SmallButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  block,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  variant?: 'primary' | 'soft';
  block?: boolean;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        primary ? styles.btnPrimary : styles.btnSoft,
        block && styles.btnBlock,
        pressed && { opacity: 0.9 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={15} color={primary ? '#FFFFFF' : colors.primary} /> : null}
      <Text style={[styles.btnText, { color: primary ? '#FFFFFF' : colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Lignes de navigation ---------- */

export function RowList({ children }: { children: ReactNode }) {
  return <View style={styles.rowList}>{children}</View>;
}

export function NavRow({
  icon,
  label,
  hint,
  tone = 'primary',
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  hint?: string;
  tone?: Tone;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <IconTile icon={icon} tone={danger ? 'danger' : tone} />
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, danger && { color: colors.danger }]} numberOfLines={1}>
          {label}
        </Text>
        {hint ? (
          <Text style={styles.rowHint} numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
      </View>
      {danger ? null : <Ionicons name="chevron-forward" size={16} color={colors.muted} />}
    </Pressable>
  );
}

/* ---------- Statistiques et carte profil ---------- */

export function StatRow({ items }: { items: { label: string; value: string; color?: string }[] }) {
  return (
    <View style={styles.statRow}>
      {items.map((item) => (
        <View key={item.label} style={styles.stat}>
          <Text style={[styles.statValue, item.color ? { color: item.color } : null]}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function ProfileCard({
  name,
  city,
  roleLabel,
  stats,
}: {
  name: string;
  city?: string;
  roleLabel: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.banner} />
      <View style={styles.cardBody}>
        <View style={styles.cardAvatar}>
          <Avatar name={name} size={64} />
        </View>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {name || 'Mon profil'}
          </Text>
          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
        </View>
        <View style={styles.cardMetaRow}>
          <Ionicons name="location-outline" size={11} color={colors.muted} />
          <Text style={styles.cardMeta} numberOfLines={1}>
            {city || 'Cameroun'} · {roleLabel}
          </Text>
        </View>
        <View style={styles.cardStats}>
          <StatRow items={stats} />
        </View>
      </View>
    </View>
  );
}

/* ---------- Ligne d'évaluation (tuile de date) ---------- */

export function EvaluationRow({ entry, first }: { entry: EvaluationEntry; first?: boolean }) {
  const meta = LEVEL[entry.level];
  const date = new Date(entry.date);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase();

  return (
    <View style={[styles.evalRow, !first && styles.evalRowBorder]}>
      <View style={[styles.dateTile, { backgroundColor: TONE[meta.tone] }]}>
        <Text style={styles.dateDay}>{day}</Text>
        <Text style={styles.dateMonth}>{month}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={styles.evalTitle}>{meta.label}</Text>
        <Text style={styles.evalMeta}>{longDate(entry.date)}</Text>
      </View>
      <Text style={styles.evalIndex}>
        {entry.index}
        <Text style={styles.evalIndexSub}>/100</Text>
      </Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  columns: { width: '100%', maxWidth: 1200, alignSelf: 'center', flexDirection: 'column', gap: space.lg },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 1, minWidth: 0, gap: space.md },
  aside: { gap: space.md },
  asideWide: { width: 300 },

  head: { marginBottom: space.xs },
  eyebrow: { ...font.small, fontSize: 12, color: colors.muted },
  pageTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 24, color: colors.ink, marginTop: 2 },
  lede: { ...font.small, fontSize: 13, lineHeight: 20, color: colors.inkSoft, marginTop: 6 },

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
  panelLink: { fontFamily: 'Comfortaa_700Bold', fontSize: 11, color: colors.primary },
  panelBody: { padding: space.md },

  tile: { borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatar: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Comfortaa_700Bold', color: '#FFFFFF' },

  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tagText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 10 },

  pill: {
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
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 12, color: colors.inkSoft },
  pillTextActive: { color: '#FFFFFF' },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: space.md,
    borderRadius: 12,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnSoft: { backgroundColor: colors.primarySoft },
  btnBlock: { alignSelf: 'stretch', paddingVertical: 12 },
  btnText: { fontFamily: 'Comfortaa_700Bold', fontSize: 12 },

  rowList: { padding: space.sm, gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
  },
  rowPressed: { backgroundColor: colors.sandDeep },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 13, color: colors.ink },
  rowHint: { ...font.small, fontSize: 11, color: colors.muted, marginTop: 1 },

  statRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: 'Comfortaa_700Bold', fontSize: 15, color: colors.ink },
  statLabel: {
    fontFamily: 'Comfortaa_500Medium',
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },

  banner: { height: 68, backgroundColor: colors.primary },
  cardBody: { paddingBottom: space.md, paddingHorizontal: space.md, alignItems: 'center' },
  cardAvatar: {
    marginTop: -32,
    marginBottom: space.sm,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%' },
  cardName: { fontFamily: 'Comfortaa_700Bold', fontSize: 14, color: colors.ink, flexShrink: 1 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  cardMeta: { ...font.small, fontSize: 11, color: colors.muted },
  cardStats: {
    width: '100%',
    marginTop: space.md,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },

  evalRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  evalRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  dateTile: { width: 44, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  dateDay: { fontFamily: 'Comfortaa_700Bold', fontSize: 16, color: '#FFFFFF', lineHeight: 20 },
  dateMonth: { fontFamily: 'Comfortaa_700Bold', fontSize: 8, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },
  evalTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 13, color: colors.ink },
  evalMeta: { ...font.small, fontSize: 11, color: colors.muted, marginTop: 2 },
  evalIndex: { fontFamily: 'Comfortaa_700Bold', fontSize: 20, color: colors.primary },
  evalIndexSub: { fontFamily: 'Comfortaa_500Medium', fontSize: 11, color: colors.muted },
});