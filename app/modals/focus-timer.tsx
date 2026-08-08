import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { caseFocusRemainingSeconds } from '@/src/utils/docket';
import { formatCountdown, formatMinutes } from '@/src/utils/format';

const PRESET_DURATIONS = [5, 15, 30, 35, 60] as const;
type DurationSelection = (typeof PRESET_DURATIONS)[number] | 'custom';

export default function FocusTimerModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ caseId?: string }>();
  const focusSession = useCourtStore((s) => s.focusSession);
  const startFocusSession = useCourtStore((s) => s.startFocusSession);
  const cancelFocusSession = useCourtStore((s) => s.cancelFocusSession);

  // The case this timer is here to serve, if the user arrived from one.
  const servingCase = useCourtStore((s) =>
    s.cases.find((item) => item.id === (focusSession?.caseId ?? params.caseId)),
  );
  const jailedCase = servingCase?.verdict === 'jailed' ? servingCase : undefined;
  const owedMinutes = jailedCase
    ? Math.max(1, Math.ceil(caseFocusRemainingSeconds(jailedCase) / 60))
    : 0;

  const [durationSelection, setDurationSelection] = useState<DurationSelection>(15);
  const [customMinutes, setCustomMinutes] = useState('25');
  const [now, setNow] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const wasActive = useRef(false);

  // 1s heartbeat so the countdown re-renders.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Detect completion: session was running, now it's cleared by the global tick.
  useEffect(() => {
    if (focusSession) wasActive.current = true;
    else if (wasActive.current) {
      wasActive.current = false;
      setFinished(true);
    }
  }, [focusSession]);

  const remaining = focusSession
    ? Math.max(0, Math.round((new Date(focusSession.endsAt).getTime() - now) / 1000))
    : 0;

  const parsedCustomMinutes = Number.parseInt(customMinutes, 10);
  const customDurationIsValid =
    Number.isInteger(parsedCustomMinutes) && parsedCustomMinutes >= 1 && parsedCustomMinutes <= 120;
  const minutes = durationSelection === 'custom' ? parsedCustomMinutes : durationSelection;

  const handleStart = () => {
    if (durationSelection === 'custom' && !customDurationIsValid) return;
    setFinished(false);
    startFocusSession(minutes, jailedCase?.id);
  };

  const handleCancel = () => {
    cancelFocusSession();
    wasActive.current = false;
  };

  // ── Completed state ──
  if (finished) {
    const released = servingCase && servingCase.verdict === 'served';
    return (
      <CourtBackground>
        <View style={styles.centered}>
          <StampBadge label="Focus Complete" tone="success" />
          <Text style={styles.bigTitle}>Time served.</Text>
          <Text style={styles.bigSub}>
            {released
              ? 'Your apps are released from custody.'
              : servingCase
                ? `${formatMinutes(Math.ceil(caseFocusRemainingSeconds(servingCase) / 60))} of focus still owed under ${servingCase.lawName}.`
                : 'Parole points earned.'}
          </Text>
          <CourtButton title="Done" variant="green" onPress={() => router.back()} />
        </View>
      </CourtBackground>
    );
  }

  // ── Running state ──
  if (focusSession) {
    return (
      <CourtBackground>
        <View style={styles.centered}>
          <StampBadge
            label={focusSession.caseId ? 'Serving a Case' : 'Deep Focus'}
            tone="blue"
          />
          <Text style={styles.bigTitle}>Stay with it.</Text>

          <View style={styles.ringOuter}>
            <View style={styles.ring}>
              <Text style={styles.ringTime}>{formatCountdown(remaining)}</Text>
              <Text style={styles.ringLabel}>{focusSession.durationMinutes} min session</Text>
            </View>
          </View>

          <Text style={styles.bigSub}>
            {jailedCase
              ? 'When the timer ends, your apps are released.'
              : 'Phone down. Let the timer run.'}
          </Text>

          <Text style={styles.finePrint}>
            Giving up keeps the time you already banked.
          </Text>

          <CourtButton title="Give Up" variant="destructive" onPress={handleCancel} />
        </View>
      </CourtBackground>
    );
  }

  // ── Setup state ──
  return (
    <CourtBackground>
      <View style={styles.setup}>
        <ScreenHeader
          eyebrow="FOCUS TIMER"
          title="Start a Timer"
          subtitle={
            jailedCase
              ? `Serve ${formatMinutes(owedMinutes)} to release your apps.`
              : 'Run a focus session to earn parole points.'
          }
          assetKey="ASSET_JAIL_TIMER_HOURGLASS"
        />

        {jailedCase ? (
          <CourtCard variant="red">
            <StampBadge label="In custody" tone="danger" />
            <Text style={styles.caseTitle}>{jailedCase.lawName}</Text>
            <Text style={styles.caseCopy}>
              {formatMinutes(owedMinutes)} of focus left. Any session counts toward it, so you can
              chip away at it in shorter runs.
            </Text>
          </CourtCard>
        ) : null}

        <View style={styles.durationGrid}>
          {PRESET_DURATIONS.map((d) => {
            const on = durationSelection === d;
            return (
              <Pressable
                key={d}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${d} minute focus timer`}
                onPress={() => setDurationSelection(d)}
                style={({ pressed }) => [styles.durCard, on && styles.durCardOn, pressed && styles.durCardPressed]}
              >
                <Text style={[styles.durValue, on && styles.durValueOn]}>{d}</Text>
                <Text style={[styles.durUnit, on && styles.durUnitOn]}>minutes</Text>
              </Pressable>
            );
          })}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: durationSelection === 'custom' }}
            accessibilityLabel="Custom focus timer duration"
            onPress={() => setDurationSelection('custom')}
            style={({ pressed }) => [
              styles.durCard,
              durationSelection === 'custom' && styles.durCardOn,
              pressed && styles.durCardPressed,
            ]}
          >
            <Text style={[styles.durValue, durationSelection === 'custom' && styles.durValueOn]}>Custom</Text>
            <Text style={[styles.durUnit, durationSelection === 'custom' && styles.durUnitOn]}>minutes</Text>
          </Pressable>
        </View>

        {durationSelection === 'custom' ? (
          <View style={styles.customDuration}>
            <Text style={styles.customDurationLabel}>Custom duration</Text>
            <View style={styles.customInputRow}>
              <TextInput
                accessibilityLabel="Custom focus duration in minutes"
                autoFocus
                keyboardType="number-pad"
                maxLength={3}
                onChangeText={setCustomMinutes}
                placeholder="25"
                placeholderTextColor={colors.labelTertiary}
                selectTextOnFocus
                style={styles.customInput}
                value={customMinutes}
              />
              <Text style={styles.customInputUnit}>minutes</Text>
            </View>
            <Text style={[styles.customHint, !customDurationIsValid && styles.customHintError]}>
              Enter a whole number from 1 to 120 minutes.
            </Text>
          </View>
        ) : null}

        <CourtButton
          title={durationSelection === 'custom' && !customDurationIsValid ? 'Enter a valid duration' : `Start ${minutes}-minute Focus`}
          variant="primary"
          disabled={durationSelection === 'custom' && !customDurationIsValid}
          onPress={handleStart}
        />
        <CourtButton title="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  setup: { flex: 1, gap: 14, paddingTop: 8 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 8 },
  bigTitle: { color: colors.label, fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  bigSub: {
    color: colors.labelSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  durCard: {
    width: '30%',
    minHeight: 96,
    paddingVertical: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...shadows.soft,
  },
  durCardPressed: { transform: [{ translateY: 2 }], borderBottomWidth: 1 },
  durCardOn: { backgroundColor: colors.blueLight, borderColor: colors.blue },
  durValue: { color: colors.label, fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  durValueOn: { color: colors.blue },
  durUnit: { color: colors.labelSecondary, fontSize: 12, fontWeight: '600' },
  durUnitOn: { color: colors.blue },

  customDuration: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
  },
  customDurationLabel: { color: colors.label, fontSize: 15, fontWeight: '700' },
  customInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customInput: {
    minWidth: 88,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.blue,
    color: colors.label,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  customInputUnit: { color: colors.labelSecondary, fontSize: 15, fontWeight: '600' },
  customHint: { color: colors.labelSecondary, fontSize: 12, lineHeight: 16 },
  customHintError: { color: colors.red },

  caseTitle: {
    color: colors.label,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 10,
  },
  caseCopy: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    marginTop: 6,
  },
  finePrint: {
    color: colors.labelTertiary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  ringOuter: {
    width: 220, height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,122,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.18)',
    ...shadows.soft,
  },
  ring: {
    width: 180, height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: '#C9D7F7',
  },
  ringTime: { color: colors.label, fontSize: 44, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  ringLabel: { color: colors.labelSecondary, fontSize: 13, fontWeight: '600' },
});
