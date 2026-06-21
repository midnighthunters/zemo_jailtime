import { StyleSheet, View } from 'react-native';
import { OptionCard } from '@/src/components/OnboardingIntake';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { DAILY_SCREEN_TIME_OPTIONS, getOnboardingStep } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';
import type { DailyScreenTime } from '@/src/types/court';

export default function ScreenTimeIntakeOnboarding() {
  const dailyScreenTime = useCourtStore((state) => state.profile.dailyScreenTime);
  const setDailyScreenTime = useCourtStore((state) => state.setDailyScreenTime);

  return (
    <OnboardingScene step={getOnboardingStep('screentime_intake')}>
      <View style={styles.options}>
        {DAILY_SCREEN_TIME_OPTIONS.map((option) => (
          <OptionCard
            key={option.id}
            title={option.label}
            description={option.description}
            selected={dailyScreenTime === option.id}
            onPress={() => setDailyScreenTime(option.id as DailyScreenTime)}
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
