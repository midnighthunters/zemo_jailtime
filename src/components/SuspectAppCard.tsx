import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            compact && styles.compact,
            suspect.isSelected && styles.selected,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.icon, { backgroundColor: suspect.iconColor }]}>
            <Text style={styles.iconText}>{suspect.displayName.slice(0, 1)}</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.name}>{suspect.displayName}</Text>
            <Text style={styles.villain}>{suspect.villainName}</Text>
            {!compact ? (
              <Text style={styles.meta}>
                {suspect.dailyOpenCount} opens · {suspect.dailyUsageMinutes} min today
              </Text>
            ) : null}
          </View>
          {suspect.isPremium ? <StampBadge label="Pro" tone="purple" /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.88)',
    ...shadows.soft,
  },
  compact: {
    flex: 1,
    minWidth: 150,
  },
  selected: {
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderColor: 'rgba(0,122,255,0.3)',
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.label,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  villain: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '500',
  },
  meta: {
    color: colors.labelSecondary,
    fontSize: 11,
    fontWeight: '400',
    marginTop: 1,
  },
});
