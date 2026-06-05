import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, LinearTransition, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, radius, shadows } from '@/src/constants/theme';

type ButtonVariant = 'gold' | 'danger' | 'success' | 'purple' | 'wood' | 'ghost';

type CourtButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  icon?: ReactNode;
};

const palette: Record<ButtonVariant, { backgroundColor: string; borderColor: string; color: string }> = {
  gold: { backgroundColor: colors.gold, borderColor: colors.deepGold, color: colors.ink },
  danger: { backgroundColor: colors.danger, borderColor: colors.dangerDark, color: colors.white },
  success: { backgroundColor: colors.success, borderColor: colors.successDark, color: colors.white },
  purple: { backgroundColor: colors.purpleLight, borderColor: colors.purple, color: colors.white },
  wood: { backgroundColor: colors.wood, borderColor: colors.woodDark, color: colors.cream },
  ghost: { backgroundColor: 'rgba(255, 242, 210, 0.08)', borderColor: 'rgba(255, 242, 210, 0.25)', color: colors.cream },
};

export function CourtButton({ title, onPress, variant = 'gold', disabled, loading, small, icon }: CourtButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const colorSet = palette[variant];

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(variant === 'danger' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 12, stiffness: 240 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 240 });
      }}
    >
      <Animated.View
        entering={FadeInUp.duration(240).springify().damping(17)}
        layout={LinearTransition.springify().damping(18)}
        style={[
          styles.button,
          small && styles.small,
          { backgroundColor: colorSet.backgroundColor, borderColor: colorSet.borderColor },
          disabled && styles.disabled,
          animatedStyle,
        ]}
      >
        {loading ? <ActivityIndicator color={colorSet.color} /> : null}
        {!loading && icon ? <View style={styles.icon}>{icon}</View> : null}
        {!loading ? <Text style={[styles.title, small && styles.smallTitle, { color: colorSet.color }]}>{title}</Text> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...shadows.soft,
  },
  small: {
    minHeight: 38,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  smallTitle: {
    fontSize: 12,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.56,
  },
});
