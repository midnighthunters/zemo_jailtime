import { StyleSheet, Text, View } from 'react-native';
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

function severityConfig(severity: number) {
  if (severity >= 5) return { tint: colors.redLight, edge: colors.red, label: colors.redDark };
  if (severity >= 4) return { tint: colors.orangeLight, edge: colors.orange, label: colors.orangeDark };
  if (severity >= 3) return { tint: colors.yellowLight, edge: colors.yellow, label: colors.yellowDark };
  return { tint: colors.greenLight, edge: colors.green, label: colors.greenDark };
}

export function EvidenceCard({ exhibit, text, severity = 3, assetKey }: EvidenceCardProps) {
  const cfg = severityConfig(severity);

  return (
    <View style={[styles.card, { borderLeftColor: cfg.edge }]}>
      <View style={[styles.assetStage, { backgroundColor: cfg.tint }]}>
        <AssetImage assetKey={assetKey} width={54} height={54} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.exhibit, { color: cfg.label }]}>{exhibit}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderLeftWidth: 4,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    ...shadows.soft,
  },
  assetStage: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  body: {
    flex: 1,
    gap: 5,
  },
  exhibit: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  text: {
    color: colors.label,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
});
