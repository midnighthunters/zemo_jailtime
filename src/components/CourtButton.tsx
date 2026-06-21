import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, radius, shadows } from '@/src/constants/theme';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'green'
  | 'purple'
  | 'orange'
  // legacy aliases
  | 'gold'
  | 'danger'
  | 'success'
  | 'wood'
  | 'ghost';

type CourtButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  icon?: ReactNode;
};

type PaletteEntry = {
  backgroundColor: string;
  borderColor: string;
  color: string;
  useBlur: boolean;
  glowColor?: string;
};

const palette: Record<ButtonVariant, PaletteEntry> = {
  primary: {
    backgroundColor: colors.blue,
    borderColor: 'rgba(255,255,255,0.28)',
    color: colors.white,
    useBlur: false,
    glowColor: 'rgba(0,122,255,0.35)',
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.16)',
    color: colors.blue,
    useBlur: true,
  },
  destructive: {
    backgroundColor: colors.red,
    borderColor: 'rgba(255,255,255,0.22)',
    color: colors.white,
    useBlur: false,
    glowColor: 'rgba(255,59,48,0.3)',
  },
  green: {
    backgroundColor: colors.green,
    borderColor: 'rgba(255,255,255,0.22)',
    color: colors.white,
    useBlur: false,
    glowColor: 'rgba(52,199,89,0.3)',
  },
  purple: {
    backgroundColor: colors.indigo,
    borderColor: 'rgba(255,255,255,0.2)',
    color: colors.white,
    useBlur: false,
    glowColor: 'rgba(88,86,214,0.3)',
  },
  orange: {
    backgroundColor: colors.orange,
    borderColor: 'rgba(255,255,255,0.2)',
    color: colors.white,
    useBlur: false,
    glowColor: 'rgba(255,149,0,0.3)',
  },
  // Legacy aliases
  gold: {
    backgroundColor: colors.blue,
    borderColor: 'rgba(255,255,255,0.28)',
    color: colors.white,
    useBlur: false,
    glowColor: 'rgba(0,122,255,0.35)',
  },
  danger: {
    backgroundColor: colors.red,
    borderColor: 'rgba(255,255,255,0.22)',
    color: colors.white,
    useBlur: false,
    glowColor: 'rgba(255,59,48,0.3)',
  },
  success: {
    backgroundColor: colors.green,
    borderColor: 'rgba(255,255,255,0.22)',
    color: colors.white,
    useBlur: false,
    glowColor: 'rgba(52,199,89,0.3)',
  },
  wood: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.16)',
    color: colors.blue,
    useBlur: true,
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    color: colors.labelSecondary,
    useBlur: true,
  },
};

export function CourtButton({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  small,
  icon,
}: CourtButtonProps) {
  const colorSet = palette[variant];

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const gesture = Gesture.Tap()
    .enabled(!disabled && !loading)
    .onBegin(() => {
      scale.value = withSpring(0.955, { damping: 16, stiffness: 400 });
      opacity.value = withSpring(0.88, { damping: 16, stiffness: 400 });
    })
    .onFinalize((e) => {
      scale.value = withSpring(1, { damping: 13, stiffness: 260 });
      opacity.value = withSpring(1, { damping: 13, stiffness: 260 });
      if (e.state === 4 /* ENDED */ && !disabled && !loading) {
        // Haptic feedback
        Haptics.impactAsync(
          variant === 'destructive' || variant === 'danger'
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Light,
        ).catch(() => {});
        onPress?.();
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: (disabled || loading) ? 0.44 : opacity.value,
  }));

  const inner = (
    <>
      {/* Specular top highlight on solid-colored buttons */}
      {!colorSet.useBlur && (
        <View style={[StyleSheet.absoluteFillObject, styles.specularOverlay]} pointerEvents="none" />
      )}
      {/* Glow halo for solid buttons */}
      {colorSet.glowColor && !disabled && (
        <View
          style={[styles.glowHalo, { shadowColor: colorSet.glowColor, backgroundColor: colorSet.backgroundColor }]}
          pointerEvents="none"
        />
      )}

      {loading ? <ActivityIndicator color={colorSet.color} size="small" /> : null}
      {!loading && icon ? <View style={styles.icon}>{icon}</View> : null}
      {!loading ? (
        <Text style={[styles.title, small && styles.smallTitle, { color: colorSet.color }]}>
          {title}
        </Text>
      ) : null}
    </>
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.button,
          small && styles.small,
          {
            backgroundColor: colorSet.useBlur ? 'transparent' : colorSet.backgroundColor,
            borderColor: colorSet.borderColor,
          },
          colorSet.glowColor && !disabled && !loading
            ? (shadows.glow(colorSet.glowColor))
            : shadows.soft,
          animStyle,
        ]}
      >
        {/* Native blur base for ghost/secondary variants */}
        {colorSet.useBlur && Platform.OS !== 'web' ? (
          <BlurView
            tint="systemUltraThinMaterial"
            intensity={16}
            style={[StyleSheet.absoluteFillObject, { borderRadius: radius.pill }]}
          />
        ) : null}
        {colorSet.useBlur && (
          <View
            style={[StyleSheet.absoluteFillObject, { backgroundColor: colorSet.backgroundColor, borderRadius: radius.pill }]}
          />
        )}
        {inner}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
  },
  small: {
    minHeight: 36,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  smallTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Top specular highlight stripe on solid buttons
  specularOverlay: {
    borderRadius: radius.pill,
    top: 0,
    height: '48%',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  glowHalo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.pill,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
});
