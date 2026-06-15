import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '@/src/constants/theme';

type ParoleMeterProps = {
  value: number;
  label?: string;
};

export function ParoleMeter({ value, label = 'Parole chance' }: ParoleMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{clamped}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fillMask, { width: `${clamped}%` }]}>
          <LinearGradient colors={[colors.success, colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '900',
  },
  value: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  track: {
    height: 13,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 242, 210, 0.16)',
    overflow: 'hidden',
  },
  fillMask: {
    height: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    minWidth: 8,
    width: '100%',
    borderRadius: radius.pill,
  },
});
