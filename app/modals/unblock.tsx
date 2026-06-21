import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CourtBackground } from '@/src/components/CourtBackground';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { MAX_UNBLOCK_MINUTES, useCourtStore } from '@/src/store/useCourtStore';

const BREATH_MS = 4000;
const HOLD_MS = 3000;
const DURATIONS = [5, 10, MAX_UNBLOCK_MINUTES];

type Stage = 'breathe' | 'duration' | 'done';

export default function UnblockModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ appId?: string }>();
  const suspect = useCourtStore((s) => s.suspects.find((item) => item.id === params.appId));
  const unblockApp = useCourtStore((s) => s.unblockApp);

  const [stage, setStage] = useState<Stage>('breathe');
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [minutes, setMinutes] = useState<number>(DURATIONS[DURATIONS.length - 1]);

  const orb = useSharedValue(0.6);
  const holdProgress = useSharedValue(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Breathing loop + phase text toggle.
  useEffect(() => {
    orb.value = withRepeat(
      withSequence(
        withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: BREATH_MS, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    const id = setInterval(() => setPhase((p) => (p === 'in' ? 'out' : 'in')), BREATH_MS);
    return () => {
      clearInterval(id);
      cancelAnimation(orb);
    };
  }, [orb]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.7 + orb.value * 0.4 }],
    opacity: 0.55 + orb.value * 0.35,
  }));
  const holdFillStyle = useAnimatedStyle(() => ({ width: `${holdProgress.value * 100}%` }));

  const completeHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setStage((s) => {
      if (s !== 'breathe') return s;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return 'duration';
    });
  };

  const startHold = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    holdProgress.value = withTiming(1, { duration: HOLD_MS, easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(completeHold)();
    });
    holdTimer.current = setTimeout(completeHold, HOLD_MS + 40);
  };

  const cancelHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    cancelAnimation(holdProgress);
    holdProgress.value = withTiming(0, { duration: 220 });
  };

  useEffect(() => () => { if (holdTimer.current) clearTimeout(holdTimer.current); }, []);

  const confirmUnblock = () => {
    if (params.appId) unblockApp(params.appId, minutes);
    setStage('done');
  };

  const appName = suspect?.displayName ?? 'this app';

  return (
    <CourtBackground>
      <View style={styles.content}>
        {stage === 'breathe' ? (
          <>
            <StampBadge label="Pause Before You Open" tone="blue" />
            <Text style={styles.title}>Breathe.</Text>
            <Text style={styles.subtitle}>
              Before unlocking {appName}, take a moment. Follow the circle.
            </Text>

            <View style={styles.orbWrap}>
              <Animated.View style={[styles.orb, orbStyle]} />
              <View style={styles.orbCore}>
                <Text style={styles.phaseText}>{phase === 'in' ? 'Breathe in' : 'Breathe out'}</Text>
              </View>
            </View>

            <Text style={styles.holdHint}>Press and hold to unlock</Text>
            <Pressable
              onPressIn={startHold}
              onPressOut={cancelHold}
              style={styles.holdBtn}
            >
              <Animated.View style={[styles.holdFill, holdFillStyle]} />
              <Text style={styles.holdLabel}>Hold to Unblock</Text>
            </Pressable>

            <CourtButton title="Never mind" variant="ghost" onPress={() => router.back()} />
          </>
        ) : null}

        {stage === 'duration' ? (
          <>
            <StampBadge label="Temporary Access" tone="gold" />
            <Text style={styles.title}>How long?</Text>
            <Text style={styles.subtitle}>
              The court allows {appName} for up to {MAX_UNBLOCK_MINUTES} minutes. It re-locks automatically.
            </Text>

            <View style={styles.durationRow}>
              {DURATIONS.map((d) => {
                const on = minutes === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setMinutes(d)}
                    style={[styles.durationCard, on && styles.durationCardOn]}
                  >
                    <Text style={[styles.durationValue, on && styles.durationValueOn]}>{d}</Text>
                    <Text style={[styles.durationUnit, on && styles.durationUnitOn]}>min</Text>
                  </Pressable>
                );
              })}
            </View>

            <CourtCard variant="orange">
              <Text style={styles.warnText}>
                ⏳ {appName} unlocks for {minutes} min, then returns to custody.
              </Text>
            </CourtCard>

            <CourtButton title={`Unlock for ${minutes} min`} variant="primary" onPress={confirmUnblock} />
            <CourtButton title="Cancel" variant="ghost" onPress={() => router.back()} />
          </>
        ) : null}

        {stage === 'done' ? (
          <>
            <StampBadge label="Access Granted" tone="success" />
            <Text style={styles.title}>{appName} is open.</Text>
            <Text style={styles.subtitle}>
              You have {minutes} minutes. Use them with intention — the lock returns when time runs out.
            </Text>
            <View style={styles.doneGlyphWrap}>
              <Text style={styles.doneGlyph}>🔓</Text>
            </View>
            <CourtButton title="Done" variant="green" onPress={() => router.back()} />
          </>
        ) : null}
      </View>
    </CourtBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 8,
  },
  title: { color: colors.label, fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: {
    color: colors.labelSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  // breathing orb
  orbWrap: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  orb: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 120,
    backgroundColor: 'rgba(0,122,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.3)',
  },
  orbCore: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: { color: colors.blue, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },

  holdHint: { color: colors.labelTertiary, fontSize: 13, fontWeight: '500' },
  holdBtn: {
    width: '100%',
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,122,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.soft,
  },
  holdFill: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0,122,255,0.32)',
  },
  holdLabel: { color: colors.blue, fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },

  // duration
  durationRow: { flexDirection: 'row', gap: 12, marginVertical: 4 },
  durationCard: {
    width: 86,
    paddingVertical: 18,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(120,120,128,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(120,120,128,0.16)',
    alignItems: 'center',
    gap: 2,
  },
  durationCardOn: { backgroundColor: 'rgba(0,122,255,0.12)', borderColor: colors.blue },
  durationValue: { color: colors.label, fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  durationValueOn: { color: colors.blue },
  durationUnit: { color: colors.labelSecondary, fontSize: 13, fontWeight: '600' },
  durationUnitOn: { color: colors.blue },
  warnText: { color: colors.label, fontSize: 14, fontWeight: '500', lineHeight: 20 },

  doneGlyphWrap: { marginVertical: 8 },
  doneGlyph: { fontSize: 72 },
});
