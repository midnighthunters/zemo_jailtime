import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { FocusLaw } from '@/src/types/court';
import { AssetImage } from '@/src/components/AssetImage';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';

type LawCardProps = {
  law: FocusLaw;
  locked?: boolean;
  onToggle: () => void;
};

export function LawCard({ law, locked, onToggle }: LawCardProps) {
  return (
    <Pressable onPress={onToggle} style={[styles.card, law.isEnabled && styles.enabled]}>
      <AssetImage assetKey={law.assetKey} width={82} height={82} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{law.name}</Text>
          <Switch value={law.isEnabled} onValueChange={onToggle} thumbColor={law.isEnabled ? colors.gold : colors.muted} trackColor={{ true: colors.deepGold, false: colors.woodDark }} />
        </View>
        <Text style={styles.description}>{law.description}</Text>
        <View style={styles.meta}>
          <StampBadge label={locked ? 'Supreme Court' : law.category} tone={locked ? 'purple' : law.isEnabled ? 'success' : 'gold'} />
          <Text style={styles.sentence}>{law.firstPunishmentMinutes}-{law.maxSentenceMinutes} min sentence</Text>
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
});
