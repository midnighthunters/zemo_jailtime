import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInRight, LinearTransition, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { FocusLaw } from '@/src/types/court';
import { AssetImage } from '@/src/components/AssetImage';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { permissionCopy } from '@/src/data/permissions';
import { describesSchedule } from '@/src/utils/lawPolicy';

type LawCardProps = {
  law: FocusLaw;
  locked?: boolean;
  onToggle: () => void;
  delay?: number;
};

export function LawCard({ law, locked, onToggle, delay = 0 }: LawCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const enforcementMode = law.enforcementMode ?? 'softBlock';
  const trigger = law.trigger ?? 'appLaunch';
  const permissionLabels = (law.requiredPermissionIds ?? [])
    .map((id) => permissionCopy(id)?.title)
    .filter((label): label is string => Boolean(label))
    .slice(0, 3);

  return (
    <Pressable
      onPress={onToggle}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 14, stiffness: 260 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
    >
      <Animated.View entering={FadeInRight.duration(300).delay(delay).springify().damping(18)} layout={LinearTransition.springify().damping(18)} style={[styles.card, law.isEnabled && styles.enabled, animatedStyle]}>
        <AssetImage assetKey={law.assetKey} width={82} height={82} />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={styles.title}>{law.name}</Text>
            <Switch value={law.isEnabled} onValueChange={onToggle} thumbColor={law.isEnabled ? colors.gold : colors.muted} trackColor={{ true: colors.deepGold, false: colors.woodDark }} />
          </View>
          <Text style={styles.description}>{law.description}</Text>
          <View style={styles.meta}>
            <StampBadge label={locked ? 'Supreme Court' : law.category} tone={locked ? 'purple' : law.isEnabled ? 'success' : 'gold'} />
            <StampBadge label={enforcementMode} tone={enforcementMode === 'hardBlock' ? 'purple' : 'gold'} />
            <Text style={styles.sentence}>{law.firstPunishmentMinutes}-{law.maxSentenceMinutes} min sentence</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.detail}>{trigger}</Text>
            <Text style={styles.detail}>{describesSchedule(law)}</Text>
            {permissionLabels.map((label) => (
              <Text key={label} style={styles.detail}>{label}</Text>
            ))}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(58, 29, 17, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.16)',
    ...shadows.soft,
  },
  enabled: {
    borderColor: colors.gold,
  },
  body: {
    flex: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.cream,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  description: {
    color: colors.parchment,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sentence: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detail: {
    maxWidth: '100%',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 242, 210, 0.08)',
    color: colors.parchment,
    fontSize: 10,
    fontWeight: '900',
  },
});
