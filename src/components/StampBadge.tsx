import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { colors, radius } from '@/src/constants/theme';

type StampBadgeProps = {
  label: string;
  tone?: 'danger' | 'success' | 'gold' | 'muted' | 'purple' | 'blue' | 'orange';
};

const toneMap: Record<
  NonNullable<StampBadgeProps['tone']>,
  { tint: string; text: string; border: string; glow: string }
> = {
  blue: {
    tint: 'rgba(0,122,255,0.1)',
    text: colors.blue,
    border: 'rgba(0,122,255,0.26)',
    glow: 'rgba(0,122,255,0.15)',
  },
  success: {
    tint: 'rgba(52,199,89,0.1)',
    text: colors.greenDark,
    border: 'rgba(52,199,89,0.28)',
    glow: 'rgba(52,199,89,0.14)',
  },
  gold: {
    tint: 'rgba(255,204,0,0.12)',
    text: '#9E7000',
    border: 'rgba(255,204,0,0.32)',
    glow: 'rgba(255,204,0,0.16)',
  },
  danger: {
    tint: 'rgba(255,59,48,0.08)',
    text: colors.red,
    border: 'rgba(255,59,48,0.26)',
    glow: 'rgba(255,59,48,0.14)',
  },
  purple: {
    tint: 'rgba(88,86,214,0.1)',
    text: colors.indigo,
    border: 'rgba(88,86,214,0.28)',
    glow: 'rgba(88,86,214,0.14)',
  },
  orange: {
    tint: 'rgba(255,149,0,0.1)',
    text: colors.orangeDark,
    border: 'rgba(255,149,0,0.28)',
    glow: 'rgba(255,149,0,0.14)',
  },
  muted: {
    tint: 'rgba(120,120,128,0.08)',
    text: colors.labelSecondary,
    border: 'rgba(120,120,128,0.18)',
    glow: 'rgba(120,120,128,0.08)',
  },
};

export function StampBadge({ label, tone = 'blue' }: StampBadgeProps) {
  const t = toneMap[tone] ?? toneMap.blue;

  return (
    <Animated.View
      entering={ZoomIn.duration(240).springify().damping(14)}
      style={[styles.badge, { borderColor: t.border }]}
    >
      {Platform.OS !== 'web' ? (
        <BlurView
          tint="systemUltraThinMaterial"
          intensity={12}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      {/* Color tint overlay */}
      <View style={[StyleSheet.absoluteFillObject, styles.tintFill, { backgroundColor: t.tint }]} />
      {/* Specular top edge */}
      <View style={styles.highlight} />

      <Text style={[styles.text, { color: t.text }]}>{label.toUpperCase()}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tintFill: {
    borderRadius: radius.pill,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
