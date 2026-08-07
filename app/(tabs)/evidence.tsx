import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { EvidenceCard } from '@/src/components/EvidenceCard';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { colors, radius } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { useRouter } from 'expo-router';

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

export default function EvidenceTab() {
  const router = useRouter();
  const charges = useCourtStore((state) => state.charges);
  const suspects = useCourtStore((state) => state.suspects);
  const worst = [...suspects].sort((a, b) => b.dailyUsageMinutes - a.dailyUsageMinutes)[0];

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="EVIDENCE BOARD"
          title="Trial Evidence"
          subtitle="Analytics dressed as courtroom exhibits."
          assetKey="ASSET_EVIDENCE_BOARD_SCREEN_TIME"
        />

        <CourtCard variant="dark" delay={80}>
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

        <EvidenceCard exhibit="EXHIBIT A" text={`Exhibit A: ${worst.dailyUsageMinutes || 47} minutes vanished into ${worst.displayName.toLowerCase()}.`} severity={5} assetKey="ASSET_EXHIBIT_A_FILE" delay={120} />
        <EvidenceCard exhibit="EXHIBIT B" text={`You opened ${worst.displayName.toLowerCase()} ${worst.dailyOpenCount || 9} times after warning.`} severity={4} assetKey="ASSET_REPEAT_OFFENDER_APP" delay={170} />
        <EvidenceCard exhibit="EXHIBIT C" text="Sleep was robbed at 2:34 AM." severity={4} assetKey="ASSET_EVIDENCE_LOST_SLEEP" delay={220} />
        <EvidenceCard exhibit="EXHIBIT D" text="Your gym plan was delayed by scrolling." severity={3} assetKey="ASSET_EVIDENCE_SKIPPED_GOALS" delay={270} />
        <EvidenceCard exhibit="DANGER HOUR" text="The worst hour is becoming obvious. The court recommends a lockdown window." severity={3} assetKey="ASSET_DANGER_HOURS_CLOCK" delay={320} />
        <EvidenceCard exhibit="DREAMS DELAYED" text="Every tap can steal sleep, focus, and dreams." severity={2} assetKey="ASSET_DREAMS_DELAYED_BOARD" delay={370} />

        <CourtCard variant="purple" delay={420}>
          <View style={styles.reportRow}>
            <AssetImage assetKey="ASSET_WEEKLY_TRIAL_REPORT" width={92} height={92} />
            <View style={styles.reportText}>
              <Text style={styles.reportTitle}>Weekly Trial Report</Text>
              <Text style={styles.reportCopy}>Advanced evidence reports require Supreme Court Mode.</Text>
              <CourtButton title="Open Report" variant="gold" small onPress={() => router.push('/modals/weekly-report')} />
            </View>
          </View>
        </CourtCard>
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 112,
  },
  boardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  boardText: {
    flex: 1,
    gap: 6,
  },
  boardTitle: {
    color: colors.cream,
    fontSize: 24,
    fontWeight: '900',
  },
  boardCopy: {
    color: colors.parchment,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  chart: {
    marginTop: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportText: {
    flex: 1,
    gap: 8,
  },
  reportTitle: {
    color: colors.cream,
    fontSize: 19,
    fontWeight: '900',
  },
  reportCopy: {
    color: colors.parchment,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
