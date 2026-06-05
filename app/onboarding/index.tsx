import { OnboardingScene } from '@/src/components/OnboardingScene';
import { getOnboardingStep } from '@/src/data/onboarding';

export default function CourtSessionOnboarding() {
  return <OnboardingScene step={getOnboardingStep('court')} />;
}
