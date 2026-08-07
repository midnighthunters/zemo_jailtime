import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/src/constants/theme';

type StampBadgeProps = {
  label: string;
  tone?: 'danger' | 'success' | 'gold' | 'muted' | 'purple' | 'blue' | 'orange';
};

const toneMap: Record<
  NonNullable<StampBadgeProps['tone']>,
  { fill: string; text: string; border: string }
> = {
  blue: { fill: colors.blueLight, text: colors.blueDark, border: '#D2DEF7' },
  success: { fill: colors.greenLight, text: colors.greenDark, border: '#CEE7D8' },
  gold: { fill: colors.yellowLight, text: colors.yellowDark, border: '#EDDFAD' },
  danger: { fill: colors.redLight, text: colors.redDark, border: '#EECFD2' },
  purple: { fill: colors.purpleLight, text: colors.purpleDeep, border: '#DED6F1' },
  orange: { fill: colors.orangeLight, text: colors.orangeDark, border: '#F0D9C1' },
  muted: { fill: colors.surfaceMuted, text: colors.labelSecondary, border: colors.border },
};

export function StampBadge({ label, tone = 'blue' }: StampBadgeProps) {
  const palette = toneMap[tone] ?? toneMap.blue;

  return (
    <View style={[styles.badge, { backgroundColor: palette.fill, borderColor: palette.border }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  text: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 0.55,
  },
});
