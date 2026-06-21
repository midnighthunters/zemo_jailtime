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

export function LawCard({ law, locked, onToggle, delay = 0 }: LawCardProps) {
  const enforcementMode = law.enforcementMode ?? 'softBlock';
  const trigger = law.trigger ?? 'appLaunch';
  const permissionLabels = (law.requiredPermissionIds ?? [])
    .map((id) => permissionCopy(id)?.title)
    .filter((label): label is string => Boolean(label))
    .slice(0, 3);

  return (
    <Pressable onPress={onToggle}>
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            law.isEnabled && styles.enabled,
            pressed && styles.pressed,
          ]}
        >
          <AssetImage assetKey={law.assetKey} width={72} height={72} />
          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text style={styles.title} numberOfLines={1}>{law.name}</Text>
              <Switch
                value={law.isEnabled}
                onValueChange={onToggle}
                thumbColor={colors.white}
                trackColor={{ true: colors.blue, false: 'rgba(120,120,128,0.22)' }}
                ios_backgroundColor="rgba(120,120,128,0.22)"
              />
            </View>
            <Text style={styles.description} numberOfLines={2}>{law.description}</Text>
            <View style={styles.meta}>
              <StampBadge
                label={locked ? 'Pro' : law.category}
                tone={locked ? 'purple' : law.isEnabled ? 'success' : 'blue'}
              />
              <StampBadge
                label={enforcementMode}
                tone={enforcementMode === 'hardBlock' ? 'danger' : 'orange'}
              />
            </View>
            <View style={styles.details}>
              <Text style={styles.detail}>{trigger}</Text>
              <Text style={styles.detail}>{describesSchedule(law)}</Text>
              {permissionLabels.map((label) => (
                <Text key={label} style={styles.detail}>{label}</Text>
              ))}
              <Text style={styles.sentenceTag}>
                {law.firstPunishmentMinutes}–{law.maxSentenceMinutes} min
              </Text>
            </View>
          </View>
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
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    ...shadows.soft,
  },
  enabled: {
    backgroundColor: 'rgba(0,122,255,0.07)',
    borderColor: 'rgba(0,122,255,0.28)',
  },
  pressed: {
    opacity: 0.82,
  },
  body: {
    flex: 1,
    gap: 7,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.label,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  description: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  detail: {
    maxWidth: '100%',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(120,120,128,0.1)',
    color: colors.labelSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  sentenceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,149,0,0.1)',
    color: colors.orangeDark,
    fontSize: 11,
    fontWeight: '600',
  },
});
