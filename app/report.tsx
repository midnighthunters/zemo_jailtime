import { useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';

import { AssetImage } from '@/src/components/AssetImage';
import { CharacterBubble } from '@/src/components/CharacterBubble';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { EvidenceCard } from '@/src/components/EvidenceCard';
import { ParoleMeter } from '@/src/components/ParoleMeter';
import { ProgressDocket } from '@/src/components/ProgressDocket';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { colors, radius, shadows } from '@/src/constants/theme';
import { Dialogues } from '@/src/data/dialogues';
import { COURT_RANKS, rankForPoints } from '@/src/data/ranks';
import { REWARD_CARDS } from '@/src/data/rewards';
import { useCourtStore } from '@/src/store/useCourtStore';

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
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      style={({ pressed }) => [styles.sectionToggle, pressed && styles.sectionTogglePressed]}
    >
      <View style={styles.toggleLeft}>
        <Text style={styles.sectionToggleTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionToggleSub}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.chevronWrap, { backgroundColor: `${accentColor}15` }]}> 
        <Image source={`sf:${expanded ? 'chevron.up' : 'chevron.down'}`} tintColor={accentColor} contentFit="contain" style={styles.chevron} />
      </View>
    </Pressable>
  );
}

export default function ReportScreen() {
  const router = useRouter();
  const [evidenceExpanded, setEvidenceExpanded] = useState(true);
  const [paroleExpanded, setParoleExpanded] = useState(true);

  const profile = useCourtStore((state) => state.profile);
  const suspects = useCourtStore((state) => state.suspects);
  const charges = useCourtStore((state) => state.charges);
  const paroleRecords = useCourtStore((state) => state.paroleRecords);

  const worst = [...suspects].sort((a, b) => b.dailyUsageMinutes - a.dailyUsageMinutes)[0];
  const worstName = worst?.displayName ?? 'your biggest distraction';
  const worstUsage = worst?.dailyUsageMinutes || 47;
  const paroleChance = Math.min(96, 34 + profile.parolePoints + profile.cleanRecordStreak * 6);
  const rank = rankForPoints(profile.parolePoints);
  const nextRank = COURT_RANKS.find((item) => item.minPoints > profile.parolePoints);
  const rankProgress = nextRank
    ? Math.min(100, (profile.parolePoints / nextRank.minPoints) * 100)
    : 100;

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="FOCUS REPORT"
          title="Trial Report"
          subtitle="The court's evidence, offender record, and rewards in one place."
          assetKey="ASSET_WEEKLY_TRIAL_REPORT"
        />

        <CourtCard variant="blue" assetKey="ASSET_CLEAN_RECORD_MEDAL">
          <ParoleMeter value={paroleChance} label="Parole readiness" />
        </CourtCard>

        <CharacterBubble
          assetKey="ASSET_OWL_JUSTICE_INSPECT"
          name="Owl Justice"
          line={Dialogues.owlJustice[1]}
        />

        <CourtCard variant="red">
          <Text style={styles.worstLabel}>WORST OFFENDER</Text>
          <Text style={styles.worstTitle}>{worstName}</Text>
          <Text style={styles.worstCopy}>
            Exhibit A: {worstUsage} minutes vanished into {worstName.toLowerCase()}.
          </Text>
        </CourtCard>

        <SectionToggle
          title="🔍  Trial Evidence"
          subtitle={`${charges.length} items`}
          expanded={evidenceExpanded}
          onToggle={() => setEvidenceExpanded((value) => !value)}
          accentColor={colors.orange}
        />

        {evidenceExpanded ? (
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
              text={`${worstUsage} minutes vanished into ${worstName.toLowerCase()}.`}
              severity={5}
              assetKey="ASSET_EXHIBIT_A_FILE"
            />
            <EvidenceCard
              exhibit="EXHIBIT B"
              text={`You opened ${worstName.toLowerCase()} ${worst?.dailyOpenCount || 9} times after warning.`}
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
        ) : null}

        <SectionToggle
          title="🏅  Parole & Rewards"
          subtitle={`${profile.parolePoints} points`}
          expanded={paroleExpanded}
          onToggle={() => setParoleExpanded((value) => !value)}
          accentColor={colors.green}
        />

        {paroleExpanded ? (
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
        ) : null}

        <CourtButton title="Close Report" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 40 },
  sectionTitle: { color: colors.label, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  worstLabel: { color: colors.red, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  worstTitle: { color: colors.label, fontSize: 22, fontWeight: '700', letterSpacing: -0.3, marginTop: 4 },
  worstCopy: { color: colors.labelSecondary, fontSize: 14, lineHeight: 20, fontWeight: '400', marginTop: 4 },
  sectionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    ...shadows.soft,
  },
  sectionTogglePressed: { transform: [{ translateY: 3 }], borderBottomWidth: 1.5, marginBottom: 2.5 },
  toggleLeft: { flex: 1, gap: 2 },
  sectionToggleTitle: { color: colors.label, fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  sectionToggleSub: { color: colors.labelSecondary, fontSize: 12, fontWeight: '400' },
  chevronWrap: { width: 28, height: 28, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  chevron: { width: 12, height: 12 },
  sectionBody: { gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { flex: 1, gap: 8 },
  infoTitle: { color: colors.label, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  infoCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  list: { gap: 10 },
  chartWrap: { marginTop: 8, borderRadius: radius.lg, backgroundColor: 'rgba(120,120,128,0.05)', overflow: 'hidden' },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportText: { flex: 1, gap: 8 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankEyebrow: { color: colors.greenDark, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  rankTitle: { color: colors.label, fontSize: 22, lineHeight: 26, fontWeight: '700', letterSpacing: -0.3 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rewardText: { flex: 1, gap: 4 },
  rewardTitle: { color: colors.label, fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  rewardCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  upgradeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historySection: { gap: 10 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
  },
  historyText: { flex: 1, gap: 3 },
  historyMessage: { color: colors.label, fontSize: 14, lineHeight: 19, fontWeight: '500' },
  historyPoints: { color: colors.greenDark, fontSize: 12, fontWeight: '600' },
});
