import { StyleSheet, Text } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { colors, radius } from '@/src/constants/theme';

type StampBadgeProps = {
  label: string;
  tone?: 'danger' | 'success' | 'gold' | 'muted' | 'purple';
};

const toneColor = {
  danger: colors.danger,
  success: colors.successDark,
  gold: colors.deepGold,
  muted: colors.muted,
  purple: colors.purpleLight,
};

export function StampBadge({ label, tone = 'gold' }: StampBadgeProps) {
  const color = toneColor[tone];
  return (
    <Animated.View entering={ZoomIn.duration(220).springify().damping(13)} style={[styles.badge, { borderColor: color, backgroundColor: `${color}24` }]}>
      <Text style={[styles.text, { color }]}>{label.toUpperCase()}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    transform: [{ rotate: '-2deg' }],
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
  },
});
