import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AssetImage } from '@/src/components/AssetImage';
import { CaseCard } from '@/src/components/CaseCard';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ProgressDocket } from '@/src/components/ProgressDocket';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { colors } from '@/src/constants/theme';
import { CourtClerk } from '@/src/services/court/CourtClerk';
import { useCourtStore } from '@/src/store/useCourtStore';
import { isCaseOpen, jailedCases, primaryJailedCase } from '@/src/utils/docket';
import { formatCountdown } from '@/src/utils/format';

/**
 * The single Court screen: today's docket, verdict controls, custody status, the
 * focus timer, and bypass.
 */
export default function CourtroomTab() {
  const router = useRouter();
  const profile = useCourtStore((state) => state.profile);
  const cases = useCourtStore((state) => state.cases);
  const laws = useCourtStore((state) => state.laws);
  const appSelection = useCourtStore((state) => state.appSelection);
  const focusSession = useCourtStore((state) => state.focusSession);
  const enforcementEnabled = useCourtStore((state) => state.enforcementEnabled);
  const warnCase = useCourtStore((state) => state.warnCase);
  const dismissCase = useCourtStore((state) => state.dismissCase);

  const locked = jailedCases(cases);
  const openCount = cases.filter(isCaseOpen).length;
  const protectedCount =
    appSelection.applications + appSelection.categories + appSelection.webDomains;
  const hasSelection = protectedCount > 0;

  const openFocusTimer = (caseId?: string) =>
    router.push({ pathname: '/modals/focus-timer', params: caseId ? { caseId } : {} });

  // Hand yourself in. The device files its own case the moment the daily limit
  // breaks, but an honest defendant can report a slip early.
  const handleSelfReport = () => {
    const active = laws.filter((law) => law.isEnabled);
    if (active.length === 0) {
      Alert.alert('No active laws', 'Enable a focus law on the Culprits tab first.');
      return;
    }
    Alert.alert(
      'Report a slip',
      'Which law did you break?',
      [
        ...active.slice(0, 5).map((law) => ({
          text: law.shortName,
          onPress: () => {
            const caseId = CourtClerk.selfReport(law.id);
            if (caseId) {
              router.push({ pathname: '/modals/charges-filed', params: { caseId } });
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  };

  const focusRemaining = focusSession
    ? Math.max(0, Math.round((new Date(focusSession.endsAt).getTime() - Date.now()) / 1000))
    : 0;

  return (
    <CourtBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader
          eyebrow="FOCUS COURT"
          title="Court"
          subtitle="Today's docket. Everything clears at midnight."
          rightAction={
            <CourtButton
              title="Report"
              small
              variant="secondary"
              onPress={() => router.push('/report')}
            />
          }
        />

        <ProgressDocket
          items={[
            { label: 'Open cases', value: openCount },
            { label: 'Apps watched', value: protectedCount },
            { label: 'Clean streak', value: profile.cleanRecordStreak },
          ]}
        />

        {/* ── Setup gate ───────────────────────────────────────────────── */}
        {!hasSelection ? (
          <CourtCard variant="blue">
            <StampBadge label="Setup needed" tone="blue" />
            <Text style={styles.noticeTitle}>No apps under court order yet.</Text>
            <Text style={styles.noticeCopy}>
              The court can only act on real apps you pick on this device. Choose them on the
              Culprits tab and iOS will enforce your limits from then on.
            </Text>
            <View style={styles.noticeAction}>
              <CourtButton
                title="Choose Apps"
                variant="primary"
                small
                onPress={() => router.push('/(tabs)/culprits')}
              />
            </View>
          </CourtCard>
        ) : null}

        {!enforcementEnabled ? (
          <CourtCard variant="orange">
            <StampBadge label="Court adjourned" tone="orange" />
            <Text style={styles.noticeTitle}>Enforcement is off.</Text>
            <Text style={styles.noticeCopy}>
              Nothing is locked and no case will be filed. Turn the court back on whenever you are
              ready.
            </Text>
            <View style={styles.noticeAction}>
              <CourtButton
                title="Open Culprits"
                variant="secondary"
                small
                onPress={() => router.push('/(tabs)/culprits')}
              />
            </View>
          </CourtCard>
        ) : null}

        {/* ── Custody status ───────────────────────────────────────────── */}
        {locked.length > 0 && enforcementEnabled ? (
          <CourtCard variant="red">
            <StampBadge label="In custody" tone="danger" />
            <Text style={styles.noticeTitle}>Your apps are locked.</Text>
            <Text style={styles.noticeCopy}>
              iOS is shielding all {protectedCount} of your court-ordered selections. Serve the focus
              time on the case below and they open again.
            </Text>
            <View style={styles.noticeAction}>
              <CourtButton
                title="Start Focus Timer"
                variant="primary"
                small
                onPress={() => openFocusTimer(primaryJailedCase(cases)?.id)}
              />
            </View>
          </CourtCard>
        ) : null}

        {/* ── Focus timer ──────────────────────────────────────────────── */}
        <CourtCard variant="glass">
          <View style={styles.timerRow}>
            <AssetImage assetKey="ASSET_JAIL_TIMER_HOURGLASS" width={56} height={56} />
            <View style={styles.timerText}>
              <Text style={styles.timerTitle}>
                {focusSession ? 'Focus session running' : 'Start a focus timer'}
              </Text>
              <Text style={styles.timerCopy}>
                {focusSession
                  ? `${formatCountdown(focusRemaining)} left${focusSession.caseId ? ' · serving a case' : ''}`
                  : locked.length > 0
                    ? 'Focus time is the only way out of custody.'
                    : 'Run a timer any time to earn parole points.'}
              </Text>
            </View>
            <CourtButton
              title={focusSession ? 'View' : 'Start'}
              small
              variant="primary"
              onPress={() => openFocusTimer(focusSession?.caseId ?? primaryJailedCase(cases)?.id)}
            />
          </View>
        </CourtCard>

        {/* ── Docket ───────────────────────────────────────────────────── */}
        <View style={styles.docketHeader}>
          <Text style={styles.docketTitle}>Today's Docket</Text>
          <Text style={styles.docketSub}>
            {cases.length === 0
              ? 'Nothing filed yet'
              : `${cases.length} case${cases.length === 1 ? '' : 's'}`}
          </Text>
        </View>

        {cases.length === 0 ? (
          <CourtCard variant="green">
            <View style={styles.empty}>
              <AssetImage assetKey="ASSET_EMPTY_NO_CHARGES" width={132} height={132} />
              <StampBadge label="Clean record" tone="success" />
              <Text style={styles.emptyTitle}>The court is quiet.</Text>
              <Text style={styles.emptyCopy}>
                No focus law broken today. When your apps pass their daily limit, iOS tells the court
                and a case lands at the top of this docket.
              </Text>
            </View>
          </CourtCard>
        ) : (
          <View style={styles.docket}>
            {cases.map((item) => (
              <CaseCard
                key={item.id}
                item={item}
                protectedCount={protectedCount}
                serving={focusSession?.caseId === item.id}
                onWarn={() => warnCase(item.id)}
                onJail={() =>
                  router.push({ pathname: '/modals/sentence', params: { caseId: item.id } })
                }
                onDismiss={() => dismissCase(item.id)}
                onStartFocus={() => openFocusTimer(item.id)}
              />
            ))}
          </View>
        )}

        {enforcementEnabled ? (
          <CourtButton title="Report a Slip" variant="secondary" onPress={handleSelfReport} />
        ) : null}

        {locked.length > 0 ? (
          <CourtButton
            title="Emergency Bypass"
            variant="destructive"
            onPress={() => router.push('/modals/emergency-bypass')}
          />
        ) : null}
      </ScrollView>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 110 },

  noticeTitle: {
    color: colors.label,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 10,
  },
  noticeCopy: {
    color: colors.labelSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    marginTop: 6,
  },
  noticeAction: { marginTop: 12, alignSelf: 'flex-start' },

  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timerText: { flex: 1, gap: 4 },
  timerTitle: { color: colors.label, fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  timerCopy: { color: colors.labelSecondary, fontSize: 13, lineHeight: 18, fontWeight: '400' },

  docketHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  docketTitle: { color: colors.label, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  docketSub: { color: colors.labelSecondary, fontSize: 13, fontWeight: '500' },
  docket: { gap: 12 },

  empty: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  emptyTitle: { color: colors.label, fontSize: 24, fontWeight: '700', letterSpacing: -0.4 },
  emptyCopy: {
    color: colors.labelSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
  },
});
