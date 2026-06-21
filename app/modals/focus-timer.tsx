import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { useCourtStore } from '@/src/store/useCourtStore';
import { formatCountdown } from '@/src/utils/format';

const DURATIONS = [5, 15, 25, 45];

export default function FocusTimerModal() {
  const router = useRouter();
  const focusSession = useCourtStore((s) => s.focusSession);
  const activeCase = useCourtStore((s) => s.activeCase);
  const startFocusSession = useCourtStore((s) => s.startFocusSession);
  const cancelFocusSession = useCourtStore((s) => s.cancelFocusSession);

  const jailActive = activeCase.status === 'jailed' && activeCase.remainingSentenceSeconds > 0;

  const [minutes, setMinutes] = useState(25);
  const [reduceJail, setReduceJail] = useState(true);
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

  const handleStart = () => {
    setFinished(false);
    startFocusSession(minutes, jailActive ? reduceJail : false);
  };

  const handleCancel = () => {
    cancelFocusSession();
    wasActive.current = false;
  };

  // ── Completed state ──
  if (finished) {
    return (
      <CourtBackground>
        <View style={styles.centered}>
          <StampBadge label="Focus Complete" tone="success" />
          <Text style={styles.bigTitle}>Time served.</Text>
          <Text style={styles.bigSub}>
            Your focus session is done. {jailActive ? 'Your sentence was reduced.' : 'Parole points earned.'}
          </Text>
          <View style={styles.glyphWrap}><Text style={styles.glyph}>🎯</Text></View>
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
          <StampBadge label={focusSession.reducesJail ? 'Reducing Sentence' : 'Deep Focus'} tone="blue" />
          <Text style={styles.bigTitle}>Stay with it.</Text>

          <View style={styles.ringOuter}>
            <View style={styles.ring}>
              <Text style={styles.ringTime}>{formatCountdown(remaining)}</Text>
              <Text style={styles.ringLabel}>{focusSession.durationMinutes} min session</Text>
            </View>
          </View>

          <Text style={styles.bigSub}>
            {focusSession.reducesJail
              ? 'When the timer ends, your jail sentence drops.'
              : 'Phone down. Let the timer run.'}
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
            jailActive
              ? 'Run a focus session to cut your jail sentence.'
              : 'Run a focus session to earn parole points.'
          }
          assetKey="ASSET_JAIL_TIMER_HOURGLASS"
        />

        <View style={styles.durationGrid}>
          {DURATIONS.map((d) => {
            const on = minutes === d;
            return (
              <Pressable key={d} onPress={() => setMinutes(d)} style={[styles.durCard, on && styles.durCardOn]}>
                <Text style={[styles.durValue, on && styles.durValueOn]}>{d}</Text>
                <Text style={[styles.durUnit, on && styles.durUnitOn]}>minutes</Text>
              </Pressable>
            );
          })}
        </View>

        {jailActive ? (
          <CourtCard variant="glass">
            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Reduce my sentence</Text>
                <Text style={styles.toggleSub}>Apply this session toward your active jail time.</Text>
              </View>
              <Switch
                value={reduceJail}
                onValueChange={setReduceJail}
                thumbColor={colors.white}
                trackColor={{ true: colors.blue, false: 'rgba(120,120,128,0.22)' }}
                ios_backgroundColor="rgba(120,120,128,0.22)"
              />
            </View>
          </CourtCard>
        ) : null}

        <CourtButton title={`Start ${minutes}-minute Focus`} variant="primary" onPress={handleStart} />
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

  durationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  durCard: {
    flexGrow: 1,
    flexBasis: '45%',
    paddingVertical: 22,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(120,120,128,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(120,120,128,0.16)',
    alignItems: 'center',
    gap: 2,
  },
  durCardOn: { backgroundColor: 'rgba(0,122,255,0.12)', borderColor: colors.blue },
  durValue: { color: colors.label, fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  durValueOn: { color: colors.blue },
  durUnit: { color: colors.labelSecondary, fontSize: 13, fontWeight: '600' },
  durUnitOn: { color: colors.blue },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleText: { flex: 1, gap: 3 },
  toggleTitle: { color: colors.label, fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  toggleSub: { color: colors.labelSecondary, fontSize: 13, fontWeight: '400', lineHeight: 18 },

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
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.22)',
  },
  ringTime: { color: colors.label, fontSize: 44, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  ringLabel: { color: colors.labelSecondary, fontSize: 13, fontWeight: '600' },

  glyphWrap: { marginVertical: 4 },
  glyph: { fontSize: 72 },
});
