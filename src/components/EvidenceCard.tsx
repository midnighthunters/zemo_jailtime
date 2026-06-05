import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInLeft, LinearTransition } from 'react-native-reanimated';
import type { FocusCourtAssetKey } from '@/src/constants/assets';
import { AssetImage } from '@/src/components/AssetImage';
import { colors, radius, shadows } from '@/src/constants/theme';

type EvidenceCardProps = {
  exhibit: string;
  text: string;
  severity?: 1 | 2 | 3 | 4 | 5;
  assetKey: FocusCourtAssetKey;
  delay?: number;
};

export function EvidenceCard({ exhibit, text, severity = 3, assetKey, delay = 0 }: EvidenceCardProps) {
  const color = severity >= 4 ? colors.danger : severity >= 3 ? colors.deepGold : colors.successDark;
  return (
    <Animated.View entering={FadeInLeft.duration(300).delay(delay).springify().damping(18)} layout={LinearTransition.springify().damping(18)} style={styles.card}>
      <AssetImage assetKey={assetKey} width={74} height={74} />
      <View style={styles.body}>
        <Text style={[styles.exhibit, { color }]}>{exhibit}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.parchment,
    borderWidth: 2,
    borderColor: colors.parchmentDark,
    ...shadows.soft,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  exhibit: {
    fontSize: 12,
    fontWeight: '900',
  },
  text: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
});
