import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, Text, View } from 'react-native';
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

type SeverityConfig = {
  tint: string;
  border: string;
  label: string;
  highlight: string;
};

function severityConfig(severity: number): SeverityConfig {
  if (severity >= 5)
    return {
      tint: 'rgba(255,59,48,0.06)',
      border: 'rgba(255,59,48,0.2)',
      label: colors.red,
      highlight: 'rgba(255,120,120,0.18)',
    };
  if (severity >= 4)
    return {
      tint: 'rgba(255,149,0,0.06)',
      border: 'rgba(255,149,0,0.2)',
      label: colors.orangeDark,
      highlight: 'rgba(255,200,100,0.18)',
    };
  if (severity >= 3)
    return {
      tint: 'rgba(255,204,0,0.06)',
      border: 'rgba(255,204,0,0.2)',
      label: '#9E7000',
      highlight: 'rgba(255,220,80,0.16)',
    };
  return {
    tint: 'rgba(52,199,89,0.05)',
    border: 'rgba(52,199,89,0.18)',
    label: colors.greenDark,
    highlight: 'rgba(100,230,130,0.16)',
  };
}

export function EvidenceCard({ exhibit, text, severity = 3, assetKey, delay = 0 }: EvidenceCardProps) {
  const cfg = severityConfig(severity);

  return (
    <View style={[styles.card, { borderColor: cfg.border }]}>
      {/* Native glass blur */}
      {Platform.OS !== 'web' ? (
        <BlurView
          tint="systemUltraThinMaterial"
          intensity={18}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.72)' }]} />
      )}
      {/* Color tint */}
      <View style={[StyleSheet.absoluteFillObject, styles.tint, { backgroundColor: cfg.tint }]} />
      {/* Specular highlight */}
      <View style={[styles.highlight, { backgroundColor: cfg.highlight }]} />

      {/* Content */}
      <View style={styles.inner}>
        <AssetImage assetKey={assetKey} width={60} height={60} />
        <View style={styles.body}>
          <Text style={[styles.exhibit, { color: cfg.label }]}>{exhibit}</Text>
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    ...shadows.soft,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  inner: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 14,
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
