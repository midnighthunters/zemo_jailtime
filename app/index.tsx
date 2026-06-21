import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useCourtStore } from '@/src/store/useCourtStore';
import { colors } from '@/src/constants/theme';

export default function Index() {
  // Initialise as already-hydrated if the store finished before this component mounts
  // (common on fast devices / second opens). onFinishHydration only fires for future
  // completions, so we must check hasHydrated() synchronously as well.
  const [isHydrated, setIsHydrated] = useState(
    () => useCourtStore.persist.hasHydrated(),
  );
  const hasCompletedOnboarding = useCourtStore((state) => state.profile.hasCompletedOnboarding);

  useEffect(() => {
    if (useCourtStore.persist.hasHydrated()) {
      setIsHydrated(true);
      return;
    }
    const unsub = useCourtStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    return unsub;
  }, []);

  if (!isHydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return <Redirect href={hasCompletedOnboarding ? '/(tabs)/courtroom' : '/onboarding'} />;
}
