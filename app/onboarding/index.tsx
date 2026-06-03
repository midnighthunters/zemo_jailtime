import { OnboardingScene } from '@/src/components/OnboardingScene';
import { ONBOARDING_STEPS } from '@/src/data/onboarding';

export default function CourtSessionOnboarding() {
  return <OnboardingScene step={ONBOARDING_STEPS[0]} />;
}
