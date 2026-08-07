import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { colors, radius, shadows } from '@/src/constants/theme';

type ParchmentCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ParchmentCard({ children, style }: ParchmentCardProps) {
  return (
    <Animated.View entering={FadeInUp.duration(280).springify().damping(18)} layout={LinearTransition.springify().damping(18)}>
      <View style={[styles.card, style]}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    padding: 16,
    ...shadows.soft,
  },
});
