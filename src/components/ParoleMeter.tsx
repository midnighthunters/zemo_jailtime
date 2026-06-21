import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius } from '@/src/constants/theme';

type ParoleMeterProps = {
  value: number;
  label?: string;
};

export function ParoleMeter({ value, label = 'Parole chance' }: ParoleMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withSpring(clamped, {
      damping: 22,
      stiffness: 120,
      mass: 1.2,
    });
  }, [clamped, widthAnim]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
  }));

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{clamped}%</Text>
      </View>
      <View style={styles.track}>
        {/* Track inner shadow */}
        <View style={styles.trackInner} />
        <Animated.View style={[styles.fillMask, fillStyle]}>
          <LinearGradient
            colors={[colors.blue, colors.teal, colors.mint]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
          {/* Specular highlight on the bar */}
          <View style={styles.fillHighlight} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.label,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.08,
  },
  value: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  track: {
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,122,255,0.1)',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(0,122,255,0.12)',
  },
  trackInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  fillMask: {
    height: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
    minWidth: 9,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
  },
  fillHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
});
