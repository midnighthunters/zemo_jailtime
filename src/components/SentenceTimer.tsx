import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, shadows } from '@/src/constants/theme';
import { formatCountdown } from '@/src/utils/format';

type SentenceTimerProps = {
  seconds: number;
};

export function SentenceTimer({ seconds }: SentenceTimerProps) {
  const low = seconds > 0 && seconds < 180;
  const pulse = useSharedValue(0);
  const ringScale = useSharedValue(1);

  useEffect(() => {
    if (low) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 520 }),
          withTiming(0, { duration: 520 }),
        ),
        -1,
        false,
      );
      ringScale.value = withRepeat(
        withSequence(
          withSpring(1.04, { damping: 10, stiffness: 200 }),
          withSpring(1, { damping: 10, stiffness: 200 }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(0, { duration: 300 });
      ringScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  }, [low, pulse, ringScale]);

  const timerStyle = useAnimatedStyle(() => ({
    opacity: 1 - pulse.value * 0.1,
    transform: [{ scale: 1 + pulse.value * 0.025 }],
  }));

  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const timerColor = low ? colors.red : colors.label;

  return (
    <Animated.View entering={FadeIn.duration(320)} style={styles.root}>
      {/* Pill label */}
      <View style={styles.pillOuter}>
        {Platform.OS !== 'web' ? (
          <BlurView
            blurType="systemUltraThinMaterial"
            blurAmount={12}
            style={StyleSheet.absoluteFillObject}
            reducedTransparencyFallbackColor="rgba(255,59,48,0.1)"
          />
        ) : null}
        <View style={[StyleSheet.absoluteFillObject, styles.pillTint]} />
        <View style={styles.pillHighlight} />
        <Text style={styles.pillLabel}>JAIL TIMER</Text>
      </View>

      {/* Timer display — floating glass ring */}
      <Animated.View style={[styles.timerRingOuter, outerRingStyle]}>
        <View style={styles.timerRing}>
          {Platform.OS !== 'web' ? (
            <BlurView
              blurType="systemUltraThinMaterial"
              blurAmount={14}
              style={StyleSheet.absoluteFillObject}
              reducedTransparencyFallbackColor="rgba(255,255,255,0.8)"
            />
          ) : null}
          <View style={[StyleSheet.absoluteFillObject, styles.timerTint, low && styles.timerTintLow]} />
          <View style={styles.timerHighlight} />

          <Animated.Text style={[styles.time, { color: timerColor }, timerStyle]}>
            {formatCountdown(seconds)}
          </Animated.Text>
        </View>
      </Animated.View>

      <Text style={styles.copy}>
        Complete a focus action and the court may grant parole.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 12,
  },
  pillOuter: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.22)',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  pillTint: {
    backgroundColor: 'rgba(255,59,48,0.08)',
    borderRadius: radius.pill,
  },
  pillHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
  pillLabel: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
  },

  // Outer animated ring
  timerRingOuter: {
    borderRadius: radius.xl,
    ...shadows.card,
  },
  timerRing: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    paddingHorizontal: 28,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  timerTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
  },
  timerTintLow: {
    backgroundColor: 'rgba(255,59,48,0.05)',
  },
  timerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },

  time: {
    fontSize: 60,
    lineHeight: 68,
    fontWeight: '700',
    letterSpacing: -2.5,
  },
  copy: {
    color: colors.labelSecondary,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: -0.1,
    paddingHorizontal: 8,
  },
});
