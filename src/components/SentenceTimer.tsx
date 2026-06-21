import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '@/src/constants/theme';
import { formatCountdown } from '@/src/utils/format';

type SentenceTimerProps = {
  seconds: number;
};

export function SentenceTimer({ seconds }: SentenceTimerProps) {
  const low = seconds > 0 && seconds < 180;
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = low
      ? withRepeat(
          withSequence(withTiming(1, { duration: 500 }), withTiming(0, { duration: 500 })),
          -1,
          false,
        )
      : withTiming(0, { duration: 220 });
  }, [low, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 1 - pulse.value * 0.12,
    transform: [{ scale: 1 + pulse.value * 0.028 }],
  }));

  const timerColor = low ? colors.red : colors.label;

  return (
    <Animated.View entering={FadeIn.duration(260)} style={styles.root}>
      <View style={styles.pill}>
        <Text style={styles.pillLabel}>JAIL TIMER</Text>
      </View>
      <Animated.Text style={[styles.time, { color: timerColor }, pulseStyle]}>
        {formatCountdown(seconds)}
      </Animated.Text>
      <Text style={styles.copy}>
        Complete a focus action and the court may grant parole.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.22)',
  },
  pillLabel: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  time: {
    fontSize: 58,
    lineHeight: 64,
    fontWeight: '700',
    letterSpacing: -2,
  },
  copy: {
    color: colors.labelSecondary,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
