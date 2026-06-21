import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssetImage } from '@/src/components/AssetImage';
import { BlockedAppTile } from '@/src/components/BlockedAppTile';
import { CharacterBubble } from '@/src/components/CharacterBubble';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SentenceTimer } from '@/src/components/SentenceTimer';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { MINI_ACTIONS } from '@/src/data/miniActions';
import { useCourtStore } from '@/src/store/useCourtStore';
import { formatCountdown } from '@/src/utils/format';
import type { AppSuspect, BlockCategory } from '@/src/types/court';

function blockCat(s: AppSuspect): BlockCategory {
  return s.blockCategory ?? 'distracting';
}

function isTempUnblocked(s: AppSuspect): boolean {
  return !!s.unblockedUntil && new Date(s.unblockedUntil).getTime() > Date.now();
}

export default function JailTab() {
  const router = useRouter();
  const activeCase = useCourtStore((state) => state.activeCase);
  const charges = useCourtStore((state) => state.charges);
  const suspects = useCourtStore((state) => state.suspects);
  const focusSession = useCourtStore((state) => state.focusSession);
  const reduceSentence = useCourtStore((state) => state.reduceSentence);
  const latestCharge = charges[0];
  const active = activeCase.status === 'jailed' && activeCase.remainingSentenceSeconds > 0;

  // Apps in custody: monitored distractions + every never-allowed app.
  const blockedApps = suspects.filter((s) => {
    const cat = blockCat(s);
    if (cat === 'alwaysAllowed') return false;
    if (cat === 'neverAllowed') return true;
    return s.isSelected;
  });

  const handleTapBlocked = (s: AppSuspect) => {
    if (blockCat(s) === 'neverAllowed') {
      Alert.alert(`${s.displayName} is permanently locked`, 'Move it out of "Never Allowed" in Distractions to open it.');
      return;
    }
    router.push({ pathname: '/modals/unblock', params: { appId: s.id } });
  };

  // Reusable "Start Timer" CTA shown below the jail status.
  const startTimerCard = (
    <CourtCard variant="blue">
      <View style={styles.timerCtaRow}>
        <AssetImage assetKey="ASSET_JAIL_TIMER_HOURGLASS" width={56} height={56} />
        <View style={styles.timerCtaText}>
          <Text style={styles.timerCtaTitle}>
            {focusSession ? 'Focus session running' : 'Start a focus timer'}
          </Text>
          <Text style={styles.timerCtaCopy}>
            {focusSession
              ? `${formatCountdown(Math.max(0, Math.round((new Date(focusSession.endsAt).getTime() - Date.now()) / 1000)))} left${focusSession.reducesJail ? ' · cutting your sentence' : ''}`
              : active
                ? 'Run a timer to reduce your jail sentence.'
                : 'Run a focus timer any time to earn parole.'}
          </Text>
        </View>
        <CourtButton
          title={focusSession ? 'View' : 'Start'}
          small
          variant="primary"
          onPress={() => router.push('/modals/focus-timer')}
        />
      </View>
    </CourtCard>
  );

  return (
    <CourtBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ScreenHeader
          eyebrow="DISTRACTION JAIL"
          title="Sentence"
          subtitle="Serve time or earn parole through action."
          assetKey="ASSET_DISTRACTION_JAIL_BUILDING"
        />

        {/* ── Apps in custody (lock overlay) ──────────────────────────── */}
        {blockedApps.length > 0 ? (
          <CourtCard variant="glass">
            <View style={styles.custodyHeader}>
              <Text style={styles.custodyTitle}>In Custody</Text>
              <Text style={styles.custodyCount}>{blockedApps.length} apps</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.custodyStrip}
            >
              {blockedApps.map((s) => (
                <BlockedAppTile
                  key={s.id}
                  suspect={s}
                  locked={blockCat(s) === 'neverAllowed' ? true : !isTempUnblocked(s)}
                  onPress={() => handleTapBlocked(s)}
                />
              ))}
            </ScrollView>
            <Text style={styles.custodyHint}>Tap a locked app to request access.</Text>
          </CourtCard>
        ) : null}

        {!active ? (
          // ── Empty state ─────────────────────────────────────────────────
          <>
            <CourtCard variant="glass">
              <View style={styles.empty}>
                <AssetImage assetKey="ASSET_EMPTY_NO_CHARGES" width={140} height={140} />
                <Text style={styles.emptyTitle}>You're free.</Text>
                <Text style={styles.emptyCopy}>
                  No active sentence. Keep your record clean — the court is quiet for now.
                </Text>
                <View style={styles.emptyBadge}>
                  <AssetImage assetKey="ASSET_CLEAN_RECORD_MEDAL" width={72} height={72} />
                  <Text style={styles.emptyBadgeText}>Clean Record</Text>
                </View>
              </View>
            </CourtCard>
            {startTimerCard}
          </>
        ) : (
          <>
            {/* ── Active sentence ─────────────────────────────────────── */}
            <CourtCard variant="red">
              <View style={styles.jailHero}>
                <AssetImage assetKey="ASSET_DEFENDANT_JAIL_BARS" width={130} height={130} />
                <View style={styles.timerBox}>
                  <StampBadge label="Sentence Active" tone="danger" />
                  <SentenceTimer seconds={activeCase.remainingSentenceSeconds} />
                </View>
              </View>
              {latestCharge?.evidenceLine ? (
                <View style={styles.evidenceLine}>
                  <Text style={styles.evidenceLabel}>EVIDENCE</Text>
                  <Text style={styles.evidenceText}>{latestCharge.evidenceLine}</Text>
                </View>
              ) : null}
            </CourtCard>

            {/* ── Start timer (reduces this sentence) ─────────────────── */}
            {startTimerCard}

            {/* ── What this cost ─────────────────────────────────────── */}
            <CourtCard variant="orange" assetKey="ASSET_JAIL_TIMER_HOURGLASS">
              <Text style={styles.costTitle}>What this cost you</Text>
              <Text style={styles.costCopy}>
                The victim is tomorrow morning. Reduce your sentence by completing one real action below.
              </Text>
            </CourtCard>

            <CharacterBubble
              assetKey="ASSET_BAILIFF_BULLDOG_GUARD"
              name="Bailiff Bulldog"
              line="Phone down. Sentence begins now."
            />

            {/* ── Parole actions ─────────────────────────────────────── */}
            <View style={styles.actionsHeader}>
              <Text style={styles.actionsTitle}>Earn Parole</Text>
              <Text style={styles.actionsSub}>Complete an action to reduce your sentence</Text>
            </View>

            <View style={styles.actions}>
              {MINI_ACTIONS.map((action, index) => (
                <CourtCard key={action.id} variant="glass">
                  <View style={styles.actionRow}>
                    <AssetImage assetKey={action.assetKey} width={56} height={56} />
                    <View style={styles.actionText}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <View style={styles.actionMeta}>
                        <Text style={styles.actionMetaItem}>−{action.reductionMinutes} min</Text>
                        <Text style={styles.actionMetaDot}>·</Text>
                        <Text style={styles.actionMetaItem}>+{action.parolePoints} pts</Text>
                      </View>
                    </View>
                    <CourtButton
                      title="Done"
                      small
                      variant="green"
                      onPress={() => {
                        const granted = reduceSentence(
                          action.reductionMinutes,
                          `${action.title}. Sentence reduced.`,
                          action.parolePoints,
                        );
                        if (granted) router.push('/modals/parole-granted');
                      }}
                    />
                  </View>
                </CourtCard>
              ))}
            </View>

            {/* ── Emergency bypass ──────────────────────────────────── */}
            <View style={styles.emergencyRow}>
              <CourtButton
                title="Emergency Bypass"
                variant="destructive"
                onPress={() => router.push('/modals/emergency-bypass')}
              />
            </View>
          </>
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

  // ── apps in custody ──
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
  custodyStrip: {
    gap: 14,
    paddingRight: 8,
  },
  custodyHint: {
    color: colors.labelTertiary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 12,
  },

  // ── start timer CTA ──
  timerCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerCtaText: {
    flex: 1,
    gap: 4,
  },
  timerCtaTitle: {
    color: colors.label,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  timerCtaCopy: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },

  // ── empty state ──
  empty: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  emptyTitle: {
    color: colors.label,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  emptyCopy: {
    color: colors.labelSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '400',
  },
  emptyBadge: {
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  emptyBadgeText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: '600',
  },

  // ── active sentence ──
  jailHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerBox: {
    flex: 1,
    gap: 10,
    alignItems: 'flex-start',
  },
  evidenceLine: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,59,48,0.15)',
    gap: 4,
  },
  evidenceLabel: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  evidenceText: {
    color: colors.label,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },

  // ── cost card ──
  costTitle: {
    color: colors.label,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  costCopy: {
    color: colors.labelSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    marginTop: 6,
  },

  // ── actions ──
  actionsHeader: {
    gap: 3,
    paddingHorizontal: 2,
  },
  actionsTitle: {
    color: colors.label,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  actionsSub: {
    color: colors.labelSecondary,
    fontSize: 13,
    fontWeight: '400',
  },
  actions: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    flex: 1,
    gap: 5,
  },
  actionTitle: {
    color: colors.label,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  actionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionMetaItem: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '600',
  },
  actionMetaDot: {
    color: colors.labelTertiary,
    fontSize: 12,
  },

  // ── emergency ──
  emergencyRow: {
    marginTop: 4,
  },
});
