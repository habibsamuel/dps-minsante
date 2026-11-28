import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LineChart } from '@/components/dashboard/LineChart';
import { Badge } from '@/components/ui';
import {
  buildInsights,
  clearEvaluations,
  longDate,
  useEvaluations,
  type Trend,
} from '@/lib/evaluations';
import type { IconName } from '@/lib/navigation';
import type { Level } from '@/lib/triage';
import { colors, radius, shadow } from '@/theme';

const LEVEL_META: Record<Level, { label: string; tone: 'danger' | 'warning' | 'calm' }> = {
  urgence: { label: 'Priorité élevée', tone: 'danger' },
  consultation: { label: 'Avis conseillé', tone: 'warning' },
  surveillance: { label: 'Surveillance', tone: 'calm' },
};

const TREND_META: Record<Trend, { label: string; icon: IconName; color: string }> = {
  up: { label: 'En amélioration', icon: 'trending-up', color: colors.calm },
  down: { label: 'En dégradation', icon: 'trending-down', color: colors.danger },
  flat: { label: 'Stable', icon: 'remove', color: colors.inkSoft },
  none: { label: 'Pas encore de tendance', icon: 'time-outline', color: colors.muted },
};

export default function AutoEvaluation() {
  const router = useRouter();
  const entries = useEvaluations();
  const insights = buildInsights(entries);
  const trend = TREND_META[insights.trend];
  const recent = [...entries].reverse().slice(0, 6);

  return (
    <View>
      <Text style={styles.title}>Auto-évaluation IA</Text>
      <Text style={styles.lede}>
        Suis l’évolution de ton état au fil de tes évaluations : ta courbe de croissance et ta courbe
        de redressement.
      </Text>

      {/* ---------- Lancer une évaluation ---------- */}
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Fais le point maintenant</Text>
          <Text style={styles.heroSub}>
            Quelques questions courtes. Ton indice s’ajoute à la courbe.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/triage')}
          style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
        >
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={styles.heroBtnText}>Commencer</Text>
        </Pressable>
      </View>

      {/* ---------- Indicateurs ---------- */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Indice actuel</Text>
          <Text style={styles.statValue}>{insights.last ? `${insights.last.index}` : '—'}</Text>
          <Text style={styles.statSub}>sur 100</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Variation</Text>
          <Text style={[styles.statValue, { color: trend.color }]}>
            {insights.delta === null ? '—' : `${insights.delta > 0 ? '+' : ''}${insights.delta}`}
          </Text>
          <Text style={styles.statSub}>depuis la dernière</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Tendance</Text>
          <View style={styles.trendRow}>
            <Ionicons name={trend.icon} size={22} color={trend.color} />
            <Text style={[styles.trendText, { color: trend.color }]}>{trend.label}</Text>
          </View>
        </View>
      </View>

      {/* ---------- Courbes ---------- */}
      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="analytics-outline" size={34} color={colors.muted} />
          <Text style={styles.emptyTitle}>Aucune auto-évaluation pour l’instant</Text>
          <Text style={styles.emptyText}>
            Fais ta première évaluation : tes courbes apparaîtront ici.
          </Text>
        </View>
      ) : (
        <View style={styles.charts}>
          <ChartCard
            title="Courbe de croissance"
            sub="Ton indice de santé (100 = au mieux)"
          >
            <LineChart id="g-health" data={insights.health} color={colors.primary} />
          </ChartCard>
          <ChartCard
            title="Courbe de redressement"
            sub="Ta récupération depuis ton point le plus bas"
          >
            <LineChart id="g-recovery" data={insights.recovery} color={colors.accent} unit="%" />
          </ChartCard>
        </View>
      )}
      {entries.length === 1 ? (
        <Text style={styles.note}>
          Refais une évaluation dans 48 h : les courbes se dessinent à partir de deux points.
        </Text>
      ) : null}

      {/* ---------- Analyse ---------- */}
      <View style={styles.analysis}>
        <View style={styles.analysisHead}>
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={styles.analysisTitle}>Analyse automatique</Text>
        </View>
        <Text style={styles.analysisText}>{insights.analysis}</Text>
        {insights.trend === 'down' || insights.last?.level === 'urgence' ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/dashboard/contact')}
            style={styles.analysisCta}
          >
            <Text style={styles.link}>Contacter un médecin</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </Pressable>
        ) : null}
        <Text style={styles.analysisNote}>
          Ce résumé est calculé sur ton appareil. L’analyse par IA sera branchée sur le serveur.
        </Text>
      </View>

      {/* ---------- Historique ---------- */}
      {recent.length > 0 ? (
        <View style={styles.historyBlock}>
          <Text style={styles.section}>Dernières évaluations</Text>
          <View style={styles.history}>
            {recent.map((entry, i) => {
              const meta = LEVEL_META[entry.level];
              return (
                <View key={entry.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                  <View style={styles.rowMain}>
                    <Text style={styles.rowDate}>{longDate(entry.date)}</Text>
                    <Badge label={meta.label} tone={meta.tone} />
                  </View>
                  <Text style={styles.rowIndex}>
                    {entry.index}
                    <Text style={styles.rowIndexSub}>/100</Text>
                  </Text>
                </View>
              );
            })}
          </View>
          <Pressable accessibilityRole="button" onPress={clearEvaluations} style={styles.clear}>
            <Text style={styles.clearText}>Effacer mon historique</Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={styles.disclaimer}>
        Ces courbes sont un repère issu de tes auto-évaluations. Elles ne remplacent pas l’avis d’un
        professionnel de santé.
      </Text>
    </View>
  );
}

function ChartCard({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      <Text style={styles.chartSub}>{sub}</Text>
      <View style={styles.chartBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },
  title: { fontFamily: 'Comfortaa_700Bold', fontSize: 28, color: colors.ink },
  lede: { fontFamily: 'Comfortaa_500Medium', fontSize: 14, lineHeight: 22, color: colors.inkSoft, marginTop: 8, maxWidth: 640 },

  hero: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
  },
  heroText: { flexGrow: 1, flexBasis: 240 },
  heroTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 18, color: '#FFFFFF' },
  heroSub: { fontFamily: 'Comfortaa_500Medium', fontSize: 13, lineHeight: 20, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.sand,
  },
  heroBtnText: { fontFamily: 'Comfortaa_700Bold', fontSize: 14, color: colors.primary },

  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 20 },
  stat: {
    flexGrow: 1,
    flexBasis: 180,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadow.soft,
  },
  statLabel: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 12, color: colors.muted },
  statValue: { fontFamily: 'Comfortaa_700Bold', fontSize: 32, color: colors.primary, marginTop: 6 },
  statSub: { fontFamily: 'Comfortaa_500Medium', fontSize: 12, color: colors.muted },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  trendText: { fontFamily: 'Comfortaa_700Bold', fontSize: 15, flexShrink: 1 },

  charts: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 20 },
  chartCard: {
    flexGrow: 1,
    flexBasis: 440,
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    ...shadow.soft,
  },
  chartTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 16, color: colors.ink },
  chartSub: { fontFamily: 'Comfortaa_500Medium', fontSize: 12, color: colors.muted, marginTop: 2 },
  chartBody: { marginTop: 14 },
  note: { fontFamily: 'Comfortaa_500Medium', fontSize: 12, color: colors.muted, marginTop: 12 },

  empty: {
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  emptyTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 16, color: colors.ink, textAlign: 'center' },
  emptyText: { fontFamily: 'Comfortaa_500Medium', fontSize: 13, color: colors.muted, textAlign: 'center' },

  analysis: {
    marginTop: 20,
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
  },
  analysisHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  analysisTitle: { fontFamily: 'Comfortaa_700Bold', fontSize: 15, color: colors.primary },
  analysisText: { fontFamily: 'Comfortaa_500Medium', fontSize: 14, lineHeight: 22, color: colors.ink, marginTop: 10 },
  analysisCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, alignSelf: 'flex-start' },
  analysisNote: { fontFamily: 'Comfortaa_500Medium', fontSize: 11, color: colors.inkSoft, marginTop: 14 },
  link: { fontFamily: 'Comfortaa_700Bold', fontSize: 13, color: colors.primary },

  historyBlock: { marginTop: 8 },
  section: { fontFamily: 'Comfortaa_700Bold', fontSize: 18, color: colors.ink, marginTop: 28, marginBottom: 14 },
  history: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  rowMain: { flex: 1, gap: 8, alignItems: 'flex-start' },
  rowDate: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 13, color: colors.inkSoft },
  rowIndex: { fontFamily: 'Comfortaa_700Bold', fontSize: 24, color: colors.primary },
  rowIndexSub: { fontFamily: 'Comfortaa_500Medium', fontSize: 12, color: colors.muted },
  clear: { alignSelf: 'flex-start', paddingVertical: 12 },
  clearText: { fontFamily: 'Comfortaa_600SemiBold', fontSize: 12, color: colors.muted },

  disclaimer: { fontFamily: 'Comfortaa_500Medium', fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 20 },
});