import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import type { FocusCourtAssetKey } from '@/src/constants/assets';
import { colors, radius, shadows } from '@/src/constants/theme';
import { AssetImage } from '@/src/components/AssetImage';

type CourtCardProps = {
  children: ReactNode;
  variant?: 'wood' | 'parchment' | 'dark' | 'purple';
  style?: StyleProp<ViewStyle>;
  assetKey?: FocusCourtAssetKey;
};

const variants = {
  wood: [colors.wood, colors.woodDark],
  parchment: [colors.parchment, colors.parchmentDark],
  dark: ['#32150E', '#1B0B08'],
  purple: [colors.purpleLight, colors.purple],
} as const;

export function CourtCard({ children, variant = 'wood', style, assetKey }: CourtCardProps) {
  return (
    <LinearGradient colors={variants[variant]} style={[styles.card, style]}>
      {assetKey ? <AssetImage assetKey={assetKey} width={92} height={92} absolute right={-8} bottom={-12} opacity={0.24} /> : null}
      <View style={styles.inner}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.18)',
    overflow: 'hidden',
    ...shadows.card,
  },
  inner: {
    padding: 16,
  },
});
