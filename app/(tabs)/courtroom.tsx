import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AssetImage } from '@/src/components/AssetImage';
import { BlockedAppTile } from '@/src/components/BlockedAppTile';
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
import type { AppSuspect } from '@/src/types/court';
import { isCaseOpen, jailedCaseForApp } from '@/src/utils/docket';
import { formatCountdown } from '@/src/utils/format';

/**
 * The single Court screen. Absorbs everything the old Jail tab did: today's
 * docket, apps in custody, verdict controls, the focus timer, and bypass.
 */
export default function CourtroomTab() {
  const router = useRouter();
  const profile = useCourtStore((state) => state.profile);
  const cases = useCourtStore((state) => state.cases);
  const suspects = useCourtStore((state) => state.suspects);
  const focusSession = useCourtStore((state) => state.focusSession);
  const enforcementEnabled = useCourtStore((state) => state.enforcementEnabled);
  const warnCase = useCourtStore((state) => state.warnCase);
  const jailCase = useCourtStore((state) => state.jailCase);
  const dismissCase = useCourtStore((state) => state.dismissCase);

  const jailedCases = cases.filter((item) => item.verdict === 'jailed');
  const openCount = cases.filter(isCaseOpen).length;
  const custody = CourtClerk.monitoredSuspects(suspects);

  const openFocusTimer = (caseId?: string) =>
    router.push({
      pathname: '/modals/focus-timer',
      params: caseId ? { caseId } : {},
    });

  // Tapping an app is how a law break reaches the court today.
  // Already jailed → the only way out is a focus timer.
  // Still free     → opening it during an active law files the case.
  const handleTapApp = (suspect: AppSuspect) => {
    const jailed = jailedCaseForApp(cases, suspect.id);
    if (jailed) {
      Alert.alert(
        `${suspect.displayName} is in custody`,
        'The court releases this app only after you serve focus time. Start a timer now?',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Start Focus Timer', onPress: () => openFocusTimer(jailed.id) },
        ],
      );
      return;
    }

    if (!enforcementEnabled) {
      Alert.alert(
        'Enforcement is off',
        'Turn the court back on from the Culprits tab to let it file cases again.',
      );
      return;
    }

    const caseId = CourtClerk.fileForAppLaunch(suspect.id);
    if (!caseId) {
      Alert.alert(
        'No law covers this app',
        `Enable a focus law for ${suspect.displayName} on the Culprits tab first.`,
      );
      return;
    }
    router.push({ pathname: '/modals/charges-filed', params: { caseId } });
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
            { label: 'In custody', value: jailedCases.length },
            { label: 'Clean streak', value: profile.cleanRecordStreak },
          ]}
        />

        {!enforcementEnabled ? (
          <CourtCard variant="orange">
            <StampBadge label="Court adjourned" tone="orange" />
            <Text style={styles.adjournedTitle}>Enforcement is off.</Text>
            <Text style={styles.adjournedCopy}>
              No app is locked and no case will be filed. Turn the court back on whenever you are
              ready.
            </Text>
            <View style={styles.adjournedAction}>
              <CourtButton
                title="Open Culprits"
                variant="secondary"
                small
                onPress={() => router.push('/(tabs)/culprits')}
              />
            </View>
          </CourtCard>
        ) : null}

        {/* ── Apps under watch ─────────────────────────────────────────── */}
        {custody.length > 0 ? (
          <CourtCard variant="glass">
            <View style={styles.custodyHeader}>
              <Text style={styles.custodyTitle}>Under Watch</Text>
              <Text style={styles.custodyCount}>
                {jailedCases.length} of {custody.length} locked
              </Text>
            </View>
            <ScrollView
              horizontal
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.custodyStrip}
            >
              {custody.map((suspect) => (
                <BlockedAppTile
                  key={suspect.id}
                  suspect={suspect}
                  locked={enforcementEnabled && Boolean(jailedCaseForApp(cases, suspect.id))}
                  onPress={() => handleTapApp(suspect)}
                />
              ))}
            </ScrollView>
            <Text style={styles.custodyHint}>
              Tap an app to open it. Locked apps need focus time first.
            </Text>
          </CourtCard>
        ) : null}

        {/* ── Focus timer ──────────────────────────────────────────────── */}
        <CourtCard variant="blue">
          <View style={styles.timerRow}>
            <AssetImage assetKey="ASSET_JAIL_TIMER_HOURGLASS" width={56} height={56} />
            <View style={styles.timerText}>
              <Text style={styles.timerTitle}>
                {focusSession ? 'Focus session running' : 'Start a focus timer'}
              </Text>
              <Text style={styles.timerCopy}>
                {focusSession
                  ? `${formatCountdown(focusRemaining)} left${
                      focusSession.caseId ? ' · serving a case' : ''
                    }`
                  : jailedCases.length > 0
                    ? 'Focus time is the only way out of custody.'
                    : 'Run a timer any time to earn parole points.'}
              </Text>
            </View>
            <CourtButton
              title={focusSession ? 'View' : 'Start'}
              small
              variant="primary"
              onPress={() => openFocusTimer(focusSession?.caseId ?? jailedCases[0]?.id)}
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
                No focus law broken today. Break one and a case lands at the top of this docket.
              </Text>
            </View>
          </CourtCard>
        ) : (
          <View style={styles.docket}>
            {cases.map((item) => (
              <CaseCard
                key={item.id}
                item={item}
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

        {jailedCases.length > 0 ? (
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
  content: {
    gap: 14,
    paddingBottom: 110,
  },

  adjournedTitle: {
    color: colors.label,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 10,
  },
  adjournedCopy: {
    color: colors.labelSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    marginTop: 6,
  },
  adjournedAction: { marginTop: 12, alignSelf: 'flex-start' },

  custodyHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  custodyTitle: {
    color: colors.label,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  custodyCount: {
    color: colors.labelSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  custodyStrip: { gap: 14, paddingRight: 8 },
  custodyHint: {
    color: colors.labelTertiary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 12,
  },

  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timerText: { flex: 1, gap: 4 },
  timerTitle: {
    color: colors.label,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  timerCopy: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },

  docketHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  docketTitle: {
    color: colors.label,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  docketSub: {
    color: colors.labelSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  docket: { gap: 12 },

  empty: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  emptyTitle: {
    color: colors.label,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  emptyCopy: {
    color: colors.labelSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
  },
});
