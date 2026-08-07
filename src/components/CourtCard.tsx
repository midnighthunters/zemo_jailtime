import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import type { FocusCourtAssetKey } from '@/src/constants/assets';
import { AssetImage } from '@/src/components/AssetImage';
import { colors, radius, shadows } from '@/src/constants/theme';

type CourtCardProps = {
  children: ReactNode;
  variant?: 'glass' | 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'dark' | 'parchment' | 'wood';
  style?: StyleProp<ViewStyle>;
  assetKey?: FocusCourtAssetKey;
  delay?: number;
  pressable?: boolean;
  onPress?: () => void;
};

type VariantConfig = {
  accent: string;
  wash: string;
  border: string;
};

const variantMap: Record<NonNullable<CourtCardProps['variant']>, VariantConfig> = {
  glass: { accent: colors.borderStrong, wash: '#FAFBFC', border: colors.border },
  blue: { accent: colors.blue, wash: colors.blueLight, border: '#D8E3FA' },
  purple: { accent: colors.indigo, wash: colors.purpleLight, border: '#E2DCF5' },
  orange: { accent: colors.orange, wash: colors.orangeLight, border: '#F2DFCB' },
  red: { accent: colors.red, wash: colors.redLight, border: '#F1D8DA' },
  green: { accent: colors.green, wash: colors.greenLight, border: '#D2EADD' },
  dark: { accent: colors.label, wash: colors.surfaceMuted, border: colors.borderStrong },
  parchment: { accent: colors.orange, wash: '#FFF9F1', border: '#ECE1D4' },
  wood: { accent: colors.orangeDark, wash: colors.wood, border: '#EADBC8' },
};

export function CourtCard({
  children,
  variant = 'glass',
  style,
  assetKey,
  pressable = false,
  onPress,
}: CourtCardProps) {
  const config = variantMap[variant];
  const interactive = pressable || Boolean(onPress);

  const content = (
    <>
      <View style={[styles.wash, { backgroundColor: config.wash }]} pointerEvents="none" />
      <View style={[styles.accent, { backgroundColor: config.accent }]} pointerEvents="none" />
      {assetKey ? (
        <AssetImage assetKey={assetKey} width={88} height={88} absolute right={-6} bottom={-10} opacity={0.13} />
      ) : null}
      <View style={styles.inner}>{children}</View>
    </>
  );

  if (interactive) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { borderColor: config.border },
          style,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, { borderColor: config.border }, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    overflow: 'hidden',
    ...shadows.card,
  },
  pressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 1,
    shadowOpacity: 0.025,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  wash: {
    position: 'absolute',
    top: -44,
    right: -36,
    width: 126,
    height: 126,
    borderRadius: 63,
    opacity: 0.74,
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 22,
    width: 38,
    height: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  inner: {
    padding: 20,
  },
});
