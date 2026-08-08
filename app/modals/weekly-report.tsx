import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ProgressDocket } from '@/src/components/ProgressDocket';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { formatMinutes } from '@/src/utils/format';

/**
 * The invented weekly trends were removed with the rest of the mock data. The
 * docket only keeps today, so this reports today's real figures and is honest
 * that week-long history needs a Device Activity report extension.
 */
export default function WeeklyReportModal() {
  const router = useRouter();
  const cases = useCourtStore((state) => state.cases);
  const profile = useCourtStore((state) => state.profile);

  const focusServedMinutes = Math.round(
    cases.reduce((sum, item) => sum + item.focusServedSeconds, 0) / 60,
  );
  const served = cases.filter((item) => item.verdict === 'served').length;

  return (
    <CourtBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CourtCard variant="purple">
          <View style={styles.hero}>
            <AssetImage assetKey="ASSET_WEEKLY_TRIAL_REPORT" width={136} height={136} />
            <View style={styles.text}>
              <StampBadge label="Advanced Report" tone="purple" />
              <Text style={styles.title}>Trial Report</Text>
              <Text style={styles.copy}>
                Multi-week trends require Supreme Court Mode and a Device Activity report extension.
              </Text>
            </View>
          </View>
        </CourtCard>

        <ProgressDocket
          items={[
            { label: 'Cases today', value: cases.length },
            { label: 'Served', value: served },
            { label: 'Focus time', value: formatMinutes(focusServedMinutes) },
          ]}
        />

        <CourtCard variant="glass">
          <Text style={styles.sectionTitle}>What the court can prove</Text>
          <Text style={styles.sectionCopy}>
            {cases.length === 0
              ? 'Nothing on the docket today. A clean record is the shortest report there is.'
              : `${cases.length} case${cases.length === 1 ? '' : 's'} filed today and ${formatMinutes(focusServedMinutes)} of focus served. Your streak stands at ${profile.cleanRecordStreak} day${profile.cleanRecordStreak === 1 ? '' : 's'}.`}
          </Text>
        </CourtCard>

        <CourtCard variant="orange">
          <Text style={styles.sectionTitle}>No week-long history yet</Text>
          <Text style={styles.sectionCopy}>
            The docket resets every night so you always start fresh, and iOS does not hand app usage
            history to the app. Longer-range reporting arrives with the report extension.
          </Text>
        </CourtCard>

        <CourtButton
          title="Upgrade Authority"
          variant="primary"
          onPress={() => router.replace('/modals/paywall')}
        />
        <CourtButton title="Close" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 28 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { flex: 1, gap: 8 },
  title: {
    color: colors.label,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  copy: { color: colors.labelSecondary, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  sectionTitle: { color: colors.label, fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  sectionCopy: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    marginTop: 6,
  },
});
