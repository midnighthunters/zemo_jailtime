import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { colors, radius } from '@/src/constants/theme';

type ProgressDocketProps = {
  items: { label: string; value: string | number }[];
};

export function ProgressDocket({ items }: ProgressDocketProps) {
  return (
    <Animated.View entering={FadeInUp.duration(280).delay(120).springify().damping(18)} layout={LinearTransition.springify().damping(18)} style={styles.grid}>
      {items.map((item, index) => (
        <Animated.View key={item.label} entering={FadeInUp.duration(260).delay(160 + index * 55).springify().damping(17)} layout={LinearTransition.springify().damping(18)} style={styles.item}>
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
    gap: 8,
  },
  item: {
    flex: 1,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 242, 210, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 242, 210, 0.16)',
  },
  value: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '900',
  },
  label: {
    color: colors.parchment,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
});
