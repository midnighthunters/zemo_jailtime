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

export function SuspectAppCard({ suspect, onPress, compact }: SuspectAppCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.card, compact && styles.compact, suspect.isSelected && styles.selected, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: suspect.iconColor }]}>
        <Text style={styles.iconText}>{suspect.displayName.slice(0, 1)}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{suspect.displayName}</Text>
        <Text style={styles.villain}>{suspect.villainName}</Text>
        {!compact ? <Text style={styles.meta}>{suspect.dailyOpenCount} opens · {suspect.dailyUsageMinutes} min today</Text> : null}
      </View>
      {suspect.isPremium ? <StampBadge label="Pro" tone="purple" /> : null}
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
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    ...shadows.soft,
  },
  compact: { flex: 1, minWidth: 150 },
  selected: { backgroundColor: '#FBFCFF', borderColor: '#C9D7F7', borderBottomColor: '#B9C8EF' },
  pressed: { transform: [{ translateY: 3 }], borderBottomWidth: 1.5, marginBottom: 2.5 },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  body: { flex: 1, gap: 2 },
  name: { color: colors.label, fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  villain: { color: colors.blue, fontSize: 12, fontWeight: '500' },
  meta: { color: colors.labelSecondary, fontSize: 11, fontWeight: '400', marginTop: 1 },
});
