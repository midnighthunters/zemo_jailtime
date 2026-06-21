import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import type { FocusCourtAssetKey } from '@/src/constants/assets';
import { AssetImage } from '@/src/components/AssetImage';
import { colors, radius, shadows } from '@/src/constants/theme';

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  assetKey?: FocusCourtAssetKey;
};

export function ScreenHeader({ eyebrow, title, subtitle, assetKey }: ScreenHeaderProps) {
  const float = useSharedValue(0);
  const entryScale = useSharedValue(0.94);

  useEffect(() => {
    // Subtle float animation for the asset
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400 }),
        withTiming(0, { duration: 2400 }),
      ),
      -1,
      false,
    );
    // Entry spring for the entire header
    entryScale.value = withSpring(1, { damping: 16, stiffness: 240 });
  }, [float, entryScale]);

  const assetStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -3 + float.value * 6 },
      { rotate: `${-1 + float.value * 2}deg` },
    ],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: entryScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(380).springify().damping(18)}
      style={[styles.root, containerStyle]}
    >
      {/* Floating glass header surface — Layer 3 */}
      {Platform.OS !== 'web' ? (
        <BlurView
          blurType="systemUltraThinMaterial"
          blurAmount={22}
          style={StyleSheet.absoluteFillObject}
          reducedTransparencyFallbackColor="rgba(255,255,255,0.82)"
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.82)' }]} />
      )}

      {/* Glass tint */}
      <View style={[StyleSheet.absoluteFillObject, styles.tint]} />
      {/* Specular highlight */}
      <View style={styles.highlight} />
      {/* Border */}
      <View style={styles.border} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.text}>
          {eyebrow ? (
            <Text style={styles.eyebrow}>{eyebrow}</Text>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
          ) : null}
        </View>

        {assetKey ? (
          <Animated.View
            entering={FadeInRight.duration(400).delay(100).springify().damping(16)}
            style={assetStyle}
          >
            <AssetImage assetKey={assetKey} width={82} height={82} />
          </Animated.View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: 2,
    ...shadows.card,
    // Slight lift from the background
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  tint: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  text: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.label,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  subtitle: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
});
