import { BlurView, type BlurTint } from 'expo-blur';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { FocusCourtAssetKey } from '@/src/constants/assets';
import { radius, shadows } from '@/src/constants/theme';
import { AssetImage } from '@/src/components/AssetImage';

type CourtCardProps = {
  children: ReactNode;
  variant?: 'glass' | 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'dark' | 'parchment' | 'wood';
  style?: StyleProp<ViewStyle>;
  assetKey?: FocusCourtAssetKey;
  delay?: number;
  pressable?: boolean;
  onPress?: () => void;
};

// expo-blur tint values + intensity (1–100) for each glass variant
type VariantConfig = {
  tintColor: string;   // transparent color overlay on top of blur
  borderColor: string;
  borderWidth: number;
  highlightColor: string; // specular top-edge
  blurTint: BlurTint;
  blurIntensity: number;  // 1–100
  fallbackBg: string;
};

const variantMap: Record<NonNullable<CourtCardProps['variant']>, VariantConfig> = {
  glass: {
    tintColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    highlightColor: 'rgba(255,255,255,0.28)',
    blurTint: 'systemUltraThinMaterial',
    blurIntensity: 80,
    fallbackBg: 'rgba(255,255,255,0.72)',
  },
  blue: {
    tintColor: 'rgba(0,122,255,0.06)',
    borderColor: 'rgba(0,122,255,0.22)',
    borderWidth: 1,
    highlightColor: 'rgba(255,255,255,0.22)',
    blurTint: 'systemUltraThinMaterial',
    blurIntensity: 80,
    fallbackBg: 'rgba(0,122,255,0.1)',
  },
  purple: {
    tintColor: 'rgba(88,86,214,0.06)',
    borderColor: 'rgba(175,82,222,0.26)',
    borderWidth: 1,
    highlightColor: 'rgba(255,255,255,0.2)',
    blurTint: 'systemUltraThinMaterial',
    blurIntensity: 80,
    fallbackBg: 'rgba(88,86,214,0.1)',
  },
  orange: {
    tintColor: 'rgba(255,149,0,0.06)',
    borderColor: 'rgba(255,149,0,0.24)',
    borderWidth: 1,
    highlightColor: 'rgba(255,220,130,0.22)',
    blurTint: 'systemThinMaterial',
    blurIntensity: 70,
    fallbackBg: 'rgba(255,149,0,0.1)',
  },
  red: {
    tintColor: 'rgba(255,59,48,0.06)',
    borderColor: 'rgba(255,59,48,0.2)',
    borderWidth: 1,
    highlightColor: 'rgba(255,150,140,0.2)',
    blurTint: 'systemThinMaterial',
    blurIntensity: 70,
    fallbackBg: 'rgba(255,59,48,0.08)',
  },
  green: {
    tintColor: 'rgba(52,199,89,0.06)',
    borderColor: 'rgba(52,199,89,0.22)',
    borderWidth: 1,
    highlightColor: 'rgba(140,255,180,0.2)',
    blurTint: 'systemUltraThinMaterial',
    blurIntensity: 80,
    fallbackBg: 'rgba(52,199,89,0.08)',
  },
  dark: {
    tintColor: 'rgba(28,28,30,0.12)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    highlightColor: 'rgba(255,255,255,0.15)',
    blurTint: 'systemMaterial',
    blurIntensity: 90,
    fallbackBg: 'rgba(255,255,255,0.72)',
  },
  parchment: {
    tintColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    highlightColor: 'rgba(255,255,255,0.3)',
    blurTint: 'systemChromeMaterial',
    blurIntensity: 90,
    fallbackBg: 'rgba(255,255,255,0.82)',
  },
  wood: {
    tintColor: 'rgba(255,149,0,0.05)',
    borderColor: 'rgba(255,149,0,0.2)',
    borderWidth: 1,
    highlightColor: 'rgba(255,220,130,0.18)',
    blurTint: 'systemThinMaterial',
    blurIntensity: 70,
    fallbackBg: 'rgba(255,149,0,0.08)',
  },
};

export function CourtCard({
  children,
  variant = 'glass',
  style,
  assetKey,
  delay = 0,
  pressable = false,
  onPress,
}: CourtCardProps) {
  const cfg = variantMap[variant];

  const gesture = Gesture.Tap()
    .onFinalize(() => {
      if (onPress) onPress();
    });

  const cardContent = (
    <View style={styles.inner}>
      {assetKey ? (
        <AssetImage assetKey={assetKey} width={92} height={92} absolute right={-8} bottom={-12} opacity={0.18} />
      ) : null}
      {children}
    </View>
  );

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[
          styles.card,
          { borderColor: cfg.borderColor, borderWidth: cfg.borderWidth },
          style,
        ]}
      >
        {/* Native blur base — the core of the glass effect */}
        {Platform.OS !== 'web' ? (
          <BlurView
            tint={cfg.blurTint}
            intensity={cfg.blurIntensity}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: cfg.fallbackBg }]} />
        )}

        {/* Color tint overlay — adds variant hue on top of the neutral blur */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: cfg.tintColor, borderRadius: radius.xl }]} />

        {/* Specular top-edge highlight — the key "glass" visual cue */}
        <View style={[styles.highlight, { backgroundColor: cfg.highlightColor }]} />

        {/* Subtle inner shadow at bottom to add depth */}
        <View style={styles.innerShadow} />

        {cardContent}
      </View>
    </GestureDetector>
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
  // Top-edge specular highlight — simulates light reflecting off glass
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  // Bottom inner shadow — adds depth
  innerShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    backgroundColor: 'rgba(0,0,0,0.024)',
  },
});
