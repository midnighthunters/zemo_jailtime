import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, radius, shadows } from '@/src/constants/theme';
import { formatCountdown } from '@/src/utils/format';

type SentenceTimerProps = { seconds: number };

export function SentenceTimer({ seconds }: SentenceTimerProps) {
  const low = seconds > 0 && seconds < 180;
  return (
    <Animated.View entering={FadeIn.duration(260)} style={styles.root}>
      <View style={[styles.pill, low && styles.pillLow]}>
        <Text style={[styles.pillLabel, low && styles.pillLabelLow]}>{low ? 'PAROLE WINDOW' : 'JAIL TIMER'}</Text>
      </View>
      <View style={[styles.timerCard, low && styles.timerCardLow]}>
        <View style={[styles.topAccent, low && styles.topAccentLow]} />
        <Text accessibilityRole="timer" style={[styles.time, low && styles.timeLow]}>{formatCountdown(seconds)}</Text>
      </View>
      <Text style={styles.copy}>Complete a focus action and the court may grant parole.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: 12 },
  pill: { borderRadius: radius.pill, borderWidth: 1, borderColor: '#C9D7F7', backgroundColor: colors.blueLight, paddingHorizontal: 14, paddingVertical: 5 },
  pillLow: { borderColor: '#F2C8CB', backgroundColor: colors.redLight },
  pillLabel: { color: colors.blueDark, fontSize: 11, fontWeight: '700', letterSpacing: 0.7 },
  pillLabelLow: { color: colors.redDark },
  timerCard: {
    minWidth: 250,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 5,
    borderBottomColor: colors.depthEdge,
    overflow: 'hidden',
    ...shadows.card,
  },
  timerCardLow: { borderColor: '#F2D1D3', borderBottomColor: '#E9BDC0' },
  topAccent: { position: 'absolute', top: 0, left: 34, right: 34, height: 4, borderRadius: 2, backgroundColor: colors.blue },
  topAccentLow: { backgroundColor: colors.red },
  time: { color: colors.label, fontSize: 60, lineHeight: 68, fontWeight: '700', letterSpacing: -2.5 },
  timeLow: { color: colors.redDark },
  copy: { color: colors.labelSecondary, textAlign: 'center', fontSize: 13, lineHeight: 18, fontWeight: '400', paddingHorizontal: 8 },
});
