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
          <LinearGradient
            colors={[colors.blue, colors.teal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.label,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.08,
  },
  value: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,122,255,0.12)',
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
