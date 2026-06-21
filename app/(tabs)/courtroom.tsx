import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { colors, radius } from '@/src/constants/theme';
import { Dialogues } from '@/src/data/dialogues';
import { COURT_RANKS, rankForPoints } from '@/src/data/ranks';
import { REWARD_CARDS } from '@/src/data/rewards';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import { statusLabel } from '@/src/utils/sentence';
import type { AppCategory } from '@/src/types/court';

// ─── Evidence chart (moved from evidence.tsx) ────────────────────────────────
function CrimeDistributionChart() {
  const suspects = useCourtStore((state) => state.suspects);
  const sorted = [...suspects].sort((a, b) => b.dailyUsageMinutes - a.dailyUsageMinutes).slice(0, 4);
  const max = Math.max(20, ...sorted.map((item) => item.dailyUsageMinutes));
  return (
    <Svg width="100%" height={150} viewBox="0 0 320 150">
      {sorted.map((item, index) => {
        const height = Math.max(18, (item.dailyUsageMinutes / max) * 88);
        const x = 24 + index * 74;
        return (
          <G key={item.id}>
            <Rect x={x} y={110 - height} width={42} height={height} rx={10} fill={item.iconColor} />
            <SvgText x={x + 21} y={132} fill="#FFF2D2" fontSize={10} fontWeight="900" textAnchor="middle">
              {item.displayName.split(' ')[0]}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ─── Collapsible section header ───────────────────────────────────────────────
function SectionToggle({ title, expanded, onToggle }: { title: string; expanded: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={styles.sectionToggle}>
      <Text style={styles.sectionToggleTitle}>{title}</Text>
      <Text style={styles.sectionToggleArrow}>{expanded ? '▲' : '▼'}</Text>
    </Pressable>
  );
}

const lawFilters: Array<AppCategory | 'all'> = ['all', 'shortVideo', 'social', 'video', 'game', 'shopping', 'dating', 'news', 'custom'];

export default function CourtroomTab() {
  const router = useRouter();
  // ─── store ───────────────────────────────────────────────────────────────
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

  // ─── local state ─────────────────────────────────────────────────────────
  const [lawsExpanded, setLawsExpanded] = useState(false);
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);
  const [paroleExpanded, setParoleExpanded] = useState(false);
  const [lawFilter, setLawFilter] = useState<AppCategory | 'all'>('all');

  // ─── derived ─────────────────────────────────────────────────────────────
  const selectedSuspects = suspects.filter((s) => s.isSelected);
  const worst = [...suspects].sort((a, b) => b.dailyUsageMinutes - a.dailyUsageMinutes)[0];
  const paroleChance = Math.min(96, 34 + profile.parolePoints + profile.cleanRecordStreak * 6);
  const statusTone = activeCase.status === 'jailed' || activeCase.status === 'charged' ? 'danger' : activeCase.status === 'parole' ? 'success' : 'gold';
  const visibleLaws = lawFilter === 'all' ? laws : laws.filter((l) => l.category === lawFilter || l.category === 'all');
  const rank = rankForPoints(profile.parolePoints);
  const nextRank = COURT_RANKS.find((item) => item.minPoints > profile.parolePoints);
  const rankProgress = nextRank ? Math.min(100, (profile.parolePoints / nextRank.minPoints) * 100) : 100;

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ── Original Courtroom Header ─────────────────────────────── */}
        <ScreenHeader
          eyebrow="FOCUS COURT"
          title="Courtroom"
          subtitle="Case #042: The People vs. Your Screen Habits"
          assetKey="ASSET_APP_LOGO_FOCUS_COURT"
        />

        <CourtCard variant="dark" style={styles.hero} delay={80}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <StampBadge label={statusLabel(activeCase.status)} tone={statusTone} />
              <Text style={styles.caseTitle}>{activeCase.title}</Text>
              <Text style={styles.caseCopy}>The court is watching your focus record.</Text>
            </View>
            <AssetImage assetKey="ASSET_JUDGE_LION_GAVEL" width={148} height={148} />
          </View>
          <View style={styles.bench}>
            <AssetImage assetKey={activeCase.status === 'jailed' ? 'ASSET_DEFENDANT_JAIL_BARS' : 'ASSET_DEFENDANT_NERVOUS'} width={128} height={128} />
            <AssetImage assetKey="ASSET_PROSECUTOR_FOX_POINT" width={106} height={106} />
            <AssetImage assetKey="ASSET_EVIDENCE_BOARD_SCREEN_TIME" width={106} height={106} />
          </View>
        </CourtCard>

        <ProgressDocket
          items={[
            { label: 'Clean streak', value: profile.cleanRecordStreak },
            { label: 'Focus coins', value: profile.focusCoins },
            { label: 'Charges', value: charges.length },
          ]}
        />

        <CourtCard variant="wood" assetKey="ASSET_CLEAN_RECORD_MEDAL" delay={180}>
          <ParoleMeter value={paroleChance} label="Parole readiness" />
        </CourtCard>

        <CharacterBubble assetKey="ASSET_OWL_JUSTICE_INSPECT" name="Owl Justice" line={Dialogues.owlJustice[1]} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Simulate App Open</Text>
            <CourtButton title="Reset Day" variant="ghost" small onPress={resetCourtDay} />
          </View>
          <View style={styles.suspects}>
            {selectedSuspects.map((suspect, index) => (
              <SuspectAppCard
                key={suspect.id}
                suspect={suspect}
                delay={220 + index * 45}
                onPress={() => {
                  const charge = simulateAppOpen(suspect.id);
                  if (charge) router.push('/modals/charges-filed');
                }}
              />
            ))}
          </View>
        </View>

        <CourtCard variant="parchment" delay={260}>
          <Text style={styles.darkLabel}>WORST OFFENDER PREVIEW</Text>
          <Text style={styles.darkTitle}>{worst.displayName}</Text>
          <Text style={styles.darkCopy}>Exhibit A: {worst.dailyUsageMinutes || 47} minutes vanished into {worst.displayName.toLowerCase()}.</Text>
        </CourtCard>

        {/* ════════════════════════════════════════════════════════════
            ── LAWS SECTION (merged from laws.tsx) ──────────────────
            ════════════════════════════════════════════════════════════ */}
        <SectionToggle title="⚖️  Focus Laws" expanded={lawsExpanded} onToggle={() => setLawsExpanded((v) => !v)} />

        {lawsExpanded && (
          <View style={styles.sectionBody}>
            <CourtCard variant="purple" delay={0}>
              <View style={styles.heroRow}>
                <View style={styles.heroText}>
                  <StampBadge label="Free limit: 3 laws" tone="gold" />
                  <Text style={styles.heroTitle}>{laws.filter((l) => l.isEnabled).length} active laws</Text>
                  <Text style={styles.heroCopy}>
                    {laws.filter((l) => l.isEnabled && l.enforcementMode === 'hardBlock').length} hard blocks.
                    Supreme Court Mode unlocks unlimited laws.
                  </Text>
                </View>
                <AssetImage assetKey="ASSET_STRICT_MODE_LOCK" width={100} height={100} />
              </View>
            </CourtCard>

            <View style={styles.filterRow}>
              {lawFilters.map((item) => (
                <Pressable key={item} onPress={() => setLawFilter(item)} style={[styles.filter, lawFilter === item && styles.filterActive]}>
                  <Text style={[styles.filterText, lawFilter === item && styles.filterTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.quickSettings}>
              <CourtButton title="Screen Time Setup" variant="purple" small onPress={() => router.push('/modals/screen-time-settings')} />
              <CourtButton title="Custom Law" variant="wood" small onPress={() => router.push('/modals/law-editor')} />
              <CourtButton title="Upgrade" variant="gold" small onPress={() => router.push('/modals/paywall')} />
            </View>

            <View style={styles.list}>
              {visibleLaws.map((law, index) => (
                <LawCard
                  key={law.id}
                  law={law}
                  locked={law.isPremium && !isPro}
                  delay={index * 35}
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
            ── EVIDENCE SECTION (merged from evidence.tsx) ──────────
            ════════════════════════════════════════════════════════════ */}
        <SectionToggle title="🔍  Trial Evidence" expanded={evidenceExpanded} onToggle={() => setEvidenceExpanded((v) => !v)} />

        {evidenceExpanded && (
          <View style={styles.sectionBody}>
            <CourtCard variant="dark" delay={0}>
              <View style={styles.boardTop}>
                <View style={styles.boardText}>
                  <Text style={styles.boardTitle}>Today's charges</Text>
                  <Text style={styles.boardCopy}>{charges.length ? `${charges.length} evidence items prepared.` : 'No charges filed today.'}</Text>
                </View>
                <AssetImage assetKey="ASSET_OWL_JUSTICE_INSPECT" width={112} height={112} />
              </View>
              <View style={styles.chart}>
                <CrimeDistributionChart />
              </View>
            </CourtCard>

            <EvidenceCard exhibit="EXHIBIT A" text={`Exhibit A: ${worst.dailyUsageMinutes || 47} minutes vanished into ${worst.displayName.toLowerCase()}.`} severity={5} assetKey="ASSET_EXHIBIT_A_FILE" delay={40} />
            <EvidenceCard exhibit="EXHIBIT B" text={`You opened ${worst.displayName.toLowerCase()} ${worst.dailyOpenCount || 9} times after warning.`} severity={4} assetKey="ASSET_REPEAT_OFFENDER_APP" delay={80} />
            <EvidenceCard exhibit="EXHIBIT C" text="Sleep was robbed at 2:34 AM." severity={4} assetKey="ASSET_EVIDENCE_LOST_SLEEP" delay={120} />
            <EvidenceCard exhibit="EXHIBIT D" text="Your gym plan was delayed by scrolling." severity={3} assetKey="ASSET_EVIDENCE_SKIPPED_GOALS" delay={160} />
            <EvidenceCard exhibit="DANGER HOUR" text="The worst hour is becoming obvious. The court recommends a lockdown window." severity={3} assetKey="ASSET_DANGER_HOURS_CLOCK" delay={200} />
            <EvidenceCard exhibit="DREAMS DELAYED" text="Every tap can steal sleep, focus, and dreams." severity={2} assetKey="ASSET_DREAMS_DELAYED_BOARD" delay={240} />

            <CourtCard variant="purple" delay={280}>
              <View style={styles.reportRow}>
                <AssetImage assetKey="ASSET_WEEKLY_TRIAL_REPORT" width={92} height={92} />
                <View style={styles.reportText}>
                  <Text style={styles.reportTitle}>Weekly Trial Report</Text>
                  <Text style={styles.reportCopy}>Advanced evidence reports require Supreme Court Mode.</Text>
                  <CourtButton title="Open Report" variant="gold" small onPress={() => router.push('/modals/weekly-report')} />
                </View>
              </View>
            </CourtCard>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════
            ── PAROLE SECTION (merged from parole.tsx) ──────────────
            ════════════════════════════════════════════════════════════ */}
        <SectionToggle title="🏅  Parole & Rewards" expanded={paroleExpanded} onToggle={() => setParoleExpanded((v) => !v)} />

        {paroleExpanded && (
          <View style={styles.sectionBody}>
            <CourtCard variant="dark" delay={0}>
              <View style={styles.paroleHero}>
                <View style={styles.heroText}>
                  <Text style={styles.rankLabel}>CURRENT RANK</Text>
                  <Text style={styles.rank}>{rank.name}</Text>
                  <ParoleMeter value={rankProgress} label={nextRank ? `Next: ${nextRank.name}` : 'Supreme rank'} />
                </View>
                <AssetImage assetKey="ASSET_SUPREME_FOCUS_TROPHY" width={110} height={110} />
              </View>
            </CourtCard>

            <ProgressDocket
              items={[
                { label: 'Parole points', value: profile.parolePoints },
                { label: 'Focus coins', value: profile.focusCoins },
                { label: 'Clean streak', value: profile.cleanRecordStreak },
              ]}
            />

            <View style={styles.rewards}>
              {REWARD_CARDS.map((reward, index) => (
                <CourtCard key={reward.title} variant="parchment" delay={index * 45}>
                  <View style={styles.rewardRow}>
                    <AssetImage assetKey={reward.assetKey} width={76} height={76} />
                    <View style={styles.rewardText}>
                      <Text style={styles.rewardTitle}>{reward.title}</Text>
                      <Text style={styles.rewardCopy}>{reward.copy}</Text>
                    </View>
                  </View>
                </CourtCard>
              ))}
            </View>

            <CourtCard variant="wood" delay={200}>
              <View style={styles.upgradeRow}>
                <AssetImage assetKey="ASSET_COURTROOM_UPGRADE_BENCH" width={88} height={88} />
                <View style={styles.upgradeText}>
                  <Text style={styles.upgradeTitle}>Courtroom Upgrades Preview</Text>
                  <Text style={styles.upgradeCopy}>Supreme Court Mode unlocks stronger laws, better reports, and future real blocking features.</Text>
                  <CourtButton title="Upgrade Authority" variant="gold" small onPress={() => router.push('/modals/paywall')} />
                </View>
              </View>
            </CourtCard>

            <View style={styles.history}>
              <Text style={styles.sectionTitle}>Recent Parole History</Text>
              {paroleRecords.slice(0, 5).map((record, index) => (
                <View key={record.id} style={styles.historyItem}>
                  <AssetImage assetKey="ASSET_BROKEN_CHAIN_FREEDOM" width={44} height={44} />
                  <View style={styles.historyText}>
                    <Text style={styles.historyMessage}>{record.message}</Text>
                    <Text style={styles.historyPoints}>+{record.pointsEarned} parole points</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 112 },
  // ── original courtroom styles ──
  hero: { minHeight: 300 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroCopy: { flex: 1, gap: 10 },
  caseTitle: { color: colors.cream, fontSize: 24, lineHeight: 29, fontWeight: '900' },
  caseCopy: { color: colors.parchment, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  bench: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -4 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sectionTitle: { color: colors.cream, fontSize: 19, fontWeight: '900' },
  suspects: { gap: 9 },
  darkLabel: { color: colors.danger, fontSize: 12, fontWeight: '900' },
  darkTitle: { color: colors.ink, fontSize: 22, fontWeight: '900' },
  darkCopy: { color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '800' },
  // ── section toggle ──
  sectionToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,242,210,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,200,61,0.22)',
  },
  sectionToggleTitle: { color: colors.cream, fontSize: 17, fontWeight: '900' },
  sectionToggleArrow: { color: colors.gold, fontSize: 13, fontWeight: '900' },
  sectionBody: { gap: 12 },
  // ── laws section ──
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroText: { flex: 1, gap: 8 },
  heroTitle: { color: colors.cream, fontSize: 22, fontWeight: '900' },
  heroCopy: { color: colors.parchment, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: 'rgba(255,242,210,0.1)' },
  filterActive: { backgroundColor: colors.gold },
  filterText: { color: colors.cream, fontSize: 12, fontWeight: '900' },
  filterTextActive: { color: colors.ink },
  quickSettings: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  list: { gap: 10 },
  // ── evidence section ──
  boardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  boardText: { flex: 1, gap: 6 },
  boardTitle: { color: colors.cream, fontSize: 22, fontWeight: '900' },
  boardCopy: { color: colors.parchment, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  chart: { marginTop: 10, borderRadius: radius.lg, backgroundColor: 'rgba(255,242,210,0.08)', overflow: 'hidden' },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportText: { flex: 1, gap: 8 },
  reportTitle: { color: colors.cream, fontSize: 19, fontWeight: '900' },
  reportCopy: { color: colors.parchment, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  // ── parole section ──
  paroleHero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankLabel: { color: colors.gold, fontSize: 12, fontWeight: '900' },
  rank: { color: colors.cream, fontSize: 22, lineHeight: 26, fontWeight: '900' },
  rewards: { gap: 10 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rewardText: { flex: 1, gap: 4 },
  rewardTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  rewardCopy: { color: colors.ink, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  upgradeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  upgradeText: { flex: 1, gap: 7 },
  upgradeTitle: { color: colors.cream, fontSize: 18, fontWeight: '900' },
  upgradeCopy: { color: colors.parchment, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  history: { gap: 10 },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,242,210,0.1)' },
  historyText: { flex: 1, gap: 3 },
  historyMessage: { color: colors.cream, fontSize: 13, lineHeight: 18, fontWeight: '800' },
  historyPoints: { color: colors.gold, fontSize: 11, fontWeight: '900' },
});
