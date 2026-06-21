import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { colors, radius, shadows } from '@/src/constants/theme';

type ProgressDocketProps = {
  items: { label: string; value: string | number }[];
};

export function ProgressDocket({ items }: ProgressDocketProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(280).delay(120).springify().damping(18)}
      layout={LinearTransition.springify().damping(18)}
      style={styles.grid}
    >
      {items.map((item, index) => (
        <Animated.View
          key={item.label}
          entering={FadeInUp.duration(260).delay(160 + index * 55).springify().damping(17)}
          layout={LinearTransition.springify().damping(18)}
          style={styles.item}
        >
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  item: {
    flex: 1,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    gap: 4,
    ...shadows.soft,
  },
  value: {
    color: colors.blue,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  label: {
    color: colors.labelSecondary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
