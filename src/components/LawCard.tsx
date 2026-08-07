import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
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

export function LawCard({ law, locked, onToggle }: LawCardProps) {
  const enforcementMode = law.enforcementMode ?? 'softBlock';
  const trigger = law.trigger ?? 'appLaunch';
  const permissionLabels = (law.requiredPermissionIds ?? [])
    .map((id) => permissionCopy(id)?.title)
    .filter((label): label is string => Boolean(label))
    .slice(0, 3);

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: law.isEnabled, disabled: locked }}
      style={({ pressed }) => [styles.card, law.isEnabled && styles.enabled, pressed && styles.pressed]}
    >
      <View style={[styles.assetStage, law.isEnabled && styles.assetStageEnabled]}>
        <AssetImage assetKey={law.assetKey} width={58} height={58} />
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>{law.name}</Text>
          <Switch
            value={law.isEnabled}
            onValueChange={onToggle}
            disabled={locked}
            thumbColor={colors.white}
            trackColor={{ true: colors.blue, false: colors.fillPrimary }}
            ios_backgroundColor={colors.fillPrimary}
          />
        </View>
        <Text style={styles.description} numberOfLines={2}>{law.description}</Text>
        <View style={styles.meta}>
          <StampBadge label={locked ? 'Pro' : law.category} tone={locked ? 'purple' : law.isEnabled ? 'success' : 'blue'} />
          <StampBadge label={enforcementMode} tone={enforcementMode === 'hardBlock' ? 'danger' : 'orange'} />
        </View>
        <View style={styles.details}>
          <Text style={styles.detail}>{trigger}</Text>
          <Text style={styles.detail}>{describesSchedule(law)}</Text>
          {permissionLabels.map((label) => <Text key={label} style={styles.detail}>{label}</Text>)}
          <Text style={styles.sentenceTag}>{law.firstPunishmentMinutes}–{law.maxSentenceMinutes} min</Text>
        </View>
      </View>
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
  enabled: {
    backgroundColor: '#FBFCFF',
    borderColor: '#CAD7F7',
    borderBottomColor: '#B9C8EF',
  },
  pressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 1.5,
    marginBottom: 2.5,
  },
  assetStage: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  assetStageEnabled: { backgroundColor: colors.blueLight },
  body: { flex: 1, gap: 7 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, color: colors.label, fontSize: 15, lineHeight: 20, fontWeight: '600', letterSpacing: -0.2 },
  description: { color: colors.labelSecondary, fontSize: 13, lineHeight: 17, fontWeight: '400' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  detail: {
    maxWidth: '100%',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    color: colors.labelSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  sentenceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.orangeLight,
    color: colors.orangeDark,
    fontSize: 11,
    fontWeight: '600',
  },
});
