import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { colors } from '@/src/constants/theme';
import { formatCountdown } from '@/src/utils/format';

type SentenceTimerProps = {
  seconds: number;
};

export function SentenceTimer({ seconds }: SentenceTimerProps) {
  const low = seconds > 0 && seconds < 180;
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = low ? withRepeat(withSequence(withTiming(1, { duration: 520 }), withTiming(0, { duration: 520 })), -1, false) : withTiming(0, { duration: 220 });
  }, [low, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 1 - pulse.value * 0.1,
    transform: [{ scale: 1 + pulse.value * 0.035 }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(260)} style={styles.root}>
      <Text style={styles.label}>JAIL TIMER</Text>
      <Animated.Text style={[styles.time, low && styles.low, pulseStyle]}>{formatCountdown(seconds)}</Animated.Text>
      <Text style={styles.copy}>Complete one focus action and the court may consider parole.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  time: {
    color: colors.cream,
    fontSize: 54,
    lineHeight: 60,
    fontWeight: '900',
  },
  low: {
    color: colors.danger,
  },
  copy: {
    color: colors.parchment,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
