import { StyleSheet, View } from 'react-native';
import { OptionCard } from '@/src/components/OnboardingIntake';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { USER_ROLE_OPTIONS, getOnboardingStep } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';
import type { UserRole } from '@/src/types/court';

export default function RoleOnboarding() {
  const userRole = useCourtStore((state) => state.profile.userRole);
  const setUserRole = useCourtStore((state) => state.setUserRole);

  return (
    <OnboardingScene step={getOnboardingStep('role')}>
      <View style={styles.options}>
        {USER_ROLE_OPTIONS.map((option) => (
          <OptionCard
            key={option.id}
            title={option.label}
            description={option.description}
            selected={userRole === option.id}
            onPress={() => setUserRole(option.id as UserRole)}
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
