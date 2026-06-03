import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/constants/theme';
import { formatCountdown } from '@/src/utils/format';

type SentenceTimerProps = {
  seconds: number;
};

export function SentenceTimer({ seconds }: SentenceTimerProps) {
  const low = seconds > 0 && seconds < 180;
  return (
    <View style={styles.root}>
      <Text style={styles.label}>JAIL TIMER</Text>
      <Text style={[styles.time, low && styles.low]}>{formatCountdown(seconds)}</Text>
      <Text style={styles.copy}>Complete one focus action and the court may consider parole.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  time: {
    color: colors.cream,
    fontSize: 54,
    lineHeight: 60,
    fontWeight: '900',
  },
  low: {
    color: colors.danger,
  },
  copy: {
    color: colors.parchment,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});
