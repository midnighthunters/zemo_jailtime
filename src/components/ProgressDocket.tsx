import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/src/constants/theme';

type ProgressDocketProps = {
  items: { label: string; value: string | number }[];
};

export function ProgressDocket({ items }: ProgressDocketProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
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
