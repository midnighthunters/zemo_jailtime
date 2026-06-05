import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, radius } from '@/src/constants/theme';

type ParoleMeterProps = {
  value: number;
  label?: string;
};

export function ParoleMeter({ value, label = 'Parole chance' }: ParoleMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clamped, { duration: 700 });
  }, [clamped, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{clamped}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fillMask, fillStyle]}>
          <LinearGradient colors={[colors.success, colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fill} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '900',
  },
  value: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  track: {
    height: 13,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 242, 210, 0.16)',
    overflow: 'hidden',
  },
  fillMask: {
    height: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    minWidth: 8,
    width: '100%',
    borderRadius: radius.pill,
  },
});
