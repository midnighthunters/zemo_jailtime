import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows } from '@/src/constants/theme';

type ButtonVariant =
  | 'primary'      // iOS blue — default CTA
  | 'secondary'    // ghost glass
  | 'destructive'  // red
  | 'green'        // success/parole
  | 'purple'       // premium
  | 'orange'       // warning/sentence
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
};

const palette: Record<ButtonVariant, PaletteEntry> = {
  primary: {
    backgroundColor: colors.blue,
    borderColor: colors.blueDark,
    color: colors.white,
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(255,255,255,0.9)',
    color: colors.blue,
  },
  destructive: {
    backgroundColor: colors.red,
    borderColor: colors.redDark,
    color: colors.white,
  },
  green: {
    backgroundColor: colors.green,
    borderColor: colors.greenDark,
    color: colors.white,
  },
  purple: {
    backgroundColor: colors.indigo,
    borderColor: colors.purpleDark,
    color: colors.white,
  },
  orange: {
    backgroundColor: colors.orange,
    borderColor: colors.orangeDark,
    color: colors.white,
  },
  // legacy aliases
  gold: {
    backgroundColor: colors.blue,
    borderColor: colors.blueDark,
    color: colors.white,
  },
  danger: {
    backgroundColor: colors.red,
    borderColor: colors.redDark,
    color: colors.white,
  },
  success: {
    backgroundColor: colors.green,
    borderColor: colors.greenDark,
    color: colors.white,
  },
  wood: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(255,255,255,0.9)',
    color: colors.blue,
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.56)',
    borderColor: 'rgba(255,255,255,0.8)',
    color: colors.labelSecondary,
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

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(
      variant === 'destructive' || variant === 'danger'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Light,
    );
    onPress?.();
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        small && styles.small,
        {
          backgroundColor: colorSet.backgroundColor,
          borderColor: colorSet.borderColor,
          opacity: (disabled || loading) ? 0.44 : pressed ? 0.82 : 1,
        },
      ]}
    >
      {loading ? <ActivityIndicator color={colorSet.color} size="small" /> : null}
      {!loading && icon ? <View style={styles.icon}>{icon}</View> : null}
      {!loading ? (
        <Text style={[styles.title, small && styles.smallTitle, { color: colorSet.color }]}>
          {title}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...shadows.soft,
  },
  small: {
    minHeight: 34,
    paddingHorizontal: 14,
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
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
