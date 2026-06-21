import { StyleSheet, View } from 'react-native';
import { OptionCard } from '@/src/components/OnboardingIntake';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { AGE_RANGE_OPTIONS, getOnboardingStep } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';
import type { AgeRange } from '@/src/types/court';

export default function AgeOnboarding() {
  const ageRange = useCourtStore((state) => state.profile.ageRange);
  const setAgeRange = useCourtStore((state) => state.setAgeRange);

  return (
    <OnboardingScene step={getOnboardingStep('age')}>
      <View style={styles.options}>
        {AGE_RANGE_OPTIONS.map((option) => (
          <OptionCard
            key={option.id}
            title={option.label}
            selected={ageRange === option.id}
            onPress={() => setAgeRange(option.id as AgeRange)}
          />
        ))}
      </View>
    </OnboardingScene>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: 8,
  },
});
