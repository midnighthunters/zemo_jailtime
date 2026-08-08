import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ProgressDocket } from '@/src/components/ProgressDocket';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { shortTime } from '@/src/utils/date';
import { jailedCases, verdictLabel, verdictTone } from '@/src/utils/docket';
import { formatMinutes } from '@/src/utils/format';

/**
 * Evidence is now the real record only: the cases actually filed today and what
 * you did about them.
 *
 * The fabricated exhibits and per-app usage chart were removed along with the
 * mock data. Real per-app minutes need a DeviceActivityReport extension, which
 * is not built yet — so this screen says so rather than inventing numbers.
 */
export default function EvidenceTab() {
  const router = useRouter();
  const cases = useCourtStore((state) => state.cases);
  const appSelection = useCourtStore((state) => state.appSelection);
  const profile = useCourtStore((state) => state.profile);

  const protectedCount =
    appSelection.applications + appSelection.categories + appSelection.webDomains;
  const served = cases.filter((item) => item.verdict === 'served');
  const locked = jailedCases(cases);
  const focusServedMinutes = Math.round(
    cases.reduce((sum, item) => sum + item.focusServedSeconds, 0) / 60,
  );

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="EVIDENCE BOARD"
          title="Trial Evidence"
          subtitle="Only what actually happened today."
          assetKey="ASSET_EVIDENCE_BOARD_SCREEN_TIME"
        />

        <ProgressDocket
          items={[
            { label: 'Cases today', value: cases.length },
            { label: 'Focus served', value: formatMinutes(focusServedMinutes) },
            { label: 'Apps watched', value: protectedCount },
          ]}
        />

        {/* ── Today's record ───────────────────────────────────────────── */}
        <CourtCard variant="glass">
          <View style={styles.boardTop}>
            <View style={styles.boardText}>
              <Text style={styles.boardTitle}>Today's record</Text>
              <Text style={styles.boardCopy}>
                {cases.length === 0
                  ? 'No focus law broken today. Nothing to exhibit.'
                  : `${cases.length} case${cases.length === 1 ? '' : 's'} filed · ${served.length} served · ${locked.length} still in custody.`}
              </Text>
            </View>
            <AssetImage assetKey="ASSET_OWL_JUSTICE_INSPECT" width={96} height={96} />
          </View>
        </CourtCard>

        {cases.length > 0 ? (
          <View style={styles.list}>
            {cases.map((item) => (
              <CourtCard key={item.id} variant="glass">
                <View style={styles.exhibitTop}>
                  <StampBadge label={verdictLabel(item.verdict)} tone={verdictTone(item.verdict)} />
                  <Text style={styles.exhibitTime}>{shortTime(item.filedAt)}</Text>
                </View>
                <Text style={styles.exhibitTitle}>{item.lawName}</Text>
                <Text style={styles.exhibitCopy}>{item.evidenceLine}</Text>
                <Text style={styles.exhibitMeta}>
                  {item.source === 'deviceLimit' ? 'Detected by iOS' : 'Self-reported'} ·{' '}
                  {formatMinutes(Math.round(item.focusServedSeconds / 60))} of{' '}
                  {formatMinutes(item.requiredFocusMinutes)} focus served
                </Text>
              </CourtCard>
            ))}
          </View>
        ) : null}

        {/* ── Honest gap ───────────────────────────────────────────────── */}
        <CourtCard variant="orange">
          <Text style={styles.noteTitle}>Per-app minutes are not available</Text>
          <Text style={styles.noteCopy}>
            Apple keeps your app identities private, and detailed usage breakdowns need a Device
            Activity report extension that JailTime does not ship yet. Until then the court works
            from your daily limit and the cases above rather than guessing.
          </Text>
        </CourtCard>

        <CourtCard variant="purple">
          <View style={styles.reportRow}>
            <AssetImage assetKey="ASSET_WEEKLY_TRIAL_REPORT" width={88} height={88} />
            <View style={styles.reportText}>
              <Text style={styles.reportTitle}>Weekly Trial Report</Text>
              <Text style={styles.reportCopy}>
                Your streak is {profile.cleanRecordStreak} day
                {profile.cleanRecordStreak === 1 ? '' : 's'}. Advanced reports require Supreme Court
                Mode.
              </Text>
              <CourtButton
                title="Open Report"
                variant="primary"
                small
                onPress={() => router.push('/modals/weekly-report')}
              />
            </View>
          </View>
        </CourtCard>
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 112 },

  boardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  boardText: { flex: 1, gap: 6 },
  boardTitle: { color: colors.label, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  boardCopy: { color: colors.labelSecondary, fontSize: 14, lineHeight: 20, fontWeight: '400' },

  list: { gap: 12 },
  exhibitTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  exhibitTime: { color: colors.labelTertiary, fontSize: 12, fontWeight: '600' },
  exhibitTitle: {
    color: colors.label,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 10,
  },
  exhibitCopy: {
    color: colors.labelSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    marginTop: 6,
  },
  exhibitMeta: { color: colors.labelTertiary, fontSize: 12, fontWeight: '500', marginTop: 10 },

  noteTitle: { color: colors.label, fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  noteCopy: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    marginTop: 6,
  },

  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportText: { flex: 1, gap: 8 },
  reportTitle: { color: colors.label, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  reportCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },
});
