import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, radius } from '@/src/constants/theme';

type ParoleMeterProps = { value: number; label?: string };

export function ParoleMeter({ value, label = 'Parole chance' }: ParoleMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const widthAnim = useSharedValue(0);
  useEffect(() => {
    widthAnim.value = withSpring(clamped, { damping: 22, stiffness: 120, mass: 1.2 });
  }, [clamped, widthAnim]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${widthAnim.value}%` }));

  return (
    <View style={styles.root}>
      <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{clamped}%</Text></View>
      <View style={styles.track}><Animated.View style={[styles.fill, fillStyle]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: colors.label, fontSize: 13, fontWeight: '500', letterSpacing: -0.08 },
  value: { color: colors.blue, fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  track: { height: 10, borderRadius: radius.pill, backgroundColor: colors.blueLight, overflow: 'hidden', borderWidth: 1, borderColor: '#D5E0F8' },
  fill: { height: '100%', minWidth: 9, borderRadius: radius.pill, backgroundColor: colors.blue },
});
