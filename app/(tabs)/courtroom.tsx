import { useState } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';

import { AssetImage } from '@/src/components/AssetImage';
import { CharacterBubble } from '@/src/components/CharacterBubble';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { EvidenceCard } from '@/src/components/EvidenceCard';
import { LawCard } from '@/src/components/LawCard';
import { ParoleMeter } from '@/src/components/ParoleMeter';
import { ProgressDocket } from '@/src/components/ProgressDocket';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { SuspectAppCard } from '@/src/components/SuspectAppCard';
import { colors, radius, shadows } from '@/src/constants/theme';
import { Dialogues } from '@/src/data/dialogues';
import { COURT_RANKS, rankForPoints } from '@/src/data/ranks';
import { REWARD_CARDS } from '@/src/data/rewards';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import { statusLabel } from '@/src/utils/sentence';
import type { AppCategory } from '@/src/types/court';

// ─── Chart ───────────────────────────────────────────────────────────────────
function CrimeDistributionChart() {
  const suspects = useCourtStore((state) => state.suspects);
  const sorted = [...suspects]
    .sort((a, b) => b.dailyUsageMinutes - a.dailyUsageMinutes)
    .slice(0, 4);
  const max = Math.max(20, ...sorted.map((item) => item.dailyUsageMinutes));

  return (
    <Svg width="100%" height={140} viewBox="0 0 320 140">
      {sorted.map((item, index) => {
        const height = Math.max(16, (item.dailyUsageMinutes / max) * 80);
        const x = 24 + index * 74;
        return (
          <G key={item.id}>
            <Rect x={x} y={100 - height} width={44} height={height} rx={10} fill={item.iconColor} opacity={0.85} />
            <SvgText x={x + 22} y={122} fill="rgba(60,60,67,0.6)" fontSize={10} fontWeight="600" textAnchor="middle">
              {item.displayName.split(' ')[0]}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────
function SectionToggle({
  title,
  subtitle,
  expanded,
  onToggle,
  accentColor = colors.blue,
}: {
  title: string;
  subtitle?: string;
  expanded: boolean;
  onToggle: () => void;
  accentColor?: string;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onToggle}
      onPressIn={() => { scale.value = withSpring(0.977, { damping: 18, stiffness: 380 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 13, stiffness: 260 }); }}
    >
      <Animated.View style={[styles.sectionToggle, animStyle]}>
        {Platform.OS !== 'web' ? (
          <BlurView
            blurType="systemUltraThinMaterial"
            blurAmount={18}
            style={StyleSheet.absoluteFillObject}
            reducedTransparencyFallbackColor="rgba(255,255,255,0.72)"
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.72)' }]} />
        )}
        <View style={[StyleSheet.absoluteFillObject, styles.sectionToggleTint]} />
        <View style={styles.sectionToggleHighlight} />
        <View style={styles.sectionToggleBorder} />

        <View style={styles.toggleLeft}>
          <Text style={styles.sectionToggleTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionToggleSub}>{subtitle}</Text> : null}
        </View>
        <View style={[styles.chevronWrap, { backgroundColor: `${accentColor}15` }]}>
          <Text style={[styles.chevron, { color: accentColor }]}>
            {expanded ? '▲' : '▼'}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const lawFilters: Array<AppCategory | 'all'> = [
  'all', 'shortVideo', 'social', 'video', 'game', 'shopping', 'dating', 'news', 'custom',
];

export default function CourtroomTab() {
  const router = useRouter();

  // ── store ──────────────────────────────────────────────────────────────────
  const activeCase = useCourtStore((state) => state.activeCase);
  const profile = useCourtStore((state) => state.profile);
  const suspects = useCourtStore((state) => state.suspects);
  const charges = useCourtStore((state) => state.charges);
  const laws = useCourtStore((state) => state.laws);
  const paroleRecords = useCourtStore((state) => state.paroleRecords);
  const simulateAppOpen = useCourtStore((state) => state.simulateAppOpen);
  const resetCourtDay = useCourtStore((state) => state.resetCourtDay);
  const toggleLaw = useCourtStore((state) => state.toggleLaw);
  const isPro = usePremiumStore((state) => state.isPro);

  // ── local state ────────────────────────────────────────────────────────────
  const [lawsExpanded, setLawsExpanded] = useState(false);
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);
  const [paroleExpanded, setParoleExpanded] = useState(false);
  const [lawFilter, setLawFilter] = useState<AppCategory | 'all'>('all');

  // ── derived ────────────────────────────────────────────────────────────────
  const selectedSuspects = suspects.filter((s) => s.isSelected);
  const worst = [...suspects].sort((a, b) => b.dailyUsageMinutes - a.dailyUsageMinutes)[0];
  const paroleChance = Math.min(96, 34 + profile.parolePoints + profile.cleanRecordStreak * 6);
  const statusTone =
    activeCase.status === 'jailed' || activeCase.status === 'charged'
      ? 'danger'
      : activeCase.status === 'parole'
      ? 'success'
      : 'blue';
  const visibleLaws =
    lawFilter === 'all' ? laws : laws.filter((l) => l.category === lawFilter || l.category === 'all');
  const rank = rankForPoints(profile.parolePoints);
  const nextRank = COURT_RANKS.find((item) => item.minPoints > profile.parolePoints);
  const rankProgress = nextRank
    ? Math.min(100, (profile.parolePoints / nextRank.minPoints) * 100)
    : 100;

  return (
    <CourtBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <ScreenHeader
          eyebrow="FOCUS COURT"
          title="Courtroom"
          subtitle="Case #042: The People vs. Your Screen Habits"
          assetKey="ASSET_APP_LOGO_FOCUS_COURT"
        />

        {/* ── Hero case card ───────────────────────────────────────── */}
        <CourtCard variant="glass" style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <StampBadge label={statusLabel(activeCase.status)} tone={statusTone} />
              <Text style={styles.caseTitle}>{activeCase.title}</Text>
              <Text style={styles.caseCopy}>The court is watching your focus record.</Text>
            </View>
            <AssetImage assetKey="ASSET_JUDGE_LION_GAVEL" width={130} height={130} />
          </View>
          <View style={styles.bench}>
            <AssetImage
              assetKey={
                activeCase.status === 'jailed'
                  ? 'ASSET_DEFENDANT_JAIL_BARS'
                  : 'ASSET_DEFENDANT_NERVOUS'
              }
              width={110}
              height={110}
            />
            <AssetImage assetKey="ASSET_PROSECUTOR_FOX_POINT" width={92} height={92} />
            <AssetImage assetKey="ASSET_EVIDENCE_BOARD_SCREEN_TIME" width={92} height={92} />
          </View>
        </CourtCard>

        {/* ── Stats docket ─────────────────────────────────────────── */}
        <ProgressDocket
          items={[
            { label: 'Clean streak', value: profile.cleanRecordStreak },
            { label: 'Focus coins', value: profile.focusCoins },
            { label: 'Charges', value: charges.length },
          ]}
        />

        {/* ── Parole meter ─────────────────────────────────────────── */}
        <CourtCard variant="blue" assetKey="ASSET_CLEAN_RECORD_MEDAL">
          <ParoleMeter value={paroleChance} label="Parole readiness" />
        </CourtCard>

        {/* ── Character tip ────────────────────────────────────────── */}
        <CharacterBubble
          assetKey="ASSET_OWL_JUSTICE_INSPECT"
          name="Owl Justice"
          line={Dialogues.owlJustice[1]}
        />

        {/* ── Simulate / Reset ─────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Simulate App Open</Text>
            <CourtButton title="Reset Day" variant="ghost" small onPress={resetCourtDay} />
          </View>
          <View style={styles.suspects}>
            {selectedSuspects.map((suspect) => (
              <SuspectAppCard
                key={suspect.id}
                suspect={suspect}
                onPress={() => {
                  const charge = simulateAppOpen(suspect.id);
                  if (charge) router.push('/modals/charges-filed');
                }}
              />
            ))}
          </View>
        </View>

        {/* ── Worst offender preview ───────────────────────────────── */}
        <CourtCard variant="red">
          <Text style={styles.worstLabel}>WORST OFFENDER</Text>
          <Text style={styles.worstTitle}>{worst.displayName}</Text>
          <Text style={styles.worstCopy}>
            Exhibit A: {worst.dailyUsageMinutes || 47} minutes vanished into{' '}
            {worst.displayName.toLowerCase()}.
          </Text>
        </CourtCard>

        {/* ════════════════════════════════════════════════════════════
            ── LAWS SECTION ─────────────────────────────────────────
            ════════════════════════════════════════════════════════════ */}
        <SectionToggle
          title="⚖️  Focus Laws"
          subtitle={`${laws.filter((l) => l.isEnabled).length} active`}
          expanded={lawsExpanded}
          onToggle={() => setLawsExpanded((v) => !v)}
          accentColor={colors.blue}
        />

        {lawsExpanded && (
          <View style={styles.sectionBody}>
            <CourtCard variant="purple">
              <View style={styles.infoRow}>
                <View style={styles.infoText}>
                  <StampBadge label="Free limit: 3 laws" tone="purple" />
                  <Text style={styles.infoTitle}>
                    {laws.filter((l) => l.isEnabled).length} active laws
                  </Text>
                  <Text style={styles.infoCopy}>
                    {laws.filter((l) => l.isEnabled && l.enforcementMode === 'hardBlock').length} hard
                    blocks. Pro unlocks unlimited laws.
                  </Text>
                </View>
                <AssetImage assetKey="ASSET_STRICT_MODE_LOCK" width={88} height={88} />
              </View>
            </CourtCard>

            {/* Filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {lawFilters.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setLawFilter(item)}
                  style={[styles.filterChip, lawFilter === item && styles.filterChipActive]}
                >
                  <Text
                    style={[styles.filterChipText, lawFilter === item && styles.filterChipTextActive]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.quickRow}>
              <CourtButton
                title="Screen Time Setup"
                variant="secondary"
                small
                onPress={() => router.push('/modals/screen-time-settings')}
              />
              <CourtButton
                title="Custom Law"
                variant="secondary"
                small
                onPress={() => router.push('/modals/law-editor')}
              />
              <CourtButton
                title="Upgrade"
                variant="primary"
                small
                onPress={() => router.push('/modals/paywall')}
              />
            </View>

            <View style={styles.list}>
              {visibleLaws.map((law) => (
                <LawCard
                  key={law.id}
                  law={law}
                  locked={law.isPremium && !isPro}
                  onToggle={() => {
                    const result = toggleLaw(law.id, isPro);
                    if (!result.allowed) router.push('/modals/paywall');
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════
            ── EVIDENCE SECTION ─────────────────────────────────────
            ════════════════════════════════════════════════════════════ */}
        <SectionToggle
          title="🔍  Trial Evidence"
          subtitle={`${charges.length} items`}
          expanded={evidenceExpanded}
          onToggle={() => setEvidenceExpanded((v) => !v)}
          accentColor={colors.orange}
        />

        {evidenceExpanded && (
          <View style={styles.sectionBody}>
            <CourtCard variant="glass">
              <View style={styles.infoRow}>
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>Today's charges</Text>
                  <Text style={styles.infoCopy}>
                    {charges.length
                      ? `${charges.length} evidence items prepared.`
                      : 'No charges filed today.'}
                  </Text>
                </View>
                <AssetImage assetKey="ASSET_OWL_JUSTICE_INSPECT" width={92} height={92} />
              </View>
              <View style={styles.chartWrap}>
                <CrimeDistributionChart />
              </View>
            </CourtCard>

            <EvidenceCard
              exhibit="EXHIBIT A"
              text={`${worst.dailyUsageMinutes || 47} minutes vanished into ${worst.displayName.toLowerCase()}.`}
              severity={5}
              assetKey="ASSET_EXHIBIT_A_FILE"
            />
            <EvidenceCard
              exhibit="EXHIBIT B"
              text={`You opened ${worst.displayName.toLowerCase()} ${worst.dailyOpenCount || 9} times after warning.`}
              severity={4}
              assetKey="ASSET_REPEAT_OFFENDER_APP"
            />
            <EvidenceCard
              exhibit="EXHIBIT C"
              text="Sleep was robbed at 2:34 AM."
              severity={4}
              assetKey="ASSET_EVIDENCE_LOST_SLEEP"
            />
            <EvidenceCard
              exhibit="EXHIBIT D"
              text="Your gym plan was delayed by scrolling."
              severity={3}
              assetKey="ASSET_EVIDENCE_SKIPPED_GOALS"
            />
            <EvidenceCard
              exhibit="DANGER HOUR"
              text="The worst hour is becoming obvious. The court recommends a lockdown window."
              severity={3}
              assetKey="ASSET_DANGER_HOURS_CLOCK"
            />
            <EvidenceCard
              exhibit="DREAMS DELAYED"
              text="Every tap can steal sleep, focus, and dreams."
              severity={2}
              assetKey="ASSET_DREAMS_DELAYED_BOARD"
            />

            <CourtCard variant="purple">
              <View style={styles.reportRow}>
                <AssetImage assetKey="ASSET_WEEKLY_TRIAL_REPORT" width={80} height={80} />
                <View style={styles.reportText}>
                  <Text style={styles.infoTitle}>Weekly Trial Report</Text>
                  <Text style={styles.infoCopy}>Advanced reports require Pro.</Text>
                  <CourtButton
                    title="Open Report"
                    variant="primary"
                    small
                    onPress={() => router.push('/modals/weekly-report')}
                  />
                </View>
              </View>
            </CourtCard>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════
            ── PAROLE SECTION ───────────────────────────────────────
            ════════════════════════════════════════════════════════════ */}
        <SectionToggle
          title="🏅  Parole & Rewards"
          subtitle={`${profile.parolePoints} points`}
          expanded={paroleExpanded}
          onToggle={() => setParoleExpanded((v) => !v)}
          accentColor={colors.green}
        />

        {paroleExpanded && (
          <View style={styles.sectionBody}>
            <CourtCard variant="green">
              <View style={styles.rankRow}>
                <View style={styles.infoText}>
                  <Text style={styles.rankEyebrow}>CURRENT RANK</Text>
                  <Text style={styles.rankTitle}>{rank.name}</Text>
                  <ParoleMeter
                    value={rankProgress}
                    label={nextRank ? `Next: ${nextRank.name}` : 'Supreme rank'}
                  />
                </View>
                <AssetImage assetKey="ASSET_SUPREME_FOCUS_TROPHY" width={96} height={96} />
              </View>
            </CourtCard>

            <ProgressDocket
              items={[
                { label: 'Parole points', value: profile.parolePoints },
                { label: 'Focus coins', value: profile.focusCoins },
                { label: 'Clean streak', value: profile.cleanRecordStreak },
              ]}
            />

            <View style={styles.list}>
              {REWARD_CARDS.map((reward) => (
                <CourtCard key={reward.title} variant="glass">
                  <View style={styles.rewardRow}>
                    <AssetImage assetKey={reward.assetKey} width={68} height={68} />
                    <View style={styles.rewardText}>
                      <Text style={styles.rewardTitle}>{reward.title}</Text>
                      <Text style={styles.rewardCopy}>{reward.copy}</Text>
                    </View>
                  </View>
                </CourtCard>
              ))}
            </View>

            <CourtCard variant="orange">
              <View style={styles.upgradeRow}>
                <AssetImage assetKey="ASSET_COURTROOM_UPGRADE_BENCH" width={76} height={76} />
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>Courtroom Upgrades</Text>
                  <Text style={styles.infoCopy}>
                    Pro unlocks stronger laws, better reports, and real blocking features.
                  </Text>
                  <CourtButton
                    title="Upgrade Authority"
                    variant="primary"
                    small
                    onPress={() => router.push('/modals/paywall')}
                  />
                </View>
              </View>
            </CourtCard>

            {/* Parole history */}
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Recent Parole History</Text>
              {paroleRecords.slice(0, 5).map((record) => (
                <View key={record.id} style={styles.historyItem}>
                  <AssetImage assetKey="ASSET_BROKEN_CHAIN_FREEDOM" width={38} height={38} />
                  <View style={styles.historyText}>
                    <Text style={styles.historyMessage}>{record.message}</Text>
                    <Text style={styles.historyPoints}>+{record.pointsEarned} parole points</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 110,
  },

  // ── hero ──
  hero: { minHeight: 260 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroCopy: { flex: 1, gap: 10 },
  caseTitle: { color: colors.label, fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  caseCopy: { color: colors.labelSecondary, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  bench: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', marginTop: 8 },

  // ── section ──
  section: { gap: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.label, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  suspects: { gap: 10 },

  // ── worst offender ──
  worstLabel: { color: colors.red, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  worstTitle: { color: colors.label, fontSize: 22, fontWeight: '700', letterSpacing: -0.3, marginTop: 4 },
  worstCopy: { color: colors.labelSecondary, fontSize: 14, lineHeight: 20, fontWeight: '400', marginTop: 4 },

  // ── section toggle ──
  sectionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.soft,
  },
  sectionToggleTint: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
  },
  sectionToggleHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sectionToggleBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pressed: { opacity: 0.82 },
  toggleLeft: { flex: 1, gap: 2 },
  sectionToggleTitle: { color: colors.label, fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  sectionToggleSub: { color: colors.labelSecondary, fontSize: 12, fontWeight: '400' },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { fontSize: 11, fontWeight: '700' },

  // ── section body ──
  sectionBody: { gap: 12 },

  // ── info rows inside cards ──
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { flex: 1, gap: 8 },
  infoTitle: { color: colors.label, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  infoCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },

  // ── filter chips ──
  filterRow: { gap: 8, paddingVertical: 2 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  filterChipActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  filterChipText: { color: colors.labelSecondary, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: colors.white },

  // ── quick action row ──
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // ── list ──
  list: { gap: 10 },

  // ── chart ──
  chartWrap: {
    marginTop: 8,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(120,120,128,0.05)',
    overflow: 'hidden',
  },

  // ── report ──
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportText: { flex: 1, gap: 8 },

  // ── parole / rank ──
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankEyebrow: { color: colors.greenDark, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  rankTitle: { color: colors.label, fontSize: 22, lineHeight: 26, fontWeight: '700', letterSpacing: -0.3 },

  // ── rewards ──
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rewardText: { flex: 1, gap: 4 },
  rewardTitle: { color: colors.label, fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  rewardCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },

  // ── upgrade ──
  upgradeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // ── history ──
  historySection: { gap: 10 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  historyText: { flex: 1, gap: 3 },
  historyMessage: { color: colors.label, fontSize: 14, lineHeight: 19, fontWeight: '500' },
  historyPoints: { color: colors.greenDark, fontSize: 12, fontWeight: '600' },
});
