import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { colors, radius, shadows } from '@/src/constants/theme';

type ParchmentCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ParchmentCard({ children, style }: ParchmentCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.parchment,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.parchmentDark,
    padding: 14,
    ...shadows.soft,
  },
});
