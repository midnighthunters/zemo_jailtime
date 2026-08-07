import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { colors, radius, shadows } from '@/src/constants/theme';

type ProgressDocketProps = {
  items: { label: string; value: string | number }[];
};

export function ProgressDocket({ items }: ProgressDocketProps) {
  return (
    <Animated.View entering={FadeInUp.duration(240)} layout={LinearTransition.duration(180)} style={styles.grid}>
      {items.map((item, index) => (
        <Animated.View key={item.label} entering={FadeInUp.duration(220).delay(index * 45)} style={styles.item}>
          <View style={styles.accent} />
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 10 },
  item: {
    flex: 1,
    minHeight: 84,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    gap: 4,
    overflow: 'hidden',
    ...shadows.soft,
  },
  accent: { position: 'absolute', top: 0, left: 18, right: 18, height: 3, borderRadius: 2, backgroundColor: colors.blue },
  value: { color: colors.blue, fontSize: 26, fontWeight: '700', letterSpacing: -0.6 },
  label: { color: colors.labelSecondary, fontSize: 11, fontWeight: '500', textAlign: 'center', paddingHorizontal: 8 },
});
