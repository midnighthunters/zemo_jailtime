import { StyleSheet, Text } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { colors, radius } from '@/src/constants/theme';

type StampBadgeProps = {
  label: string;
  tone?: 'danger' | 'success' | 'gold' | 'muted' | 'purple' | 'blue' | 'orange';
};

const toneMap: Record<NonNullable<StampBadgeProps['tone']>, { bg: string; text: string; border: string }> = {
  blue: {
    bg: 'rgba(0,122,255,0.12)',
    text: colors.blue,
    border: 'rgba(0,122,255,0.28)',
  },
  success: {
    bg: 'rgba(52,199,89,0.12)',
    text: colors.greenDark,
    border: 'rgba(52,199,89,0.3)',
  },
  gold: {
    bg: 'rgba(255,204,0,0.14)',
    text: '#B8860B',
    border: 'rgba(255,204,0,0.35)',
  },
  danger: {
    bg: 'rgba(255,59,48,0.1)',
    text: colors.red,
    border: 'rgba(255,59,48,0.28)',
  },
  purple: {
    bg: 'rgba(88,86,214,0.12)',
    text: colors.indigo,
    border: 'rgba(88,86,214,0.3)',
  },
  orange: {
    bg: 'rgba(255,149,0,0.12)',
    text: colors.orangeDark,
    border: 'rgba(255,149,0,0.3)',
  },
  muted: {
    bg: 'rgba(120,120,128,0.1)',
    text: colors.labelSecondary,
    border: 'rgba(120,120,128,0.2)',
  },
};

export function StampBadge({ label, tone = 'blue' }: StampBadgeProps) {
  const t = toneMap[tone] ?? toneMap.blue;
  return (
    <Animated.View
      entering={ZoomIn.duration(220).springify().damping(14)}
      style={[
        styles.badge,
        { backgroundColor: t.bg, borderColor: t.border },
      ]}
    >
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
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
