import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, LinearTransition, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { AppSuspect } from '@/src/types/court';
import { colors, radius, shadows } from '@/src/constants/theme';
import { StampBadge } from '@/src/components/StampBadge';

type SuspectAppCardProps = {
  suspect: AppSuspect;
  onPress?: () => void;
  compact?: boolean;
  delay?: number;
};

export function SuspectAppCard({ suspect, onPress, compact, delay = 0 }: SuspectAppCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 14, stiffness: 260 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
    >
      <Animated.View entering={FadeInUp.duration(260).delay(delay).springify().damping(18)} layout={LinearTransition.springify().damping(18)} style={[styles.card, compact && styles.compact, suspect.isSelected && styles.selected, animatedStyle]}>
        <View style={[styles.icon, { backgroundColor: suspect.iconColor }]}>
          <Text style={styles.iconText}>{suspect.displayName.slice(0, 1)}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.name}>{suspect.displayName}</Text>
          <Text style={styles.villain}>{suspect.villainName}</Text>
          {!compact ? (
            <Text style={styles.meta}>{suspect.dailyOpenCount} opens | {suspect.dailyUsageMinutes} min today</Text>
          ) : null}
        </View>
        {suspect.isPremium ? <StampBadge label="Pro" tone="purple" /> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 242, 210, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.14)',
    ...shadows.soft,
  },
  compact: {
    flex: 1,
    minWidth: 150,
  },
  selected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(255, 200, 61, 0.14)',
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  iconText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '900',
  },
  villain: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  meta: {
    color: colors.parchment,
    fontSize: 11,
    fontWeight: '700',
  },
});
