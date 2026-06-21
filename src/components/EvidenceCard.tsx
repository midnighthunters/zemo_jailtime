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

function severityStyle(severity: number) {
  if (severity >= 5) return { bg: colors.glassRed, border: 'rgba(255,59,48,0.22)', label: colors.red };
  if (severity >= 4) return { bg: colors.glassOrange, border: 'rgba(255,149,0,0.22)', label: colors.orangeDark };
  if (severity >= 3) return { bg: colors.glassAmber, border: 'rgba(255,204,0,0.22)', label: '#B8860B' };
  return { bg: colors.glassGreen, border: 'rgba(52,199,89,0.2)', label: colors.greenDark };
}

export function EvidenceCard({ exhibit, text, severity = 3, assetKey, delay = 0 }: EvidenceCardProps) {
  const sty = severityStyle(severity);

  return (
    <View style={[styles.card, { backgroundColor: sty.bg, borderColor: sty.border }]}>
      <AssetImage assetKey={assetKey} width={64} height={64} />
      <View style={styles.body}>
        <Text style={[styles.exhibit, { color: sty.label }]}>{exhibit}</Text>
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
    borderWidth: 1.5,
    ...shadows.soft,
  },
  body: {
    flex: 1,
    gap: 5,
  },
  exhibit: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  text: {
    color: colors.label,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400',
  },
});
