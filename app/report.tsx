import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
import { formatMinutes } from '@/src/utils/format';

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
      <View style={[styles.disclosureWrap, { backgroundColor: `${accentColor}15` }]}>
        <Text style={[styles.disclosureLabel, { color: accentColor }]}>
          {expanded ? 'Hide' : 'Show'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ReportScreen() {
  const router = useRouter();
  const [evidenceExpanded, setEvidenceExpanded] = useState(true);
  const [paroleExpanded, setParoleExpanded] = useState(true);

  const profile = useCourtStore((state) => state.profile);
  const appSelection = useCourtStore((state) => state.appSelection);
  const cases = useCourtStore((state) => state.cases);
  const paroleRecords = useCourtStore((state) => state.paroleRecords);

  const protectedCount =
    appSelection.applications + appSelection.categories + appSelection.webDomains;
  const repeatLaw = [...cases]
    .map((item) => ({ item, count: cases.filter((c) => c.lawId === item.lawId).length }))
    .sort((a, b) => b.count - a.count)[0];
  const focusServedMinutes = Math.round(
    cases.reduce((sum, item) => sum + item.focusServedSeconds, 0) / 60,
  );
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

        <CourtCard variant={repeatLaw ? 'red' : 'green'}>
          <Text style={styles.worstLabel}>
            {repeatLaw ? 'MOST BROKEN LAW' : 'CLEAN RECORD'}
          </Text>
          <Text style={styles.worstTitle}>
            {repeatLaw ? repeatLaw.item.lawName : 'Nothing broken today'}
          </Text>
          <Text style={styles.worstCopy}>
            {repeatLaw
              ? `Filed ${repeatLaw.count} time${repeatLaw.count === 1 ? '' : 's'} today. You have served ${formatMinutes(focusServedMinutes)} of focus.`
              : `${protectedCount} selection${protectedCount === 1 ? '' : 's'} under court order and no case on the docket.`}
          </Text>
        </CourtCard>

        <SectionToggle
          title="Trial Evidence"
          subtitle={`${cases.length} case${cases.length === 1 ? '' : 's'} today`}
          expanded={evidenceExpanded}
          onToggle={() => setEvidenceExpanded((value) => !value)}
          accentColor={colors.orange}
        />

        {evidenceExpanded ? (
          <View style={styles.sectionBody}>
            <CourtCard variant="glass">
              <View style={styles.infoRow}>
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>Today's docket</Text>
                  <Text style={styles.infoCopy}>
                    {cases.length
                      ? `${cases.length} case${cases.length === 1 ? '' : 's'} on file.`
                      : 'No case filed today.'}
                  </Text>
                </View>
                <AssetImage assetKey="ASSET_OWL_JUSTICE_INSPECT" width={92} height={92} />
              </View>
            </CourtCard>

            {cases.map((item) => (
              <EvidenceCard
                key={item.id}
                exhibit={item.source === 'deviceLimit' ? 'DETECTED BY IOS' : 'SELF-REPORTED'}
                text={item.evidenceLine}
                severity={item.severity}
                assetKey="ASSET_EXHIBIT_A_FILE"
              />
            ))}

            <CourtCard variant="orange">
              <Text style={styles.infoTitle}>Per-app minutes are unavailable</Text>
              <Text style={styles.infoCopy}>
                Apple keeps your app identities private, and detailed usage breakdowns need a Device
                Activity report extension that is not built yet. The court reports the cases it can
                actually prove.
              </Text>
            </CourtCard>

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
          title="Parole & Rewards"
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
  disclosureWrap: { minWidth: 52, minHeight: 30, paddingHorizontal: 10, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  disclosureLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  sectionBody: { gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { flex: 1, gap: 8 },
  infoTitle: { color: colors.label, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  infoCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  list: { gap: 10 },
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
