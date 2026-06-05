import { StyleSheet, Text, View } from 'react-native';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { ParoleMeter } from '@/src/components/ParoleMeter';
import { colors } from '@/src/constants/theme';
import { getOnboardingStep } from '@/src/data/onboarding';

export default function ParoleOnboarding() {
  return (
    <OnboardingScene step={getOnboardingStep('parole')}>
      <View style={styles.panel}>
        <Text style={styles.copy}>Every focused hour earns freedom. Every wasted minute becomes evidence.</Text>
        <ParoleMeter value={72} />
      </View>
    </OnboardingScene>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 12,
  },
  copy: {
    color: colors.cream,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
  },
});
