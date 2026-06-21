import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import type { FocusCourtAssetKey } from '@/src/constants/assets';
import { radius, shadows } from '@/src/constants/theme';
import { AssetImage } from '@/src/components/AssetImage';

type CourtCardProps = {
  children: ReactNode;
  variant?: 'glass' | 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'dark' | 'parchment' | 'wood';
  style?: StyleProp<ViewStyle>;
  assetKey?: FocusCourtAssetKey;
  delay?: number;
};

// Glass card backgrounds
const variantStyles: Record<
  NonNullable<CourtCardProps['variant']>,
  { backgroundColor: string; borderColor: string; borderWidth: number }
> = {
  glass: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5,
  },
  blue: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderColor: 'rgba(0,122,255,0.25)',
    borderWidth: 1.5,
  },
  purple: {
    backgroundColor: 'rgba(88,86,214,0.1)',
    borderColor: 'rgba(175,82,222,0.3)',
    borderWidth: 1.5,
  },
  orange: {
    backgroundColor: 'rgba(255,149,0,0.1)',
    borderColor: 'rgba(255,149,0,0.28)',
    borderWidth: 1.5,
  },
  red: {
    backgroundColor: 'rgba(255,59,48,0.08)',
    borderColor: 'rgba(255,59,48,0.22)',
    borderWidth: 1.5,
  },
  green: {
    backgroundColor: 'rgba(52,199,89,0.08)',
    borderColor: 'rgba(52,199,89,0.25)',
    borderWidth: 1.5,
  },
  // Legacy aliases — mapped to glass variants
  dark: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1.5,
  },
  parchment: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: 'rgba(255,255,255,1)',
    borderWidth: 1.5,
  },
  wood: {
    backgroundColor: 'rgba(255,149,0,0.08)',
    borderColor: 'rgba(255,149,0,0.22)',
    borderWidth: 1.5,
  },
};

export function CourtCard({ children, variant = 'glass', style, assetKey, delay = 0 }: CourtCardProps) {
  const vs = variantStyles[variant];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: vs.backgroundColor,
          borderColor: vs.borderColor,
          borderWidth: vs.borderWidth,
        },
        style,
      ]}
    >
      {assetKey ? (
        <AssetImage assetKey={assetKey} width={92} height={92} absolute right={-8} bottom={-12} opacity={0.18} />
      ) : null}
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  inner: {
    padding: 16,
  },
});
