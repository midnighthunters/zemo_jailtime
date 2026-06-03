import { Redirect } from 'expo-router';
import { useCourtStore } from '@/src/store/useCourtStore';

export default function Index() {
  const hasCompletedOnboarding = useCourtStore((state) => state.profile.hasCompletedOnboarding);
  return <Redirect href={hasCompletedOnboarding ? '/(tabs)/courtroom' : '/onboarding'} />;
}
