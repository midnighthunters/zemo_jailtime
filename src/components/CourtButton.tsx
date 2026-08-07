import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows } from '@/src/constants/theme';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'green'
  | 'purple'
  | 'orange'
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
  depthColor: string;
  textColor: string;
};

const primary = {
  backgroundColor: colors.blue,
  borderColor: colors.blue,
  depthColor: colors.blueDark,
  textColor: colors.white,
};

const palette: Record<ButtonVariant, PaletteEntry> = {
  primary,
  gold: primary,
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    depthColor: colors.depthEdge,
    textColor: colors.label,
  },
  wood: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    depthColor: colors.depthEdge,
    textColor: colors.label,
  },
  ghost: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    depthColor: colors.depthEdge,
    textColor: colors.labelSecondary,
  },
  destructive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
    depthColor: colors.redDark,
    textColor: colors.white,
  },
  danger: {
    backgroundColor: colors.red,
    borderColor: colors.red,
    depthColor: colors.redDark,
    textColor: colors.white,
  },
  green: {
    backgroundColor: colors.green,
    borderColor: colors.green,
    depthColor: colors.greenDark,
    textColor: colors.white,
  },
  success: {
    backgroundColor: colors.green,
    borderColor: colors.green,
    depthColor: colors.greenDark,
    textColor: colors.white,
  },
  purple: {
    backgroundColor: colors.indigo,
    borderColor: colors.indigo,
    depthColor: colors.purpleDeep,
    textColor: colors.white,
  },
  orange: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
    depthColor: colors.orangeDark,
    textColor: colors.white,
  },
};

export function CourtButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  small = false,
  icon,
}: CourtButtonProps) {
  const colorSet = palette[variant];
  const inactive = disabled || loading || !onPress;

  const handlePressIn = () => {
    if (inactive) return;
    Haptics.impactAsync(
      variant === 'destructive' || variant === 'danger'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => undefined);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={inactive}
      onPress={onPress}
      onPressIn={handlePressIn}
      style={({ pressed }) => [
        styles.button,
        small && styles.small,
        {
          backgroundColor: colorSet.backgroundColor,
          borderColor: colorSet.borderColor,
          borderBottomColor: colorSet.depthColor,
          opacity: inactive ? 0.48 : 1,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topHighlight} pointerEvents="none" />
      {loading ? <ActivityIndicator color={colorSet.textColor} size="small" /> : null}
      {!loading && icon ? <View style={styles.icon}>{icon}</View> : null}
      {!loading ? (
        <Text style={[styles.title, small && styles.smallTitle, { color: colorSet.textColor }]}>
          {title}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
    ...shadows.soft,
  },
  small: {
    minHeight: 40,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  pressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 1,
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  smallTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
